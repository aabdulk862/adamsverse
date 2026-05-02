// Feature: ai-website-packages, Property 11: Preview component content rendering
// **Validates: Requirements 6.3, 6.4, 6.5, 6.6, 6.7, 6.8**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";
import Hero from "../components/packages/Hero";
import Services from "../components/packages/Services";
import Gallery from "../components/packages/Gallery";
import Testimonials from "../components/packages/Testimonials";
import CTA from "../components/packages/CTA";

// --- Generators ---

/**
 * Non-empty alphanumeric string that is safe for DOM text matching.
 * Starts with a letter, followed by up to 30 alphanumeric/space chars.
 */
const safeString = () => fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ]{0,30}$/);

/**
 * Hero content: { headline, subheadline, ctaText }
 */
const heroContentArb = () =>
  fc.record({
    headline: safeString(),
    subheadline: safeString(),
    ctaText: safeString(),
  });

/**
 * Services content: { heading, items: [{ title, description }] }
 */
const servicesContentArb = () =>
  fc.record({
    heading: safeString(),
    items: fc.array(
      fc.record({
        title: safeString(),
        description: safeString(),
      }),
      { minLength: 1, maxLength: 5 },
    ),
  });

/**
 * Gallery content: { heading, images: [{ src, alt }] }
 * src uses a placeholder URL; alt is the text we verify.
 */
const galleryContentArb = () =>
  fc.record({
    heading: safeString(),
    images: fc.array(
      fc.record({
        src: fc.constant("https://via.placeholder.com/300"),
        alt: safeString(),
      }),
      { minLength: 1, maxLength: 5 },
    ),
  });

/**
 * Testimonials content: { heading, items: [{ quote, author, role }] }
 */
const testimonialsContentArb = () =>
  fc.record({
    heading: safeString(),
    items: fc.array(
      fc.record({
        quote: safeString(),
        author: safeString(),
        role: safeString(),
      }),
      { minLength: 1, maxLength: 5 },
    ),
  });

/**
 * CTA content: { heading, body, buttonText }
 */
const ctaContentArb = () =>
  fc.record({
    heading: safeString(),
    body: safeString(),
    buttonText: safeString(),
  });

const emptyTheme = {};

// --- Tests ---

describe("Property 11: Preview component content rendering", () => {
  it("Hero renders headline, subheadline, and ctaText in the output", () => {
    fc.assert(
      fc.property(heroContentArb(), (content) => {
        const { container, unmount } = render(
          <Hero content={content} theme={emptyTheme} />,
        );

        const text = container.textContent;
        expect(text).toContain(content.headline);
        expect(text).toContain(content.subheadline);
        expect(text).toContain(content.ctaText);

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it("Services renders heading and all item titles and descriptions", () => {
    fc.assert(
      fc.property(servicesContentArb(), (content) => {
        const { container, unmount } = render(
          <Services content={content} theme={emptyTheme} />,
        );

        const text = container.textContent;
        expect(text).toContain(content.heading);

        for (const item of content.items) {
          expect(text).toContain(item.title);
          expect(text).toContain(item.description);
        }

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it("Gallery renders heading and all image alt texts", () => {
    fc.assert(
      fc.property(galleryContentArb(), (content) => {
        const { container, unmount } = render(
          <Gallery content={content} theme={emptyTheme} />,
        );

        const text = container.textContent;
        expect(text).toContain(content.heading);

        const images = container.querySelectorAll("img");
        expect(images.length).toBe(content.images.length);

        for (let i = 0; i < content.images.length; i++) {
          expect(images[i].getAttribute("alt")).toBe(content.images[i].alt);
        }

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it("Testimonials renders heading and all item quotes, authors, and roles", () => {
    fc.assert(
      fc.property(testimonialsContentArb(), (content) => {
        const { container, unmount } = render(
          <Testimonials content={content} theme={emptyTheme} />,
        );

        const text = container.textContent;
        expect(text).toContain(content.heading);

        for (const item of content.items) {
          expect(text).toContain(item.quote);
          expect(text).toContain(item.author);
          expect(text).toContain(item.role);
        }

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it("CTA renders heading, body, and buttonText in the output", () => {
    fc.assert(
      fc.property(ctaContentArb(), (content) => {
        const { container, unmount } = render(
          <CTA content={content} theme={emptyTheme} />,
        );

        const text = container.textContent;
        expect(text).toContain(content.heading);
        expect(text).toContain(content.body);
        expect(text).toContain(content.buttonText);

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
