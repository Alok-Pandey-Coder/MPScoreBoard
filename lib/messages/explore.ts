import { defineMessages } from '@/lib/i18n';

/** Map page (app/explore, components/explore). State names come from data. */
export const exploreMessages = defineMessages({
  en: {
    backHome: 'Back to Home',
    eyebrow: 'Geospatial Explorer',
    title: 'India Parliamentary Atlas',
    quickJump: 'Quick Jump:',
    quickJumpAria: 'Jump to a state on the map',
    stateSeatsAria: (name: string, seats: number) => `${name}, ${seats} Lok Sabha seats`,
  },
  hi: {
    backHome: 'होम पर वापस जाएँ',
    eyebrow: 'नक्शे पर देखें',
    title: 'भारत के लोकसभा निर्वाचन क्षेत्रों का नक्शा',
    quickJump: 'सीधे जाएँ:',
    quickJumpAria: 'नक्शे पर किसी राज्य पर जाएँ',
    stateSeatsAria: (name: string, seats: number) => `${name}, लोकसभा की ${seats} सीटें`,
  },
});
