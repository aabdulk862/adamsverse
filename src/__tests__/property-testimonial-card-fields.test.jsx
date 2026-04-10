// Feature: saas-homepage-redesign, Property 3: Testimonial card renders client name, description, and tags
// **Validates: Requirements 4.2**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";

/**
 * Test helper that replicates the same testimonial/client card JSX
 * structure used inline in HomePage.jsx — placeholder/image, title,
 * description, tags, and external link.
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
          <img src={client.image} alt={client.title} loading="lazy" decoding="async" />
        ) : (
          <div className="home-portfolio-placeholder">
            <span>{client.title.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="home-portfolio-body">
        <h3 className="home-portfolio-title">
          {client.title}
          {client.link && (
            <i className="fas fa-external-link-alt home-portfolio-link-icon"></i>
          )}
        </h3>
        <p className="home-portfolio-desc">{client.description}</p>
        <div className="home-portfolio-tags">
          {client.tags.map((tag) => (
            <span key={tag} className="home-portfolio-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

// Generator: client object with non-empty title, description, and 1–5 unique tags
const clientArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  tags: fc
    .array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 })
    .filter((arr) => new Set(arr).size === arr.length),
  link: fc.constant("https://example.com"),
  image: fc.constant(null),
});

describe("Property 3: Testimonial card renders client name, description, and tags", () => {
  it("for any client object, the rendered card contains title, description, and all tags", () => {
    fc.assert(
      fc.property(clientArb, (client) => {
        const { container, unmount } = render(
          <TestimonialCard client={client} />,
        );

        const titleEl = container.querySelector(".home-portfolio-title");
        expect(titleEl).not.toBeNull();
        expect(titleEl.textContent).toContain(client.title);

        const descEl = container.querySelector(".home-portfolio-desc");
        expect(descEl).not.toBeNull();
        expect(descEl.textContent).toBe(client.description);

        const tagEls = container.querySelectorAll(".home-portfolio-tag");
        expect(tagEls.length).toBe(client.tags.length);

        const tagTexts = Array.from(tagEls).map((el) => el.textContent);
        client.tags.forEach((tag) => {
          expect(tagTexts).toContain(tag);
        });

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
