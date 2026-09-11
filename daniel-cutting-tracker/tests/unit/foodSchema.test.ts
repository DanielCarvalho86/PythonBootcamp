import { describe, expect, it } from "vitest";
import { parseFoodFormData } from "@/lib/validation/foodSchema";

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("parseFoodFormData", () => {
  it("accepts a well-formed food submission", () => {
    const result = parseFoodFormData(
      formData({
        name: "Peito de frango",
        category: "protein",
        servingUnit: "g",
        caloriesPer100g: "159",
        proteinPer100g: "32",
        carbsPer100g: "0",
        fatPer100g: "2.5",
        fiberPer100g: "0",
      }),
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Peito de frango");
      expect(result.data.gramsPerUnit).toBeNull();
    }
  });

  it("rejects a missing name", () => {
    const result = parseFoodFormData(
      formData({ name: "", category: "protein", servingUnit: "g", caloriesPer100g: "100", proteinPer100g: "0", carbsPer100g: "0", fatPer100g: "0", fiberPer100g: "0" }),
    );
    expect(result.success).toBe(false);
  });

  it("parses gramsPerUnit when provided, null when blank", () => {
    const withUnit = parseFoodFormData(
      formData({ name: "Ovo", category: "protein", servingUnit: "unit", gramsPerUnit: "50", caloriesPer100g: "155", proteinPer100g: "13", carbsPer100g: "1.1", fatPer100g: "11", fiberPer100g: "0" }),
    );
    expect(withUnit.success && withUnit.data.gramsPerUnit).toBe(50);

    const blank = parseFoodFormData(
      formData({ name: "Arroz", category: "carb", servingUnit: "g", gramsPerUnit: "", caloriesPer100g: "128", proteinPer100g: "2.5", carbsPer100g: "28", fatPer100g: "0.2", fiberPer100g: "1.6" }),
    );
    expect(blank.success && blank.data.gramsPerUnit).toBeNull();
  });

  it("rejects an out-of-range macro value", () => {
    const result = parseFoodFormData(
      formData({ name: "X", category: "y", servingUnit: "g", caloriesPer100g: "100", proteinPer100g: "150", carbsPer100g: "0", fatPer100g: "0", fiberPer100g: "0" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects negative calories", () => {
    const result = parseFoodFormData(
      formData({ name: "X", category: "y", servingUnit: "g", caloriesPer100g: "-1", proteinPer100g: "0", carbsPer100g: "0", fatPer100g: "0", fiberPer100g: "0" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects negative protein", () => {
    const result = parseFoodFormData(
      formData({ name: "X", category: "y", servingUnit: "g", caloriesPer100g: "0", proteinPer100g: "-5", carbsPer100g: "0", fatPer100g: "0", fiberPer100g: "0" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects negative carbs", () => {
    const result = parseFoodFormData(
      formData({ name: "X", category: "y", servingUnit: "g", caloriesPer100g: "0", proteinPer100g: "0", carbsPer100g: "-1", fatPer100g: "0", fiberPer100g: "0" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects negative fat", () => {
    const result = parseFoodFormData(
      formData({ name: "X", category: "y", servingUnit: "g", caloriesPer100g: "0", proteinPer100g: "0", carbsPer100g: "0", fatPer100g: "-1", fiberPer100g: "0" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects negative fiber", () => {
    const result = parseFoodFormData(
      formData({ name: "X", category: "y", servingUnit: "g", caloriesPer100g: "0", proteinPer100g: "0", carbsPer100g: "0", fatPer100g: "0", fiberPer100g: "-1" }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects a negative gramsPerUnit", () => {
    const result = parseFoodFormData(
      formData({ name: "X", category: "y", servingUnit: "unit", gramsPerUnit: "-50", caloriesPer100g: "0", proteinPer100g: "0", carbsPer100g: "0", fatPer100g: "0", fiberPer100g: "0" }),
    );
    expect(result.success).toBe(false);
  });

  it("coerces the 'verified' checkbox from 'on'/absent", () => {
    const checked = parseFoodFormData(
      formData({ name: "X", category: "y", servingUnit: "g", caloriesPer100g: "0", proteinPer100g: "0", carbsPer100g: "0", fatPer100g: "0", fiberPer100g: "0", verified: "on" }),
    );
    expect(checked.success && checked.data.verified).toBe(true);

    const unchecked = parseFoodFormData(
      formData({ name: "X", category: "y", servingUnit: "g", caloriesPer100g: "0", proteinPer100g: "0", carbsPer100g: "0", fatPer100g: "0", fiberPer100g: "0" }),
    );
    expect(unchecked.success && unchecked.data.verified).toBe(false);
  });
});
