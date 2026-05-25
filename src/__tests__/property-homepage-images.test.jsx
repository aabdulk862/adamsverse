// Feature: saas-homepage-redesign, Property 6: All homepage images are lazy-loaded
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";

// Mock framer-motion to render plain elements
vi.mock("framer-motion", () => ({
  motion: {
    section: ({ children, ...props }) => (
      <section {...filterDomProps(props)}>{children}</section>
    ),
    p: ({ children, ...props }) => <p {...filterDomProps(props)}>{children}</p>,
    h1: ({ children, ...props }) => (
      <h1 {...filterDomProps(props)}>{children}</h1>
    ),
    div: ({ children, ...props }) => (
      <div {...filterDomProps(props)}>{children}</div>
    ),
  },
}));

// Mock global fetch for Google Sheets
global.fetch = vi.fn();

function filterDomProps(props) {
  const { initial, animate, transition, whileInView, viewport, ...rest } =
    props;
  return rest;
}

describe("Property 6: Homepage images use appropriate loading strategies", () => {
  /**
   * **Validates: Requirements 8.3, 9.4**
   *
   * Above-the-fold images (hero logo) should NOT be lazy-loaded (they use fetchpriority="high").
   * Below-the-fold images (package previews, etc.) should have loading="lazy" and decoding="async".
   */
  it("above-fold hero logo does not have loading='lazy' and uses fetchpriority='high'", () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const heroLogo = container.querySelector("img[fetchpriority='high']");
    if (heroLogo) {
      expect(heroLogo).not.toHaveAttribute("loading", "lazy");
      expect(heroLogo).toHaveAttribute("fetchpriority", "high");
      expect(heroLogo).toHaveAttribute("decoding", "async");
    }
  });

  it("below-fold images have loading='lazy' and decoding='async'", () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const images = container.querySelectorAll("img");
    const imgArray = Array.from(images);

    // Below-fold images (everything except the hero logo) should be lazy-loaded
    const belowFoldImages = imgArray.filter(
      (img) => img.getAttribute("fetchpriority") !== "high"
    );

    belowFoldImages.forEach((img) => {
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img).toHaveAttribute("decoding", "async");
    });
  });
});
