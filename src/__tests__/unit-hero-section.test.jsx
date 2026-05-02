import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader";

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

function filterDomProps(props) {
  const { initial, animate, transition, whileInView, viewport, ...rest } =
    props;
  return rest;
}

describe("15.1 Hero Section (ProfileHeader)", () => {
  const renderHero = () =>
    render(
      <MemoryRouter>
        <ProfileHeader />
      </MemoryRouter>,
    );

  it("does not render glow orbs (hero-glow--1 or hero-glow--2)", () => {
    const { container } = renderHero();
    expect(container.querySelector(".hero-glow--1")).toBeNull();
    expect(container.querySelector(".hero-glow--2")).toBeNull();
  });

  it('does not render "Powered by" or "Adverse LLC" text', () => {
    renderHero();
    expect(screen.queryByText(/Powered by/i)).toBeNull();
    expect(screen.queryByText(/Adverse LLC/i)).toBeNull();
  });

  it('has headline "We build the software. You run the business."', () => {
    renderHero();
    expect(screen.getByText(/We build the/i)).toBeInTheDocument();
    expect(screen.getByText(/You run the/i)).toBeInTheDocument();
  });

  it('has "Start a project" and "See our work" CTA buttons', () => {
    renderHero();
    expect(screen.getByText(/Start a project/i)).toBeInTheDocument();
    expect(screen.getByText(/See our work/i)).toBeInTheDocument();
  });

  it("does not render capability pills", () => {
    renderHero();
    expect(screen.queryByText("Web Development Services")).toBeNull();
    expect(screen.queryByText("Cloud Deployment & Infrastructure")).toBeNull();
    expect(screen.queryByText("Content Creation + Consulting")).toBeNull();
    expect(screen.queryByText("AI-Assisted Development")).toBeNull();
  });

  it("renders trust tagline instead of capability pills", () => {
    renderHero();
    expect(
      screen.getByText(
        /Transparent pricing · Full-stack ownership · No agency overhead/i,
      ),
    ).toBeInTheDocument();
  });

  it("uses React Router Link components for CTAs", () => {
    const { container } = renderHero();
    const primaryCta = screen.getByText(/Start a project/i).closest("a");
    const ghostCta = screen.getByText(/See our work/i).closest("a");
    expect(primaryCta).toHaveAttribute("href", "/contact");
    expect(ghostCta).toHaveAttribute("href", "/portfolio");
  });

  it("does not render old trust indicators", () => {
    renderHero();
    expect(screen.queryByText("20+")).toBeNull();
    expect(screen.queryByText("50+")).toBeNull();
  });
});
