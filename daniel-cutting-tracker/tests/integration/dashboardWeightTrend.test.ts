import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDb } from "../testDb";
import { createTestUserWithPlan } from "../fixtures";
import { getDashboardData } from "@/lib/services/getDashboard";

const REF_DATE = "2026-09-10";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await resetDb();
  await prisma.$disconnect();
});

describe("getDashboardData weight trend", () => {
  it("reports insufficient data when there's no weight history yet", async () => {
    const { user } = await createTestUserWithPlan();

    const dashboard = await getDashboardData(user.id, REF_DATE);

    expect(dashboard.weightTrend.hasEnoughData).toBe(false);
    expect(dashboard.weightTrend.message).toBe("Dados insuficientes para calcular tendencia.");
  });

  it("computes a real 7-day-moving-average trend once there's enough weight history", async () => {
    const { user } = await createTestUserWithPlan();
    const refDate = new Date(`${REF_DATE}T00:00:00.000Z`);
    let weight = 110;
    for (let i = 20; i >= 0; i--) {
      const date = new Date(refDate);
      date.setUTCDate(date.getUTCDate() - i);
      weight -= 0.1; // steady, gradual loss well inside 21-day lookback
      await prisma.weightEntry.create({ data: { userId: user.id, date, weightKg: Math.round(weight * 100) / 100 } });
    }

    const dashboard = await getDashboardData(user.id, REF_DATE);

    expect(dashboard.weightTrend.hasEnoughData).toBe(true);
    expect(dashboard.weightTrend.direction).toBe("down");
  });

  it("never lets a single stray weigh-in outside the trend window count as a real trend", async () => {
    const { user } = await createTestUserWithPlan();
    // Only two entries, both recent — not enough entries or span for a trend.
    await prisma.weightEntry.create({ data: { userId: user.id, date: new Date(`${REF_DATE}T00:00:00.000Z`), weightKg: 106 } });
    const yesterday = new Date(`${REF_DATE}T00:00:00.000Z`);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    await prisma.weightEntry.create({ data: { userId: user.id, date: yesterday, weightKg: 106.2 } });

    const dashboard = await getDashboardData(user.id, REF_DATE);

    expect(dashboard.weightTrend.hasEnoughData).toBe(false);
  });
});
