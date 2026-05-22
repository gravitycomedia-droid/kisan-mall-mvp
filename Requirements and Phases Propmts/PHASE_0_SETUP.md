# PHASE 0 — Project Setup
## Google Antigravity IDE + Firebase + GitHub + Vercel

> **Time estimate:** 2–3 hours  
> **Goal:** Working monorepo scaffold with Firebase connected, both apps running in preview

---

## Step 0.1 — Create Firebase Project

Do this BEFORE opening Antigravity.

1. Go to `https://console.firebase.google.com`
2. Click **Add Project** → Name it `kisan-mall-mvp`
3. Disable Google Analytics (not needed for MVP)
4. Click **Create Project**
5. Upgrade to **Blaze plan** (Settings → Usage and billing → Modify plan)
6. Enable these services:
   - **Firestore Database** → Create database → Start in **test mode**
   - **Authentication** → Sign-in method → Enable **Email/Password**
   - **Storage** → Start in test mode
   - **Functions** → (will be set up later)
7. Go to **Project Settings → General → Your apps**
8. Click **Add app → Web app** → Name it `kisan-mvp`
9. Copy the `firebaseConfig` object — you will need it in Step 0.4

---

## Step 0.2 — Create GitHub Repos

Create two separate GitHub repositories:

```
Repo 1: kisan-mall-mvp          (this MVP — what you build now)
Repo 2: kisan-mall-production   (future production build in Cursor)
```

For now, only work in `kisan-mall-mvp`.

Initialize both as empty repos (no README, no .gitignore — Antigravity will handle that).

---

## Step 0.3 — Open Google Antigravity

1. Go to `https://antigravity.google`
2. Sign in with your Google account
3. Click **New Project**
4. Select **Import from GitHub** → connect `kisan-mall-mvp` repo
5. Choose environment: **Node.js**
6. Wait for the environment to load

---

## Step 0.4 — PROMPT 1: Create Full Monorepo Scaffold

Open the AI chat in Antigravity and paste this prompt exactly:

---

### PROMPT 1 — Project Scaffold

```
Create a monorepo project with the following structure for a React + TypeScript application called "Kisan Fashion Mall Training Platform".

Project structure:
kisan-mall-mvp/
├── apps/
│   ├── employee/          (React + Vite + TypeScript + Tailwind CSS v4)
│   └── admin/             (React + Vite + TypeScript + Tailwind CSS v4)
├── shared/
│   ├── firebase.config.ts
│   ├── types.ts
│   └── constants.ts
├── .env.example
├── .gitignore
└── package.json (pnpm workspaces)

Requirements:
- Use pnpm workspaces
- Both apps use React 19, Vite, TypeScript, Tailwind CSS v4
- Both apps have their own package.json with their own dev scripts
- Employee app runs on port 3000
- Admin app runs on port 3001
- Install in employee app: react-router-dom, zustand, @tanstack/react-query, framer-motion, react-i18next, i18next, i18next-browser-languagedetector, @mux/mux-player-react, firebase, lucide-react
- Install in admin app: react-router-dom, zustand, @tanstack/react-query, recharts, @tanstack/react-table, papaparse, firebase, lucide-react, shadcn/ui compatible components
- Install in both: firebase
- Create .env.example with placeholders for: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, VITE_MUX_TOKEN_ID
- Create .gitignore that excludes .env, node_modules, dist
- Create shared/firebase.config.ts that initialises Firebase app, Firestore, Auth, and Storage using environment variables and exports them
- Make sure both apps can run simultaneously with: pnpm --filter employee dev and pnpm --filter admin dev
```

---

**After Antigravity responds:** Run both apps in the terminal and confirm they open in the preview panel. Fix any errors before moving to Prompt 2.

---

## Step 0.5 — PROMPT 2: Environment Variables + Firebase Connection

