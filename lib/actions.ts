import type { ReportMP } from "@/lib/data";

export type SummaryLanguage = "en" | "hinglish";
export type DraftIntent = "mplads" | "parliamentary-activity" | "data-correction";
export type UILanguage = "en" | "hi";

export const draftIntents: Record<DraftIntent, string> = {
  mplads: "Ask about local development funds",
  "parliamentary-activity": "Ask about parliamentary activity",
  "data-correction": "Report a data correction",
};

export const uiCopy: Record<UILanguage, { search: string; picker: string; choose: string; generate: string; speak: string }> = {
  en: { search: "Search by MP, constituency, state or party", picker: "Or choose a state and constituency", choose: "Choose constituency", generate: "Generate summary", speak: "Read aloud" },
  hi: { search: "सांसद, निर्वाचन क्षेत्र, राज्य या पार्टी से खोजें", picker: "या राज्य और निर्वाचन क्षेत्र चुनें", choose: "निर्वाचन क्षेत्र चुनें", generate: "सारांश बनाएं", speak: "सुनें" },
};

function value(mp: ReportMP, label: string): number | null {
  return mp.metrics.find((metric) => metric.label === label)?.value ?? null;
}

function metricText(mp: ReportMP, label: string, suffix = ""): string {
  const metricValue = value(mp, label);
  return metricValue === null ? `${label.toLocaleLowerCase()} data is not available` : `${label.toLocaleLowerCase()} is ${metricValue}${suffix}`;
}

export function createSummary(mp: ReportMP, language: SummaryLanguage): string {
  const ministerText = mp.isMinister
    ? language === "hinglish"
      ? "PRS source mein minister ke liye activity metrics applicable nahi hain."
      : "The PRS source marks parliamentary activity metrics as not applicable for this minister."
    : language === "hinglish"
      ? `Is snapshot mein ${metricText(mp, "Attendance", "%")}, ${metricText(mp, "Debates")}, aur ${metricText(mp, "Questions")} dikhaye gaye hain.`
      : `This snapshot reports ${metricText(mp, "Attendance", "%")}, ${metricText(mp, "Debates")}, and ${metricText(mp, "Questions")}.`;

  if (language === "hinglish") {
    return `${mp.name}, ${mp.constituency}, ${mp.state} ko represent karte hain. ${ministerText} Yeh descriptive activity indicators hain, overall performance ka judgement nahi. MPLADS aur affidavit enrichment is reviewed snapshot mein abhi available nahi hain.`;
  }

  return `${mp.name} represents ${mp.constituency}, ${mp.state}. ${ministerText} These are descriptive activity indicators, not a judgement of overall performance. MPLADS and affidavit enrichment are currently marked as not available in this reviewed snapshot.`;
}

export function createDraft(mp: ReportMP, intent: DraftIntent, language: SummaryLanguage): string {
  const greeting = language === "hinglish" ? "Namaste" : "Dear Member of Parliament";
  const closing = language === "hinglish" ? "Dhanyavaad,\n[Your name]\n[Your locality]" : "Regards,\n[Your name]\n[Your locality]";
  const subject = draftIntents[intent];
  const body = intent === "mplads"
    ? language === "hinglish"
      ? `Main ${mp.constituency} ka resident hoon. Kripya MPLADS entitlement, released funds aur expenditure ka latest reviewed status share karein.`
      : `I am a resident of ${mp.constituency}. Please share the latest reviewed status of MPLADS entitlement, funds released, and expenditure for the constituency.`
    : intent === "parliamentary-activity"
      ? language === "hinglish"
        ? `Aapke constituency report card mein parliamentary activity indicators diye gaye hain. Kripya batayein ki constituency ke important issues ko Parliament mein kaise raise kiya ja raha hai.`
        : `The constituency report card shows parliamentary activity indicators. Please share how important constituency issues are being raised in Parliament.`
      : language === "hinglish"
        ? `Maine ${mp.constituency} report card mein ek data point dekha hai. Kripya source record ke saath iski jaanch karke correction batayein, agar zaroori ho.`
        : `I noticed a data point in the ${mp.constituency} report card. Please verify it against the source record and advise if a correction is needed.`;

  return `Subject: ${subject}\n\n${greeting},\n\n${body}\n\nPlease share the relevant source or update when convenient.\n\n${closing}`;
}

export function answerFromSnapshot(mp: ReportMP, question: string, language: SummaryLanguage): string {
  const normalized = question.toLocaleLowerCase();
  const metric = mp.metrics.find((item) => normalized.includes(item.label.toLocaleLowerCase()));
  if (metric) {
    const value = metric.value === null ? (language === "hinglish" ? "available nahi hai" : "not available") : `${metric.value}${metric.suffix ?? ""}`;
    return language === "hinglish" ? `${mp.name} ke liye ${metric.label.toLocaleLowerCase()} ${value} hai. Yeh activity indicator hai, quality judgement nahi.` : `${mp.name}'s ${metric.label.toLowerCase()} is ${value}. This is an activity indicator, not a quality judgement.`;
  }
  return language === "hinglish"
    ? `Is snapshot mein ${mp.name} ke baare mein sirf structured report-card data available hai. Aap attendance, debates, questions ya MPLADS ke baare mein pooch sakte hain.`
    : `This snapshot contains structured report-card data for ${mp.name}. You can ask about attendance, debates, questions, or MPLADS.`;
}
