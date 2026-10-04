import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { produce } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let query = db.select().from(produce).orderBy(desc(produce.storedAt));

    const results = type && type !== "all"
      ? await db.select().from(produce).where(eq(produce.type, type as "vegetables" | "fruits" | "herbs" | "grains")).orderBy(desc(produce.storedAt))
      : await query;

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching produce:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch produce" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type = "vegetables",
      quantity,
      unit = "kg",
      status = "good",
      targetTempMin,
      targetTempMax,
      shelfLifeDays,
      crate,
      notes,
    } = body;

    if (!name || !quantity) {
      return NextResponse.json({ success: false, error: "Name and quantity are required" }, { status: 400 });
    }

    const [newProduce] = await db.insert(produce).values({
      name,
      type,
      quantity,
      unit,
      status,
      targetTempMin: targetTempMin ?? 10,
      targetTempMax: targetTempMax ?? 13,
      shelfLifeDays: shelfLifeDays ?? 14,
      crate: crate ?? "Crate-01",
      notes,
    }).returning();

    return NextResponse.json({ success: true, data: newProduce });
  } catch (error) {
    console.error("Error adding produce:", error);
    return NextResponse.json({ success: false, error: "Failed to add produce" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await db.delete(produce).where(eq(produce.id, parseInt(id)));
    return NextResponse.json({ success: true, message: "Produce deleted" });
  } catch (error) {
    console.error("Error deleting produce:", error);
    return NextResponse.json({ success: false, error: "Failed to delete produce" }, { status: 500 });
  }
}
