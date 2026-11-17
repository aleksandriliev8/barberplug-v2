package com.barberplug;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class BarberplugApplication {

    public static void main(String[] args) {
        SpringApplication.run(BarberplugApplication.class, args);
    }
}
