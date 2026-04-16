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

describe("Property 6: All homepage images are lazy-loaded", () => {
  /**
   * **Validates: Requirements 9.4**
   *
   * For any rendered state of the HomePage, every <img> element
   * should have loading="lazy" and decoding="async" attributes.
   */
  it("every <img> element has loading='lazy' and decoding='async'", () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const images = container.querySelectorAll("img");

    // If there are images, each must be lazy-loaded
    images.forEach((img) => {
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img).toHaveAttribute("decoding", "async");
    });
  });

  it("client images with non-null src render with lazy loading", () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    const images = container.querySelectorAll("img");
    const imgArray = Array.from(images);

    // Every image that has a src should also have lazy attributes
    imgArray
      .filter((img) => img.getAttribute("src"))
      .forEach((img) => {
        expect(img).toHaveAttribute("loading", "lazy");
        expect(img).toHaveAttribute("decoding", "async");
      });
  });
});
