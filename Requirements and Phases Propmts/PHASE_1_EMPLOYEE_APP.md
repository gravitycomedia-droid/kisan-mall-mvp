# PHASE 1 — Employee Training App
## All 6 Screens + Multilingual + Video + Quiz

> **Time estimate:** 4–5 hours  
> **Goal:** Complete employee flow working end-to-end in the browser  
> **Prerequisite:** Phase 0 fully complete and checked

---

## Screens to Build

```
Screen 1: Language Picker        (langpick)
Screen 2: Login                  (login)
Screen 3: Training Home          (home)
Screen 4: Video Player           (video)
Screen 5: Quiz                   (quiz)
Screen 6: Completion / Done      (done)
```

---

## Step 1.1 — PROMPT 5: App Router + i18next Setup

```
In the employee app (apps/employee), set up the complete application structure:

1. Set up React Router v6 with these routes:
   / → LanguagePicker screen
   /login → Login screen
   /home → TrainingHome screen
   /video → VideoPlayer screen
   /quiz → Quiz screen
   /done → Done screen

2. Create a route guard: if employee is not logged in (no Zustand session), redirect to /

3. Set up react-i18next with these 4 languages: en (English), te (Telugu), hi (Hindi), mr (Marathi)

4. Create translation files at apps/employee/src/locales/:
   en/translation.json
   te/translation.json
   hi/translation.json
   mr/translation.json

5. Populate ALL translation files with these keys:
{
  "appName": "Kisan Training",
  "selectLanguage": "Select Your Language",
  "continue": "Continue",
  "enterMobile": "Enter Mobile Number",
  "login": "Login",
  "mobileError": "Mobile number not registered. Please contact your manager.",
  "mobileHint": "Enter your 10-digit mobile number",
  "greeting": "Hi, {{name}}!",
  "weeklyTraining": "This week's training",
  "watchVideo": "Watch the full video to unlock the quiz",
  "startQuiz": "Start Quiz",
  "videoLocked": "Complete the video to unlock",
  "question": "Question {{current}} of {{total}}",
  "next": "Next",
  "submit": "Submit",
  "callManager": "Call Manager",
  "goodToGo": "I am Good to Go",
  "trainingComplete": "Training Completed Successfully!",
  "yourScore": "Your Score",
  "downloadCertificate": "Download Certificate",
  "certificateComingSoon": "Certificate generation coming soon",
  "leaderboard": "Leaderboard",
  "leaderboardComingSoon": "Leaderboard coming soon",
  "videoCompleted": "Video completed! Quiz is now unlocked.",
  "loading": "Loading...",
  "error": "Something went wrong. Please try again.",
  "logout": "Logout",
  "language": "Language"
}

Translate ALL keys accurately into Telugu, Hindi, and Marathi.

Telugu translations (te):
{
  "appName": "కిసాన్ శిక్షణ",
  "selectLanguage": "మీ భాషను ఎంచుకోండి",
  "continue": "కొనసాగించు",
  "enterMobile": "మొబైల్ నంబర్ నమోదు చేయండి",
  "login": "లాగిన్",
  "mobileError": "మొబైల్ నంబర్ నమోదు కాలేదు. మీ మేనేజర్‌ను సంప్రదించండి.",
  "mobileHint": "మీ 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి",
  "greeting": "హాయ్, {{name}}!",
  "weeklyTraining": "ఈ వారపు శిక్షణ",
  "watchVideo": "క్విజ్‌ను అన్‌లాక్ చేయడానికి వీడియో పూర్తిగా చూడండి",
  "startQuiz": "క్విజ్ ప్రారంభించండి",
  "videoLocked": "అన్‌లాక్ చేయడానికి వీడియో పూర్తి చేయండి",
  "question": "ప్రశ్న {{current}} / {{total}}",
  "next": "తదుపరి",
  "submit": "సమర్పించు",
  "callManager": "మేనేజర్‌కు కాల్ చేయండి",
  "goodToGo": "నేను సిద్ధంగా ఉన్నాను",
  "trainingComplete": "శిక్షణ విజయవంతంగా పూర్తయింది!",
  "yourScore": "మీ స్కోర్",
  "downloadCertificate": "సర్టిఫికెట్ డౌన్‌లోడ్ చేయండి",
  "certificateComingSoon": "సర్టిఫికెట్ జెనరేషన్ త్వరలో",
  "leaderboard": "లీడర్‌బోర్డ్",
  "leaderboardComingSoon": "లీడర్‌బోర్డ్ త్వరలో వస్తుంది",
  "videoCompleted": "వీడియో పూర్తయింది! క్విజ్ అన్‌లాక్ అయింది.",
  "loading": "లోడ్ అవుతోంది...",
  "error": "ఏదో తప్పు జరిగింది. మళ్ళీ ప్రయత్నించండి.",
  "logout": "లాగ్ అవుట్",
  "language": "భాష"
}

Hindi translations (hi):
{
  "appName": "किसान प्रशिक्षण",
  "selectLanguage": "अपनी भाषा चुनें",
  "continue": "जारी रखें",
  "enterMobile": "मोबाइल नंबर दर्ज करें",
  "login": "लॉगिन",
  "mobileError": "मोबाइल नंबर पंजीकृत नहीं है। अपने मैनेजर से संपर्क करें।",
  "mobileHint": "अपना 10 अंकों का मोबाइल नंबर दर्ज करें",
  "greeting": "नमस्ते, {{name}}!",
  "weeklyTraining": "इस सप्ताह का प्रशिक्षण",
  "watchVideo": "क्विज़ अनलॉक करने के लिए पूरा वीडियो देखें",
  "startQuiz": "क्विज़ शुरू करें",
  "videoLocked": "अनलॉक करने के लिए वीडियो पूरा करें",
  "question": "प्रश्न {{current}} / {{total}}",
  "next": "अगला",
  "submit": "जमा करें",
  "callManager": "मैनेजर को कॉल करें",
  "goodToGo": "मैं तैयार हूं",
  "trainingComplete": "प्रशिक्षण सफलतापूर्वक पूर्ण हुआ!",
  "yourScore": "आपका स्कोर",
  "downloadCertificate": "सर्टिफिकेट डाउनलोड करें",
  "certificateComingSoon": "सर्टिफिकेट जनरेशन जल्द आएगा",
  "leaderboard": "लीडरबोर्ड",
  "leaderboardComingSoon": "लीडरबोर्ड जल्द आएगा",
  "videoCompleted": "वीडियो पूरा हुआ! क्विज़ अनलॉक हो गया।",
  "loading": "लोड हो रहा है...",
  "error": "कुछ गलत हुआ। कृपया पुनः प्रयास करें।",
  "logout": "लॉग आउट",
  "language": "भाषा"
}

Marathi translations (mr):
{
  "appName": "किसान प्रशिक्षण",
  "selectLanguage": "तुमची भाषा निवडा",
  "continue": "पुढे जा",
  "enterMobile": "मोबाइल नंबर टाका",
  "login": "लॉगिन",
  "mobileError": "मोबाइल नंबर नोंदणीकृत नाही. कृपया तुमच्या व्यवस्थापकाशी संपर्क करा.",
  "mobileHint": "तुमचा 10 अंकी मोबाइल नंबर टाका",
  "greeting": "नमस्कार, {{name}}!",
  "weeklyTraining": "या आठवड्याचे प्रशिक्षण",
  "watchVideo": "क्विझ अनलॉक करण्यासाठी संपूर्ण व्हिडिओ पहा",
  "startQuiz": "क्विझ सुरू करा",
  "videoLocked": "अनलॉक करण्यासाठी व्हिडिओ पूर्ण करा",
  "question": "प्रश्न {{current}} / {{total}}",
  "next": "पुढे",
  "submit": "सादर करा",
  "callManager": "व्यवस्थापकाला कॉल करा",
  "goodToGo": "मी तयार आहे",
  "trainingComplete": "प्रशिक्षण यशस्वीरित्या पूर्ण झाले!",
  "yourScore": "तुमचा स्कोर",
  "downloadCertificate": "प्रमाणपत्र डाउनलोड करा",
  "certificateComingSoon": "प्रमाणपत्र निर्मिती लवकरच येईल",
  "leaderboard": "लीडरबोर्ड",
  "leaderboardComingSoon": "लीडरबोर्ड लवकरच येईल",
  "videoCompleted": "व्हिडिओ पूर्ण झाला! क्विझ अनलॉक झाले.",
  "loading": "लोड होत आहे...",
  "error": "काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.",
  "logout": "लॉग आउट",
  "language": "भाषा"
}

6. Create a Zustand store at apps/employee/src/store/useEmployeeStore.ts with:
   - employee: Employee | null
   - language: 'en' | 'te' | 'hi' | 'mr'
   - currentTraining: Training | null
   - quizUnlocked: boolean
   - watchedSeconds: number
   - actions: setEmployee, setLanguage, setTraining, unlockQuiz, updateWatchedSeconds, logout

7. Persist language selection in localStorage so it survives page refresh.
```

