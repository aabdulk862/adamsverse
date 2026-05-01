// Feature: ai-website-packages, Property 3: Non-restaurant slugs render placeholder
// Feature: ai-website-packages, Property 4: Invalid slugs render not-found
// **Validates: Requirements 2.3, 2.4**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PackageDetailPage from "../pages/PackageDetailPage";
import packages from "../data/packages";

const allSlugs = packages.map((p) => p.slug);
const nonRestaurantSlugs = allSlugs.filter((s) => s !== "restaurant");

function renderWithSlug(slug) {
  return render(
    <MemoryRouter initialEntries={[`/packages/${slug}`]}>
      <Routes>
        <Route path="/packages/:slug" element={<PackageDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Property 3: Non-restaurant slugs render placeholder", () => {
  it("for any valid non-restaurant slug, coming-soon placeholder content is rendered", () => {
    fc.assert(
      fc.property(fc.constantFrom(...nonRestaurantSlugs), (slug) => {
        const { getByTestId, unmount } = renderWithSlug(slug);

        const comingSoon = getByTestId("coming-soon");
        expect(comingSoon).toBeInTheDocument();

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
