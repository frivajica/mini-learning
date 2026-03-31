import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, loginRateLimit, getClientIP } from "./rate-limit";

describe("rate-limit", () => {
  describe("rateLimit", () => {
    it("should allow first request", () => {
      const result = rateLimit("test:1", 60000, 5);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("should track multiple requests", () => {
      rateLimit("test:2", 60000, 5);
      const result = rateLimit("test:2", 60000, 5);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(3);
    });

    it("should block after max requests", () => {
      const key = "test:3";
      for (let i = 0; i < 5; i++) {
        rateLimit(key, 60000, 5);
      }
      const result = rateLimit(key, 60000, 5);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe("loginRateLimit", () => {
    it("should allow first login attempt", () => {
      const result = loginRateLimit("192.168.1.1");
      expect(result.success).toBe(true);
      expect(result.retryAfter).toBeUndefined();
    });

    it("should block after 5 login attempts", () => {
      const key = "192.168.1.2";
      for (let i = 0; i < 5; i++) {
        loginRateLimit(key);
      }
      const result = loginRateLimit(key);
      expect(result.success).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  });

  describe("getClientIP", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const request = new Request("http://localhost", {
        headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
      });
      expect(getClientIP(request)).toBe("192.168.1.1");
    });

    it("should return unknown when no headers", () => {
      const request = new Request("http://localhost");
      expect(getClientIP(request)).toBe("unknown");
    });
  });
});
