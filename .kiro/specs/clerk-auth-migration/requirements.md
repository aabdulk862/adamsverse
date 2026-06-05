# Requirements Document

## Introduction

This feature replaces the existing Supabase-based authentication system in the Adamsverse React/Vite application with Clerk. The current system uses Supabase Auth for Google OAuth, email/password sign-in and sign-up, role-based access control (admin vs client), session management with inactivity timeout, and profile upsert. The migration to Clerk consolidates authentication into a managed service with pre-built UI components, webhook-driven profile sync, and simplified session handling while preserving the existing route protection model (public, authenticated, and admin routes) and the separate passphrase-gated Agent Console.

## Glossary

- **Clerk_Provider**: The `<ClerkProvider>` React context component that wraps the application and supplies authentication state to all child components.
- **Auth_Guard**: A route-level component that redirects unauthenticated users to the sign-in page.
- **Admin_Guard**: A route-level component that restricts access to users with the "admin" role in Clerk metadata.
- **Sign_In_Page**: The page where users authenticate via Clerk's sign-in flow (Google OAuth or email/password).
- **Sign_Up_Page**: The page where new users create an account via Clerk's sign-up flow.
- **User_Profile**: The combination of Clerk user data and any application-specific metadata stored in Clerk's public or private metadata fields.
- **Session**: A Clerk-managed authentication session that persists across page reloads and provides JWT tokens for API calls.
- **Webhook_Handler**: A Supabase Edge Function that receives Clerk webhook events and synchronizes user data with the application's Supabase database.
- **Basic_Auth_Gate**: The existing passphrase-based gate for the Agent Console that remains unchanged by this migration.
- **CSP_Policy**: The Content-Security-Policy header configured in netlify.toml that controls which external domains the application can load resources from.
- **Clerk_JWT_Template**: A Clerk dashboard configuration that defines the claims and structure of JWTs issued for third-party service integration (e.g., Supabase).
- **Steering_Files**: The project documentation files in `.kiro/steering/` that provide architectural guidance, rules, and context for development workflows.

## Requirements

### Requirement 1: Clerk Provider Integration

**User Story:** As a developer, I want the application wrapped in ClerkProvider, so that all components have access to Clerk authentication state.

#### Acceptance Criteria

1. THE Clerk_Provider SHALL wrap the entire React application tree as a parent of the BrowserRouter in the application entry point.
2. THE Clerk_Provider SHALL receive the publishable key from the `VITE_CLERK_PUBLISHABLE_KEY` environment variable via its `publishableKey` prop.
3. IF the `VITE_CLERK_PUBLISHABLE_KEY` environment variable is missing or empty, THEN THE application SHALL render a full-page error message indicating the missing configuration instead of rendering the application routes or crashing.
4. IF the `VITE_CLERK_PUBLISHABLE_KEY` environment variable is missing or empty, THEN THE application SHALL not render ClerkProvider or any child route components.

### Requirement 2: Sign-In Flow

**User Story:** As a user, I want to sign in with Google or email/password through Clerk, so that I can access my dashboard and projects.

#### Acceptance Criteria

1. WHEN a user navigates to the sign-in page, THE Sign_In_Page SHALL render the Clerk SignIn component.
2. THE Sign_In_Page SHALL display a Google OAuth sign-in button as a visible, interactive control.
3. THE Sign_In_Page SHALL display an email field and a password field (minimum 6 characters) as a sign-in method.
4. WHEN sign-in succeeds, THE Sign_In_Page SHALL redirect the user to `/dashboard`.
5. IF a `selectedTier` value exists in sessionStorage at the time of successful sign-in, THEN THE Sign_In_Page SHALL redirect to `/dashboard/intake/{tierId}` using that value and remove the `selectedTier` entry from sessionStorage.
6. IF sign-in fails, THEN THE Sign_In_Page SHALL display the error message returned by Clerk in a visible alert element.
7. IF the user is already authenticated when navigating to the sign-in page, THEN THE Sign_In_Page SHALL redirect the user to `/dashboard` without displaying the sign-in form.
8. WHILE the authentication state is loading, THE Sign_In_Page SHALL display a loading indicator and SHALL NOT render the sign-in form.

