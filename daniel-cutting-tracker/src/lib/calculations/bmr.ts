/**
 * Mifflin-St Jeor BMR formula — used only as a fallback when the user's
 * profile doesn't have a device-measured BMR. Per spec section 3/18, any
 * BMR figure (device or formula) is always an estimate, never presented
 * as an exact measurement.
 */
export function calculateMifflinStJeorBmr(input: {
  sex: "male" | "female";
  weightKg: number;
  heightCm: number;
  ageYears: number;
}): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.ageYears;
  const bmr = input.sex === "male" ? base + 5 : base - 161;
  return Math.round(bmr);
}

export function calculateAgeYears(birthDate: Date, onDate: Date): number {
  let age = onDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = onDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && onDate.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}
