# Requirements Document

## Introduction

Transform the Adverse Solutions site (adversesolutions.com) from a single-service web development agency into a multi-product platform hub. The homepage becomes a curated product discovery page linking to four core products: CS Reference Guide, PDF Editor, Basecamp Atlas (apartment/retreat finder), and the Website Packages system. The entire site receives a visual design revamp to establish a consistent, modern design system across all pages and products. The page is SEO-optimized with structured data and lays the groundwork for a shared subscription model across all products.

## Glossary

- **Product_Hub**: The redesigned homepage that acts as a central link tree displaying all Adverse products in a clean, consistent card layout
- **Product_Card**: A UI component representing a single product within the Product_Hub, containing a title, description, icon, category tag, and destination link
- **Product_Registry**: A data module that defines all available products, their metadata (name, description, category, URL, icon, status), used to render the Product_Hub dynamically
- **Design_System**: A unified set of design tokens (colors, typography, spacing, shadows, radii) applied consistently across the entire site — homepage, sub-pages, and product landing pages
- **SEO_Engine**: The collection of meta tags, structured data (JSON-LD), Open Graph tags, sitemap entries, and semantic HTML that optimize the page for search engine discovery
- **Subscription_Gate**: A system that checks a user's subscription status (via Supabase auth + Stripe billing) to determine access level to gated products
- **Visitor**: Any unauthenticated user browsing the Product_Hub
- **Subscriber**: An authenticated user with an active Stripe subscription granting access to premium products

## Requirements

### Requirement 1: Product Hub Homepage Layout

**User Story:** As a visitor, I want to see all Adverse products organized on a single page, so that I can quickly discover and navigate to the product that interests me.

#### Acceptance Criteria

1. WHEN a visitor loads the root URL ("/"), THE Product_Hub SHALL render a hero section containing the Adverse brand logo, a tagline of no more than 80 characters describing the multi-product ecosystem, and a value proposition of no more than 200 characters
2. THE Product_Hub SHALL display all products from the Product_Registry as Product_Cards arranged in a responsive grid layout, where each Product_Card displays the product name, description, icon, and destination link
3. WHEN the viewport width is 768px or less, THE Product_Hub SHALL stack Product_Cards in a single-column layout
4. WHEN the viewport width exceeds 768px, THE Product_Hub SHALL display Product_Cards in a 2x2 grid with consistent card sizing
5. THE Product_Hub SHALL retain a "Website Packages" section that displays at least 3 package cards from the existing packages data with preview images and package names, each linking to its corresponding /packages/:slug route, and a link to the /packages route for browsing all packages
6. THE Product_Hub SHALL include a social proof metrics bar displaying projects delivered, client satisfaction, experience years, and response time between the hero and product grid sections
7. THE Product_Hub SHALL include a call-to-action section at the bottom linking to the /contact page for custom development inquiries

### Requirement 2: Product Registry Data Model

**User Story:** As a developer, I want a centralized product registry, so that adding or removing products from the hub requires only a data change.

#### Acceptance Criteria

1. THE Product_Registry SHALL define each product with the following fields: id (unique string), name (display string, max 50 characters), description (short text, max 160 characters), category (enum: "tools", "services"), url (relative or absolute link), icon (icon class or image path), status (enum: "live", "coming-soon", "beta"), requiresSubscription (boolean), and isExternal (boolean indicating whether the link opens in a new tab)
2. WHEN a product has status "coming-soon", THE Product_Card SHALL display a "Coming Soon" badge, render the card in a visually muted style (reduced opacity), and the card SHALL NOT navigate to the product URL when clicked
3. WHEN a product has status "beta", THE Product_Card SHALL display a "Beta" badge alongside the product name and the card SHALL remain fully interactive
4. WHEN a product has status "live", THE Product_Card SHALL render without any status badge and be fully interactive
5. THE Product_Registry SHALL include exactly these entries: CS Reference Guide (external link, category: "tools", status: "live"), PDF Editor (external link, category: "tools", status: "beta"), Basecamp Atlas (external link, category: "tools", status: "live"), and Website Packages (/packages, category: "services", status: "live")

### Requirement 3: Site-Wide Design System Revamp

**User Story:** As a visitor, I want a consistent visual experience across all pages, so that the site feels cohesive and professional regardless of which page I'm on.

#### Acceptance Criteria

1. THE Design_System SHALL define a unified color palette with tokens for: background-base, background-surface, background-muted, text-primary, text-secondary, text-muted, accent, accent-hover, accent-text, and border — applied via CSS custom properties at the :root level
2. THE Design_System SHALL define typography tokens for: font-display (headings), font-body (body text), and weight variants (light, regular, medium, bold) with consistent letter-spacing values
3. THE Design_System SHALL define spacing tokens for: section-padding, container-max-width, grid-gap, and stack-gap applied consistently across all pages
4. THE Design_System SHALL define shape tokens for: radius-small (badges/chips), radius-medium (buttons/inputs), radius-large (cards), and shadow variants (small, medium, large)
5. WHEN a visitor navigates between the homepage, /services, /packages, /about, /contact, and /learn pages, THE application SHALL maintain consistent header, footer, typography, color scheme, and spacing so that all pages appear to belong to the same product
6. THE Design_System SHALL replace the current ad-hoc CSS styles with a single source-of-truth token file that all components reference
7. THE Navbar and Footer components SHALL be updated to use the Design_System tokens and present a modern, minimal aesthetic consistent with the Product_Hub design

### Requirement 4: SEO Optimization

**User Story:** As the site owner, I want the Product_Hub to be fully SEO-optimized, so that it ranks well in search engines as a discovery page for developer tools and services.

#### Acceptance Criteria

