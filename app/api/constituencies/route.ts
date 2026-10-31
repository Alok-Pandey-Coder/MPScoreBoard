import { NextResponse } from "next/server";
import { getConstituenciesSummary } from "@/lib/data";

export async function GET() {
  try {
    const list = getConstituenciesSummary();
    return NextResponse.json({
      status: "success",
      count: list.length,
      data: list,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

