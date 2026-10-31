"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReportMP } from "@/lib/data";

export default function CompareClient({ mps }: { mps: ReportMP[] }) {
  const [leftSlug, setLeftSlug] = useState(mps[0]?.slug ?? "");
  const [rightSlug, setRightSlug] = useState(mps[1]?.slug ?? "");
  const left = useMemo(() => mps.find((mp) => mp.slug === leftSlug), [leftSlug, mps]);
  const right = useMemo(() => mps.find((mp) => mp.slug === rightSlug), [rightSlug, mps]);
  return (
    <section style={{ marginTop: 32 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[["First MP", leftSlug, setLeftSlug], ["Second MP", rightSlug, setRightSlug]].map(([label, value, setter]) => (
          <label key={label as string} style={{ display: "grid", gap: 8, color: "#53606d", fontSize: ".85rem" }}>
            {label as string}
            <select value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: 10, font: "inherit" }}>
              {mps.map((mp) => <option value={mp.slug} key={mp.slug}>{mp.name} · {mp.constituency}</option>)}
            </select>
          </label>
        ))}
      </div>
      {left && right && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
        {[left, right].map((mp) => <article key={mp.slug} style={{ border: "1px solid #dbe3e9", borderRadius: 12, padding: 18 }}>
          <h2 style={{ fontSize: "1.1rem" }}>{mp.name}</h2><p style={{ color: "#697684", fontSize: ".85rem", margin: "6px 0 18px" }}>{mp.constituency} · {mp.party}</p>
          {mp.metrics.map((metric) => <div key={metric.label} style={{ borderTop: "1px solid #e8edf0", padding: "12px 0", display: "flex", justifyContent: "space-between", gap: 10, fontSize: ".85rem" }}><span>{metric.label}</span><strong>{metric.value === null ? "Not available" : `${metric.value}${metric.suffix ?? ""}`}</strong></div>)}
          <Link href={`/mp/${mp.slug}`} style={{ color: "#0f766e", fontSize: ".85rem" }}>Open full report →</Link>
        </article>)}
      </div>}
    </section>
  );
}
