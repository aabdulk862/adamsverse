# Requirements Document

## Introduction

The AdamsVerse personal brand / creator hub site (React + Vite) has completed its first iteration of design tokens, navigation, and cleanup. This second iteration focuses on four areas: resolving duplicate branding between the banner image and navbar text, elevating the visual design to a more polished and premium feel, adding new pages (Portfolio, About, Services) via react-router-dom to support business growth, and improving usage of existing image assets (logos, flags) throughout the site. The site already has framer-motion and @mui/material as dependencies but neither is used yet — this feature activates them.

## Glossary

- **AdamsVerse_App**: The React + Vite single-page application serving as the AdamsVerse personal brand / creator hub
- **Navigation_Menu**: The fixed top navbar component that provides site-wide navigation links and dropdowns
- **Banner_Component**: The component that renders the hero banner image (`banner2.jpeg`) at the top of the home page
- **Profile_Header**: The component displaying the site owner's headline, subtitle, and role pills below the banner
- **Card_Component**: The reusable component rendering linked icon-and-text tiles in grid sections
- **Section_Component**: The reusable component rendering titled content groups on the page
- **Pricing_Card**: The expandable card component displaying service pricing details
- **Contact_Form**: The email contact form rendered in the Contact Me section
- **Footer_Component**: The bottom-of-page element displaying copyright and supplementary links
- **Portfolio_Page**: A new routed page showcasing projects and past work
- **About_Page**: A new routed page with a detailed bio, skills, and experience
- **Services_Page**: A new routed page with detailed service offerings expanding on the current Pricing_Card
- **Home_Page**: The existing single-page layout containing Banner, Profile Header, and all content sections
- **Logo_Image**: The logo asset (`logo.png`, `logo2.png`, or `logo3.png`) available in `src/assets/images/`
- **Flag_Images**: The country flag assets (`usa.png`, `eritrea.png`) available in `src/assets/images/`
- **Scroll_Animation**: A framer-motion-powered animation triggered when an element enters the viewport during scrolling
- **Page_Router**: The react-router-dom routing configuration that maps URL paths to page components

## Requirements

### Requirement 1: Resolve Duplicate Branding Between Banner and Navbar

**User Story:** As a visitor, I want the banner and navbar to complement each other visually, so that the brand identity feels intentional rather than redundant.

#### Acceptance Criteria

1. WHEN the Home_Page is displayed, THE Navigation_Menu SHALL render the Logo_Image (a selected logo asset from `src/assets/images/`) in place of the "AdamsVerse" text string as the navbar brand element
2. THE Logo_Image rendered in the Navigation_Menu SHALL have a maximum height that fits within the navbar without increasing the navbar height beyond the current `--navbar-height` value
3. WHEN a visitor clicks the Logo_Image in the Navigation_Menu, THE AdamsVerse_App SHALL navigate to the Home_Page
4. THE Banner_Component SHALL continue to display `banner2.jpeg` as the hero image on the Home_Page
5. THE Navigation_Menu SHALL not display the text "AdamsVerse" as a visible brand label alongside the Logo_Image

### Requirement 2: Enhanced Visual Hierarchy and Section Differentiation

**User Story:** As a visitor, I want each section of the site to feel visually distinct, so that I can easily scan and navigate the content.

#### Acceptance Criteria

1. THE Section_Component SHALL render each section with a visually distinct background treatment (alternating subtle background variations, gradient overlays, or border accents) so that adjacent sections are distinguishable
2. THE Section_Component SHALL render section titles with a larger font size, increased font weight, and a decorative accent element (underline, gradient text, or icon) compared to the current uppercase label style
3. THE AdamsVerse_App SHALL apply consistent vertical spacing of at least 48px between consecutive sections using design tokens
4. WHEN a section contains a grid of Card_Components, THE Section_Component SHALL render a subtle section-level container with rounded corners and a background that contrasts with the page background

### Requirement 3: Improved Card Design

**User Story:** As a visitor, I want cards to look visually engaging, so that I am drawn to interact with the content.

#### Acceptance Criteria

