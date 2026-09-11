import { normalize } from "@/lib/ai/textUtils";
import type { AdjustableMeal } from "@/lib/adjustment/engine";

/**
 * The permanent structure of Daniel's shake (spec: "regra permanente do
 * shake"). Every component below must be present, mandatory, and above
 * zero grams in any plan meal flagged `isProtectedComposition` — the
 * adjustment engine may resize quantities but must never drop a component
 * or zero it out. Matched by food-name hint rather than Food.category
 * because category alone can't distinguish "whey" from "creatina" (both
 * "supplement") or "aveia" from other carb sources.
 */
export const MANDATORY_SHAKE_COMPONENTS = [
  { component: "whey", label: "Whey", nameHints: ["whey"] },
  { component: "fruit", label: "Fruta", nameHints: ["banana", "polpa", "fruta"] },
  { component: "milk", label: "Leite desnatado", nameHints: ["leite desnatado", "leite"] },
  { component: "oats", label: "Aveia", nameHints: ["aveia"] },
  { component: "nuts", label: "Castanhas", nameHints: ["castanha"] },
  { component: "creatine", label: "Creatina", nameHints: ["creatina"] },
] as const;

export type ShakeComponent = (typeof MANDATORY_SHAKE_COMPONENTS)[number]["component"];

export interface ShakeCompositionCheck {
  valid: boolean;
  missingComponents: string[]; // labels, e.g. ["Whey", "Creatina"]
}

/**
 * Validates that a protected-composition meal (the shake) still contains
 * every mandatory component, each above zero grams. Used both as a unit
 * -testable business rule and as a defense-in-depth check the adjustment
 * engine runs on its own output.
 */
export function validateShakeComposition(meal: AdjustableMeal): ShakeCompositionCheck {
  const missingComponents: string[] = [];

  for (const { label, nameHints } of MANDATORY_SHAKE_COMPONENTS) {
    const item = meal.items.find((i) => {
      const name = normalize(i.foodName);
      return nameHints.some((hint) => name.includes(hint));
    });
    if (!item || !item.isMandatory || item.currentGrams <= 0) {
      missingComponents.push(label);
    }
  }

  return { valid: missingComponents.length === 0, missingComponents };
}
