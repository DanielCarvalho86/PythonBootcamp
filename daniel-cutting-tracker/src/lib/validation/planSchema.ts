import { z } from "zod";
import { FOOD_ROLES, MEAL_TYPES } from "@/types/domain";

const range = () =>
  z.object({ min: z.number().min(0), target: z.number().min(0), max: z.number().min(0) }).refine((r) => r.min <= r.target && r.target <= r.max, {
    message: "min <= alvo <= max",
  });

export const planTargetsSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatorio").max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida"),
  calories: range(),
  protein: range(),
  carbs: range(),
  fat: range(),
  fiberMin: z.number().min(0),
  fiberMax: z.number().min(0),
  waterMinMl: z.number().min(0),
  waterMaxMl: z.number().min(0),
  creatineTargetG: z.number().min(0),
  wheyTargetG: z.number().min(0),
  notes: z.string().trim().max(2000).optional(),
});

export function parsePlanTargetsFormData(formData: FormData) {
  const num = (key: string) => Number(formData.get(key) ?? 0);
  const raw = {
    name: String(formData.get("name") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
    calories: { min: num("caloriesMin"), target: num("caloriesTarget"), max: num("caloriesMax") },
    protein: { min: num("proteinMin"), target: num("proteinTarget"), max: num("proteinMax") },
    carbs: { min: num("carbsMin"), target: num("carbsTarget"), max: num("carbsMax") },
    fat: { min: num("fatMin"), target: num("fatTarget"), max: num("fatMax") },
    fiberMin: num("fiberMin"),
    fiberMax: num("fiberMax"),
    waterMinMl: num("waterMinMl"),
    waterMaxMl: num("waterMaxMl"),
    creatineTargetG: num("creatineTargetG"),
    wheyTargetG: num("wheyTargetG"),
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  };
  return planTargetsSchema.safeParse(raw);
}

export const planMealItemSchema = z
  .object({
    targetQuantityG: z.number().min(0),
    minQuantityG: z.number().min(0),
    maxQuantityG: z.number().min(0),
    adjustmentStepG: z.number().min(0),
    role: z.enum(FOOD_ROLES),
    isMandatory: z.boolean(),
  })
  .refine((v) => v.minQuantityG <= v.targetQuantityG && v.targetQuantityG <= v.maxQuantityG, {
    message: "min <= quantidade <= max",
  });

export function parsePlanMealItemFormData(formData: FormData) {
  const num = (key: string) => Number(formData.get(key) ?? 0);
  return planMealItemSchema.safeParse({
    targetQuantityG: num("targetQuantityG"),
    minQuantityG: num("minQuantityG"),
    maxQuantityG: num("maxQuantityG"),
    adjustmentStepG: num("adjustmentStepG"),
    role: String(formData.get("role") ?? "carb"),
    isMandatory: formData.get("isMandatory") === "on",
  });
}

export const newPlanMealSchema = z.object({
  mealType: z.enum(MEAL_TYPES),
  name: z.string().trim().min(1).max(100),
  order: z.number().int().min(0),
  isProtectedComposition: z.boolean(),
  isAdjustable: z.boolean(),
});

export function parseNewPlanMealFormData(formData: FormData) {
  return newPlanMealSchema.safeParse({
    mealType: String(formData.get("mealType") ?? "other"),
    name: String(formData.get("name") ?? ""),
    order: Number(formData.get("order") ?? 0),
    isProtectedComposition: formData.get("isProtectedComposition") === "on",
    isAdjustable: formData.get("isAdjustable") !== "off", // default true unless explicitly unchecked
  });
}

export const newPlanMealItemSchema = z
  .object({
    foodId: z.string().min(1, "Selecione um alimento"),
    targetQuantityG: z.number().min(0),
    minQuantityG: z.number().min(0),
    maxQuantityG: z.number().min(0),
    adjustmentStepG: z.number().min(0),
    role: z.enum(FOOD_ROLES),
    isMandatory: z.boolean(),
  })
  .refine((v) => v.minQuantityG <= v.targetQuantityG && v.targetQuantityG <= v.maxQuantityG, {
    message: "min <= quantidade <= max",
  });

export function parseNewPlanMealItemFormData(formData: FormData) {
  const num = (key: string) => Number(formData.get(key) ?? 0);
  return newPlanMealItemSchema.safeParse({
    foodId: String(formData.get("foodId") ?? ""),
    targetQuantityG: num("targetQuantityG"),
    minQuantityG: num("minQuantityG"),
    maxQuantityG: num("maxQuantityG"),
    adjustmentStepG: num("adjustmentStepG"),
    role: String(formData.get("role") ?? "carb"),
    isMandatory: formData.get("isMandatory") === "on",
  });
}
