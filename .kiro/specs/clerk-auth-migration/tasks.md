# Implementation Plan: Clerk Auth Migration

## Overview

Migrate the Adamsverse React/Vite application from Supabase Auth to Clerk. This involves installing Clerk, wrapping the app in ClerkProvider, refactoring route guards, creating sign-in/sign-up pages, building a webhook Edge Function for profile sync, removing all Supabase Auth code, updating CSP/env config, migrating the database schema, writing property-based tests, and updating steering files.

## Tasks

- [x] 1. Install Clerk dependency and set up ClerkProvider
  - [x] 1.1 Install @clerk/clerk-react package and update main.jsx
    - Run `npm install @clerk/clerk-react`
    - Modify `src/main.jsx` to import `ClerkProvider` from `@clerk/clerk-react`
    - Wrap the app tree: `<ClerkProvider> → <BrowserRouter> → <App />`
    - Add conditional rendering: if `VITE_CLERK_PUBLISHABLE_KEY` is missing, render a full-page error component instead of the app tree
    - The error component should display a clear message about the missing configuration
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Update environment configuration files
    - Add `VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key` to the client-side section of `.env.example`
    - Add `CLERK_WEBHOOK_SECRET=whsec_your-clerk-webhook-secret` to the server-side section of `.env.example`
    - Add `VITE_CLERK_PUBLISHABLE_KEY` to the `SECRETS_SCAN_OMIT_KEYS` list in `netlify.toml` `[build.environment]`
    - _Requirements: 10.1, 10.3, 10.4_

- [x] 2. Create useSupabaseClient hook for authenticated Supabase access
  - [x] 2.1 Implement useSupabaseClient hook
    - Create `src/hooks/useSupabaseClient.js`
    - Import `useAuth` from `@clerk/clerk-react` and `createClient` from `@supabase/supabase-js`
    - Use `useMemo` to create a Supabase client that passes the Clerk session token (via `getToken({ template: "supabase" })`) as the Authorization Bearer header
    - When token is null/unavailable, omit the Authorization header (falls back to anon key)
    - Export the hook as a named export
    - _Requirements: 14.2, 14.3, 14.4, 14.5_

- [x] 3. Refactor AuthGuard and AdminGuard to use Clerk hooks
  - [x] 3.1 Refactor AuthGuard component
    - Rewrite `src/components/AuthGuard.jsx` to import `useAuth` from `@clerk/clerk-react`
    - Replace custom `useAuth` hook usage with Clerk's `useAuth` (`isLoaded`, `isSignedIn`)
    - When `!isLoaded`: render loading indicator with `role="status"` and `aria-label="Loading"`
    - When `isLoaded && !isSignedIn`: render `<Navigate to="/login" replace />`
    - When `isLoaded && isSignedIn`: render `children`
    - Remove all imports of the old custom `useAuth` hook
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 3.2 Refactor AdminGuard component
    - Rewrite `src/components/AdminGuard.jsx` to import `useAuth` and `useUser` from `@clerk/clerk-react`
    - When `!isLoaded`: render loading indicator with `role="status"`
    - When `isLoaded && !isSignedIn`: redirect to `/login`
    - When `isLoaded && isSignedIn && user.publicMetadata.role !== "admin"`: redirect to `/dashboard`
    - When all conditions pass: render `children`
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 4. Create Sign-In and Sign-Up pages
  - [x] 4.1 Create SignInPage component
    - Create `src/pages/SignInPage.jsx` using Clerk's `<SignIn>` component
    - Import `SignIn` and `useAuth` from `@clerk/clerk-react`
    - Show loading indicator while `!isLoaded`
    - If already signed in: check `sessionStorage.getItem("selectedTier")` — if present, redirect to `/dashboard/intake/${tierId}` and remove the key; otherwise redirect to `/dashboard`
    - Configure `<SignIn routing="path" path="/login" signUpUrl="/signup" forceRedirectUrl="/dashboard" />`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 4.2 Create SignUpPage component
    - Create `src/pages/SignUpPage.jsx` using Clerk's `<SignUp>` component
    - Configure `<SignUp routing="path" path="/signup" signInUrl="/login" forceRedirectUrl="/dashboard" />`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.3 Update App.jsx routes for sign-in and sign-up
    - Replace the `LoginPage` lazy import with `SignInPage` lazy import
    - Add a new `/signup` route with lazy-loaded `SignUpPage`
    - Keep the `/login` path pointing to the new `SignInPage`
    - _Requirements: 2.1, 3.1_

