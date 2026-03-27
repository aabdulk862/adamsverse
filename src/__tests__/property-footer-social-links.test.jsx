// Feature: saas-platform-revamp, Property 8: Footer contains only professional social links
// **Validates: Requirements 9.3**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../components/Footer";

const ALLOWED_SOCIALS = ["github", "linkedin", "envelope", "email", "mailto"];
const BANNED_SOCIALS = ["youtube", "twitch", "tiktok", "twitter", "instagram"];

describe("Property 8: Footer contains only professional social links", () => {
  it("footer social links belong to the allowed set and no banned socials are present", () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const socialLinks = container.querySelectorAll(".footer-socials a");

    fc.assert(
      fc.property(fc.constantFrom(...Array.from(socialLinks)), (link) => {
        const href = (link.getAttribute("href") || "").toLowerCase();
        const ariaLabel = (link.getAttribute("aria-label") || "").toLowerCase();
        const innerHTML = link.innerHTML.toLowerCase();

        // Verify the link matches one of the allowed socials
        const isAllowed = ALLOWED_SOCIALS.some(
          (s) =>
            href.includes(s) || ariaLabel.includes(s) || innerHTML.includes(s),
        );
        expect(isAllowed).toBe(true);

        // Verify no banned social is present
        BANNED_SOCIALS.forEach((banned) => {
          expect(href).not.toContain(banned);
          expect(ariaLabel).not.toContain(banned);
          expect(innerHTML).not.toContain(banned);
        });
      }),
      { numRuns: 100 },
    );
  });
});
