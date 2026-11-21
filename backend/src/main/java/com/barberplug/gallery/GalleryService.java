package com.barberplug.gallery;

import com.barberplug.storage.ImageStorage;
import java.time.Clock;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class GalleryService {

    static final String WEBP = "image/webp";

    private final GalleryImageRepository images;
    private final ImageProcessor processor;
    private final ImageStorage storage;
    private final Clock clock;
    private final TransactionTemplate transactions;

    GalleryService(
            GalleryImageRepository images,
            ImageProcessor processor,
            ImageStorage storage,
            Clock clock,
            PlatformTransactionManager transactionManager) {
        this.images = images;
        this.processor = processor;
        this.storage = storage;
        this.clock = clock;
        this.transactions = new TransactionTemplate(transactionManager);
    }

    @Transactional(readOnly = true)
    public List<GalleryImage> list() {
        return images.findAllByOrderByPositionAscCreatedAtAsc();
    }

    /**
     * Processes the upload, stores both WebP files, and adds the photo at the end of the Gallery.
     * Not one transaction on purpose: resizing and S3 uploads are slow, and should not hold a
     * database connection. The row is written last; if that fails, the files are removed again.
     */
    public GalleryImage upload(byte[] upload) {
        ImageProcessor.Processed files = processor.process(upload);
        UUID id = UUID.randomUUID();
        String thumbKey = "gallery/" + id + "/thumb.webp";
        String largeKey = "gallery/" + id + "/large.webp";
        List<String> keys = List.of(thumbKey, largeKey);

        try {
            storage.put(thumbKey, files.thumb().webp(), WEBP);
            storage.put(largeKey, files.large().webp(), WEBP);
            return transactions.execute(status -> images.save(
                    new GalleryImage(id, images.maxPosition() + 1, files, thumbKey, largeKey, clock.instant())));
        } catch (RuntimeException failed) {
            storage.deleteQuietly(keys);
            throw failed;
        }
    }

    @Transactional
    public GalleryImage updateCaptions(UUID id, String captionBg, String captionEn) {
        GalleryImage image = images.findById(id).orElseThrow(() -> new GalleryImageNotFoundException(id));
        image.changeCaptions(blankToNull(captionBg), blankToNull(captionEn), clock.instant());
        return image;
    }

    /**
     * Puts the Gallery in the given order. The list must name every photo exactly once, so a
     * stale admin tab cannot silently drop or duplicate one.
     */
    @Transactional
    public void reorder(List<UUID> orderedIds) {
        Map<UUID, GalleryImage> byId = images.findAll().stream()
                .collect(Collectors.toMap(GalleryImage::getId, Function.identity()));
        if (orderedIds.size() != byId.size() || !byId.keySet().equals(new HashSet<>(orderedIds))) {
            throw new GalleryOrderMismatchException();
        }
        Instant now = clock.instant();
        for (int position = 0; position < orderedIds.size(); position++) {
            byId.get(orderedIds.get(position)).moveTo(position, now);
        }
    }

    /** Removes the photo; its files are deleted once the database change is committed. */
    @Transactional
    public void delete(UUID id) {
        GalleryImage image = images.findById(id).orElseThrow(() -> new GalleryImageNotFoundException(id));
        images.delete(image);
        List<String> keys = List.of(image.getThumbKey(), image.getLargeKey());
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                storage.deleteQuietly(keys);
            }
        });
    }

    public String publicUrl(String key) {
        return storage.publicUrl(key);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }

    public static class GalleryImageNotFoundException extends RuntimeException {
        GalleryImageNotFoundException(UUID id) {
            super("No Gallery Image " + id);
        }
    }

    public static class GalleryOrderMismatchException extends RuntimeException {
        GalleryOrderMismatchException() {
            super("The new order must list every Gallery Image exactly once");
        }
    }
}
