import { NextRequest, NextResponse } from "next/server";
import { getMPBySlug } from "@/lib/data";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const slug = params.slug;
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

