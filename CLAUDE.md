# StudyTogether - Claude MVP Development Instructions

## 1. Project Overview

**Project:** A real-time, single-page "virtual library" where users study in the silent presence of others to increase motivation.

**Guiding Principle:** Prioritize speed and learning over technical complexity. We are building an experiment to validate a hypothesis, not a full-scale application.

**Core Goal:** To test if the silent, visible presence of other focused individuals is enough to increase a user's motivation and study session length.

**The Final MVP Blueprint**

##### Goal: To create the simplest possible app that validates the hypothesis: "Does the silent, visible presence of other focused individuals increase a user's motivation and study session length?"

- **State 1**: The "Lobby" (What a new user sees)

Layout: Exactly as you described and designed. A clear headline, the live counter, and the list of active students are all visible.
The Action Area:
An input field: [ Enter your name ]
A single button: [ Join the Study Room ]

- **State 2**: The "Main Room" (After clicking "Join")

The "Enter your name" input and "Join" button disappear.
In their place, a new set of buttons appears:
A primary, solid button: [ ► Start Study Session ]
(Optional, but recommended) A secondary, less prominent "ghost" button below it: [ ← Leave Room ]. This simply takes them back to State 1.
The user's name is now "in the room" but their timer has not started yet. They can see the list and prepare to focus.

- **State 3**: "In Session" (After clicking "Start Study Session")

The primary button [ ► Start Study Session ] instantly transforms into: [ ■ End Session ].
The [ ← Leave Room ] button might hide itself to reduce clutter, or it can stay.
The user's name, which is already in the list, now gets a timer next to it that starts counting up from 00:01.
Their row in the list is highlighted with your accent color.

- **State 4**: The Reset (After clicking "End Session")

The user's timer disappears from the list, and their highlight is removed.
The main button reverts back to [ ► Start Study Session ].
The user is now back in the "Main Room" (State 2), free to take a break or start a new session whenever they are ready.
Why This "Two-Step Start" is Slightly Better
This small change—separating "Join" from "Start"—more closely mimics the real world. You walk into the library (Join), find your seat, arrange your books, and then you start working (Start Session). It makes starting the timer a deliberate act of commitment from the user, which is psychologically more powerful.

This is it. This is the complete plan. It is simple, validated by your research, and technically achievable. You have everything you need. The planning and research phase is complete.

## 2. Technical Stack & Requirements (MVP Stack)

### **Primary Technologies**

- **Frontend**: **React with TypeScript** (initialized with **Vite**).
- **Backend & Database**: **Firebase** (using **Cloud Firestore** for real-time data).
- **Styling**: **Tailwind CSS** (for rapid, responsive, mobile-first design).
- **Deployment**: **Vercel** (for seamless, Git-based deployment).
- **Analytics**: **Plausible** (or a similar simple tool).

### UI constants

- **Primary background color**: #121826
- **Primary text color**: #E5E7EB
- **Accent Color**: (for the button, numbers, and highlights) #FFD27D
- **Primary font**: "Nunito Sans"

### **Development Principles**

1. **TypeScript-first**: Every file must use TypeScript with strict mode.
2. **Real-time by default**: Use Firestore listeners for live data updates.
3. **Privacy-focused**: Do not require user accounts for the MVP.
4. **Performance-optimized**: Target fast load times and responsive interactions.
5. **Responsive design**: The UI must be excellent on mobile, tablet, and desktop.
6. **Variable names**: Always use descriptive variable names
7. **Methods**: Always use single responsibility principle when creating new methods
8. Never use any
9. For some hard logics, leave understandable comments about the logic, what it's doing
10. Always use named arrow functions for all functions (components, utils, hooks, and so on) - const App = () => { ... }
11. Don't use default exports
12. Always use absolute paths in everywhere
13. Always check eslint and prettier errors with proper commands
14. Always handle TypeScript catch errors properly - error parameters are 'unknown' type
15. After completing each feature, update WHAT_WAS_DONE.md with detailed explanation of what was implemented
16. ALWAYS complete the full GitHub workflow automatically: commit → push → create PR → review → merge → switch to main
17. Always create util functions, hooks everywhere, don't make large the size of component, keep them as small as possible, and leave understandable comments for each function or hook on what they are doing

