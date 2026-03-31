package com.mini.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RateLimitService {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitService.class);

    private static final int MAX_REQUESTS_PER_WINDOW = 100;
    private static final int WINDOW_SECONDS = 60;

    private final StringRedisTemplate redisTemplate;

    public RateLimitService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Check if the request is allowed based on rate limiting.
     * Uses a sliding window algorithm with Redis.
     *
     * @param identifier Client identifier (IP address, user ID, etc.)
     * @param action     Action being performed (login, register, etc.)
     * @return true if request is allowed, false if rate limited
     */
    public boolean isAllowed(String identifier, String action) {
        String key = buildKey(identifier, action);

        try {
            Long currentCount = redisTemplate.opsForValue().increment(key);

            if (currentCount == null) {
                return true;
            }

            // Set expiration on first request
            if (currentCount == 1) {
                redisTemplate.expire(key, Duration.ofSeconds(WINDOW_SECONDS));
            }

            // Check if rate limit exceeded
            if (currentCount > MAX_REQUESTS_PER_WINDOW) {
                logger.warn("Rate limit exceeded for {} - {}", identifier, action);
                return false;
            }

            return true;
        } catch (Exception ex) {
            // If Redis is unavailable, allow the request (fail open)
            logger.error("Redis error during rate limiting, allowing request", ex);
            return true;
        }
    }

    /**
     * Get the remaining requests for a given identifier and action.
     *
     * @param identifier Client identifier
     * @param action     Action being performed
     * @return Number of remaining requests
     */
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
            logger.error("Error getting remaining requests", ex);
            return MAX_REQUESTS_PER_WINDOW;
        }
    }

    /**
     * Reset the rate limit for a given identifier and action.
     *
     * @param identifier Client identifier
     * @param action      Action being performed
     */
    public void resetRateLimit(String identifier, String action) {
        String key = buildKey(identifier, action);
        redisTemplate.delete(key);
    }

    private String buildKey(String identifier, String action) {
        return String.format("rate:%s:%s", action, identifier);
    }
}
