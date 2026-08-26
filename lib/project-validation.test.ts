import { describe, it, expect } from "vitest";
import { validateProjectInput } from "./project-validation";

describe("validateProjectInput", () => {
  it("accepts a name with no description", () => {
    expect(validateProjectInput("Billing API", "")).toEqual({
      valid: true,
      name: "Billing API",
      description: null,
    });
  });

  it("accepts a name with a description", () => {
    expect(validateProjectInput("Billing API", "Handles invoices")).toEqual({
      valid: true,
      name: "Billing API",
      description: "Handles invoices",
    });
  });

  it("trims whitespace from name and description", () => {
    expect(validateProjectInput("  Billing API  ", "  notes  ")).toEqual({
      valid: true,
      name: "Billing API",
      description: "notes",
    });
  });

  it("rejects an empty name", () => {
    const result = validateProjectInput("   ", "");
    expect(result.valid).toBe(false);
  });

  it("rejects a name over the max length", () => {
    const result = validateProjectInput("a".repeat(121), "");
    expect(result.valid).toBe(false);
  });

  it("rejects a description over the max length", () => {
    const result = validateProjectInput("Billing API", "a".repeat(501));
    expect(result.valid).toBe(false);
  });
});