### Requirement 3: Sign-Up Flow

**User Story:** As a new user, I want to create an account through Clerk, so that I can onboard as a client.

#### Acceptance Criteria

1. WHEN a user navigates to the sign-up page, THE Sign_Up_Page SHALL render the Clerk SignUp component.
2. THE Sign_Up_Page SHALL display a Google OAuth button that initiates account creation via Google when activated.
3. THE Sign_Up_Page SHALL display an email and password form requiring a minimum password length of 8 characters.
4. WHEN sign-up succeeds, THE Sign_Up_Page SHALL redirect the user to the dashboard within 3 seconds.
5. IF sign-up fails due to invalid input or a server error, THEN THE Sign_Up_Page SHALL display an error message indicating the reason for failure without clearing the entered form data.

### Requirement 4: Route Protection for Authenticated Users

**User Story:** As a product owner, I want dashboard routes protected so that only authenticated users can access them.

#### Acceptance Criteria

1. WHILE a user session is null and authentication state is not loading, THE Auth_Guard SHALL redirect the user to the `/login` route using a client-side navigation replace (no new browser history entry).
2. WHILE the authentication state is loading, THE Auth_Guard SHALL display a visible loading indicator with an accessible `role="status"` attribute and SHALL NOT render the child route content or redirect.
3. WHEN an authenticated user with a valid session accesses a protected route, THE Auth_Guard SHALL render the child route content immediately without displaying the loading indicator.
4. IF the authentication state check results in an error, THEN THE Auth_Guard SHALL treat the user as unauthenticated and redirect to the `/login` route.

### Requirement 5: Admin Route Protection

**User Story:** As a product owner, I want admin routes restricted to admin users, so that sensitive management pages are not accessible to regular clients.

#### Acceptance Criteria

1. WHILE a user is not authenticated, THE Admin_Guard SHALL redirect the user to the sign-in page.
2. WHILE a user is authenticated but does not have the "admin" role in Clerk public metadata, THE Admin_Guard SHALL redirect the user to the dashboard.
3. WHEN a user with the "admin" role accesses an admin route, THE Admin_Guard SHALL render the child route content.

### Requirement 6: Sign-Out

**User Story:** As a user, I want to sign out of my account, so that my session is terminated.

#### Acceptance Criteria

1. WHEN the user triggers sign-out, THE application SHALL call the Clerk signOut method.
2. WHEN sign-out completes successfully, THE application SHALL redirect the user to the home page at the root path ("/").
3. WHEN sign-out completes successfully, THE application SHALL clear all application-specific keys stored in sessionStorage that were created during the authenticated session.
4. IF the Clerk signOut call fails, THEN THE application SHALL display an error message indicating that sign-out was unsuccessful and SHALL retain the user on the current page without clearing session data.
5. WHILE the sign-out operation is in progress, THE application SHALL disable the sign-out control to prevent duplicate invocations.

### Requirement 7: Session Management

**User Story:** As a user, I want my session to persist across page reloads without re-authenticating, so that my workflow is uninterrupted.

#### Acceptance Criteria

1. WHEN a user reloads any application page while authenticated, THE Session SHALL remain active and THE application SHALL render the authenticated view without displaying a sign-in prompt or redirect.
2. WHEN the session token expires, THE Clerk_Provider SHALL automatically refresh the token without user interaction and without interrupting in-progress page rendering.
3. IF the session token refresh fails due to network error or session revocation, THEN THE application SHALL redirect the user to the sign-in page and display an error message indicating the session could not be renewed.
4. THE application SHALL remove the custom 30-minute inactivity timeout logic, including the `INACTIVITY_TIMEOUT_MS` constant, the inactivity event listeners, and the associated timer, since Clerk manages session lifecycle.

### Requirement 8: Webhook-Based Profile Synchronization

**User Story:** As a developer, I want Clerk user events to sync profile data to Supabase, so that existing database queries against the profiles table continue to work.

#### Acceptance Criteria

