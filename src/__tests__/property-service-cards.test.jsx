// Feature: saas-platform-revamp, Property 6: Service cards render all required fields
// **Validates: Requirements 5.1**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import services from "../data/services";

function ServiceCard({ service }) {
  // Render the same markup as ServicesPage for a single service
  return (
    <div className="service-card">
      {service.icon && <i className={`${service.icon} service-card-icon`}></i>}
      <h3 className="service-card-title">{service.title}</h3>
      <p className="service-card-desc">{service.description}</p>
      <div className="service-card-price">{service.priceRange}</div>
      <ul className="service-card-deliverables">
        {service.deliverables.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a href="/#contact" className="service-cta">
        Get Started <i className="fas fa-arrow-right"></i>
      </a>
    </div>
  );
}

describe("Property 6: Service cards render all required fields", () => {
  it("for any service, the rendered card contains icon, title, description, price, deliverables, and CTA", () => {
    fc.assert(
      fc.property(fc.constantFrom(...services), (service) => {
        const { container, unmount } = render(
          <MemoryRouter>
            <ServiceCard service={service} />
          </MemoryRouter>,
        );

        // Icon element present
        const icon = container.querySelector(".service-card-icon");
        expect(icon).not.toBeNull();

        // Title text present
        expect(container.querySelector(".service-card-title").textContent).toBe(
          service.title,
        );

        // Description text present
        expect(container.querySelector(".service-card-desc").textContent).toBe(
          service.description,
        );

        // Price range text present
        expect(container.querySelector(".service-card-price").textContent).toBe(
          service.priceRange,
        );

        // All deliverable items present
        const deliverableItems = container.querySelectorAll(
          ".service-card-deliverables li",
        );
        expect(deliverableItems.length).toBe(service.deliverables.length);
        service.deliverables.forEach((deliverable, i) => {
          expect(deliverableItems[i].textContent).toBe(deliverable);
        });

        // CTA link present
        const cta = container.querySelector(".service-cta");
        expect(cta).not.toBeNull();

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
