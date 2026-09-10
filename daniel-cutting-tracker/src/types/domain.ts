// Shared domain types for the Daniel Cutting Tracker.
// Kept as plain string unions (rather than Prisma enums) so the same types
// work for both the SQLite dev/test datasource and a future Postgres one.

export const MEAL_TYPES = [
  "breakfast",
  "morning_snack",
  "lunch",
  "afternoon_snack",
  "dinner",
  "supper",
  "other",
] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const ACTIVITY_TYPES = [
  "steps",
  "weight_training",
  "swimming",
  "walking",
  "running",
  "cycling",
  "cardio",
  "sports",
  "other",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const FOOD_UNITS = ["g", "ml", "unit", "slice", "tbsp", "cup"] as const;
export type FoodUnit = (typeof FOOD_UNITS)[number];

export const CALORIES_SOURCES = ["user", "device", "estimated"] as const;
export type CaloriesSource = (typeof CALORIES_SOURCES)[number];

export const ENTRY_SOURCES = ["user", "ai_parser", "plan"] as const;
export type EntrySource = (typeof ENTRY_SOURCES)[number];

export const FOOD_ROLES = ["protein", "carb", "fat", "fixed"] as const;
export type FoodRole = (typeof FOOD_ROLES)[number];

export const DAY_STATUSES = ["on_track", "above_target", "below_target"] as const;
export type DayStatus = (typeof DAY_STATUSES)[number];

export interface NutrientTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export const ZERO_NUTRIENTS: NutrientTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
};

export interface FoodNutritionFacts {
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
}

export interface NutrientRange {
  min: number;
  target: number;
  max: number;
}

// ---- AI parser contracts -------------------------------------------------
// This is the ONLY thing the LLM is allowed to produce. All arithmetic
// happens downstream in the deterministic nutrition/activity engines.

export interface ParsedFoodItem {
  food: string;
  quantity: number;
  unit: FoodUnit;
}

export interface ParsedMeal {
  mealType: MealType;
  items: ParsedFoodItem[];
}

export interface ParsedActivity {
  activityType: ActivityType;
  durationMinutes?: number;
  caloriesBurned?: number;
  caloriesSource: CaloriesSource;
  description?: string;
  distanceKm?: number;
  intensity?: string;
}

export interface ParsedWeight {
  weightKg: number;
  measurementCondition?: string;
}

export interface ParsedMessage {
  date: string; // ISO date (yyyy-MM-dd)
  meals: ParsedMeal[];
  activities: ParsedActivity[];
  steps?: number;
  stepsCalories?: number;
  stepsIsEstimated?: boolean;
  weight?: ParsedWeight;
  waterMl?: number;
  needsClarification?: string; // set when the parser could not confidently extract data
}
