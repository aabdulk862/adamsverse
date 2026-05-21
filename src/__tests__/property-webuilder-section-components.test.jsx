// Feature: adverse-webuilder, Property 8: Section components handle partial content gracefully
// Feature: adverse-webuilder, Property 9: Layout variant fallback
// **Validates: Requirements 4.5, 4.7, 5.6**

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";
import Hero from "../components/packages/Hero";
import Services from "../components/packages/Services";
import Gallery from "../components/packages/Gallery";
import Testimonials from "../components/packages/Testimonials";
import CTA from "../components/packages/CTA";
import ContactSection from "../components/packages/ContactSection";

// Mock IntersectionObserver for ContactSection (uses framer-motion useInView)
beforeAll(() => {
  global.IntersectionObserver = class {
    constructor(callback) {
      this._callback = callback;
    }
    observe() {
      // Immediately trigger as intersecting
      this._callback([{ isIntersecting: true, intersectionRatio: 1 }]);
    }
    unobserve() {}
    disconnect() {}
  };
});

afterAll(() => {
  delete global.IntersectionObserver;
});

// --- Generators ---

/** Arbitrary non-empty safe string for content fields */
const safeString = () => fc.stringMatching(/^[A-Za-z][A-Za-z0-9 ]{0,20}$/);

/** Arbitrary unknown layout string (not matching any known variant) */
const unknownLayoutArb = () =>
  fc.stringMatching(/^[a-z]{5,15}$/).filter(
    (s) =>
      s !== "professional" &&
      s !== "beauty" &&
      s !== "homeServices" &&
      s !== "foodHospitality"
  );

/** Partial hero content — each field is optionally present */
const partialHeroContentArb = () =>
  fc.record(
    {
      headline: safeString(),
      subheadline: safeString(),
      ctaText: safeString(),
      heroImage: fc.constant("https://via.placeholder.com/800"),
    },
    { requiredKeys: [] }
  );

/** Partial services content — heading optional, items optional or partial */
const partialServicesContentArb = () =>
  fc.record(
    {
      heading: safeString(),
      items: fc.array(
        fc.record(
          { title: safeString(), description: safeString(), icon: safeString() },
          { requiredKeys: [] }
        ),
        { minLength: 0, maxLength: 3 }
      ),
    },
    { requiredKeys: [] }
  );

/** Partial gallery content */
const partialGalleryContentArb = () =>
  fc.record(
    {
      heading: safeString(),
      images: fc.array(
        fc.record(
          { src: fc.constant("https://via.placeholder.com/300"), alt: safeString() },
          { requiredKeys: [] }
        ),
        { minLength: 0, maxLength: 3 }
      ),
    },
    { requiredKeys: [] }
  );

/** Partial testimonials content */
const partialTestimonialsContentArb = () =>
  fc.record(
    {
      heading: safeString(),
      items: fc.array(
        fc.record(
          { quote: safeString(), author: safeString(), role: safeString(), avatar: fc.constant("https://via.placeholder.com/50") },
          { requiredKeys: [] }
        ),
        { minLength: 0, maxLength: 3 }
      ),
    },
    { requiredKeys: [] }
  );

/** Partial CTA content */
const partialCtaContentArb = () =>
  fc.record(
    { heading: safeString(), body: safeString(), buttonText: safeString() },
    { requiredKeys: [] }
  );

/** Partial contact content */
const partialContactContentArb = () =>
  fc.record(
    {
      heading: safeString(),
      phone: safeString(),
      email: safeString(),
      address: safeString(),
      hours: safeString(),
    },
    { requiredKeys: [] }
  );

/** Content that is one of: undefined, empty object, or partial */
const contentVariantArb = (partialArb) =>
  fc.oneof(fc.constant(undefined), fc.constant({}), partialArb);

const emptyTheme = {};
const NUM_RUNS = 25;

// --- Property 8: Section components handle partial content gracefully ---