## 3. Code Quality & Formatting

### **Essential Commands to Run Regularly**

Claude Code MUST run these commands frequently during development:

```bash
# Code Quality Check Commands (Run before every commit)
npm run type-check     # TypeScript compilation errors
npm run lint          # ESLint error checking
npm run prettier      # Prettier formatting issues check

# Auto-fix Commands (Run to fix issues automatically)
npm run lint:fix      # Auto-fix ESLint errors
npm run prettier:fix  # Auto-format all files

# Build & Preview Commands (Run before PR creation)
npm run build         # Production build verification
npm run preview       # Test production build locally
```

### **When to Run These Commands**

1. **Before every commit**: `npm run type-check && npm run lint && npm run prettier`
2. **After making changes**: `npm run prettier:fix` to auto-format
3. **Before creating PR**: All commands must pass without errors
4. **After installing packages**: `npm run lint:fix` to fix any new issues
5. **Daily development**: `npm run prettier:fix` to maintain consistent formatting

### **Command Workflow for Features**

```bash
# Start working on a feature
npm run prettier:fix   # Format existing code

# While developing
# ... make changes ...
npm run type-check     # Check TypeScript errors
npm run lint          # Check ESLint errors
npm run prettier:fix   # Auto-format changes

# Before committing
npm run type-check && npm run lint && npm run prettier
# ✅ All must pass before git commit

# Before creating PR
npm run build         # Must build successfully
npm run preview       # Test production build
```

### **Error Handling Strategy**

- **TypeScript errors**: Fix immediately, never ignore
- **ESLint errors**: Use `npm run lint:fix` first, then fix manually
- **Prettier errors**: Always use `npm run prettier:fix`
- **Build errors**: Must be resolved before PR creation

### **Formatting Rules Enforced**

- **No semicolons**: Prettier removes them automatically
- **Single quotes**: For strings
- **2-space indentation**: Consistent across all files
- **Trailing commas**: On multi-line objects/arrays
- **Line length**: 80 characters maximum

## 4. Code Standards & Structure

### **File Structure (Simplified for MVP)**

```
src/
├── components/
│ └── study/ # All study-related components (Lobby, StudyRoom, etc.)
├── types/ # TypeScript type definitions (types.ts)
├── lib/
│ └── firebase/ # Firebase configuration file (firebase.ts)
└── App.tsx # Main application component
```

### **Naming Conventions**

- **Files**: PascalCase for components (StudyRoom.tsx), kebab-case for others (firebase.ts).
- **Components**: PascalCase (StudyRoom, UserList).
- **Functions/Variables**: camelCase (joinRoom, currentSession).
- **Types/Interfaces**: PascalCase (Session).

### **TypeScript Guidelines**

```typescript
// Define clear interfaces for our main data structures in src/types.ts
import { Timestamp } from 'firebase/firestore'

export interface Session {
  id: string // Firestore document ID
  name: string
  status: 'active' | 'idle'
  sessionStartTime: Timestamp | null
  lastSeen: Timestamp
}

export interface AppState {
  view: 'lobby' | 'study-room'
  currentUser: Session | null
  allUsers: Session[]
  totalOnline: number
}

// Component props interfaces
export interface LobbyProps {
  onJoin: (name: string) => void
  totalOnline: number
}

export interface StudyRoomProps {
  currentUser: Session
  allUsers: Session[]
  onStartSession: () => void
  onEndSession: () => void
}
```

## 4. MVP Feature Plan

### **MVP v1 Scope (The ONLY Features to Build):**

