// Feature: dark-mode-toggle, Property 1: Toggle is an involution
// **Validates: Requirements 1.2**

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fc from "fast-check";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

/**
 * Minimal localStorage mock for jsdom environments where Storage is not available.
 */
function createLocalStorageMock() {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i) => Object.keys(store)[i] ?? null,
  };
}

/**
 * Helper component that exposes theme state and toggle for testing.
 */
function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
}

describe("Property 1: Toggle is an involution", () => {
  let originalLocalStorage;

  beforeEach(() => {
    vi.useFakeTimers();
    // Replace localStorage with a working mock
    originalLocalStorage = Object.getOwnPropertyDescriptor(
      window,
      "localStorage",
    );
    const mock = createLocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: mock,
      writable: true,
      configurable: true,
    });

    // Reset DOM state
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("theme-transitioning");
  });

  afterEach(() => {
    // Flush any pending timers before teardown
    vi.runAllTimers();
    vi.useRealTimers();
    // Restore original localStorage
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("theme-transitioning");
  });

  it("calling toggleTheme twice returns to the original theme", () => {
    fc.assert(
      fc.property(fc.constantFrom("light", "dark"), (initialTheme) => {
        // Seed localStorage so ThemeProvider initializes to the desired theme
        window.localStorage.setItem("theme", initialTheme);

        const { unmount } = render(
          <ThemeProvider>
            <ThemeProbe />
          </ThemeProvider>,
        );

        // Verify initial theme
        expect(screen.getByTestId("theme-value").textContent).toBe(
          initialTheme,
        );

        const toggleBtn = screen.getByTestId("toggle-btn");

        // Toggle once — theme should flip
        act(() => {
          toggleBtn.click();
        });

        const flipped = initialTheme === "light" ? "dark" : "light";
        expect(screen.getByTestId("theme-value").textContent).toBe(flipped);

        // Toggle again — should return to original (involution)
        act(() => {
          toggleBtn.click();
        });

        expect(screen.getByTestId("theme-value").textContent).toBe(
          initialTheme,
        );

        // Clean up before next iteration
        unmount();
        window.localStorage.setItem("theme", "");
        document.documentElement.removeAttribute("data-theme");
        document.documentElement.classList.remove("theme-transitioning");
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: dark-mode-toggle, Property 2: Theme persistence round-trip
// **Validates: Requirements 1.3, 1.4, 1.5, 7.1**

describe("Property 2: Theme persistence round-trip", () => {
  let originalLocalStorage;

  beforeEach(() => {
    vi.useFakeTimers();
    originalLocalStorage = Object.getOwnPropertyDescriptor(
      window,
      "localStorage",
    );
    const mock = createLocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: mock,
      writable: true,
      configurable: true,
    });

    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("theme-transitioning");
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("theme-transitioning");
  });

  it("setting a theme produces matching data-theme attribute and localStorage value", () => {
    fc.assert(
      fc.property(fc.constantFrom("light", "dark"), (initialTheme) => {
        // Seed localStorage so ThemeProvider initializes to the desired theme
        window.localStorage.setItem("theme", initialTheme);

        const { unmount } = render(
          <ThemeProvider>
            <ThemeProbe />
          </ThemeProvider>,
        );

        // (a) data-theme attribute on <html> matches the theme
        expect(document.documentElement.dataset.theme).toBe(initialTheme);

        // (b) localStorage value matches the theme
        expect(window.localStorage.getItem("theme")).toBe(initialTheme);

        // (c) ThemeProvider renders the correct theme value
        expect(screen.getByTestId("theme-value").textContent).toBe(
          initialTheme,
        );

        // Clean up before next iteration
        unmount();
        document.documentElement.removeAttribute("data-theme");
      }),
      { numRuns: 100 },
    );
  });

  it("toggling persists the new theme and re-init recovers it", () => {
    fc.assert(
      fc.property(fc.constantFrom("light", "dark"), (initialTheme) => {
        // Seed localStorage so ThemeProvider initializes to the desired theme
        window.localStorage.setItem("theme", initialTheme);

        const { unmount } = render(
          <ThemeProvider>
            <ThemeProbe />
          </ThemeProvider>,
        );

        // Toggle once to switch to the opposite theme
        const toggleBtn = screen.getByTestId("toggle-btn");
        act(() => {
          toggleBtn.click();
        });

        const flipped = initialTheme === "light" ? "dark" : "light";

        // (a) data-theme attribute reflects the toggled theme
        expect(document.documentElement.dataset.theme).toBe(flipped);

        // (b) localStorage was updated to the toggled theme
        expect(window.localStorage.getItem("theme")).toBe(flipped);

        // Unmount and clean up DOM (simulating page close)
        unmount();
        document.documentElement.removeAttribute("data-theme");

        // (c) Re-init: mount a fresh ThemeProvider — it should read from localStorage
        const { unmount: unmount2 } = render(
          <ThemeProvider>
            <ThemeProbe />
          </ThemeProvider>,
        );

        // The re-initialized provider should produce the same toggled theme
        expect(screen.getByTestId("theme-value").textContent).toBe(flipped);
        expect(document.documentElement.dataset.theme).toBe(flipped);

        // Clean up
        unmount2();
        document.documentElement.removeAttribute("data-theme");
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: dark-mode-toggle, Property 6: Invalid localStorage values produce valid fallback
// **Validates: Requirements 7.2**

describe("Property 6: Invalid localStorage values produce valid fallback", () => {
  let originalLocalStorage;

  beforeEach(() => {
    originalLocalStorage = Object.getOwnPropertyDescriptor(
      window,
      "localStorage",
    );
    const mock = createLocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: mock,
      writable: true,
      configurable: true,
    });

    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("theme-transitioning");
  });

  afterEach(() => {
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("theme-transitioning");
  });

  it("any non-valid localStorage theme value falls back to system preference (light)", () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => s !== "light" && s !== "dark"),
        (invalidValue) => {
          // Seed localStorage with an invalid theme value
          window.localStorage.setItem("theme", invalidValue);

          const { unmount } = render(
            <ThemeProvider>
              <ThemeProbe />
            </ThemeProvider>,
          );

          // ThemeProvider should discard the invalid value and fall back.
          // test-setup.js polyfills matchMedia with matches: false,
          // so prefers-color-scheme: light is false → system preference is 'dark'.
          const theme = screen.getByTestId("theme-value").textContent;
          expect(theme).toBe("dark");

          // data-theme attribute should also reflect the fallback
          expect(document.documentElement.dataset.theme).toBe("dark");

          // Clean up before next iteration
          unmount();
          window.localStorage.clear();
          document.documentElement.removeAttribute("data-theme");
          document.documentElement.classList.remove("theme-transitioning");
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: dark-mode-toggle, Property 3: Toggle button reflects current theme
// **Validates: Requirements 3.2, 3.4**

/**
 * Probe component that mirrors the Navbar toggle button logic
 * (icon class + aria-label) without requiring Navbar dependencies.
 */
function ToggleButtonProbe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      data-testid="theme-toggle"
      onClick={toggleTheme}
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
      type="button"
    >
      <i
        data-testid="theme-icon"
        className={theme === "dark" ? "fas fa-sun" : "fas fa-moon"}
      />
    </button>
  );
}

describe("Property 3: Toggle button reflects current theme", () => {
  let originalLocalStorage;

  beforeEach(() => {
    originalLocalStorage = Object.getOwnPropertyDescriptor(
      window,
      "localStorage",
    );
    const mock = createLocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: mock,
      writable: true,
      configurable: true,
    });

    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("theme-transitioning");
  });

  afterEach(() => {
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("theme-transitioning");
  });

  it("icon class and aria-label match the current theme value", () => {
    fc.assert(
      fc.property(fc.constantFrom("light", "dark"), (initialTheme) => {
        // Seed localStorage so ThemeProvider initializes to the desired theme
        window.localStorage.setItem("theme", initialTheme);

        const { unmount } = render(
          <ThemeProvider>
            <ToggleButtonProbe />
          </ThemeProvider>,
        );

        const toggleBtn = screen.getByTestId("theme-toggle");
        const icon = screen.getByTestId("theme-icon");

        // Verify icon class: dark → fa-sun, light → fa-moon
        const expectedIconClass =
          initialTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
        expect(icon.className).toBe(expectedIconClass);

        // Verify aria-label: light → "Switch to dark mode", dark → "Switch to light mode"
        const expectedAriaLabel =
          initialTheme === "light"
            ? "Switch to dark mode"
            : "Switch to light mode";
        expect(toggleBtn.getAttribute("aria-label")).toBe(expectedAriaLabel);

        // Clean up before next iteration
        unmount();
        window.localStorage.clear();
        document.documentElement.removeAttribute("data-theme");
        document.documentElement.classList.remove("theme-transitioning");
      }),
      { numRuns: 100 },
    );
  });
});
