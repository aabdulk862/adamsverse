import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";

// Mock framer-motion
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

describe("15.2 Home Page Structure", () => {
  const renderHome = () =>
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

  it("does not render a Banner component (.banner class)", () => {
    const { container } = renderHome();
    expect(container.querySelector(".banner")).toBeNull();
  });

  it('does not render Discord section (no "Discord" or "Enter the Verse" text)', () => {
    renderHome();
    expect(screen.queryByText(/Discord/i)).toBeNull();
    expect(screen.queryByText(/Enter the Verse/i)).toBeNull();
  });

  it('does not render "Content & Socials" section', () => {
    renderHome();
    expect(screen.queryByText(/Content & Socials/i)).toBeNull();
  });

  it('does not render "Support" section (no "Cash App" or "Venmo" text)', () => {
    renderHome();
    expect(screen.queryByText(/Cash App/i)).toBeNull();
    expect(screen.queryByText(/Venmo/i)).toBeNull();
  });

  it("has HeroSection (hero section)", () => {
    const { container } = renderHome();
    expect(container.querySelector(".hero-section")).toBeInTheDocument();
  });

  it("has Services section", () => {
    const { container } = renderHome();
    expect(container.querySelector(".services-section")).toBeInTheDocument();
  });

  it("does not render legacy Clients section (removed in multi-product redesign)", () => {
    renderHome();
    expect(screen.queryByText("Clients")).toBeNull();
  });

  it("does not have a contact form on the home page", () => {
    renderHome();
    expect(screen.queryByText("Get in Touch")).toBeNull();
    expect(screen.queryByText(/Send Message/i)).toBeNull();
  });

  // --- New tests for component-based homepage (Requirements 1.1, 1.2, 1.6, 4.8) ---

  it("wraps content in a <main> element with product-hub class", () => {
    const { container } = renderHome();
    const main = container.querySelector("main.product-hub");
    expect(main).toBeInTheDocument();
  });

  it("renders sections in correct order: Hero → SocialProof → ProductGrid → Packages → Services → CTA", () => {
    const { container } = renderHome();

    const hero = container.querySelector(".hero-section");
    const socialProof = container.querySelector(".social-proof-bar");
    const productGrid = container.querySelector(".product-grid");
    const packagesSection = container.querySelector(".packages-showcase");
    const servicesSection = container.querySelector(".services-section");
    const ctaSection = container.querySelector(".cta-section");

    // All sections must exist
    expect(hero).toBeInTheDocument();
    expect(socialProof).toBeInTheDocument();
    expect(productGrid).toBeInTheDocument();
    expect(packagesSection).toBeInTheDocument();
    expect(servicesSection).toBeInTheDocument();
    expect(ctaSection).toBeInTheDocument();

    // Verify DOM order using compareDocumentPosition
    const FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
    expect(hero.compareDocumentPosition(socialProof) & FOLLOWING).toBeTruthy();
    expect(
      socialProof.compareDocumentPosition(productGrid) & FOLLOWING,
    ).toBeTruthy();
    expect(
      productGrid.compareDocumentPosition(packagesSection) & FOLLOWING,
    ).toBeTruthy();
    expect(
      packagesSection.compareDocumentPosition(servicesSection) & FOLLOWING,
    ).toBeTruthy();
    expect(
      servicesSection.compareDocumentPosition(ctaSection) & FOLLOWING,
    ).toBeTruthy();
  });

  it("renders Social Proof Bar with metrics", () => {
    const { container } = renderHome();
    const bar = container.querySelector(".social-proof-bar");
    expect(bar).toBeInTheDocument();

    const metrics = bar.querySelectorAll(".social-proof-metric");
    expect(metrics.length).toBeGreaterThanOrEqual(3);

    // Each metric has a value and label
    metrics.forEach((metric) => {
      expect(metric.querySelector(".social-proof-value")).toBeInTheDocument();
      expect(metric.querySelector(".social-proof-label")).toBeInTheDocument();
    });
  });

  it("renders CTA section with link to /contact", () => {
    const { container } = renderHome();
    const ctaSection = container.querySelector(".cta-section");
    expect(ctaSection).toBeInTheDocument();

    // Has a CTA link to /contact
    const ctaLink = ctaSection.querySelector("a");
    expect(ctaLink).toHaveAttribute("href", "/contact");
  });

  it("does not render legacy AI Banner section (removed in multi-product redesign)", () => {
    const { container } = renderHome();
    expect(container.querySelector(".ai-cta-banner")).toBeNull();
  });

  it("does not render legacy Why Adverse section (removed in multi-product redesign)", () => {
    const { container } = renderHome();
    expect(container.querySelector("#why-adverse")).toBeNull();
  });

  it("renders ProductGrid with product cards", () => {
    const { container } = renderHome();
    const grid = container.querySelector(".product-grid");
    expect(grid).toBeInTheDocument();
  });

  it("does not render capability pills", () => {
    renderHome();
    expect(screen.queryByText("Web Development Services")).toBeNull();
    expect(screen.queryByText("Cloud Deployment & Infrastructure")).toBeNull();
    expect(screen.queryByText("Content Creation + Consulting")).toBeNull();
    expect(screen.queryByText("AI-Assisted Development")).toBeNull();
  });
});