1. THE SEO_Engine SHALL include a valid JSON-LD structured data block of type "ItemList" listing all products from the Product_Registry with status "live", where each list item includes the product name, description, URL, and numeric position
2. THE SEO_Engine SHALL include a valid JSON-LD structured data block of type "Organization" with the following fields: organization name ("Adverse Solutions"), logo URL, official website URL (https://adversesolutions.com), and at least one sameAs social profile link
3. THE SEO_Engine SHALL set the page title to a string between 30 and 60 characters that contains "Adverse Solutions" and references the product ecosystem
4. THE SEO_Engine SHALL set the meta description to a summary between 120 and 160 characters that references at least two products offered
5. THE SEO_Engine SHALL include Open Graph tags (og:title, og:description, og:image, og:url, og:type) for social sharing, where og:image references an image with minimum dimensions of 1200×630 pixels and og:type is set to "website"
6. THE SEO_Engine SHALL include Twitter Card meta tags with twitter:card set to "summary_large_image", twitter:title, twitter:description, and twitter:image
7. WHEN a new product is added to the Product_Registry with status "live", THE sitemap.xml SHALL include the product URL within 24 hours of deployment
8. THE Product_Hub SHALL use semantic HTML elements (main, section, nav, article, header) to structure content for accessibility and SEO crawlers

### Requirement 5: Product Card Interaction

**User Story:** As a visitor, I want product cards to provide clear visual feedback and navigation, so that I understand what each product offers before clicking.

#### Acceptance Criteria

1. WHEN a visitor hovers over a Product_Card, THE Product_Card SHALL display a visual hover effect with increased elevation (box-shadow change) and the transition SHALL complete within 150ms
2. WHEN a visitor clicks a Product_Card with an internal URL (isExternal: false), THE Product_Hub SHALL navigate to the product route using client-side routing without a full page reload
3. WHEN a visitor clicks a Product_Card with an external URL (isExternal: true), THE Product_Hub SHALL open the URL in a new browser tab with rel="noopener noreferrer" and the Product_Card SHALL display an external-link icon to indicate the link opens externally
4. IF a Product_Card represents a subscription-gated product and the visitor is not authenticated, THEN THE Product_Card SHALL display a lock icon indicator adjacent to the product name
5. WHEN a visitor taps a Product_Card on a touch device, THE Product_Card SHALL display the same visual feedback as the hover effect for a minimum of 200ms before initiating navigation

### Requirement 6: Shared Subscription Model Foundation

**User Story:** As the site owner, I want to establish a subscription model that can gate access to premium products, so that I can monetize the product ecosystem with a single subscription.

#### Acceptance Criteria

1. THE Subscription_Gate SHALL check the authenticated user's Stripe subscription status via the existing Supabase auth integration by querying the user's subscription record and mapping Stripe subscription statuses "active" and "trialing" to granted access, and statuses "past_due", "canceled", "unpaid", and "incomplete_expired" to denied access
2. WHEN a Subscriber with a subscription status of "active" or "trialing" navigates to a gated product, THE Subscription_Gate SHALL grant access and render the product page without additional prompts within 2 seconds of navigation
3. WHEN a Visitor (unauthenticated user) or a user with a denied subscription status navigates to a gated product, THE Subscription_Gate SHALL redirect to a subscription landing page at /subscribe that displays the "Adverse Pro" tier benefits, pricing, and a call-to-action to subscribe
4. THE Subscription_Gate SHALL support a single "Adverse Pro" tier identified by a configurable Stripe Price ID that unlocks all products in the Product_Registry where requiresSubscription is true
5. IF the Stripe API does not respond within 5 seconds, THEN THE Subscription_Gate SHALL deny access to gated products and display a user-facing message: "Unable to verify subscription. Please try again later."
6. IF the Supabase auth session is expired or unavailable, THEN THE Subscription_Gate SHALL treat the user as a Visitor and redirect to the subscription landing page

### Requirement 7: Existing Services Preservation

**User Story:** As a potential client, I want to still find web development services prominently featured, so that the site continues to serve its original purpose of attracting development clients.

#### Acceptance Criteria

1. THE Product_Hub SHALL include a visually distinct "Services" section with a heading that contains navigation links to both the /services and /packages routes
2. THE Product_Hub SHALL include a call-to-action button or link with visible text indicating custom development inquiries, linking to the /contact page
3. WHEN a visitor navigates to /services, /packages, /about, or /contact, THE application SHALL render the same page functionality that existed prior to the Product_Hub redesign, updated to use the new Design_System tokens for visual consistency
4. THE "Services" section SHALL appear within the first two viewport-heights of the Product_Hub page on viewports 768px or wider

### Requirement 8: Performance and Accessibility

**User Story:** As a visitor on any device or connection, I want the Product_Hub to load quickly and be accessible, so that I can discover products regardless of my device capabilities or assistive technology needs.

#### Acceptance Criteria

1. THE Product_Hub SHALL achieve a Lighthouse Performance score of 90 or above on mobile
2. THE Product_Hub SHALL achieve a Lighthouse Accessibility score of 95 or above
3. THE Product_Hub SHALL lazy-load product card images that are below the viewport fold using the loading="lazy" attribute
4. WHEN a visitor navigates the Product_Hub using only a keyboard, THE Product_Hub SHALL provide visible focus indicators with a minimum 3:1 contrast ratio against adjacent colors on all interactive elements, and the tab order SHALL follow the visual layout sequence
5. THE Product_Hub SHALL include ARIA labels on interactive elements including each Product_Card (aria-label conveying the product name and status)
6. THE Product_Hub SHALL render the Largest Contentful Paint element within 1.5 seconds on a simulated 4G connection as measured by Lighthouse mobile audit