1. THE Card_Component SHALL render with a gradient background or a glassmorphism effect that provides more visual depth than the current flat `rgba(255, 255, 255, 0.08)` background
2. THE Card_Component SHALL display a colored icon accent (using the existing icon hover color tokens) as the default icon color rather than only on hover
3. WHEN a visitor hovers over a Card_Component, THE Card_Component SHALL apply a scale transform, an elevated box shadow, and a border glow effect with a transition duration matching the `--transition-normal` token
4. THE Pricing_Card SHALL render with a distinct visual treatment (gradient border, highlighted background, or badge) that differentiates the pricing information from standard Card_Components
5. THE Card_Component SHALL maintain a minimum height so that all cards in a grid row align to the same vertical size

### Requirement 4: Enhanced Profile Header

**User Story:** As a visitor, I want the profile header to make a strong first impression, so that I immediately understand who the site owner is and what they offer.

#### Acceptance Criteria

1. THE Profile_Header SHALL display the Flag_Images (`usa.png` and `eritrea.png`) inline with or adjacent to the profile title to represent the site owner's heritage
2. THE Profile_Header SHALL render the role pills with individual accent colors or gradient backgrounds rather than the current uniform semi-transparent style
3. THE Profile_Header SHALL include a call-to-action button (linking to the Contact_Form section or the Services_Page) below the role pills
4. THE Profile_Header SHALL apply a Scroll_Animation (fade-in and upward slide) when the Profile_Header enters the viewport on initial page load
5. THE Profile_Header SHALL render the subtitle text with a typewriter or fade-in-word animation using framer-motion on initial page load

### Requirement 5: Improved Contact Form Styling

**User Story:** As a visitor, I want the contact form to look polished and inviting, so that I feel confident submitting my information.

#### Acceptance Criteria

1. THE Contact_Form SHALL render input fields with a visible left-side accent border or an icon prefix inside the input to indicate the field type
2. THE Contact_Form SHALL render the submit button with a gradient background matching the site's accent color palette and a hover animation (glow or scale effect)
3. WHEN an input field in the Contact_Form receives focus, THE Contact_Form SHALL apply a visible focus ring using the `--accent-primary` color token with a smooth transition
4. THE Contact_Form SHALL render the form heading ("Let's Work Together") with a decorative treatment (gradient text or accent underline) consistent with section title styling
5. IF a form submission fails, THEN THE Contact_Form SHALL display the error message with an icon prefix and a styled error container rather than plain text

### Requirement 6: Enhanced Footer

**User Story:** As a visitor, I want the footer to provide useful links and information, so that I can navigate to other parts of the site or find contact details from the bottom of the page.

#### Acceptance Criteria

1. THE Footer_Component SHALL display navigation links to the Home_Page, Portfolio_Page, About_Page, and Services_Page
2. THE Footer_Component SHALL display social media icon links (matching the icons used in the Content & Socials section) in a horizontal row
3. THE Footer_Component SHALL display the copyright text ("© 2026 AdamsVerse LLC") on a separate line below the navigation and social links
4. THE Footer_Component SHALL render with a visually distinct background (darker shade or gradient) and top border that separates the footer from the page content
5. THE Footer_Component SHALL use consistent spacing and typography tokens from the design token system

### Requirement 7: Scroll-Triggered Animations

**User Story:** As a visitor, I want smooth animations as I scroll through the site, so that the experience feels dynamic and modern.

#### Acceptance Criteria

1. WHEN a Section_Component enters the viewport during scrolling, THE Section_Component SHALL animate into view with a fade-in and upward-slide Scroll_Animation using framer-motion
2. WHEN a Card_Component enters the viewport during scrolling, THE Card_Component SHALL animate into view with a staggered fade-in Scroll_Animation where each card in a grid row animates sequentially with a delay offset
3. THE Scroll_Animation SHALL trigger only once per element (not re-trigger when scrolling back up and down)
4. WHEN the viewport width is 600px or less, THE AdamsVerse_App SHALL reduce Scroll_Animation durations by 50% to maintain performance on mobile devices
5. THE Scroll_Animation SHALL use framer-motion's `whileInView` or `useInView` API with an intersection threshold of at least 0.2


### Requirement 8: Portfolio Page

**User Story:** As a visitor, I want to see a dedicated portfolio page, so that I can evaluate the site owner's past work and project quality before reaching out.

#### Acceptance Criteria

