"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";

export async function markAlertReadAction(alertId: string, isRead: boolean): Promise<void> {
  const userId = await requireUserId();
  await prisma.alert.updateMany({ where: { id: alertId, userId }, data: { isRead } });
  revalidatePath("/alerts");
  revalidatePath("/");
}
