package com.barberplug;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.DynamicPropertyRegistrar;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.localstack.LocalStackContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Throwaway Postgres and LocalStack (S3) for tests, the same versions as docker-compose.yml.
 * Spring caches the test context, so they start once per test run, not once per test class.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

    static final String TEST_BUCKET = "barberplug-gallery-test";

    @Bean
    @ServiceConnection
    PostgreSQLContainer<?> postgresContainer() {
        return new PostgreSQLContainer<>("postgres:16-alpine");
    }

    @Bean
    LocalStackContainer localStackContainer() {
        return new LocalStackContainer(DockerImageName.parse("localstack/localstack:3.8"))
                .withServices(LocalStackContainer.Service.S3);
    }

    /** Points the app's storage at the LocalStack container. */
    @Bean
    DynamicPropertyRegistrar storageProperties(LocalStackContainer localStack) {
        return registry -> {
            registry.add("barberplug.storage.endpoint", () -> localStack.getEndpoint().toString());
            registry.add("barberplug.storage.region", localStack::getRegion);
            registry.add("barberplug.storage.bucket", () -> TEST_BUCKET);
            registry.add("barberplug.storage.public-base-url", () -> localStack.getEndpoint() + "/" + TEST_BUCKET);
            registry.add("barberplug.storage.create-bucket", () -> "true");
        };
    }
}
