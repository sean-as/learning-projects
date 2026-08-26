import { describe, it, expect } from "vitest";
import { nextPhase, canTransition, isActionAllowedInPhase } from "./board-phase";

describe("nextPhase", () => {
  it("steps through the full sequence", () => {
    expect(nextPhase("submit")).toBe("cluster");
    expect(nextPhase("cluster")).toBe("vote");
    expect(nextPhase("vote")).toBe("discuss");
    expect(nextPhase("discuss")).toBe("closed");
  });

  it("returns null at the terminal phase", () => {
    expect(nextPhase("closed")).toBeNull();
  });
});

describe("canTransition", () => {
  it("allows the single defined forward step", () => {
    expect(canTransition("submit", "cluster")).toBe(true);
  });

  it("rejects skipping a phase", () => {
    expect(canTransition("submit", "vote")).toBe(false);
  });

  it("rejects going backward", () => {
    expect(canTransition("cluster", "submit")).toBe(false);
  });

  it("rejects a no-op transition", () => {
    expect(canTransition("submit", "submit")).toBe(false);
  });
});

describe("isActionAllowedInPhase", () => {
  it("allows submitting a card only during submit", () => {
    expect(isActionAllowedInPhase("submit_card", "submit")).toBe(true);
    expect(isActionAllowedInPhase("submit_card", "cluster")).toBe(false);
  });

  it("allows clustering only during cluster", () => {
    expect(isActionAllowedInPhase("cluster_cards", "cluster")).toBe(true);
    expect(isActionAllowedInPhase("cluster_cards", "vote")).toBe(false);
  });

  it("allows voting only during vote", () => {
    expect(isActionAllowedInPhase("cast_vote", "vote")).toBe(true);
    expect(isActionAllowedInPhase("cast_vote", "submit")).toBe(false);
  });

  it("allows action items only during discuss", () => {
    expect(isActionAllowedInPhase("add_action_item", "discuss")).toBe(true);
    expect(isActionAllowedInPhase("add_action_item", "vote")).toBe(false);
  });
});