```
Create a .env file in the root of the project with these Firebase values (I will replace with real values):

VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=kisan-mall-mvp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kisan-mall-mvp
VITE_FIREBASE_STORAGE_BUCKET=kisan-mall-mvp.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_MUX_TOKEN_ID=YOUR_MUX_TOKEN

Now update shared/firebase.config.ts to:
1. Import initializeApp, getFirestore, getAuth, getStorage from firebase
2. Read all config values from import.meta.env
3. Export: app, db, auth, storage as named exports
4. Also export a helper function called getDb() that returns the Firestore instance

Then create shared/types.ts with these TypeScript interfaces:

interface Employee {
  id: string
  name: string
  mobile: string
  department: string
  status: 'active' | 'inactive'
  lastCompletedWeek: number | null
  language: 'en' | 'te' | 'hi' | 'mr'
  createdAt: Date
}

interface Training {
  id: string
  title: string
  section: string
  muxVideoId: string
  thumbnailUrl: string
  description: string
  weekNumber: number
  language: string
  status: 'draft' | 'active'
  createdAt: Date
}

interface Quiz {
  id: string
  trainingId: string
  questions: QuizQuestion[]
  passingMarks: number
}

interface QuizQuestion {
  id: string
  text: { en: string; te: string; hi: string; mr: string }
  options: { en: string[]; te: string[]; hi: string[]; mr: string[] }
  correctIndex: number
}

interface Completion {
  id: string
  employeeId: string
  trainingId: string
  weekNumber: number
  score: number
  totalQuestions: number
  completedAt: Date
  watchedFull: boolean
}

interface TrainingSection {
  id: string
  name: string
  description: string
  videoCount: number
  createdAt: Date
}
```

---

**After this prompt:** Open Firebase Console → Firestore → confirm the connection works by checking no errors in the browser console.

---

## Step 0.6 — PROMPT 3: Firestore Security Rules

Go to Firebase Console → Firestore → Rules tab and replace with these rules. You can also ask Antigravity to generate this file:

```
Create a file called firestore.rules in the project root with this content and explain what each rule does:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Employees: public read by mobile lookup for login, write only by admin functions
    match /employees/{employeeId} {
      allow read: if true;
      allow write: if request.auth != null && isAdmin();
    }

    // Trainings: employees can read active ones, admin has full access
    match /trainings/{trainingId} {
      allow read: if resource.data.status == 'active' || isAdmin();
      allow write: if isAdmin();
    }

    // Quizzes: readable by anyone authenticated via mobile lookup, writable by admin
    match /quizzes/{quizId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Completions: employees write their own, admin reads all
    match /completions/{completionId} {
      allow create: if true;
      allow read: if isAdmin();
      allow update, delete: if false;
    }

    // Sections: readable by all, writable by admin
    match /sections/{sectionId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Settings: readable by all, writable by admin only
    match /settings/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Admins collection: only readable/writable by authenticated admins
    match /admins/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

---

## Step 0.7 — PROMPT 4: Tailwind + Color System Setup

```
Set up Tailwind CSS v4 in both the employee and admin apps with a shared design token system.

In both apps' tailwind config or CSS, define these custom colors based on the Kisan Fashion Mall brand:

:root {
  --color-primary: #1F7A4E;
  --color-primary-light: #2D9E68;
  --color-primary-dark: #165C3A;
  --color-bg: #FAF6EE;
  --color-surface: #FFFFFF;
  --color-text: #1A1A1A;
  --color-text-muted: #6B7280;
  --color-border: #E5E7EB;
  --color-accent: #F59E0B;
  --color-error: #EF4444;
  --color-success: #10B981;
  --color-warning: #F59E0B;
}

In Tailwind config extend the theme with:
- primary: #1F7A4E
- primary-light: #2D9E68
- primary-dark: #165C3A
- bg-cream: #FAF6EE
- accent: #F59E0B

Also set up the base font imports in index.html for both apps:
- Plus Jakarta Sans (weights 400, 500, 600, 700) from Google Fonts
- Noto Sans Telugu (weights 400, 500) from Google Fonts
- Noto Sans Devanagari (weights 400, 500) from Google Fonts

Set Plus Jakarta Sans as the default font-family in both apps' global CSS.
```

---

## Step 0.8 — Commit to GitHub

After all 4 prompts are done and both apps run without errors:

```bash
git add .
git commit -m "Phase 0: Project scaffold, Firebase config, color system"
git push origin main
```

---

## Phase 0 Checklist

Before moving to Phase 1, confirm ALL of these:

- [ ] Both apps run (`pnpm --filter employee dev` and `pnpm --filter admin dev`)
- [ ] No TypeScript errors in either app
- [ ] Firebase connection works (no console errors)
- [ ] All color variables are visible in both apps
- [ ] Google Fonts loading correctly (check Network tab)
- [ ] `.env` file exists and is in `.gitignore`
- [ ] Firestore rules are copied into Firebase Console
- [ ] GitHub repo has the initial commit

**Do NOT start Phase 1 until all boxes are checked.**
