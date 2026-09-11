"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { toDateOnly } from "@/lib/services/dateOnly";
import {
  parseNewPlanMealFormData,
  parseNewPlanMealItemFormData,
  parsePlanMealItemFormData,
  parsePlanTargetsFormData,
} from "@/lib/validation/planSchema";

export interface PlanFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createPlanAction(_prev: PlanFormState, formData: FormData): Promise<PlanFormState> {
  const userId = await requireUserId();
  const parsed = parsePlanTargetsFormData(formData);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const plan = await prisma.nutritionPlan.create({
    data: {
      userId,
      name: parsed.data.name,
      startDate: toDateOnly(parsed.data.startDate),
      endDate: toDateOnly(parsed.data.endDate),
      isActive: false,
      caloriesMin: parsed.data.calories.min,
      caloriesTarget: parsed.data.calories.target,
      caloriesMax: parsed.data.calories.max,
      proteinMin: parsed.data.protein.min,
      proteinTarget: parsed.data.protein.target,
      proteinMax: parsed.data.protein.max,
      carbsMin: parsed.data.carbs.min,
      carbsTarget: parsed.data.carbs.target,
      carbsMax: parsed.data.carbs.max,
      fatMin: parsed.data.fat.min,
      fatTarget: parsed.data.fat.target,
      fatMax: parsed.data.fat.max,
      fiberMin: parsed.data.fiberMin,
      fiberMax: parsed.data.fiberMax,
      waterMinMl: parsed.data.waterMinMl,
      waterMaxMl: parsed.data.waterMaxMl,
      creatineTargetG: parsed.data.creatineTargetG,
      wheyTargetG: parsed.data.wheyTargetG,
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/settings/plans");
  redirect(`/settings/plans/${plan.id}`);
}

/** "Criar nova semana" from an existing one — deep-copies every meal and
 * item so Daniel doesn't have to rebuild a whole week's structure from
 * scratch; he only edits the deltas afterward. */
export async function duplicatePlanAction(sourcePlanId: string, newName: string, startDate: string, endDate: string) {
  const userId = await requireUserId();
  const source = await prisma.nutritionPlan.findFirst({
    where: { id: sourcePlanId, userId },
    include: { meals: { include: { items: true } } },
  });
  if (!source) return { error: "Plano de origem nao encontrado." };

  const newPlan = await prisma.nutritionPlan.create({
    data: {
      userId,
      name: newName,
      startDate: toDateOnly(startDate),
      endDate: toDateOnly(endDate),
      isActive: false,
      caloriesMin: source.caloriesMin,
      caloriesTarget: source.caloriesTarget,
      caloriesMax: source.caloriesMax,
      proteinMin: source.proteinMin,
      proteinTarget: source.proteinTarget,
      proteinMax: source.proteinMax,
      carbsMin: source.carbsMin,
      carbsTarget: source.carbsTarget,
      carbsMax: source.carbsMax,
      fatMin: source.fatMin,
      fatTarget: source.fatTarget,
      fatMax: source.fatMax,
      fiberMin: source.fiberMin,
      fiberMax: source.fiberMax,
      waterMinMl: source.waterMinMl,
      waterMaxMl: source.waterMaxMl,
      creatineTargetG: source.creatineTargetG,
      wheyTargetG: source.wheyTargetG,
      notes: source.notes,
    },
  });

  for (const meal of source.meals) {
    await prisma.planMeal.create({
      data: {
        planId: newPlan.id,
        mealType: meal.mealType,
        name: meal.name,
        order: meal.order,
        isProtectedComposition: meal.isProtectedComposition,
        isRequired: meal.isRequired,
        isConsumable: meal.isConsumable,
        isAdjustable: meal.isAdjustable,
        items: {
          create: meal.items.map((item) => ({
            foodId: item.foodId,
            targetQuantityG: item.targetQuantityG,
            minQuantityG: item.minQuantityG,
            maxQuantityG: item.maxQuantityG,
            adjustmentStepG: item.adjustmentStepG,
            role: item.role,
            isMandatory: item.isMandatory,
          })),
        },
      },
    });
  }

  revalidatePath("/settings/plans");
  redirect(`/settings/plans/${newPlan.id}`);
}

export async function updatePlanTargetsAction(
  planId: string,
  _prev: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const userId = await requireUserId();
  const parsed = parsePlanTargetsFormData(formData);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  await prisma.nutritionPlan.updateMany({
    where: { id: planId, userId },
    data: {
      name: parsed.data.name,
      startDate: toDateOnly(parsed.data.startDate),
      endDate: toDateOnly(parsed.data.endDate),
      caloriesMin: parsed.data.calories.min,
      caloriesTarget: parsed.data.calories.target,
      caloriesMax: parsed.data.calories.max,
      proteinMin: parsed.data.protein.min,
      proteinTarget: parsed.data.protein.target,
      proteinMax: parsed.data.protein.max,
      carbsMin: parsed.data.carbs.min,
      carbsTarget: parsed.data.carbs.target,
      carbsMax: parsed.data.carbs.max,
      fatMin: parsed.data.fat.min,
      fatTarget: parsed.data.fat.target,
      fatMax: parsed.data.fat.max,
      fiberMin: parsed.data.fiberMin,
      fiberMax: parsed.data.fiberMax,
      waterMinMl: parsed.data.waterMinMl,
      waterMaxMl: parsed.data.waterMaxMl,
      creatineTargetG: parsed.data.creatineTargetG,
      wheyTargetG: parsed.data.wheyTargetG,
      notes: parsed.data.notes,
    },
  });

  revalidatePath(`/settings/plans/${planId}`);
  revalidatePath("/settings/plans");
  revalidatePath("/plan");
  return {};
}

export async function setPlanActiveAction(planId: string, active: boolean): Promise<void> {
  const userId = await requireUserId();
  await prisma.nutritionPlan.updateMany({ where: { id: planId, userId }, data: { isActive: active } });
  revalidatePath("/settings/plans");
  revalidatePath("/plan");
  revalidatePath("/");
}

export async function updatePlanMealItemAction(itemId: string, formData: FormData): Promise<{ error?: string }> {
  const userId = await requireUserId();
  const parsed = parsePlanMealItemFormData(formData);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const owned = await itemBelongsToUser(itemId, userId);
  if (!owned) return { error: "Item nao encontrado." };

  await prisma.planMealItem.update({ where: { id: itemId }, data: parsed.data });
  revalidatePath("/settings/plans");
  return {};
}

export async function deletePlanMealItemAction(itemId: string): Promise<void> {
  const userId = await requireUserId();
  const owned = await itemBelongsToUser(itemId, userId);
  if (!owned) return;

  await prisma.planMealItem.delete({ where: { id: itemId } });
  revalidatePath("/settings/plans");
}

export async function addPlanMealItemAction(planMealId: string, formData: FormData): Promise<{ error?: string }> {
  const userId = await requireUserId();
  const parsed = parseNewPlanMealItemFormData(formData);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const owned = await mealBelongsToUser(planMealId, userId);
  if (!owned) return { error: "Refeicao nao encontrada." };

  await prisma.planMealItem.create({ data: { planMealId, ...parsed.data } });
  revalidatePath("/settings/plans");
  return {};
}

export async function addPlanMealAction(planId: string, formData: FormData): Promise<{ error?: string }> {
  const userId = await requireUserId();
  const parsed = parseNewPlanMealFormData(formData);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const plan = await prisma.nutritionPlan.findFirst({ where: { id: planId, userId } });
  if (!plan) return { error: "Plano nao encontrado." };

  await prisma.planMeal.create({ data: { planId, ...parsed.data } });
  revalidatePath("/settings/plans");
  return {};
}

export async function deletePlanMealAction(planMealId: string): Promise<void> {
  const userId = await requireUserId();
  const owned = await mealBelongsToUser(planMealId, userId);
  if (!owned) return;

  await prisma.planMeal.delete({ where: { id: planMealId } }); // cascades to items
  revalidatePath("/settings/plans");
}

async function mealBelongsToUser(planMealId: string, userId: string): Promise<boolean> {
  const meal = await prisma.planMeal.findFirst({ where: { id: planMealId, plan: { userId } }, select: { id: true } });
  return meal !== null;
}

async function itemBelongsToUser(itemId: string, userId: string): Promise<boolean> {
  const item = await prisma.planMealItem.findFirst({
    where: { id: itemId, planMeal: { plan: { userId } } },
    select: { id: true },
  });
  return item !== null;
}

function firstIssue(error: ZodError): string {
  return error.issues[0]?.message ?? "Dados invalidos.";
}
