import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../components/Navbar";

// Mock @clerk/clerk-react so Navbar doesn't require ClerkProvider
vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ isLoaded: true, isSignedIn: false, getToken: vi.fn() }),
  useUser: () => ({ isLoaded: true, isSignedIn: false, user: null }),
  useClerk: () => ({ signOut: vi.fn() }),
  ClerkProvider: ({ children }) => children,
  SignIn: () => <div data-testid="clerk-sign-in" />,
  SignUp: () => <div data-testid="clerk-sign-up" />,
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

  it("has navigation links: About, Packages, Services", () => {
    renderNavbar();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Packages")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
  });

  it('hides "Sign In" link when auth is disabled', () => {
    renderNavbar();
    expect(screen.queryByText("Sign In")).toBeNull();
  });
});
