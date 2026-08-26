import { describe, it, expect } from "vitest";
import { validateCardInput } from "./card-validation";

describe("validateCardInput", () => {
  it("accepts a valid start card", () => {
    expect(validateCardInput("start", "Ship faster")).toEqual({
      valid: true,
      category: "start",
      content: "Ship faster",
    });
  });

  it("accepts stop and continue categories", () => {
    expect(validateCardInput("stop", "x").valid).toBe(true);
    expect(validateCardInput("continue", "x").valid).toBe(true);
  });

  it("rejects an unknown category", () => {
    expect(validateCardInput("pause", "x").valid).toBe(false);
  });

  it("rejects empty content", () => {
    expect(validateCardInput("start", "   ").valid).toBe(false);
  });

  it("rejects content over the max length", () => {
    expect(validateCardInput("start", "a".repeat(281)).valid).toBe(false);
  });

  it("trims content", () => {
    const result = validateCardInput("start", "  hello  ");
    expect(result).toEqual({ valid: true, category: "start", content: "hello" });
  });
});
