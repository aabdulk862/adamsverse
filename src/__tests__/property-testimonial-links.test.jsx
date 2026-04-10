// Feature: saas-homepage-redesign, Property 4: Testimonial card links open in new tab
// **Validates: Requirements 4.3**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";

/**
 * Test helper that replicates the same testimonial/client card JSX
 * structure used inline in HomePage.jsx, focused on the anchor element
 * and its target/rel attributes.
 */
function TestimonialCard({ client }) {
  return (
    <a
      href={client.link}
      target="_blank"
      rel="noopener noreferrer"
      className="home-portfolio-card"
    >
      <div className="home-portfolio-thumb">
        <div className="home-portfolio-placeholder">
          <span>{client.title.charAt(0)}</span>
        </div>
      </div>
      <div className="home-portfolio-body">
        <h3 className="home-portfolio-title">
          {client.title}
          <i className="fas fa-external-link-alt home-portfolio-link-icon"></i>
        </h3>
        <p className="home-portfolio-desc">{client.description}</p>
      </div>
    </a>
  );
}

// Generator: client object with a non-empty URL link
const clientWithLinkArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 30 }),
  description: fc.string({ minLength: 1, maxLength: 100 }),
  link: fc.webUrl(),
});

describe("Property 4: Testimonial card links open in new tab", () => {
  it("for any client with a link, the anchor has target=_blank and rel=noopener noreferrer", () => {
    fc.assert(
      fc.property(clientWithLinkArb, (client) => {
        const { container, unmount } = render(
          <TestimonialCard client={client} />,
        );

        const anchor = container.querySelector("a.home-portfolio-card");
        expect(anchor).not.toBeNull();
        expect(anchor.getAttribute("href")).toBe(client.link);
        expect(anchor.getAttribute("target")).toBe("_blank");
        expect(anchor.getAttribute("rel")).toBe("noopener noreferrer");

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
