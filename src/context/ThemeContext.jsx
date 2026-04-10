import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const VALID_THEMES = ['light', 'dark'];
const STORAGE_KEY = 'theme';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

/**
 * Read the stored theme from localStorage.
 * Returns the value only if it is 'light' or 'dark'; otherwise returns null.
 * Wrapped in try/catch for private-browsing compatibility.
 */
function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Persist theme to localStorage.
 * Silently fails in private browsing or when storage is full.
 */
function setStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore — preference won't persist this session
  }
}

/**
 * Detect the OS-level color scheme preference.
 */
function getSystemPreference() {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/**
 * Resolve the initial theme: stored → system preference → 'light'.
 */
function resolveInitialTheme() {
  return getStoredTheme() ?? getSystemPreference();
}

/**
 * Check if the user prefers reduced motion.
 */
function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Apply the theme to the DOM by setting the data-theme attribute on <html>.
 */
function applyThemeToDOM(theme) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(resolveInitialTheme);

  // Sync DOM attribute on mount and whenever theme changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';

      applyThemeToDOM(next);
      setStoredTheme(next);

      // Add transition class unless user prefers reduced motion
      if (!prefersReducedMotion()) {
        document.documentElement.classList.add('theme-transitioning');
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transitioning');
        }, 300);
      }

      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
