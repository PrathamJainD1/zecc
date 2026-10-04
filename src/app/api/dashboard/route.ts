import { NextResponse } from "next/server";
import { db } from "@/db";
import { produce, chamberReadings, systemHealth, alerts, powerReadings } from "@/db/schema";
import { desc, count } from "drizzle-orm";

export async function GET() {
  try {
    const [produceList, latestChamber, healthData, alertsList, latestPower] =
      await Promise.all([
        db.select().from(produce).orderBy(desc(produce.storedAt)).limit(5),
        db
          .select()
          .from(chamberReadings)
          .orderBy(desc(chamberReadings.recordedAt))
          .limit(1),
        db.select().from(systemHealth).orderBy(desc(systemHealth.lastChecked)),
        db.select().from(alerts).orderBy(desc(alerts.createdAt)).limit(10),
        db
          .select()
          .from(powerReadings)
          .orderBy(desc(powerReadings.recordedAt))
          .limit(1),
      ]);

    const [produceCount] = await db
      .select({ count: count() })
      .from(produce);

    return NextResponse.json({
      success: true,
      data: {
        produce: produceList,
        produceCount: produceCount?.count ?? 0,
        chamber: latestChamber[0] ?? null,
        systemHealth: healthData,
        alerts: alertsList,
        power: latestPower[0] ?? null,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