1. WHEN a `user.created` webhook event is received, THE Webhook_Handler SHALL insert a row into the Supabase `profiles` table with the user's `id`, `email`, `display_name`, and `avatar_url` fields, and return a 200 status within 5 seconds.
2. WHEN a `user.updated` webhook event is received, THE Webhook_Handler SHALL update the `email`, `display_name`, and `avatar_url` fields on the corresponding row in the Supabase `profiles` table identified by user `id`, and return a 200 status.
3. WHEN a `user.deleted` webhook event is received, THE Webhook_Handler SHALL delete the corresponding row from the Supabase `profiles` table identified by user `id`, and return a 200 status.
4. THE Webhook_Handler SHALL verify the Clerk webhook signature using the `CLERK_WEBHOOK_SECRET` environment variable stored in Supabase secrets before processing any event.
5. IF the webhook signature verification fails, THEN THE Webhook_Handler SHALL return a 401 status and discard the event without modifying the `profiles` table.
6. IF the `user.created` event references a user `id` that already exists in the `profiles` table, THEN THE Webhook_Handler SHALL update the existing row with the event payload fields rather than returning an error.
7. IF a Supabase write operation fails during event processing, THEN THE Webhook_Handler SHALL return a 500 status and not acknowledge the event as processed.
8. IF a `user.updated` or `user.deleted` event references a user `id` with no corresponding row in the `profiles` table, THEN THE Webhook_Handler SHALL return a 200 status and take no further action.
9. THE Webhook_Handler SHALL be deployed as a Supabase Edge Function alongside the existing `stripe-webhook`, `admin-mutations`, `create-payment-intent`, and `send-notification` functions, using the same Deno runtime and secrets management approach.

### Requirement 9: Supabase Auth Removal

**User Story:** As a developer, I want all Supabase Auth code removed, so that the codebase has a single authentication provider and no dead code.

#### Acceptance Criteria

1. THE application SHALL remove the `useAuth` hook file (`src/hooks/useAuth.js`) including the singleton auth store, the `onAuthStateChange` listener, the inactivity timeout logic, and the `SIGNED_OUT_KEY` localStorage mechanism.
2. THE application SHALL remove all `supabase.auth` method calls (`signInWithOAuth`, `signInWithPassword`, `signUp`, `signOut`, `getSession`, and `getUser`) from every file in the codebase.
3. THE application SHALL remove the auth-specific fallback logic from the Supabase client module (`src/lib/supabase.js`), including the `SIGNED_OUT_KEY` localStorage cleanup and the `auth` property no-op proxy, while retaining the client initialization for database, storage, and realtime operations.
4. THE application SHALL retain the Supabase client for database queries (e.g., `supabase.from()`), storage operations (e.g., `supabase.storage`), edge function invocations (e.g., `supabase.functions.invoke()`), and realtime subscriptions (e.g., `supabase.channel()`).
5. THE application SHALL retain the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables for database and storage access, and SHALL remove any environment validation logic that treats these variables as required solely for authentication.
6. WHEN the Supabase auth removal is complete, THE application SHALL compile without errors and produce a working build with zero import references to the removed `useAuth` hook or `supabase.auth` methods.
7. THE application SHALL remove any Supabase auth session tokens (localStorage keys prefixed with `sb-`) during the migration, and SHALL not write or read these keys after migration is complete.

### Requirement 10: Environment Variable Configuration

**User Story:** As a developer, I want clear environment variable documentation, so that local development and Netlify deployment are configured correctly.

#### Acceptance Criteria

1. THE application SHALL require `VITE_CLERK_PUBLISHABLE_KEY` as a client-side environment variable, referenced at build time via Vite's `import.meta.env`.
2. IF the `CLERK_WEBHOOK_SECRET` environment variable is missing when the Webhook_Handler receives a request, THEN THE Webhook_Handler SHALL return a 500 status and not process the event.
3. THE `.env.example` file SHALL include `VITE_CLERK_PUBLISHABLE_KEY` in the client-side section and `CLERK_WEBHOOK_SECRET` in the server-side section, each with a descriptive placeholder value indicating the expected key format (e.g., `pk_test_your-clerk-publishable-key`, `whsec_your-clerk-webhook-secret`).
4. THE `netlify.toml` SHALL include `VITE_CLERK_PUBLISHABLE_KEY` in the `SECRETS_SCAN_OMIT_KEYS` list within the `[build.environment]` configuration.

