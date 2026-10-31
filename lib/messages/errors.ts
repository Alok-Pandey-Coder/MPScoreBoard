import { defineMessages } from '@/lib/i18n';

/** 404 page (app/not-found.tsx) and error boundary (app/error.tsx). */
export const errorMessages = defineMessages({
  en: {
    notFoundTitle: "We couldn't find that page",
    notFoundBody: 'The link may be mistyped or the page may have moved. Search for an MP, constituency or state below.',
    notFoundLinksAria: 'Useful pages',
    home: 'Home',
    allCards: 'All MP report cards',
    about: 'About & methodology',
    errorTitle: 'Something went wrong',
    errorBody: 'This page could not be shown right now. Please try again, or go back to the home page.',
    retry: 'Retry',
    goHome: 'Go to home page',
  },
  hi: {
    notFoundTitle: 'यह पेज नहीं मिला',
    notFoundBody:
      'हो सकता है लिंक गलत लिखा हो या पेज कहीं और चला गया हो। नीचे किसी सांसद, निर्वाचन क्षेत्र या राज्य को खोजें।',
    notFoundLinksAria: 'काम के पेज',
    home: 'होम',
    allCards: 'सभी सांसदों के रिपोर्ट कार्ड',
    about: 'परिचय और कार्यप्रणाली',
    errorTitle: 'कुछ गड़बड़ हो गई',
    errorBody: 'यह पेज अभी नहीं दिखाया जा सका। कृपया फिर से कोशिश करें, या होम पेज पर वापस जाएँ।',
    retry: 'फिर से कोशिश करें',
    goHome: 'होम पेज पर जाएँ',
  },
});
