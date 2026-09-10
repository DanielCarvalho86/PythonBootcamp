import type {
  ActivityType,
  FoodUnit,
  MealType,
  ParsedActivity,
  ParsedFoodItem,
  ParsedMeal,
  ParsedMessage,
} from "@/types/domain";
import { normalize, parseCalories, parseDurationMinutes, parseNumber } from "@/lib/ai/textUtils";

/**
 * Deterministic, regex/keyword-based natural language parser.
 *
 * This is the default parser (and the only one used in tests) so the app
 * works with zero external dependencies, and is also the fallback the
 * Claude-backed parser (src/lib/ai/claudeParser.ts) falls back to if the
 * API is unavailable or returns something that fails validation. It only
 * covers the message patterns described in the product spec (section 51);
 * anything it can't confidently parse comes back with
 * `needsClarification` set instead of a guess.
 *
 * Per spec section 2, this module — like the Claude-backed one — never
 * computes calories or macros. It only extracts {food, quantity, unit}.
 */

const MEAL_KEYWORDS: Record<string, MealType> = {
  "cafe da manha": "breakfast",
  cafe: "breakfast",
  "lanche da manha": "morning_snack",
  "lanche da tarde": "afternoon_snack",
  lanche: "afternoon_snack",
  almoco: "lunch",
  jantar: "dinner",
  ceia: "supper",
  shake: "other",
};

const ACTIVITY_KEYWORDS: { pattern: RegExp; type: ActivityType }[] = [
  { pattern: /musculac/i, type: "weight_training" },
  { pattern: /nad(ei|ou|ar)|natacao/i, type: "swimming" },
  { pattern: /caminh/i, type: "walking" },
  { pattern: /corr(i|eu|er)|corrida/i, type: "running" },
  { pattern: /pedal|bicicleta|ciclismo/i, type: "cycling" },
  { pattern: /cardio/i, type: "cardio" },
  { pattern: /futebol|joguei|jogo de|volei|basquete|tenis/i, type: "sports" },
];

const UNIT_WORDS: Record<string, FoodUnit> = {
  g: "g",
  grama: "g",
  gramas: "g",
  kg: "g", // scaled below
  ml: "ml",
  l: "ml", // scaled below
  litro: "ml",
  litros: "ml",
  unidade: "unit",
  unidades: "unit",
  fatia: "slice",
  fatias: "slice",
  colher: "tbsp",
  colheres: "tbsp",
  xicara: "cup",
  xicaras: "cup",
};

function detectMealType(segment: string): MealType | null {
  const n = normalize(segment);
  for (const [keyword, mealType] of Object.entries(MEAL_KEYWORDS)) {
    if (n.includes(keyword)) return mealType;
  }
  return null;
}

