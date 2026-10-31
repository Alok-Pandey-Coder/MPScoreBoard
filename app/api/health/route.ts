import { NextResponse } from "next/server";
import { getAllMPs, getSnapshotDate } from "@/lib/data";

export function GET() {
  return NextResponse.json({
    status: "ok",
    snapshotDate: getSnapshotDate(),
    mpCount: getAllMPs().length,
  });
}
