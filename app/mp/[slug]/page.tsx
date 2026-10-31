import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllMPs, getMPBySlug } from "@/lib/data";
import MPActions from "./actions";
import WorksList from "./works";
import PrintButton from "./print-button";
import ContactDetails from "./contact";
import type { Metadata } from "next";
import styles from "./page.module.css";

export function generateStaticParams() {
  return getAllMPs().map((mp) => ({ slug: mp.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const mp = getMPBySlug(slug);
  return mp ? { title: `${mp.name} — Mera MP`, description: `${mp.constituency}, ${mp.state} MP report card with sources and activity indicators.` } : {};
}

function displayValue(value: number | null, suffix = "") {
  return value === null ? "Not available" : `${value}${suffix}`;
}

function barWidth(value: number | null, max: number | null) {
  if (value === null || max === null || max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

export default async function MPPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mp = getMPBySlug(slug);
  if (!mp) notFound();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>Mera MP</Link>
        <span className={styles.headerActions}><PrintButton /><Link href="/" className={styles.back}>← All Delhi seats</Link></span>
      </header>
      <section className={styles.identity}>
        <p className={styles.eyebrow}>{mp.state} · {mp.term}</p>
        <h1 className={styles.title}>{mp.name}</h1>
        <p className={styles.subtitle}>{mp.constituency} · {mp.party} · {mp.reservation}</p>
        {mp.isMinister && <p className={styles.notice}>Minister — parliamentary activity metrics are not applicable in the PRS source.</p>}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}><h2 className={styles.heading}>Parliamentary activity</h2><span>Descriptive indicators, not a quality ranking</span></div>
        <div className={styles.metricGrid}>
          {mp.metrics.map((metric) => (
            <article className={styles.metric} key={metric.label}>
              <span>{metric.label}</span>
              <strong>{displayValue(metric.value, metric.suffix)}</strong>
              <small>State avg: {displayValue(metric.stateAverage, metric.suffix)} · National avg: {displayValue(metric.nationalAverage, metric.suffix)}</small>
              <div className={styles.bar} aria-label={`${metric.label} compared with averages`}>
                <span style={{ width: `${barWidth(metric.value, Math.max(metric.stateAverage ?? 0, metric.nationalAverage ?? 0, metric.value ?? 0))}%` }} />
              </div>
            </article>
          ))}
        </div>
        <p className={styles.asOf}>Source period ends {mp.performanceAsOf ?? "not available"}. Values are activity measures and do not assess quality.</p>
      </section>
      <ContactDetails slug={mp.slug} />

      {mp.attendanceBySession.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}><h2 className={styles.heading}>Attendance by session</h2><span>Reported session percentages</span></div>
          <div className={styles.trendList}>{mp.attendanceBySession.map((session) => <div className={styles.trend} key={session.session}><span>{session.session}</span><strong>{displayValue(session.pct, "%")}</strong></div>)}</div>
        </section>
      )}

      {mp.history.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>MP history</h2>
          <div className={styles.historyList}>{mp.history.map((term) => <div className={styles.historyItem} key={`${term.lokSabha}-${term.constituency}`}><strong>{term.lokSabha}</strong><span>{term.constituency} · {term.party} · {term.fromYear}–{term.toYear ?? "present"}</span></div>)}</div>
        </section>
      )}

      <section className={styles.twoCol}>
        <article className={styles.panel}>
          <h2 className={styles.heading}>MPLADS</h2>
          <details className={styles.glossary}><summary>What is MPLADS?</summary><p>Members of Parliament Local Area Development Scheme funding is shown as reported by the reviewed source. Missing values are not zero.</p></details>
          {mp.mplads ? <><div className={styles.dataList}><span>Entitlement <strong>₹{mp.mplads.entitlementCr ?? "—"} Cr</strong></span><span>Released <strong>₹{mp.mplads.releasedCr ?? "—"} Cr</strong></span><span>Spent <strong>₹{mp.mplads.spentCr ?? "—"} Cr</strong></span><span>Utilisation <strong>{displayValue(mp.mplads.utilisationPct, "%")}</strong></span></div><div className={styles.yearList}>{mp.mplads.byYear.map((year) => <div key={year.fy}><span>{year.fy}</span><span>Released ₹{year.releasedCr ?? "—"} Cr · Spent ₹{year.spentCr ?? "—"} Cr</span></div>)}</div></> : <><p>Funding data is pending review for this snapshot.</p><span className={styles.pending}>Not available — never treated as zero</span></>}
        </article>
        <article className={styles.panel}>
          <h2 className={styles.heading}>Background affidavit</h2>
          {mp.affidavit ? <><div className={styles.dataList}><span>Declared assets <strong>{mp.affidavit.totalAssetsRs === null ? "Not available" : `₹${mp.affidavit.totalAssetsRs.toLocaleString("en-IN")}`}</strong></span><span>Declared pending cases <strong>{mp.affidavit.declaredCases ?? "Not available"}</strong></span><span>Education <strong>{mp.affidavit.education ?? "Not available"}</strong></span><span>Election year <strong>{mp.affidavit.electionYear ?? "Not available"}</strong></span></div><span className={styles.pending}>Self-declared affidavit information; cases are not convictions.</span></> : <><p>Affidavit enrichment is pending review for this snapshot.</p><span className={styles.pending}>Not available — declarations are not convictions</span></>}
        </article>
      </section>

      {mp.works.length > 0 && <section className={styles.section}><h2 className={styles.heading}>MPLADS works</h2><WorksList works={mp.works} /></section>}
      {mp.bills.length > 0 && <section className={styles.section}><h2 className={styles.heading}>Private member bills</h2><div className={styles.list}>{mp.bills.slice(0, 10).map((bill) => <div className={styles.listItem} key={bill.id}><strong>{bill.title}</strong><span>{bill.status} · {bill.introducedOn}</span></div>)}</div></section>}

      <MPActions slug={mp.slug} />

      <section className={styles.section}>
        <h2 className={styles.heading}>Sources</h2>
        <ul className={styles.sources}>
          {mp.sources.map((source) => <li key={`${source.name}-${source.url}`}><a href={source.url} target="_blank" rel="noreferrer">{source.name}</a><span>Retrieved {source.retrievedAt}</span></li>)}
        </ul>
      </section>
      <footer className={styles.footer}>Unofficial civic project. Verify information at the linked sources before relying on it. <a href="https://github.com/Alok-Pandey-Coder/MPScoreBoard/issues/new" target="_blank" rel="noreferrer">Report a data issue</a></footer>
    </main>
  );
}
