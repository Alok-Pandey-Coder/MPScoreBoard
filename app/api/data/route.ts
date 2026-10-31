import { NextResponse } from "next/server";
import { getAllMPs } from "@/lib/data";

function csvCell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function GET(request: Request) {
  const format = new URL(request.url).searchParams.get("format");
  const mps = getAllMPs();
  if (format === "csv") {
    const header = ["slug", "name", "constituency", "state", "party", "attendance", "debates", "questions", "private_member_bills"];
    const rows = mps.map((mp) => [
      mp.slug,
      mp.name,
      mp.constituency,
      mp.state,
      mp.party,
      mp.metrics[0]?.value ?? null,
      mp.metrics[1]?.value ?? null,
      mp.metrics[2]?.value ?? null,
      mp.metrics[3]?.value ?? null,
    ].map(csvCell).join(","));
    return new Response([header.map(csvCell).join(","), ...rows].join("\n"), {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=mera-mp-report-cards.csv" },
    });
  }
  return NextResponse.json({ dataAsOf: "2026-10-30", records: mps });
}
