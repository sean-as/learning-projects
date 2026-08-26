const MAX_NAME_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 500;

export type ProjectValidationResult =
  | { valid: true; name: string; description: string | null }
  | { valid: false; error: string };

export function validateProjectInput(
  rawName: string,
  rawDescription: string
): ProjectValidationResult {
  const name = rawName.trim();
  const description = rawDescription.trim();

  if (name.length === 0) {
    return { valid: false, error: "Project name is required." };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      valid: false,
      error: `Project name is too long (max ${MAX_NAME_LENGTH} characters).`,
    };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `Description is too long (max ${MAX_DESCRIPTION_LENGTH} characters).`,
    };
  }

  return { valid: true, name, description: description.length > 0 ? description : null };
}
