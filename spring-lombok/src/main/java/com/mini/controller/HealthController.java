package com.mini.controller;

import com.mini.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;
    private final RedisTemplate<String, Object> redisTemplate;

    @GetMapping("/live")
    public ResponseEntity<ApiResponse<String>> liveness() {
        return ResponseEntity.ok(ApiResponse.success("OK"));
    }

    @GetMapping("/ready")
    public ResponseEntity<ApiResponse<Map<String, Object>>> readiness() {
        Map<String, Object> checks = new HashMap<>();
        boolean isHealthy = true;

        // Check database
        try (Connection conn = dataSource.getConnection()) {
            checks.put("database", Map.of("status", "ok"));
        } catch (Exception e) {
            checks.put("database", Map.of("status", "error", "message", e.getMessage()));
            isHealthy = false;
        }

        // Check Redis
        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            checks.put("redis", Map.of("status", "ok"));
        } catch (Exception e) {
            checks.put("redis", Map.of("status", "error", "message", e.getMessage()));
            isHealthy = false;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", Instant.now().toString());
        response.put("checks", checks);

        if (isHealthy) {
            return ResponseEntity.ok(ApiResponse.success(response));
        } else {
            return ResponseEntity.status(503).body(ApiResponse.error("Service not ready", response));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("OK"));
    }
}
