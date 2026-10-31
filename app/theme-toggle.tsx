"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("mera-mp-theme");
    const isDark = saved === "dark";
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    const frame = window.requestAnimationFrame(() => setDark(isDark));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("mera-mp-theme", next ? "dark" : "light");
    setDark(next);
  }

  return <button type="button" onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"} style={{ border: "1px solid currentColor", borderRadius: 8, background: "transparent", color: "inherit", cursor: "pointer", font: "inherit", fontSize: ".8rem", padding: "6px 9px" }}>{dark ? "Light" : "Dark"}</button>;
}
