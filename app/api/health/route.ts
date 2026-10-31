import { NextResponse } from "next/server";
import { getAllMPs, getSnapshotDate } from "@/lib/data";

export function GET() {
  try {
    return NextResponse.json({
      status: "ok",
      snapshotDate: getSnapshotDate(),
      mpCount: getAllMPs().length,
    });
  } catch {
    return NextResponse.json(
      { status: "error", error: "Health check failed." },
      { status: 500 }
    );
  }
}
