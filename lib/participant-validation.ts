const MAX_NAME_LENGTH = 60;

export type JoinValidationResult =
  | { valid: true; name: string | null }
  | { valid: false; error: string };

export function validateJoinInput(
  rawName: string,
  anonymous: boolean
): JoinValidationResult {
  const name = rawName.trim();

  if (!anonymous && name.length === 0) {
    return { valid: false, error: "Enter a name, or choose to stay anonymous." };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `Name is too long (max ${MAX_NAME_LENGTH} characters).`,
    };
  }

  return { valid: true, name: anonymous ? null : name };
}

export function participantCookieName(boardId: string): string {
  return `wft_participant_${boardId}`;
}
