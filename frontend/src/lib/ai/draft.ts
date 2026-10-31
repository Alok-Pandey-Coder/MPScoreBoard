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

  let subject = '';
  let body = '';

  if (lang === 'en') {
    switch (intent) {
      case 'mplads_works':
        subject = `Representation regarding MPLADS Local Development Works in ${mp.constituency}`;
        body = `Respected ${mp.name} ji,

I am writing to you as a resident and voter of ${locDisplay} in the ${mp.constituency} parliamentary constituency.

I have been reviewing public records of our constituency's representation in the 18th Lok Sabha. As a concerned citizen, I would like to respectfully inquire about the status of local development projects recommended under your MPLADS fund for our locality. Specifically, our community faces an urgent need regarding:
${issueDisplay}

Could your office kindly share updates on whether any development works have been sanctioned for this area, or if this matter could be prioritized in your upcoming recommendations?

Thank you for your service and dedication to the people of ${mp.constituency}.

Warm regards,
${nameDisplay}
${locDisplay}, ${mp.constituency}`;
        break;

      case 'parliament_question':
        subject = `Citizen Request: Raising Constituency Matter in Lok Sabha — ${mp.constituency}`;
        body = `Respected ${mp.name} ji,

Greetings. As a constituent residing in ${locDisplay}, ${mp.constituency}, I am grateful for your ongoing representation in the 18th Lok Sabha.

According to published parliamentary records as of ${asOf}, you have raised ${mp.performance.questions ?? 'several'} questions and actively participated in parliamentary discussions. 

I write to respectfully bring to your kind attention a critical matter impacting many families in our area:
${issueDisplay}

We earnestly request you to consider tabling a parliamentary question or raising this issue during Special Mentions/Zero Hour in the upcoming session. Your voice in the House will bring vital government attention to our local challenge.

With highest regards,
${nameDisplay}
${locDisplay}, ${mp.constituency}`;
        break;

      case 'attendance_clarification':
        subject = `Inquiry regarding Parliamentary Representation — ${mp.constituency}`;
        body = `Respected ${mp.name} ji,

I am writing to you as a resident of ${locDisplay} in ${mp.constituency}.

In reviewing the published parliamentary activity indicators for the 18th Lok Sabha, I noted your recorded attendance of ${mp.performance.attendance_pct ?? 'N/A'}% as of ${asOf}. As active constituents who closely follow our constituency's progress in Parliament, we would value learning more about your key legislative focus areas and the initiatives your office is pursuing for ${mp.constituency}.

We would also appreciate knowing how local civic groups can share regular community inputs with your team.

Thank you for your continuous efforts on behalf of ${mp.constituency}.

Yours sincerely,
${nameDisplay}
${locDisplay}, ${mp.constituency}`;
        break;

      case 'general_feedback':
      default:
        subject = `Constituency Feedback & Community Inquiry — ${mp.constituency}`;
        body = `Respected ${mp.name} ji,

I am a resident of ${locDisplay} in your constituency, ${mp.constituency}.

I am reaching out to share constructive feedback regarding our neighborhood and to appreciate your work representing ${mp.constituency} in the 18th Lok Sabha. 

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

Main ${mp.constituency} sansadiya kshetra ke ${locDisplay} ka niwasi hoon aur 18th Lok Sabha mein aapke karya ko follow kar raha hoon.

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

Namaskar. Main ${mp.constituency} kshetra ke ${locDisplay} ka ek jagruk nagrik hoon.

${asOf} tak ke sansad records ke mutabik aapne Lok Sabha mein ${mp.performance.questions ?? 0} sawal uthaye hain. Hamare ilaqe ke nagrik chahte hain ki aane wale session mein nimnalikhit mahatvapoorna mudda bhi sansad mein uthaya jaye:
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

Main ${locDisplay}, ${mp.constituency} ka niwasi hoon aur aapko apne ilaqe ki or se sadar pranaam karta hoon.

18th Lok Sabha mein aapke netritva mein hamare kshetra se jude nimn mudde par aapka dhyan aakarshit karna chahta hoon:
${issueDisplay}

Aasha hai ki aap is vishay ko samay par prathmikta denge. Hamara pura sahyog aapke sath hai.

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

