// Feature: design-packages-overhaul, Property 3: All valid slugs render full preview
// Feature: ai-website-packages, Property 4: Invalid slugs render not-found
// **Validates: Requirements 1.6, 2.3, 2.4, 6.1, 6.2**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PackageDetailPage from "../pages/PackageDetailPage";
import packages from "../data/packages";

const allSlugs = packages.map((p) => p.slug);

function renderWithSlug(slug) {
  return render(
    <MemoryRouter initialEntries={[`/packages/${slug}`]}>
      <Routes>
        <Route path="/packages/:slug" element={<PackageDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Property 3: All valid slugs render full preview", () => {
  it("for any valid slug, the full preview wrapper is rendered instead of coming-soon", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allSlugs), (slug) => {
        const { getByTestId, queryByTestId, unmount } = renderWithSlug(slug);

        expect(getByTestId("preview-wrapper")).toBeInTheDocument();
        expect(queryByTestId("coming-soon")).not.toBeInTheDocument();

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});

describe("Property 4: Invalid slugs render not-found", () => {
  it("for any string not matching a slug in the data array, a not-found message is displayed", () => {
    fc.assert(
      fc.property(
        fc
          .stringMatching(/^[a-z][a-z0-9-]{1,20}$/)
          .filter((s) => !allSlugs.includes(s)),
        (slug) => {
          const { getByTestId, unmount } = renderWithSlug(slug);

          const notFound = getByTestId("not-found");
          expect(notFound).toBeInTheDocument();

          unmount();
        },
      ),
      { numRuns: 100 },
    );
  });
});
