// Default food adjustment priorities (spec sections 23 & 25). These are
// preference orders, not hard rules: the adjustment engine still obeys
// each item's own min/max/step bounds regardless of where it falls here.
// Configurable per user/plan in the future — kept as plain data so it's
// easy to override.

export const DEFAULT_PROTEIN_INCREASE_PRIORITY = [
  "frango",
  "tilapia",
  "tilápia",
  "carne magra",
  "patinho",
  "carne moida",
  "carne moída",
  "ovo",
  "whey",
];

export const DEFAULT_CARB_DECREASE_PRIORITY = [
  "arroz",
  "cuscuz",
  "pao",
  "pão",
  "aveia",
  "fruta",
  "banana",
  "macaxeira",
  "inhame",
  "batata",
];

export const DEFAULT_FAT_DECREASE_PRIORITY = [
  "azeite",
  "castanha",
  "queijo",
  "maionese",
  "pasta de amendoim",
  "abacate",
];

/**
 * Lower score = adjust first. Foods not present in the list sort last
 * (but are still eligible) so unlisted items are only touched once every
 * preferred food has already been moved to its bound.
 */
export function priorityScore(foodName: string, priorityList: string[]): number {
  const normalized = foodName.toLowerCase();
  const index = priorityList.findIndex((p) => normalized.includes(p));
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}
