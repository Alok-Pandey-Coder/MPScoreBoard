import { NextRequest, NextResponse } from "next/server";
import { resolveLocation } from "@/lib/data";
import { LocationResolveRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: LocationResolveRequest = await req.json();
    const result = resolveLocation(body);

    if (!result.success) {
      return NextResponse.json(
        {
          status: "not_found",
          result,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const pincode = searchParams.get("pincode");
    const query = searchParams.get("q") || searchParams.get("query");

    const resolveReq: LocationResolveRequest = {};

    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        resolveReq.lat = lat;
        resolveReq.lng = lng;
      }
    }

    if (pincode) {
      resolveReq.pincode = pincode;
    }

    if (query) {
      resolveReq.query = query;
    }

    const result = resolveLocation(resolveReq);

    if (!result.success) {
      return NextResponse.json(
        {
          status: "not_found",
          result,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 400 }
    );
  }
}