### Requirement 11: Content Security Policy Update

**User Story:** As a developer, I want the CSP headers updated to allow Clerk's domains, so that authentication UI and API calls are not blocked.

#### Acceptance Criteria

1. THE CSP_Policy for the global `/*` header block SHALL include `https://*.clerk.accounts.dev` and `https://clerk.adamsverse.com` in the `script-src` directive while preserving all existing allowed sources.
2. THE CSP_Policy for the global `/*` header block SHALL include `https://*.clerk.accounts.dev` and `https://clerk.adamsverse.com` in the `connect-src` directive while preserving all existing allowed sources.
3. THE CSP_Policy for the global `/*` header block SHALL include `https://*.clerk.accounts.dev` in the `frame-src` directive while preserving all existing allowed sources.
4. THE CSP_Policy for the global `/*` header block SHALL include `https://img.clerk.com` in the `img-src` directive while preserving all existing allowed sources.
5. THE CSP_Policy for the global `/*` header block SHALL include `https://*.clerk.accounts.dev` in the `style-src` directive while preserving all existing allowed sources.

### Requirement 12: Agent Console Auth Preservation

**User Story:** As a developer, I want the Agent Console passphrase gate unchanged, so that the migration does not affect the separate agent authentication flow.

#### Acceptance Criteria

1. THE Basic_Auth_Gate SHALL validate the user-entered passphrase against the `VITE_AGENT_PASSPHRASE` environment variable using exact string comparison.
2. THE Basic_Auth_Gate SHALL not import, reference, or depend on any Clerk hooks, context, or authentication state.
3. IF the correct passphrase is provided, THEN THE Agent Console routes SHALL be accessible without a Clerk session or authenticated user.
4. THE Basic_Auth_Gate SHALL persist the authenticated state in sessionStorage under the `agent_auth` key for the duration of the browser session.
5. IF the `VITE_AGENT_PASSPHRASE` environment variable is not set, THEN THE Basic_Auth_Gate SHALL fall back to a hardcoded default passphrase for validation.

### Requirement 13: Clerk React Hook Replacement

**User Story:** As a developer, I want a consistent hook API for accessing auth state, so that components can migrate from `useAuth()` to Clerk hooks with minimal refactoring.

#### Acceptance Criteria

1. THE application SHALL use Clerk's `useUser` hook to access user profile data including `user.fullName`, `user.primaryEmailAddress.emailAddress`, and `user.imageUrl`.
2. THE application SHALL use Clerk's `useAuth` hook to access authentication state, where `isLoaded` replaces the previous `loading` flag (with inverted semantics: `isLoaded === true` means loading is complete) and `isSignedIn` replaces the previous session-null check.
3. THE application SHALL use Clerk's `useClerk` hook to invoke `clerk.redirectToSignIn()` and `clerk.redirectToSignOut()` for navigation-based authentication flows, while using `signOut` from Clerk's `useAuth` hook for in-place sign-out without redirect.
4. WHEN a component previously accessed `profile.role`, THE component SHALL read the role from `user.publicMetadata.role` instead.
5. WHEN a component previously derived `isAdmin` from `profile.role === "admin"`, THE component SHALL derive `isAdmin` from `user.publicMetadata.role === "admin"` using the `user` object returned by Clerk's `useUser` hook.
6. WHEN a component previously consumed the `error` or `clearError` properties from the custom `useAuth` hook, THE component SHALL handle errors through Clerk's built-in error rendering in SignIn/SignUp components or through try-catch blocks around Clerk method calls, since Clerk hooks do not expose a shared reactive error state.

### Requirement 14: Supabase RLS JWT Integration

**User Story:** As a developer, I want authenticated Supabase queries to continue working with Row Level Security after migrating to Clerk, so that clients can only access their own data without changes to existing RLS policies.

#### Acceptance Criteria

