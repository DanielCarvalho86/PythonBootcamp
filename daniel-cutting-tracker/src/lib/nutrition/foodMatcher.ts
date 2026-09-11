import { normalize } from "@/lib/ai/textUtils";

export interface MatchableFood {
  id: string;
  name: string;
  category: string;
}

export interface FoodMatch {
  food: MatchableFood;
  isExactMatch: boolean;
}

/** Very naive pt-BR singularizer (strips a trailing "s") so "ovos" matches
 * a "Ovo" food row. Only applied to words long enough that this is safe
 * (avoids mangling short words like "gas"). Doesn't handle irregular
 * plurals (e.g. "pães" -> "pão") — those still fall back to substring/
 * token matching against the food's other name forms. */
function singularize(word: string): string {
  return word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word;
}

function singularizePhrase(phrase: string): string {
  return phrase.split(/\s+/).map(singularize).join(" ");
}

/**
 * Resolves a loosely-typed food name (as extracted by the AI/rule-based
 * parser, e.g. "frango" or "pao frances") against the Food database.
 * Deterministic and dependency-free so it's trivially unit-testable.
 * Returns null when nothing matches closely enough — callers must then
 * treat the item as unknown (spec section 29: ask for clarification /
 * flag as estimated) rather than silently guessing.
 */
export function matchFood(rawName: string, foods: MatchableFood[]): FoodMatch | null {
  const query = normalize(rawName);
  if (!query) return null;
  const querySingular = singularizePhrase(query);

  const exact = foods.find((f) => {
    const name = normalize(f.name);
    return name === query || name === querySingular || singularizePhrase(name) === querySingular;
  });
  if (exact) return { food: exact, isExactMatch: true };

  // Substring match in either direction, preferring the longest overlap.
  let best: { food: MatchableFood; score: number } | null = null;
  for (const food of foods) {
    const name = normalize(food.name);
    const nameSingular = singularizePhrase(name);
    if (name.includes(query) || query.includes(name) || nameSingular.includes(querySingular) || querySingular.includes(nameSingular)) {
      const score = Math.min(name.length, query.length);
      if (!best || score > best.score) best = { food, score };
    }
  }
  if (best) return { food: best.food, isExactMatch: false };

  // Token-overlap fallback: e.g. "leite em po" vs "leite em po integral".
  const queryTokens = new Set(querySingular.split(/\s+/).filter((t) => t.length > 2));
  let bestOverlap: { food: MatchableFood; overlap: number } | null = null;
  for (const food of foods) {
    const nameTokens = singularizePhrase(normalize(food.name))
      .split(/\s+/)
      .filter((t) => t.length > 2);
    const overlap = nameTokens.filter((t) => queryTokens.has(t)).length;
    if (overlap > 0 && (!bestOverlap || overlap > bestOverlap.overlap)) {
      bestOverlap = { food, overlap };
    }
  }
  if (bestOverlap) return { food: bestOverlap.food, isExactMatch: false };

  return null;
}