---

## Step 1.2 — PROMPT 6: Language Picker Screen

```
Build the Language Picker screen for the employee app (apps/employee/src/screens/LanguagePicker.tsx).

Design requirements:
- Full screen, background color: #FAF6EE (cream)
- Center of screen: Kisan Fashion Mall logo at top (use the text "KISAN" in hot pink #E91E8C with "FASHION MALL" in gray below as a text logo since we don't have the image file in code yet — add an img tag with src="/logo.png" with a fallback to the text version)
- Below logo: heading text using t('selectLanguage') — large, #1A1A1A, font weight 600
- 4 large language selection cards in a 2x2 grid:
  Card 1: English — show "English" in English
  Card 2: Telugu — show "తెలుగు" in Telugu script
  Card 3: Hindi — show "हिन्दी" in Devanagari
  Card 4: Marathi — show "मराठी" in Devanagari
- Each card: white background, 1px border #E5E7EB, border-radius 16px, padding 24px, centered text
- Selected card: border 2px solid #1F7A4E, background #F0FBF5, show a green checkmark icon (lucide-react Check icon)
- Each card shows the language name in its own script (large, 20px) and below it the English name (small, 14px, muted)
- Large Continue button at bottom: full width, background #1F7A4E, text white, border-radius 12px, height 56px
- Continue button disabled until a language is selected
- On Continue: save language to Zustand store AND i18next, navigate to /login
- Add smooth Framer Motion fade-in animation on mount
- Mobile-first: max-width 480px, centered on larger screens
- The entire screen should work with the selected language immediately on card tap (change the heading text instantly)
```

