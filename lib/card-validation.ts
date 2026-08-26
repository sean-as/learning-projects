const MAX_CONTENT_LENGTH = 280;

export const CARD_CATEGORIES = ["start", "stop", "continue"] as const;
export type CardCategory = (typeof CARD_CATEGORIES)[number];

export type CardValidationResult =
  | { valid: true; category: CardCategory; content: string }
  | { valid: false; error: string };

export function validateCardInput(rawCategory: string, rawContent: string): CardValidationResult {
  if (!(CARD_CATEGORIES as readonly string[]).includes(rawCategory)) {
    return { valid: false, error: "Invalid card category." };
  }

  const content = rawContent.trim();
  if (content.length === 0) {
    return { valid: false, error: "Card text is required." };
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return {
      valid: false,
      error: `Card text is too long (max ${MAX_CONTENT_LENGTH} characters).`,
    };
  }

  return { valid: true, category: rawCategory as CardCategory, content };
}
