import { defineMessages } from '@/lib/i18n';

/** State page (app/state/[state], components/state). State names come from data. */
export const stateMessages = defineMessages({
  en: {
    backToAtlas: 'Back to All-India Atlas',
    switchState: 'Switch state',
    allStates: 'All states',
    india: 'India',
    liveBadge: 'Live',
    seats: (n: number) => `${n} Lok Sabha Seats`,
    capital: 'Capital:',
    representationState: 'State representation in the 18th Lok Sabha',
    representationUt: 'Union territory representation in the 18th Lok Sabha',
    constituenciesIn: (name: string) => `Constituencies in ${name}`,
    minister: 'Minister',
    representedBy: ' is represented by ',
    electedMembers: (n: number) => `${n} elected Members of Parliament`,
    inLowerHouse: ' in the lower house.',
    notAvailableYet: (name: string) =>
      `Report cards for ${name} are not available yet. States are being added one at a time; this page will list each MP's report card once its data has been collected and checked.`,
    exploreNational: 'Explore on national map',
  },
  hi: {
    backToAtlas: 'पूरे भारत के नक्शे पर वापस जाएँ',
    switchState: 'राज्य बदलें',
    allStates: 'सभी राज्य',
    india: 'भारत',
    liveBadge: 'उपलब्ध',
    seats: (n: number) => `लोकसभा की ${n} सीटें`,
    capital: 'राजधानी:',
    representationState: '18वीं लोकसभा में राज्य का प्रतिनिधित्व',
    representationUt: '18वीं लोकसभा में केंद्र शासित प्रदेश का प्रतिनिधित्व',
    constituenciesIn: (name: string) => `${name} के निर्वाचन क्षेत्र`,
    minister: 'मंत्री',
    representedBy: ' का प्रतिनिधित्व लोकसभा (निचले सदन) में ',
    electedMembers: (n: number) => `${n} निर्वाचित संसद सदस्य`,
    inLowerHouse: ' करते हैं।',
    notAvailableYet: (name: string) =>
      `${name} के रिपोर्ट कार्ड अभी उपलब्ध नहीं हैं। राज्य एक-एक करके जोड़े जा रहे हैं; डेटा इकट्ठा करके जाँच लेने के बाद इस पेज पर हर सांसद का रिपोर्ट कार्ड दिखेगा।`,
    exploreNational: 'देश के नक्शे पर देखें',
  },
});
