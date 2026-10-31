"use client";

import { useState } from "react";
import type { DraftIntent, SummaryLanguage } from "@/lib/actions";
import { draftIntents } from "@/lib/actions";
import styles from "./page.module.css";

export default function MPActions({ slug }: { slug: string }) {
  const [language, setLanguage] = useState<SummaryLanguage>("en");
  const [summary, setSummary] = useState("");
  const [draft, setDraft] = useState("");
  const [intent, setIntent] = useState<DraftIntent>("mplads");
  const [loading, setLoading] = useState<"summary" | "draft" | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const suggestions = intent === "mplads"
    ? ["What projects are currently proposed for this constituency?", "What is the latest reviewed fund utilisation status?"]
    : ["Which constituency issues are being raised in Parliament?", "What follow-up can residents expect on these issues?"];

  async function loadSummary() {
    setLoading("summary");
    const response = await fetch("/api/summary", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, lang: language }) });
    const data = await response.json() as { text?: string };
    setSummary(data.text ?? "Summary unavailable.");
    setLoading(null);
  }

  async function loadDraft() {
    setLoading("draft");
    const response = await fetch("/api/draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, intent, lang: language }) });
    const data = await response.json() as { text?: string };
    setDraft(data.text ?? "Draft unavailable.");
    setLoading(null);
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function sharePage() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "Mera MP report card", url });
    } else {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1800);
    }

  }

  function speak(text: string) {
    if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  async function ask() {
    const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, question, lang: language }) });
    const data = await response.json() as { text?: string };
    setAnswer(data.text ?? "Answer unavailable.");
  }

  return (
    <section className={styles.actions}>
      <div className={styles.actionPanel}>
        <div className={styles.actionHeader}><h2 className={styles.heading}>Explain simply</h2><span>Template-grounded</span></div>
        <div className={styles.controls}>
          <select value={language} onChange={(event) => setLanguage(event.target.value as SummaryLanguage)} aria-label="Summary language">
            <option value="en">English</option><option value="hinglish">Hinglish</option>
          </select>
          <button type="button" onClick={loadSummary} disabled={loading !== null}>{loading === "summary" ? "Loading…" : "Generate summary"}</button>
        </div>
        {summary && <><p className={styles.output} aria-live="polite">{summary}</p><button className={styles.copy} type="button" onClick={() => speak(summary)}>Read aloud</button></>}
      </div>
      <div className={styles.actionPanel}>
        <div className={styles.actionHeader}><h2 className={styles.heading}>Take action</h2><span>Review before sending</span></div>
        <div className={styles.controls}>
          <select value={intent} onChange={(event) => setIntent(event.target.value as DraftIntent)} aria-label="Draft type">
            {Object.entries(draftIntents).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
          </select>
          <button type="button" onClick={loadDraft} disabled={loading !== null}>{loading === "draft" ? "Loading…" : "Create draft"}</button>
        </div>
        {draft && <><textarea className={styles.draft} value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="Editable draft" /><button className={styles.copy} type="button" onClick={copyDraft}>{copied ? "Copied" : "Copy draft"}</button></>}
        <div className={styles.suggestions}><strong>Suggested questions</strong>{suggestions.map((question) => <span key={question}>{question}</span>)}</div>
      </div>
      <button className={styles.share} type="button" onClick={sharePage}>{linkCopied ? "Link copied" : "Share this report card"}</button>
      <div className={styles.actionPanel}><div className={styles.actionHeader}><h2 className={styles.heading}>Ask about this MP</h2><span>Snapshot-only answers</span></div><div className={styles.controls}><input className={styles.question} value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={500} placeholder="Ask about attendance or questions" /><button type="button" onClick={ask} disabled={!question.trim()}>Ask</button></div>{answer && <p className={styles.output} aria-live="polite">{answer}</p>}</div>
    </section>
  );
}
