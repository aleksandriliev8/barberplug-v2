package com.barberplug.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Where Gallery files are stored.
 *
 * @param bucket S3 bucket name
 * @param region AWS region
 * @param endpoint S3 endpoint override; set to LocalStack locally, empty in production (real AWS)
 * @param publicBaseUrl URL that serves the bucket's files to browsers (LocalStack locally, CloudFront in production)
 * @param createBucket create the bucket on startup if missing; local only, Terraform owns it in production
 */
@ConfigurationProperties(prefix = "barberplug.storage")
public record StorageProperties(
        String bucket, String region, String endpoint, String publicBaseUrl, boolean createBucket) {}
