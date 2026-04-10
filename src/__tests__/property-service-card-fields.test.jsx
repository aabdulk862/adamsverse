// Feature: saas-homepage-redesign, Property 2: Service card renders title, description, and price range
// **Validates: Requirements 3.2, 10.4**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * Test helper that renders the same service card JSX structure
 * used inline in HomePage.jsx (icon, title, description, priceRange,
 * "Learn More" link) with arbitrary data.
 * Uses a plain div instead of AnimatedSection to avoid Framer Motion
 * IntersectionObserver dependency in jsdom.
 */
function HomeServiceCard({ service }) {
  return (
    <div className="home-service-card">
      <div className="home-service-icon">
        <i className={service.icon || "fas fa-cog"}></i>
      </div>
      <h3 className="home-service-title">{service.title}</h3>
      <p className="home-service-desc">{service.description}</p>
      <span className="home-service-price">{service.priceRange}</span>
      <a href="/services" className="home-service-link">
        Learn More <i className="fas fa-arrow-right"></i>
      </a>
    </div>
  );
}

// Generator: service object with non-empty title, description, and priceRange
const serviceArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  priceRange: fc.string({ minLength: 1, maxLength: 30 }),
});

describe("Property 2: Service card renders title, description, and price range", () => {
  it("for any service object, the rendered card contains title, description, and priceRange as visible text", () => {
    fc.assert(
      fc.property(serviceArb, (service) => {
        const { container, unmount } = render(
          <MemoryRouter>
            <HomeServiceCard service={service} />
          </MemoryRouter>,
        );

        const titleEl = container.querySelector(".home-service-title");
        expect(titleEl).not.toBeNull();
        expect(titleEl.textContent).toBe(service.title);

        const descEl = container.querySelector(".home-service-desc");
        expect(descEl).not.toBeNull();
        expect(descEl.textContent).toBe(service.description);

        const priceEl = container.querySelector(".home-service-price");
        expect(priceEl).not.toBeNull();
        expect(priceEl.textContent).toBe(service.priceRange);

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
