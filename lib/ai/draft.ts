import { CitizenIntent, MPRecord } from '../../types/mp';
import { formatDate } from '../formatters';
import { AI_LANGS_TEXT, isAiLang, type AiLang } from './summary';

export const DRAFT_INTENTS: readonly CitizenIntent[] = [
  'mplads_works',
  'parliament_question',
  'attendance_clarification',
  'general_feedback',
];
const DRAFT_KEYS = new Set(['slug', 'intent', 'lang', 'citizenName', 'locality']);
export const DRAFT_MAX_FIELD = 60;

/** Error message for an invalid /api/draft body. */
export const DRAFT_REQUEST_SHAPE = `Expected { slug, intent: ${DRAFT_INTENTS.join(' | ')}, lang: ${AI_LANGS_TEXT}, citizenName?, locality? } (text ≤ ${DRAFT_MAX_FIELD} chars).`;

export interface DraftRequest {
  slug: string;
  intent: CitizenIntent;
  lang: AiLang;
  citizenName?: string;
  locality?: string;
}

function optionalText(value: unknown): string | undefined | false {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.length > DRAFT_MAX_FIELD) return false;
  return value;
}

/** Validates a /api/draft body; returns null for anything outside the contract. */
export function parseDraftRequest(body: Record<string, unknown> | null): DraftRequest | null {
  if (!body) return null;
  const citizenName = optionalText(body.citizenName);
  const locality = optionalText(body.locality);
  if (
    typeof body.slug !== 'string' ||
    !DRAFT_INTENTS.includes(body.intent as CitizenIntent) ||
    !isAiLang(body.lang) ||
    citizenName === false ||
    locality === false ||
    Object.keys(body).some((key) => !DRAFT_KEYS.has(key))
  ) {
    return null;
  }
  return { slug: body.slug, intent: body.intent as CitizenIntent, lang: body.lang, citizenName, locality };
}

export interface DraftOptions {
  intent: CitizenIntent;
  lang: AiLang;
  citizenName?: string;
  locality?: string;
  specificIssue?: string;
}

export interface DraftResult {
  subject: string;
  body: string;
  mailtoUrl: string;
  intent: CitizenIntent;
  lang: AiLang;
}