1. **Single Page Layout:** The app transforms from a "lobby" state to a "study room" state on one page.
2. **Simple Join Flow:** A user enters a name, clicks "Join," and enters the room.
3. **Basic Timer:** A simple stopwatch (counting **up**) with "Start" and "End" functionality.
4. **Real-time Presence:** A live counter shows "X people are studying right now."
5. **Live User List:** A real-time list of participants and their timers.
6. **User Presence Management:** Automatic removal of users who close their browser.
7. **Feadback Modal feature after the user session is complete:** Below is the details for the Feedback feature:
   - Right after the user has finished the session, we will show a Modal with a title "Rate your experience"
   - There will be a description that says "Great, you've focused X minutes, or X hours. How was your experience"
   - After the title and description, there will be Bad, Decent, and Love it Icons, so that users can choose one of them
   - For the first Modal view, this is all
   - When the user chooses one of the icons, a new textarea is opened below the icons with a placeholder "Tell us more"
   - Under the textarea, there will be a Submit button to submit the form
   - After the submit, the content transforms into "Thank you for your feedback!" in place, and the Modal automatically fades out after 2-3 seconds
   - We should apply nice and very smooth animations
   - Constants for the UI:
     - Modal background: #1E293B
     - Modal text: #E5E7EB
     - Icons color (when not selected): #94A3B8
     - Icons color (when selected): #FFD27D
     - Textarea background: #1E293B
     - Textarea text color: #E5E7EB
     - Submit button background: #FFD27D
     - Submit button text: #121826
     - "Thank you" modal background: #1E293B
     - "Thank you" modal text: #E5E7EB

### **Core UI Components to Build:**

1. **App**: Main component managing state and views.
2. **Lobby**: Name input + Join button (visible on load).
3. **StudyRoom**: Session controls + user list (visible after joining).
4. **UserList**: Real-time list of users.
5. **Timer**: Displays the running stopwatch.

## 5. Implementation Guidelines

### **Real-time Features**

- **Use Firestore Listeners**: Use Firebase's onSnapshot for all real-time data fetching. Do not implement custom WebSockets.
- **Optimistic Updates**: For actions like starting a session, update the local UI state immediately while the request to Firebase is in progress.

### **Timer Sync Strategy**

For MVP simplicity, implement a lightweight timer sync approach:

```typescript
// Timer Implementation Strategy
- **Local Display**: Use setInterval for smooth 1-second UI updates
- **Firestore Sync**: Update Firestore only on status changes (start/end session)
- **Time Calculation**: Calculate elapsed time as (currentTime - sessionStartTime)
- **Sync Frequency**: Update lastSeen timestamp every 30 seconds for presence detection
- **Browser Handling**: Pause local timer on tab visibility change, resume on focus

// Example timer calculation
const calculateElapsedTime = (startTime: Timestamp): number => {
  if (!startTime) return 0;
  return Math.floor((Date.now() - startTime.toMillis()) / 1000);
};
```

This approach provides the accountability effect while minimizing Firestore writes and technical complexity.

### **TypeScript Error Handling Requirements**

Always handle catch blocks properly since TypeScript strict mode treats error parameters as `unknown`:

```typescript
// ❌ WRONG - Will cause TypeScript errors
try {
  await someAsyncOperation()
} catch (error) {
  console.error('Error details:', error.code, error.message) // TS Error: 'unknown' type
}

// ✅ CORRECT - Type guard for error handling
try {
  await someAsyncOperation()
} catch (error) {
  console.error('Operation failed:', error)
  if (error instanceof Error) {
    console.error('Error details:', error.message)
  }
}

// ✅ CORRECT - Alternative with type assertion for Firebase errors
try {
  await firebaseOperation()
} catch (error) {
  console.error('Firebase operation failed:', error)
  if (error instanceof Error) {
    console.error('Error message:', error.message)
  }
  // For Firebase-specific error codes
  if (typeof error === 'object' && error !== null && 'code' in error) {
    console.error('Firebase error code:', (error as any).code)
  }
}

// ✅ CORRECT - Simple error handling pattern
const handleAsyncOperation = async () => {
  try {
    const result = await someOperation()
    return { success: true, data: result }
  } catch (error) {
    console.error('Operation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
```

