---
inclusion: manual
---

# Adverse LLC — Testing Strategy

## Test Runner

- **Vitest 4** with jsdom environment
- **fast-check 4** for property-based testing
- **@testing-library/react** + **@testing-library/jest-dom** for component tests

## Running Tests

```bash
npm run test                    # All tests (single run, --run flag)
npx vitest --run src/__tests__/property-webuilder-*  # WeBuilder property tests only
npx vitest --run src/__tests__/property-*            # All property tests
```

## Test File Location

All tests live in `src/__tests__/` — not co-located with source files (except agent component tests which are co-located).

## Property-Based Tests

Property tests verify universal correctness guarantees using randomized inputs. They are the primary testing approach for the WeBuilder system.

### Naming Convention

```
src/__tests__/property-{feature}-{aspect}.test.js
```

### Structure

```javascript
import { describe, it, expect } from "vitest";
import fc from "fast-check";

describe("Feature: {feature-name}, Property {N}: {title}", () => {
  it("should {property statement}", () => {
    fc.assert(
      fc.property(
        fc./* generator */(),
        (input) => {
          // exercise system
          // assert property holds
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Key Properties (WeBuilder)

| # | Property | Test File |
|---|----------|-----------|
| 1 | Theme application sets correct CSS vars | property-webuilder-theme-engine.test.js |
| 2 | Theme backward compatibility | property-webuilder-theme-engine.test.js |
| 3 | Invalid theme rejection preserves state | property-webuilder-theme-engine.test.js |
| 4 | Package_Config JSON round-trip | property-webuilder-schema-validation.test.js |
| 5 | Schema error reporting | property-webuilder-schema-validation.test.js |
| 6 | Section rendering order | property-webuilder-section-renderer.test.jsx |
| 7 | Unknown section types handled | property-webuilder-section-renderer.test.jsx |
| 8 | Partial content graceful handling | property-webuilder-section-components.test.jsx |
| 9 | Layout variant fallback | property-webuilder-section-components.test.jsx |
| 10 | Content resolution by key | property-webuilder-content-layer.test.js |
| 11 | Edit invariant (non-editable preserved) | property-webuilder-content-layer.test.js |
| 12 | Edit validation rejects invalid | property-webuilder-content-layer.test.js |
| 13 | Edit persistence round-trip | property-webuilder-content-layer.test.js |
| 14 | Static packages reject edits | property-webuilder-content-layer.test.js |
| 15 | Compositional correctness | property-webuilder-section-renderer.test.jsx |
| 16 | Invalid theme reference rejection | property-webuilder-composition.test.jsx |
| 17 | Schema self-documentation | property-webuilder-schema-validation.test.js |
| 18 | Slug resolution preserves routing | property-webuilder-section-renderer.test.jsx |

## Unit/Integration Tests

For specific behaviors not covered by properties:
- Component rendering with specific data
- Hook behavior (auth, scroll animation)
- Service module edge cases
- Agent console interactions

## Before Committing

Always run:
```bash
npm run lint && npm run test && npm run build
```

All three must pass with zero errors before any commit.
