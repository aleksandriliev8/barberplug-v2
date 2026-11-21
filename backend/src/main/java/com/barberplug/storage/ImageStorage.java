package com.barberplug.storage;

import java.net.URI;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.Delete;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;

/**
 * Stores Gallery files in S3. Locally that is LocalStack (docker-compose.yml); in production the
 * real bucket behind CloudFront. Files are immutable: a new upload always gets a new key.
 */
@Component
public class ImageStorage {

    private static final Logger log = LoggerFactory.getLogger(ImageStorage.class);
    /** Keys never change content, so browsers and CloudFront may cache them for a year. */
    private static final String CACHE_FOREVER = "public, max-age=31536000, immutable";

    private final StorageProperties properties;
    private final S3Client s3;

    public ImageStorage(StorageProperties properties) {
        this.properties = properties;
        var builder = S3Client.builder().region(Region.of(properties.region()));
        if (StringUtils.hasText(properties.endpoint())) {
            // LocalStack: any credentials work, and buckets are addressed by path.
            builder.endpointOverride(URI.create(properties.endpoint()))
                    .forcePathStyle(true)
                    .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create("test", "test")));
        } else {
            // AWS: the ECS task role.
            builder.credentialsProvider(DefaultCredentialsProvider.builder().build());
        }
        this.s3 = builder.build();
    }

    @EventListener(ApplicationReadyEvent.class)
    void createBucketIfAsked() {
        if (!properties.createBucket()) {
            return;
        }
        try {
            s3.headBucket(request -> request.bucket(properties.bucket()));
        } catch (NoSuchBucketException missing) {
            s3.createBucket(request -> request.bucket(properties.bucket()));
            log.info("Created storage bucket {}", properties.bucket());
        }
    }

    public void put(String key, byte[] content, String contentType) {
        s3.putObject(
                request -> request.bucket(properties.bucket())
                        .key(key)
                        .contentType(contentType)
                        .cacheControl(CACHE_FOREVER),
                RequestBody.fromBytes(content));
    }

    /** Best effort: a file left behind costs a few kilobytes, a failed request should not. */
    public void deleteQuietly(List<String> keys) {
        if (keys.isEmpty()) {
            return;
        }
        try {
            List<ObjectIdentifier> objects = keys.stream()
                    .map(key -> ObjectIdentifier.builder().key(key).build())
                    .toList();
            s3.deleteObjects(request -> request.bucket(properties.bucket())
                    .delete(Delete.builder().objects(objects).quiet(true).build()));
        } catch (RuntimeException failed) {
            log.warn("Could not delete {} from storage; they stay as orphans", keys, failed);
        }
    }

    public boolean exists(String key) {
        try {
            s3.headObject(request -> request.bucket(properties.bucket()).key(key));
            return true;
        } catch (software.amazon.awssdk.services.s3.model.NoSuchKeyException missing) {
            return false;
        }
    }

    @jakarta.annotation.PreDestroy
    void close() {
        s3.close();
    }

    public String publicUrl(String key) {
        String base = properties.publicBaseUrl();
        return (base.endsWith("/") ? base : base + "/") + key;
    }
}
