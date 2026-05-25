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
    expect(container.querySelector("[aria-labelledby='hero-heading']")).toBeInTheDocument();
  });

  it("has Services section", () => {
    const { container } = renderHome();
    expect(container.querySelector("[aria-labelledby='services-heading']")).toBeInTheDocument();
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

  it("wraps content in a <main> element", () => {
    const { container } = renderHome();
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
  });

  it("renders sections in correct order: Hero → SocialProof → ProductGrid → Packages → Services → CTA", () => {
    const { container } = renderHome();

    const hero = container.querySelector("[aria-labelledby='hero-heading']");
    const socialProof = container.querySelector("[aria-label='Core capabilities']");
    const productGrid = container.querySelector("[aria-label='Our Products']");
    const packagesSection = container.querySelector("[aria-labelledby='packages-showcase-heading']");
    const servicesSection = container.querySelector("[aria-labelledby='services-heading']");
    const ctaSection = container.querySelector("[aria-labelledby='cta-heading']");

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
    const bar = container.querySelector("[aria-label='Core capabilities']");
    expect(bar).toBeInTheDocument();

    // Each metric is rendered inside an AnimatedSection (motion.div)
    // with a value (icon) and label span
    const values = bar.querySelectorAll("span i");
    const labels = bar.querySelectorAll("span:last-child");
    expect(values.length).toBeGreaterThanOrEqual(3);
  });

  it("renders CTA section with link to /contact", () => {
    const { container } = renderHome();
    const ctaSection = container.querySelector("[aria-labelledby='cta-heading']");
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
    const grid = container.querySelector("[aria-label='Our Products']");
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
