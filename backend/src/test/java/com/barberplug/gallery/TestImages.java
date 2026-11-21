package com.barberplug.gallery;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.ByteBuffer;
import java.util.zip.CRC32;
import javax.imageio.ImageIO;

/** Small images made in code, so tests need no binary fixtures. */
final class TestImages {

    private TestImages() {}

    /** A photo-like image: left half red, right half blue, so orientation changes are visible. */
    static BufferedImage halves(int width, int height) {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.RED);
        g.fillRect(0, 0, width / 2, height);
        g.setColor(Color.BLUE);
        g.fillRect(width / 2, 0, width - width / 2, height);
        g.dispose();
        return image;
    }

    static byte[] jpeg(int width, int height) {
        return encode(halves(width, height), "jpg");
    }

    static byte[] png(int width, int height) {
        return encode(halves(width, height), "png");
    }

    /**
     * A valid small PNG whose header claims a different size. Decoders read the size from the
     * header first, which is exactly what the decompression-bomb check relies on.
     */
    static byte[] pngClaimingSize(int claimedWidth, int claimedHeight) {
        byte[] png = png(4, 4);
        // IHDR data starts at byte 16 (8 signature + 4 length + 4 "IHDR"); width then height.
        ByteBuffer.wrap(png, 16, 8).putInt(claimedWidth).putInt(claimedHeight);
        CRC32 crc = new CRC32();
        crc.update(png, 12, 17); // "IHDR" + 13 data bytes
        ByteBuffer.wrap(png, 29, 4).putInt((int) crc.getValue());
        return png;
    }

    private static byte[] encode(BufferedImage image, String format) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(image, format, out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
