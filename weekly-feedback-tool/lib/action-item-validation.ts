const MAX_TEXT_LENGTH = 280;
const MAX_OWNER_LENGTH = 80;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ActionItemValidationResult =
  | { valid: true; text: string; owner: string; dueDate: string }
  | { valid: false; error: string };

export function validateActionItemInput(
  rawText: string,
  rawOwner: string,
  rawDueDate: string
): ActionItemValidationResult {
  const text = rawText.trim();
  const owner = rawOwner.trim();
  const dueDate = rawDueDate.trim();

  if (text.length === 0) {
    return { valid: false, error: "Action item text is required." };
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return { valid: false, error: `Action item text is too long (max ${MAX_TEXT_LENGTH} characters).` };
  }
  if (owner.length === 0) {
    return { valid: false, error: "Owner is required." };
  }
  if (owner.length > MAX_OWNER_LENGTH) {
    return { valid: false, error: `Owner name is too long (max ${MAX_OWNER_LENGTH} characters).` };
  }
  if (dueDate.length === 0 || !DATE_PATTERN.test(dueDate) || Number.isNaN(Date.parse(dueDate))) {
    return { valid: false, error: "A valid due date is required." };
  }

  return { valid: true, text, owner, dueDate };
}
