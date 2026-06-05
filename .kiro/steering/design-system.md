---
inclusion: fileMatch
fileMatchPattern: "**/*.css,**/styles*,**/*.module.css,**/tokens*"
---

# Adverse LLC — Design System Reference

## Architecture

The design system uses a 3-layer modular CSS architecture:

```
src/tokens.css           → Layer 1: Single source of truth for all design tokens
src/styles.css           → Layer 2: Import-only manifest (no rules, only @import)
src/styles/*.css         → Layer 2: Global style partials (reset, typography, etc.)
*.module.css             → Layer 3: Co-located CSS Modules for components/pages
```

## Design Tokens (src/tokens.css)

All tokens use canonical naming. The token file defines both `:root` (light) and `[data-theme="dark"]` values.

### Token Naming Convention

| Family | Prefix | Example |
|--------|--------|---------|
| Backgrounds (5 levels) | `--color-bg-*` | `--color-bg-base`, `--color-bg-subtle`, `--color-bg-surface`, `--color-bg-muted`, `--color-bg-raised` |
| Text | `--color-text-*` | `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-text-inverse` |
| Accent | `--color-accent-*` | `--color-accent`, `--color-accent-hover`, `--color-accent-active` |
| Borders | `--color-border-*` | `--color-border`, `--color-border-hover`, `--color-border-strong` |
| Semantic | `--color-*` | `--color-success`, `--color-error`, `--color-warning`, `--color-info` |
| Brand semantic | `--color-*` | `--color-premium`, `--color-ai-accent` |
| Spacing | `--space-*` | `--space-1` (4px) through `--space-32` (128px) |
| Font families | `--font-*` | `--font-display` (Instrument Serif), `--font-body` (Inter), `--font-mono` (JetBrains Mono) |
| Font sizes | `--text-*` | `--text-xs` through `--text-display` |
| Font weights | `--weight-*` | `--weight-light` through `--weight-bold` |
| Line heights | `--leading-*` | `--leading-none` through `--leading-loose` |
| Letter spacing | `--tracking-*` | `--tracking-tighter` through `--tracking-caps` |
| Radii | `--radius-*` | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-full` |
| Shadows (7 levels) | `--shadow-*` | `--shadow-xs` through `--shadow-2xl`, `--shadow-inner` |
| Z-index | `--z-*` | `--z-base` through `--z-max` |
| Motion durations | `--duration-*` | `--duration-instant` through `--duration-exit` |
| Motion easing | `--ease-*` | `--ease-default`, `--ease-bounce`, `--ease-spring` |
| Transitions | `--transition-*` | `--transition-fast`, `--transition-bounce`, `--transition-spring` |
| Layout | `--container-*`, `--navbar-*` | `--container-max-width`, `--container-narrow`, `--container-wide` |
| Cards | `--card-*` | `--card-bg`, `--card-radius`, `--card-padding`, `--card-shadow` |
| Buttons | `--btn-*` | `--btn-height-sm/md/lg`, `--btn-radius`, `--btn-font-size` |
| Inputs | `--input-*` | `--input-height`, `--input-radius`, `--input-focus-ring` |
| Focus | `--focus-*` | `--focus-ring-width`, `--focus-ring-offset`, `--focus-ring-color` |
| Accent UI | `--accent-bg-*`, `--accent-border-*` | `--accent-bg-subtle`, `--accent-border` |

### Typography

**Fonts:**
- Display: Instrument Serif (headings h1/h2, hero text — editorial, distinctive)
- Body: Inter (everything else — legible, neutral, scales well)
- Mono: JetBrains Mono (code blocks, data display, technical content)

**Scale:**

| Token | Size | Use |
|-------|------|-----|
| `--text-xs` | 0.75rem | Captions, badges |
| `--text-sm` | 0.875rem | Secondary text, labels |
| `--text-base` | 1rem | Body text |
| `--text-lg` | 1.125rem | Emphasized body |
| `--text-xl` | 1.25rem | Card titles, h4 |
| `--text-2xl` | 1.5rem | Section subheadings, h3 |
| `--text-3xl` | 2rem | Section headings, h2 |
| `--text-4xl` | 2.5rem | Page headings, h1 |
| `--text-display` | 3.5rem | Hero headlines |

**Heading rules:**
- h1/h2 use `--font-display` (Instrument Serif), weight regular, tight tracking
- h3/h4 use `--font-body` (Inter), weight semibold, normal tracking
- Display text (>32px) uses `--leading-display` (1.05) or `--leading-tight` (1.1)
- Body text uses `--leading-normal` (1.5) or `--leading-relaxed` (1.6)

### Spacing Scale

4px base: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128

### Radii

- `--radius-sm`: 4px (badges, small elements)
- `--radius-md`: 8px (buttons, inputs)
- `--radius-lg`: 12px (cards)
- `--radius-xl`: 16px (modals, large cards)
- `--radius-2xl`: 24px (hero sections)
- `--radius-full`: 999px (pills, avatars)

### Shadows (7 levels of elevation)

- `--shadow-xs`: Barely visible (1px)
- `--shadow-sm`: Subtle lift (cards at rest)
- `--shadow-md`: Default interactive (buttons, dropdowns)
- `--shadow-lg`: Elevated (card hover, popovers)
- `--shadow-xl`: High elevation (modals, floating actions)
- `--shadow-2xl`: Maximum elevation (command palettes)
- `--shadow-inner`: Inset (pressed states, input fills)

### Z-Index Scale

- `--z-base`: 0 (default)
- `--z-raised`: 1 (cards above siblings)
- `--z-dropdown`: 100 (dropdown menus)
- `--z-sticky`: 200 (sticky elements)
- `--z-navbar`: 300 (fixed navbar)
- `--z-overlay`: 400 (backdrop overlays)
- `--z-modal`: 500 (modal dialogs)
- `--z-popover`: 600 (popovers above modals)
- `--z-toast`: 700 (toast notifications)
- `--z-tooltip`: 800 (tooltips)

### Motion

**Durations:**
- `--duration-instant`: 50ms (micro-feedback)
- `--duration-fast`: 150ms (hover states, toggles)
- `--duration-normal`: 250ms (standard transitions)
- `--duration-slow`: 350ms (panel slides)
- `--duration-entrance`: 300ms (elements appearing)
- `--duration-exit`: 200ms (elements leaving — faster than entrance)

**Easing:**
- `--ease-default`: Standard deceleration
- `--ease-bounce`: Overshoot for playful interactions
- `--ease-spring`: Elastic for attention-grabbing elements

## Global Style Manifest (src/styles.css)

The manifest is import-only — no rules, selectors, or property definitions:

```css
@import "./styles/reset.css";
@import "./styles/typography.css";
@import "./styles/cards.css";
@import "./styles/forms.css";
@import "./styles/layout.css";
@import "./styles/navbar.css";
@import "./styles/dark-theme.css";
@import "./styles/responsive.css";
```

## CSS Modules Pattern

Components and pages use co-located `.module.css` files:

```jsx
import styles from './ComponentName.module.css';