---

## Step 1.3 — PROMPT 7: Login Screen

```
Build the Login screen (apps/employee/src/screens/Login.tsx).

Design:
- Background: #FAF6EE
- Top: small Kisan logo centered
- Heading: t('enterMobile') — 22px, bold, #1A1A1A
- Subtext: t('mobileHint') — 14px, #6B7280
- Mobile number display box: shows the digits as user taps, large 32px font, centered, monospace, minimum height 64px, background white, border 1px solid #E5E7EB, border-radius 12px, padding 16px
- Country code prefix "+91" shown in gray before the number
- Custom numeric keypad (NOT the browser keyboard — build it manually):
  Layout: 3 columns x 4 rows
  Row 1: 1, 2, 3
  Row 2: 4, 5, 6
  Row 3: 7, 8, 9
  Row 4: [clear all X], 0, [backspace ←]
  Each key: large touch target (minimum 72px height), white background, border 0.5px solid #E5E7EB, border-radius 8px, 24px font
  On tap: subtle scale animation using Framer Motion (scale 0.95 then back)
- Login button: full width, #1F7A4E background, white text, 56px height, border-radius 12px
  Disabled state: gray background when less than 10 digits entered
  Loading state: show spinner when querying Firestore
- On login button tap:
  1. Query Firestore employees collection where document field 'mobile' equals the entered number
  2. If found AND status is 'active': save employee to Zustand, navigate to /home
  3. If found but status is 'inactive': show error "Your account is inactive. Contact your manager."
  4. If not found: show error t('mobileError') in red below the number display
- Back arrow at top left to go back to language picker
- Error message: red text, appears below the number display with a shake animation
- All text uses i18next translations based on selected language
```

---

## Step 1.4 — PROMPT 8: Training Home Screen

