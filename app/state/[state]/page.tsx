import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllMPs } from "@/lib/data";

export function generateStaticParams() {
  return [...new Set(getAllMPs().map((mp) => mp.state))].map((state) => ({ state: state.toLocaleLowerCase().replace(/\s+/g, "-") }));
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const normalizedState = state.toLocaleLowerCase().replace(/-/g, " ");
  const mps = getAllMPs().filter((mp) => mp.state.toLocaleLowerCase() === normalizedState);
  if (mps.length === 0) notFound();
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 64px" }}>
      <Link href="/">← All states</Link>
      <h1 style={{ margin: "70px 0 24px", fontSize: "clamp(2.4rem, 7vw, 4.5rem)", letterSpacing: "-.07em", lineHeight: 1 }}>{mps[0].state}</h1>
      <div style={{ display: "grid", gap: 10 }}>{mps.slice().sort((a, b) => a.name.localeCompare(b.name)).map((mp) => <Link href={`/mp/${mp.slug}`} key={mp.slug} style={{ border: "1px solid #dbe3e9", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between" }}><span><strong>{mp.name}</strong><small style={{ display: "block", color: "#697684", marginTop: 5 }}>{mp.constituency} · {mp.party}</small></span><span style={{ color: "#0f766e" }}>→</span></Link>)}</div>
    </main>
  );
}
