const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type WeekValidationResult = { valid: true; week: string } | { valid: false; error: string };

export function validateWeekInput(rawWeek: string): WeekValidationResult {
  const week = rawWeek.trim();

  if (week.length === 0) {
    return { valid: false, error: "Pick a week." };
  }

  if (!DATE_PATTERN.test(week) || Number.isNaN(Date.parse(week))) {
    return { valid: false, error: "Enter a valid date." };
  }

  return { valid: true, week };
}
