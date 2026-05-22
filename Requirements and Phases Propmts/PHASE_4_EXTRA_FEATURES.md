# PHASE 4 — Extra Features (Beyond Requirements)
## Leaderboard Teaser, Coming Soon Features, PWA, Performance

> **Time estimate:** 2–3 hours  
> **Goal:** Extra features that impress the client and show future potential  
> **Prerequisite:** Phase 3 complete with all dummy data seeded

---

## Extra Features Overview

| Feature | Status in MVP | Notes |
|---|---|---|
| Leaderboard | Teaser UI (code-ready) | One flag to enable |
| Certificate Generation | Coming Soon card | UI ready, logic commented out |
| OTP Login | Coming Soon | Code scaffold in login screen |
| SMS Reminders | Coming Soon badge in admin | Toggle visible but disabled |
| WhatsApp Reminders | Coming Soon badge in admin | Toggle visible but disabled |
| Push Notifications | Coming Soon badge in admin | Toggle visible but disabled |
| Attendance Integration | Coming Soon card in admin | Placeholder UI |
| Advanced Analytics | Coming Soon section | Extra charts hidden behind flag |
| PWA (installable app) | Fully working | Employees can install on phone |
| Dark Mode | Fully working | Toggle in employee top bar |
| Offline Quiz Resume | Fully working | Saves progress to localStorage |

---

## Step 4.1 — PROMPT 25: Leaderboard Teaser (Code-Ready)

```
Add a leaderboard feature to the employee app that is 90% built but hidden behind a feature flag.

Create apps/employee/src/features/leaderboard/:
  LeaderboardScreen.tsx
  LeaderboardCard.tsx
  useLeaderboardData.ts (hook that fetches from Firestore)

LeaderboardScreen design:
- Header: "🏆 " + t('leaderboard') with gold gradient background (#F59E0B to #D97706)
- Subtitle: "See how you rank among your team this week"
- Podium section (top 3):
  2nd place: left, silver medal, name, score
  1st place: center, slightly elevated, gold medal, crown emoji, name, score, "CHAMPION" badge
  3rd place: right, bronze medal, name, score
  Use dummy data: 1st: "Priya Sharma - 100%", 2nd: "Ramesh Kumar - 95%", 3rd: "Vikram Singh - 90%"

- Full rankings list below:
  Rows: Rank # | Name | Department | Score | Date Completed
  Current employee's row highlighted in green
  Show top 20

- The useLeaderboardData hook:
  Queries Firestore completions for current week
  Joins with employee names
  Sorts by score descending
  Returns ranked list
  (Already fully functional — just needs real data)

Feature flag setup:
  In apps/employee/src/config/features.ts:
  export const FEATURES = {
    LEADERBOARD_ENABLED: false,  // Change to true to enable
    OTP_LOGIN: false,
    CERTIFICATE: false,
  }

In the employee home screen:
  If FEATURES.LEADERBOARD_ENABLED === true: show full leaderboard card that navigates to /leaderboard
  If false: show the teaser card with "Coming Soon" badge (already built in Phase 1)

Add /leaderboard route to the router (already protected by auth).

During client demo: you can show the teaser, then open features.ts in Antigravity, change LEADERBOARD_ENABLED to true, hot-reload, and show the full screen live in the meeting. This is very impressive.
```

---

## Step 4.2 — PROMPT 26: Certificate Generation (Scaffold)

```
Build a certificate generation scaffold that is ready to activate.

Create apps/employee/src/features/certificate/:
  CertificatePreview.tsx (the certificate design)
  useCertificate.ts (the generation logic — commented out pending jsPDF integration)

Certificate design (CertificatePreview.tsx):
This renders a beautiful certificate as a React component (for screen preview only in MVP):
- Outer border: double line, gold (#F59E0B) color, elegant
- Background: cream white (#FFFEF7)
- Top: Kisan Fashion Mall logo (text version)
- Heading: "Certificate of Completion" in large serif-style font
- Body text:
  "This is to certify that"
  [Employee Name] — large, bold, #1F7A4E
  "has successfully completed the training"
  [Training Title] — medium, italic
  "with a score of [Score]%"
  "on [Completion Date]"
- Bottom: signature line + "Kisan Fashion Mall Management" text
- Bottom right: QR code placeholder (gray box with "Verification QR" text)
- Kisan logo watermark in center (very low opacity, 5%)

In the Done screen:
  "Download Certificate" button currently shows a modal with:
    - CertificatePreview component (the design, visible)
    - "Download as PDF" button — on click shows: "Certificate downloads coming soon! Your achievement has been recorded."
    - Close button

useCertificate.ts contains commented code showing how jsPDF would generate the actual PDF.
A comment block: // TODO: Uncomment to enable certificate generation in production
The actual working jsPDF code is there, just commented out.
```

---

## Step 4.3 — PROMPT 27: PWA Setup (Installable App)