```
Build the Training Home screen (apps/employee/src/screens/TrainingHome.tsx).

This screen loads the current week's active training from Firestore and shows it to the employee.

Layout (mobile-first, max-width 480px):
- Top bar: 
  Left: Kisan logo (small, 32px height)
  Right: language selector dropdown (shows current language flag/name, allows switching — updates i18next immediately)
  Background: white, border-bottom 1px solid #E5E7EB, padding 12px 16px

- Greeting section:
  "👋 " + t('greeting', { name: employee.name })
  Font size 20px, font weight 600, color #1A1A1A
  Below: current date in the selected language format

- This week's training card:
  White card, border-radius 16px, padding 0, overflow hidden, shadow: 0 2px 12px rgba(0,0,0,0.08)
  Top: training thumbnail image (16:9 ratio, full width of card)
  If no thumbnail: show a gradient placeholder (#1F7A4E to #2D9E68) with a play icon
  Bottom section padding 16px:
    Training title: 16px bold
    Section badge: small pill, background #F0FBF5, text #1F7A4E, border-radius 999px
    Description: 14px, #6B7280, 2 lines max
    
- Progress indicator:
  If video not watched: show "🎬 " + t('watchVideo') in amber color
  If video watched: show "✅ " + t('videoCompleted') in green

- Two action buttons stacked vertically:
  Button 1: "▶ Watch Training" — full width, #1F7A4E background, white text, 52px height, border-radius 12px → navigates to /video
  Button 2: t('startQuiz') — full width, outline style, #1F7A4E border and text → navigates to /quiz
    Button 2 is DISABLED with gray color and t('videoLocked') text if watchedFull is false in Zustand

- Bottom section: Query / Support
  Two large buttons side by side:
  Left: "📞 " + t('callManager') — outline, border #1F7A4E, text #1F7A4E
    On tap: opens tel: link with the manager phone number from Firestore settings
  Right: "✅ " + t('goodToGo') — filled, background #10B981 (success green), white text

- Leaderboard teaser card at bottom:
  Background: linear-gradient(135deg, #1F7A4E, #2D9E68)
  White text: "🏆 " + t('leaderboard')
  Below: t('leaderboardComingSoon') in white with 70% opacity
  "Coming Soon" badge: white background, #1F7A4E text, small pill
  Entire card has a lock icon overlay

- Data fetching:
  On mount, fetch from Firestore: trainings collection where status == 'active' AND weekNumber == currentWeekNumber
  Show loading skeleton while fetching
  If no active training: show "No training this week. Check back soon." message

- The language selector in the top bar must instantly re-render ALL text on this screen in the new language when changed
```

---

## Step 1.5 — PROMPT 9: Video Player Screen

```
Build the Video Player screen (apps/employee/src/screens/VideoPlayer.tsx).

This is the most critical screen — video must NOT be skippable.

Layout:
- Black background for the video area
- Top bar: back button (←), training title in white, white text
  Back button only navigates back after confirming with employee (don't lose progress warning)

- Video player section:
  Use @mux/mux-player-react component
  For MVP, use this dummy Mux playback ID: "VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA"
  (This is a sample Mux video — replace with real ones later)
  
  Player configuration:
  - streamType="on-demand"
  - aspectRatio: 9/16 (vertical, like Instagram Reels)
  - disableCookies
  - Set style: width 100%, max-height 70vh
  - Custom controls: hide default seek bar, hide forward/rewind buttons
  - Show only: play/pause button, volume, fullscreen

  Critical restriction logic:
  - Listen to 'timeupdate' event on the player
  - Track currentTime in a ref
  - If user tries to seek forward (new time > tracked time + 2 seconds): immediately set currentTime back
  - Track watchedSeconds in Zustand (increment every second via setInterval while playing)
  - Only mark video as complete when currentTime >= duration - 3 (within 3 seconds of end)
  - When video completes: call unlockQuiz() in Zustand, save watchedFull: true to Firestore for this employee+training, show success toast

- Progress bar (custom, below video):
  Shows actual watched progress as a green fill bar
  Cannot be clicked/dragged by the employee
  Label: "X% watched" in white text

- Below video: training info card
  Training title, section badge, description
  Background: white, border-radius 16px top, padding 20px

- "Start Quiz →" button at bottom:
  Only visible and enabled AFTER video is 100% watched
  Before completion: grayed out with lock icon and t('videoLocked') text
  After completion: #1F7A4E background, white text, full width

- Side note: For demo purposes, also add a hidden dev shortcut — if user taps the progress bar 5 times rapidly, mark video as complete (for client demo to skip waiting for full video)
```

