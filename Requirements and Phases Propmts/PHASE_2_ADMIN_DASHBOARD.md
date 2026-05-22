# PHASE 2 — Admin Dashboard
## All 9 Screens + Real Firebase Data

> **Time estimate:** 4–5 hours  
> **Goal:** Fully functional admin dashboard with real Firestore read/write  
> **Prerequisite:** Phase 1 complete and committed

---

## Screens to Build

```
Screen 1:  Login                  (admin auth)
Screen 2:  Dashboard Home         (summary cards + analytics)
Screen 3:  Training Sections      (CRUD)
Screen 4:  Trainings / Videos     (upload + manage)
Screen 5:  Quiz Management        (questions per training)
Screen 6:  Employees              (manage + bulk upload)
Screen 7:  Reports                (analytics + download)
Screen 8:  Languages              (enable/disable)
Screen 9:  Settings               (company config)
```

---

## Step 2.1 — PROMPT 12: Admin App Structure + Auth

```
Build the complete admin dashboard app structure (apps/admin/).

1. Set up React Router v6 with these routes:
   /login → AdminLogin screen (public)
   /dashboard → Dashboard home (protected)
   /sections → Training Sections (protected)
   /trainings → Trainings/Videos (protected)
   /quiz → Quiz Management (protected)
   /employees → Employees (protected)
   /reports → Reports (protected)
   /languages → Languages (protected)
   /settings → Settings (protected)

2. Create a ProtectedRoute component that:
   - Checks Firebase Auth current user
   - Also checks if user UID exists in Firestore /admins collection
   - If not authenticated: redirect to /login
   - Shows loading spinner while checking auth state

3. Create the Admin Layout component (AdminLayout.tsx):
   - Left sidebar: fixed, 240px wide, white background, border-right 1px solid #E5E7EB
     Top: Kisan logo + "Admin Panel" text
     Navigation items with lucide-react icons:
       🏠 Dashboard (/dashboard)
       📚 Sections (/sections)
       🎬 Trainings (/trainings)
       ❓ Quiz (/quiz)
       👥 Employees (/employees)
       📊 Reports (/reports)
       🌐 Languages (/languages)
       ⚙️ Settings (/settings)
       🚪 Logout (button, not link)
     Active item: #1F7A4E background, white text, border-radius 8px
     Inactive: #6B7280 text, hover: #F9FAFB background
   
   - Top header: height 64px, white, border-bottom 1px solid #E5E7EB
     Left: current page title (dynamic)
     Right: admin email + avatar circle with initials
   
   - Main content area: flex-1, background #FAF6EE, padding 24px, overflow-y auto

4. Create Zustand store for admin (apps/admin/src/store/useAdminStore.ts):
   - admin: { uid, email } | null
   - actions: setAdmin, logout

5. Build AdminLogin screen:
   - Centered card on #FAF6EE background
   - Kisan logo at top
   - "Admin Login" heading
   - Email input field
   - Password input field (show/hide toggle)
   - Login button: #1F7A4E background
   - On submit: Firebase Auth signInWithEmailAndPassword
   - On success: check /admins/{uid} exists in Firestore, save to Zustand, redirect to /dashboard
   - Error handling: show specific errors (wrong password, user not found)
   - Loading state on button during auth
```

---

## Step 2.2 — PROMPT 13: Dashboard Home Screen

