// Feature: ai-website-packages, Property 1: Package card count matches data array length
// Feature: ai-website-packages, Property 2: Package card content completeness
// **Validates: Requirements 1.1, 1.2, 1.3**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PackagesPage from "../pages/PackagesPage";
import packages from "../data/packages";

describe("Property 1: Package card count matches data array length", () => {
  it("rendered card count equals the packages data array length", () => {
    fc.assert(
      fc.property(fc.constant(packages), (pkgs) => {
        const { container, unmount } = render(
          <MemoryRouter>
            <PackagesPage />
          </MemoryRouter>,
        );

        const cards = container.querySelectorAll(
          '[data-testid="package-card"]',
        );
        expect(cards.length).toBe(pkgs.length);

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});

describe("Property 2: Package card content completeness", () => {
  it("each package card contains name, description, Preview link with correct href, and CTA element", () => {
    fc.assert(
      fc.property(fc.constantFrom(...packages), (pkg) => {
        const { container, unmount } = render(
          <MemoryRouter>
            <PackagesPage />
          </MemoryRouter>,
        );

        const text = container.textContent;

        // Package name appears in the rendered output
        expect(text).toContain(pkg.name);

        // Package description appears
        expect(text).toContain(pkg.description);

        // A link with href `/packages/${slug}` exists
        const previewLink = container.querySelector(
          `a[href="/packages/${pkg.slug}"]`,
        );
        expect(previewLink).not.toBeNull();
        expect(previewLink.textContent).toContain("Preview");

        // A "Get Started" CTA link exists
        const ctaLinks = container.querySelectorAll('a[href="/contact"]');
        expect(ctaLinks.length).toBeGreaterThan(0);

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
