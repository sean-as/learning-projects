export const BOARD_PHASES = ["submit", "cluster", "vote", "discuss", "closed"] as const;
export type BoardPhase = (typeof BOARD_PHASES)[number];

const PHASE_ORDER: readonly BoardPhase[] = BOARD_PHASES;

/** The phase a facilitator's "advance" action moves to, or null at the end. */
export function nextPhase(current: BoardPhase): BoardPhase | null {
  const index = PHASE_ORDER.indexOf(current);
  if (index === -1 || index === PHASE_ORDER.length - 1) {
    return null;
  }
  return PHASE_ORDER[index + 1];
}

/** True only for the single forward step defined by nextPhase — no skipping, no going back. */
export function canTransition(from: BoardPhase, to: BoardPhase): boolean {
  return nextPhase(from) === to;
}

export type BoardAction = "submit_card" | "cluster_cards" | "cast_vote" | "add_action_item";

const ACTION_REQUIRED_PHASE: Record<BoardAction, BoardPhase> = {
  submit_card: "submit",
  cluster_cards: "cluster",
  cast_vote: "vote",
  add_action_item: "discuss",
};

export function isActionAllowedInPhase(action: BoardAction, phase: BoardPhase): boolean {
  return ACTION_REQUIRED_PHASE[action] === phase;
}
