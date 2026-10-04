import { NextResponse } from "next/server";
import { db } from "@/db";
import { chamberReadings } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const readings = await db
      .select()
      .from(chamberReadings)
      .orderBy(desc(chamberReadings.recordedAt))
      .limit(10);

    return NextResponse.json({ success: true, data: readings });
  } catch (error) {
    console.error("Error fetching chamber readings:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch chamber readings" }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Simulate new chamber reading with slight variation
    const baseTemp = 12.4;
    const baseHumidity = 65;
    const variation = () => (Math.random() - 0.5) * 0.4;

    const [reading] = await db.insert(chamberReadings).values({
      chamberId: "Chamber-1",
      temperature: parseFloat((baseTemp + variation()).toFixed(1)),
      humidity: parseFloat((baseHumidity + variation() * 2).toFixed(1)),
      capacity: 120,
      maxCapacity: 175,
    }).returning();

    return NextResponse.json({ success: true, data: reading });
  } catch (error) {
    console.error("Error adding chamber reading:", error);
    return NextResponse.json({ success: false, error: "Failed to add reading" }, { status: 500 });
  }
}
