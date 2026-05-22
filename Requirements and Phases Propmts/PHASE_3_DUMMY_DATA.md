# PHASE 3 — Dummy Data Seeding
## 150 Employees, 5 Sections, Videos, Quizzes in All 4 Languages

> **Time estimate:** 2–3 hours  
> **Goal:** Firebase fully populated with realistic demo data ready for client presentation  
> **Prerequisite:** Phase 2 complete and committed

---

## Step 3.1 — PROMPT 20: Create Admin Seed Account

Before seeding data, create the admin user in Firebase Auth.

Go to Firebase Console → Authentication → Users → Add User:
```
Email: admin@kisanmall.com
Password: KisanAdmin@2024
```

Copy the UID shown after creation.

Then go to Firestore → Create document manually:
```
Collection: admins
Document ID: [paste the UID you copied]
Fields:
  email: "admin@kisanmall.com"
  name: "Kisan Admin"
  createdAt: [current timestamp]
```

This links the Firebase Auth user to the admin role in Firestore.

---

## Step 3.2 — PROMPT 21: Create Data Seeder Script

```
Create a seed script at apps/admin/src/scripts/seedData.ts that:

1. Connects to Firebase using the same config
2. Seeds all the following data when run
3. Can be triggered from a "Seed Demo Data" button in the admin settings page (only visible in development mode: import.meta.env.DEV === true)
4. Shows a progress log in the browser console

Seed the following data:

SECTIONS (5 total):
[
  { id: "customer-service", name: "Customer Service", description: "Training for customer interaction, complaint handling, and service excellence", videoCount: 1 },
  { id: "product-knowledge", name: "Product Knowledge", description: "Fashion product types, fabric knowledge, and brand training", videoCount: 1 },
  { id: "store-operations", name: "Store Operations", description: "Store opening/closing procedures, cash handling, and inventory", videoCount: 1 },
  { id: "safety-training", name: "Safety Training", description: "Fire safety, emergency procedures, and workplace safety", videoCount: 1 },
  { id: "sales-training", name: "Sales Training", description: "Sales techniques, upselling, and customer conversion", videoCount: 1 }
]

SETTINGS:
{
  companyName: "Kisan Fashion Mall",
  managerPhone: "+919876543210",
  defaultLanguage: "en",
  languages: { en: true, te: true, hi: true, mr: true },
  logoUrl: ""
}

TRAININGS (1 per section, all active for week 1):
[
  {
    id: "training-cs-001",
    title: "How to Greet and Assist Customers",
    section: "customer-service",
    muxVideoId: "VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA",
    thumbnailUrl: "https://image.mux.com/VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA/thumbnail.jpg",
    description: "Learn the KISAN way of welcoming customers, understanding their needs, and providing excellent service.",
    weekNumber: 1,
    language: "all",
    status: "active"
  },
  {
    id: "training-pk-001",
    title: "Fashion Fabrics and Product Categories",
    section: "product-knowledge",
    muxVideoId: "VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA",
    thumbnailUrl: "https://image.mux.com/VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA/thumbnail.jpg",
    description: "Understanding cotton, silk, polyester and synthetic fabrics. Identifying premium vs budget products.",
    weekNumber: 1,
    language: "all",
    status: "draft"
  },
  {
    id: "training-so-001",
    title: "Store Opening and Closing Procedures",
    section: "store-operations",
    muxVideoId: "VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA",
    thumbnailUrl: "https://image.mux.com/VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA/thumbnail.jpg",
    description: "Step-by-step store opening checklist, cash register setup, and end-of-day closing procedures.",
    weekNumber: 1,
    language: "all",
    status: "draft"
  },
  {
    id: "training-st-001",
    title: "Fire Safety and Emergency Procedures",
    section: "safety-training",
    muxVideoId: "VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA",
    thumbnailUrl: "https://image.mux.com/VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA/thumbnail.jpg",
    description: "Location of fire exits, fire extinguisher usage, and customer evacuation procedures.",
    weekNumber: 1,
    language: "all",
    status: "draft"
  },
  {
    id: "training-sales-001",
    title: "Upselling and Add-On Sales Techniques",
    section: "sales-training",
    muxVideoId: "VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA",
    thumbnailUrl: "https://image.mux.com/VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA/thumbnail.jpg",
    description: "How to suggest complementary products, handle price objections, and close more sales.",
    weekNumber: 1,
    language: "all",
    status: "draft"
  }
]
```

---

## Step 3.3 — PROMPT 22: Seed Quiz Data (All 4 Languages)

```
Add quiz data seeding to the seed script. Create one quiz per training with 4 realistic questions each in all 4 languages:

QUIZ 1: Customer Service Training (training-cs-001)
{
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
        te: ["笑顔で맞아 'స్వాగతం' అని చెప్పండి", "మీ పని కొనసాగించి వారు అడిగే వరకు వేచి ఉండండి", "వారికి వెంటనే ఏమి కావాలో అడగండి", "మీ మేనేజర్‌కు పిలవండి"],
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
}

Create similar realistic quiz data for all 5 trainings. Make each question relevant to the training topic:
- Product Knowledge: questions about fabric types, brand identification
- Store Operations: questions about opening procedures, cash handling
- Safety Training: questions about fire exits, extinguisher types
- Sales Training: questions about upselling techniques, handling objections

All questions must have translations in all 4 languages.
```