```
Build the Dashboard Home screen (apps/admin/src/screens/Dashboard.tsx).

This screen fetches real data from Firestore and shows summary analytics.

Summary cards row (4 cards in a grid):
Each card: white background, border-radius 12px, padding 20px, border 1px solid #E5E7EB

Card 1: Total Employees
  - Count all documents in /employees collection
  - Icon: Users (lucide)
  - Color accent: #1F7A4E

Card 2: Active Employees
  - Count employees where status == 'active'
  - Icon: UserCheck (lucide)
  - Color accent: #10B981

Card 3: Total Trainings
  - Count all documents in /trainings collection
  - Icon: PlayCircle (lucide)
  - Color accent: #3B82F6

Card 4: This Week Completion Rate
  - Count completions where weekNumber == currentWeekNumber
  - Divide by active employee count
  - Show as percentage with a circular progress indicator
  - Color accent: #F59E0B

Below cards — two column layout:

Left column (60%):
  "Employees Not Completed This Week" table
  - Fetch employees where their ID does NOT appear in completions for current week
  - Show: Name, Department, Mobile (masked: 90XXXXX123)
  - Max 10 rows, "View all" link to employees screen
  - Empty state: "🎉 All employees completed this week's training!"

Right column (40%):
  "Recent Trainings" list
  - Last 5 trainings ordered by createdAt desc
  - Show: thumbnail circle, title, section badge, status pill (Active/Draft), date
  - "Add New Training" button at top: #1F7A4E background, white text, navigates to /trainings

Analytics chart (full width below):
  Use Recharts BarChart
  Show completion rates for last 5 weeks
  X axis: Week 1, Week 2, etc.
  Y axis: percentage 0-100%
  Bar color: #1F7A4E
  Responsive container, clean grid lines

All data fetched with TanStack React Query with proper loading skeletons.
Show loading skeleton cards while data loads (animate-pulse gray rectangles).
```

---

## Step 2.3 — PROMPT 14: Training Sections Screen

```
Build the Training Sections screen (apps/admin/src/screens/Sections.tsx).

This screen manages training category sections (Customer Service, Product Knowledge, etc.)

Layout:
- Page header: "Training Sections" title + "Add Section" button (top right, #1F7A4E)
- Sections grid: 3 columns, responsive

Each section card (white, border-radius 12px, padding 20px, border 1px solid #E5E7EB):
  - Section name: 18px bold
  - Description: 14px muted
  - Video count badge: "X videos" pill, #F0FBF5 background, #1F7A4E text
  - Created date: small, muted
  - Action buttons row: Edit (pencil icon) | Delete (trash icon, red)
  - Hover: subtle shadow increase

Add Section modal (shadcn/ui Dialog or custom modal):
  Fields:
    - Section Name (required, text input)
    - Description (optional, textarea)
  Buttons: Cancel | Save
  On save: add to Firestore /sections collection, close modal, refresh list

Edit Section modal:
  Same fields pre-filled
  On save: update Firestore document

Delete confirmation:
  Show confirm dialog: "Delete '[Section Name]'? This will not delete the videos."
  Red Delete button | Cancel

Firestore operations:
  - READ: getDocs(collection(db, 'sections'))
  - CREATE: addDoc with name, description, videoCount: 0, createdAt: serverTimestamp()
  - UPDATE: updateDoc with new name/description
  - DELETE: deleteDoc

Empty state: "No sections yet. Add your first training section." with an illustration placeholder.
```

---

## Step 2.4 — PROMPT 15: Trainings / Video Management Screen

```
Build the Trainings screen (apps/admin/src/screens/Trainings.tsx).

Layout:
- Header: "Trainings" + "Add Training" button
- Filter row: filter by Section (dropdown), Status (All/Active/Draft), search by title
- Trainings table using TanStack Table:
  Columns: Thumbnail | Title | Section | Week | Language | Status | Actions
  - Thumbnail: 48x48px rounded image
  - Status: colored pill (Active: green, Draft: amber)
  - Actions: Preview | Edit | Delete | Activate (if draft)
  - Sortable columns
  - Pagination: 10 per page

Add/Edit Training modal (large, full-width on mobile):
  Fields:
    Training Title: text input (required)
    Select Section: dropdown from /sections collection
    Video Upload: 
      File input that accepts mp4/mov
      For MVP: show upload UI but on selection, save to Firebase Storage and get URL
      Show upload progress bar
      After upload: show video thumbnail preview
    Thumbnail Upload: image file input, preview
    Description: textarea
    Training Week: number input
    Select Language: dropdown (English, Telugu, Hindi, Marathi, All)
    Status: toggle (Draft / Active)
  
  On save: write to Firestore /trainings with all fields + muxVideoId (use dummy ID for now: "VZtzUzGRv02OhRnZnxcselxOafK4lh02oxCjBn01eA")

Preview modal: embed Mux player inside a modal for quick preview

Activate training: when clicking Activate, set status to 'active' on that document and set all other trainings to 'draft' (only one active at a time)

Delete: confirmation dialog, then delete from Firestore (NOT from Storage in MVP)

Note: For MVP, video upload goes to Firebase Storage. Production will use Mux API.
```

