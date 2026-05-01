// Feature: ai-website-packages, Property 14: Package data shape validity
// **Validates: Requirements 8.1, 8.5**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import packages from "../data/packages";

describe("Property 14: Package data shape validity", () => {
  it("every package has slug, name, and description as non-empty strings", () => {
    fc.assert(
      fc.property(fc.constantFrom(...packages), (pkg) => {
        expect(typeof pkg.slug).toBe("string");
        expect(pkg.slug.length).toBeGreaterThan(0);

        expect(typeof pkg.name).toBe("string");
        expect(pkg.name.length).toBeGreaterThan(0);

        expect(typeof pkg.description).toBe("string");
        expect(pkg.description.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it("every package has a sections object with all required section keys", () => {
    fc.assert(
      fc.property(fc.constantFrom(...packages), (pkg) => {
        expect(pkg.sections).toBeDefined();
        expect(typeof pkg.sections).toBe("object");

        const requiredSections = [
          "hero",
          "services",
          "gallery",
          "testimonials",
          "cta",
        ];
        for (const key of requiredSections) {
          expect(pkg.sections).toHaveProperty(key);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("every package hero section has headline, subheadline, and ctaText as strings", () => {
    fc.assert(
      fc.property(fc.constantFrom(...packages), (pkg) => {
        const { hero } = pkg.sections;
        expect(typeof hero.headline).toBe("string");
        expect(hero.headline.length).toBeGreaterThan(0);

        expect(typeof hero.subheadline).toBe("string");
        expect(hero.subheadline.length).toBeGreaterThan(0);

        expect(typeof hero.ctaText).toBe("string");
        expect(hero.ctaText.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it("every package services section has heading and items array with title and description", () => {
    fc.assert(
      fc.property(fc.constantFrom(...packages), (pkg) => {
        const { services } = pkg.sections;
        expect(typeof services.heading).toBe("string");
        expect(services.heading.length).toBeGreaterThan(0);

        expect(Array.isArray(services.items)).toBe(true);
        expect(services.items.length).toBeGreaterThan(0);

        for (const item of services.items) {
          expect(typeof item.title).toBe("string");
          expect(item.title.length).toBeGreaterThan(0);

          expect(typeof item.description).toBe("string");
          expect(item.description.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("every package gallery section has heading and images array with src and alt", () => {
    fc.assert(
      fc.property(fc.constantFrom(...packages), (pkg) => {
        const { gallery } = pkg.sections;
        expect(typeof gallery.heading).toBe("string");
        expect(gallery.heading.length).toBeGreaterThan(0);

        expect(Array.isArray(gallery.images)).toBe(true);
        expect(gallery.images.length).toBeGreaterThan(0);

        for (const image of gallery.images) {
          expect(typeof image.src).toBe("string");
          expect(image.src.length).toBeGreaterThan(0);

          expect(typeof image.alt).toBe("string");
          expect(image.alt.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("every package testimonials section has heading and items array with quote, author, and role", () => {
    fc.assert(
      fc.property(fc.constantFrom(...packages), (pkg) => {
        const { testimonials } = pkg.sections;
        expect(typeof testimonials.heading).toBe("string");
        expect(testimonials.heading.length).toBeGreaterThan(0);

        expect(Array.isArray(testimonials.items)).toBe(true);
        expect(testimonials.items.length).toBeGreaterThan(0);

        for (const item of testimonials.items) {
          expect(typeof item.quote).toBe("string");
          expect(item.quote.length).toBeGreaterThan(0);

          expect(typeof item.author).toBe("string");
          expect(item.author.length).toBeGreaterThan(0);

          expect(typeof item.role).toBe("string");
          expect(item.role.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("every package cta section has heading, body, and buttonText as strings", () => {
    fc.assert(
      fc.property(fc.constantFrom(...packages), (pkg) => {
        const { cta } = pkg.sections;
        expect(typeof cta.heading).toBe("string");
        expect(cta.heading.length).toBeGreaterThan(0);

        expect(typeof cta.body).toBe("string");
        expect(cta.body.length).toBeGreaterThan(0);

        expect(typeof cta.buttonText).toBe("string");
        expect(cta.buttonText.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});