---

## Step 1.6 — PROMPT 10: Quiz Screen

```
Build the Quiz screen (apps/employee/src/screens/Quiz.tsx).

The quiz shows one question at a time. All questions and options must display in the currently selected language.

Layout:
- Background: #FAF6EE
- Top: progress bar showing question X of Y (green fill, #1F7A4E)
- Question counter: t('question', { current: X, total: Y }) — 14px, muted
- Question text: large, 20px, bold, #1A1A1A, centered, padding 24px
  Pull from quizQuestion.text[currentLanguage]

- Answer options: displayed as large vertical buttons
  Each option: white background, border 1px solid #E5E7EB, border-radius 12px, padding 16px 20px, full width, text left-aligned
  Pull from quizQuestion.options[currentLanguage]
  
  States:
  - Default: white background, dark text
  - Selected (before submit): #F0FBF5 background, #1F7A4E border 2px, green radio dot on left
  - Cannot change answer once submitted for that question

- Next button: #1F7A4E background, white text, full width, 52px height, border-radius 12px
  Shows t('next') for all questions except last
  Shows t('submit') on the last question
  Disabled until an option is selected

- On submit (last question):
  Calculate score (correct answers / total questions * 100)
  Save to Firestore: completions collection with employeeId, trainingId, weekNumber, score, totalQuestions, completedAt: now(), watchedFull: true
  Navigate to /done with score data

- Animation: each question slides in from the right using Framer Motion when moving to next question

- Data: fetch quiz from Firestore quizzes collection where trainingId matches current training
  Show loading state while fetching
  If no quiz found: show "No quiz for this training" and a complete button

- Guard: if quizUnlocked is false in Zustand, redirect back to /home with a message
```

---

## Step 1.7 — PROMPT 11: Done / Completion Screen

```
Build the Done/Completion screen (apps/employee/src/screens/Done.tsx).

This is the celebration screen shown after quiz submission.

Layout:
- Background: gradient from #1F7A4E to #2D9E68 (top portion, ~40% of screen)
- White bottom section with border-radius 32px top

Top section (green gradient):
- Large trophy emoji or SVG trophy icon: 80px
- t('trainingComplete') in white, 22px, bold, centered
- Animated confetti effect using CSS keyframes (small colored dots falling)

White bottom section:
- Score card:
  Centered circle showing score percentage
  Circle: 120px diameter, #1F7A4E border 4px, white background
  Inside: score percentage in large bold text (e.g. "80%")
  Below circle: t('yourScore') label
  
- Score breakdown:
  "X out of Y questions correct"
  Show in the current language

- Pass/Fail indicator:
  If score >= 60%: green badge "Passed ✓"
  If score < 60%: amber badge "Try Again Next Week"

- Two feature cards (Coming Soon):
  Card 1: Certificate
    Icon: 📜, title: t('downloadCertificate')
    Subtitle: t('certificateComingSoon')
    "Coming Soon" badge: amber background, white text
    Card is grayed out and not clickable
    
  Card 2: Leaderboard
    Icon: 🏆, title: t('leaderboard')
    Subtitle: t('leaderboardComingSoon')
    "Coming Soon" badge: amber background, white text
    Card is grayed out and not clickable

- "I am Good to Go" button: full width, #1F7A4E background, white text
  On tap: navigate back to /home, reset quiz state in Zustand

- All text in the currently selected language
- Framer Motion entrance animation: elements slide up and fade in with stagger
```

---

## Phase 1 Checklist

- [ ] Language picker works and changes all UI text instantly
- [ ] Login queries real Firestore (even if empty — no crash)
- [ ] Training home fetches from Firestore with loading state
- [ ] Video player loads Mux dummy video
- [ ] Cannot seek forward in video
- [ ] Quiz only accessible after video watched (or 5-tap dev shortcut)
- [ ] Quiz shows questions in correct language
- [ ] Done screen shows score and coming soon cards
- [ ] All 4 languages work on every screen
- [ ] Mobile layout looks correct in Chrome DevTools mobile view

**Commit before Phase 2:**
```bash
git add .
git commit -m "Phase 1: Complete employee app with all 6 screens and multilingual support"
git push origin main
```
