# Kisan Fashion Mall — Training Platform MVP
## Complete Build Guide for Google Antigravity IDE

> **Prepared by:** Linq Tech Private Limited  
> **Client:** Kisan Fashion Mall  
> **IDE:** Google Antigravity (`https://antigravity.google`)  
> **Deployment:** Vercel (default URL)  
> **Timeline:** 1–3 days  
> **Goal:** Full working MVP for client approval before production build in Cursor

---

## What You Are Building

Two separate React apps sharing one Firebase backend:

| App | URL | Hosting |
|---|---|---|
| Employee Training App | `kisan-employee.vercel.app` | Vercel |
| Admin Dashboard | `kisan-admin.vercel.app` | Vercel |

---

## File Index — Read These in Order

| File | What It Contains |
|---|---|
| `README.md` | This file — start here |
| `PHASE_0_SETUP.md` | Firebase + GitHub + Vercel + project scaffold |
| `PHASE_1_EMPLOYEE_APP.md` | All employee app screens + multilingual |
| `PHASE_2_ADMIN_DASHBOARD.md` | Full admin dashboard + all management screens |
| `PHASE_3_DUMMY_DATA.md` | Seed 150 employees, 5 sections, videos, quizzes in all 4 languages |
| `PHASE_4_EXTRA_FEATURES.md` | Leaderboard teaser, Coming Soon features, certificate preview |
| `PHASE_5_DEPLOY.md` | Vercel deployment, environment variables, final QA checklist |
| `DUMMY_CREDENTIALS.md` | All test logins for admin and employee demo |
| `COLOR_SYSTEM.md` | Full color palette extracted from HTML designs |
| `ANTIGRAVITY_TIPS.md` | How to use Google Antigravity IDE effectively for this project |

---

## Tech Stack Summary

```
Frontend:        React 19 + Vite + TypeScript + Tailwind CSS v4
State:           Zustand
Data Fetching:   TanStack React Query
Animations:      Framer Motion
Admin UI:        shadcn/ui + Recharts + TanStack Table
Languages:       react-i18next (EN, TE, HI, MR)
Video:           Mux Player React (dummy Mux videos)
Backend:         Firebase Blaze (Firestore + Auth + Functions + Storage)
Search:          Algolia (free tier)
Secrets:         .env files (Doppler in production)
Deployment:      Vercel
Monitoring:      Sentry
```

---

## Admin Demo Credentials

```
Email:    admin@kisanmall.com
Password: KisanAdmin@2024
```

---

## Employee Demo Login

Any of these mobile numbers work (seeded in Firestore):

```
9000000001  →  Ramesh Kumar     (Customer Service)
9000000002  →  Priya Sharma     (Sales)
9000000003  →  Suresh Reddy     (Store Operations)
9000000004  →  Anita Patel      (Product Knowledge)
9000000005  →  Vikram Singh     (Safety Training)
```

---

## Color System (from HTML designs)

```
Primary Green:     #1F7A4E
Light Green:       #2D9E68
Background Cream:  #FAF6EE
Card White:        #FFFFFF
Text Dark:         #1A1A1A
Text Muted:        #6B7280
Border:            #E5E7EB
Accent Gold:       #F59E0B
Error Red:         #EF4444
Success Green:     #10B981
```

---

## Important Rules for Antigravity Prompting

1. **One phase at a time** — never paste Phase 2 prompts until Phase 1 is fully working
2. **Test in preview** before moving to next prompt
3. **Never skip the seed data step** — the demo depends on it
4. **Always check Firestore rules** after each phase
5. **Commit to GitHub after each phase** — safety net if something breaks

---

## Build Order (1–3 Days)

```
Day 1 Morning:   Phase 0 — Setup (2–3 hours)
Day 1 Afternoon: Phase 1 — Employee App (4–5 hours)
Day 2 Morning:   Phase 2 — Admin Dashboard (4–5 hours)
Day 2 Afternoon: Phase 3 — Dummy Data + Languages (2–3 hours)
Day 3 Morning:   Phase 4 — Extra Features (2–3 hours)
Day 3 Afternoon: Phase 5 — Deploy + QA (2–3 hours)
```
