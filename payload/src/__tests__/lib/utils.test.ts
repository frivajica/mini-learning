import { describe, it, expect } from "vitest";
import { formatDate, truncate, cn } from "@/lib/utils";

describe("formatDate", () => {
  it("formats ISO date string correctly", () => {
    const result = formatDate("2024-03-15T10:30:00.000Z");
    expect(result).toContain("March");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("handles Date object", () => {
    const date = new Date("2024-01-01T00:00:00.000Z");
    const result = formatDate(date);
    expect(result).toContain("January");
    expect(result).toContain("1");
    expect(result).toContain("2024");
  });
});

describe("truncate", () => {
  it("returns original string if shorter than length", () => {
    const result = truncate("Hello", 10);
    expect(result).toBe("Hello");
  });

  it("truncates string longer than length", () => {
    const result = truncate("Hello World", 5);
    expect(result).toBe("Hello...");
    expect(result.length).toBe(8);
  });

  it("handles exact length", () => {
    const result = truncate("Hello", 5);
    expect(result).toBe("Hello");
  });
});

describe("cn (className utility)", () => {
  it("merges class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base", isActive && "active");
    expect(result).toBe("base active");
  });

  it("filters falsy values", () => {
    const result = cn("foo", false, null, undefined, "bar");
    expect(result).toBe("foo bar");
  });
});
