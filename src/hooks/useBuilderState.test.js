import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBuilderState, BLANK_TEMPLATE, STORAGE_KEY } from "./useBuilderState";
import packages from "../data/packages.js";
import themes from "../data/themes.js";

// Mock useSupabaseClient to return a null client for non-authenticated tests
vi.mock("../hooks/useSupabaseClient", () => ({
  useSupabaseClient: () => null,
}));

// Mock localStorage for jsdom environments
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("useBuilderState", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("returns initial state with step 'select' when no saved session", () => {
      const { result } = renderHook(() => useBuilderState());
      const [state] = result.current;

      expect(state.step).toBe("select");
      expect(state.config).toBeNull();
      expect(state.activeTheme).toBeNull();
      expect(state.baseThemeIndex).toBe(0);
      expect(state.category).toBeNull();
      expect(state.packageSlug).toBeNull();
      expect(state.customColors).toBeNull();
      expect(state.hasRestoredSession).toBe(false);
      expect(state.supabaseProjectId).toBeNull();
      expect(state.hasSavedSession).toBe(false);
    });

    it("detects existing saved session without auto-restoring", () => {
      localStorageMock.setItem(
        STORAGE_KEY,
        JSON.stringify({ step: "edit", config: { name: "Test" }, packageSlug: "restaurant" })
      );

      const { result } = renderHook(() => useBuilderState());
      const [state] = result.current;

      expect(state.step).toBe("select"); // NOT auto-restored
      expect(state.hasSavedSession).toBe(true);
    });
  });

  describe("selectTemplate", () => {
    it("deep copies package config and transitions to edit step", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });

      const [state] = result.current;
      expect(state.step).toBe("edit");
      expect(state.config.slug).toBe("restaurant");
      expect(state.config.packageType).toBe("semi-dynamic");
      expect(state.category).toBe("Food & Hospitality");
      expect(state.packageSlug).toBe("restaurant");
    });

    it("assigns first theme from themes.js for the package", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });

      const [state] = result.current;
      expect(state.activeTheme).not.toBeNull();
      expect(state.activeTheme.name).toBe("restaurant-candlelit");
      expect(state.baseThemeIndex).toBe(0);
    });

    it("produces an independent deep copy (mutations don't affect source)", () => {
      const { result } = renderHook(() => useBuilderState());
      const originalPkg = packages.find((p) => p.slug === "restaurant");
      const originalHeadline = originalPkg.sections.hero.headline;

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });

      act(() => {
        result.current[1].updateField("hero", "headline", "MUTATED");
      });

      // Original data should be unchanged
      expect(originalPkg.sections.hero.headline).toBe(originalHeadline);
    });

    it("does nothing for an invalid slug", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("nonexistent-slug");
      });

      const [state] = result.current;
      expect(state.step).toBe("select");
      expect(state.config).toBeNull();
    });
  });

  describe("selectBlankTemplate", () => {
    it("initializes with BLANK_TEMPLATE config", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectBlankTemplate();
      });

      const [state] = result.current;
      expect(state.step).toBe("edit");
      expect(state.config.slug).toBe("custom-builder");
      expect(state.config.name).toBe("Custom Website");
      expect(state.config.packageType).toBe("semi-dynamic");
      expect(state.config.sections.hero.headline).toBe("Your Business Name");
    });

    it("assigns a default theme", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectBlankTemplate();
      });

      const [state] = result.current;
      expect(state.activeTheme).not.toBeNull();
      expect(state.category).toBe("Professional");
    });
  });

  describe("updateField", () => {
    it("updates a simple field in a section", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });
      act(() => {
        result.current[1].updateField("hero", "headline", "New Headline");
      });

      const [state] = result.current;
      expect(state.config.sections.hero.headline).toBe("New Headline");
    });

    it("updates a nested field using dot notation", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });
      act(() => {
        result.current[1].updateField("services", "items.0.title", "Updated Service");
      });

      const [state] = result.current;
      expect(state.config.sections.services.items[0].title).toBe("Updated Service");
    });

    it("does nothing if config is null", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].updateField("hero", "headline", "Test");
      });

      const [state] = result.current;
      expect(state.config).toBeNull();
    });

    it("does nothing for invalid section key", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });

      const originalConfig = result.current[0].config;

      act(() => {
        result.current[1].updateField("nonexistent", "headline", "Test");
      });

      // Config should be unchanged (same reference since setState returns prev)
      expect(result.current[0].config).toEqual(originalConfig);
    });
  });

  describe("selectTheme", () => {
    it("selects a theme by index and clears customColors", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });
      act(() => {
        result.current[1].customizeColor("accent", "#ff0000");
      });
      act(() => {
        result.current[1].selectTheme(1);
      });

      const [state] = result.current;
      expect(state.baseThemeIndex).toBe(1);
      expect(state.activeTheme.name).toBe("restaurant-garden");
      expect(state.customColors).toBeNull();
    });

    it("does nothing for out-of-bounds index", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });
      act(() => {
        result.current[1].selectTheme(99);
      });

      const [state] = result.current;
      expect(state.baseThemeIndex).toBe(0);
    });
  });

  describe("customizeColor", () => {
    it("stores color override and merges into active theme", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });
      act(() => {
        result.current[1].customizeColor("accent", "#ff6600");
      });

      const [state] = result.current;
      expect(state.customColors).toEqual({ accent: "#ff6600" });
      expect(state.activeTheme.colors.accent).toBe("#ff6600");
    });

    it("preserves non-overridden tokens", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });

      const originalBgBase = result.current[0].activeTheme.colors.bgBase;

      act(() => {
        result.current[1].customizeColor("accent", "#ff6600");
      });

      const [state] = result.current;
      expect(state.activeTheme.colors.bgBase).toBe(originalBgBase);
    });
  });

  describe("resetTheme", () => {
    it("clears customColors and restores base theme", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });

      const originalTheme = result.current[0].activeTheme;

      act(() => {
        result.current[1].customizeColor("accent", "#ff6600");
      });
      act(() => {
        result.current[1].resetTheme();
      });

      const [state] = result.current;
      expect(state.customColors).toBeNull();
      expect(state.activeTheme.colors.accent).toBe(originalTheme.colors.accent);
    });
  });

  describe("getHandoffParams", () => {
    it("returns package name and theme label", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });

      const params = result.current[1].getHandoffParams();
      expect(params.package).toBe("Restaurant");
      expect(params.theme).toBe("Candlelit");
    });

    it("returns empty strings when no config", () => {
      const { result } = renderHook(() => useBuilderState());
      const params = result.current[1].getHandoffParams();
      expect(params.package).toBe("");
      expect(params.theme).toBe("");
    });
  });

  describe("localStorage persistence", () => {
    it("persists state to localStorage after debounce", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });

      // Before debounce fires
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );

      // After debounce
      act(() => {
        vi.advanceTimersByTime(1100);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );
      const stored = JSON.parse(localStorageMock.setItem.mock.calls.find(c => c[0] === STORAGE_KEY)[1]);
      expect(stored.step).toBe("edit");
      expect(stored.packageSlug).toBe("restaurant");
      expect(stored.timestamp).toBeDefined();
    });

    it("does not persist when in select step", () => {
      renderHook(() => useBuilderState());

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      const storageCalls = localStorageMock.setItem.mock.calls.filter(c => c[0] === STORAGE_KEY);
      expect(storageCalls.length).toBe(0);
    });
  });

  describe("clearSession", () => {
    it("removes localStorage entry", () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ step: "edit" }));

      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].clearSession();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
  });

  describe("startFresh", () => {
    it("resets state and clears localStorage", () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ step: "edit" }));

      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });
      act(() => {
        result.current[1].startFresh();
      });

      const [state] = result.current;
      expect(state.step).toBe("select");
      expect(state.config).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
  });

  describe("resumeSession", () => {
    it("restores state from localStorage and sets hasRestoredSession", () => {
      const savedState = {
        step: "edit",
        config: { slug: "restaurant", name: "Restaurant", packageType: "semi-dynamic", sections: {} },
        baseThemeIndex: 1,
        category: "Food & Hospitality",
        packageSlug: "restaurant",
        customColors: null,
        supabaseProjectId: null,
        timestamp: Date.now(),
      };
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].resumeSession();
      });

      const [state] = result.current;
      expect(state.step).toBe("edit");
      expect(state.config.slug).toBe("restaurant");
      expect(state.hasRestoredSession).toBe(true);
      expect(state.baseThemeIndex).toBe(1);
      expect(state.activeTheme.name).toBe("restaurant-garden");
    });

    it("handles missing localStorage gracefully", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].resumeSession();
      });

      const [state] = result.current;
      expect(state.step).toBe("select");
      expect(state.hasSavedSession).toBe(false);
    });
  });

  describe("localStorage error handling", () => {
    it("handles localStorage being unavailable", () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error("SecurityError");
      });

      const { result } = renderHook(() => useBuilderState());
      const [state] = result.current;
      expect(state.step).toBe("select");
      expect(state.hasSavedSession).toBe(false);
    });

    it("handles corrupted JSON in localStorage", () => {
      localStorageMock.getItem.mockReturnValueOnce("not valid json{{{");

      const { result } = renderHook(() => useBuilderState());
      const [state] = result.current;
      expect(state.step).toBe("select");
      expect(state.hasSavedSession).toBe(false);
    });

    it("handles QuotaExceededError gracefully during write", () => {
      const { result } = renderHook(() => useBuilderState());

      act(() => {
        result.current[1].selectTemplate("restaurant");
      });

      // Mock setItem to throw QuotaExceededError
      const error = new Error("QuotaExceededError");
      error.name = "QuotaExceededError";
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw error;
      });

      // Trigger debounced write
      act(() => {
        vi.advanceTimersByTime(1100);
      });

      // Hook should still function — state is in memory
      const [state] = result.current;
      expect(state.step).toBe("edit");
      expect(state.config.slug).toBe("restaurant");
    });
  });

  describe("userId parameter", () => {
    it("accepts userId parameter without error (placeholder for task 2.2)", () => {
      const { result } = renderHook(() =>
        useBuilderState({ userId: "user_123" })
      );
      const [state] = result.current;
      expect(state.step).toBe("select");
    });
  });
});
