-- Gallery Images (GLOSSARY.md): photos in an order the Owner chooses, with optional BG/EN captions.
-- The files themselves live in S3 as WebP (ADR-0003); this table stores their keys and sizes.
CREATE TABLE gallery_image (
    id           UUID         PRIMARY KEY,
    position     INTEGER      NOT NULL,
    caption_bg   VARCHAR(300),
    caption_en   VARCHAR(300),
    thumb_key    VARCHAR(200) NOT NULL,
    thumb_width  INTEGER      NOT NULL,
    thumb_height INTEGER      NOT NULL,
    large_key    VARCHAR(200) NOT NULL,
    large_width  INTEGER      NOT NULL,
    large_height INTEGER      NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX gallery_image_position_idx ON gallery_image (position);
