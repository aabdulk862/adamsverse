# Tasks: Design Overhaul

## Task 1: Restructure App into Layout Shell + Pages

- [x] 1.1 Create `src/pages/HomePage.jsx` — extract Banner, ProfileHeader, all Sections, and Contact form from `App.jsx`
- [x] 1.2 Create `src/pages/NotFoundPage.jsx` — 404 message with Link back to `/`
- [x] 1.3 Refactor `App.jsx` into layout shell: Navbar + `<Routes>` + Footer (import HomePage, wire `/` route and `*` catch-all)
- [x] 1.4 Update `src/main.jsx` if needed (BrowserRouter already present — verify)

## Task 2: Create Footer Component

- [x] 2.1 Create `src/components/Footer.jsx` with nav links (Home, Portfolio, About, Services), social icon links, and copyright text
- [x] 2.2 Add Footer CSS to `src/styles.css` — distinct darker background, top border, horizontal social icons row, spacing tokens

## Task 3: Update Navbar — Logo + New Page Links

- [x] 3.1 Replace "AdamsVerse" text brand with `<Link to="/"><img>` using a logo asset, constrained to `--navbar-height`
- [x] 3.2 Add `<Link>` entries for Portfolio (`/portfolio`), About (`/about`), Services (`/services`) to desktop nav and mobile overlay
- [x] 3.3 Convert section anchor links to `/#pricing`, `/#contact` etc. format so they work from any page
- [x] 3.4 Update Navbar CSS if needed for logo image sizing

## Task 4: Create Data Files

- [x] 4.1 Create `src/data/projects.js` — export array of project objects (title, description, tags, link, image)
- [x] 4.2 Create `src/data/services.js` — export array of service objects (title, description, priceRange, deliverables)

## Task 5: Create New Pages (Portfolio, About, Services)

- [x] 5.1 Create `src/pages/PortfolioPage.jsx` — grid of project cards sourced from `projects.js`, external links open in new tab
- [x] 5.2 Create `src/pages/AboutPage.jsx` — bio section with logo/avatar + flags, skills pills, experience timeline
- [x] 5.3 Create `src/pages/ServicesPage.jsx` — service cards from `services.js` with CTA buttons linking to `/#contact`
- [x] 5.4 Wire all new page routes in `App.jsx` (`/portfolio`, `/about`, `/services`)

## Task 6: Add Scroll Animations with framer-motion

- [x] 6.1 Create `src/components/AnimatedSection.jsx` — motion.div wrapper with `whileInView`, `viewport={{ once: true, amount: 0.2 }}`, reduced duration on mobile
- [x] 6.2 Wrap `Section` component content in AnimatedSection for fade-up on scroll
- [x] 6.3 Add staggered fade-in to Card components (accept `index` prop for delay offset)
- [x] 6.4 Add fade-up animation to ProfileHeader on initial load

## Task 7: Enhance ProfileHeader

- [x] 7.1 Add flag images (usa.png, eritrea.png) inline with profile title
- [x] 7.2 Add animated subtitle (typewriter or fade-in-word effect using framer-motion)
- [x] 7.3 Add CTA button ("Let's Work Together") linking to `/#contact`
- [x] 7.4 Style role pills with individual accent colors/gradients

## Task 8: Enhance Cards and Sections CSS

- [x] 8.1 Update Card CSS — glassmorphism background, colored icons by default (not just on hover), hover scale + shadow + border glow
- [x] 8.2 Update Section CSS — alternating background treatments, enhanced section titles (larger, bolder, accent underline), section-level container with rounded corners
- [x] 8.3 Update PricingCard CSS — gradient border or highlighted background to differentiate from standard cards
- [x] 8.4 Add minimum card height for grid row alignment
- [x] 8.5 Ensure consistent 48px+ vertical spacing between sections using `--space-12` token

## Task 9: Enhance Contact Form Styling

- [x] 9.1 Add left-side accent border or icon prefix to input fields
- [x] 9.2 Update submit button with gradient background matching accent palette + hover glow
- [x] 9.3 Update focus ring to use `--accent-primary` with smooth transition
- [x] 9.4 Style form heading with gradient text or accent underline
- [x] 9.5 Style error messages with icon prefix and styled error container

## Task 10: Image Asset Integration and Accessibility

- [x] 10.1 Ensure all `<img>` elements across all components have descriptive `alt` attributes
- [x] 10.2 Verify no unused image imports exist in any component
- [x] 10.3 Add logo image to About page bio section header
