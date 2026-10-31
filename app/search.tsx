"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { searchMPs, type ReportMP } from "@/lib/data";
import { uiCopy, type UILanguage } from "@/lib/actions";
import styles from "./page.module.css";

export default function MPDirectory({ mps }: { mps: ReportMP[] }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("");
  const [language, setLanguage] = useState<UILanguage>("en");
  const copy = uiCopy[language];
  const router = useRouter();
  const results = useMemo(() => {
    return query.trim() ? searchMPs(query) : mps;
  }, [mps, query]);

  return (
    <>
      <form className={styles.search} onSubmit={(event) => event.preventDefault()}>
        <div className={styles.languageRow}><label htmlFor="q">{copy.search}</label><select value={language} onChange={(event) => setLanguage(event.target.value as UILanguage)} aria-label="Interface language"><option value="en">English</option><option value="hi">हिन्दी</option></select></div>
        <div className={styles.searchRow}>
          <input id="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Try "New Delhi" or "Bansuri"' />
          <button className={styles.searchButton} type="submit">Search</button>
        </div>
      </form>
      <label className={styles.pickerLabel} htmlFor="state">{copy.picker}</label>
      <div className={styles.pickers}>
        <select id="state" aria-label="State" value={state} onChange={(event) => setState(event.target.value)}>
          <option value="">All states</option>
          {[...new Set(mps.map((mp) => mp.state))].map((value) => <option key={value}>{value}</option>)}
        </select>
        <select aria-label="Constituency" onChange={(event) => { if (event.target.value) router.push(`/mp/${event.target.value}`); }}>
          <option value="">{copy.choose}</option>
          {mps.filter((mp) => !state || mp.state === state).map((mp) => <option value={mp.slug} key={mp.slug}>{mp.constituency}</option>)}
        </select>
      </div>
      <section className={styles.results} aria-live="polite">
        <div className={styles.sectionHeading}>
          <h2 className={styles.heading}>{query ? `Results for “${query}”` : "Delhi constituencies"}</h2>
          <span>{results.length} {results.length === 1 ? "record" : "records"}</span>
        </div>
        {results.length === 0 ? (
          <div className={styles.empty}><h3>No matching record</h3><p>Try a constituency or MP name from the Delhi list.</p></div>
        ) : (
          <div className={styles.cardGrid}>
            {results.map((mp) => (
              <Link href={`/mp/${mp.slug}`} className={styles.mpCard} key={mp.slug}>
                <span className={styles.avatar}>{mp.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                <span><strong>{mp.name}</strong><small>{mp.constituency} · {mp.party}</small>{mp.isMinister && <small className={styles.badge}>Minister · activity not applicable</small>}</span>
                <span className={styles.arrow} aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
