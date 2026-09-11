"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/database/prisma";
import { requireUserId } from "@/lib/auth";
import { processUserMessage, type ProcessMessageResult } from "@/lib/services/processMessage";
import { recalculateDay } from "@/lib/services/recalculateDay";
import { toDateOnly } from "@/lib/services/dateOnly";
import { calculateFoodNutrition } from "@/lib/nutrition/engine";

export interface SubmitMessageState {
  result?: ProcessMessageResult;
  error?: string;
}

export async function submitMessageAction(message: string): Promise<SubmitMessageState> {
  const userId = await requireUserId();
  if (!message || message.trim().length === 0) {
    return { error: "Escreva algo sobre o que voce comeu ou fez hoje." };
  }
  try {
    const result = await processUserMessage(userId, message.trim());
    revalidatePath("/");
    revalidatePath("/history");
    return { result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erro ao processar mensagem." };
  }
}

/** Edits an existing meal entry's quantity and recalculates the day + future meals. Never touches other entries. */
export async function editMealEntryAction(entryId: string, newQuantity: number): Promise<void> {
  const userId = await requireUserId();
  const entry = await prisma.mealEntry.findFirst({ where: { id: entryId, userId }, include: { food: true } });
  if (!entry) throw new Error("Registro nao encontrado");

  if (!entry.food) {
    await prisma.mealEntry.update({ where: { id: entryId }, data: { quantity: newQuantity } });
  } else {
    const gramsPerUnit = entry.grams / entry.quantity;
    const newGrams = entry.unit === "g" || entry.unit === "ml" ? newQuantity : newQuantity * gramsPerUnit;
    const nutrition = calculateFoodNutrition(newGrams, {
      caloriesPer100g: entry.food.caloriesPer100g,
      proteinPer100g: entry.food.proteinPer100g,
      carbsPer100g: entry.food.carbsPer100g,
      fatPer100g: entry.food.fatPer100g,
      fiberPer100g: entry.food.fiberPer100g,
    });
    await prisma.mealEntry.update({
      where: { id: entryId },
      data: { quantity: newQuantity, grams: newGrams, ...nutrition },
    });
  }

  await recalculateDay(userId, entry.date, {
    triggerAdjustment: true,
    adjustmentReason: `Edicao de item registrado: ${entry.foodId ? entry.food?.name : entry.freeTextDescription}`,
    triggerMealEntryId: entryId,
  });
  revalidatePath("/");
  revalidatePath("/history");
}

export async function deleteMealEntryAction(entryId: string): Promise<void> {
  const userId = await requireUserId();
  const entry = await prisma.mealEntry.findFirst({ where: { id: entryId, userId } });
  if (!entry) throw new Error("Registro nao encontrado");

  await prisma.mealEntry.delete({ where: { id: entryId } });
  await recalculateDay(userId, entry.date, {
    triggerAdjustment: true,
    adjustmentReason: "Item excluido pelo usuario",
  });
  revalidatePath("/");
  revalidatePath("/history");
}

export async function duplicateMealEntryAction(entryId: string): Promise<void> {
  const userId = await requireUserId();
  const entry = await prisma.mealEntry.findFirst({ where: { id: entryId, userId } });
  if (!entry) throw new Error("Registro nao encontrado");

  await prisma.mealEntry.create({
    data: {
      userId,
      date: entry.date,
      mealType: entry.mealType,
      foodId: entry.foodId,
      freeTextDescription: entry.freeTextDescription,
      quantity: entry.quantity,
      unit: entry.unit,
      grams: entry.grams,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      fiber: entry.fiber,
      source: "user",
      isEstimated: entry.isEstimated,
      notes: entry.notes,
    },
  });
  await recalculateDay(userId, entry.date, { triggerAdjustment: true, adjustmentReason: "Item duplicado" });
  revalidatePath("/");
  revalidatePath("/history");
}

export async function duplicateActivityAction(activityId: string): Promise<void> {
  const userId = await requireUserId();
  const activity = await prisma.physicalActivity.findFirst({ where: { id: activityId, userId } });
  if (!activity) throw new Error("Atividade nao encontrada");

  await prisma.physicalActivity.create({
    data: {
      userId,
      date: activity.date,
      activityType: activity.activityType,
      description: activity.description,
      durationMinutes: activity.durationMinutes,
      steps: activity.steps,
      caloriesBurned: activity.caloriesBurned,
      caloriesSource: activity.caloriesSource,
      intensity: activity.intensity,
      distanceKm: activity.distanceKm,
      notes: activity.notes,
    },
  });
  await recalculateDay(userId, activity.date, { triggerAdjustment: false });
  revalidatePath("/");
  revalidatePath("/history");
}

export async function deleteActivityAction(activityId: string): Promise<void> {
  const userId = await requireUserId();
  const activity = await prisma.physicalActivity.findFirst({ where: { id: activityId, userId } });
  if (!activity) throw new Error("Atividade nao encontrada");
  await prisma.physicalActivity.delete({ where: { id: activityId } });
  await recalculateDay(userId, activity.date, { triggerAdjustment: false });
  revalidatePath("/");
  revalidatePath("/history");
}

export async function markActivityExcludedAction(activityId: string, includedInActivityTotal: boolean): Promise<void> {
  const userId = await requireUserId();
  const activity = await prisma.physicalActivity.findFirst({ where: { id: activityId, userId } });
  if (!activity) throw new Error("Atividade nao encontrada");
  await prisma.physicalActivity.update({ where: { id: activityId }, data: { includedInActivityTotal } });
  await recalculateDay(userId, activity.date, { triggerAdjustment: false });
  revalidatePath("/");
  revalidatePath("/history");
}

export async function addWeightEntryAction(
  dateStr: string,
  weightKg: number,
  measurementCondition?: string,
  time?: string,
  notes?: string,
): Promise<void> {
  const userId = await requireUserId();
  const date = toDateOnly(dateStr);
  await prisma.weightEntry.create({ data: { userId, date, weightKg, measurementCondition, time, notes } });
  await recalculateDay(userId, date, { triggerAdjustment: false });
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/progress");
}

export async function addWaterEntryAction(dateStr: string, amountMl: number): Promise<void> {
  const userId = await requireUserId();
  const date = toDateOnly(dateStr);
  await prisma.waterEntry.create({ data: { userId, date, amountMl } });
  await recalculateDay(userId, date, { triggerAdjustment: false });
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/progress");
}

export async function setSupplementTakenAction(dateStr: string, type: "whey" | "creatine", taken: boolean, targetGrams: number): Promise<void> {
  const userId = await requireUserId();
  const date = toDateOnly(dateStr);
  await prisma.supplementEntry.upsert({
    where: { userId_date_type: { userId, date, type } },
    update: { taken, takenGrams: taken ? targetGrams : null },
    create: { userId, date, type, targetGrams, taken, takenGrams: taken ? targetGrams : null },
  });
  revalidatePath("/");
}
