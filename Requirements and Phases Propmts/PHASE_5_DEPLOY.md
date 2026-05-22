# PHASE 5 — Deployment + Final QA
## Vercel Deployment + Client Demo Preparation

> **Time estimate:** 2–3 hours  
> **Goal:** Both apps live on Vercel with shareable links for client review  
> **Prerequisite:** All phases complete, all checklists passed

---

## Step 5.1 — PROMPT 31: Vercel Configuration Files

```
Create Vercel configuration files for deploying both apps from the same GitHub monorepo as separate Vercel projects.

Create apps/employee/vercel.json:
{
  "buildCommand": "pnpm --filter employee build",
  "outputDirectory": "apps/employee/dist",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

Create apps/admin/vercel.json:
{
  "buildCommand": "pnpm --filter admin build",
  "outputDirectory": "apps/admin/dist",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

Also create a root-level vercel.json that tells Vercel this is a monorepo (do not deploy root level):
{
  "version": 2,
  "builds": []
}

Make sure both Vite configs have the correct base URL setting:
  Employee: base: '/'
  Admin: base: '/'

Run a production build test locally:
  pnpm --filter employee build
  pnpm --filter admin build
Fix any TypeScript errors that appear only in production build (strict mode).
```

---

## Step 5.2 — Deploy Employee App to Vercel

Follow these steps:

1. Go to `https://vercel.com` → Sign up/Login with GitHub
2. Click **Add New Project** → Import `kisan-mall-mvp` repo
3. Configure deployment:
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/employee`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables (click "Environment Variables"):
   ```
   VITE_FIREBASE_API_KEY          = [your value]
   VITE_FIREBASE_AUTH_DOMAIN      = kisan-mall-mvp.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID       = kisan-mall-mvp
   VITE_FIREBASE_STORAGE_BUCKET   = kisan-mall-mvp.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID = [your value]
   VITE_FIREBASE_APP_ID           = [your value]
   VITE_MUX_TOKEN_ID              = [your value]
   ```
5. Click **Deploy**
6. Wait for build to complete (~2-3 minutes)
7. Note the URL: `kisan-employee-xxxx.vercel.app`
8. Rename the project in Vercel to `kisan-employee-mvp`
9. URL becomes: `kisan-employee-mvp.vercel.app`

---

## Step 5.3 — Deploy Admin Dashboard to Vercel

1. Go to Vercel → **Add New Project** again
2. Import the **same** `kisan-mall-mvp` repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/admin`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the same environment variables
5. Deploy
6. Rename to `kisan-admin-mvp`
7. URL: `kisan-admin-mvp.vercel.app`

---

## Step 5.4 — Update Firebase Authorized Domains

After deployment, add the Vercel URLs to Firebase:

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add:
   - `kisan-employee-mvp.vercel.app`
   - `kisan-admin-mvp.vercel.app`
3. Also update Firestore rules to allow the new domains if needed

---

## Step 5.5 — PROMPT 32: Final Polish Pass

```
Do a final polish pass on both apps before client demo. Fix these specific items:

Employee App:
1. Make sure the Kisan logo shows correctly on all screens
   - Use this as the logo: a styled div with "KISAN" in bold #E91E8C (hot pink) + "FASHION MALL" in smaller gray text
   - This represents the logo until the actual PNG is integrated
   - On cream background, ensure the logo is clearly visible

2. Test all 4 language switches on every screen — confirm no text stays in English when another language is selected

3. On mobile (test in Chrome DevTools, iPhone SE size 375px):
   - All buttons must be at minimum 48px height (easy to tap)
   - No horizontal scrolling anywhere
   - Video player fills the screen width properly
   - Custom keypad keys are large enough to tap

4. Add a small "Powered by Linq Tech" footer on the done screen (subtle, gray, 12px)

5. Ensure the 5-tap dev shortcut to skip video is still working (for client demo)

Admin Dashboard:
1. Make sure the seed data button is working on the deployed URL
2. Test bulk employee CSV upload with a sample file
3. Verify Excel and PDF reports download correctly on the deployed URL
4. Check that all Recharts charts render correctly (sometimes they need window resize to show)
5. Add "MVP Demo Version" subtle badge in the admin sidebar footer

Both apps:
1. Test on these browsers: Chrome, Safari, Firefox
2. Test on mobile: Chrome on Android, Safari on iPhone
3. Confirm no console errors on either deployed URL
4. Confirm all Firestore reads/writes work on the deployed URLs (not just localhost)
```

---

## Step 5.6 — Final QA Checklist

### Employee App — Full Flow Test

Go to `kisan-employee-mvp.vercel.app` on your phone and test:

**Language Selection:**
- [ ] All 4 language cards display correctly with correct scripts
- [ ] Selecting Telugu → all text changes to Telugu immediately
- [ ] Selecting Hindi → all text changes to Hindi
- [ ] Selecting Marathi → all text changes to Marathi
- [ ] Continue button disabled until language selected
- [ ] Language preference saved after page refresh

**Login:**
- [ ] Custom keypad works, tapping keys fills the number display
- [ ] Backspace clears last digit
- [ ] Clear (X) clears all digits
- [ ] Login with 9000000001 → succeeds, shows "Hi, Ramesh Kumar!"
- [ ] Login with 9999999999 (nonexistent) → shows error in correct language
- [ ] Login with inactive employee → shows inactive error