### **Error Handling Best Practices**

1. **Always log the full error object first**: `console.error('Context:', error)`
2. **Use type guards**: Check `error instanceof Error` before accessing properties
3. **Provide fallback messages**: Handle cases where error might not be an Error instance
4. **Firebase errors**: Firebase errors have additional properties like `code` that need type assertion
5. **User-friendly messages**: Don't expose raw error messages to users in production

### **User Analytics Requirements**

- **Track one primary event:**
  - 'session_started'
- **Trigger this event** when the user clicks the "Start Study Session" button.
- **Implementation:** Use a simple analytics tool like Plausible.

### **Privacy & Security**

- **Anonymous by default**: Users must be able to join without an account.
- **Session-based tracking**: Use the auto-generated Firestore document ID to manage a user's session.
- **Data retention**: Implement a Cloud Function that runs on a schedule (e.g., every 5 minutes) to delete stale sessions documents based on the lastSeen timestamp.

## 6. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write: if true; // Public read/write for MVP
      allow delete: if false; // Only server-side cleanup
    }
  }
}
```

## 7. Error Handling for MVP

Keep error handling simple but functional:

- **Firebase connection failures**: Show "Connecting..." state
- **Join failures**: Simple retry button with basic error message
- **Timer sync issues**: Continue local timer, sync when connection restored
- **Network disconnection**: Display connection status, auto-retry on reconnection
- **No complex error boundaries needed for MVP**

```typescript
// Simple error handling pattern
const handleFirebaseError = (error: Error) => {
  console.error('Firebase error:', error)
  // Show simple user-friendly message
  setErrorMessage('Connection issue. Retrying...')
  // Auto-retry after 3 seconds
  setTimeout(retryOperation, 3000)
}
```

## 8. Performance Targets (MVP)

- **Time to join room**: <2 seconds
- **Firestore listener latency**: <500ms
- **Support 20-30 concurrent users reliably**
- **Mobile-first responsive design**
- **Page load speed**: <3 seconds on 3G
- **Timer accuracy**: ±1 second across browsers

## 9. Mobile-Specific Requirements

- **Touch-friendly button sizes**: 44px minimum tap targets
- **Prevent zoom on input focus**: Use `user-scalable=no` meta tag
- **Handle sleep/wake cycles**: Recalculate timer on page visibility change
- **Optimize for portrait orientation primarily**
- **Ensure text is readable without zooming**: Minimum 16px font size

```css
/* Mobile optimization utilities */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Prevent zoom on input focus */
input {
  font-size: 16px; /* Prevents zoom on iOS */
}
```

## 10. Git Workflow & GitHub CLI Integration

### **Branch Strategy**

```bash
# Main branches
main          # Production-ready code only
develop       # Integration branch (optional for MVP)

# Feature branches
feature/lobby-ui
feature/timer-functionality
feature/real-time-presence
feature/firebase-integration
feature/mobile-responsive

# Fix branches
fix/timer-sync-mobile
fix/firebase-connection
fix/responsive-layout
```

### **GitHub CLI Workflow Commands**

Claude Code MUST automatically execute this complete workflow after finishing each feature:

```bash
# 1. Start new feature
git checkout main
git pull origin main
git checkout -b feature/[feature-name]

# 2. Work on feature with regular commits
# ... development work ...

# 3. AUTOMATIC FEATURE COMPLETION WORKFLOW
# Run code quality checks
npm run prettier:fix
npm run type-check && npm run lint && npm run prettier

# Stage and commit final changes
git add .
git commit -m "feat: [descriptive feature summary]"