---

## Step 2.5 — PROMPT 16: Quiz Management Screen

```
Build the Quiz Management screen (apps/admin/src/screens/QuizManagement.tsx).

Layout:
- Left panel (35%): list of all trainings
  Each training: title, section badge, quiz question count
  Click to select and view/edit its quiz
  Active selection highlighted with #1F7A4E left border

- Right panel (65%): quiz editor for selected training
  Header: training title + "Add Question" button
  
  Question list (each question is a card):
    Question number badge (1, 2, 3...)
    Question text (shows English version)
    Options shown as radio-like list
    Correct answer highlighted in green
    Edit | Delete buttons

Add/Edit Question modal:
  The key feature: ALL fields must be in ALL 4 languages

  Tab switcher: EN | TE | HI | MR
  Under each tab:
    Question text: textarea
    Option A: text input
    Option B: text input
    Option C: text input
    Option D: text input

  Correct Answer: radio buttons selecting A, B, C, or D (same for all languages)
  
  Note banner: "Fill in all languages. The employee sees the question in their selected language."

  On save: write to Firestore /quizzes collection:
  {
    trainingId: selected training ID,
    questions: [
      {
        id: auto-generated,
        text: { en: "...", te: "...", hi: "...", mr: "..." },
        options: { 
          en: ["A", "B", "C", "D"],
          te: ["A", "B", "C", "D"],
          hi: ["A", "B", "C", "D"],
          mr: ["A", "B", "C", "D"]
        },
        correctIndex: 0
      }
    ],
    passingMarks: 60
  }

Passing marks setting: number input at top of right panel (default 60%)

Empty state for right panel: "Select a training from the left to manage its quiz"
Empty questions state: "No questions yet. Add the first question."
```

---

## Step 2.6 — PROMPT 17: Employee Management Screen

```
Build the Employee Management screen (apps/admin/src/screens/Employees.tsx).

Layout:
- Header: "Employees" + stats row (Total: X | Active: Y | Inactive: Z)
- Action bar: Search input | Filter by Department | Filter by Status | "Add Employee" button | "Bulk Upload" button

Employee table (TanStack Table, paginated 20 per page):
  Columns:
    # (row number)
    Name (sortable)
    Mobile (show as 9XXXXXXXX01 — partially masked)
    Department (with colored badge)
    Status (Active: green pill | Inactive: red pill)
    Last Completed (date or "Never")
    Actions: Edit | Activate/Deactivate | Delete

Add Employee modal:
  Fields:
    Employee Name (required)
    Mobile Number (required, 10 digits, validate format)
    Department (dropdown: Customer Service, Product Knowledge, Store Operations, Safety Training, Sales Training)
    Status (Active/Inactive toggle, default Active)
  On save: write to Firestore /employees/{mobile} (use mobile as document ID for fast login lookup)

Edit Employee modal: same fields pre-filled

Activate/Deactivate: toggle status field in Firestore with confirm dialog

Delete: "Delete [Name]? Their completion history will be preserved." confirmation

Bulk Upload modal:
  Step 1: Download template button (generates a sample Excel file with columns: Name, Mobile, Department)
  Step 2: File upload area (drag & drop or click to browse, accepts .xlsx .csv)
  Step 3: Preview table showing parsed data (use Papa Parse for CSV or SheetJS for xlsx)
  Step 4: "Import X employees" button
  Progress: show import progress bar
  Results: "X imported successfully, Y failed" with error list

Department filter chips: show count per department.
```

---

## Step 2.7 — PROMPT 18: Reports Screen