- [x] 5. Implement sign-out with Clerk and update Navbar
  - [x] 5.1 Update Navbar sign-out to use Clerk
    - Import `useClerk` from `@clerk/clerk-react` in the Navbar component
    - Replace the existing sign-out logic with `clerk.signOut()`
    - Before calling `signOut()`, clear `sessionStorage.removeItem("selectedTier")` and `sessionStorage.removeItem("agent_auth")`
    - On success: redirect to `/` via `window.location.replace("/")`
    - On failure: display inline error message, keep user on current page, re-enable button
    - Disable the sign-out button while the operation is in progress
    - Update any user display (avatar, name) to use `useUser()` from Clerk
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 13.1_

- [x] 6. Checkpoint - Verify core auth flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Remove Supabase Auth code
  - [x] 7.1 Remove the custom useAuth hook and clean up Supabase client
    - Delete `src/hooks/useAuth.js` (the singleton auth store, `onAuthStateChange` listener, inactivity timeout, `SIGNED_OUT_KEY` logic)
    - Refactor `src/lib/supabase.js` to a plain anonymous client: remove `SIGNED_OUT_KEY` localStorage cleanup, auth proxy, and `sb-` key handling; retain `createClient(url, anonKey)` for database/storage/realtime
    - Remove the `INACTIVITY_TIMEOUT_MS` constant and all inactivity event listeners
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 7.4_

  - [x] 7.2 Remove all supabase.auth references from the codebase
    - Search for and remove all `supabase.auth` method calls (`signInWithOAuth`, `signInWithPassword`, `signUp`, `signOut`, `getSession`, `getUser`) from every file
    - Update any component that imported the custom `useAuth` hook to use Clerk hooks instead
    - Remove the old `LoginPage` file (`src/pages/LoginPage.jsx`) since it's replaced by `SignInPage`
    - Ensure no import references to the removed `useAuth` hook remain
    - _Requirements: 9.2, 9.5, 9.6, 9.7_

  - [x] 7.3 Update dashboard components to use useSupabaseClient hook
    - Replace direct `supabase` imports in dashboard pages/components that perform authenticated queries with the `useSupabaseClient()` hook
    - Ensure all authenticated Supabase queries (`.from()` calls that rely on RLS) use the Clerk-token-bearing client
    - Keep the anonymous `supabase` import for non-authenticated operations (storage, realtime, public queries)
    - _Requirements: 14.2, 14.4, 9.4_

- [x] 8. Create Clerk webhook Edge Function
  - [x] 8.1 Implement clerk-webhook Supabase Edge Function
    - Create `supabase/functions/clerk-webhook/index.ts` (Deno runtime)
    - Import `Webhook` from `svix` for signature verification
    - Read `CLERK_WEBHOOK_SECRET` from `Deno.env.get()` — return 500 if missing
    - Verify Svix signature using `svix-id`, `svix-timestamp`, `svix-signature` headers — return 401 on failure
    - Handle `user.created` and `user.updated`: upsert into `profiles` table with `id`, `email`, `display_name`, `avatar_url` using `onConflict: "id"`
    - Handle `user.deleted`: delete from `profiles` where `id` matches — no-op if row doesn't exist
    - Return 500 on Supabase write failure; return 200 on success or no-op
    - Use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from Deno env for the service-role client
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 10.2_

