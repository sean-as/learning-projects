import { describe, it, expect } from "vitest";
import { validateClusterName } from "./cluster-validation";

describe("validateClusterName", () => {
  it("accepts a trimmed name", () => {
    expect(validateClusterName("  Onboarding  ")).toEqual({ valid: true, name: "Onboarding" });
  });

  it("rejects an empty name", () => {
    expect(validateClusterName("   ").valid).toBe(false);
  });

  it("rejects a name over the max length", () => {
    expect(validateClusterName("a".repeat(81)).valid).toBe(false);
  });
});