1. WHEN a visitor navigates to the `/portfolio` URL path, THE Page_Router SHALL render the Portfolio_Page
2. THE Portfolio_Page SHALL display a grid of project cards, where each card contains a project title, a short description, a technology tags list, and an optional thumbnail image
3. THE Portfolio_Page SHALL source project data from a data array defined in the component or a configuration file, so that new projects can be added by appending to the array without modifying rendering logic
4. WHEN a visitor clicks a project card on the Portfolio_Page, THE Portfolio_Page SHALL open the project's external link in a new browser tab (if a link is provided)
5. THE Portfolio_Page SHALL include the Navigation_Menu and Footer_Component consistent with the Home_Page layout
6. THE Portfolio_Page SHALL apply Scroll_Animations to project cards as they enter the viewport

### Requirement 9: About Page

**User Story:** As a visitor, I want to read a detailed about page, so that I can learn more about the site owner's background, skills, and experience.

#### Acceptance Criteria

1. WHEN a visitor navigates to the `/about` URL path, THE Page_Router SHALL render the About_Page
2. THE About_Page SHALL display a bio section with a profile photo or avatar placeholder, the site owner's name, and a multi-paragraph biography
3. THE About_Page SHALL display a skills section listing technical and creative skills as styled tags or pills
4. THE About_Page SHALL display an experience or timeline section showing key milestones or work history entries
5. THE About_Page SHALL include the Flag_Images to represent the site owner's heritage, consistent with the Profile_Header usage
6. THE About_Page SHALL include the Navigation_Menu and Footer_Component consistent with the Home_Page layout
7. THE About_Page SHALL apply Scroll_Animations to each content section as it enters the viewport

### Requirement 10: Services Page

**User Story:** As a visitor, I want a dedicated services page, so that I can understand the full range of offerings and pricing before contacting the site owner.

#### Acceptance Criteria

1. WHEN a visitor navigates to the `/services` URL path, THE Page_Router SHALL render the Services_Page
2. THE Services_Page SHALL display service offering cards, where each card contains a service title, a description, a price range, and a list of included deliverables
3. THE Services_Page SHALL source service data from a data array defined in the component or a configuration file, so that offerings can be updated by modifying the array without changing rendering logic
4. THE Services_Page SHALL include a call-to-action button on each service card that navigates the visitor to the Contact_Form section on the Home_Page (using a hash link `/contact` or `/#contact`)
5. THE Services_Page SHALL include the Navigation_Menu and Footer_Component consistent with the Home_Page layout
6. THE Services_Page SHALL apply Scroll_Animations to service cards as they enter the viewport

### Requirement 11: Page Routing Configuration

**User Story:** As a developer, I want a clean routing setup, so that all pages are accessible via URL paths and share a consistent layout.

#### Acceptance Criteria

1. THE Page_Router SHALL define routes for the following paths: `/` (Home_Page), `/portfolio` (Portfolio_Page), `/about` (About_Page), `/services` (Services_Page)
2. THE Page_Router SHALL render the Navigation_Menu on all routes as a persistent layout element
3. THE Page_Router SHALL render the Footer_Component on all routes as a persistent layout element
4. WHEN a visitor navigates to an undefined URL path, THE Page_Router SHALL render a 404 page with a link back to the Home_Page
5. THE Navigation_Menu SHALL include links to the Portfolio_Page, About_Page, and Services_Page in addition to the existing section anchor links
6. WHEN a visitor is on a page other than the Home_Page and clicks a section anchor link (Pricing, Discord, Content & Socials, Support, Contact Me), THE Navigation_Menu SHALL navigate to the Home_Page and scroll to the corresponding section

### Requirement 12: Image Asset Integration

**User Story:** As a developer, I want all available image assets used purposefully throughout the site, so that the visual identity is cohesive and no assets go to waste.

#### Acceptance Criteria

1. THE Navigation_Menu SHALL use one of the Logo_Image assets (`logo.png`, `logo2.png`, or `logo3.png`) as the brand element, selected based on visual fit with the navbar dimensions
2. THE Profile_Header SHALL display the Flag_Images (`usa.png` and `eritrea.png`) adjacent to the profile title or subtitle
3. THE About_Page SHALL use a Logo_Image asset or profile photo in the bio section header
4. THE AdamsVerse_App SHALL not import image assets that are not rendered in any component
5. WHEN an image asset is rendered, THE AdamsVerse_App SHALL include a descriptive `alt` attribute on the `img` element for accessibility
