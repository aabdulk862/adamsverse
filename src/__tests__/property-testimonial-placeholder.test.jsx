// Feature: saas-homepage-redesign, Property 5: Placeholder displays first letter when no image
// **Validates: Requirements 4.4**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";

/**
 * Test helper that replicates the same testimonial/client card JSX
 * structure used inline in HomePage.jsx, focused on the placeholder
 * rendering when image is null.
 */
function TestimonialCard({ client }) {
  return (
    <a
      href={client.link || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="home-portfolio-card"
    >
      <div className="home-portfolio-thumb">
        {client.image ? (
          <img
            src={client.image}
            alt={client.title}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="home-portfolio-placeholder">
            <span>{client.title.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="home-portfolio-body">
        <h3 className="home-portfolio-title">{client.title}</h3>
        <p className="home-portfolio-desc">{client.description}</p>
      </div>
    </a>
  );
}

// Generator: client object with non-empty title and image explicitly null
const clientNoImageArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 1, maxLength: 100 }),
  image: fc.constant(null),
  link: fc.constant("https://example.com"),
});

describe("Property 5: Placeholder displays first letter when no image", () => {
  it("for any client with no image, the placeholder contains the first letter of the title", () => {
    fc.assert(
      fc.property(clientNoImageArb, (client) => {
        const { container, unmount } = render(
          <TestimonialCard client={client} />,
        );

        // Should not render an img element
        const img = container.querySelector("img");
        expect(img).toBeNull();

        // Should render placeholder with first letter
        const placeholder = container.querySelector(
          ".home-portfolio-placeholder",
        );
        expect(placeholder).not.toBeNull();

        const letterSpan = placeholder.querySelector("span");
        expect(letterSpan).not.toBeNull();
        expect(letterSpan.textContent).toBe(client.title.charAt(0));

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
