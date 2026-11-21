package com.barberplug.gallery;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/** A photo shown in the Gallery, in the Owner's chosen order, with optional BG/EN captions. */
@Entity
@Table(name = "gallery_image")
public class GalleryImage {

    @Id
    private UUID id;

    @Column(nullable = false)
    private int position;

    @Column(name = "caption_bg")
    private String captionBg;

    @Column(name = "caption_en")
    private String captionEn;

    @Column(name = "thumb_key", nullable = false, updatable = false)
    private String thumbKey;

    @Column(name = "thumb_width", nullable = false, updatable = false)
    private int thumbWidth;

    @Column(name = "thumb_height", nullable = false, updatable = false)
    private int thumbHeight;

    @Column(name = "large_key", nullable = false, updatable = false)
    private String largeKey;

    @Column(name = "large_width", nullable = false, updatable = false)
    private int largeWidth;

    @Column(name = "large_height", nullable = false, updatable = false)
    private int largeHeight;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected GalleryImage() {
        // for JPA
    }

    GalleryImage(UUID id, int position, ImageProcessor.Processed files, String thumbKey, String largeKey, Instant now) {
        this.id = id;
        this.position = position;
        this.thumbKey = thumbKey;
        this.thumbWidth = files.thumb().width();
        this.thumbHeight = files.thumb().height();
        this.largeKey = largeKey;
        this.largeWidth = files.large().width();
        this.largeHeight = files.large().height();
        this.createdAt = now;
        this.updatedAt = now;
    }

    void changeCaptions(String captionBg, String captionEn, Instant now) {
        this.captionBg = captionBg;
        this.captionEn = captionEn;
        this.updatedAt = now;
    }

    void moveTo(int position, Instant now) {
        if (this.position != position) {
            this.position = position;
            this.updatedAt = now;
        }
    }

    public UUID getId() {
        return id;
    }

    public int getPosition() {
        return position;
    }

    public String getCaptionBg() {
        return captionBg;
    }

    public String getCaptionEn() {
        return captionEn;
    }

    public String getThumbKey() {
        return thumbKey;
    }

    public int getThumbWidth() {
        return thumbWidth;
    }

    public int getThumbHeight() {
        return thumbHeight;
    }

    public String getLargeKey() {
        return largeKey;
    }

    public int getLargeWidth() {
        return largeWidth;
    }

    public int getLargeHeight() {
        return largeHeight;
    }
}