```
Convert the employee app into a Progressive Web App (PWA) so employees can install it on their Android/iPhone like a native app.

Steps:
1. Install vite-plugin-pwa in the employee app

2. Configure PWA in vite.config.ts:
  - App name: "Kisan Training"
  - Short name: "KisanTrain"
  - Theme color: #1F7A4E
  - Background color: #FAF6EE
  - Display: standalone
  - Icons: generate icons from a green circle with "K" letter (since we don't have the actual logo file yet)
  - Start URL: /
  - Scope: /

3. Create a service worker that:
  - Caches the app shell (HTML, CSS, JS) for offline loading
  - Caches the translation files
  - Does NOT cache video (too large)
  - Shows offline page if no internet: "Please connect to the internet to watch training videos. Your quiz progress is saved."

4. Add an "Install App" prompt:
  - When the browser fires the beforeinstallprompt event, show a banner at the bottom of the language picker screen
  - Banner: "📱 Install Kisan Training app on your phone" with an "Install" button
  - On click: trigger the install prompt
  - If already installed: hide the banner

5. Offline quiz resume:
  - When employee is on the quiz screen, save current question index and selected answers to localStorage every time they tap an option
  - If page refreshes or connection drops, restore from localStorage
  - On quiz completion, clear localStorage entry
  - Show a small toast "Progress auto-saved" when saving

This makes the demo very impressive — show the client that employees can install it from the browser like a real app.
```

---

## Step 4.4 — PROMPT 28: Dark Mode

```
Add dark mode support to both apps.

Employee App dark mode:
- Dark mode toggle button in the top bar of the training home screen (moon/sun icon)
- Store dark mode preference in localStorage
- Dark color scheme:
  Background: #0F1A14 (very dark green-black)
  Surface: #1A2E22
  Card: #1E3528
  Text: #F0F4F2
  Text muted: #9CB8A8
  Border: #2D4A3A
  Primary: #2D9E68 (slightly lighter green for dark bg)
- All screens respect the dark mode setting
- Smooth transition: transition all 0.3s ease
- Language picker, login, video, quiz, done screens all have dark versions

Admin Dashboard dark mode:
- Toggle in top header bar
- Dark color scheme:
  Sidebar: #111827
  Background: #0F172A
  Cards: #1E293B
  Text: #F1F5F9
  Border: #334155
- Charts auto-adapt (Recharts colors adjust)
- All 9 screens support dark mode

Implementation: use a CSS class 'dark' on the <html> element + Tailwind dark: variants
```

---

## Step 4.5 — PROMPT 29: Performance + Loading Polish

```
Add professional loading states, error boundaries, and performance polish to both apps.

Employee App:
1. Skeleton screens: replace all loading spinners with skeleton placeholders that match the actual layout
   - Training home: skeleton for the training card (thumbnail placeholder, text lines)
   - Quiz: skeleton for question text and 4 option boxes
   
2. Error boundary: wrap the entire app in an ErrorBoundary component
   - If anything crashes: show "Something went wrong. Please close and reopen the app."
   - Log error to console

3. Page transitions: add Framer Motion AnimatePresence wrapper around all route changes
   - Each screen fades out (opacity 0, scale 0.98) and the next fades in (opacity 1, scale 1)
   - Duration: 200ms

4. Toast notifications: install react-hot-toast
   - Video completed: green toast "✅ Video watched! Quiz is now unlocked."
   - Quiz submitted: green toast "✅ Training completed!"
   - Login error: red toast with error message
   - Network error: amber toast "Connection issue. Retrying..."

5. Pull to refresh on training home screen (mobile):
   - If employee pulls down on the training home screen, refresh the training data from Firestore
   - Show a small spinner at the top during refresh

Admin Dashboard:
1. Add a global loading bar (like YouTube's red bar) at the top during page navigation
   Use nprogress or a simple CSS animation div
   Color: #1F7A4E

2. Table row hover animations: subtle background shift on hover

3. Empty states: every table and list has a proper empty state illustration (use SVG placeholder icons from lucide-react)

4. Confirmation dialogs: all delete/destructive actions use a consistent modal with red confirm button
```

---

## Step 4.6 — PROMPT 30: Advanced Analytics Teaser (Admin)

```
Add an Advanced Analytics section to the admin Reports screen that is visible but locked behind "Coming Soon".

Create a visually impressive but disabled analytics section at the bottom of the Reports screen:

Section header: "Advanced Analytics" with a "Coming Soon" amber badge

Show these cards as grayed-out previews (opacity: 0.5, cursor: not-allowed, pointer-events: none):
1. Heatmap card: "Training Completion Heatmap — See which days employees train most"
   Show a placeholder grid (7 columns for days, rows for weeks) with some cells colored in varying greens
   (Like GitHub's contribution graph)

2. Performance Trend: "Individual Employee Progress Over Time"
   Show a placeholder line chart with 3 sample lines

3. Department Comparison: "Head-to-head completion rates between departments"
   Show a placeholder radar/spider chart

4. Dropout Analysis: "Where employees stop in the training flow"
   Show a funnel chart placeholder: Started Video → Completed Video → Started Quiz → Completed Quiz

Each card has:
- Lock icon overlay (lucide Lock icon, centered, #6B7280)
- "Coming Soon" pill badge
- Tooltip on hover: "This feature will be available in the full version"

Below the locked section: a call-to-action note:
"📈 Upgrade to the full platform to unlock advanced analytics, SMS reminders, WhatsApp notifications, and more."
```

---

## Phase 4 Checklist

- [ ] Leaderboard teaser shows on employee home
- [ ] Leaderboard full screen accessible by changing feature flag to true
- [ ] Certificate coming soon modal shows in done screen
- [ ] PWA installs on mobile browser (test on Android Chrome)
- [ ] Dark mode works on both apps
- [ ] Loading skeletons show instead of spinners
- [ ] Toast notifications appear for key actions
- [ ] Advanced analytics section visible but locked in admin reports
- [ ] All coming soon features have proper badges in admin settings

**Commit before Phase 5:**
```bash
git add .
git commit -m "Phase 4: Leaderboard teaser, PWA, dark mode, coming soon features, performance polish"
git push origin main
```
