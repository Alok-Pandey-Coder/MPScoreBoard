import { defineMessages } from '@/lib/i18n';

/**
 * About / methodology page (app/about). Source names and URLs in the sources
 * table are shown as published and are not part of this namespace.
 */
export const aboutMessages = defineMessages({
  en: {
    badge: 'Documentation & Provenance',
    title: 'Methodology, Sources & Transparency',
    intro:
      'How "Mera MP, Mera Report Card" collects, normalises, and reviews parliamentary activity indicators for the 18th Lok Sabha.',

    philosophyHeading: '1. Core Philosophy & Neutrality Principles',
    indicatorsLabel: 'Indicators, Not Verdicts:',
    indicatorsBody:
      'We provide structured, sourced indicators of parliamentary participation. We do not rate, grade, rank, or label MPs as "good" or "bad". Quantitative indicators show recorded participation on the floor of the House; they do not encompass the qualitative depth of legislation, committee leadership, or constituency service.',
    noFalseDataLabel: 'Zero False Data:',
    noFalseDataBody: 'We never convert missing data or pending records to zero. Unavailable fields show "Not available".',
    provenanceLabel: 'Traceable Provenance:',
    provenanceBody:
      "Every number displayed on an MP's card is accompanied by its source name, URL, and the date it was captured or reported.",

    sourcesHeading: '2. Data Sources & Provenance',
    colSource: 'Source Organization',
    colElements: 'Data Elements Collected',
    colStatus: 'Status & As-Of',
    colLicence: 'Licence / Access',
    prsElements: 'Attendance %, Debates, Questions, Private Member Bills, State & National Averages',
    prsStatus: '18th Lok Sabha (to 13 Aug 2026)',
    prsLicence: 'CC BY 4.0 Attribution',
    sansadElements: 'Official sitting members master list, MP IDs, tenure dates',
    sansadStatus: 'Current Sitting (Oct 2026)',
    sansadLicence: 'Official Parliamentary Portal',
    delhiElements: '7 Delhi parliamentary constituencies official directory',
    delhiStatus: 'Current Masterlist',
    delhiLicence: 'Official Government Portal',
    eciElements: 'Form 26 Sworn Candidate Affidavits (Assets, Education, Cases)',
    eciStatus: '2024 General Elections',
    eciLicence: 'Statutory Public Filings',

    ministersHeading: '3. Treatment of Ministers & Special Roles',
    ministersIntroBefore: 'Lok Sabha members who are ministers in the Union Council of Ministers are shown as ',
    ministersNotApplicable: 'Not applicable (minister)',
    ministersIntroAfter: ' for attendance, questions, debates and private member bills, never as zero.',
    ministersConvention: 'By parliamentary convention:',
    ministersPoint1: 'Ministers represent the executive government and do not sign the floor attendance register.',
    ministersPoint2: 'Ministers respond to parliamentary questions rather than submitting questions to other ministries.',
    ministersPoint3: 'Ministers do not introduce Private Member Bills.',
    ministersZero: 'Treating these indicators as "0" would be factually incorrect and misleading.',

    averagesHeading: '4. Calculation of Benchmarks & Averages',
    stateAvgLabel: 'State Average:',
    stateAvgBody:
      'Computed across all MPs representing constituencies in that state, explicitly excluding ministers and null/missing entries.',
    nationalAvgLabel: 'National Average:',
    nationalAvgBody:
      'The nationwide benchmark of all non-minister sitting members across the 18th Lok Sabha as published by PRS Legislative Research.',
    thresholdsLabel: 'Difference Wording Thresholds:',
    thrAttendance1: 'Attendance: within ±5.0 percentage points is described as ',
    thrSimilar: '"similar to average"',
    thrAttendance2: '; above as ',
    thrHigher: '"higher than"',
    thrAttendance3: '; below as ',
    thrLower: '"lower than"',
    thrAttendance4: '.',
    thrCounts1: 'Debates & Questions: within ±10% of the average is described as ',
    thrCounts2: '.',

    affidavitHeading: '5. Affidavit data explained',
    affidavitSelfDeclared:
      'Assets, liabilities, education and declared cases are shown as declared in the election affidavit (Form 26) that the candidate filed at nomination. They are self-declared and are not independently verified by this project.',
    affidavitYear:
      'The card shows the election year of the affidavit. Figures describe the position on that date and may have changed since.',
    affidavitCases:
      'Declared criminal cases are pending cases or allegations as declared by the candidate. They are not convictions, and they are shown without any judgement.',
    affidavitAssets:
      'Declared assets are not the current net worth. They are the values stated in the affidavit, which may use different valuation methods and do not reflect later changes.',

    limitationsHeading: '6. Limitations and known gaps',
    limitCoverage: (seats: number, total: number, states: number) =>
      `Coverage so far: report cards for ${seats} of ${total} Lok Sabha constituencies, across ${states} ${states === 1 ? 'state or union territory' : 'states and union territories'}. More are being added.`,
    limitWorks:
      'MPLADS works lists can be partial. When only some works are available, the card says how many are shown out of the reported total.',
    limitSecondary:
      'Some MPLADS figures come from a secondary source. The card labels them, and they are pending verification against the official MoSPI eSAKSHI portal.',
    limitActivity:
      "PRS indicators (attendance, debates, questions, private member bills) measure recorded activity in the House, not the quality of an MP's work.",
    limitMinisters:
      'For ministers, these activity indicators are shown as not applicable, because the source does not record them for ministers.',
    limitSnapshot:
      'The site shows a dated snapshot, not live data. Each figure carries the date it was captured or reported; check the linked source for the latest position.',

    iconCreditsNote: (sets: string) => `State card icons: ${sets}, open-source icon sets served through Iconify, used under the MIT licence.`,
    imageCreditsHeading: 'State picture credits',
    imageCreditsNote: 'Monument and emblem pictures on the state cards. Each is shown under its own licence.',
    aiHeading: '7. AI usage and safeguards',
    aiScope:
      "AI is used only to write the optional plain-language summary on a card, from that card's structured data. It does not add facts, sources or opinions.",
    aiChecks:
      'Every number in an AI summary is checked against the record. If any check fails, or the AI service is unavailable, the summary is replaced by a fixed template written from the same data.',
    aiPipeline:
      'No AI is used in the data pipeline: collecting, normalising, merging and validating the data is done by deterministic scripts.',

    disclaimerHeading: '8. Legal & Academic Disclaimer',
    disclaimer:
      '"Mera MP, Mera Report Card" is an independent civic project developed for citizen empowerment at hackCBS 9.0. It is not affiliated with, approved by, or representing the Parliament of India, the Election Commission of India, or any political party.',
    snapshotVersion: (version: string) => `Active snapshot version: ${version}`,
    feedbackLink: 'Submit a data feedback issue on GitHub',
  },
  hi: {
    badge: 'दस्तावेज़ और स्रोत की जानकारी',
    title: 'कार्यप्रणाली, स्रोत और पारदर्शिता',
    intro:
      '"मेरा सांसद, मेरा रिपोर्ट कार्ड" 18वीं लोकसभा के लिए संसद में गतिविधि के संकेतक कैसे इकट्ठा करता है, उन्हें एक जैसे रूप में लाता है और उनकी जाँच करता है।',

    philosophyHeading: '1. मूल सोच और निष्पक्षता के सिद्धांत',
    indicatorsLabel: 'संकेतक, फ़ैसले नहीं:',
    indicatorsBody:
      'हम संसद में भागीदारी के व्यवस्थित संकेतक, उनके स्रोत के साथ, देते हैं। हम सांसदों को अंक, ग्रेड या रैंक नहीं देते, और न ही उन्हें "अच्छा" या "बुरा" कहते हैं। ये संख्या वाले संकेतक सदन में दर्ज भागीदारी दिखाते हैं; इनमें कानून बनाने के काम की गहराई, समितियों में नेतृत्व या निर्वाचन क्षेत्र में किया गया काम शामिल नहीं है।',
    noFalseDataLabel: 'कोई मनगढ़ंत डेटा नहीं:',
    noFalseDataBody:
      'हम छूटे हुए डेटा या लंबित रिकॉर्ड को कभी शून्य नहीं बनाते। जो जानकारी उपलब्ध नहीं है, वहाँ "उपलब्ध नहीं" लिखा दिखता है।',
    provenanceLabel: 'हर तथ्य का स्रोत:',
    provenanceBody:
      'सांसद के कार्ड पर दिखने वाली हर संख्या के साथ उसके स्रोत का नाम, लिंक (URL) और वह तारीख दी जाती है जब उसे लिया गया या प्रकाशित किया गया।',

    sourcesHeading: '2. डेटा स्रोत और उनकी जानकारी',
    colSource: 'स्रोत संस्था',
    colElements: 'ली गई जानकारी',
    colStatus: 'स्थिति और तारीख',
    colLicence: 'लाइसेंस / पहुँच',
    prsElements: 'उपस्थिति %, बहस, प्रश्न, निजी सदस्य विधेयक, राज्य औसत और राष्ट्रीय औसत',
    prsStatus: '18वीं लोकसभा (13 अगस्त 2026 तक)',
    prsLicence: 'CC BY 4.0 (श्रेय देना ज़रूरी)',
    sansadElements: 'मौजूदा सदस्यों की आधिकारिक सूची, सांसद ID, कार्यकाल की तारीखें',
    sansadStatus: 'मौजूदा सदस्य (अक्टूबर 2026)',
    sansadLicence: 'संसद का आधिकारिक पोर्टल',
    delhiElements: 'दिल्ली के 7 लोकसभा निर्वाचन क्षेत्रों की आधिकारिक सूची',
    delhiStatus: 'मौजूदा मुख्य सूची',
    delhiLicence: 'सरकार का आधिकारिक पोर्टल',
    eciElements: 'फ़ॉर्म 26 – उम्मीदवारों के शपथ लेकर दिए गए हलफ़नामे (संपत्ति, शिक्षा, घोषित मामले)',
    eciStatus: '2024 के आम चुनाव',
    eciLicence: 'कानून के तहत दाखिल सार्वजनिक दस्तावेज़',

    ministersHeading: '3. मंत्रियों और विशेष पदों का डेटा कैसे दिखाया जाता है',
    ministersIntroBefore:
      'जो लोकसभा सदस्य केंद्रीय मंत्रिपरिषद में मंत्री हैं, उनकी उपस्थिति, प्रश्न, बहस और निजी सदस्य विधेयक के आगे ',
    ministersNotApplicable: 'लागू नहीं (मंत्री)',
    ministersIntroAfter: ' लिखा जाता है, कभी शून्य नहीं।',
    ministersConvention: 'संसद की परंपरा के अनुसार:',
    ministersPoint1: 'मंत्री सरकार (कार्यपालिका) की ओर से होते हैं और सदन के उपस्थिति रजिस्टर पर हस्ताक्षर नहीं करते।',
    ministersPoint2: 'मंत्री दूसरे मंत्रालयों से प्रश्न पूछने के बजाय संसद में पूछे गए प्रश्नों के उत्तर देते हैं।',
    ministersPoint3: 'मंत्री निजी सदस्य विधेयक पेश नहीं करते।',
    ministersZero: 'इन संकेतकों को "0" दिखाना तथ्य के हिसाब से गलत और भ्रामक होगा।',

    averagesHeading: '4. तुलना के मानक और औसत कैसे निकाले जाते हैं',
    stateAvgLabel: 'राज्य औसत:',
    stateAvgBody:
      'उस राज्य के निर्वाचन क्षेत्रों का प्रतिनिधित्व करने वाले सभी सांसदों के आधार पर निकाला जाता है; इसमें मंत्रियों और खाली या उपलब्ध नहीं वाली प्रविष्टियों को जान-बूझकर शामिल नहीं किया जाता।',
    nationalAvgLabel: 'राष्ट्रीय औसत:',
    nationalAvgBody:
      '18वीं लोकसभा के उन सभी मौजूदा सदस्यों का देशभर का औसत जो मंत्री नहीं हैं, जैसा PRS Legislative Research ने प्रकाशित किया है।',
    thresholdsLabel: 'अंतर बताने वाले शब्द कब इस्तेमाल होते हैं:',
    thrAttendance1: 'उपस्थिति: औसत से ±5.0 प्रतिशत अंक के भीतर हो तो ',
    thrSimilar: '"औसत के लगभग बराबर"',
    thrAttendance2: ' कहा जाता है; उससे ऊपर हो तो ',
    thrHigher: '"औसत से अधिक"',
    thrAttendance3: '; उससे नीचे हो तो ',
    thrLower: '"औसत से कम"',
    thrAttendance4: '।',
    thrCounts1: 'बहस और प्रश्न: औसत से ±10% के भीतर हो तो ',
    thrCounts2: ' कहा जाता है।',

    affidavitHeading: '5. हलफ़नामे का डेटा क्या बताता है',
    affidavitSelfDeclared:
      'संपत्ति, देनदारियाँ, शिक्षा और घोषित मामले उसी रूप में दिखाए जाते हैं जैसे उम्मीदवार ने नामांकन के समय चुनावी हलफ़नामे (फ़ॉर्म 26) में घोषित किए। यह जानकारी उम्मीदवार ने ख़ुद दी है; यह परियोजना इसकी अलग से जाँच नहीं करती।',
    affidavitYear:
      'कार्ड पर हलफ़नामे का चुनाव वर्ष दिखाया जाता है। आँकड़े उस समय की स्थिति बताते हैं और बाद में बदल चुके हो सकते हैं।',
    affidavitCases:
      'घोषित आपराधिक मामले उम्मीदवार द्वारा घोषित लंबित मामले या आरोप हैं। ये दोषसिद्धि नहीं हैं, और इन्हें बिना किसी टिप्पणी के दिखाया जाता है।',
    affidavitAssets:
      'घोषित संपत्ति मौजूदा कुल संपत्ति (नेट वर्थ) नहीं है। ये हलफ़नामे में बताए गए मूल्य हैं, जिनके आकलन के तरीके अलग हो सकते हैं और जिनमें बाद के बदलाव शामिल नहीं हैं।',

    limitationsHeading: '6. सीमाएँ और ज्ञात कमियाँ',
    limitCoverage: (seats: number, total: number, states: number) =>
      `अब तक की कवरेज: ${total} में से ${seats} लोकसभा निर्वाचन क्षेत्रों के रिपोर्ट कार्ड, ${states} ${states === 1 ? 'राज्य या केंद्र शासित प्रदेश' : 'राज्यों और केंद्र शासित प्रदेशों'} में। और जोड़े जा रहे हैं।`,
    limitWorks:
      'MPLADS कार्यों की सूची अधूरी हो सकती है। जब केवल कुछ कार्य उपलब्ध हों, तो कार्ड बताता है कि कुल दर्ज कार्यों में से कितने दिखाए गए हैं।',
    limitSecondary:
      'MPLADS के कुछ आँकड़े द्वितीयक स्रोत से लिए गए हैं। कार्ड पर इन्हें अलग से चिह्नित किया जाता है, और MoSPI के आधिकारिक eSAKSHI पोर्टल से इनका मिलान अभी बाकी है।',
    limitActivity:
      'PRS के संकेतक (उपस्थिति, बहस, प्रश्न, निजी सदस्य विधेयक) सदन में दर्ज गतिविधि बताते हैं, सांसद के काम की गुणवत्ता नहीं।',
    limitMinisters:
      'मंत्रियों के लिए ये गतिविधि संकेतक "लागू नहीं" दिखाए जाते हैं, क्योंकि स्रोत इन्हें मंत्रियों के लिए दर्ज नहीं करता।',
    limitSnapshot:
      'साइट एक तय तारीख का स्नैपशॉट दिखाती है, लाइव डेटा नहीं। हर आँकड़े के साथ वह तारीख दी जाती है जब उसे लिया या प्रकाशित किया गया; ताज़ा स्थिति के लिए दिया गया स्रोत देखें।',

    iconCreditsNote: (sets: string) => `राज्य कार्ड के आइकन: ${sets}, Iconify से मिले ओपन-सोर्स आइकन सेट, MIT लाइसेंस के तहत इस्तेमाल किए गए।`,
    imageCreditsHeading: 'राज्यों की तस्वीरों का श्रेय',
    imageCreditsNote: 'राज्य कार्ड पर दिखने वाली स्मारक और प्रतीक की तस्वीरें। हर तस्वीर अपने लाइसेंस के तहत दिखाई गई है।',
    aiHeading: '7. AI का उपयोग और सुरक्षा उपाय',
    aiScope:
      'AI का उपयोग केवल कार्ड पर वैकल्पिक सरल भाषा का सारांश लिखने के लिए होता है, और वह भी उसी कार्ड के व्यवस्थित डेटा से। यह कोई नया तथ्य, स्रोत या राय नहीं जोड़ता।',
    aiChecks:
      'AI सारांश की हर संख्या का रिकॉर्ड से मिलान किया जाता है। अगर कोई जाँच विफल हो या AI सेवा उपलब्ध न हो, तो सारांश की जगह उसी डेटा से बना एक तय टेम्पलेट दिखाया जाता है।',
    aiPipeline:
      'डेटा पाइपलाइन में AI का उपयोग नहीं होता: डेटा इकट्ठा करना, एक जैसे रूप में लाना, जोड़ना और जाँचना तय नियमों वाली स्क्रिप्ट से होता है।',

    disclaimerHeading: '8. कानूनी और शैक्षणिक अस्वीकरण',
    disclaimer:
      '"मेरा सांसद, मेरा रिपोर्ट कार्ड" एक स्वतंत्र नागरिक परियोजना है, जिसे नागरिकों को सशक्त बनाने के लिए hackCBS 9.0 में बनाया गया है। यह भारत की संसद, भारत निर्वाचन आयोग या किसी भी राजनीतिक दल से जुड़ी नहीं है, उनके द्वारा स्वीकृत नहीं है, और उनका प्रतिनिधित्व नहीं करती।',
    snapshotVersion: (version: string) => `मौजूदा स्नैपशॉट संस्करण: ${version}`,
    feedbackLink: 'डेटा से जुड़ी समस्या GitHub पर दर्ज करें',
  },
});