**Training Home:**
- [ ] Greeting shows employee name correctly
- [ ] Training card loads with title and section badge
- [ ] "Watch Training" button is enabled
- [ ] "Start Quiz" button is disabled with lock icon before video
- [ ] Language switcher in top bar works and changes all text
- [ ] Call Manager button tappable (should attempt to open phone dialer)
- [ ] Leaderboard teaser card visible at bottom with "Coming Soon"

**Video Player:**
- [ ] Video loads and plays
- [ ] Cannot seek forward (seek bar snaps back if dragged)
- [ ] Progress bar shows watched percentage
- [ ] 5-tap shortcut on progress bar marks video complete
- [ ] After completion: green success toast appears
- [ ] "Start Quiz" button becomes active and green

**Quiz:**
- [ ] Questions show in the language selected on home screen
- [ ] Options are tappable and visually select
- [ ] Cannot change answer after selecting (per question)
- [ ] Progress bar shows question number
- [ ] Last question shows "Submit" instead of "Next"
- [ ] On submit: navigates to Done screen

**Done Screen:**
- [ ] Score percentage shows correctly
- [ ] Pass/fail badge shows correctly (60% threshold)
- [ ] Certificate card shows "Coming Soon"
- [ ] Leaderboard card shows "Coming Soon"
- [ ] "I am Good to Go" returns to home screen
- [ ] Completion saved in Firestore (check Firebase Console)

### Admin Dashboard — Full Flow Test

Go to `kisan-admin-mvp.vercel.app` on laptop:

**Login:**
- [ ] Login with admin@kisanmall.com / KisanAdmin@2024 → succeeds
- [ ] Wrong password → shows error
- [ ] Redirects to dashboard after login

**Dashboard:**
- [ ] Total employees shows ~150
- [ ] Active employees shows correct count
- [ ] Completion rate shows percentage
- [ ] "Not completed" table shows employee names
- [ ] Weekly chart renders correctly

**Sections:**
- [ ] All 5 sections visible
- [ ] Can create new section
- [ ] Can edit section name
- [ ] Can delete section (with confirmation)

**Trainings:**
- [ ] All 5 trainings visible
- [ ] Can filter by section and status
- [ ] Can click Activate on a draft training
- [ ] Add Training modal opens with all fields

**Quiz Management:**
- [ ] Select Customer Service training → shows 4 questions
- [ ] Questions display in English by default
- [ ] Add Question modal opens with 4 language tabs
- [ ] Can switch tabs and fill in Telugu/Hindi/Marathi

**Employees:**
- [ ] Table shows 150 employees with pagination
- [ ] Search by name works
- [ ] Filter by department works
- [ ] Can add a new employee
- [ ] Bulk upload modal opens

**Reports:**
- [ ] Completion rate cards show numbers
- [ ] Charts render
- [ ] Download Excel → file downloads
- [ ] Download PDF → file downloads

**Settings:**
- [ ] Company name saves to Firestore
- [ ] Coming Soon badges visible on SMS/WhatsApp/Push notifications
- [ ] Seed Demo Data button visible

---

## Step 5.7 — Client Demo Script

Use this script during the client presentation:

**Opening (2 min):**
"Let me show you both sides — the employee experience first, then the admin dashboard."

**Employee Demo (10 min):**
1. Open `kisan-employee-mvp.vercel.app` on your phone (share screen)
2. Select Telugu → show instant language change
3. Login with 9000000001
4. Show the training home, explain the video lock
5. Play the video, use the 5-tap shortcut (say "in the real version employees watch the full video")
6. Answer quiz in Telugu — show the language is consistent
7. Show the Done screen with score
8. Show the Coming Soon teaser features

**Feature Flag Live Demo (2 min):**
"Let me show you something cool — the leaderboard is actually already built."
1. Open Antigravity/code editor
2. Change `LEADERBOARD_ENABLED: false` to `true`
3. Hot reload → leaderboard appears
"This is how quickly we can enable features in the production version."

**Admin Demo (10 min):**
1. Open `kisan-admin-mvp.vercel.app` on laptop
2. Login with admin credentials
3. Show dashboard with real employee and completion data
4. Show employee table — search for "Ramesh"
5. Show quiz management — open a question, switch to Telugu tab
6. Show reports — download an Excel report
7. Show settings — point out Coming Soon features

**Close (2 min):**
"Everything you see here is production-ready code. The next phase is replacing dummy videos with your real training content and connecting the production Firebase backend."

---

## Shareable Links for Client

```
Employee Training App:  https://kisan-employee-mvp.vercel.app
Admin Dashboard:        https://kisan-admin-mvp.vercel.app

Admin Login:
  Email:    admin@kisanmall.com
  Password: KisanAdmin@2024

Employee Demo Logins:
  9000000001  →  Ramesh Kumar (Customer Service)
  9000000002  →  Priya Sharma (Sales)
  9000000031  →  [Product Knowledge employee]
  9000000061  →  [Store Operations employee]
```

---

## Phase 5 Checklist

- [ ] Employee app deployed and accessible on phone browser
- [ ] Admin dashboard deployed and accessible on laptop
- [ ] Both apps work correctly on deployed URLs (not just localhost)
- [ ] Firebase authorized domains updated
- [ ] All 150 employees seeded on production Firebase
- [ ] Admin credentials work on deployed URL
- [ ] Excel report downloads on deployed URL
- [ ] PDF report downloads on deployed URL
- [ ] Full employee flow works end-to-end on deployed URL
- [ ] No console errors on either deployed URL
- [ ] Client demo script rehearsed at least once

**Final commit:**
```bash
git add .
git commit -m "Phase 5: Production deployment ready — MVP complete"
git push origin main
```

**🎉 MVP is ready for client presentation.**
