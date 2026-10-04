export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { alerts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const alertsList = await db.select().from(alerts).orderBy(desc(alerts.createdAt));
    return NextResponse.json({ success: true, data: alertsList });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id));
    return NextResponse.json({ success: true, message: "Alert marked as read" });
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json({ success: false, error: "Failed to update alert" }, { status: 500 });
  }
}
