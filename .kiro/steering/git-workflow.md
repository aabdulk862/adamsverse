---
inclusion: manual
---

# Adverse LLC — Git & Workflow

## Branch Strategy

- `main` — Production branch, auto-deploys to Netlify
- Feature branches: `feature/{description}` or `fix/{description}`
- Always push to a new branch, never directly to main

## Commit Messages

Use conventional format:
```
feat: add new restaurant package
fix: resolve theme toggle flicker on mobile
refactor: extract section animation into shared hook
test: add property tests for content layer editing
docs: update WeBuilder guide with contact section
chore: update dependencies
```

## Pre-Commit Checklist

```bash
npm run lint    # Zero errors
npm run test    # All 60+ tests pass
npm run build   # Clean build
```

## PR Guidelines

- Keep PRs focused on a single feature or fix
- Title under 70 characters
- Description: what changed, why, what was tested
- Reference spec task if applicable (e.g., "Implements task 4.2 from adverse-webuilder spec")

## What NOT to Commit

- `.env.local` or any file with real secrets
- `node_modules/`
- `dist/` (built by Netlify)
- Large binary files (use Supabase Storage instead)

## Sensitive Files

These files contain or reference secrets — never echo values in commits or logs:
- `.env.local`
- Supabase service role key
- Stripe secret key / webhook secret
- Resend API key
