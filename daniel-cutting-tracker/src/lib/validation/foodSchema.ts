import { z } from "zod";
import { FOOD_UNITS } from "@/types/domain";

export const foodFormSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatorio").max(200),
  category: z.string().trim().min(1, "Categoria obrigatoria").max(100),
  servingUnit: z.enum(FOOD_UNITS),
  gramsPerUnit: z.number().positive().nullable(),
  caloriesPer100g: z.number().min(0).max(9000),
  proteinPer100g: z.number().min(0).max(100),
  carbsPer100g: z.number().min(0).max(100),
  fatPer100g: z.number().min(0).max(100),
  fiberPer100g: z.number().min(0).max(100),
  source: z.string().trim().max(100).default("manual"),
  verified: z.boolean().default(false),
  notes: z.string().trim().max(1000).optional(),
});

export type FoodFormInput = z.infer<typeof foodFormSchema>;

/** Parses the raw string values a <form> submits into the typed shape
 * foodFormSchema expects, then validates. Centralized here so the create
 * and edit actions can't drift on number/checkbox coercion. */
export function parseFoodFormData(formData: FormData) {
  const gramsPerUnitRaw = formData.get("gramsPerUnit");
  const raw = {
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? ""),
    servingUnit: String(formData.get("servingUnit") ?? "g"),
    gramsPerUnit: gramsPerUnitRaw && String(gramsPerUnitRaw).trim() !== "" ? Number(gramsPerUnitRaw) : null,
    caloriesPer100g: Number(formData.get("caloriesPer100g") ?? 0),
    proteinPer100g: Number(formData.get("proteinPer100g") ?? 0),
    carbsPer100g: Number(formData.get("carbsPer100g") ?? 0),
    fatPer100g: Number(formData.get("fatPer100g") ?? 0),
    fiberPer100g: Number(formData.get("fiberPer100g") ?? 0),
    source: String(formData.get("source") ?? "manual"),
    verified: formData.get("verified") === "on",
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  };
  return foodFormSchema.safeParse(raw);
}
