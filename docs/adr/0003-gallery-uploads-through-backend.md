# Gallery uploads go through the backend, not presigned S3 URLs

The Owner's uploads are sent to the backend, which strips EXIF data (including location), creates WebP thumbnail and large versions, and writes them to S3. Presigned direct-to-S3 uploads were rejected because they would need a separate processing step (for example a Lambda) and would briefly expose unprocessed originals. Upload volume is tiny, so routing through the backend costs nothing noticeable.
