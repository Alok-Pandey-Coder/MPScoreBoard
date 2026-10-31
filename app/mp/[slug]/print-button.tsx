"use client";

export default function PrintButton() {
  return <button type="button" onClick={() => window.print()} style={{ border: "1px solid #0f766e", borderRadius: 8, background: "transparent", color: "#0f766e", cursor: "pointer", font: "inherit", fontSize: ".8rem", fontWeight: 700, padding: "8px 10px" }}>Print report</button>;
}
