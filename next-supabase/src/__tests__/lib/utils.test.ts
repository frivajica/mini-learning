import { describe, it, expect } from "vitest";
import { cn, formatDate, formatCurrency } from "@/lib/utils";

describe("cn (className merger)", () => {
  it("merges class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const result = cn("foo", false && "bar", "baz");
    expect(result).toBe("foo baz");
  });

  it("handles undefined", () => {
    const result = cn("foo", undefined, "bar");
    expect(result).toBe("foo bar");
  });

  it("handles empty strings", () => {
    const result = cn("foo", "", "bar");
    expect(result).toBe("foo bar");
  });
});

describe("formatDate", () => {
  it("formats ISO string", () => {
    const result = formatDate("2024-01-15T10:30:00Z");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
  });

  it("formats Date object", () => {
    const result = formatDate(new Date("2024-06-20T12:00:00Z"));
    expect(result).toContain("Jun");
    expect(result).toContain("20");
  });

  it("handles different dates", () => {
    const result = formatDate("2024-12-25T08:00:00Z");
    expect(result).toContain("Dec");
    expect(result).toContain("25");
  });
});

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    const result = formatCurrency(9.99);
    expect(result).toContain("9.99");
    expect(result).toContain("$");
  });

  it("formats whole numbers", () => {
    const result = formatCurrency(10);
    expect(result).toContain("10");
  });

  it("formats larger amounts", () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain("1,234.56");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });
});
