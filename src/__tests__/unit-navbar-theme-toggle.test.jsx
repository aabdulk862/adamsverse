import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ThemeProvider } from "../context/ThemeContext";

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

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    </MemoryRouter>
  );

describe("4.4 Navbar theme toggle", () => {
  it("toggle button renders in desktop nav between last link and CTA", () => {
    const { container } = renderNavbar();

    // Find the desktop .navbar-links list
    const navbarLinks = container.querySelector(".navbar-links");
    expect(navbarLinks).not.toBeNull();

    const items = Array.from(navbarLinks.querySelectorAll(":scope > li"));

    // Find indices by content
    const learnIndex = items.findIndex((li) => li.textContent.includes("Learn"));
    const toggleIndex = items.findIndex((li) => li.querySelector(".theme-toggle"));
    const ctaIndex = items.findIndex((li) => li.querySelector(".navbar-cta"));

    expect(learnIndex).toBeGreaterThanOrEqual(0);
    expect(toggleIndex).toBeGreaterThanOrEqual(0);
    expect(ctaIndex).toBeGreaterThanOrEqual(0);

    // Toggle should come after Learn and before CTA
    expect(toggleIndex).toBe(learnIndex + 1);
    expect(toggleIndex).toBe(ctaIndex - 1);

    // Desktop toggle should have "theme-toggle" but NOT "theme-toggle--mobile"
    const toggleBtn = items[toggleIndex].querySelector("button");
    expect(toggleBtn.classList.contains("theme-toggle")).toBe(true);
    expect(toggleBtn.classList.contains("theme-toggle--mobile")).toBe(false);
  });

  it("toggle button renders in mobile overlay before CTA", () => {
    const { container } = renderNavbar();

    // Open the mobile overlay by clicking the hamburger
    const hamburger = container.querySelector(".navbar-hamburger");
    fireEvent.click(hamburger);

    // Find the overlay
    const overlay = container.querySelector(".navbar-overlay");
    expect(overlay).not.toBeNull();

    // Get all direct children (motion.div wrappers) in the overlay, excluding the close button
    const children = Array.from(overlay.children).filter(
      (el) => !el.classList.contains("navbar-overlay-close")
    );

    // Find the mobile toggle and CTA among overlay children
    const toggleChildIndex = children.findIndex((el) =>
      el.querySelector(".theme-toggle--mobile")
    );
    const ctaChildIndex = children.findIndex((el) =>
      el.querySelector(".navbar-cta")
    );

    expect(toggleChildIndex).toBeGreaterThanOrEqual(0);
    expect(ctaChildIndex).toBeGreaterThanOrEqual(0);

    // Toggle should appear before CTA
    expect(toggleChildIndex).toBeLessThan(ctaChildIndex);

    // Verify the mobile toggle button exists with correct class
    const mobileToggle = overlay.querySelector(".theme-toggle--mobile");
    expect(mobileToggle).not.toBeNull();
  });

  it("mobile toggle button has theme-toggle--mobile class for 44px tap target", () => {
    const { container } = renderNavbar();

    // Open mobile overlay
    const hamburger = container.querySelector(".navbar-hamburger");
    fireEvent.click(hamburger);

    const overlay = container.querySelector(".navbar-overlay");
    const mobileToggle = overlay.querySelector(".theme-toggle--mobile");

    expect(mobileToggle).not.toBeNull();
    // The theme-toggle--mobile class in CSS applies min-width: 44px and min-height: 44px
    // at @media (max-width: 600px). Since jsdom doesn't compute styles, we verify the
    // class is applied which guarantees the CSS rule takes effect.
    expect(mobileToggle.classList.contains("theme-toggle")).toBe(true);
    expect(mobileToggle.classList.contains("theme-toggle--mobile")).toBe(true);
  });
});