---

## Step 3.4 — PROMPT 23: Seed 150 Employees

```
Add employee seeding to the seed script. Generate 150 realistic Indian employees spread across 5 departments (30 per department).

Use these real Indian names and generate the data:

Department: Customer Service (30 employees, mobiles 9000000001-9000000030)
Sample names: Ramesh Kumar, Priya Sharma, Suresh Reddy, Anita Patel, Vikram Singh, Kavitha Nair, Rajan Pillai, Deepa Menon, Arjun Verma, Sunita Gupta, Mohammed Ali, Fatima Begum, Rajesh Yadav, Pooja Tiwari, Arun Nair, Lakshmi Devi, Santosh Patil, Meena Kumari, Dinesh Joshi, Rashida Khan, Sunil Mehta, Rekha Sharma, Prasad Rao, Shobha Nair, Vinod Kumar, Nalini Devi, Ganesh Patil, Sarla Devi, Ravi Shankar, Usha Rani

Department: Product Knowledge (30 employees, mobiles 9000000031-9000000060)
Department: Store Operations (30 employees, mobiles 9000000061-9000000090)  
Department: Safety Training (30 employees, mobiles 9000000091-9000000120)
Department: Sales Training (30 employees, mobiles 9000000121-9000000150)

For each employee document use mobile number as the Firestore document ID:
{
  name: "[name]",
  mobile: "90000000XX",
  department: "[department]",
  status: "active",
  lastCompletedWeek: null,  // set some to 1 for variety
  language: "en",  // vary: some "te", "hi", "mr"
  createdAt: serverTimestamp()
}

Make 20% of employees have lastCompletedWeek: 1 (simulates some completed) for realistic dashboard data.
Make 5% status: "inactive" for testing the inactive account error.
Vary the language field: 40% en, 30% te, 20% hi, 10% mr.

Also create 10 sample completions for week 1 to populate the reports:
{
  employeeId: "9000000001",
  trainingId: "training-cs-001",
  weekNumber: 1,
  score: 75,
  totalQuestions: 4,
  completedAt: [recent timestamp],
  watchedFull: true
}
Create completions for employees 9000000001 through 9000000010 with varying scores (60-100).

Add a "Seed Demo Data" button in admin Settings page that:
- Only visible when import.meta.env.DEV === true
- Shows progress: "Seeding sections... Seeding trainings... Seeding quizzes... Seeding employees..."
- Shows success: "✅ Demo data seeded successfully. 150 employees, 5 sections, 5 trainings, 5 quizzes, 10 completions."
- After seeding, refresh the page
```

---

## Step 3.5 — Run the Seed Script

After the seed button is built:

1. Go to `http://localhost:3001/settings` (admin app)
2. Log in with `admin@kisanmall.com` / `KisanAdmin@2024`
3. Scroll to bottom → click "Seed Demo Data"
4. Watch the console for progress
5. Go to Firebase Console → Firestore → confirm all collections are populated

**Verify in Firestore:**
- `employees` collection: 150 documents
- `sections` collection: 5 documents
- `trainings` collection: 5 documents
- `quizzes` collection: 5 documents
- `completions` collection: 10 documents
- `settings` collection: 1 document

---

## Step 3.6 — PROMPT 24: Test Employee Flow End-to-End

```
Now test the complete employee flow with the seeded data.

In the employee app (localhost:3000):
1. Select Telugu language on language picker
2. Enter mobile number: 9000000001
3. Should show "హాయ్, Ramesh Kumar!"
4. Should load the Customer Service training
5. Click Watch Training → video should load (Mux dummy video)
6. Use the 5-tap shortcut to complete the video
7. Quiz should unlock
8. Answer all 4 quiz questions (in Telugu)
9. Submit → should save completion to Firestore
10. Done screen should show score

If any step fails, fix it before moving to Phase 4.

Also test these edge cases:
- Enter an inactive employee mobile (status: inactive) → should show inactive error
- Enter a non-existent mobile (1234567890) → should show not registered error  
- Change language mid-flow on the home screen → all text should update immediately
- Try to access /quiz directly without watching video → should redirect to /home
```

---

## Phase 3 Checklist

- [ ] Admin account created in Firebase Auth
- [ ] Admin document in Firestore /admins collection
- [ ] Seed script runs without errors
- [ ] 150 employees visible in admin employee table
- [ ] 5 sections visible in admin sections screen
- [ ] 5 trainings visible in admin trainings screen
- [ ] Quiz questions show in all 4 languages
- [ ] Employee login works for 9000000001 (Ramesh Kumar)
- [ ] Quiz translations work when language is changed
- [ ] Completions save to Firestore after quiz submission
- [ ] Dashboard shows non-zero numbers (employees, completion rate)

**Commit before Phase 4:**
```bash
git add .
git commit -m "Phase 3: Dummy data seeded — 150 employees, 5 sections, multilingual quizzes"
git push origin main
```
