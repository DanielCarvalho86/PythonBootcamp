"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { parseFoodFormData } from "@/lib/validation/foodSchema";

export interface FoodFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createFoodAction(_prev: FoodFormState, formData: FormData): Promise<FoodFormState> {
  await requireUserId(); // any authenticated user of this single-user app may manage foods
  const parsed = parseFoodFormData(formData);
  if (!parsed.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: flattenZodErrors(parsed.error) };
  }

  await prisma.food.create({ data: parsed.data });
  revalidatePath("/settings/foods");
  redirect("/settings/foods");
}

export async function updateFoodAction(
  foodId: string,
  _prev: FoodFormState,
  formData: FormData,
): Promise<FoodFormState> {
  await requireUserId();
  const parsed = parseFoodFormData(formData);
  if (!parsed.success) {
    return { error: "Verifique os campos destacados.", fieldErrors: flattenZodErrors(parsed.error) };
  }

  await prisma.food.update({ where: { id: foodId }, data: parsed.data });
  revalidatePath("/settings/foods");
  redirect("/settings/foods");
}

/**
 * Soft-delete only (spec: never hard-delete a food that already has
 * history attached). Also blocks deactivating a food that's still used by
 * an active plan's meal items, since that would silently break the
 * adjustment engine's ability to resolve that meal.
 */
export async function setFoodActiveAction(foodId: string, active: boolean): Promise<{ error?: string }> {
  await requireUserId();

  if (!active) {
    const usedInActivePlan = await prisma.planMealItem.findFirst({
      where: { foodId, planMeal: { plan: { isActive: true } } },
      select: { id: true, planMeal: { select: { name: true, plan: { select: { name: true } } } } },
    });
    if (usedInActivePlan) {
      return {
        error: `Este alimento e usado em "${usedInActivePlan.planMeal.name}" no plano ativo "${usedInActivePlan.planMeal.plan.name}" — remova-o do plano antes de desativar.`,
      };
    }
  }

  await prisma.food.update({ where: { id: foodId }, data: { active } });
  revalidatePath("/settings/foods");
  return {};
}

function flattenZodErrors(error: ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
