import type { MealType } from "@/types/domain";

/** Shared display labels for meal slots — single source of truth so the
 * dashboard, plan page, and settings editor never drift apart. */
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Cafe da manha",
  morning_snack: "Lanche da manha",
  lunch: "Almoco",
  shake: "Shake",
  afternoon_snack: "Lanche da tarde",
  dinner: "Jantar",
  supper: "Ceia",
  other: "Outro",
};

/** Safe lookup for values coming from the DB as plain `string` (Prisma
 * doesn't type mealType as the MealType union). Falls back to the raw
 * value for anything unrecognized rather than throwing. */
export function mealTypeLabel(mealType: string): string {
  return MEAL_TYPE_LABELS[mealType as MealType] ?? mealType;
}
