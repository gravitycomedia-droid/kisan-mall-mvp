# DUMMY CREDENTIALS
## All Test Logins for MVP Demo

> ⚠️ These are demo credentials only. Delete all dummy data before going live with real employees.

---

## Admin Login

```
URL:      https://kisan-admin-mvp.vercel.app/login
Email:    admin@kisanmall.com
Password: KisanAdmin@2024
```

---

## Employee Demo Logins

Use these mobile numbers on the employee app login screen.

### Customer Service Department

| Mobile | Name | Language |
|---|---|---|
| 9000000001 | Ramesh Kumar | English |
| 9000000002 | Priya Sharma | Telugu |
| 9000000003 | Suresh Reddy | Hindi |
| 9000000004 | Anita Patel | Marathi |
| 9000000005 | Vikram Singh | English |

### Sales Training Department

| Mobile | Name | Language |
|---|---|---|
| 9000000121 | First Sales Employee | English |
| 9000000122 | Second Sales Employee | Telugu |

### Product Knowledge Department

| Mobile | Name | Language |
|---|---|---|
| 9000000031 | First PK Employee | English |

### Store Operations Department

| Mobile | Name | Language |
|---|---|---|
| 9000000061 | First SO Employee | Hindi |

### Safety Training Department

| Mobile | Name | Language |
|---|---|---|
| 9000000091 | First Safety Employee | Marathi |

---

## Special Test Cases

### Inactive Employee (to test error handling)
```
Mobile: [any employee with status: inactive — check Firestore]
Expected: "Your account is inactive. Contact your manager."
```

### Non-existent Employee
```
Mobile: 9999999999
Expected: Error message in selected language
```

### Employee with Completed Training (to test done state)
```
Mobile: 9000000001 (Ramesh Kumar — has completion in week 1)
```

---

## Quick Demo Flow (Fastest path for client presentation)

```
1. Open employee app on phone
2. Select Telugu
3. Enter: 9000000001
4. Tap "Watch Training"
5. Tap progress bar 5 times quickly (dev shortcut to skip video)
6. Answer all quiz questions
7. Show Done screen with score
Total time: ~3 minutes
```

---

## Firebase Console Access

```
URL:      https://console.firebase.google.com
Project:  kisan-mall-mvp
```

Firestore collections to show client:
- `employees` — 150 documents
- `completions` — grows as demo progresses
- `trainings` — 5 documents
- `quizzes` — 5 documents

---

## Important Notes

1. **Do NOT share the admin password publicly** — only share with the client
2. **Employee mobiles are dummy** — no real people, safe to share
3. **Before production:** delete all documents in `employees` collection and re-seed with real employee data from Kisan Mall HR
4. **The seed script** can be re-run at any time from Settings to reset demo data
5. **Video is a Mux sample** — replace with real training videos from Kisan Mall content team
