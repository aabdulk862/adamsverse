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

  it('has headline "Software Solutions That Drive Results"', () => {
    renderHero();
    expect(screen.getByText(/Software Solutions That/i)).toBeInTheDocument();
    expect(screen.getByText(/Drive Results/i)).toBeInTheDocument();
  });

  it('has "Get Started" and "View Services" CTA buttons', () => {
    renderHero();
    expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
    expect(screen.getByText(/View Services/i)).toBeInTheDocument();
  });

  it("has feature highlights: Full-Stack Development, Cloud Architecture, Technical Consulting", () => {
    renderHero();
    expect(screen.getByText("Full-Stack Development")).toBeInTheDocument();
    expect(screen.getByText("Cloud Architecture")).toBeInTheDocument();
    expect(screen.getByText("Technical Consulting")).toBeInTheDocument();
  });

  it('has trust indicators: "20+", "3+", "50+"', () => {
    renderHero();
    expect(screen.getByText("20+")).toBeInTheDocument();
    expect(screen.getByText("3+")).toBeInTheDocument();
    expect(screen.getByText("50+")).toBeInTheDocument();
  });
});
