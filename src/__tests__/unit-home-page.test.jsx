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

  it("has ProfileHeader (hero section)", () => {
    const { container } = renderHome();
    expect(container.querySelector(".hero")).toBeInTheDocument();
  });

  it("has Services Overview section with service cards", () => {
    const { container } = renderHome();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(container.querySelector(".home-services-grid")).toBeInTheDocument();
    const serviceCards = container.querySelectorAll(".home-service-card");
    expect(serviceCards.length).toBeGreaterThan(0);
  });

  it("has Clients section with client cards", () => {
    const { container } = renderHome();
    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(container.querySelector(".home-portfolio-grid")).toBeInTheDocument();
    const portfolioCards = container.querySelectorAll(".home-portfolio-card");
    expect(portfolioCards.length).toBeGreaterThan(0);
  });

  it("does not have a contact form on the home page", () => {
    renderHome();
    expect(screen.queryByText("Get in Touch")).toBeNull();
    expect(screen.queryByText(/Send Message/i)).toBeNull();
  });

  // --- New tests for SaaS homepage redesign (Requirements 8.1, 2.2, 3.2, 7.1, 1.7, 10.3, 10.4) ---

  it("renders sections in correct order: Hero → Social Proof → Services → AI Banner → Testimonials → Why Adverse → Final CTA", () => {
    const { container } = renderHome();

    const hero = container.querySelector(".hero");
    const socialProof = container.querySelector(".social-proof-bar");
    const servicesSection = container.querySelector("#services-overview");
    const aiBanner = container.querySelector(".ai-cta-banner");
    const clientsSection = container.querySelector("#clients");
    const whyAdverse = container.querySelector("#why-adverse");
    const finalCta = container.querySelector(".final-cta");

    // All sections must exist
    expect(hero).toBeInTheDocument();
    expect(socialProof).toBeInTheDocument();
    expect(servicesSection).toBeInTheDocument();
    expect(aiBanner).toBeInTheDocument();
    expect(clientsSection).toBeInTheDocument();
    expect(whyAdverse).toBeInTheDocument();
    expect(finalCta).toBeInTheDocument();

    // Verify DOM order using compareDocumentPosition
    const FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
    expect(hero.compareDocumentPosition(socialProof) & FOLLOWING).toBeTruthy();
    expect(
      socialProof.compareDocumentPosition(servicesSection) & FOLLOWING,
    ).toBeTruthy();
    expect(
      servicesSection.compareDocumentPosition(aiBanner) & FOLLOWING,
    ).toBeTruthy();
    expect(
      aiBanner.compareDocumentPosition(clientsSection) & FOLLOWING,
    ).toBeTruthy();
    expect(
      clientsSection.compareDocumentPosition(whyAdverse) & FOLLOWING,
    ).toBeTruthy();
    expect(
      whyAdverse.compareDocumentPosition(finalCta) & FOLLOWING,
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

  it("renders Final CTA section with link to /contact", () => {
    const { container } = renderHome();
    const finalCta = container.querySelector(".final-cta");
    expect(finalCta).toBeInTheDocument();

    // Has a headline
    const headline = finalCta.querySelector(".final-cta-headline");
    expect(headline).toBeInTheDocument();

    // Has a CTA link to /contact
    const ctaLink = finalCta.querySelector("a");
    expect(ctaLink).toHaveAttribute("href", "/contact");
  });

  it("displays price ranges on service cards", () => {
    const { container } = renderHome();
    const priceElements = container.querySelectorAll(".home-service-price");
    expect(priceElements.length).toBeGreaterThan(0);

    // Each price element should have non-empty text
    priceElements.forEach((el) => {
      expect(el.textContent.trim().length).toBeGreaterThan(0);
    });
  });

  it("does not render capability pills", () => {
    renderHome();
    expect(screen.queryByText("Web Development Services")).toBeNull();
    expect(screen.queryByText("Cloud Deployment & Infrastructure")).toBeNull();
    expect(screen.queryByText("Content Creation + Consulting")).toBeNull();
    expect(screen.queryByText("AI-Assisted Development")).toBeNull();
  });
});