export default function ComponentName() {
  return <div className={styles.wrapper}>...</div>;
}
```

```css
/* ComponentName.module.css */
.wrapper {
  padding: var(--space-6);
  border-radius: var(--radius-md);
  background: var(--card-bg);
}
```

## Package Tokens (WeBuilder — scoped to package wrapper)

These power individual package previews, applied by `applyTheme()` to a scoped DOM element:

```css
--color-bgBase, --color-bgSurface, --color-bgMuted
--color-textPrimary, --color-textSecondary, --color-textMuted
--color-accent, --color-accentHover, --color-accentText, --color-border
--font-display, --font-body, --font-weightLight through --font-weightBold
--shape-radiusSmall, --shape-radiusMedium, --shape-radiusLarge
--shape-buttonStyle, --shape-cardStyle
/* Optional: --spacing-*, --shadow-*, --motion-* */
```

## Rules

1. Never hardcode colors — always use `var(--token-name)`
2. Never use inline styles — create a CSS class
3. Package section components use `--color-*` / `--font-*` / `--shape-*` tokens (scoped, not global)
4. Global site components use canonical tokens from `tokens.css`
5. Dark theme is handled by `[data-theme="dark"]` selector — never use media queries for theme
6. New component styles go in co-located `.module.css` files
7. Global styles only in `src/styles/*.css` — never add rules to `src/styles.css` directly
