import type { FoodNutritionFacts, FoodRole, MealType, NutrientTotals } from "@/types/domain";
import { calculateFoodNutrition, round2, sumNutrients } from "@/lib/nutrition/engine";
import {
  DEFAULT_CARB_DECREASE_PRIORITY,
  DEFAULT_FAT_DECREASE_PRIORITY,
  DEFAULT_PROTEIN_INCREASE_PRIORITY,
  priorityScore,
} from "@/lib/adjustment/priorities";
import { validateShakeComposition } from "@/lib/adjustment/shakeRules";

/**
 * The "least change" adjustment engine (spec sections 22-27, 42-43).
 *
 * Design: rather than a general-purpose LP solver, this is a deterministic
 * greedy stepper. On every iteration it finds the single most urgent
 * nutrient gap (protein deficit first, then carb/fat/calorie excess, then
 * calorie deficit), picks the highest-priority eligible food item that can
 * move in the needed direction without breaching its configured min/max,
 * and nudges it by exactly one `adjustmentStepG`. This naturally minimizes
 * the number and size of changes (it stops the moment targets are within
 * tolerance) while respecting every hard constraint from the plan.
 *
 * Consumed/past meals are never passed into this function — only meals
 * that have not been eaten yet — so "never modify past meals" is enforced
 * structurally by the caller, not by logic in here.
 */

export interface AdjustableItem {
  id: string;
  foodId: string;
  foodName: string;
  facts: FoodNutritionFacts;
  currentGrams: number;
  minGrams: number;
  maxGrams: number;
  stepGrams: number;
  role: FoodRole;
  isMandatory: boolean;
}

export interface AdjustableMeal {
  id: string;
  mealType: MealType;
  name: string;
  isProtectedComposition: boolean;
  // When false, this meal's nutrition still counts toward the day's
  // future totals, but the optimizer will never touch its item quantities
  // (e.g. a locked/manual meal slot). Defaults true for ordinary meals.
  isAdjustable: boolean;
  items: AdjustableItem[];
}

export interface PlanTargets {
  caloriesMin: number;
  caloriesTarget: number;
  caloriesMax: number;
  proteinMin: number;
  proteinTarget: number;
  proteinMax: number;
  carbsMin: number;
  carbsTarget: number;
  carbsMax: number;
  fatMin: number;
  fatTarget: number;
  fatMax: number;
  fiberMin: number;
}

export interface AdjustmentChange {
  mealId: string;
  mealName: string;
  itemId: string;
  foodName: string;
  beforeGrams: number;
  afterGrams: number;
}

export interface AdjustmentResult {
  adjustedFutureMeals: AdjustableMeal[];
  futureTotalsBefore: NutrientTotals;
  futureTotalsAfter: NutrientTotals;
  remainingBeforeAdjustment: NutrientTotals;
  projectedDayTotals: NutrientTotals; // consumed + adjustedFutureTotals
  changes: AdjustmentChange[];
  reasons: string[];
  warnings: string[];
  dayStatus: "on_track" | "above_target" | "below_target";
}

const TOLERANCE = {
  calories: 30,
  protein: 3,
  carbs: 5,
  fat: 3,
};

const MAX_ITERATIONS = 500;

type Direction = "increase" | "decrease";
type Nutrient = "protein" | "carbs" | "fat" | "calories";

function itemNutrition(item: AdjustableItem): NutrientTotals {
  return calculateFoodNutrition(item.currentGrams, item.facts);
}