export function generateCitizenDraft(mp: MPRecord, options: DraftOptions): DraftResult {
  const { intent, lang } = options;
  if (lang === 'hi') return finishDraft(hindiDraft(mp, options), intent, lang);
  const { citizenName, locality, specificIssue } = options;
  const nameDisplay = citizenName?.trim() || '[Your Name]';
  const locDisplay = locality?.trim() || `[Your Ward / Area in ${mp.constituency}]`;
  const issueDisplay = specificIssue?.trim() || '[Please specify the local road, hospital, water, school or public service issue]';
  const asOf = formatDate(mp.performance.as_of);
  const perf = mp.performance;
  const isMinister = mp.is_minister || perf.status === 'not_applicable';
  const hasQuestions = !isMinister && perf.questions !== null && perf.questions !== undefined;
  const hasAttendance = !isMinister && perf.attendance_pct !== null && perf.attendance_pct !== undefined;

  // Works-aware line: counts only, and only when the source reports them.
  const wc = mp.mplads?.status === 'reported' ? mp.mplads.works_count : null;
  const mpladsAsOf = mp.mplads?.as_of ? formatDate(mp.mplads.as_of) : null;
  const mpladsSource = mp.mplads?.source?.name ?? null;
  const countParts = (labels: { recommended: string; completed: string }) => {
    const parts: string[] = [];
    if (wc?.recommended !== null && wc?.recommended !== undefined) parts.push(`${wc.recommended} ${labels.recommended}`);
    if (wc?.completed !== null && wc?.completed !== undefined) parts.push(`${wc.completed} ${labels.completed}`);
    return parts;
  };
  const enCounts = countParts({ recommended: 'works recommended', completed: 'works completed' });
  const hiCounts = countParts({ recommended: 'kaam recommend hue', completed: 'kaam poore hue' });
  const mpladsCite = [mpladsSource, mpladsAsOf ? `as of ${mpladsAsOf}` : null].filter(Boolean).join(', ');
  const worksLineEn = enCounts.length
    ? `
Public MPLADS records${mpladsCite ? ` (${mpladsCite})` : ''} list ${enCounts.join(' and ')} for ${mp.constituency}.
`
    : '';
  const worksLineHi = hiCounts.length
    ? `
Public MPLADS records${mpladsAsOf ? ` (${mpladsAsOf} tak)` : ''} ke anusar ${mp.constituency} mein ${hiCounts.join(' aur ')}.
`
    : '';

  let subject = '';
  let body = '';

  if (lang === 'en') {
    switch (intent) {
      case 'mplads_works':
        subject = `Representation regarding MPLADS Local Development Works in ${mp.constituency}`;
        body = `Respected ${mp.name} ji,

I am writing to you as a resident and voter of ${locDisplay} in the ${mp.constituency} parliamentary constituency.

I have been reviewing public records of our constituency's representation in the 18th Lok Sabha.
${worksLineEn}
I would like to respectfully inquire about the status of local development projects recommended under your MPLADS fund for our locality. Specifically, our community faces an urgent need regarding:
${issueDisplay}

Could your office kindly share updates on whether any development works have been sanctioned for this area, or if this matter could be prioritized in your upcoming recommendations?

Thank you for your time and attention.

Warm regards,
${nameDisplay}
${locDisplay}, ${mp.constituency}`;
        break;

      case 'parliament_question':
        subject = `Citizen Request: Raising Constituency Matter in Lok Sabha — ${mp.constituency}`;
        body = `Respected ${mp.name} ji,

Greetings. I am writing as a constituent residing in ${locDisplay}, ${mp.constituency}.
${hasQuestions ? `
According to published parliamentary records as of ${asOf}, ${perf.questions} questions are recorded in your name in the 18th Lok Sabha.
` : ''}
I write to respectfully bring to your kind attention a critical matter impacting many families in our area:
${issueDisplay}

We earnestly request you to consider tabling a parliamentary question or raising this issue during Special Mentions/Zero Hour in the upcoming session. Thank you for considering this request.

With regards,
${nameDisplay}
${locDisplay}, ${mp.constituency}`;
        break;

      case 'attendance_clarification':
        subject = `Inquiry regarding Parliamentary Representation — ${mp.constituency}`;
        body = `Respected ${mp.name} ji,

I am writing to you as a resident of ${locDisplay} in ${mp.constituency}.

${hasAttendance ? `In reviewing the published parliamentary activity indicators for the 18th Lok Sabha, I noted your recorded attendance of ${perf.attendance_pct}% as of ${asOf}. ` : ''}As constituents who follow our constituency's representation in Parliament, we would value learning more about your key legislative focus areas and the initiatives your office is pursuing for ${mp.constituency}.

We would also appreciate knowing how local civic groups can share regular community inputs with your team.

Thank you for your time.

Yours sincerely,
${nameDisplay}
${locDisplay}, ${mp.constituency}`;
        break;

      case 'general_feedback':
      default:
        subject = `Constituency Feedback & Community Inquiry — ${mp.constituency}`;
        body = `Respected ${mp.name} ji,

I am a resident of ${locDisplay} in your constituency, ${mp.constituency}.

I am reaching out to share feedback regarding our neighbourhood.

Our community would like to bring the following local priority to your attention:
${issueDisplay}

We hope to stay informed about your public outreach sessions and look forward to your support in addressing this matter.

Sincerely,
${nameDisplay}
${locDisplay}, ${mp.constituency}`;
        break;
    }
  } else {
    // Hinglish (Roman script per PRD 5.8)
    switch (intent) {
      case 'mplads_works':
        subject = `MPLADS Vikas Karyon ke Sandarbh mein Aavedan — ${mp.constituency}`;
        body = `Aadarniya ${mp.name} ji,

${mp.constituency} sansadiya kshetra ke ${locDisplay} ke ek niwasi ke roop mein yeh patra likha ja raha hai.
${worksLineHi}
Hamare ilaqe ke vikas ke sandarbh mein aapse vinamra nivedan hai ki hamare kshetra mein is samasya par dhyan diya jaye:
${issueDisplay}

Kya aapke karyalaya se pata chal sakta hai ki is vishay par MPLADS fund ke antargat koi yojana prastavit hai ya aane wale samay mein isko prathmikta di jayegi?

Aapke sahyog aur margdarshan ke liye dhanyawad.

Bhavadiya,
${nameDisplay}
${locDisplay}, ${mp.constituency}`;
        break;

      case 'parliament_question':
        subject = `Sansad mein Janhit mudda uthane hetu anurodh — ${mp.constituency}`;
        body = `Aadarniya ${mp.name} ji,

Namaskar. ${mp.constituency} kshetra ke ${locDisplay} ke ek nagrik ke roop mein yeh patra likha ja raha hai.

${hasQuestions ? `${asOf} tak ke sansad records ke mutabik Lok Sabha mein aapke naam se ${perf.questions} sawal darj hain. ` : ''}Hamare ilaqe ke nagrik chahte hain ki aane wale session mein nimnalikhit mahatvapoorna mudda bhi sansad mein uthaya jaye:
${issueDisplay}

Aapse nivedan hai ki Zero Hour ya question hour ke madhyam se is vishay ko kendriya mantralaya ke samaksh rakha jaye.

Aapka aabhari,
${nameDisplay}
${locDisplay}, ${mp.constituency}`;
        break;

      case 'attendance_clarification':
      case 'general_feedback':
      default:
        subject = `Kshetra ke vikas v feedback ke sandarbh mein patra — ${mp.constituency}`;
        body = `Aadarniya ${mp.name} ji,

Namaskar. ${locDisplay}, ${mp.constituency} ke ek niwasi ke roop mein yeh patra likha ja raha hai.

Hamare kshetra se jude nimn mudde par aapka dhyan aakarshit karne ka nivedan hai:
${issueDisplay}

Is vishay par aapke karyalaya ke jawab ki prateeksha rahegi. Dhanyawad.

Shubhkaamnayein,
${nameDisplay}
${locDisplay}, ${mp.constituency}`;
        break;
    }
  }

  return finishDraft({ subject, body }, intent, lang);
}