# Push feature branch
git push -u origin feature/[feature-name]

# Create PR with detailed description
gh pr create --title "[Feature Title]" --body "$(cat <<'EOF'
## Summary
- Brief feature description

## Changes
- **Key Change 1**: Description
- **Key Change 2**: Description

## Code Quality Checklist
- [x] \`npm run type-check\` - No TypeScript errors
- [x] \`npm run lint\` - No ESLint errors
- [x] \`npm run prettier\` - All files properly formatted
- [x] \`npm run build\` - Production build successful

## Testing
- [x] Feature tested and working
- [x] No console errors

🤖 Generated with [Claude Code](https://claude.ai/code)
EOF
)"

# Review the PR
gh pr view [PR-number]

# Merge PR with squash and delete branch
gh pr merge [PR-number] --squash --delete-branch

# Update WHAT_WAS_DONE.md with feature documentation
# (This should be done before the final commit)
```

### **MANDATORY Feature Completion Process**

After implementing any feature, Claude Code MUST:

1. ✅ **Code Quality**: Run all quality checks and fix issues
2. ✅ **Documentation**: Update WHAT_WAS_DONE.md with detailed feature explanation before committing
3. ✅ **Commit**: Stage and commit all changes with descriptive and short message
4. ✅ **Push**: Push feature branch to remote
5. ✅ **PR Creation**: Create detailed PR with GitHub CLI
6. ✅ **Review**: Display PR for review
7. ✅ **Merge**: Merge PR with squash and delete branch
8. ✅ **Main**: Return to main branch ready for next feature

**NO EXCEPTIONS** - This workflow must be completed for every feature.

````

### **Commit Message Format**

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) with these specific types:

```bash
feat: add real-time user list and timer
fix: resolve timer sync on mobile browsers
style: apply responsive design to study room
refactor: extract firebase logic to separate hook
test: add timer accuracy verification
docs: update README with deployment steps
chore: update dependencies and build config
````

### **Feature Development Cycle**

For each MVP feature, Claude Code should follow this exact pattern:

```bash
# Step 1: Create feature branch
git checkout main && git pull origin main
git checkout -b feature/[feature-name]

# Step 2: Implement feature with atomic commits
git add src/components/Timer.tsx
git commit -m "feat: add Timer component with basic functionality"

git add src/hooks/useTimer.ts
git commit -m "feat: add useTimer hook for state management"

git add src/components/Timer.tsx
git commit -m "style: add responsive styling to Timer component"

# Step 3: Push and create detailed PR
git push -u origin feature/[feature-name]
gh pr create --title "[Feature Name]" --body "[Detailed description with testing checklist]"

# Step 4: Review and merge
gh pr view [PR-number]  # Review the PR
gh pr merge [PR-number] --squash --delete-branch
```

### **Pull Request Template**

Every PR should include this information:

```markdown
## Feature: [Feature Name]

### Description

Brief description of what this PR implements.

### Changes

- [ ] Component/file 1: What it does
- [ ] Component/file 2: What it does
- [ ] Styling: Responsive design updates
- [ ] Types: TypeScript interface updates

### Testing Checklist

- [ ] Feature works on desktop Chrome
- [ ] Feature works on mobile Safari
- [ ] Timer accuracy verified
- [ ] Real-time updates working
- [ ] Error states handled
- [ ] No console errors
- [ ] Responsive design verified

### Screenshots

[Include screenshots for UI changes]

### Notes

Any additional context or considerations.
```

### **GitHub CLI Commands for Claude Code**

```bash
# Repository setup
gh repo create studytogether --public
gh repo clone studytogether
cd studytogether

# Branch management
gh pr list                    # List all PRs
gh pr status                  # Check PR status
gh pr view [PR-number]        # Review specific PR
gh pr review [PR-number] --approve  # Approve PR
gh pr merge [PR-number] --squash    # Merge with squash