function mealTotals(meal: AdjustableMeal): NutrientTotals {
  return meal.items.reduce<NutrientTotals>(
    (sum, item) => sumNutrients(sum, itemNutrition(item)),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

function futureTotals(meals: AdjustableMeal[]): NutrientTotals {
  return meals.reduce<NutrientTotals>(
    (sum, meal) => sumNutrients(sum, mealTotals(meal)),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

interface Candidate {
  meal: AdjustableMeal;
  item: AdjustableItem;
  score: number;
}

function eligibleCandidates(
  meals: AdjustableMeal[],
  role: FoodRole,
  direction: Direction,
  priorityList: string[],
): Candidate[] {
  const candidates: Candidate[] = [];
  for (const meal of meals) {
    if (!meal.isAdjustable) continue;
    for (const item of meal.items) {
      if (item.role !== role) continue;
      if (direction === "increase" && item.currentGrams >= item.maxGrams) continue;
      if (direction === "decrease" && item.currentGrams <= item.minGrams) continue;
      candidates.push({ meal, item, score: priorityScore(item.foodName, priorityList) });
    }
  }
  candidates.sort((a, b) => a.score - b.score);
  return candidates;
}

function applyStep(item: AdjustableItem, direction: Direction): number {
  const before = item.currentGrams;
  const delta = direction === "increase" ? item.stepGrams : -item.stepGrams;
  let after = round2(before + delta);
  after = Math.min(item.maxGrams, Math.max(item.minGrams, after));
  item.currentGrams = after;
  return after;
}

/**
 * Ranks the nutrient/direction actions worth trying this iteration,
 * following spec section 25's ordering: protein deficit always wins
 * (never sacrificed to fix carbs/fat), then carb excess, then fat excess,
 * then calorie excess, then calorie deficit (plan needs more food, tried
 * via carbs first and fat as a fallback), then fat deficit. The caller
 * tries each ranked action in order until one has an eligible food item.
 */
function rankActions(remaining: NutrientTotals): { nutrient: Nutrient; direction: Direction }[] {
  const actions: { nutrient: Nutrient; direction: Direction }[] = [];
  if (remaining.protein > TOLERANCE.protein) actions.push({ nutrient: "protein", direction: "increase" });
  if (remaining.carbs < -TOLERANCE.carbs) actions.push({ nutrient: "carbs", direction: "decrease" });
  if (remaining.fat < -TOLERANCE.fat) actions.push({ nutrient: "fat", direction: "decrease" });
  if (remaining.calories < -TOLERANCE.calories) {
    actions.push({ nutrient: "carbs", direction: "decrease" }, { nutrient: "fat", direction: "decrease" });
  }
  if (remaining.calories > TOLERANCE.calories) {
    actions.push({ nutrient: "carbs", direction: "increase" }, { nutrient: "fat", direction: "increase" });
  }
  if (remaining.fat > TOLERANCE.fat) actions.push({ nutrient: "fat", direction: "increase" });
  // Never reduce protein to fix an excess elsewhere — intentionally no
  // action is generated for `remaining.protein < -TOLERANCE.protein`.
  return actions;
}

function priorityListFor(role: FoodRole, direction: Direction): string[] {
  if (role === "protein") return DEFAULT_PROTEIN_INCREASE_PRIORITY;
  if (role === "carb") return direction === "decrease" ? DEFAULT_CARB_DECREASE_PRIORITY : [...DEFAULT_CARB_DECREASE_PRIORITY].reverse();
  return DEFAULT_FAT_DECREASE_PRIORITY;
}

export function adjustRemainingMeals(input: {
  targets: PlanTargets;
  consumedNutrition: NutrientTotals;
  futureMeals: AdjustableMeal[];
}): AdjustmentResult {
  // Deep-clone so we never mutate the caller's objects while stepping.
  const meals: AdjustableMeal[] = input.futureMeals.map((m) => ({
    ...m,
    items: m.items.map((i) => ({ ...i })),
  }));

  const before = futureTotals(meals);
  const changes: AdjustmentChange[] = [];
  const reasons: string[] = [];
  const warnings: string[] = [];

  const dayStatus: AdjustmentResult["dayStatus"] =
    input.consumedNutrition.calories > input.targets.caloriesMax
      ? "above_target"
      : input.consumedNutrition.calories < input.targets.caloriesMin && meals.length === 0
        ? "below_target"
        : "on_track";

  if (dayStatus === "above_target") {
    warnings.push(
      "Seu consumo até agora já está acima da meta planejada. Vou preservar as próximas refeições de forma adequada e mostrar onde o dia ficará.",
    );
  }

  const remainingBeforeAdjustment: NutrientTotals = {
    calories: round2(input.targets.caloriesTarget - input.consumedNutrition.calories),
    protein: round2(input.targets.proteinTarget - input.consumedNutrition.protein),
    carbs: round2(input.targets.carbsTarget - input.consumedNutrition.carbs),
    fat: round2(input.targets.fatTarget - input.consumedNutrition.fat),
    fiber: round2(input.targets.fiberMin - input.consumedNutrition.fiber),
  };

  let iterations = 0;
  while (iterations < MAX_ITERATIONS) {
    iterations += 1;
    const currentFuture = futureTotals(meals);
    const remainingVsFuturePlan: NutrientTotals = {
      calories: round2(remainingBeforeAdjustment.calories - currentFuture.calories),
      protein: round2(remainingBeforeAdjustment.protein - currentFuture.protein),
      carbs: round2(remainingBeforeAdjustment.carbs - currentFuture.carbs),
      fat: round2(remainingBeforeAdjustment.fat - currentFuture.fat),
      fiber: 0,
    };

    const rankedActions = rankActions(remainingVsFuturePlan);
    if (rankedActions.length === 0) break;

    let chosen: { meal: AdjustableMeal; item: AdjustableItem } | null = null;
    let chosenDirection: Direction = "increase";
    let unmetNutrient: Nutrient | null = null;
    for (const action of rankedActions) {
      const role: FoodRole = action.nutrient === "protein" ? "protein" : action.nutrient === "fat" ? "fat" : "carb";
      const priorityList = priorityListFor(role, action.direction);
      const candidates = eligibleCandidates(meals, role, action.direction, priorityList);
      if (candidates.length > 0) {
        chosen = candidates[0];
        chosenDirection = action.direction;
        break;
      }
      unmetNutrient = action.nutrient;
    }

    if (!chosen) {
      if (unmetNutrient) {
        warnings.push(
          `Não foi possível ajustar totalmente ${translateNutrient(unmetNutrient)} dentro dos limites configurados para os alimentos restantes do dia.`,
        );
      }
      break;
    }

    const { meal, item } = chosen;
    const beforeGrams = item.currentGrams;
    const afterGrams = applyStep(item, chosenDirection);

    if (afterGrams === beforeGrams) {
      // Hit its bound exactly on this pick; remove viability by looping —
      // guard against infinite loop by breaking if nothing changed.
      continue;
    }

    const existingChange = changes.find((c) => c.itemId === item.id);
    if (existingChange) {
      existingChange.afterGrams = afterGrams;
    } else {
      changes.push({
        mealId: meal.id,
        mealName: meal.name,
        itemId: item.id,
        foodName: item.foodName,
        beforeGrams,
        afterGrams,
      });
    }
  }

  if (changes.length === 0) {
    reasons.push("O plano restante do dia já está dentro da meta — nenhum ajuste foi necessário.");
  } else {
    for (const change of changes) {
      const verb = change.afterGrams > change.beforeGrams ? "aumentada" : "reduzida";
      reasons.push(
        `${change.foodName} em ${change.mealName}: ${verb} de ${change.beforeGrams}g para ${change.afterGrams}g.`,
      );
    }
  }

  // Defense-in-depth: the shake's mandatory components should structurally
  // never be droppable (isMandatory + minGrams > 0 already guarantee it),
  // but this check exists so a future bug in the stepping loop above shows
  // up as a warning instead of silently shipping a broken shake.
  for (const meal of meals) {
    if (!meal.isProtectedComposition) continue;
    const check = validateShakeComposition(meal);
    if (!check.valid) {
      warnings.push(
        `Atencao: a composicao obrigatoria do shake (${meal.name}) esta incompleta — faltando: ${check.missingComponents.join(", ")}.`,
      );
    }
  }

  const after = futureTotals(meals);
  const projectedDayTotals = sumNutrients(input.consumedNutrition, after);

  return {
    adjustedFutureMeals: meals,
    futureTotalsBefore: before,
    futureTotalsAfter: after,
    remainingBeforeAdjustment,
    projectedDayTotals,
    changes,
    reasons,
    warnings,
    dayStatus,
  };
}

function translateNutrient(n: Nutrient): string {
  switch (n) {
    case "protein":
      return "a proteína";
    case "carbs":
      return "os carboidratos";
    case "fat":
      return "a gordura";
    case "calories":
      return "as calorias";
  }
}
