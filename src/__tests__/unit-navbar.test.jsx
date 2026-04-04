import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../components/Navbar";

// Mock useAuth hook
vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    loading: false,
    isAdmin: false,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe("15.3 Navbar", () => {
  const renderNavbar = () =>
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

  it('does not have a "More" button or dropdown', () => {
    renderNavbar();
    expect(screen.queryByText(/More/i)).toBeNull();
  });

  it('has CTA button with "Get in Touch" text', () => {
    renderNavbar();
    const ctaLinks = screen.getAllByText("Get in Touch");
    expect(ctaLinks.length).toBeGreaterThan(0);
    const hasCta = ctaLinks.some((el) => el.classList.contains("navbar-cta"));
    expect(hasCta).toBe(true);
  });

  it("has navigation links: About, Portfolio, Services, Learn", () => {
    renderNavbar();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Learn")).toBeInTheDocument();
  });

  it('shows "Sign In" link when unauthenticated', () => {
    renderNavbar();
    expect(screen.getAllByText("Sign In").length).toBeGreaterThan(0);
  });
});
