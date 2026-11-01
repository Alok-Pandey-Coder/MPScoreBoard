import { defineMessages } from '@/lib/i18n';

/** Home page: hero, search bar, territory bar, MP cards, state cards and picker. */
export const homeMessages = defineMessages({
  en: {
    // HomeClient
    loadingMap: 'Loading map…',
    heroEyebrow: 'LOK SABHA 2024–29 · PUBLIC RECORDS · NON-PARTISAN',
    heroTitleLead: "Know your MP's record",
    heroTitleAccent: 'in 60 seconds.',
    heroIntro:
      'A neutral report card for your Member of Parliament: attendance, debates, questions, private member bills, local development (MPLADS) funds and the details they declared when they stood for election. Every number links to its public source and date.',
    ctaMap: 'Find your area on the map',
    ctaCards: 'See all MP report cards',
    ctaStates: 'Browse by state',
    termEyebrow: 'LOK SABHA 2024–29',
    cardsTitle: 'MP report cards',
    cardsIntro: 'Each card lists its sources, retrieval dates and review status.',
    cardsBadge: 'Sources linked on every card',
    statesEyebrow: 'BY STATE',
    statesTitle: 'Browse by state and union territory',
    openMap: 'Open the map',
    indiaEyebrow: 'MAP OF INDIA',
    indiaTitle: (seats: number) => `36 states and union territories, ${seats} Lok Sabha seats`,
    pickerLead: 'or pick a state and constituency',

    // NagrikTerritoryBar
    territoryEyebrow: 'Lok Sabha 2024–29',
    mapTitle: 'Find your MP on the map',
    mapIntro:
      "Tap your area to open its MP's report card: attendance, questions, debates and local development funds, each with its source.",
    cardsChip: (n: number) => `${n} report cards · sources on each`,
    aboutData: 'About the data',
    statReportCards: 'Report cards',
    statReportCardsSub: (total: number) => `of ${total} Lok Sabha constituencies`,
    statSittingMPs: 'Sitting MPs',
    statAffidavitSub: (n: number, total: number) => `Affidavit data for ${n} of ${total}`,
    statQuestions: 'Questions Asked (total)',
    statQuestionsMPs: (n: number) => `${n} MPs, PRS`,
    asOf: (date: string) => `, as of ${date}`,
    ministersNotApplicable: (n: number) => ` · ${n} minister not applicable`,
    statMplads: 'MPLADS funds allocated',
    spendingNotAvailable: 'Spending not available',
    spentSub: (amount: string, n: number) => `${amount} spent · ${n} MPs · secondary source`,
    tabMap: 'Map',
    tabCards: 'MP report cards',
    tabStates: 'Browse by state',
    tabAbout: 'About the data',

    // QuickCardsGrid
    defaultTerm: '18th Lok Sabha',
    ministerNotApplicable: 'Minister: indicators not applicable',
    ministerNote:
      "Ministers don't sign the attendance register, ask questions or introduce private member bills, so these indicators don't apply.",
    attendance: 'Attendance',
    questions: 'Questions',
    stateAvg: (state: string, value: string) => `PRS ${state} avg: ${value}`,
    stateAvgNotAvailable: 'State avg not available',
    pendingCases: 'Pending cases (as declared in affidavit):',
    viewReportCardSources: 'View Report Card & Sources',

    // NagrikStateCardsGrid
    typeState: 'State',
    typeUnionTerritory: 'Union Territory',
    lokSabhaSeats: 'Lok Sabha seats',
    cardsAvailable: (n: number, total: number) => `${n} of ${total} report cards available`,
    cardsComingSoon: 'Report cards coming soon',
    linkConstituencies: 'Constituencies',
    pagePrev: '← Previous',
    pageNext: 'Next →',
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
    linkMPs: 'MPs',

    // StateConstituencyPicker
    pickerTitle: 'Direct Seat Directory',
    selectState: 'Select State / UT',
    seatsOption: (n: number) => `${n} Seats`,
    selectSeat: 'Select Parliamentary Seat',
    open: 'Open',

    // UnifiedSearchBar
    searchPlaceholder: 'Search by MP name, constituency or state',
    clearSearch: 'Clear search',
    jumpTo: 'Jump to:',
    resultsHeading: (n: number) => `Matching Constituencies & MPs (${n})`,
    keyboardHint: '↑↓ to navigate · Enter to select',
    minister: 'Minister',
    noMatch: (query: string) => `No MP or constituency matches "${query}".`,
  },
  hi: {
    // HomeClient
    loadingMap: 'नक्शा लोड हो रहा है…',
    heroEyebrow: 'लोकसभा 2024–29 · सार्वजनिक रिकॉर्ड · निष्पक्ष',
    heroTitleLead: 'अपने सांसद का रिकॉर्ड जानें',
    heroTitleAccent: '60 सेकंड में।',
    heroIntro:
      'आपके संसद सदस्य का एक निष्पक्ष रिपोर्ट कार्ड: उपस्थिति, बहस, प्रश्न, निजी सदस्य विधेयक, स्थानीय विकास (MPLADS) निधि और चुनाव लड़ते समय चुनावी हलफ़नामे में घोषित जानकारी। हर संख्या अपने सार्वजनिक स्रोत और तारीख से जुड़ी है।',
    ctaMap: 'नक्शे पर अपना इलाका खोजें',
    ctaCards: 'सभी सांसदों के रिपोर्ट कार्ड देखें',
    ctaStates: 'राज्य के अनुसार देखें',
    termEyebrow: 'लोकसभा 2024–29',
    cardsTitle: 'सांसदों के रिपोर्ट कार्ड',
    cardsIntro: 'हर कार्ड पर उसके स्रोत, डेटा लेने की तारीख और जाँच की स्थिति दी गई है।',
    cardsBadge: 'हर कार्ड पर स्रोत के लिंक',
    statesEyebrow: 'राज्यवार',
    statesTitle: 'राज्य और केंद्र शासित प्रदेश के अनुसार देखें',
    openMap: 'नक्शा खोलें',
    indiaEyebrow: 'भारत का नक्शा',
    indiaTitle: (seats: number) => `36 राज्य और केंद्र शासित प्रदेश, ${seats} लोकसभा सीटें`,
    pickerLead: 'या राज्य और निर्वाचन क्षेत्र चुनें',

    // NagrikTerritoryBar
    territoryEyebrow: 'लोकसभा 2024–29',
    mapTitle: 'नक्शे पर अपना सांसद खोजें',
    mapIntro:
      'अपने इलाके पर टैप करें और वहाँ के सांसद का रिपोर्ट कार्ड खोलें: उपस्थिति, प्रश्न, बहस और स्थानीय विकास निधि, हर जानकारी उसके स्रोत के साथ।',
    cardsChip: (n: number) => `${n} रिपोर्ट कार्ड · हर एक पर स्रोत`,
    aboutData: 'डेटा के बारे में',
    statReportCards: 'रिपोर्ट कार्ड',
    statReportCardsSub: (total: number) => `${total} लोकसभा निर्वाचन क्षेत्रों में से`,
    statSittingMPs: 'मौजूदा सांसद',
    statAffidavitSub: (n: number, total: number) => `${total} में से ${n} का हलफ़नामा डेटा`,
    statQuestions: 'पूछे गए प्रश्न (कुल)',
    statQuestionsMPs: (n: number) => `${n} सांसद, PRS`,
    asOf: (date: string) => `, ${date} तक`,
    ministersNotApplicable: (n: number) => ` · ${n} मंत्री: लागू नहीं`,
    statMplads: 'आवंटित MPLADS निधि',
    spendingNotAvailable: 'खर्च की जानकारी उपलब्ध नहीं',
    spentSub: (amount: string, n: number) => `${amount} खर्च · ${n} सांसद · द्वितीयक स्रोत`,
    tabMap: 'नक्शा',
    tabCards: 'सांसदों के रिपोर्ट कार्ड',
    tabStates: 'राज्य के अनुसार देखें',
    tabAbout: 'डेटा के बारे में',

    // QuickCardsGrid
    defaultTerm: '18वीं लोकसभा',
    ministerNotApplicable: 'मंत्री: ये संकेतक लागू नहीं',
    ministerNote:
      'मंत्री उपस्थिति रजिस्टर पर हस्ताक्षर नहीं करते, प्रश्न नहीं पूछते और निजी सदस्य विधेयक पेश नहीं करते, इसलिए ये संकेतक उन पर लागू नहीं होते।',
    attendance: 'उपस्थिति',
    questions: 'प्रश्न',
    stateAvg: (state: string, value: string) => `PRS ${state} औसत: ${value}`,
    stateAvgNotAvailable: 'राज्य औसत उपलब्ध नहीं',
    pendingCases: 'लंबित मामले (चुनावी हलफ़नामे में घोषित):',
    viewReportCardSources: 'रिपोर्ट कार्ड और स्रोत देखें',

    // NagrikStateCardsGrid
    typeState: 'राज्य',
    typeUnionTerritory: 'केंद्र शासित प्रदेश',
    lokSabhaSeats: 'लोकसभा सीटें',
    cardsAvailable: (n: number, total: number) => `${total} में से ${n} रिपोर्ट कार्ड उपलब्ध`,
    cardsComingSoon: 'रिपोर्ट कार्ड जल्द आएँगे',
    linkConstituencies: 'निर्वाचन क्षेत्र',
    pagePrev: '← पिछला',
    pageNext: 'अगला →',
    pageOf: (page: number, total: number) => `पृष्ठ ${page} / ${total}`,
    linkMPs: 'सांसद',

    // StateConstituencyPicker
    pickerTitle: 'सीधे सीट चुनें',
    selectState: 'राज्य / केंद्र शासित प्रदेश चुनें',
    seatsOption: (n: number) => `${n} सीटें`,
    selectSeat: 'लोकसभा सीट चुनें',
    open: 'खोलें',

    // UnifiedSearchBar
    searchPlaceholder: 'सांसद, निर्वाचन क्षेत्र या राज्य का नाम अंग्रेज़ी में लिखें',
    clearSearch: 'खोज साफ़ करें',
    jumpTo: 'सीधे जाएँ:',
    resultsHeading: (n: number) => `मिलते-जुलते निर्वाचन क्षेत्र और सांसद (${n})`,
    keyboardHint: '↑↓ से ऊपर-नीचे जाएँ · चुनने के लिए Enter',
    minister: 'मंत्री',
    noMatch: (query: string) => `"${query}" से मिलता कोई सांसद या निर्वाचन क्षेत्र नहीं मिला।`,
  },
});
