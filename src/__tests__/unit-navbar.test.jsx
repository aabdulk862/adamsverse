import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../components/Navbar";

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

  it('has CTA button with "Contact" text', () => {
    renderNavbar();
    const ctaLinks = screen.getAllByText("Contact");
    expect(ctaLinks.length).toBeGreaterThan(0);
    // At least one should have the navbar-cta class
    const hasCta = ctaLinks.some((el) => el.classList.contains("navbar-cta"));
    expect(hasCta).toBe(true);
  });

  it("has navigation links: Home, About, Portfolio, Services, Learn", () => {
    renderNavbar();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Learn")).toBeInTheDocument();
  });
});
