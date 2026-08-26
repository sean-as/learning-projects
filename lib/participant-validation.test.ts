import { describe, it, expect } from "vitest";
import { validateJoinInput, participantCookieName } from "./participant-validation";

describe("validateJoinInput", () => {
  it("accepts a named submission", () => {
    const result = validateJoinInput("Sean", false);
    expect(result).toEqual({ valid: true, name: "Sean" });
  });

  it("accepts an anonymous submission with empty name", () => {
    const result = validateJoinInput("", true);
    expect(result).toEqual({ valid: true, name: null });
  });

  it("drops the typed name when anonymous is chosen", () => {
    const result = validateJoinInput("Sean", true);
    expect(result).toEqual({ valid: true, name: null });
  });

  it("rejects empty non-anonymous submissions", () => {
    const result = validateJoinInput("   ", false);
    expect(result.valid).toBe(false);
  });

  it("rejects names over the max length", () => {
    const result = validateJoinInput("a".repeat(61), false);
    expect(result.valid).toBe(false);
  });

  it("accepts names at the max length", () => {
    const result = validateJoinInput("a".repeat(60), false);
    expect(result).toEqual({ valid: true, name: "a".repeat(60) });
  });
});

describe("participantCookieName", () => {
  it("scopes the cookie name to the board id", () => {
    expect(participantCookieName("abc-123")).toBe("wft_participant_abc-123");
  });

  it("produces different names for different boards", () => {
    expect(participantCookieName("a")).not.toBe(participantCookieName("b"));
  });
});