/** Splits a food list like "200g de frango, 150g de cuscuz e 10g de azeite" into items. */
function splitFoodItems(segment: string): string[] {
  return segment
    .split(/,| e (?=\d)| e (?=um |uma |1 )/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseFoodItem(raw: string): ParsedFoodItem | null {
  const text = raw.trim();

  // "200g de frango" / "200 g de frango" / "76g de pão francês"
  let match = text.match(/^(\d+[.,]?\d*)\s*(kg|g|ml|l)\s+de\s+(.+)$/i);
  if (match) {
    const qty = parseNumber(match[1]);
    const unitWord = normalize(match[2]);
    const isKiloish = unitWord === "kg" || unitWord === "l";
    return {
      food: match[3].trim(),
      quantity: isKiloish ? qty * 1000 : qty,
      unit: UNIT_WORDS[unitWord] ?? "g",
    };
  }

  // "2 ovos" / "1 pão francês" / "15 g de leite em pó" already covered; this
  // covers "2 unidades de X" / plain "1 pão francês" (implicit unit count).
  match = text.match(/^(\d+[.,]?\d*)\s*(unidades?|fatias?|colheres?(?:\s+de\s+sopa)?|xicaras?)\s+de\s+(.+)$/i);
  if (match) {
    const qty = parseNumber(match[1]);
    const unitWord = normalize(match[2]).split(" ")[0];
    return { food: match[3].trim(), quantity: qty, unit: UNIT_WORDS[unitWord] ?? "unit" };
  }

  // "2 ovos", "1 pão francês" — leading count with no explicit unit word,
  // the count itself is the "unit" quantity (unit = "unit").
  match = text.match(/^(\d+[.,]?\d*)\s+(.+)$/);
  if (match) {
    const qty = parseNumber(match[1]);
    return { food: match[2].trim(), quantity: qty, unit: "unit" };
  }

  // No quantity found at all — can't safely register this item.
  return null;
}

function parseMealSegment(segment: string): { meal: ParsedMeal | null; unmatched: string[] } {
  const mealType = detectMealType(segment) ?? "other";
  // Strip leading meal-name phrases like "No almoço comi" / "Comi no café da manhã"
  const withoutVerb = segment.replace(/^(hoje\s+)?(no|na)?\s*(cafe( da manha)?|almoco|jantar|lanche( da (manha|tarde))?|ceia)?\s*(,)?\s*(eu\s+)?(comi|tomei|almocei|jantei)\s*/i, "").trim();
  const itemsText = withoutVerb.length > 0 ? withoutVerb : segment;
  const rawItems = splitFoodItems(itemsText);
  const items: ParsedFoodItem[] = [];
  const unmatched: string[] = [];

  for (const raw of rawItems) {
    const item = parseFoodItem(raw);
    if (item) items.push(item);
    else if (raw.trim().length > 0) unmatched.push(raw.trim());
  }

  if (items.length === 0) return { meal: null, unmatched };
  return { meal: { mealType, items }, unmatched };
}

function parseActivitySegment(segment: string): ParsedActivity | null {
  const activityMatch = ACTIVITY_KEYWORDS.find((k) => k.pattern.test(segment));
  if (!activityMatch) return null;

  const durationMinutes = parseDurationMinutes(segment) ?? undefined;
  const caloriesBurned = parseCalories(segment) ?? undefined;

  return {
    activityType: activityMatch.type,
    durationMinutes,
    caloriesBurned,
    caloriesSource: caloriesBurned !== undefined ? "user" : "estimated",
    description: segment.trim(),
  };
}

function parseStepsSegment(segment: string): { steps?: number; stepsCalories?: number } | null {
  const n = normalize(segment);
  const stepsMatch = n.match(/(\d[\d.,]*)\s*passos/);
  if (!stepsMatch) return null;
  const steps = Math.round(parseNumber(stepsMatch[1]));
  const stepsCalories = parseCalories(segment) ?? undefined;
  return { steps, stepsCalories };
}

function parseWeightSegment(segment: string): number | null {
  const n = normalize(segment);
  if (!n.includes("peso")) return null;
  const match = n.match(/(\d+[.,]?\d*)\s*kg/);
  if (!match) return null;
  return parseNumber(match[1]);
}

function parseWaterSegment(segment: string): number | null {
  const n = normalize(segment);
  if (!/(bebi|agua)/.test(n)) return null;
  const mlMatch = n.match(/(\d+[.,]?\d*)\s*ml/);
  if (mlMatch) return parseNumber(mlMatch[1]);
  const lMatch = n.match(/(\d+[.,]?\d*)\s*(l|litros?)\b/);
  if (lMatch) return parseNumber(lMatch[1]) * 1000;
  return null;
}

export interface RuleBasedParseOptions {
  today: string; // yyyy-MM-dd, used as the default date
}

export function parseMessageRuleBased(message: string, options: RuleBasedParseOptions): ParsedMessage {
  // Splits on sentence-ending punctuation, but NOT on a "." that sits
  // inside a pt-BR thousands-separated number like "8.500" (the lookahead
  // fails to match there because the next character is a digit).
  const segments = message
    .split(/\.(?!\d)|\n|;/)
    .map((s) => s.trim())
    .filter(Boolean);

  const meals: ParsedMeal[] = [];
  const activities: ParsedActivity[] = [];
  let steps: number | undefined;
  let stepsCalories: number | undefined;
  let weightKg: number | undefined;
  let waterMl: number | undefined;
  const unmatchedFragments: string[] = [];

  for (const segment of segments) {
    const n = normalize(segment);

    const weight = parseWeightSegment(segment);
    if (weight !== null) {
      weightKg = weight;
      continue;
    }

    const water = parseWaterSegment(segment);
    if (water !== null) {
      waterMl = (waterMl ?? 0) + water;
      continue;
    }

    const stepsResult = parseStepsSegment(segment);
    if (stepsResult) {
      steps = (steps ?? 0) + (stepsResult.steps ?? 0);
      if (stepsResult.stepsCalories !== undefined) {
        stepsCalories = (stepsCalories ?? 0) + stepsResult.stepsCalories;
      }
      continue;
    }

    const activity = parseActivitySegment(segment);
    if (activity) {
      activities.push(activity);
      continue;
    }

    const hasFoodVerb = /(comi|tomei|almocei|jantei|cafe da manha|lanche)/i.test(n);
    const hasQuantity = /\d/.test(segment);
    if (hasFoodVerb || (hasQuantity && /\bde\b/i.test(segment))) {
      const { meal, unmatched } = parseMealSegment(segment);
      if (meal) meals.push(meal);
      unmatchedFragments.push(...unmatched);
      if (meal) continue;
    }

    if (segment.length > 0) unmatchedFragments.push(segment);
  }

  const needsClarification =
    unmatchedFragments.length > 0
      ? `Não consegui identificar com confiança: "${unmatchedFragments.join("; ")}". Pode detalhar quantidade e alimento/atividade?`
      : undefined;

  return {
    date: options.today,
    meals,
    activities,
    steps,
    stepsCalories,
    stepsIsEstimated: steps !== undefined && stepsCalories === undefined,
    weight: weightKg !== undefined ? { weightKg } : undefined,
    waterMl,
    needsClarification,
  };
}
