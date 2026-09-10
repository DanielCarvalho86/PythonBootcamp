/** Normalizes a yyyy-MM-dd string (or Date) to a UTC-midnight Date so every
 * "date" column comparison/uniqueness constraint in the schema lines up
 * regardless of the server's local timezone. */
export function toDateOnly(input: string | Date): Date {
  if (typeof input === "string") {
    return new Date(`${input}T00:00:00.000Z`);
  }
  return new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayDateOnlyString(): string {
  return formatDateOnly(new Date());
}
