import Link from "next/link";
import { getSnapshotDate } from "@/lib/data";

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "28px 24px 64px", lineHeight: 1.65 }}>
      <Link href="/">← Back to report cards</Link>
      <h1 style={{ margin: "72px 0 16px", fontSize: "clamp(2.4rem, 7vw, 4.5rem)", letterSpacing: "-.07em", lineHeight: 1 }}>How this works</h1>
      <p style={{ color: "#53606d", fontSize: "1.1rem" }}>Mera MP turns public records into a readable, neutral starting point for citizens.</p>
      <h2 style={{ marginTop: 44 }}>What is shown</h2>
      <p>Parliamentary activity indicators come from PRS Legislative Research and cover the period shown on each card. They describe activity, not quality, and are not a ranking.</p>
      <h2 style={{ marginTop: 32 }}>What is not yet available</h2>
      <p>The current reviewed snapshot covers all seven Delhi seats. MPLADS and affidavit enrichment are marked pending; missing values are never converted to zero.</p>
      <h2 style={{ marginTop: 32 }}>Data and safeguards</h2>
      <p>Records are collected into an offline snapshot, normalised and validated before display. Every card links to its sources and retrieval dates. Affidavit cases, when added, will be labelled as declared cases and not convictions.</p>
      <p style={{ marginTop: 32, color: "#697684", fontSize: ".9rem" }}>Snapshot date: {getSnapshotDate()}. Unofficial student civic project; not affiliated with Parliament or any political party.</p>
      <p style={{ marginTop: 20 }}><Link href="/compare">Compare two report cards</Link> · <Link href="/state/delhi">Browse Delhi seats</Link></p>
      <p style={{ marginTop: 20 }}><a href="/api/data">Download JSON</a> · <a href="/api/data?format=csv">Download CSV</a></p>
    </main>
  );
}
