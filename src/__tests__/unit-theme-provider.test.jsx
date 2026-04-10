import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

/**
 * Minimal localStorage mock for jsdom environments.
 */
function createLocalStorageMock() {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] ?? null,
  };
}

/**
 * Probe component that exposes theme state and toggle for testing.
 */
function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('4.5 ThemeProvider unit tests', () => {
  let originalLocalStorage;
  let originalMatchMedia;

  beforeEach(() => {
    // Save originals
    originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');
    originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');

    // Install localStorage mock
    const mock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: mock,
      writable: true,
      configurable: true,
    });

    // Reset DOM state
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('theme-transitioning');
  });

  afterEach(() => {
    // Restore localStorage
    if (originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', originalLocalStorage);
    }
    // Restore matchMedia
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    }
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('theme-transitioning');
  });

  // Requirement 1.5: initializes from stored localStorage value
  it('initializes from stored localStorage value', () => {
    window.localStorage.setItem('theme', 'dark');

    const { unmount } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    unmount();
  });

  // Requirement 1.6: initializes from system preference when no stored value
  it('initializes from system preference when no stored value', () => {
    window.localStorage.clear();

    // Override matchMedia so prefers-color-scheme: dark returns true
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query) => ({
        matches: query === '(prefers-color-scheme: dark)' ? true : false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });

    const { unmount } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');

    unmount();
  });

  // Requirement 1.7: falls back to dark when no stored value and no system preference
  it('falls back to dark when no stored value and no system preference', () => {
    window.localStorage.clear();

    // Default matchMedia from test-setup.js returns matches: false
    // Restore it explicitly to be safe
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });

    const { unmount } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');

    unmount();
  });

  // Requirement 4.2: adds theme-transitioning class on toggle and removes after 300ms
  it('adds theme-transitioning class on toggle and removes after 300ms', () => {
    vi.useFakeTimers();

    window.localStorage.setItem('theme', 'light');

    // Ensure matchMedia returns false for reduced-motion, false for color-scheme
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });

    const { unmount } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    const toggleBtn = screen.getByTestId('toggle-btn');

    act(() => {
      toggleBtn.click();
    });

    // Class should be present immediately after toggle
    expect(document.documentElement.classList.contains('theme-transitioning')).toBe(true);

    // Advance timers by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Class should be removed after 300ms
    expect(document.documentElement.classList.contains('theme-transitioning')).toBe(false);

    unmount();
    vi.useRealTimers();
  });

  // Requirement 5.5: skips theme-transitioning class when prefers-reduced-motion is active
  it('skips theme-transitioning class when prefers-reduced-motion is active', () => {
    window.localStorage.setItem('theme', 'light');

    // Override matchMedia so prefers-reduced-motion: reduce returns true
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query) => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });

    const { unmount } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    const toggleBtn = screen.getByTestId('toggle-btn');

    act(() => {
      toggleBtn.click();
    });

    // Class should NOT be added when reduced motion is preferred
    expect(document.documentElement.classList.contains('theme-transitioning')).toBe(false);

    unmount();
  });
});
