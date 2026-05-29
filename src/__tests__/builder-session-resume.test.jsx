import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useBuilderState, STORAGE_KEY } from "../hooks/useBuilderState";
import { renderHook, act } from "@testing-library/react";

// Mock useSupabaseClient
vi.mock("../hooks/useSupabaseClient", () => ({
  useSupabaseClient: () => null,
}));

// Mock Clerk
vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ getToken: vi.fn() }),
}));

// localStorage mock for jsdom
function createLocalStorageMock() {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i) => Object.keys(store)[i] ?? null),
  };
}

describe("Builder Session Resume", () => {
  let originalLocalStorage;
  let mockStorage;

  beforeEach(() => {
    originalLocalStorage = Object.getOwnPropertyDescriptor(window, "localStorage");
    mockStorage = createLocalStorageMock();
    Object.defineProperty(window, "localStorage", { value: mockStorage, writable: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
  });

  it("detects a saved session in localStorage", () => {
    const savedState = {
      step: "edit",
      config: { slug: "restaurant", name: "Restaurant", sections: {} },
      baseThemeIndex: 1,
      category: "Food & Hospitality",
      packageSlug: "restaurant",
      customColors: null,
      timestamp: Date.now(),
    };
    mockStorage.getItem.mockReturnValue(JSON.stringify(savedState));

    const { result } = renderHook(() => useBuilderState({ userId: null }));
    const [state] = result.current;

    expect(state.hasSavedSession).toBe(true);
    expect(state.step).toBe("select"); // Should not auto-restore
  });

  it("resumes session from localStorage when resumeSession is called", () => {
    const savedState = {
      step: "edit",
      config: { slug: "restaurant", name: "Restaurant", sections: { hero: { headline: "Hi" } } },
      baseThemeIndex: 0,
      category: "Food & Hospitality",
      packageSlug: "restaurant",
      customColors: null,
      timestamp: Date.now(),
    };
    mockStorage.getItem.mockReturnValue(JSON.stringify(savedState));

    const { result } = renderHook(() => useBuilderState({ userId: null }));

    act(() => {
      result.current[1].resumeSession();
    });

    const [state] = result.current;
    expect(state.step).toBe("edit");
    expect(state.config.slug).toBe("restaurant");
    expect(state.hasRestoredSession).toBe(true);
  });

  it("starts fresh and clears localStorage when startFresh is called", () => {
    const savedState = {
      step: "edit",
      config: { slug: "restaurant", name: "Restaurant", sections: {} },
      baseThemeIndex: 0,
      category: "Food & Hospitality",
      packageSlug: "restaurant",
      customColors: null,
      timestamp: Date.now(),
    };
    mockStorage.getItem.mockReturnValue(JSON.stringify(savedState));

    const { result } = renderHook(() => useBuilderState({ userId: null }));

    act(() => {
      result.current[1].startFresh();
    });

    const [state] = result.current;
    expect(state.step).toBe("select");
    expect(state.config).toBeNull();
    expect(state.hasSavedSession).toBe(false);
    expect(mockStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it("reports no saved session when localStorage is empty", () => {
    mockStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useBuilderState({ userId: null }));
    const [state] = result.current;

    expect(state.hasSavedSession).toBe(false);
  });

  it("handles corrupted localStorage data gracefully", () => {
    mockStorage.getItem.mockReturnValue("not-valid-json{{{");

    const { result } = renderHook(() => useBuilderState({ userId: null }));
    const [state] = result.current;

    expect(state.hasSavedSession).toBe(false);
    expect(state.step).toBe("select");
  });
});
