import { CitizenIntent, MPRecord } from '../../types/mp';
import { formatDate } from '../formatters';

export interface DraftOptions {
  intent: CitizenIntent;
  lang: 'en' | 'hinglish';
  citizenName?: string;
  locality?: string;
  specificIssue?: string;
}

export interface DraftResult {
  subject: string;
  body: string;
  mailtoUrl: string;
  intent: CitizenIntent;
  lang: 'en' | 'hinglish';
}

export function generateCitizenDraft(mp: MPRecord, options: DraftOptions): DraftResult {
  const { intent, lang, citizenName, locality, specificIssue } = options;
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

  // Construct mailto URL safely
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return {
    subject,
    body,
    mailtoUrl,
    intent,
    lang,
  };
}