- [x] 9. Update Content Security Policy in netlify.toml
  - [x] 9.1 Add Clerk domains to CSP headers
    - In `netlify.toml` global `/*` header block, add to `script-src`: `https://*.clerk.accounts.dev https://clerk.adamsverse.com`
    - Add to `connect-src`: `https://*.clerk.accounts.dev https://clerk.adamsverse.com`
    - Add to `frame-src`: `https://*.clerk.accounts.dev`
    - Add to `img-src`: `https://img.clerk.com`
    - Add to `style-src`: `https://*.clerk.accounts.dev`
    - Preserve all existing allowed sources in each directive
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 10. Database migration for profiles.id column
  - [x] 10.1 Create SQL migration file for Clerk user ID format
    - Create `supabase/migrations/004_clerk_migration.sql`
    - Drop the FK constraint from `auth.users` on `profiles.id` (CASCADE)
    - Alter `profiles.id` column type from `uuid` to `text`
    - Re-add primary key on `profiles.id`
    - Alter FK columns in dependent tables (`projects.client_id`, `project_status_history.changed_by`, `project_feedback.client_id`, `invoices.client_id`, `messages.sender_id`, `notification_preferences.client_id`) to `text`
    - Re-add FK constraints with appropriate ON DELETE behavior
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [x] 11. Checkpoint - Verify build and existing tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Write property-based tests for auth components
  - [x]* 12.1 Write property test for AuthGuard state machine
    - **Property 1: AuthGuard renders correct output for any auth state**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Create `src/__tests__/property-clerk-auth-guard.test.jsx`
    - Use `fc.record({ isLoaded: fc.boolean(), isSignedIn: fc.boolean() })` generator
    - Assert: loading indicator when `!isLoaded`, redirect when `!isSignedIn`, children when signed in

  - [x]* 12.2 Write property test for AdminGuard state machine
    - **Property 2: AdminGuard renders correct output for any user state**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Create `src/__tests__/property-clerk-admin-guard.test.jsx`
    - Use `fc.record({ isLoaded: fc.boolean(), isSignedIn: fc.boolean(), role: fc.oneof(fc.constant("admin"), fc.constant("client"), fc.constant(undefined), fc.string()) })`
    - Assert correct rendering/redirect for each state combination

  - [x]* 12.3 Write property test for SignInPage selectedTier redirect
    - **Property 3: SignInPage selectedTier redirect path construction**
    - **Validates: Requirements 2.5**
    - Create `src/__tests__/property-clerk-signin-redirect.test.jsx`
    - Use `fc.string({ minLength: 1 }).filter(s => s.trim().length > 0)` for tier IDs
    - Assert redirect path is exactly `/dashboard/intake/${tierId}` and key is removed

  - [x]* 12.4 Write property test for sign-out sessionStorage cleanup
    - **Property 4: Sign-out clears application sessionStorage keys**
    - **Validates: Requirements 6.3**
    - Create `src/__tests__/property-clerk-signout.test.js`
    - Use `fc.array(fc.constantFrom("selectedTier", "agent_auth", "other_key"))` generator
    - Assert all app-specific keys are removed after sign-out

  - [x]* 12.5 Write property test for webhook profile sync
    - **Property 5: Webhook profile sync preserves user data**
    - **Validates: Requirements 8.1, 8.2, 8.6, 17.1**
    - Create `src/__tests__/property-clerk-webhook-sync.test.js`
    - Use `fc.record({ id: fc.string(), email: fc.emailAddress(), firstName: fc.string(), lastName: fc.string(), imageUrl: fc.webUrl() })`
    - Assert upsert produces correct field mapping

  - [x]* 12.6 Write property test for webhook signature rejection
    - **Property 6: Webhook rejects requests with invalid signatures**
    - **Validates: Requirements 8.4, 8.5**
    - Create `src/__tests__/property-clerk-webhook-signature.test.js`
    - Use `fc.record({ body: fc.string(), signature: fc.string() })` for invalid signatures
    - Assert 401 response and no database modification

  - [x]* 12.7 Write property test for webhook no-op on missing profiles
    - **Property 7: Webhook graceful no-op for non-existent profiles**
    - **Validates: Requirements 8.8**
    - Create `src/__tests__/property-clerk-webhook-noop.test.js`
    - Use `fc.string()` for non-existent user IDs
    - Assert 200 response and no database modification

  - [x]* 12.8 Write property test for admin role derivation
    - **Property 8: Admin role derivation from publicMetadata**
    - **Validates: Requirements 13.4, 13.5**
    - Create `src/__tests__/property-clerk-admin-role.test.js`
    - Use `fc.oneof(fc.constant("admin"), fc.constant("client"), fc.constant(undefined), fc.constant(null), fc.constant(""), fc.string())`
    - Assert `isAdmin` is true only when role === "admin"

  - [x]* 12.9 Write property test for Supabase client token inclusion
    - **Property 9: Supabase client token inclusion based on auth state**
    - **Validates: Requirements 14.2, 14.4, 14.5**
    - Create `src/__tests__/property-clerk-supabase-client.test.js`
    - Use `fc.option(fc.string({ minLength: 10 }))` for token presence
    - Assert Bearer header present when token exists, absent when null

  - [x]* 12.10 Write property test for BasicAuthGate passphrase validation
    - **Property 10: BasicAuthGate passphrase validation**
    - **Validates: Requirements 12.1, 12.4, 12.5**
    - Create `src/__tests__/property-clerk-basic-auth-gate.test.jsx`
    - Use `fc.string()` for arbitrary inputs
    - Assert access granted only for exact passphrase match

