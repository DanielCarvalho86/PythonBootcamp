import { z } from "zod";
import { ACTIVITY_TYPES, CALORIES_SOURCES, FOOD_UNITS, MEAL_TYPES } from "@/types/domain";

// Validates the JSON the AI parser returns before any downstream code
// touches it. The AI never computes nutrition — it only extracts
// structured intent from natural language. This schema is the boundary
// that keeps a hallucinated/malformed AI response from ever reaching the
// deterministic nutrition/activity engines.

export const parsedFoodItemSchema = z.object({
  food: z.string().min(1).max(200),
  quantity: z.number().positive().max(10000),
  unit: z.enum(FOOD_UNITS),
});

export const parsedMealSchema = z
  .object({
    mealType: z.enum(MEAL_TYPES),
    items: z.array(parsedFoodItemSchema).default([]),
    // Set when the user referenced the meal without detailing ingredients
    // (e.g. "tomei meu shake") — the caller falls back to the active
    // plan's current quantities for that slot.
    usesPlanDefault: z.boolean().optional(),
  })
  .refine((meal) => meal.items.length > 0 || meal.usesPlanDefault === true, {
    message: "A meal needs at least one item, or usesPlanDefault: true",
  });

export const parsedActivitySchema = z.object({
  activityType: z.enum(ACTIVITY_TYPES),
  durationMinutes: z.number().nonnegative().max(1440).optional(),
  caloriesBurned: z.number().nonnegative().max(10000).optional(),
  caloriesSource: z.enum(CALORIES_SOURCES).default("user"),
  description: z.string().max(500).optional(),
  distanceKm: z.number().nonnegative().max(1000).optional(),
  intensity: z.string().max(100).optional(),
});

export const parsedWeightSchema = z.object({
  weightKg: z.number().positive().max(500),
  measurementCondition: z.string().max(200).optional(),
});

export const parsedMessageSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meals: z.array(parsedMealSchema).default([]),
  activities: z.array(parsedActivitySchema).default([]),
  steps: z.number().int().nonnegative().max(200000).optional(),
  stepsCalories: z.number().nonnegative().max(10000).optional(),
  stepsIsEstimated: z.boolean().optional(),
  weight: parsedWeightSchema.optional(),
  waterMl: z.number().nonnegative().max(20000).optional(),
  needsClarification: z.string().max(500).optional(),
});

export type ParsedMessageInput = z.infer<typeof parsedMessageSchema>;
