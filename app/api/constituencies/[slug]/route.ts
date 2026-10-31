import { NextRequest, NextResponse } from "next/server";
import { getMPBySlug } from "@/lib/data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const mp = getMPBySlug(slug);

    if (!mp) {
      return NextResponse.json(
        {
          status: "error",
          message: `Constituency or MP with slug '${slug}' not found in Delhi records.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: mp,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
