import { describe, it, expect } from "vitest";
import { validateWeekInput } from "./week-validation";

describe("validateWeekInput", () => {
  it("accepts a valid ISO date", () => {
    expect(validateWeekInput("2026-08-24")).toEqual({ valid: true, week: "2026-08-24" });
  });

  it("rejects an empty value", () => {
    expect(validateWeekInput("").valid).toBe(false);
  });

  it("rejects a malformed date", () => {
    expect(validateWeekInput("not-a-date").valid).toBe(false);
  });

  it("rejects an invalid calendar date", () => {
    expect(validateWeekInput("2026-13-40").valid).toBe(false);
  });
});
