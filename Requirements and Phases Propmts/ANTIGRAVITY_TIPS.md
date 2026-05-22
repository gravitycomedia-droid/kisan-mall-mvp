# ANTIGRAVITY IDE TIPS
## How to Use Google Antigravity Effectively for This Project

> This file contains tips, shortcuts, and best practices specifically for building  
> the Kisan Mall Training Platform in Google Antigravity IDE (`https://antigravity.google`)

---

## Understanding Antigravity for This Project

Google Antigravity is an AI-first cloud IDE similar to Cursor. It runs in the browser, provides a VS Code-like interface, and has an AI assistant built in that understands your entire codebase.

Key features you'll use:
- **AI Chat Panel** — where you paste the prompts from this guide
- **Terminal** — for running pnpm commands, builds, and git
- **Preview Panel** — live preview of your running apps
- **File Explorer** — full project file tree
- **Port Forwarding** — exposes localhost ports publicly for testing

---

## How to Paste Prompts Correctly

### Do This
1. Open the AI chat panel (usually right side or bottom panel)
2. Copy the entire prompt block including all code examples
3. Paste as one message
4. Wait for the full response before doing anything
5. Review what files were created/modified
6. Test in preview panel
7. Only then paste the next prompt

### Don't Do This
- Do not interrupt Antigravity mid-response
- Do not paste two prompts at once
- Do not skip to a later prompt if an earlier one failed
- Do not close the browser tab during file generation (it will lose progress)

---

## Terminal Commands Reference

Open terminal in Antigravity: `Ctrl + `` ` (backtick)

```bash
# Run employee app
pnpm --filter employee dev

# Run admin app
pnpm --filter admin dev

# Run both simultaneously (open two terminal tabs)
# Tab 1:
pnpm --filter employee dev
# Tab 2:
pnpm --filter admin dev

# Build for production
pnpm --filter employee build
pnpm --filter admin build

# Install a new package in employee app only
pnpm --filter employee add [package-name]

# Install a new package in admin app only
pnpm --filter admin add [package-name]

# Install in both apps
pnpm --filter employee add [package] && pnpm --filter admin add [package]

# Run seed script (if built as npm script)
pnpm --filter admin seed

# Git commands
git add .
git commit -m "message"
git push origin main

# Check for TypeScript errors
pnpm --filter employee tsc --noEmit
pnpm --filter admin tsc --noEmit
```

---

## When Antigravity Makes a Mistake

This happens. Here's how to handle it efficiently:

### If it generates wrong code:
Tell it exactly what's wrong. Be specific:
```
"The login screen is not querying Firestore correctly. 
Currently it's doing [what it's doing]. 
It should do [what you want] instead. 
Fix only the login query logic in Login.tsx — don't change anything else."
```

### If it breaks something that was working:
```
"The last change broke [screen/feature]. 
Before your last response it was working. 
Please revert the changes to [filename] and only fix [the specific issue]."
```

### If it creates the wrong file structure:
```
"Stop. The files are in the wrong location. 
The correct location is [path]. 
Move [filename] to [correct path] and update all imports."
```

### If TypeScript errors appear:
Paste the exact error from the terminal:
```
"I have this TypeScript error:
[paste exact error]
Fix it without changing the component's functionality."
```

---

## Preview Panel Setup

Antigravity has a built-in preview panel. Set it up like this:

1. Run `pnpm --filter employee dev` in terminal
2. Antigravity will show a popup "Port 3000 is now available" — click "Open in Preview"
3. The employee app opens in the right panel
4. Open a second terminal tab → run admin app on port 3001
5. You can have both apps open in separate preview tabs

**Pro tip:** Right-click the preview URL and "Open in New Tab" to test on full screen.

**Mobile testing:** Click the phone icon in the preview panel to see mobile view. Or copy the preview URL and open on your actual phone (Antigravity exposes it publicly via port forwarding).

---

## File Structure Navigation Tips

