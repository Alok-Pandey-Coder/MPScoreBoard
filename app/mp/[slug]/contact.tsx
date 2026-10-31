"use client";

import { useEffect, useState } from "react";

export default function ContactDetails({ slug }: { slug: string }) {
  const [contact, setContact] = useState<{ office: string; email: string; phone: string | null } | null>(null);
  useEffect(() => { fetch(`/api/contact?slug=${encodeURIComponent(slug)}`).then((response) => response.ok ? response.json() : null).then((data: { contact?: typeof contact } | null) => setContact(data?.contact ?? null)).catch(() => undefined); }, [slug]);
  if (!contact) return null;
  return <section style={{ marginTop: 28, borderTop: "1px solid var(--border)", paddingTop: 20 }}><h2 style={{ fontSize: "1.1rem" }}>Contact details</h2><p style={{ color: "var(--muted)", fontSize: ".8rem", marginTop: 8 }}>Synthetic test contact — replace with a verified official source before publishing.</p><p style={{ marginTop: 8, fontSize: ".85rem" }}>{contact.office} · {contact.email}</p></section>;
}
