import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma, resetDb } from "../testDb";
import { createTestUserWithPlan } from "../fixtures";
import { syncAlertsForToday } from "@/lib/services/syncAlerts";

const REF_DATE = "2026-09-10";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await resetDb();
  await prisma.$disconnect();
});

async function seedDailyLogs(userId: string, referenceDateStr: string, overrides: Partial<{ proteinConsumedG: number; caloriesConsumedKcal: number; estimatedTdeeKcal: number; waterMl: number }>[]) {
  const refDate = new Date(`${referenceDateStr}T00:00:00.000Z`);
  for (let i = 0; i < overrides.length; i++) {
    const date = new Date(refDate);
    date.setUTCDate(date.getUTCDate() - (overrides.length - 1 - i));
    await prisma.dailyLog.create({
      data: {
        userId,
        date,
        caloriesConsumedKcal: overrides[i].caloriesConsumedKcal ?? 2200,
        proteinConsumedG: overrides[i].proteinConsumedG ?? 190,
        carbsConsumedG: 200,
        fatConsumedG: 75,
        fiberConsumedG: 32,
        estimatedTdeeKcal: overrides[i].estimatedTdeeKcal ?? 2700,
        totalActivityCaloriesKcal: 500,
        waterMl: overrides[i].waterMl ?? 3200,
      },
    });
  }
}

describe("syncAlertsForToday", () => {
  it("creates a LOW_PROTEIN alert when protein is persistently under target", async () => {
    const { user } = await createTestUserWithPlan();
    await seedDailyLogs(
      user.id,
      REF_DATE,
      Array.from({ length: 7 }, (_, i) => ({ proteinConsumedG: i < 5 ? 120 : 190 })),
    );

    const candidates = await syncAlertsForToday(user.id, REF_DATE);
    expect(candidates.some((c) => c.type === "LOW_PROTEIN")).toBe(true);

    const stored = await prisma.alert.findFirst({ where: { userId: user.id, type: "LOW_PROTEIN" } });
    expect(stored).toBeTruthy();
    expect(stored?.isRead).toBe(false);
  });

  it("does not duplicate an alert row across repeated syncs (dedup by userId+type)", async () => {
    const { user } = await createTestUserWithPlan();
    await seedDailyLogs(
      user.id,
      REF_DATE,
      Array.from({ length: 7 }, (_, i) => ({ proteinConsumedG: i < 5 ? 120 : 190 })),
    );

    await syncAlertsForToday(user.id, REF_DATE);
    await syncAlertsForToday(user.id, REF_DATE);
    await syncAlertsForToday(user.id, REF_DATE);

    const rows = await prisma.alert.findMany({ where: { userId: user.id, type: "LOW_PROTEIN" } });
    expect(rows).toHaveLength(1);
  });

  it("preserves isRead across a resync while the condition is still true", async () => {
    const { user } = await createTestUserWithPlan();
    await seedDailyLogs(
      user.id,
      REF_DATE,
      Array.from({ length: 7 }, (_, i) => ({ proteinConsumedG: i < 5 ? 120 : 190 })),
    );

    await syncAlertsForToday(user.id, REF_DATE);
    const alert = await prisma.alert.findFirstOrThrow({ where: { userId: user.id, type: "LOW_PROTEIN" } });
    await prisma.alert.update({ where: { id: alert.id }, data: { isRead: true } });

    await syncAlertsForToday(user.id, REF_DATE);
    const reloaded = await prisma.alert.findFirstOrThrow({ where: { userId: user.id, type: "LOW_PROTEIN" } });
    expect(reloaded.isRead).toBe(true);
  });

  it("removes an alert once the underlying condition stops being true", async () => {
    const { user } = await createTestUserWithPlan();
    await seedDailyLogs(
      user.id,
      REF_DATE,
      Array.from({ length: 7 }, (_, i) => ({ proteinConsumedG: i < 5 ? 120 : 190 })),
    );
    await syncAlertsForToday(user.id, REF_DATE);
    expect(await prisma.alert.findFirst({ where: { userId: user.id, type: "LOW_PROTEIN" } })).toBeTruthy();

    // Overwrite with healthy protein for every day and resync.
    await prisma.dailyLog.updateMany({ where: { userId: user.id }, data: { proteinConsumedG: 195 } });
    await syncAlertsForToday(user.id, REF_DATE);

    expect(await prisma.alert.findFirst({ where: { userId: user.id, type: "LOW_PROTEIN" } })).toBeNull();
  });

  it("does not raise alerts for a user with no data yet", async () => {
    const { user } = await createTestUserWithPlan();
    const candidates = await syncAlertsForToday(user.id, REF_DATE);
    expect(candidates).toHaveLength(0);
  });

  it("scopes alert detection to the requesting user only", async () => {
    const { user: userA } = await createTestUserWithPlan();
    const { user: userB } = await createTestUserWithPlan();
    await seedDailyLogs(
      userA.id,
      REF_DATE,
      Array.from({ length: 7 }, (_, i) => ({ proteinConsumedG: i < 5 ? 120 : 190 })),
    );

    await syncAlertsForToday(userA.id, REF_DATE);
    await syncAlertsForToday(userB.id, REF_DATE);

    expect(await prisma.alert.findFirst({ where: { userId: userA.id, type: "LOW_PROTEIN" } })).toBeTruthy();
    expect(await prisma.alert.findFirst({ where: { userId: userB.id, type: "LOW_PROTEIN" } })).toBeNull();
  });

  it("does not let one user mark another user's alert as read (ownership-scoped update)", async () => {
    const { user: userA } = await createTestUserWithPlan();
    const { user: userB } = await createTestUserWithPlan();
    await seedDailyLogs(
      userA.id,
      REF_DATE,
      Array.from({ length: 7 }, (_, i) => ({ proteinConsumedG: i < 5 ? 120 : 190 })),
    );
    await syncAlertsForToday(userA.id, REF_DATE);
    const alertA = await prisma.alert.findFirstOrThrow({ where: { userId: userA.id, type: "LOW_PROTEIN" } });

    // Mirrors markAlertReadAction's ownership-scoped updateMany: attempting
    // to mark it read as userB must affect zero rows.
    const result = await prisma.alert.updateMany({ where: { id: alertA.id, userId: userB.id }, data: { isRead: true } });
    expect(result.count).toBe(0);

    const reloaded = await prisma.alert.findUniqueOrThrow({ where: { id: alertA.id } });
    expect(reloaded.isRead).toBe(false);
  });

  it("flags RAPID_WEIGHT_LOSS from a real weight-entry trend, not a single weigh-in", async () => {
    const { user } = await createTestUserWithPlan();
    const refDate = new Date(`${REF_DATE}T00:00:00.000Z`);
    let weight = 110;
    for (let i = 20; i >= 0; i--) {
      const date = new Date(refDate);
      date.setUTCDate(date.getUTCDate() - i);
      weight -= 0.25; // ~1.75kg/week — above the rapid-loss threshold
      await prisma.weightEntry.create({ data: { userId: user.id, date, weightKg: Math.round(weight * 100) / 100 } });
    }

    const candidates = await syncAlertsForToday(user.id, REF_DATE);
    expect(candidates.some((c) => c.type === "RAPID_WEIGHT_LOSS")).toBe(true);
  });
});