1. THE application SHALL configure a Clerk JWT template named `supabase` that issues tokens containing the `sub` claim set to the Clerk user ID, compatible with Supabase's `auth.uid()` function.
2. WHEN an authenticated user performs a Supabase query from the client, THE application SHALL initialize the Supabase client with the Clerk session token (obtained via `getToken({ template: "supabase" })`) passed as the `global.headers.Authorization` bearer token.
3. THE application SHALL provide a helper function or hook that returns a Supabase client instance configured with the current Clerk session token for use in authenticated database queries.
4. WHILE a user is authenticated, THE Supabase client used for database queries SHALL include the Clerk-issued JWT so that RLS policies referencing `auth.uid()` resolve to the authenticated user's ID.
5. IF the Clerk session token is unavailable or expired when a Supabase query is attempted, THEN THE application SHALL use the anonymous Supabase client (anon key only) and the query SHALL be subject to unauthenticated RLS policies.
6. THE existing RLS policies on all tables (profiles, projects, project_status_history, project_feedback, invoices, messages, notification_preferences) SHALL continue to function without modification by using the `sub` claim from the Clerk-issued JWT as the user identifier.

### Requirement 15: Steering File Updates

**User Story:** As a developer, I want project steering files to reflect Clerk as the auth provider, so that future development guidance is accurate and consistent with the migrated architecture.

#### Acceptance Criteria

1. WHEN the migration is complete, THE `architecture-rules.md` steering file SHALL reference Clerk instead of Supabase Auth in the State Management section, the Security Boundaries section, and any auth-related descriptions.
2. WHEN the migration is complete, THE `client-portal.md` steering file SHALL reference Clerk authentication instead of Supabase auth in the route protection descriptions, the Custom Hooks section (replacing `useAuth` with Clerk hooks), and the Backend Services section.
3. WHEN the migration is complete, THE `supabase-stripe.md` steering file SHALL update the Auth Flow section to describe Clerk as the authentication provider with JWT-based Supabase access, remove references to Supabase Auth OAuth flow, and retain all Stripe, Storage, Edge Function, and RLS documentation.
4. WHEN the migration is complete, THE `project-overview.md` steering file SHALL list Clerk as the authentication provider in the Tech Stack table and update the Platform Architecture description to reference Clerk-gated routes instead of Supabase-gated routes.
5. THE steering file updates SHALL preserve all non-auth content, formatting, frontmatter, and file structure in each modified file.

### Requirement 16: Test Migration for Auth-Related Tests

**User Story:** As a developer, I want auth-related tests rewritten to use Clerk mocks, so that the test suite passes after migration without leaving dead Supabase Auth test code.

#### Acceptance Criteria

1. THE application SHALL rewrite all test files in `src/__tests__/` that import or mock the custom `useAuth` hook or `supabase.auth` methods to use Clerk hook mocks (`@clerk/clerk-react` mocks for `useUser`, `useAuth`, and `useClerk`).
2. WHILE the migration is in progress, THE rewritten auth test files SHALL verify the same behavioral assertions (route protection, role-based access, sign-in redirect, sign-out behavior) using Clerk's hook API instead of the removed Supabase Auth API.
3. THE application SHALL ensure all non-auth test files in `src/__tests__/` continue to pass without any modification, in compliance with architecture rule #6.
4. WHEN the auth test rewrite is complete, THE full test suite (`npm run test`) SHALL pass with zero failures and zero skipped auth-related tests.
5. IF a test file tests both auth and non-auth behavior, THEN THE auth-related assertions SHALL be rewritten to use Clerk mocks while the non-auth assertions SHALL remain unchanged.

### Requirement 17: Supabase Profiles Table User ID Alignment

**User Story:** As a developer, I want the profiles table `id` column to store Clerk user IDs, so that RLS policies and foreign key relationships work correctly with the new auth provider.

#### Acceptance Criteria

1. THE Webhook_Handler SHALL write the Clerk user ID (from the webhook event `data.id` field) as the `id` value in the Supabase `profiles` table.
2. THE Clerk JWT template `sub` claim SHALL match the Clerk user ID stored in the `profiles.id` column, ensuring `auth.uid()` in RLS policies resolves to the correct profile row.
3. WHEN migrating existing users, THE migration process SHALL update the `profiles.id` column from the Supabase Auth UUID to the corresponding Clerk user ID for each migrated user.
4. IF a table has a foreign key referencing `profiles.id`, THEN THE migration process SHALL update the foreign key values to use the Clerk user ID, maintaining referential integrity across all related tables (projects, invoices, messages, notification_preferences).
