import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { Employee, Quiz, TrainingSection, Training, Completion } from '@shared/types';

// Arrays for generating mock data
const firstNames = ['Ramesh', 'Priya', 'Suresh', 'Anita', 'Vikram', 'Kavitha', 'Rajan', 'Deepa', 'Arjun', 'Sunita', 'Mohammed', 'Fatima', 'Rajesh', 'Pooja', 'Arun', 'Lakshmi', 'Santosh', 'Meena', 'Dinesh', 'Rashida', 'Sunil', 'Rekha', 'Prasad', 'Shobha', 'Vinod', 'Nalini', 'Ganesh', 'Sarla', 'Ravi', 'Usha'];
const lastNames = ['Kumar', 'Sharma', 'Reddy', 'Patel', 'Singh', 'Nair', 'Pillai', 'Menon', 'Verma', 'Gupta', 'Ali', 'Begum', 'Yadav', 'Tiwari', 'Patil', 'Devi', 'Kumari', 'Joshi', 'Khan', 'Mehta'];

const departments = [
  { id: 'customer-service', name: 'Customer Service' },
  { id: 'product-knowledge', name: 'Product Knowledge' },
  { id: 'store-operations', name: 'Store Operations' },
  { id: 'safety-training', name: 'Safety Training' },
  { id: 'sales-training', name: 'Sales Training' }
];

const MUX_VIDEO_ID = "VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA";

const getRandomName = () => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
};

