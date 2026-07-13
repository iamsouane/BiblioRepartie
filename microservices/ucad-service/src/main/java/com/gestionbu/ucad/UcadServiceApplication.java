package com.gestionbu.ucad;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class UcadServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UcadServiceApplication.class, args);
    }

}