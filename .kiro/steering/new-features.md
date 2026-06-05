---
inclusion: manual
---

# Adverse LLC — Adding New Features

## Decision Framework

Before writing code, determine:

1. **Is this a new package?** → JSON only (data + themes), no components needed
2. **Is this a new section type?** → One component + `.module.css` + registry entry
3. **Is this a new page?** → Add route in App.jsx, create page component + `.module.css`, add to Navbar if public
4. **Is this a new service/integration?** → Add to `src/lib/`, never put business logic in components
5. **Is this a new global style?** → Add to appropriate file in `src/styles/`, never to `src/styles.css` directly
6. **Is this a new standalone tool/product?** → Separate repo, separate deploy. Only add a link on the `/tools` page and product registry. See `PRODUCT_ROADMAP.md` for the ecosystem strategy.

## New Package Workflow

```
1. src/data/packages.js → Add package config object
2. src/data/themes.js   → Add 3 themes under the slug key
3. npm run build && npm run test → Verify
```

Required package fields: `slug`, `name`, `category`, `description`, `sections` (min 1 section)
Optional: `packageType` (defaults to "static"), `metadata` (phone, email, address, hours)

## New Page Workflow

```
1. src/pages/NewPage.jsx           → Create page component
2. src/pages/NewPage.module.css    → Create co-located CSS module (use tokens from tokens.css)
3. src/App.jsx                     → Add Route (lazy-load if not critical path)
4. src/components/Navbar.jsx       → Add nav link if public-facing
5. src/components/Footer.jsx       → Add footer link if appropriate
```

## New Component Workflow

```
1. src/components/ComponentName.jsx           → Component logic
2. src/components/ComponentName.module.css    → Scoped styles (reference tokens via var(--token-name))
3. Import and use in parent component/page
```

CSS Module pattern:
```jsx
import styles from './ComponentName.module.css';

export default function ComponentName({ prop }) {
  return <div className={styles.wrapper}>...</div>;
}
```

```css
/* ComponentName.module.css */
.wrapper {
  padding: var(--space-6);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
}
```

## New Hook Workflow

```
1. src/hooks/useHookName.js → Hook implementation
2. Export from the file, import where needed
```

## New Service/Library Workflow

```
1. src/lib/serviceName.js → Service implementation
2. Return { success, data?, error? } objects — never throw
3. Add unit tests in src/__tests__/
```

## Adding Global Styles

Global styles go in the appropriate file under `src/styles/`:

| File | What goes here |
|------|---------------|
| `reset.css` | Base element resets, box-sizing |
| `typography.css` | Heading scales, body text, link styles |
| `cards.css` | Shared `.card` base styles |
| `forms.css` | Form elements, inputs, buttons |
| `layout.css` | Shared layout patterns (.section, .page-header, .container) |
| `navbar.css` | Navbar-specific global styles |
| `dark-theme.css` | `[data-theme="dark"]` overrides for global elements |
| `responsive.css` | Responsive overrides, touch targets |

**Never add rules to `src/styles.css`** — it's an import-only manifest.

## Adding Design Tokens

New tokens go in `src/tokens.css`:
- Light theme values under `:root`
- Dark theme overrides under `[data-theme="dark"]`
- Follow canonical naming: `--color-*`, `--space-*`, `--text-*`, `--weight-*`, `--radius-*`, `--shadow-*`, `--transition-*`

## Adding Dependencies

- Use exact versions (`npm install package@x.y.z`)
- Prefer well-known, actively maintained packages
- Check if existing deps already cover the need (MUI, Framer Motion, etc.)
- Client-side deps go in `dependencies`, dev tools in `devDependencies`

## Feature Flags / Package Types

- `"static"` — No client editing, render once from config
- `"semi-dynamic"` — Client can edit content fields via Content Layer
- `"dynamic"` — Content fetched on each navigation

## Validation

All new data structures should have a JSON Schema:
- Define in `src/schemas/`
- Validate with `ajv` (allErrors: true)
- Include `description` and `examples` on every property (AI-readiness)