export const seedDemoData = async (onProgress?: (msg: string) => void) => {
  try {
    const batch = writeBatch(db);

    // 1. Seed Global Settings
    onProgress?.("Seeding global settings...");
    const settingsRef = doc(db, 'settings', 'global');
    const settingsData: any = {
      companyName: "Kisan Fashion Mall",
      managerPhone: "+919876543210",
      defaultLanguage: "en",
      languages: { en: true, te: true, hi: true, mr: true },
      logoUrl: ""
    };
    batch.set(settingsRef, settingsData);

    // 2. Seed Sections
    onProgress?.("Seeding sections...");
    const sectionsData: TrainingSection[] = [
      { id: "customer-service", name: "Customer Service", description: "Training for customer interaction, complaint handling, and service excellence", videoCount: 1, createdAt: serverTimestamp() as any },
      { id: "product-knowledge", name: "Product Knowledge", description: "Fashion product types, fabric knowledge, and brand training", videoCount: 1, createdAt: serverTimestamp() as any },
      { id: "store-operations", name: "Store Operations", description: "Store opening/closing procedures, cash handling, and inventory", videoCount: 1, createdAt: serverTimestamp() as any },
      { id: "safety-training", name: "Safety Training", description: "Fire safety, emergency procedures, and workplace safety", videoCount: 1, createdAt: serverTimestamp() as any },
      { id: "sales-training", name: "Sales Training", description: "Sales techniques, upselling, and customer conversion", videoCount: 1, createdAt: serverTimestamp() as any }
    ];
    sectionsData.forEach(section => {
      const ref = doc(db, 'sections', section.id);
      batch.set(ref, section);
    });

    // 3. Seed Trainings
    onProgress?.("Seeding trainings...");
    const trainingsData: Training[] = [
      {
        id: "training-cs-001",
        title: { en: "How to Greet and Assist Customers", te: "కస్టమర్లకు ఎలా స్వాగతం పలకాలి", hi: "ग्राहकों का स्वागत कैसे करें", mr: "ग्राहकांचे स्वागत कसे करावे" },
        section: "customer-service",
        sectionName: "Customer Service",
        storeId: "all",
        durationSeconds: 120,
        muxVideoId: MUX_VIDEO_ID,
        thumbnailUrl: `https://image.mux.com/${MUX_VIDEO_ID}/thumbnail.jpg`,
        description: { en: "Learn the KISAN way of welcoming customers, understanding their needs, and providing excellent service." },
        weekNumber: 1,
        language: "all",
        status: "active",
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      },
      {
        id: "training-pk-001",
        title: { en: "Fashion Fabrics and Product Categories" },
        section: "product-knowledge",
        sectionName: "Product Knowledge",
        storeId: "all",
        durationSeconds: 120,
        muxVideoId: MUX_VIDEO_ID,
        thumbnailUrl: `https://image.mux.com/${MUX_VIDEO_ID}/thumbnail.jpg`,
        description: { en: "Understanding cotton, silk, polyester and synthetic fabrics. Identifying premium vs budget products." },
        weekNumber: 1,
        language: "all",
        status: "draft",
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      },
      {
        id: "training-so-001",
        title: { en: "Store Opening and Closing Procedures" },
        section: "store-operations",
        sectionName: "Store Operations",
        storeId: "all",
        durationSeconds: 120,
        muxVideoId: MUX_VIDEO_ID,
        thumbnailUrl: `https://image.mux.com/${MUX_VIDEO_ID}/thumbnail.jpg`,
        description: { en: "Step-by-step store opening checklist, cash register setup, and end-of-day closing procedures." },
        weekNumber: 1,
        language: "all",
        status: "draft",
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      },
      {
        id: "training-st-001",
        title: { en: "Fire Safety and Emergency Procedures" },
        section: "safety-training",
        sectionName: "Safety Training",
        storeId: "all",
        durationSeconds: 120,
        muxVideoId: MUX_VIDEO_ID,
        thumbnailUrl: `https://image.mux.com/${MUX_VIDEO_ID}/thumbnail.jpg`,
        description: { en: "Location of fire exits, fire extinguisher usage, and customer evacuation procedures." },
        weekNumber: 1,
        language: "all",
        status: "draft",
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      },
      {
        id: "training-sales-001",
        title: { en: "Upselling and Add-On Sales Techniques" },
        section: "sales-training",
        sectionName: "Sales Training",
        storeId: "all",
        durationSeconds: 120,
        muxVideoId: MUX_VIDEO_ID,
        thumbnailUrl: `https://image.mux.com/${MUX_VIDEO_ID}/thumbnail.jpg`,
        description: { en: "How to suggest complementary products, handle price objections, and close more sales." },
        weekNumber: 1,
        language: "all",
        status: "draft",
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      }
    ];
    trainingsData.forEach(t => {
      const ref = doc(db, 'trainings', t.id);
      batch.set(ref, t);
    });

    // 4. Seed Quizzes
    onProgress?.("Seeding quizzes...");
    const quizzesData: Quiz[] = [
      {
        id: "quiz-cs-001",
        trainingId: "training-cs-001",
        passingMarks: 60,
        questions: [
          {
            id: "q1",
            text: {
              en: "What is the first thing you should do when a customer enters the store?",
              te: "కస్టమర్ స్టోర్‌లోకి వచ్చినప్పుడు మీరు మొదట ఏమి చేయాలి?",
              hi: "जब कोई ग्राहक दुकान में प्रवेश करे तो आपको सबसे पहले क्या करना चाहिए?",
              mr: "जेव्हा ग्राहक दुकानात येतो तेव्हा तुम्ही सर्वप्रथम काय करावे?"
            },
            options: {
              en: ["Greet them with a smile and say welcome", "Continue your work and wait for them to ask", "Ask them what they want immediately", "Call your manager"],
              te: ["నవ్వుతూ స్వాగతం అని చెప్పండి", "మీ పని కొనసాగించి వారు అడిగే వరకు వేచి ఉండండి", "వారికి వెంటనే ఏమి కావాలో అడగండి", "మీ మేనేజర్‌కు పిలవండి"],
              hi: ["मुस्कुराते हुए उनका स्वागत करें और 'वेलकम' कहें", "अपना काम जारी रखें और उनके पूछने का इंतजार करें", "उनसे तुरंत पूछें कि क्या चाहिए", "अपने मैनेजर को बुलाएं"],
              mr: ["हसत त्यांचे स्वागत करा आणि 'वेलकम' म्हणा", "तुमचे काम सुरू ठेवा आणि ते विचारण्याची प्रतीक्षा करा", "त्यांना लगेच काय हवे ते विचारा", "तुमच्या व्यवस्थापकाला बोलवा"]
            },
            correctIndex: 0
          },
          {
            id: "q2",
            text: {
              en: "A customer is unhappy with a product. What should you do first?",
              te: "ఒక కస్టమర్ ఉత్పత్తితో సంతోషంగా లేరు. మీరు మొదట ఏమి చేయాలి?",
              hi: "एक ग्राहक किसी उत्पाद से नाखुश है। आपको पहले क्या करना चाहिए?",
              mr: "एक ग्राहक उत्पादनावर नाराज आहे. तुम्ही आधी काय करावे?"
            },
            options: {
              en: ["Apologize and listen to their concern patiently", "Tell them the product is fine", "Ask them to come back later", "Ignore them"],
              te: ["క్షమాపణ చెప్పి వారి సమస్యను సహనంగా వినండి", "ఉత్పత్తి బాగుందని చెప్పండి", "తర్వాత రమ్మని చెప్పండి", "వారిని పట్టించుకోకండి"],
              hi: ["माफी मांगें और उनकी बात धैर्य से सुनें", "उन्हें बताएं कि उत्पाद ठीक है", "उन्हें बाद में आने के लिए कहें", "उन्हें नजरअंदाज करें"],
              mr: ["माफी मागा आणि त्यांची तक्रार संयमाने ऐका", "त्यांना सांगा की उत्पाद ठीक आहे", "त्यांना नंतर येण्यास सांगा", "त्यांना दुर्लक्षित करा"]
            },
            correctIndex: 0
          },
          {
            id: "q3",
            text: {
              en: "How should you speak to customers at Kisan Fashion Mall?",
              te: "కిసాన్ ఫ్యాషన్ మాల్‌లో కస్టమర్లతో ఎలా మాట్లాడాలి?",
              hi: "किसान फैशन मॉल में ग्राहकों से कैसे बात करनी चाहिए?",
              mr: "किसान फॅशन मॉलमध्ये ग्राहकांशी कसे बोलावे?"
            },
            options: {
              en: ["Politely, clearly, and with respect", "Quickly to save time", "Only when they ask questions", "In a formal and distant manner"],
              te: ["మర్యాదగా, స్పష్టంగా మరియు గౌరవంగా", "సమయం ఆదా చేయడానికి వేగంగా", "వారు ప్రశ్నలు అడిగినప్పుడు మాత్రమే", "అధికారికంగా మరియు దూరంగా"],
              hi: ["विनम्रता से, स्पष्ट रूप से और सम्मान के साथ", "समय बचाने के लिए जल्दी से", "केवल जब वे सवाल पूछें", "औपचारिक और दूरी बनाकर"],
              mr: ["नम्रपणे, स्पष्टपणे आणि आदराने", "वेळ वाचवण्यासाठी लवकर", "फक्त जेव्हा ते प्रश्न विचारतात तेव्हा", "औपचारिकपणे आणि अंतर राखून"]
            },
            correctIndex: 0
          },
          {
            id: "q4",
            text: {
              en: "What should you do if you do not know the answer to a customer's question?",
              te: "కస్టమర్ ప్రశ్నకు మీకు సమాధానం తెలియకపోతే ఏమి చేయాలి?",
              hi: "यदि आपको ग्राहक के सवाल का जवाब नहीं पता तो क्या करें?",
              mr: "ग्राहकाच्या प्रश्नाचे उत्तर तुम्हाला माहीत नसल्यास काय करावे?"
            },
            options: {
              en: ["Honestly say you will find out and get back to them", "Make up an answer", "Tell them to ask someone else", "Walk away"],
              te: ["నిజాయితీగా మీరు తెలుసుకుని చెప్తానని చెప్పండి", "సమాధానం తయారు చేయండి", "వేరే ఎవరినైనా అడగమని చెప్పండి", "వెళ్ళిపోండి"],
              hi: ["ईमानदारी से कहें कि आप पता करके बताएंगे", "कोई जवाब बना लें", "उन्हें किसी और से पूछने के लिए कहें", "चले जाएं"],
              mr: ["प्रामाणिकपणे सांगा की तुम्ही शोधून सांगाल", "एक उत्तर बनवा", "त्यांना दुसऱ्याला विचारण्यास सांगा", "निघून जा"]
            },
            correctIndex: 0
          }
        ]
      },
      {
        id: "quiz-pk-001",
        trainingId: "training-pk-001",
        passingMarks: 60,
        questions: [
          {
            id: "q1",
            text: { en: "What fabric is best for summer?", te: "వేసవికి ఏ ఫ్యాబ్రిక్ ఉత్తమమైనది?", hi: "गर्मियों के लिए कौन सा कपड़ा सबसे अच्छा है?", mr: "उन्हाळ्यासाठी कोणते फॅब्रिक सर्वोत्तम आहे?" },
            options: { en: ["Cotton", "Silk", "Polyester", "Wool"], te: ["కాటన్", "పట్టు", "పాలిస్టర్", "ఉన్ని"], hi: ["सूती", "रेशम", "पॉलिएस्टर", "ऊन"], mr: ["कापूस", "रेशीम", "पॉलिस्टर", "लोकर"] },
            correctIndex: 0
          },
          {
            id: "q2",
            text: { en: "How can you identify pure silk?", te: "స్వచ్ఛమైన పట్టును ఎలా గుర్తించగలరు?", hi: "शुद्ध रेशम की पहचान कैसे करें?", mr: "शुद्ध रेशीम कसे ओळखावे?" },
            options: { en: ["Burn test", "Water test", "Stretch test", "Sound test"], te: ["బర్న్ టెస్ట్", "వాటర్ టెస్ట్", "స్ట్రెచ్ టెస్ట్", "సౌండ్ టెస్ట్"], hi: ["बर्न टेस्ट", "वॉटर टेस्ट", "स्ट्रेच टेस्ट", "साउंड टेस्ट"], mr: ["बर्न टेस्ट", "पाणी चाचणी", "स्ट्रेच टेस्ट", "साउंड टेस्ट"] },
            correctIndex: 0
          },
          {
            id: "q3",
            text: { en: "Which brand is our premium menswear line?", te: "మన ప్రీమియం మెన్స్‌వేర్ బ్రాండ్ ఏది?", hi: "हमारा प्रीमियम मेन्सवियर ब्रांड कौन सा है?", mr: "आमचा प्रीमियम मेन्सवेअर ब्रँड कोणता आहे?" },
            options: { en: ["Kisan Royals", "Kisan Basics", "Kisan Kids", "Kisan Sports"], te: ["కిసాన్ రాయల్స్", "కిసాన్ బేసిక్స్", "కిసాన్ కిడ్స్", "కిసాన్ స్పోర్ట్స్"], hi: ["किसान रॉयल्स", "किसान बेसिक्स", "किसान किड्स", "किसान स्पोर्ट्स"], mr: ["किसान रॉयल्स", "किसान बेसिक्स", "किसान किड्स", "किसान स्पोर्ट्स"] },
            correctIndex: 0
          },
          {
            id: "q4",
            text: { en: "Polyester is known for being:", te: "పాలిస్టర్ దేనికి ప్రసిద్ధి చెందింది?", hi: "पॉलिएस्टर किसके लिए जाना जाता है?", mr: "पॉलिस्टर कशासाठी ओळखले जाते?" },
            options: { en: ["Wrinkle-resistant", "Breathable", "Expensive", "Heavy"], te: ["ముడతలు పడదు", "గాలి ఆడుతుంది", "ఖరీదైనది", "బరువుగా ఉంటుంది"], hi: ["सिकुड़न प्रतिरोधी", "हवादार", "महंगा", "भारी"], mr: ["सुरकुत्या-प्रतिरोधक", "हवेशीर", "महाग", "जड"] },
            correctIndex: 0
          }
        ]
      },
      {
        id: "quiz-so-001",
        trainingId: "training-so-001",
        passingMarks: 60,
        questions: [
          {
            id: "q1",
            text: { en: "Who should hold the keys for store opening?", te: "స్టోర్ తెరవడానికి కీలు ఎవరి దగ్గర ఉండాలి?", hi: "स्टोर खोलने के लिए चाबियां किसके पास होनी चाहिए?", mr: "स्टोअर उघडण्यासाठी चाव्या कोणाकडे असाव्यात?" },
            options: { en: ["Store Manager", "Any employee", "Security guard", "Cleaning staff"], te: ["స్టోర్ మేనేజర్", "ఏ ఉద్యోగి అయినా", "సెక్యూరిటీ గార్డ్", "క్లీనింగ్ స్టాఫ్"], hi: ["स्टोर मैनेजर", "कोई भी कर्मचारी", "सुरक्षा गार्ड", "सफाई कर्मचारी"], mr: ["स्टोअर मॅनेजर", "कोणताही कर्मचारी", "सुरक्षा रक्षक", "स्वच्छता कर्मचारी"] },
            correctIndex: 0
          },
          {
            id: "q2",
            text: { en: "When should the cash register be tallied?", te: "క్యాష్ రిజిస్టర్‌ను ఎప్పుడు లెక్కించాలి?", hi: "कैश रजिस्टर का मिलान कब किया जाना चाहिए?", mr: "कॅश रजिस्टर कधी मोजले जावे?" },
            options: { en: ["End of the day", "Middle of the day", "Randomly", "Once a week"], te: ["రోజు చివరలో", "మధ్యాహ్నం", "అప్పుడప్పుడు", "వారానికోసారి"], hi: ["दिन के अंत में", "दिन के बीच में", "कभी भी", "सप्ताह में एक बार"], mr: ["दिवसाच्या शेवटी", "दिवसाच्या मध्यभागी", "कधीही", "आठवड्यातून एकदा"] },
            correctIndex: 0
          },
          {
            id: "q3",
            text: { en: "What is the first step in closing procedures?", te: "మూసివేసే ప్రక్రియలో మొదటి దశ ఏమిటి?", hi: "बंद करने की प्रक्रिया में पहला कदम क्या है?", mr: "बंद करण्याच्या प्रक्रियेतील पहिली पायरी काय आहे?" },
            options: { en: ["Ensure all customers have left", "Turn off lights", "Lock the door", "Count cash"], te: ["కస్టమర్లందరూ వెళ్లారని నిర్ధారించుకోండి", "లైట్లు ఆపండి", "తలుపు లాక్ చేయండి", "డబ్బు లెక్కించండి"], hi: ["सुनिश्चित करें कि सभी ग्राहक चले गए हैं", "लाइट बंद करें", "दरवाजा लॉक करें", "नकदी गिनें"], mr: ["सर्व ग्राहक गेले आहेत याची खात्री करा", "लाइट बंद करा", "दार लॉक करा", "रोख मोजा"] },
            correctIndex: 0
          },
          {
            id: "q4",
            text: { en: "Who is responsible for inventory restock reports?", te: "ఇన్వెంటరీ రీస్టాక్ నివేదికలకు ఎవరు బాధ్యత వహిస్తారు?", hi: "इन्वेंट्री रीस्टॉक रिपोर्ट के लिए कौन जिम्मेदार है?", mr: "इन्व्हेंटरी रीस्टॉक रिपोर्टसाठी कोण जबाबदार आहे?" },
            options: { en: ["Department Head", "Cashier", "Security Guard", "New Joiners"], te: ["డిపార్ట్‌మెంట్ హెడ్", "క్యాషియర్", "సెక్యూరిటీ గార్డ్", "కొత్తగా చేరిన వారు"], hi: ["विभागाध्यक्ष", "कैशियर", "सुरक्षा गार्ड", "नए कर्मचारी"], mr: ["विभाग प्रमुख", "कॅशियर", "सुरक्षा रक्षक", "नवीन कर्मचारी"] },
            correctIndex: 0
          }
        ]
      },
      {
        id: "quiz-st-001",
        trainingId: "training-st-001",
        passingMarks: 60,
        questions: [
          {
            id: "q1",
            text: { en: "Where is the main fire assembly point?", te: "ప్రధాన అగ్నిమాపక అసెంబ్లీ పాయింట్ ఎక్కడ ఉంది?", hi: "मुख्य अग्नि सभा बिंदु कहाँ है?", mr: "मुख्य अग्निशमन असेंब्ली पॉईंट कोठे आहे?" },
            options: { en: ["Mall Parking Lot", "Store Entrance", "Restroom", "Break Room"], te: ["మాల్ పార్కింగ్ లాట్", "స్టోర్ ప్రవేశ ద్వారం", "రెస్ట్రూమ్", "బ్రేక్ రూమ్"], hi: ["मॉल पार्किंग लॉट", "स्टोर प्रवेश द्वार", "विश्राम गृह", "ब्रेक रूम"], mr: ["मॉल पार्किंग लॉट", "स्टोअर प्रवेशद्वार", "विश्रामगृह", "ब्रेक रूम"] },
            correctIndex: 0
          },
          {
            id: "q2",
            text: { en: "Which extinguisher is used for electrical fires?", te: "ఎలక్ట్రికల్ మంటల కోసం ఏ అగ్నిమాపక యంత్రాన్ని ఉపయోగిస్తారు?", hi: "बिजली की आग के लिए किस अग्निशामक का उपयोग किया जाता है?", mr: "विजेच्या आगीसाठी कोणते अग्निशामक यंत्र वापरले जाते?" },
            options: { en: ["CO2 (Black Label)", "Water (Red Label)", "Foam (Cream Label)", "None"], te: ["CO2 (బ్లాక్ లేబుల్)", "నీరు (రెడ్ లేబుల్)", "ఫోమ్ (క్రీమ్ లేబుల్)", "ఏదీ కాదు"], hi: ["CO2 (ब्लैक लेबल)", "पानी (रेड लेबल)", "फोम (क्रीम लेबल)", "कोई नहीं"], mr: ["CO2 (ब्लॅक लेबल)", "पाणी (रेड लेबल)", "फोम (क्रीम लेबल)", "काहीही नाही"] },
            correctIndex: 0
          },
          {
            id: "q3",
            text: { en: "During an evacuation, what should you tell customers?", te: "ఖాళీ చేస్తున్న సమయంలో, మీరు కస్టమర్లకు ఏమి చెప్పాలి?", hi: "निकासी के दौरान, आपको ग्राहकों को क्या बताना चाहिए?", mr: "स्थलांतरादरम्यान, तुम्ही ग्राहकांना काय सांगावे?" },
            options: { en: ["Leave belongings and exit calmly", "Run fast", "Wait for manager", "Take all their shopping bags"], te: ["వస్తువులను వదిలి ప్రశాంతంగా నిష్క్రమించండి", "వేగంగా పరుగెత్తండి", "మేనేజర్ కోసం వేచి ఉండండి", "వారి షాపింగ్ బ్యాగ్‌లన్నింటినీ తీసుకోండి"], hi: ["सामान छोड़ दें और शांति से बाहर निकलें", "तेजी से दौड़ें", "मैनेजर का इंतजार करें", "अपने सभी शॉपिंग बैग ले लें"], mr: ["सामान सोडा आणि शांतपणे बाहेर पडा", "वेगाने धावा", "मॅनेजरची वाट पाहा", "त्यांच्या सर्व शॉपिंग बॅगा घ्या"] },
            correctIndex: 0
          },
          {
            id: "q4",
            text: { en: "What does PASS stand for in extinguisher use?", te: "అగ్నిమాపక యంత్రం వాడకంలో PASS అంటే ఏమిటి?", hi: "अग्निशामक यंत्र के उपयोग में PASS का क्या अर्थ है?", mr: "अग्निशामक यंत्राच्या वापरात PASS चा अर्थ काय आहे?" },
            options: { en: ["Pull, Aim, Squeeze, Sweep", "Push, Aim, Spray, Stop", "Pull, Attach, Stand, Spray", "Prepare, Aim, Shoot, Save"], te: ["పుల్, ఎయిమ్, స్క్వీజ్, స్వీప్", "పుష్, ఎయిమ్, స్ప్రే, స్టాప్", "పుల్, అటాచ్, స్టాండ్, స్ప్రే", "ప్రిపేర్, ఎయిమ్, షూట్, సేవ్"], hi: ["पुल, एम, स्क्वीज, स्वीप", "पुश, एम, स्प्रे, स्टॉप", "पुल, अटैच, स्टैंड, स्प्रे", "प्रिपेयर, एम, शूट, सेव"], mr: ["पुल, एम, स्क्वीज, स्वीप", "पुश, एम, स्प्रे, स्टॉप", "पुल, अटॅच, स्टँड, स्प्रे", "प्रिपेअर, एम, शूट, सेव्ह"] },
            correctIndex: 0
          }
        ]
      },
      {
        id: "quiz-sales-001",
        trainingId: "training-sales-001",
        passingMarks: 60,
        questions: [
          {
            id: "q1",
            text: { en: "What is a common upselling technique?", te: "సాధారణ అప్‌సెల్లింగ్ టెక్నిక్ ఏమిటి?", hi: "एक सामान्य अपसेलिंग तकनीक क्या है?", mr: "एक सामान्य अपसेलिंग तंत्र काय आहे?" },
            options: { en: ["Suggesting matching accessories", "Ignoring the customer", "Offering discounts immediately", "Complaining about products"], te: ["మ్యాచింగ్ యాక్సెసరీలను సూచించడం", "కస్టమర్‌ను పట్టించుకోకపోవడం", "వెంటనే డిస్కౌంట్లు ఇవ్వడం", "ఉత్పత్తుల గురించి ఫిర్యాదు చేయడం"], hi: ["मैचिंग एक्सेसरीज का सुझाव देना", "ग्राहक की अनदेखी करना", "तुरंत छूट देना", "उत्पादों के बारे में शिकायत करना"], mr: ["मॅचिंग ॲक्सेसरीज सुचवणे", "ग्राहकाकडे दुर्लक्ष करणे", "लगेच सूट देणे", "उत्पादनांबद्दल तक्रार करणे"] },
            correctIndex: 0
          },
          {
            id: "q2",
            text: { en: "How should you handle price objections?", te: "ధర అభ్యంతరాలను మీరు ఎలా నిర్వహించాలి?", hi: "आपको मूल्य आपत्तियों को कैसे संभालना चाहिए?", mr: "तुम्ही किंमतीच्या हरकती कशा हाताळल्या पाहिजेत?" },
            options: { en: ["Explain the value and quality", "Argue with customer", "Agree it's too expensive", "Walk away"], te: ["విలువ మరియు నాణ్యతను వివరించండి", "కస్టమర్‌తో వాదించండి", "ఇది చాలా ఖరీదైనదని అంగీకరించండి", "వెళ్ళిపోండి"], hi: ["मूल्य और गुणवत्ता को समझाएं", "ग्राहक से बहस करें", "मान लें कि यह बहुत महंगा है", "चले जाएं"], mr: ["मूल्य आणि गुणवत्ता स्पष्ट करा", "ग्राहकाशी वाद घाला", "हे खूप महाग आहे हे मान्य करा", "निघून जा"] },
            correctIndex: 0
          },
          {
            id: "q3",
            text: { en: "When is the best time to suggest an add-on item?", te: "యాడ్-ఆన్ వస్తువును సూచించడానికి ఉత్తమ సమయం ఎప్పుడు?", hi: "ऐड-ऑन आइटम का सुझाव देने का सबसे अच्छा समय कब है?", mr: "ॲड-ऑन आयटम सुचवण्याची सर्वोत्तम वेळ कोणती आहे?" },
            options: { en: ["While they are trying the main item", "After they have paid", "Before they enter the store", "Never"], te: ["వారు ప్రధాన వస్తువును ప్రయత్నిస్తున్నప్పుడు", "వారు చెల్లించిన తర్వాత", "వారు స్టోర్‌లోకి ప్రవేశించడానికి ముందు", "ఎప్పుడూ లేదు"], hi: ["जब वे मुख्य वस्तु आज़मा रहे हों", "भुगतान करने के बाद", "स्टोर में प्रवेश करने से पहले", "कभी नहीं"], mr: ["जेव्हा ते मुख्य आयटम वापरत असतात", "त्यांनी पैसे दिल्यानंतर", "ते स्टोअरमध्ये प्रवेश करण्यापूर्वी", "कधीही नाही"] },
            correctIndex: 0
          },
          {
            id: "q4",
            text: { en: "What does 'closing the sale' mean?", te: "'క్లోజింగ్ ద సేల్' అంటే ఏమిటి?", hi: "'क्लोजिंग द सेल' का क्या अर्थ है?", mr: "'क्लोजिंग द सेल' म्हणजे काय?" },
            options: { en: ["Finalizing the purchase with the customer", "Closing the store doors", "Ending your shift", "Putting items back on shelves"], te: ["కస్టమర్‌తో కొనుగోలును ఖరారు చేయడం", "స్టోర్ తలుపులు మూసివేయడం", "మీ షిఫ్ట్ ముగించడం", "వస్తువులను తిరిగి షెల్ఫ్‌లలో ఉంచడం"], hi: ["ग्राहक के साथ खरीदारी को अंतिम रूप देना", "स्टोर के दरवाजे बंद करना", "अपनी शिफ्ट समाप्त करना", "सामान वापस शेल्फ पर रखना"], mr: ["ग्राहकासोबत खरेदी निश्चित करणे", "स्टोअरचे दरवाजे बंद करणे", "तुमची शिफ्ट संपवणे", "आयटम परत शेल्फवर ठेवणे"] },
            correctIndex: 0
          }
        ]
      }
    ];

    quizzesData.forEach(q => {
      const ref = doc(db, 'quizzes', q.id);
      batch.set(ref, q);
    });

    // 5. Seed Employees
    onProgress?.("Seeding 150 employees...");
    
    // We will batch employees to avoid hitting the 500 max writes limit
    const batches = [batch]; // We already have one batch
    let currentBatchIndex = 0;
    let operationCount = 0; // We have already done 1+5+5+5 = 16 operations

    const commitBatchOperation = (ref: any, data: any) => {
      if (operationCount >= 400) { // Keep safe buffer from 500
        batches.push(writeBatch(db));
        currentBatchIndex++;
        operationCount = 0;
      }
      batches[currentBatchIndex].set(ref, data);
      operationCount++;
    };

    const languages = ["en", "te", "hi", "mr"];
    const languageWeights = [0.4, 0.3, 0.2, 0.1]; // 40% en, 30% te, 20% hi, 10% mr
    
    const getRandomLanguage = () => {
      let r = Math.random();
      let sum = 0;
      for (let i = 0; i < languages.length; i++) {
        sum += languageWeights[i];
        if (r <= sum) return languages[i];
      }
      return "en";
    };

    let employeeCounter = 1;
    for (const dept of departments) {
      for (let i = 1; i <= 30; i++) {
        // Generate mobile: e.g., 9000000001
        const mobileStr = employeeCounter.toString().padStart(3, '0');
        const mobile = `9000000${mobileStr}`;
        
        const isInactive = Math.random() < 0.05; // 5% inactive
        const hasCompletedWeek1 = Math.random() < 0.20; // 20% completed

        const emp: Employee = {
          id: mobile,
          name: employeeCounter === 1 ? "Ramesh Kumar" : getRandomName(),
          mobile: mobile,
          department: dept.id,
          storeId: null,
          status: isInactive ? "inactive" : "active",
          lastCompletedWeek: hasCompletedWeek1 ? 1 : null,
          language: getRandomLanguage() as any,
          createdAt: serverTimestamp() as any,
          updatedAt: serverTimestamp() as any
        };

        const empRef = doc(db, 'employees', mobile);
        commitBatchOperation(empRef, emp);

        employeeCounter++;
      }
    }

    // 6. Seed Sample Completions
    onProgress?.("Seeding sample completions...");
    for (let i = 1; i <= 10; i++) {
      const mobileStr = i.toString().padStart(3, '0');
      const mobile = `9000000${mobileStr}`;
      const score = Math.floor(Math.random() * 41) + 60; // 60-100

      const comp: Completion = {
        id: `comp-${mobile}-w1`,
        employeeId: mobile,
        trainingId: "training-cs-001",
        weekNumber: 1,
        score: score,
        totalQuestions: 4,
        completedAt: serverTimestamp() as any,
        watchedFull: true,
        passed: score >= 60
      };

      const compRef = doc(db, 'completions', comp.id);
      commitBatchOperation(compRef, comp);
    }

    // Execute all batches
    for (const b of batches) {
      await b.commit();
    }

    onProgress?.("✅ Demo data seeded successfully. 150 employees, 5 sections, 5 trainings, 5 quizzes, 10 completions.");
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    onProgress?.("❌ Error seeding data: " + (error as Error).message);
    throw error;
  }
};
