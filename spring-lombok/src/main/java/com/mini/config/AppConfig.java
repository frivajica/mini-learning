package com.mini.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@PropertySource(value = "classpath:application.yml", ignoreResourceNotFound = true)
public class AppConfig {
    // Additional beans can be configured here
}
