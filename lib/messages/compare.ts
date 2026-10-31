import { defineMessages } from '@/lib/i18n';

/** Compare page (app/compare, components/compare). */
export const compareMessages = defineMessages({
  en: {
    loading: 'Loading MP comparison matrix...',
    eyebrow: 'PARLIAMENTARY BENCHMARK MATRIX',
    title: 'Side-by-Side MP Comparison',
    subtitle: 'Factual indicator benchmarking without subjective scoring or ordinal rankings',
    share: 'Share Link',
    shareAria: 'Copy a link to this comparison',
    notice:
      "These are activity indicators from PRS Legislative Research, shown side by side. They are not a rank, score or judgement of an MP's work.",
    memberA: 'Member A',
    memberB: 'Member B',
    minister: 'Minister',
    viewFull: 'View Full Dossier',
    attendance: 'Parliamentary Attendance Rate',
    debates: 'Debates Participated',
    questions: 'Questions Submitted',
    privateMemberBills: 'Private Member Bills',
    notApplicableMinister: 'Not applicable (minister)',
    copied: 'Comparison link copied to clipboard!',
  },
  hi: {
    loading: 'सांसदों की तुलना लोड हो रही है...',
    eyebrow: 'संसद में गतिविधि की तुलना',
    title: 'सांसदों की साथ-साथ तुलना',
    subtitle: 'तथ्यों पर आधारित संकेतकों की तुलना, बिना किसी अंक या रैंकिंग के',
    share: 'लिंक शेयर करें',
    shareAria: 'इस तुलना का लिंक कॉपी करें',
    notice:
      'ये PRS Legislative Research से लिए गए गतिविधि के संकेतक हैं, जिन्हें साथ-साथ दिखाया गया है। ये किसी सांसद के काम की रैंक, अंक या उस पर फ़ैसला नहीं हैं।',
    memberA: 'सदस्य A',
    memberB: 'सदस्य B',
    minister: 'मंत्री',
    viewFull: 'पूरा रिपोर्ट कार्ड देखें',
    attendance: 'संसद में उपस्थिति',
    debates: 'बहस में भागीदारी',
    questions: 'पूछे गए प्रश्न',
    privateMemberBills: 'निजी सदस्य विधेयक',
    notApplicableMinister: 'लागू नहीं (मंत्री)',
    copied: 'तुलना का लिंक कॉपी हो गया!',
  },
});
