package com.mini.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@RequiredArgsConstructor
@Service
public class RateLimitService {

    private static final int MAX_REQUESTS_PER_WINDOW = 100;
    private static final int WINDOW_SECONDS = 60;

    private final StringRedisTemplate redisTemplate;

    public boolean isAllowed(String identifier, String action) {
        String key = buildKey(identifier, action);

        try {
            Long currentCount = redisTemplate.opsForValue().increment(key);

            if (currentCount == null) {
                return true;
            }

            if (currentCount == 1) {
                redisTemplate.expire(key, Duration.ofSeconds(WINDOW_SECONDS));
            }

            if (currentCount > MAX_REQUESTS_PER_WINDOW) {
                log.warn("Rate limit exceeded for {} - {}", identifier, action);
                return false;
            }

            return true;
        } catch (Exception ex) {
            log.error("Redis error during rate limiting, allowing request", ex);
            return true;
        }
    }

    public int getRemainingRequests(String identifier, String action) {
        String key = buildKey(identifier, action);

        try {
            String countStr = redisTemplate.opsForValue().get(key);
            if (countStr == null) {
                return MAX_REQUESTS_PER_WINDOW;
            }

            int currentCount = Integer.parseInt(countStr);
            return Math.max(0, MAX_REQUESTS_PER_WINDOW - currentCount);
        } catch (Exception ex) {
            log.error("Error getting remaining requests", ex);
            return MAX_REQUESTS_PER_WINDOW;
        }
    }

    public void resetRateLimit(String identifier, String action) {
        String key = buildKey(identifier, action);
        redisTemplate.delete(key);
    }

    private String buildKey(String identifier, String action) {
        return String.format("rate:%s:%s", action, identifier);
    }
}
