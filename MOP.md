# Adverse LLC — Production Deployment MOP

**Method of Procedure**
**Version:** 1.0
**Date:** April 4, 2026
**Author:** Adam Abdulkadir
**Project:** Adverse LLC Portfolio & Client Portal
**Stack:** React 19 · Vite 7 · Supabase · Stripe · EmailJS · Netlify

---

## Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Supabase Setup](#2-supabase-setup)
3. [Stripe Setup](#3-stripe-setup)
4. [EmailJS Setup](#4-emailjs-setup)
5. [Resend Setup (Email Notifications)](#5-resend-setup)
6. [Google OAuth Setup](#6-google-oauth-setup)
7. [Environment Variables](#7-environment-variables)
8. [Database Migrations](#8-database-migrations)
9. [Supabase Edge Functions Deployment](#9-supabase-edge-functions-deployment)
10. [Netlify Deployment](#10-netlify-deployment)
11. [DNS & Custom Domain](#11-dns--custom-domain)
12. [Post-Deployment Verification](#12-post-deployment-verification)
13. [Rollback Procedure](#13-rollback-procedure)
14. [Monitoring & Maintenance](#14-monitoring--maintenance)

---

## 1. Pre-Deployment Checklist

Run these locally before deploying anything:

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Run all tests
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

Verify:
- [ ] All 54 tests pass
- [ ] Lint produces zero errors
- [ ] Build completes with no chunk size warnings above 250KB
- [ ] Preview at `localhost:4173` loads correctly
- [ ] All pages render (/, /about, /portfolio, /services, /learn, /contact)
- [ ] No console errors in browser DevTools

---

## 2. Supabase Setup

### 2.1 Create Project (if not already done)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing: `trdgjarvlqgcmvxafhrh`
3. Note your project ref from the URL

### 2.2 Collect Credentials

From **Project Settings → API**:

| Key | Where to Find | Env Var |
|-----|--------------|---------|
| Project URL | Settings → API → Project URL | `VITE_SUPABASE_URL`, `SUPABASE_URL` |
| Anon Key | Settings → API → `anon` `public` | `VITE_SUPABASE_ANON_KEY`, `SUPABASE_ANON_KEY` |
| Service Role Key | Settings → API → `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

**WARNING:** The service role key bypasses RLS. Never expose it client-side.

### 2.3 Enable Google Auth Provider

1. Go to **Authentication → Providers → Google**
2. Toggle **Enable**
3. Add your Google OAuth Client ID and Secret (see [Section 6](#6-google-oauth-setup))
4. Set **Redirect URL** to: `https://trdgjarvlqgcmvxafhrh.supabase.co/auth/v1/callback`

---

## 3. Stripe Setup

### 3.1 Create Account

1. Go to [dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Complete business verification (can use test mode until ready)

### 3.2 Collect API Keys

From **Developers → API Keys**:

| Key | Starts With | Env Var |
|-----|------------|---------|
| Publishable Key | `pk_test_` (test) / `pk_live_` (prod) | `VITE_STRIPE_PUBLISHABLE_KEY` |
| Secret Key | `sk_test_` (test) / `sk_live_` (prod) | `STRIPE_SECRET_KEY` |

### 3.3 Create Webhook Endpoint

1. Go to **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://<SUPABASE_PROJECT_REF>.supabase.co/functions/v1/stripe-webhook`
3. Events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

### 3.4 Go Live Checklist

When switching from test to live:
- [ ] Replace `pk_test_` with `pk_live_` in Netlify env vars
- [ ] Replace `sk_test_` with `sk_live_` in Supabase function secrets
- [ ] Create a new live webhook endpoint and update `STRIPE_WEBHOOK_SECRET`
- [ ] Test a real $1 payment and refund it

---

## 4. EmailJS Setup

### 4.1 Create Account

1. Go to [emailjs.com](https://www.emailjs.com/) and sign up

### 4.2 Configure Service

1. **Email Services** → Add New Service → Connect your email (Gmail, Outlook, etc.)
2. Copy the **Service ID** → `VITE_EMAILJS_SERVICE_ID`

### 4.3 Create Template

1. **Email Templates** → Create New Template
2. Use these template variables (must match form field names):
   - `{{name}}` — sender's name
   - `{{email}}` — sender's email
   - `{{Reason}}` — contact reason
   - `{{message}}` — message body
3. Copy the **Template ID** → `VITE_EMAILJS_TEMPLATE_ID`

### 4.4 Get Public Key

1. **Account → API Keys**
2. Copy the **Public Key** → `VITE_EMAILJS_PUBLIC_KEY`

---

## 5. Resend Setup

Used for transactional emails (project updates, invoice notifications, messages).

### 5.1 Create Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your domain (`adverse.dev`) under **Domains**

### 5.2 Get API Key

1. **API Keys → Create API Key**
2. Copy the key (`re_...`) → `RESEND_API_KEY`

### 5.3 Configure Sender

Emails are sent from: `Adverse LLC <notifications@adverse.dev>`
Ensure `adverse.dev` is verified in Resend with proper DNS records (SPF, DKIM, DMARC).

---

## 6. Google OAuth Setup

### 6.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select existing)
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs:
   - `https://trdgjarvlqgcmvxafhrh.supabase.co/auth/v1/callback`
   - `http://localhost:5173` (for local dev)
6. Copy **Client ID** and **Client Secret**

### 6.2 Configure in Supabase

1. Go to **Authentication → Providers → Google**
2. Paste Client ID and Client Secret
3. Save

### 6.3 Configure Consent Screen

1. **APIs & Services → OAuth consent screen**
2. App name: `Adverse LLC`
3. Support email: `adamvmedia@outlook.com`
4. Authorized domains: `adverse.dev`, `supabase.co`
5. Scopes: `email`, `profile`, `openid`
6. Publish the app (move from Testing to Production)

---

## 7. Environment Variables

### 7.1 Local Development (`.env.local`)

```env
# Supabase
VITE_SUPABASE_URL=https://trdgjarvlqgcmvxafhrh.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_<your-key>

# EmailJS
VITE_EMAILJS_SERVICE_ID=<your-service-id>
VITE_EMAILJS_TEMPLATE_ID=<your-template-id>
VITE_EMAILJS_PUBLIC_KEY=<your-public-key>
```

### 7.2 Netlify (Client-Side)

Go to **Site Settings → Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://trdgjarvlqgcmvxafhrh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your anon key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (production) |
| `VITE_EMAILJS_SERVICE_ID` | Your service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | Your template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | Your public key |

### 7.3 Supabase Edge Functions (Server-Side)

```bash
# Set each secret via Supabase CLI
supabase secrets set SUPABASE_URL=https://trdgjarvlqgcmvxafhrh.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
supabase secrets set SUPABASE_ANON_KEY=<your-anon-key>
supabase secrets set STRIPE_SECRET_KEY=sk_live_<your-key>
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_<your-secret>
supabase secrets set RESEND_API_KEY=re_<your-key>
supabase secrets set ALLOWED_ORIGIN=https://adverse.dev
```

Or set them in the Supabase Dashboard under **Edge Functions → Secrets**.

---

## 8. Database Migrations

Run these in order via the **Supabase SQL Editor** (Dashboard → SQL Editor → New Query):

### Step 1: Create Tables

Copy and run the entire contents of `supabase/migrations/001_create_tables.sql`

Verify: 7 tables created (profiles, projects, project_status_history, project_feedback, invoices, messages, notification_preferences)

### Step 2: Enable RLS Policies

Copy and run the entire contents of `supabase/migrations/002_rls_policies.sql`

Verify: RLS enabled on all tables, policies visible under **Authentication → Policies**

### Step 3: Storage Setup

Copy and run the entire contents of `supabase/migrations/003_storage_setup.sql`

Verify: `project-files` bucket visible under **Storage**, policies applied

### Step 4: Set Your Admin Role

After signing in with Google for the first time, promote yourself to admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'adamvmedia@outlook.com';
```

---

## 9. Supabase Edge Functions Deployment

### 9.1 Install Supabase CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref trdgjarvlqgcmvxafhrh
```

### 9.2 Deploy Functions

```bash
supabase functions deploy stripe-webhook
supabase functions deploy admin-mutations
supabase functions deploy create-payment-intent
supabase functions deploy send-notification
```

### 9.3 Verify

```bash
supabase functions list
```

All 4 functions should show status `Active`.

---

## 10. Netlify Deployment

### 10.1 Connect Repository

1. Go to [app.netlify.com](https://app.netlify.com)
2. **Add new site → Import an existing project → GitHub**
3. Select the `adamsverse` repository
4. Branch: `main` (or `feature/saas-platform-upgrade`)
5. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20

### 10.2 Add Environment Variables

Add all variables from [Section 7.2](#72-netlify-client-side) in **Site Settings → Environment Variables**

### 10.3 Deploy

```bash
git push origin main
```

Netlify auto-deploys on push. Or trigger manually: **Deploys → Trigger deploy → Deploy site**

### 10.4 Verify Build

Check the deploy log for:
- [ ] `npm run build` succeeds (lint + vite build)
- [ ] No chunk size warnings
- [ ] Deploy published to CDN

---

## 11. DNS & Custom Domain

### 11.1 Add Domain in Netlify

1. **Domain Settings → Add custom domain**
2. Add `adverse.dev` and `www.adverse.dev`

### 11.2 Configure DNS

At your domain registrar, add:

| Type | Name | Value |
|------|------|-------|
| A | @ | Netlify load balancer IP (shown in dashboard) |
| CNAME | www | `<your-site>.netlify.app` |

### 11.3 Enable HTTPS

Netlify provisions a Let's Encrypt certificate automatically. Verify:
- [ ] HTTPS works on `https://adverse.dev`
- [ ] HTTP redirects to HTTPS
- [ ] HSTS header is present

### 11.4 Update CORS Origin

After domain is live, update the Supabase edge function secret:

```bash
supabase secrets set ALLOWED_ORIGIN=https://adverse.dev
```

### 11.5 Update Supabase Redirect URLs

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to `https://adverse.dev`
3. Add to **Redirect URLs**: `https://adverse.dev/**`

### 11.6 Update Google OAuth

In Google Cloud Console, add `https://adverse.dev` to:
- Authorized JavaScript origins
- Authorized redirect URIs (Supabase callback stays the same)

---

## 12. Post-Deployment Verification

### 12.1 Public Pages

- [ ] Homepage loads at `https://adverse.dev`
- [ ] All nav links work (About, Portfolio, Services, Learn, Contact)
- [ ] Page transitions animate smoothly
- [ ] Mobile hamburger menu works
- [ ] Footer links work
- [ ] Static guides load (`/dsa`, `/leetcode`, `/github`)

### 12.2 Security Headers

Open DevTools → Network → check response headers on any page:

- [ ] `Content-Security-Policy` present
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### 12.3 Authentication

- [ ] "Sign in with Google" redirects to Google consent screen
- [ ] After consent, redirects back and shows user avatar in navbar
- [ ] Sign out works and stays signed out on refresh
- [ ] Protected routes (`/dashboard`) redirect to `/login` when not authenticated

### 12.4 Contact Form

- [ ] Form renders (not "unavailable" message)
- [ ] Submit sends email via EmailJS
- [ ] Success message shows "1–2 business days"
- [ ] Rate limiting kicks in after 3 submissions
- [ ] Required field validation works

### 12.5 Client Portal (requires auth)

- [ ] Dashboard loads
- [ ] Projects list loads
- [ ] Billing page loads
- [ ] Messages page loads
- [ ] Settings page loads
- [ ] File upload works (drag & drop, click to browse)
- [ ] File type validation rejects disallowed types

### 12.6 Stripe Payments (test mode first)

- [ ] Invoice payment flow initiates
- [ ] Stripe Elements form renders
- [ ] Test card `4242 4242 4242 4242` processes successfully
- [ ] Webhook updates invoice status to "Paid"
- [ ] Failed payment shows error message

### 12.7 Admin Panel (requires admin role)

- [ ] `/admin` loads admin dashboard
- [ ] Client list loads
- [ ] Project management works (status updates)
- [ ] Invoice creation and sending works

### 12.8 Performance

Run Lighthouse audit on the homepage:

- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

---

## 13. Rollback Procedure

### 13.1 Netlify Rollback

1. Go to **Deploys** in Netlify dashboard
2. Find the last known good deploy
3. Click **Publish deploy**

This is instant — Netlify serves the previous build from CDN.

### 13.2 Database Rollback

If migrations caused issues:

```sql
-- Drop all tables in reverse order (DESTRUCTIVE — only if no real data)
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS project_feedback CASCADE;
DROP TABLE IF EXISTS project_status_history CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS current_user_role();
```

### 13.3 Edge Function Rollback

Redeploy the previous version:

```bash
git checkout <previous-commit>
supabase functions deploy stripe-webhook
supabase functions deploy admin-mutations
supabase functions deploy create-payment-intent
supabase functions deploy send-notification
```

---

## 14. Monitoring & Maintenance

### 14.1 Error Tracking

The app includes a pluggable error logger (`src/lib/logger.js`). To connect Sentry:

```js
import * as Sentry from '@sentry/react'
import { setTransport } from './lib/logger'

Sentry.init({ dsn: 'your-sentry-dsn' })
setTransport((level, message, context) => {
  Sentry.captureMessage(message, { level, extra: context })
})
```

### 14.2 Supabase Monitoring

- **Dashboard → Logs** — API logs, auth logs, function logs
- **Dashboard → Reports** — Database usage, API usage
- Set up alerts for function errors

### 14.3 Netlify Analytics

- Enable **Netlify Analytics** for server-side page view tracking
- Monitor build times and deploy frequency

### 14.4 Stripe Dashboard

- Monitor payments, disputes, and webhook delivery
- Set up email alerts for failed payments

### 14.5 Routine Maintenance

| Task | Frequency | How |
|------|-----------|-----|
| Check Netlify deploy logs | After each push | Netlify dashboard |
| Review Supabase function logs | Weekly | Supabase dashboard → Logs |
| Check Stripe webhook delivery | Weekly | Stripe dashboard → Webhooks |
| Update npm dependencies | Monthly | `npm outdated` then `npm update` |
| Rotate Supabase service role key | Quarterly | Settings → API → Regenerate |
| Review RLS policies | Quarterly | Authentication → Policies |
| Run Lighthouse audit | Monthly | Chrome DevTools |
| Backup database | Weekly | Supabase dashboard → Database → Backups |

---

## Quick Reference — All Environment Variables

| Variable | Side | Source |
|----------|------|--------|
| `VITE_SUPABASE_URL` | Client | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Client | Supabase → Settings → API |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Client | Stripe → Developers → API Keys |
| `VITE_EMAILJS_SERVICE_ID` | Client | EmailJS → Email Services |
| `VITE_EMAILJS_TEMPLATE_ID` | Client | EmailJS → Email Templates |
| `VITE_EMAILJS_PUBLIC_KEY` | Client | EmailJS → Account → API Keys |
| `SUPABASE_URL` | Server | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Server | Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | Server | Stripe → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Server | Stripe → Developers → Webhooks |
| `RESEND_API_KEY` | Server | Resend → API Keys |
| `ALLOWED_ORIGIN` | Server | Your production domain |
