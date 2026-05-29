# Clerk Auth Setup Guide

## Prerequisites

- Node.js 20+
- A [Clerk](https://clerk.com) account (free tier works for development)
- Your existing Supabase project credentials

---

## 1. Create a Clerk Application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and sign in
2. Click **Create application**
3. Name it `Adamsverse` (or whatever you prefer)
4. Under **Sign-in options**, enable:
   - **Email address** (password-based)
   - **Google** (OAuth)
5. Click **Create application**

---

## 2. Get Your Keys

From the Clerk dashboard sidebar → **API Keys**:

| Key | Where to use |
|-----|-------------|
| **Publishable key** (`pk_test_...`) | `.env.local` as `VITE_CLERK_PUBLISHABLE_KEY` |
| **Secret key** (`sk_test_...`) | Not needed client-side — only for backend API calls |

---

## 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the Clerk key:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-key-here
```

---

## 4. Set Up the Supabase JWT Template

This lets Clerk issue tokens that Supabase accepts for Row Level Security.

1. In Clerk dashboard → **JWT Templates** → **Create template**
2. Choose **Supabase** from the list
3. Configure:
   - **Name:** `supabase`
   - **Signing algorithm:** RS256
   - **Claims:** The template auto-fills `sub` (user ID), `iss`, `iat`, `exp`
4. Copy the **JWKS endpoint URL** (you'll need it for Supabase)
5. Save the template

---

## 5. Configure Supabase to Accept Clerk JWTs

1. In your Supabase dashboard → **Authentication** → **Providers** → **Third-party Auth**
2. Enable third-party auth
3. Add Clerk as a provider:
   - **JWKS URL:** Paste the endpoint from step 4
   - **Issuer:** Your Clerk frontend API URL (e.g., `https://your-app.clerk.accounts.dev`)
4. Save

Now `auth.uid()` in RLS policies resolves to the Clerk user ID.

---

## 6. Set Up Webhooks (Profile Sync)

This keeps the `profiles` table in sync when users sign up or update their info.

1. In Clerk dashboard → **Webhooks** → **Add endpoint**
2. **Endpoint URL:** `https://your-project.supabase.co/functions/v1/clerk-webhook`
3. **Events to listen for:**
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. After creating, copy the **Signing secret** (`whsec_...`)
5. Add it to your Supabase Edge Function secrets:

```bash
supabase secrets set CLERK_WEBHOOK_SECRET=whsec_your-signing-secret
```

---

## 7. Set Admin Role

To make yourself an admin:

1. In Clerk dashboard → **Users** → click your user
2. Scroll to **Public metadata**
3. Set:

```json
{
  "role": "admin"
}
```

4. Save — AdminGuard will now grant you access to `/admin/*` routes

---

## 8. Run the Database Migration

The `profiles.id` column needs to change from UUID to text (Clerk IDs are `user_*` strings).

**During a maintenance window**, run:

```bash
supabase db push
# or manually execute:
# supabase/migrations/004_clerk_migration.sql
```

This drops the FK to `auth.users`, converts `profiles.id` to text, and re-adds FK constraints on dependent tables.

---

## 9. Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`. You should see the app load. Navigate to `/login` to test the Clerk sign-in flow.

---

## 10. Deploy to Netlify

Add these environment variables in Netlify → **Site settings** → **Environment variables**:

| Variable | Value |
|----------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Your publishable key (`pk_live_...` for production) |

The CSP headers in `netlify.toml` already allow Clerk domains.

---

## Production Checklist

- [ ] Switch from `pk_test_` to `pk_live_` publishable key
- [ ] Create a production Clerk application (or switch to production mode)
- [ ] Update webhook endpoint URL to production Supabase function URL
- [ ] Update `CLERK_WEBHOOK_SECRET` in Supabase secrets with the production signing secret
- [ ] Run `004_clerk_migration.sql` on production database
- [ ] Migrate existing users (map Supabase Auth UUIDs → Clerk user IDs)
- [ ] Verify RLS policies work with Clerk JWTs
- [ ] Test sign-in, sign-up, sign-out, and admin access end-to-end

---

## Architecture Quick Reference

```
ClerkProvider (publishableKey)
  └── BrowserRouter
        └── App
              ├── Public routes (no auth)
              ├── AuthGuard → Dashboard routes (useAuth: isSignedIn)
              ├── AdminGuard → Admin routes (useUser: publicMetadata.role)
              └── BasicAuthGate → Agent routes (passphrase, unchanged)
```

**Key hooks:**
- `useAuth()` — `isLoaded`, `isSignedIn`, `getToken()`
- `useUser()` — `user.fullName`, `user.imageUrl`, `user.publicMetadata.role`
- `useSupabaseClient()` — Returns a Supabase client with Clerk JWT for RLS queries

**Key files:**
- `src/main.jsx` — ClerkProvider wraps the app
- `src/hooks/useSupabaseClient.js` — Authenticated Supabase client
- `src/components/AuthGuard.jsx` — Route protection
- `src/components/AdminGuard.jsx` — Admin route protection
- `src/pages/SignInPage.jsx` — Clerk sign-in UI
- `src/pages/SignUpPage.jsx` — Clerk sign-up UI
- `supabase/functions/clerk-webhook/index.ts` — Profile sync webhook
