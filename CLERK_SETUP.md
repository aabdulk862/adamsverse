# Clerk Auth Setup Guide

## Prerequisites

- Node.js 20+
- A [Clerk](https://clerk.com) account (free tier works for development)
- Your existing Supabase project credentials

---

## 1. Create a Clerk Application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and sign in
2. Click **Create application**
3. Name it `Adverse` (or whatever you prefer)
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
| **Frontend API URL** | Supabase TPA config (e.g., `https://adverse-something.clerk.accounts.dev`) |

You do NOT need the secret key for the frontend.

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

Use `pk_test_` locally, `pk_live_` in production (Netlify).

---

## 4. Connect Supabase to Clerk (Third-Party Auth)

No JWT template needed — Clerk's native TPA integration lets Supabase accept Clerk session tokens directly.

1. In Supabase dashboard → **Authentication** → **Sign In / Up**
2. Scroll to **Third-party Auth Providers**
3. Click **Add provider** → select **Custom**
4. Fill in:
   - **JWKS URL:** `https://YOUR-CLERK-FRONTEND-API/.well-known/jwks.json`
   - **Issuer:** `https://YOUR-CLERK-FRONTEND-API` (same URL without the path)
5. Save

Find your Frontend API URL in Clerk dashboard → **API Keys** (it looks like `https://adverse-something.clerk.accounts.dev`).

Now `auth.uid()` in Supabase RLS policies resolves to the Clerk user ID automatically.

---

## 5. Set Up Webhooks (Profile Sync)

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

## 6. Set Admin Role

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

## 7. Run the Database Migration

The `profiles.id` column needs to change from UUID to text (Clerk IDs are `user_*` strings).

**During a maintenance window**, run:

```bash
supabase db push
# or manually execute:
# supabase/migrations/004_clerk_migration.sql
```

This drops the FK to `auth.users`, converts `profiles.id` to text, and re-adds FK constraints on dependent tables.

---

## 8. Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`. You should see the app load. Navigate to `/login` to test the Clerk sign-in flow.

---

## 9. Deploy to Netlify

Add these environment variables in Netlify → **Site settings** → **Environment variables**:

| Variable | Value |
|----------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Your production key (`pk_live_...`) |

The CSP headers in `netlify.toml` already allow Clerk domains.

---

## Production Checklist

- [ ] Switch from `pk_test_` to `pk_live_` publishable key in Netlify env vars
- [ ] Create a production Clerk application (or switch to production mode)
- [ ] Update webhook endpoint URL to production Supabase function URL
- [ ] Update `CLERK_WEBHOOK_SECRET` in Supabase secrets with the production signing secret
- [ ] Run `004_clerk_migration.sql` on production database
- [ ] Migrate existing users (map Supabase Auth UUIDs → Clerk user IDs)
- [ ] Verify RLS policies work with Clerk session tokens
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
- `useSupabaseClient()` — Returns a Supabase client with Clerk session token for RLS queries

**Key files:**
- `src/main.jsx` — ClerkProvider wraps the app
- `src/hooks/useSupabaseClient.js` — Authenticated Supabase client (uses `getToken()` with TPA, no template needed)
- `src/components/AuthGuard.jsx` — Route protection
- `src/components/AdminGuard.jsx` — Admin route protection
- `src/pages/SignInPage.jsx` — Clerk sign-in UI
- `src/pages/SignUpPage.jsx` — Clerk sign-up UI
- `supabase/functions/clerk-webhook/index.ts` — Profile sync webhook

---

## Payment Gateway Note

Skip Clerk's built-in payment gateway. You already have Stripe integrated with your own `create-payment-intent` Edge Function and `stripe-webhook` handler. Clerk's gateway is for apps without their own Stripe setup.
