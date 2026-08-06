# Complete Firebase Usage and Performance Optimization Audit

This plan addresses all issues related to duplicate Firebase requests, improper listener management, and rate limiting in the SkillSwap application.

## User Review Required

> [!WARNING]
> This plan involves consolidating authentication state to a single listener and removing redundant Firestore listeners. Please review the proposed changes to ensure they align with the expected application architecture.

## Open Questions

None currently. The requirements are clear.

## Proposed Changes

---

### Authentication Core (`App.tsx`, `MainApp.tsx`, `AuthPage.tsx`, `VerifyEmailPage.tsx`)

#### [MODIFY] [App.tsx](file:///d:/Code/Projects/SKILLSWAP%20G/App.tsx)
- Keep `onAuthStateChanged` here as the **single source of truth**.
- Pass the full `authUser` object to `MainApp.tsx` instead of just a boolean, removing the need for a second listener.
- Add development logging: `[AUTH] Auth state changed`.

#### [MODIFY] [MainApp.tsx](file:///d:/Code/Projects/SKILLSWAP%20G/MainApp.tsx)
- **Remove** duplicate `onAuthStateChanged`.
- Rely on `authUser` prop passed from `App.tsx` to fetch the user profile.
- Pass `currentUser` to child components (`Matching`, etc.) to prevent duplicate profile fetches.
- **Optimize RTDB Presence**: Move `set(userStatusRef)` into an effect that only runs when the connection is established and the user logs in, preventing repeated writes when the user's profile points/stats update.
- Add development logging for profile fetching and presence attachment.

#### [MODIFY] [AuthPage.tsx](file:///d:/Code/Projects/SKILLSWAP%20G/components/AuthPage.tsx)
- Enhance double-submission protection for Login, Signup, and Google Auth.
- Ensure `finally { setIsLoading(false); }` is consistently used.
- Add development logging: `[AUTH] Login request`, `[AUTH] Signup request`.
- Handle `auth/too-many-requests` with a user-friendly error message.

#### [MODIFY] [VerifyEmailPage.tsx](file:///d:/Code/Projects/SKILLSWAP%20G/components/VerifyEmailPage.tsx)
- Ensure 60-second cooldown is strictly enforced.
- Prevent rapid double-clicking on "I've Verified My Email" using proper loading states.
- Add development logging: `[AUTH] User reload requested`, `[AUTH] Verification email requested`.

---

### Component-Level Optimizations

#### [MODIFY] [Matching.tsx](file:///d:/Code/Projects/SKILLSWAP%20G/components/Matching.tsx)
- **Remove** duplicate `firestoreService.subscribeToUser` for `currentUser`.
- Accept `currentUser` as a prop from `MainApp`.
- Optimize the `students` list fetching. Consider fetching once in `MainApp` and passing down, or ensuring the effect cleans up properly and doesn't re-trigger unnecessarily.

#### [MODIFY] [services/authService.ts](file:///d:/Code/Projects/SKILLSWAP%20G/services/authService.ts)
- Add development logs for actual Firebase API calls (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`).

---

### AI Assistant (`AIAssistant.tsx`)

#### [MODIFY] [AIAssistant.tsx](file:///d:/Code/Projects/SKILLSWAP%20G/components/AIAssistant.tsx)
- Add development logging: `[AI] Gemini request`.
- Ensure no requests are fired on mount. (It currently waits for user input, which is good, but we will add the log).

## Verification Plan

### Manual Verification
1. **Login Test**: Login once and check the console. Ensure exactly ONE `[AUTH] Login request` and ONE `[AUTH] Auth state changed` are logged. Rapidly clicking login should not produce more requests.
2. **Signup Test**: Signup once and check console. Ensure ONE create-user request and ONE verification-email request.
3. **Verify Email Test**: Open VerifyEmailPage, ensure ZERO automatic resends. Click Resend, ensure button locks for 60 seconds.
4. **Navigation Test**: Navigate between Dashboard and Explore (Matching) and ensure listeners don't accumulate and no duplicate user profile fetches occur.
5. **AI Assistant Test**: Use the app normally, ensure ZERO Gemini requests until explicitly interacting with the AI Assistant.

### Automated Tests
- Run `npm run build` to ensure no TypeScript or build errors are introduced by the prop changes.