function finishDraft(draft: { subject: string; body: string }, intent: CitizenIntent, lang: AiLang): DraftResult {
  // Construct mailto URL safely
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
  return { subject: draft.subject, body: draft.body, mailtoUrl, intent, lang };
}

/**
 * Hindi (Devanagari) drafts. Same facts as the English ones; written in the
 * passive ("यह पत्र लिखा जा रहा है") so the text does not assume the writer's
 * gender, and signed "सादर" rather than a gendered closing.
 */
function hindiDraft(mp: MPRecord, options: DraftOptions): { subject: string; body: string } {
  const { intent, citizenName, locality, specificIssue } = options;
  const nameDisplay = citizenName?.trim() || '[आपका नाम]';
  const locDisplay = locality?.trim() || '[आपका इलाका / वार्ड]';
  const issueDisplay =
    specificIssue?.trim() || '[कृपया सड़क, अस्पताल, पानी, स्कूल या किसी सार्वजनिक सेवा से जुड़ी स्थानीय समस्या लिखें]';
  const asOf = formatDate(mp.performance.as_of, 'hi');
  const perf = mp.performance;
  const isMinister = mp.is_minister || perf.status === 'not_applicable';
  const hasQuestions = !isMinister && perf.questions !== null && perf.questions !== undefined;
  const hasAttendance = !isMinister && perf.attendance_pct !== null && perf.attendance_pct !== undefined;

  const wc = mp.mplads?.status === 'reported' ? mp.mplads.works_count : null;
  const mpladsAsOf = mp.mplads?.as_of ? formatDate(mp.mplads.as_of, 'hi') : null;
  const mpladsSource = mp.mplads?.source?.name ?? null;
  const counts: string[] = [];
  if (wc?.recommended !== null && wc?.recommended !== undefined) counts.push(`${wc.recommended} कार्य अनुशंसित`);
  if (wc?.completed !== null && wc?.completed !== undefined) counts.push(`${wc.completed} कार्य पूरे हुए`);
  const cite = [mpladsSource, mpladsAsOf ? `${mpladsAsOf} तक` : null].filter(Boolean).join(', ');
  const worksLine = counts.length
    ? `\nसार्वजनिक MPLADS रिकॉर्ड${cite ? ` (${cite})` : ''} के अनुसार ${mp.constituency} में ${counts.join(' और ')}।\n`
    : '';
  const questionsLine = hasQuestions
    ? `\n${asOf} तक के प्रकाशित संसदीय रिकॉर्ड के अनुसार, 18वीं लोकसभा में आपके नाम से ${perf.questions} प्रश्न दर्ज हैं।\n`
    : '';
  const attendanceLine = hasAttendance
    ? `18वीं लोकसभा के प्रकाशित संसदीय गतिविधि संकेतकों के अनुसार, ${asOf} तक आपकी दर्ज उपस्थिति ${perf.attendance_pct}% है। `
    : '';
  const greeting = `आदरणीय ${mp.name} जी,`;
  const signature = `सादर,\n${nameDisplay}\n${locDisplay}, ${mp.constituency}`;
  const resident = `${mp.constituency} के ${locDisplay} के एक निवासी के रूप में यह पत्र लिखा जा रहा है।`;

  switch (intent) {
    case 'mplads_works':
      return {
        subject: `${mp.constituency} में MPLADS के स्थानीय विकास कार्यों के बारे में अनुरोध`,
        body: [
          greeting,
          '',
          `${mp.constituency} संसदीय निर्वाचन क्षेत्र के ${locDisplay} के एक निवासी और मतदाता के रूप में यह पत्र लिखा जा रहा है।`,
          '',
          `18वीं लोकसभा में हमारे निर्वाचन क्षेत्र से जुड़े सार्वजनिक रिकॉर्ड देखे गए हैं।${worksLine}`,
          'विनम्र अनुरोध है कि हमारे इलाके के लिए आपकी MPLADS निधि से अनुशंसित स्थानीय विकास कार्यों की स्थिति बताई जाए। हमारे इलाके को इस विषय पर ध्यान की ज़रूरत है:',
          issueDisplay,
          '',
          'क्या आपका कार्यालय बता सकता है कि इस इलाके के लिए कोई विकास कार्य स्वीकृत हुआ है, या आने वाली अनुशंसाओं में इस विषय को प्राथमिकता दी जा सकती है?',
          '',
          'आपके समय और ध्यान के लिए धन्यवाद।',
          '',
          signature,
        ].join('\n'),
      };

    case 'parliament_question':
      return {
        subject: `लोकसभा में निर्वाचन क्षेत्र का मुद्दा उठाने का अनुरोध — ${mp.constituency}`,
        body: [
          greeting,
          '',
          `नमस्कार। ${resident}${questionsLine}`,
          'हमारे इलाके के कई परिवारों से जुड़े एक ज़रूरी मुद्दे की ओर आपका ध्यान दिलाने का विनम्र अनुरोध है:',
          issueDisplay,
          '',
          'अनुरोध है कि आने वाले सत्र में इस विषय पर संसदीय प्रश्न रखने, या शून्य काल अथवा विशेष उल्लेख में इसे उठाने पर विचार करें। इस अनुरोध पर विचार करने के लिए धन्यवाद।',
          '',
          signature,
        ].join('\n'),
      };

    case 'attendance_clarification':
      return {
        subject: `संसद में प्रतिनिधित्व के बारे में जानकारी का अनुरोध — ${mp.constituency}`,
        body: [
          greeting,
          '',
          resident,
          '',
          `${attendanceLine}संसद में अपने निर्वाचन क्षेत्र के प्रतिनिधित्व पर ध्यान रखने वाले नागरिकों के रूप में, हम आपके मुख्य विधायी विषयों और ${mp.constituency} के लिए आपके कार्यालय की पहलों के बारे में जानना चाहेंगे।`,
          '',
          'हम यह भी जानना चाहेंगे कि स्थानीय नागरिक समूह आपकी टीम तक नियमित रूप से अपने सुझाव कैसे पहुँचा सकते हैं।',
          '',
          'आपके समय के लिए धन्यवाद।',
          '',
          signature,
        ].join('\n'),
      };

    case 'general_feedback':
    default:
      return {
        subject: `निर्वाचन क्षेत्र से सुझाव और जानकारी का अनुरोध — ${mp.constituency}`,
        body: [
          greeting,
          '',
          `आपके निर्वाचन क्षेत्र ${mp.constituency} के ${locDisplay} के एक निवासी के रूप में यह पत्र लिखा जा रहा है।`,
          '',
          'इसके ज़रिए हमारे मोहल्ले के बारे में कुछ सुझाव साझा किए जा रहे हैं।',
          '',
          'हमारा समुदाय इस स्थानीय प्राथमिकता की ओर आपका ध्यान दिलाना चाहता है:',
          issueDisplay,
          '',
          'अनुरोध है कि आपके जनसंपर्क कार्यक्रमों की जानकारी मिलती रहे। इस विषय पर आपके सहयोग की आशा है।',
          '',
          signature,
        ].join('\n'),
      };
  }
}

