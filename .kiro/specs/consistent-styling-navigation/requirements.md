# Requirements Document

## Introduction

The AdamsVerse personal brand / creator hub is a React + Vite single-page site with sections for Development, Pricing, Discord, Content & Socials, Support, Contact Me, and standalone learning resources (DSA guide and LeetCode guide). The site uses a single `styles.css` file with some CSS custom properties already in place. It currently lacks a navigation menu, has inconsistent spacing and typography (with some inline styles mixed in), and has unused component files. This feature introduces a consolidated design token system in the existing stylesheet, a responsive navigation menu reflecting the site's business sections, and cleanup of inconsistent styles and dead code — all focused on fast, practical delivery.

## Glossary

- **Design_Token_System**: A consolidated set of CSS custom properties in `styles.css` defining spacing, typography, colors, border radii, shadows, and transitions used consistently across all components
- **Navigation_Menu**: A persistent UI component allowing visitors to jump to page sections and access learning resources
- **AdamsVerse_App**: The React + Vite single-page application serving as the AdamsVerse personal brand / creator hub
- **Learn_Dropdown**: A dropdown item within the Navigation_Menu grouping links to the DSA_Guide and LeetCode_Guide
- **Projects_Dropdown**: A dropdown item within the Navigation_Menu that displays a configurable list of client project entries (each with a project name and link), defined as a data array so new projects can be added without modifying component logic
- **DSA_Guide**: The standalone HTML page at `/dsa.html` covering Big O, data structures, and LeetCode patterns
- **LeetCode_Guide**: The standalone HTML page at `/leetcode.html` containing common coding interview questions with Java solutions
- **Section_Component**: The reusable `Section` React component that renders titled content groups on the page
- **Card_Component**: The reusable `Card` React component that renders linked icon-and-text tiles

## Requirements

### Requirement 1: Design Token System

**User Story:** As a developer, I want a consolidated design token system in the existing stylesheet, so that all components share consistent spacing, typography, colors, and visual properties without duplicating values.

#### Acceptance Criteria

1. THE Design_Token_System SHALL extend the existing `:root` custom properties in `styles.css` to include tokens for spacing (4px, 8px, 12px, 16px, 24px, 32px, 48px), typography (font family, font sizes, font weights, line heights), color palette (background, text, muted text, border, accent), border radii, box shadows, and transition durations
2. WHEN a component requires a spacing, color, typography, border-radius, shadow, or transition value, THE AdamsVerse_App SHALL reference a design token custom property instead of a hardcoded value
3. WHEN the Design_Token_System tokens are updated, THE AdamsVerse_App SHALL reflect the changes across all components that reference the modified tokens without requiring per-component edits
4. THE Design_Token_System SHALL remain in the existing `styles.css` file alongside component styles, keeping the single-file approach

### Requirement 2: Responsive Navigation Menu

**User Story:** As a visitor, I want a navigation menu, so that I can quickly jump to any section of the AdamsVerse page or access learning resources.

#### Acceptance Criteria

1. THE Navigation_Menu SHALL display links for the following business sections: Pricing, Discord, Content & Socials, Support, and Contact Me
2. THE Navigation_Menu SHALL include a Projects_Dropdown that replaces the previous Development section link
3. THE Projects_Dropdown SHALL display a list of client project entries, where each entry contains a project name and an external link
4. THE Projects_Dropdown SHALL source its project entries from a data array defined in the component or a configuration file, so that new projects can be added by appending to the array without modifying rendering logic
5. WHEN a visitor clicks a project entry inside the Projects_Dropdown, THE Navigation_Menu SHALL open the project link in a new browser tab
6. THE Navigation_Menu SHALL include a Learn_Dropdown containing links to the DSA_Guide (`/dsa.html`) and the LeetCode_Guide (`/leetcode.html`)
7. WHEN a visitor clicks a section navigation link, THE Navigation_Menu SHALL smooth-scroll the page to the corresponding section
8. WHEN a visitor clicks a link inside the Learn_Dropdown, THE Navigation_Menu SHALL navigate the browser to the selected standalone HTML page
9. WHILE the viewport width is 600px or less, THE Navigation_Menu SHALL collapse into a hamburger icon that toggles a vertical menu overlay, with the Projects_Dropdown and Learn_Dropdown items displayed as expandable groups within the overlay
10. WHILE the viewport width is greater than 600px, THE Navigation_Menu SHALL display as a horizontal bar fixed to the top of the page, with the Projects_Dropdown and Learn_Dropdown appearing on hover or click
11. THE Navigation_Menu SHALL remain visible as the visitor scrolls the page
12. WHEN the visitor clicks a link in the mobile overlay menu, THE Navigation_Menu SHALL close the overlay after initiating the scroll or navigation

### Requirement 3: Consistent Component Styling

**User Story:** As a developer, I want all components to use design tokens consistently, so that the UI looks visually unified and styles are easy to maintain.

#### Acceptance Criteria

1. THE AdamsVerse_App SHALL replace all hardcoded spacing, color, font-size, border-radius, shadow, and transition values in `styles.css` with references to Design_Token_System custom properties
2. THE AdamsVerse_App SHALL remove all inline `style` attributes from JSX and replace them with CSS classes that reference design tokens
3. THE Card_Component SHALL use consistent padding, border-radius, font-size, and hover effects derived from the Design_Token_System across all instances
4. THE Section_Component SHALL apply uniform margin, padding, and title typography derived from the Design_Token_System

### Requirement 4: Typography Consistency

**User Story:** As a visitor, I want consistent typography across the entire site, so that the content feels polished and easy to read.

#### Acceptance Criteria

1. THE AdamsVerse_App SHALL define a type scale with distinct sizes for headings (h1, h2), section titles, body text, and small/caption text using the Design_Token_System
2. THE AdamsVerse_App SHALL apply a single font family from the Design_Token_System to all text elements
3. THE AdamsVerse_App SHALL use consistent line-height values from the Design_Token_System for body text and headings
4. WHEN text appears inside a Card_Component, THE Card_Component SHALL use the body font-size and font-weight tokens from the Design_Token_System

### Requirement 5: Spacing and Layout Consistency

**User Story:** As a developer, I want a predictable spacing system, so that margins and paddings are uniform and easy to adjust site-wide.

#### Acceptance Criteria

1. THE AdamsVerse_App SHALL use only spacing values defined in the Design_Token_System for all margins and paddings
2. THE AdamsVerse_App SHALL maintain consistent gap values between grid items, section titles and content, and card internal elements using design tokens
3. WHILE the viewport width is 600px or less, THE AdamsVerse_App SHALL reduce spacing values proportionally using responsive design token overrides or CSS clamp functions
4. THE AdamsVerse_App SHALL use a consistent container max-width and horizontal padding derived from the Design_Token_System across all viewport sizes

### Requirement 6: Cleanup of Unused Components and Markup Issues

**User Story:** As a developer, I want to remove dead code and fix markup inconsistencies, so that the codebase stays clean.

#### Acceptance Criteria

1. THE AdamsVerse_App SHALL remove or integrate the unused `EmailForm.jsx` and `ContactSection.jsx` components so that no orphaned component files remain in the repository
2. THE AdamsVerse_App SHALL replace all `class` attributes in JSX with `className` attributes to comply with React conventions
3. IF a component file exists in the `src/components` directory but is not imported by any other module, THEN THE AdamsVerse_App SHALL remove that component file