describe("Property 8: Section components handle partial content gracefully", () => {
  it("Hero renders without throwing for empty, partial, or undefined content", () => {
    fc.assert(
      fc.property(contentVariantArb(partialHeroContentArb()), (content) => {
        const { container, unmount } = render(
          <Hero content={content} theme={emptyTheme} layout="professional" packageName="Test" />
        );

        // Should not display the literal string "undefined"
        expect(container.textContent).not.toContain("undefined");
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("Services renders without throwing for empty, partial, or undefined content", () => {
    fc.assert(
      fc.property(contentVariantArb(partialServicesContentArb()), (content) => {
        const { container, unmount } = render(
          <Services content={content} theme={emptyTheme} layout="professional" />
        );

        expect(container.textContent).not.toContain("undefined");
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("Gallery renders without throwing for empty, partial, or undefined content", () => {
    fc.assert(
      fc.property(contentVariantArb(partialGalleryContentArb()), (content) => {
        const { container, unmount } = render(
          <Gallery content={content} theme={emptyTheme} layout="professional" />
        );

        expect(container.textContent).not.toContain("undefined");
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("Testimonials renders without throwing for empty, partial, or undefined content", () => {
    fc.assert(
      fc.property(contentVariantArb(partialTestimonialsContentArb()), (content) => {
        const { container, unmount } = render(
          <Testimonials content={content} theme={emptyTheme} layout="professional" />
        );

        expect(container.textContent).not.toContain("undefined");
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("CTA renders without throwing for empty, partial, or undefined content", () => {
    fc.assert(
      fc.property(contentVariantArb(partialCtaContentArb()), (content) => {
        const { container, unmount } = render(
          <CTA content={content} theme={emptyTheme} layout="professional" />
        );

        expect(container.textContent).not.toContain("undefined");
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("ContactSection renders without throwing for empty, partial, or undefined content", () => {
    fc.assert(
      fc.property(contentVariantArb(partialContactContentArb()), (content) => {
        const { container, unmount } = render(
          <ContactSection content={content} theme={emptyTheme} layout="professional" packageName="Test" />
        );

        expect(container.textContent).not.toContain("undefined");
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// --- Property 9: Layout variant fallback ---

describe("Property 9: Layout variant fallback", () => {
  it("Hero falls back to default layout for unknown layout strings", () => {
    fc.assert(
      fc.property(unknownLayoutArb(), (layout) => {
        const content = { headline: "Hello", subheadline: "World", ctaText: "Click" };
        const { container, unmount } = render(
          <Hero content={content} theme={emptyTheme} layout={layout} packageName="Test" />
        );

        // Should render without crashing and produce content
        expect(container.textContent).toContain("Hello");
        expect(container.textContent).not.toContain("undefined");
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("Services falls back to default layout for unknown layout strings", () => {
    fc.assert(
      fc.property(unknownLayoutArb(), (layout) => {
        const content = { heading: "Our Services", items: [{ title: "Service A", description: "Desc" }] };
        const { container, unmount } = render(
          <Services content={content} theme={emptyTheme} layout={layout} />
        );

        expect(container.textContent).toContain("Our Services");
        expect(container.textContent).not.toContain("undefined");
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("Gallery falls back to default layout for unknown layout strings", () => {
    fc.assert(
      fc.property(unknownLayoutArb(), (layout) => {
        const content = { heading: "Gallery", images: [{ src: "https://example.com/img.jpg", alt: "Photo" }] };
        const { container, unmount } = render(
          <Gallery content={content} theme={emptyTheme} layout={layout} />
        );

        expect(container.textContent).toContain("Gallery");
        expect(container.textContent).not.toContain("undefined");
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("Testimonials falls back to default layout for unknown layout strings", () => {
    fc.assert(
      fc.property(unknownLayoutArb(), (layout) => {
        const content = { heading: "Reviews", items: [{ quote: "Great!", author: "Jane", role: "Client" }] };
        const { container, unmount } = render(
          <Testimonials content={content} theme={emptyTheme} layout={layout} />
        );

        expect(container.textContent).toContain("Reviews");
        expect(container.textContent).not.toContain("undefined");
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("CTA falls back to default layout for unknown layout strings", () => {
    fc.assert(
      fc.property(unknownLayoutArb(), (layout) => {
        const content = { heading: "Get Started", body: "Join us", buttonText: "Sign Up" };
        const { container, unmount } = render(
          <CTA content={content} theme={emptyTheme} layout={layout} />
        );

        expect(container.textContent).toContain("Get Started");
        expect(container.textContent).not.toContain("undefined");
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it("ContactSection falls back to default layout for unknown layout strings", () => {
    fc.assert(
      fc.property(unknownLayoutArb(), (layout) => {
        const content = { heading: "Contact Us", phone: "555-0100", email: "hi@test.com" };
        const { container, unmount } = render(
          <ContactSection content={content} theme={emptyTheme} layout={layout} packageName="Test" />
        );

        expect(container.textContent).toContain("Contact Us");
        expect(container.textContent).not.toContain("undefined");
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
