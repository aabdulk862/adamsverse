---
inclusion: fileMatch
fileMatchPattern: "**/supabase*,**/stripe*,**/Billing*,**/Invoice*,**/payment*,**/auth*,**/Auth*"
---

# Adverse LLC — Supabase & Stripe Integration

## Supabase

### Client Setup

```javascript
// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Auth Flow

1. Authentication managed by Clerk (`@clerk/clerk-react`)
2. Clerk issues JWTs with a `sub` claim set to the Clerk user ID
3. Authenticated Supabase queries use the Clerk session token as a Bearer header via the `useSupabaseClient()` hook
4. Supabase `auth.uid()` resolves to the Clerk user ID from the JWT `sub` claim, so existing RLS policies work without modification
5. Profile rows created/updated via Clerk webhooks (`user.created`, `user.updated`) handled by the `clerk-webhook` Edge Function
6. Admin role set in Clerk `publicMetadata.role` and read via `useUser().user.publicMetadata.role`

### Storage

- Bucket: `project-files` (client uploads)
- Bucket path for WeBuilder: `client-assets/{slug}/`
- Max file size: 5 MB
- Allowed MIME types: image/jpeg, image/png, image/webp, image/svg+xml
- Unique filenames via UUID prefix

### Edge Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| clerk-webhook | Sync Clerk user events to profiles table | Clerk webhook POST (Svix) |
| stripe-webhook | Handle Stripe payment events | Stripe webhook POST |
| admin-mutations | Admin-only data operations | Client request |
| create-payment-intent | Initialize Stripe payment | Client request |
| send-notification | Send email via Resend | Internal trigger |

### RLS (Row Level Security)

All tables have RLS enabled. Key policies:
- Clients see only their own data
- Admins see all data
- Service role key bypasses RLS (edge functions only)

## Stripe

### Client-Side

```javascript
import { loadStripe } from "@stripe/stripe-js";
const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
```

Uses `@stripe/react-stripe-js` for Elements (payment form UI).

### Payment Flow

1. Client clicks "Pay Invoice" → frontend calls `create-payment-intent` edge function
2. Edge function creates PaymentIntent with Stripe secret key → returns client_secret
3. Frontend confirms payment via Stripe Elements
4. Stripe sends webhook to `stripe-webhook` edge function
5. Edge function verifies signature, updates invoice status in Supabase

### Webhook Events

- `payment_intent.succeeded` → Mark invoice as "Paid"
- `payment_intent.payment_failed` → Log failure, notify admin

### Going Live

- Replace `pk_test_` → `pk_live_` in Netlify env vars
- Replace `sk_test_` → `sk_live_` in Supabase secrets
- Create new live webhook endpoint, update `STRIPE_WEBHOOK_SECRET`
- Test with real $1 payment, then refund

## Security Rules

- NEVER expose `SUPABASE_SERVICE_ROLE_KEY` client-side
- NEVER expose `STRIPE_SECRET_KEY` client-side
- Always verify Stripe webhook signatures before processing
- Always use RLS — never disable it for convenience
- Rate limit client-side operations (src/lib/rateLimiter.js)