```
Build the Reports screen (apps/admin/src/screens/Reports.tsx).

Layout — two sections:

Section 1: Analytics Cards Row
  Card 1: Overall Completion Rate — large percentage, circular progress
  Card 2: Average Quiz Score — score out of 100
  Card 3: Pending Training — count of employees not yet completed
  Card 4: Participation Rate — employees who started vs total

Charts (Recharts):
  Chart 1: Completion Rate by Department (horizontal bar chart)
    Departments on Y axis, completion % on X axis, #1F7A4E bars
    
  Chart 2: Weekly Trend (line chart)
    Last 8 weeks on X axis, completion rate on Y axis
    #1F7A4E line with dots

Section 2: Detailed Report Table
  Filters row:
    Date range picker (from/to)
    Training dropdown (all trainings)
    Department dropdown
    Completion status (All/Completed/Pending)
    "Apply Filters" button

  Table columns:
    Employee Name | Mobile (masked) | Department | Training Title | Section | Status | Score | Date Completed

  Table features:
    Sortable columns
    Pagination (20 per page)
    Row highlight: green for completed, amber for pending

Download buttons:
  "Download Excel" button: 
    Uses SheetJS to generate an .xlsx file from the filtered table data
    Filename: "kisan-training-report-[date].xlsx"
    Columns match the table
    
  "Download PDF" button:
    Uses jsPDF + autoTable to generate a PDF
    Header: Kisan Fashion Mall logo text + report title + date
    Table with all filtered data
    Footer: generated by Kisan Training Platform

Data loading: TanStack React Query fetching from Firestore completions collection with filters applied.
```

---

## Step 2.8 — PROMPT 19: Languages + Settings Screens

```
Build two remaining admin screens:

LANGUAGES SCREEN (apps/admin/src/screens/Languages.tsx):
Layout:
  Header: "Language Management"
  4 language cards in a 2x2 grid:
    Each card: flag emoji + language name + native script name
    Card 1: 🇬🇧 English (English) — always enabled, cannot disable
    Card 2: 🇮🇳 Telugu (తెలుగు)
    Card 3: 🇮🇳 Hindi (हिन्दी)
    Card 4: 🇮🇳 Marathi (मराठी)
    
  Each card has:
    Enable/Disable toggle switch
    "Set as Default" button (only one can be default)
    Status: "Enabled" (green) or "Disabled" (gray)
    
  Save button: updates Firestore /settings/languages document
  Disabled languages will not appear in employee language picker

SETTINGS SCREEN (apps/admin/src/screens/Settings.tsx):
Sections with card-style grouping:

Company Settings card:
  - Company Name: text input (default: "Kisan Fashion Mall")
  - Company Logo: image upload with preview (uploads to Firebase Storage)
    Current logo preview shown
    "Change Logo" button
  - Manager Contact Number: phone input (used for "Call Manager" button in employee app)
  Save button for this section

Admin Security card:
  - Current Password: password input
  - New Password: password input  
  - Confirm New Password: password input
  - "Change Password" button
  On submit: Firebase Auth updatePassword
  Show success/error message

Notification Settings card:
  SMS Reminders toggle: disabled, "Coming Soon" badge
  WhatsApp Reminders toggle: disabled, "Coming Soon" badge
  Push Notifications toggle: disabled, "Coming Soon" badge
  These are styled as locked features with amber "Coming Soon" badges

Attendance Integration card:
  "Connect Attendance System" button: disabled, "Coming Soon" badge
  Description: "Integrate with your existing attendance system to auto-track training during work hours."

All settings saved to Firestore /settings/global document on save.
```

---

## Phase 2 Checklist

- [ ] Admin login works with `admin@kisanmall.com` / `KisanAdmin@2024`
- [ ] Dashboard shows real counts from Firestore
- [ ] Can create/edit/delete training sections
- [ ] Can add a training with video upload
- [ ] Can add quiz questions in all 4 languages
- [ ] Employee table loads and paginates
- [ ] Bulk upload modal opens and parses file
- [ ] Reports screen shows charts
- [ ] Excel and PDF download work
- [ ] Settings saves to Firestore
- [ ] Coming Soon features show correct badges
- [ ] Sidebar navigation works on all screens

**Commit before Phase 3:**
```bash
git add .
git commit -m "Phase 2: Complete admin dashboard with all 9 screens"
git push origin main
```
