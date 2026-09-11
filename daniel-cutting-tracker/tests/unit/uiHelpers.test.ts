import { describe, expect, it } from "vitest";
import { rangeStatusLabel } from "@/components/dashboard/Card";

describe("rangeStatusLabel", () => {
  it("flags a value below the minimum as 'Abaixo da meta'", () => {
    expect(rangeStatusLabel(80, 150, 200)).toEqual({ text: "Abaixo da meta", tone: "warning" });
  });

  it("flags a value above the maximum as 'Acima da meta'", () => {
    expect(rangeStatusLabel(250, 150, 200)).toEqual({ text: "Acima da meta", tone: "warning" });
  });

  it("reports 'Dentro da meta' for a value inside the range", () => {
    expect(rangeStatusLabel(175, 150, 200)).toEqual({ text: "Dentro da meta", tone: "good" });
  });

  it("never fabricates a status when neither bound is defined", () => {
    expect(rangeStatusLabel(175)).toEqual({ text: "Sem meta definida", tone: "neutral" });
  });

  it("handles a min-only target (e.g. fiber) correctly", () => {
    expect(rangeStatusLabel(20, 30)).toEqual({ text: "Abaixo da meta", tone: "warning" });
    expect(rangeStatusLabel(35, 30)).toEqual({ text: "Dentro da meta", tone: "good" });
  });
});