# Issue tracking
gh issue create --title "Bug: Timer not syncing on mobile" --body "Description"
gh issue list
gh issue close [issue-number]

# Release management
gh release create v1.0.0 --title "MVP Release" --notes "Initial StudyTogether MVP"
```

### **Automated PR Checks**

Claude Code MUST run these commands before creating each PR:

```bash
# Pre-PR checklist commands - ALL MUST PASS
npm run prettier:fix   # Auto-format all files first
npm run type-check     # TypeScript compilation
npm run lint          # ESLint error checking
npm run prettier      # Prettier formatting verification
npm run build         # Production build test
npm run preview       # Local preview testing

# Comprehensive check command
npm run type-check && npm run lint && npm run prettier && npm run build

# Only create PR if all checks pass
if [[ $? -eq 0 ]]; then
  gh pr create --title "$TITLE" --body "$BODY"
else
  echo "❌ Pre-PR checks failed. Fix all issues before creating PR."
  echo "Run: npm run prettier:fix && npm run lint:fix to auto-fix common issues"
fi
```

### **PR Quality Requirements**

Every PR must include evidence of passing these checks:

```markdown
### Code Quality Checklist

- [ ] `npm run type-check` - No TypeScript errors
- [ ] `npm run lint` - No ESLint errors
- [ ] `npm run prettier` - All files properly formatted
- [ ] `npm run build` - Production build successful
- [ ] `npm run preview` - Preview works correctly
- [ ] Manual testing completed on desktop/mobile
```

### **Commit Frequency & Strategy**

- **Atomic commits**: One logical change per commit
- **Feature completion**: Push and create PR after each complete feature
- **Daily pushes**: Push work-in-progress daily to feature branches
- **Descriptive messages**: Include reasoning for complex changes

```bash
# Good commit examples
git commit -m "feat: add Firebase Firestore integration for real-time data"
git commit -m "style: implement mobile-first responsive design for study room"
git commit -m "fix: resolve timer desync when browser tab loses focus"
git commit -m "refactor: extract user presence logic into custom hook"
```

## 11. Pre-Deployment Checklist

Before going live, ensure:

1. **Firebase project configured** with environment variables
2. **Firestore security rules deployed** and tested
3. **Analytics tracking code integrated** and verified
4. **Mobile responsiveness tested** across devices
5. **Timer accuracy verified** across multiple browsers
6. **Auto-cleanup Cloud Function deployed** for stale sessions
7. **Basic error states handled** (connection issues, etc.)
8. **Performance tested** with simulated concurrent users

## 12. Testing Strategy

### **Manual Testing Requirements**

- **Multi-tab testing**: Open multiple browser tabs to simulate users
- **Mobile device testing**: Test on actual iOS and Android devices
- **Connection interruption**: Test behavior when internet disconnects
- **Timer accuracy**: Verify timers stay in sync across users
- **Join/leave flow**: Test user experience from start to finish

### **Key Scenarios to Test**

```typescript
// Critical user flows to verify
1. User joins room → sees other users immediately
2. User starts session → appears as "studying" to others instantly
3. User closes browser → disappears from others' view within 60 seconds
4. Multiple users join simultaneously → no conflicts
5. Timer continues accurately after tab switch/mobile sleep
```

## 13. When in Doubt

1. Prioritize user experience and speed of development over technical complexity.
2. Keep features simple and focused on the core hypothesis.
3. Ensure the real-time functionality via Firestore is reliable.
4. Ask for clarification on ambiguous requirements.
5. **If a feature takes more than 2 hours to implement, consider if it's truly MVP-essential.**
6. **Test with multiple browser tabs open to simulate multiple users.**
7. **Prioritize the "feel" of studying together over technical perfection.**

Remember: **We're building a virtual library, not a social platform.** The goal is ambient accountability and testing the core hypothesis that silent, visible presence increases study motivation and session length.
