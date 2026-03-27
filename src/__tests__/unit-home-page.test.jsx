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

// Mock emailjs-com
vi.mock("emailjs-com", () => ({
  default: { sendForm: vi.fn() },
}));

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
    // Should have service cards
    const serviceCards = container.querySelectorAll(".home-service-card");
    expect(serviceCards.length).toBeGreaterThan(0);
  });

  it("has Portfolio Highlights section with portfolio cards", () => {
    const { container } = renderHome();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(container.querySelector(".home-portfolio-grid")).toBeInTheDocument();
    const portfolioCards = container.querySelectorAll(".home-portfolio-card");
    expect(portfolioCards.length).toBeGreaterThan(0);
  });

  it("has Contact Form section", () => {
    renderHome();
    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
    expect(screen.getByText(/Send Message/i)).toBeInTheDocument();
  });
});
