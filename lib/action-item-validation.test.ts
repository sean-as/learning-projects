import { describe, it, expect } from "vitest";
import { validateActionItemInput } from "./action-item-validation";

describe("validateActionItemInput", () => {
  it("accepts valid input", () => {
    expect(validateActionItemInput("Fix the thing", "Sean", "2026-09-01")).toEqual({
      valid: true,
      text: "Fix the thing",
      owner: "Sean",
      dueDate: "2026-09-01",
    });
  });

  it("rejects empty text", () => {
    expect(validateActionItemInput("", "Sean", "2026-09-01").valid).toBe(false);
  });

  it("rejects empty owner", () => {
    expect(validateActionItemInput("Fix it", "", "2026-09-01").valid).toBe(false);
  });

  it("rejects empty due date", () => {
    expect(validateActionItemInput("Fix it", "Sean", "").valid).toBe(false);
  });

  it("rejects an invalid due date", () => {
    expect(validateActionItemInput("Fix it", "Sean", "not-a-date").valid).toBe(false);
  });

  it("rejects text over the max length", () => {
    expect(validateActionItemInput("a".repeat(281), "Sean", "2026-09-01").valid).toBe(false);
  });

  it("rejects owner over the max length", () => {
    expect(validateActionItemInput("Fix it", "a".repeat(81), "2026-09-01").valid).toBe(false);
  });
});
