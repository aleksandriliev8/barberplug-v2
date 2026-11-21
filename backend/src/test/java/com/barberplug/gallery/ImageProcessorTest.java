package com.barberplug.gallery;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;

class ImageProcessorTest {

    private final ImageProcessor processor = new ImageProcessor();

    private static BufferedImage decode(byte[] webp) throws IOException {
        return ImageIO.read(new ByteArrayInputStream(webp));
    }

    private static boolean isWebp(byte[] bytes) {
        return new String(bytes, 0, 4, StandardCharsets.US_ASCII).equals("RIFF")
                && new String(bytes, 8, 4, StandardCharsets.US_ASCII).equals("WEBP");
    }

    @Test
    void makesAThumbnailThatCoversTheGridTileAndALargeVersionThatFitsTheLightbox() throws IOException {
        ImageProcessor.Processed result = processor.process(TestImages.jpeg(4000, 3000));

        // Landscape 4:3: the height decides the thumbnail (900), width follows (1200).
        assertThat(result.thumb().height()).isEqualTo(900);
        assertThat(result.thumb().width()).isEqualTo(1200);
        assertThat(result.large().width()).isEqualTo(2048);
        assertThat(result.large().height()).isEqualTo(1536);

        assertThat(isWebp(result.thumb().webp())).isTrue();
        assertThat(isWebp(result.large().webp())).isTrue();
        BufferedImage large = decode(result.large().webp());
        assertThat(large.getWidth()).isEqualTo(2048);
        assertThat(large.getHeight()).isEqualTo(1536);
    }

    @Test
    void neverEnlargesASmallPhoto() {
        ImageProcessor.Processed result = processor.process(TestImages.png(300, 400));

        assertThat(result.thumb().width()).isEqualTo(300);
        assertThat(result.large().height()).isEqualTo(400);
    }

    @Test
    void outputCarriesNoMetadata() {
        ImageProcessor.Processed result = processor.process(TestImages.jpeg(800, 600));

        String large = new String(result.large().webp(), StandardCharsets.ISO_8859_1);
        assertThat(large).doesNotContain("EXIF").doesNotContain("Exif").doesNotContain("XMP");
    }

    @Test
    void orientationSixTurnsALandscapeSensorImageUpright() {
        BufferedImage sensor = TestImages.halves(40, 20); // red left, blue right

        BufferedImage upright = ImageProcessor.applyOrientation(sensor, 6); // "rotate 90 degrees clockwise"

        assertThat(upright.getWidth()).isEqualTo(20);
        assertThat(upright.getHeight()).isEqualTo(40);
        // After a clockwise turn the red (left) half is on top, blue on the bottom.
        assertThat(upright.getRGB(10, 5) & 0xFFFFFF).isEqualTo(0xFF0000);
        assertThat(upright.getRGB(10, 35) & 0xFFFFFF).isEqualTo(0x0000FF);
    }

    @Test
    void everyOrientationGivesTheRightSize() {
        BufferedImage sensor = TestImages.halves(40, 20);
        for (int orientation = 1; orientation <= 8; orientation++) {
            BufferedImage out = ImageProcessor.applyOrientation(sensor, orientation);
            boolean swapped = orientation >= 5;
            assertThat(out.getWidth()).as("orientation %d", orientation).isEqualTo(swapped ? 20 : 40);
            assertThat(out.getHeight()).as("orientation %d", orientation).isEqualTo(swapped ? 40 : 20);
        }
    }

    @Test
    void rejectsFilesThatAreNotPhotosWhateverTheirName() {
        assertThatThrownBy(() -> processor.process("hello, not an image".getBytes(StandardCharsets.UTF_8)))
                .isInstanceOfSatisfying(ImageRejectedException.class, e -> assertThat(e.code()).isEqualTo("unsupported_type"));
    }

    @Test
    void rejectsABrokenPhoto() {
        byte[] truncated = new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0, 1, 2, 3};

        assertThatThrownBy(() -> processor.process(truncated))
                .isInstanceOfSatisfying(ImageRejectedException.class, e -> assertThat(e.code()).isEqualTo("unreadable"));
    }

    @Test
    void rejectsAnImageThatClaimsTooManyPixelsBeforeDecodingIt() {
        assertThatThrownBy(() -> processor.process(TestImages.pngClaimingSize(20_000, 20_000)))
                .isInstanceOfSatisfying(ImageRejectedException.class, e -> assertThat(e.code()).isEqualTo("too_many_pixels"));
    }
}
