# Adverse Solutions — Product Roadmap

## Vision

Build a modern utility ecosystem for businesses and developers. Small, sharp tools that solve one annoying thing beautifully — then bundle into Adverse Pro.

**Strategy:** Free utilities → SEO + trust + ecosystem → Pro subscription → Business tier

---

## Monetization Model

| Tier | What's Included | Price |
|------|----------------|-------|
| Free | All utilities, basic usage, no signup | $0 |
| Pro | Unlimited exports, saved history, AI credits, cloud save, premium tools | $9–15/mo |
| Business | Team workflows, automation, white-label, priority support | $29–49/mo |

---

## Current Products (Shipped)

| Product | Status | Category | Purpose |
|---------|--------|----------|---------|
| Website Packages | Live | Revenue | Primary monetization — productized SMB websites |
| PDF Editor | Beta | Utility | Merge, split, annotate — browser-native |
| Basecamp Atlas | Live | Platform | Apartment/retreat discovery |
| CS Reference Guide | Live | Learning | Algorithms, data structures, system design |

---

## Phase 1 — High Priority (Next 3 months)

### 1. AI Website Auditor ⭐ TOP PRIORITY

**Why:** Perfect overlap with existing business. Doubles as lead generation.

**Input:** Business website URL

**Output:**
- Speed/performance score
- SEO gaps and fixes
- Mobile responsiveness issues
- Conversion optimization suggestions
- Accessibility problems
- AI-generated redesign recommendations

**Monetization path:**
- Free: 3 audits/day
- Pro: Unlimited + historical tracking + competitor comparison
- Lead gen: "We can rebuild this" → packages pipeline

**Tech:** Lighthouse API, custom scoring, AI summary generation

**SEO potential:** Very high — "free website audit" is a massive search category

---

### 2. Image Toolkit

**Why:** Absurd search volume. Most competitors are ad-spam with terrible UX.

**Features:**
- Compress (JPEG, PNG, WebP)
- Resize (custom + presets)
- Convert between formats
- Remove background (AI)
- Crop (free + aspect ratio presets)
- Bulk processing

**Key differentiator:** Browser-native processing. No upload to server. Privacy-first.

**Monetization path:**
- Free: Single file processing
- Pro: Bulk, higher quality, background removal AI credits

**Tech:** Canvas API, WebAssembly for compression, ML model for background removal

**SEO potential:** Extremely high — "compress image online", "resize image", "png to webp"

---

### 3. AI PDF Autofill

**Why:** People hate filling repetitive forms. Taxes, insurance, onboarding, applications.

**Input:** Upload PDF form + user profile

**Output:** Auto-filled PDF with mapped fields

**Features:**
- Save reusable profiles (name, address, SSN, business info)
- AI maps form fields to profile data
- Manual override for unmapped fields
- Export filled PDF

**Monetization path:**
- Free: 5 fills/month
- Pro: Unlimited + saved profiles + team profiles + signatures

**Tech:** PDF.js parsing, AI field detection, form mapping

**SEO potential:** High — "fill pdf online", "auto fill pdf form"

---

## Phase 2 — Medium Priority (3–6 months)

### 4. Invoice & Quote Generator

**Why:** SMBs constantly need quick invoices. Most tools are overkill or ugly.

**Features:**
- Branded templates (logo, colors, fonts)
- Line items with tax calculation
- Export as PDF
- Save locally / cloud save (Pro)
- Recurring invoice templates
- Payment link integration (Stripe)

**Monetization path:**
- Free: 3 invoices/month, basic template
- Pro: Unlimited, custom branding, recurring, payment links

**Fit:** Directly serves existing SMB client base

---

### 5. AI Content Repurposer

**Why:** People are tired of paying Jasper/Copy.ai for simple formatting.

**Input:** Blog post, transcript, notes, or URL

**Output:**
- LinkedIn posts (multiple angles)
- Twitter/X threads
- Instagram captions
- Email newsletter draft
- SEO meta descriptions
- Summary/TL;DR

**Monetization path:**
- Free: 3 repurposes/day
- Pro: Unlimited + tone customization + brand voice training

**Tech:** OpenAI API, custom prompts, template system

---

### 6. Social Media Asset Resizer

**Why:** People do this daily. Canva is overkill for quick resizing.

**Features:**
- Resize images/videos to platform presets
- TikTok → IG Reels → YouTube Shorts
- YouTube thumbnail generator
- Carousel/story crops
- Batch processing

**Monetization path:**
- Free: Single file
- Pro: Batch + video + custom presets

