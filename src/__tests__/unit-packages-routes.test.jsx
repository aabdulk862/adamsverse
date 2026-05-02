import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PackagesPage from "../pages/PackagesPage";
import PackageDetailPage from "../pages/PackageDetailPage";

// Mock useAuth so Navbar doesn't hit Supabase
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

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy(
      {},
      {
        get: (_target, prop) =>
          React.forwardRef((props, ref) => {
            const {
              initial,
              animate,
              exit,
              variants,
              transition,
              whileHover,
              whileTap,
              ...rest
            } = props;
            return React.createElement(prop, { ...rest, ref });
          }),
      },
    ),
    AnimatePresence: ({ children }) => children,
  };
});

// Mock font loader to avoid DOM side effects
vi.mock("../utils/fontLoader", () => ({
  default: vi.fn(),
}));

describe("Route and Navigation Updates", () => {
  // ── Requirement 9.4: Navbar contains "Packages" link pointing to /packages ──
  describe("Navbar", () => {
    it('contains a "Packages" link pointing to /packages', () => {
      render(
        <MemoryRouter>
          <ThemeProvider>
            <Navbar />
          </ThemeProvider>
        </MemoryRouter>,
      );

      const packagesLinks = screen.getAllByRole("link", {
        name: /^Packages$/i,
      });
      expect(packagesLinks.length).toBeGreaterThanOrEqual(1);

      const desktopLink = packagesLinks.find(
        (link) => link.getAttribute("href") === "/packages",
      );
      expect(desktopLink).toBeTruthy();
    });

    it('does not contain a "Projects" or "Portfolio" link', () => {
      render(
        <MemoryRouter>
          <ThemeProvider>
            <Navbar />
          </ThemeProvider>
        </MemoryRouter>,
      );

      const projectsLink = screen.queryByRole("link", { name: /^Projects$/i });
      const portfolioLink = screen.queryByRole("link", {
        name: /^Portfolio$/i,
      });
      expect(projectsLink).toBeNull();
      expect(portfolioLink).toBeNull();
    });
  });

  // ── Requirement 9.5: Footer contains "Packages" link pointing to /packages ──
  describe("Footer", () => {
    it('contains a "Packages" link pointing to /packages', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>,
      );

      const packagesLink = screen.getByRole("link", { name: /^Packages$/i });
      expect(packagesLink).toBeInTheDocument();
      expect(packagesLink.getAttribute("href")).toBe("/packages");
    });

    it('does not contain a "Portfolio" link', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>,
      );

      const portfolioLink = screen.queryByRole("link", {
        name: /^Portfolio$/i,
      });
      expect(portfolioLink).toBeNull();
    });
  });

  // ── Requirement 9.1, 9.2: /packages renders the browse page ──
  describe("/packages route", () => {
    it("renders the PackagesPage with package cards", () => {
      render(
        <MemoryRouter initialEntries={["/packages"]}>
          <Routes>
            <Route path="/packages" element={<PackagesPage />} />
          </Routes>
        </MemoryRouter>,
      );

      // PackagesPage renders a heading "Packages"
      expect(
        screen.getByRole("heading", { name: /Packages/i }),
      ).toBeInTheDocument();
      // Should render package cards (data has 12 packages)
      const cards = screen.getAllByTestId("package-card");
      expect(cards.length).toBe(12);
    });
  });

  // ── Requirement 9.3: /packages/:slug renders the detail page ──
  describe("/packages/restaurant route", () => {
    it("renders the PackageDetailPage with preview wrapper", () => {
      render(
        <MemoryRouter initialEntries={["/packages/restaurant"]}>
          <Routes>
            <Route path="/packages/:slug" element={<PackageDetailPage />} />
          </Routes>
        </MemoryRouter>,
      );

      // Restaurant slug renders the full preview with preview-wrapper
      expect(screen.getByTestId("preview-wrapper")).toBeInTheDocument();
      // Theme toggle should be present
      expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    });
  });

  // ── Requirement 9.3 + 2.4: /packages/nonexistent renders not-found ──
  describe("/packages/nonexistent route", () => {
    it("renders the not-found message for an invalid slug", () => {
      render(
        <MemoryRouter initialEntries={["/packages/nonexistent"]}>
          <Routes>
            <Route path="/packages/:slug" element={<PackageDetailPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByTestId("not-found")).toBeInTheDocument();
      expect(screen.getByText(/Package Not Found/i)).toBeInTheDocument();
      // Should have a link back to /packages
      const backLink = screen.getByRole("link", { name: /Back to Packages/i });
      expect(backLink.getAttribute("href")).toBe("/packages");
    });
  });
});
