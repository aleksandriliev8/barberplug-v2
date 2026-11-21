package com.barberplug.gallery;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.luciad.imageio.webp.WebPWriteParam;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import org.springframework.stereotype.Component;

/**
 * Turns an uploaded photo into the two WebP files the site serves (ADR-0003).
 *
 * <ul>
 *   <li>Accepts JPEG, PNG and WebP only, checked by the file's first bytes, not its name.
 *   <li>Turns the photo upright using its EXIF orientation, then drops all metadata
 *       (including GPS location): the output is re-encoded from pixels only.
 *   <li>Thumbnail: just large enough to cover a 720 x 900 px box (the 4:5 grid tile at 2x).
 *   <li>Large: fits inside 2048 x 2048 px, for the lightbox.
 *   <li>Never enlarges a small photo.
 * </ul>
 */
@Component
public class ImageProcessor {

    static final int THUMB_COVER_WIDTH = 720;
    static final int THUMB_COVER_HEIGHT = 900;
    static final int LARGE_MAX_SIDE = 2048;
    /** Decompression-bomb guard: a 15 MB file can still claim to be 100 000 x 100 000 px. */
    static final long MAX_PIXELS = 50_000_000L;
    private static final float WEBP_QUALITY = 0.82f;

    public record Rendition(byte[] webp, int width, int height) {}

    public record Processed(Rendition thumb, Rendition large) {}

    enum Format {
        JPEG, PNG, WEBP
    }

    public Processed process(byte[] upload) {
        Format format = detectFormat(upload);
        BufferedImage image = decode(upload);
        if (format == Format.JPEG) {
            image = applyOrientation(image, readOrientation(upload));
        }

        double thumbScale = Math.min(1.0, Math.max(
                (double) THUMB_COVER_WIDTH / image.getWidth(), (double) THUMB_COVER_HEIGHT / image.getHeight()));
        double largeScale = Math.min(1.0, (double) LARGE_MAX_SIDE / Math.max(image.getWidth(), image.getHeight()));

        BufferedImage large = resize(image, largeScale);
        BufferedImage thumb = resize(image, thumbScale);
        return new Processed(encode(thumb), encode(large));
    }