**Tech:** Canvas API, FFmpeg.wasm for video

---

## Phase 3 — Expansion (6–12 months)

### 7. AI Review Analyzer

**Why:** Perfect SMB tool. Restaurants, salons, contractors all need this.

**Input:** Google Reviews URL or pasted reviews

**Output:**
- Customer pain points summary
- Sentiment analysis over time
- Operational issues flagged
- Marketing opportunities identified
- Competitor comparison
- Response suggestions

**Monetization path:**
- Free: Single analysis
- Pro: Ongoing monitoring + alerts + competitor tracking

**Lead gen:** Directly feeds into website packages — "Your reviews say X, your website should address it"

---

### 8. Website Screenshot / Mockup Generator

**Why:** Designers, freelancers, agencies need this constantly.

**Input:** URL or uploaded image

**Output:**
- Browser frame mockups
- Device frames (iPhone, MacBook, iPad)
- Portfolio-ready screenshots
- Social media cards (OG image generator)
- Before/after comparisons

**Monetization path:**
- Free: 5 mockups/day, watermark
- Pro: Unlimited, no watermark, custom frames, API access

---

### 9. AI SOP / Document Generator

**Why:** Businesses constantly need process docs. Existing tools are bloated.

**Input:** "Describe your workflow" (natural language)

**Output:**
- Standard Operating Procedure document
- Onboarding checklist
- Process flowchart
- Training document
- Role-specific task list

**Monetization path:**
- Free: 3 docs/month
- Pro: Unlimited + templates + team library + version history

---

### 10. Simple Contract / Proposal Generator

**Why:** Freelancers and SMBs need contracts without legal-tech bloat.

**Features:**
- Freelance contract templates
- Project proposals
- NDAs
- Scope of work documents
- Custom branding
- E-signature (Pro)

**Monetization path:**
- Free: Basic templates, PDF export
- Pro: Custom branding, e-signature, saved templates, client portal

---

## Product Criteria Checklist

Before building any new tool, it must pass:

- [ ] Annoying to pay for elsewhere?
- [ ] Can be built in 1–2 weeks with AI leverage?
- [ ] Works entirely in the browser?
- [ ] Has SEO search volume?
- [ ] Useful weekly or daily?
- [ ] Fits the ecosystem subscription later?
- [ ] Can start completely free?
- [ ] Can be AI-enhanced for Pro tier?
- [ ] Doesn't require complex backend initially?

---

## Bundle Strategy: Adverse Pro

When 5+ tools are live, bundle into subscription:

**Adverse Pro — $12/month**
- Unlimited usage across all tools
- AI credits (shared pool)
- Cloud save & history
- No watermarks
- Priority processing
- Early access to new tools

**Adverse Business — $39/month**
- Everything in Pro
- Team accounts
- White-label exports
- API access
- Custom workflows
- Priority support

---

## Priority Order (Recommended)

1. **AI Website Auditor** — direct business overlap, lead gen, authority
2. **Image Toolkit** — massive SEO, easy to build, daily utility
3. **AI PDF Autofill** — high practical value, unique positioning
4. **Invoice Generator** — serves existing SMB clients
5. **Content Repurposer** — easy AI wrapper, high demand
6. **Social Resizer** — daily utility, complements image toolkit
7. **Review Analyzer** — SMB lead gen, unique angle
8. **Screenshot Generator** — serves dev/design community
9. **SOP Generator** — operational value, B2B potential
10. **Contract Generator** — freelancer/SMB utility

---

## Key Principles

- **Small and sharp** — each tool solves ONE thing well
- **Browser-native** — no installs, no accounts required for basic use
- **Privacy-first** — process locally when possible
- **Beautiful UX** — the differentiator against ugly competitors
- **Free first** — monetize depth, not access
- **Ecosystem thinking** — every tool reinforces the Adverse brand
- **AI-enhanced, not AI-dependent** — tools work without AI, AI makes them better

---

## Architecture Note

Most tools on this roadmap are **separate repos and separate deploys** — NOT part of the main `adamsverse` codebase. They:

- Live in their own repos (e.g., `pdf-editor/`, `image-toolkit/`)
- Deploy independently to Netlify
- Can use any framework (React, Astro, etc.)
- Link back to `adversesolutions.com` for ecosystem cohesion
- Share branding (DM Sans, color tokens, design language) but not code

The main site (`adamsverse`) only contains:
- The marketing homepage and public pages
- The WeBuilder package system
- The client portal / admin panel
- The `/tools` page that links out to deployed tools

See `.kiro/steering/architecture-rules.md` for main site architecture constraints.