- [x] 13. Rewrite auth-related unit tests to use Clerk mocks
  - [x] 13.1 Rewrite existing auth test files with Clerk mock patterns
    - Identify all test files in `src/__tests__/` that import or mock the custom `useAuth` hook or `supabase.auth` methods
    - Rewrite them to mock `@clerk/clerk-react` (`useAuth`, `useUser`, `useClerk`, `ClerkProvider`, `SignIn`, `SignUp`)
    - Preserve the same behavioral assertions (route protection, role-based access, sign-in redirect, sign-out behavior)
    - Ensure non-auth test files remain unmodified
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 14. Update steering files to reflect Clerk
  - [x] 14.1 Update architecture-rules.md steering file
    - In the State Management section: replace "Supabase client, `useAuth()` hook" with "Clerk (`useAuth`, `useUser` from `@clerk/clerk-react`), `useSupabaseClient()` hook for authenticated DB access"
    - In the Security Boundaries section: replace "Supabase auth via `AuthGuard`" with "Clerk auth via `AuthGuard`" and "Supabase auth + admin role via `AdminGuard`" with "Clerk auth + admin role via `AdminGuard`"
    - Preserve all non-auth content, formatting, and frontmatter
    - _Requirements: 15.1_

  - [x] 14.2 Update client-portal.md steering file
    - Replace references to Supabase auth with Clerk authentication in route protection descriptions
    - Update the Custom Hooks section: replace `useAuth` with Clerk hooks (`useAuth`, `useUser` from `@clerk/clerk-react`) and add `useSupabaseClient`
    - Update the Backend Services section to reference Clerk as the auth provider
    - Preserve all non-auth content
    - _Requirements: 15.2_

  - [x] 14.3 Update supabase-stripe.md steering file
    - Update the Auth Flow section to describe Clerk as the authentication provider with JWT-based Supabase access
    - Remove references to Supabase Auth OAuth flow
    - Retain all Stripe, Storage, Edge Function, and RLS documentation
    - _Requirements: 15.3_

  - [x] 14.4 Update project-overview.md steering file
    - List Clerk as the authentication provider in the Tech Stack table
    - Update the Platform Architecture description to reference Clerk-gated routes instead of Supabase-gated routes
    - Preserve all non-auth content
    - _Requirements: 15.4_

- [x] 15. Verify Agent Console auth is unchanged
  - [x] 15.1 Verify BasicAuthGate has no Clerk dependencies
    - Confirm `src/components/BasicAuthGate.jsx` does NOT import anything from `@clerk/clerk-react`
    - Confirm it validates passphrase against `VITE_AGENT_PASSPHRASE` with exact string comparison
    - Confirm it persists auth state in `sessionStorage` under `agent_auth` key
    - Confirm it falls back to hardcoded default when env var is unset
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 16. Final checkpoint - Build, lint, and test verification
  - Run `npm run lint` — zero errors
  - Run `npm run test` — all tests pass (zero failures, zero skipped auth tests)
  - Run `npm run build` — successful production build
  - Verify no import references to removed `useAuth` hook or `supabase.auth` methods remain
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The database migration (task 10) is a SQL file creation task — actual execution happens during a maintenance window
- The webhook Edge Function uses Deno runtime (TypeScript) per Supabase Edge Functions convention
- All client-side code uses JavaScript/JSX per project coding standards

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "9.1"] },
    { "id": 2, "tasks": ["3.1", "3.2", "4.1", "4.2"] },
    { "id": 3, "tasks": ["4.3", "5.1", "8.1", "10.1"] },
    { "id": 4, "tasks": ["7.1"] },
    { "id": 5, "tasks": ["7.2", "7.3"] },
    { "id": 6, "tasks": ["13.1", "15.1"] },
    { "id": 7, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.8", "12.10"] },
    { "id": 8, "tasks": ["12.5", "12.6", "12.7", "12.9"] },
    { "id": 9, "tasks": ["14.1", "14.2", "14.3", "14.4"] }
  ]
}
```
