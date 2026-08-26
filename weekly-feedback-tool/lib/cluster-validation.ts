const MAX_NAME_LENGTH = 80;

export type ClusterNameValidationResult = { valid: true; name: string } | { valid: false; error: string };

export function validateClusterName(rawName: string): ClusterNameValidationResult {
  const name = rawName.trim();

  if (name.length === 0) {
    return { valid: false, error: "Cluster name is required." };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Cluster name is too long (max ${MAX_NAME_LENGTH} characters).` };
  }

  return { valid: true, name };
}