    static Format detectFormat(byte[] bytes) {
        if (bytes.length >= 3 && (bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) {
            return Format.JPEG;
        }
        if (bytes.length >= 8 && (bytes[0] & 0xFF) == 0x89 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G') {
            return Format.PNG;
        }
        if (bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return Format.WEBP;
        }
        throw new ImageRejectedException("unsupported_type", "Only JPEG, PNG and WebP photos are accepted");
    }

    private static BufferedImage decode(byte[] bytes) {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                throw new ImageRejectedException("unreadable", "No reader for this image");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                // Check the size from the header before decoding any pixels.
                long pixels = (long) reader.getWidth(0) * reader.getHeight(0);
                if (pixels > MAX_PIXELS) {
                    throw new ImageRejectedException("too_many_pixels", "Image is larger than " + MAX_PIXELS + " pixels");
                }
                BufferedImage image = reader.read(0);
                if (image == null) {
                    throw new ImageRejectedException("unreadable", "Image has no pixels");
                }
                return image;
            } finally {
                reader.dispose();
            }
        } catch (IOException | RuntimeException failed) {
            if (failed instanceof ImageRejectedException rejected) {
                throw rejected;
            }
            throw new ImageRejectedException("unreadable", "The image could not be read", failed);
        }
    }

    /** EXIF orientation 1-8, or 1 (upright) when there is none. */
    static int readOrientation(byte[] jpeg) {
        try {
            Metadata metadata = ImageMetadataReader.readMetadata(new ByteArrayInputStream(jpeg));
            ExifIFD0Directory exif = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
            if (exif != null && exif.containsTag(ExifIFD0Directory.TAG_ORIENTATION)) {
                return exif.getInt(ExifIFD0Directory.TAG_ORIENTATION);
            }
        } catch (Exception ignored) {
            // Broken or missing EXIF: treat as upright.
        }
        return 1;
    }

    /** Rotates/flips the pixels so the photo looks the way the camera's EXIF orientation says. */
    static BufferedImage applyOrientation(BufferedImage image, int orientation) {
        if (orientation <= 1 || orientation > 8) {
            return image;
        }
        int w = image.getWidth();
        int h = image.getHeight();
        boolean swap = orientation >= 5;
        AffineTransform t = new AffineTransform();
        switch (orientation) {
            case 2 -> { t.translate(w, 0); t.scale(-1, 1); }
            case 3 -> { t.translate(w, h); t.rotate(Math.PI); }
            case 4 -> { t.translate(0, h); t.scale(1, -1); }
            case 5 -> { t.rotate(-Math.PI / 2); t.scale(-1, 1); }
            case 6 -> { t.translate(h, 0); t.rotate(Math.PI / 2); }
            case 7 -> { t.scale(-1, 1); t.translate(-h, 0); t.translate(0, w); t.rotate(3 * Math.PI / 2); }
            case 8 -> { t.translate(0, w); t.rotate(3 * Math.PI / 2); }
            default -> { }
        }
        BufferedImage out = new BufferedImage(swap ? h : w, swap ? w : h, targetType(image));
        Graphics2D g = out.createGraphics();
        try {
            g.drawImage(image, t, null);
        } finally {
            g.dispose();
        }
        return out;
    }

    /**
     * High-quality downscale: halve repeatedly with bilinear filtering, then one final step.
     * A single big bicubic step on a phone photo looks grainy.
     */
    static BufferedImage resize(BufferedImage image, double scale) {
        int targetW = Math.max(1, (int) Math.round(image.getWidth() * scale));
        int targetH = Math.max(1, (int) Math.round(image.getHeight() * scale));
        BufferedImage current = normalize(image);
        if (targetW == current.getWidth() && targetH == current.getHeight()) {
            return current;
        }
        int w = current.getWidth();
        int h = current.getHeight();
        do {
            w = Math.max(targetW, w / 2);
            h = Math.max(targetH, h / 2);
            BufferedImage next = new BufferedImage(w, h, current.getType());
            Graphics2D g = next.createGraphics();
            try {
                g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
                g.drawImage(current, 0, 0, w, h, null);
            } finally {
                g.dispose();
            }
            current = next;
        } while (w != targetW || h != targetH);
        return current;
    }

    /** Plain RGB, or ARGB when the photo has transparency, so drawing and encoding behave the same everywhere. */
    private static BufferedImage normalize(BufferedImage image) {
        int type = targetType(image);
        if (image.getType() == type) {
            return image;
        }
        BufferedImage copy = new BufferedImage(image.getWidth(), image.getHeight(), type);
        Graphics2D g = copy.createGraphics();
        try {
            g.drawImage(image, 0, 0, null);
        } finally {
            g.dispose();
        }
        return copy;
    }

    private static int targetType(BufferedImage image) {
        return image.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
    }

    private static Rendition encode(BufferedImage image) {
        ImageWriter writer = ImageIO.getImageWritersByMIMEType("image/webp").next();
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (MemoryCacheImageOutputStream output = new MemoryCacheImageOutputStream(bytes)) {
            WebPWriteParam param = new WebPWriteParam(writer.getLocale());
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionType(param.getCompressionTypes()[WebPWriteParam.LOSSY_COMPRESSION]);
            param.setCompressionQuality(WEBP_QUALITY);
            writer.setOutput(output);
            writer.write(null, new IIOImage(image, null, null), param);
        } catch (IOException failed) {
            throw new IllegalStateException("WebP encoding failed", failed);
        } finally {
            writer.dispose();
        }
        return new Rendition(bytes.toByteArray(), image.getWidth(), image.getHeight());
    }
}
