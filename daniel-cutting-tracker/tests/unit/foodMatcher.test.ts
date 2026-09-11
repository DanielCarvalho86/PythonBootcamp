import { describe, expect, it } from "vitest";
import { matchFood, type MatchableFood } from "@/lib/nutrition/foodMatcher";

const FOODS: MatchableFood[] = [
  { id: "1", name: "Frango peito grelhado", category: "protein" },
  { id: "2", name: "Tilapia grelhada", category: "protein" },
  { id: "3", name: "Leite em po integral", category: "dairy" },
  { id: "4", name: "Pao frances", category: "carb" },
];

describe("matchFood", () => {
  it("matches exactly on a normalized name", () => {
    const match = matchFood("Tilapia grelhada", FOODS);
    expect(match?.food.id).toBe("2");
    expect(match?.isExactMatch).toBe(true);
  });

  it("matches accent/case-insensitively and via substring", () => {
    const match = matchFood("frango", FOODS);
    expect(match?.food.id).toBe("1");
    expect(match?.isExactMatch).toBe(false);
  });

  it("matches via token overlap for multi-word phrases", () => {
    const match = matchFood("leite em po", FOODS);
    expect(match?.food.id).toBe("3");
  });

  // TEST18: alimento desconhecido
  it("returns null for a food not present in the database", () => {
    const match = matchFood("salmao", FOODS);
    expect(match).toBeNull();
  });
});
