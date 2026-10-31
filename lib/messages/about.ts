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

    disclaimerHeading: '5. Legal & Academic Disclaimer',
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

    disclaimerHeading: '5. कानूनी और शैक्षणिक अस्वीकरण',
    disclaimer:
      '"मेरा सांसद, मेरा रिपोर्ट कार्ड" एक स्वतंत्र नागरिक परियोजना है, जिसे नागरिकों को सशक्त बनाने के लिए hackCBS 9.0 में बनाया गया है। यह भारत की संसद, भारत निर्वाचन आयोग या किसी भी राजनीतिक दल से जुड़ी नहीं है, उनके द्वारा स्वीकृत नहीं है, और उनका प्रतिनिधित्व नहीं करती।',
    snapshotVersion: (version: string) => `मौजूदा स्नैपशॉट संस्करण: ${version}`,
    feedbackLink: 'डेटा से जुड़ी समस्या GitHub पर दर्ज करें',
  },
});