```
Tip 1: Use Ctrl+P (or Cmd+P) to quickly find any file by name
Tip 2: The file explorer left sidebar — keep apps/ expanded, collapse node_modules
Tip 3: Tabs at top — keep firebase.config.ts and types.ts always open, you'll reference them constantly
Tip 4: Split editor — put the component on left, types.ts on right for reference
```

---

## Efficient Prompting Patterns

### Pattern 1: Build then wire (most efficient)
```
Step A: "Build the UI for [screen] with hardcoded dummy data"
Step B: "Now replace the dummy data with real Firestore queries using the db instance from shared/firebase.config.ts"
```
This is faster because Antigravity can focus on layout first, then data.

### Pattern 2: Fix by file name (prevents confusion)
Always mention the exact file:
```
"In apps/employee/src/screens/Login.tsx, add error handling for..."
```
Never: "In the login screen, add..." (Antigravity might edit the wrong file)

### Pattern 3: Show before hide (for Coming Soon features)
```
Step A: "Build the full leaderboard screen with working data"
Step B: "Now add the feature flag FEATURES.LEADERBOARD_ENABLED — hide it behind false"
```
This way you always have a working feature you can enable for the demo.

### Pattern 4: Test after each prompt
Never stack 3 prompts without testing. One prompt → test in preview → next prompt.

---

## Common Issues and Fixes

### Issue: "Module not found" error
```
Tell Antigravity: "I have a 'module not found' error for [module name]. 
Install it and fix the import."
```

### Issue: Firebase "permission denied" error
```
This means Firestore rules are blocking the read/write.
Check the Firestore rules in Firebase Console.
Tell Antigravity: "I'm getting a Firebase permission denied error when [action]. 
Show me what the Firestore rule should be for this operation."
```

### Issue: Tailwind classes not applying
```
Tell Antigravity: "The Tailwind class [class-name] is not applying. 
Check if Tailwind is configured correctly in apps/[app]/tailwind.config.js 
and that the file path is in the content array."
```

### Issue: Both apps sharing state (bug)
```
This happens if Zustand stores are accidentally imported across apps.
Tell Antigravity: "The [store] is being imported from the wrong app. 
Employee app should only use stores from apps/employee/src/store/.
Admin app should only use stores from apps/admin/src/store/.
Fix the import."
```

### Issue: i18next not switching language
```
Tell Antigravity: "The language switch is not updating [component name].
Make sure the component is wrapped with useTranslation() hook and 
all strings use the t() function. Show me the fix."
```

---

## Git Workflow in Antigravity

Antigravity has a built-in Git panel (source control icon on left sidebar).

**Recommended workflow:**
1. After each phase is complete → commit
2. Before starting a risky change → commit (safety net)
3. If something breaks badly → revert to last commit

```bash
# Quick save after each working phase
git add .
git commit -m "Phase [X]: [brief description]"
git push origin main

# If something breaks badly, revert to last commit
git stash          # saves current broken changes
git stash drop     # discards them permanently
# OR
git checkout .     # reverts all uncommitted changes
```

---

## Deployment Shortcut

Once Vercel is connected to GitHub, you don't need to deploy manually. Just:
```bash
git push origin main
```
Vercel auto-detects the push and deploys both apps in ~2 minutes.
Watch the deployment at `https://vercel.com/dashboard`.

---

## Demo Day Checklist (Morning of Client Meeting)

- [ ] Open both apps in browser tabs — confirm they load
- [ ] Test employee login with 9000000001 → confirm it works
- [ ] Test admin login → confirm it works
- [ ] Run the full employee flow once (language → login → video → quiz → done)
- [ ] Download one Excel report from admin — confirm the file is not empty
- [ ] Check Antigravity is open with features.ts visible (for live feature flag demo)
- [ ] Have DUMMY_CREDENTIALS.md open on your second screen for quick reference
- [ ] Charge your phone for the mobile demo
- [ ] Test the shareable link on a different device (not just your dev machine)
