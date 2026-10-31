"use client";

import { useState } from "react";

export default function PincodeLookup() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState("");
  async function lookup() {
    const response = await fetch("/api/pincode", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pincode }) });
    const data = await response.json() as { matches?: Array<{ constituency: string; mp: string }>; error?: { message: string } };
    setResult(data.matches?.[0] ? `${data.matches[0].constituency} · ${data.matches[0].mp}` : data.error?.message ?? "No match found.");
  }
  return <section style={{ marginTop: 24 }}><label style={{ display: "block", fontSize: ".82rem", fontWeight: 700 }} htmlFor="pincode">Pincode lookup</label><div style={{ display: "flex", gap: 8, marginTop: 8 }}><input id="pincode" inputMode="numeric" maxLength={6} value={pincode} onChange={(event) => setPincode(event.target.value)} placeholder="6-digit pincode" style={{ flex: 1, border: "1px solid #cbd5e1", borderRadius: 8, background: "var(--card)", color: "var(--foreground)", font: "inherit", padding: 10 }} /><button type="button" onClick={lookup}>Find seat</button></div>{result && <p style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: 8 }} aria-live="polite">{result}</p>}</section>;
}
