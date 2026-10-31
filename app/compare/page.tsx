import Link from "next/link";
import { getAllMPs } from "@/lib/data";
import CompareClient from "./compare-client";

export default function ComparePage() {
  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px 64px" }}>
      <Link href="/">← Back to report cards</Link>
      <h1 style={{ margin: "70px 0 10px", fontSize: "clamp(2.4rem, 7vw, 4.5rem)", letterSpacing: "-.07em", lineHeight: 1 }}>Compare indicators</h1>
      <p style={{ color: "#53606d" }}>Side-by-side context only. There is no winner or ranking.</p>
      <CompareClient mps={getAllMPs()} />
    </main>
  );
}
