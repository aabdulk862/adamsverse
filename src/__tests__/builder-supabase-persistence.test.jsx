import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBuilderState, STORAGE_KEY } from "../hooks/useBuilderState";

const mockUpsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

const mockSupabase = {
  from: mockFrom,
};

// Mock useSupabaseClient
vi.mock("../hooks/useSupabaseClient", () => ({
  useSupabaseClient: () => mockSupabase,
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

describe("Builder Supabase Persistence", () => {
  let originalLocalStorage;
  let mockStorage;

  beforeEach(() => {
    originalLocalStorage = Object.getOwnPropertyDescriptor(window, "localStorage");
    mockStorage = createLocalStorageMock();
    Object.defineProperty(window, "localStorage", { value: mockStorage, writable: true });

    vi.clearAllMocks();
    vi.useFakeTimers();

    // Setup chain for upsert: from().upsert().select().single()
    mockSingle.mockResolvedValue({ data: { id: "proj_abc" }, error: null });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockUpsert.mockReturnValue({ select: mockSelect });

    // Setup chain for select: from().select().eq().eq().order().limit().single()
    const mockSelectChain = {
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
    };
    mockSelectChain.eq.mockReturnValue(mockSelectChain);

    mockFrom.mockImplementation((table) => {
      if (table === "projects") {
        return {
          upsert: mockUpsert,
          select: vi.fn().mockReturnValue(mockSelectChain),
        };
      }
      return {};
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
  });

  it("saves to Supabase when userId is provided and state changes", async () => {
    const { result } = renderHook(() =>
      useBuilderState({ userId: "user_2abc123" })
    );

    // Select a template to trigger state change
    act(() => {
      result.current[1].selectTemplate("restaurant");
    });

    // Advance past debounce
    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(mockFrom).toHaveBeenCalledWith("projects");
    expect(mockUpsert).toHaveBeenCalled();

    // Verify the upsert payload
    const upsertCall = mockUpsert.mock.calls[0][0];
    expect(upsertCall.client_id).toBe("user_2abc123");
    expect(upsertCall.status).toBe("draft");
    expect(upsertCall.intake_data).toBeDefined();
  });

  it("does not save to Supabase when userId is null", async () => {
    const { result } = renderHook(() =>
      useBuilderState({ userId: null })
    );

    act(() => {
      result.current[1].selectTemplate("restaurant");
    });

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    // Should not have called upsert (only localStorage)
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("falls back to localStorage when Supabase save fails", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "Network error" },
    });

    const { result } = renderHook(() =>
      useBuilderState({ userId: "user_2abc123" })
    );

    act(() => {
      result.current[1].selectTemplate("restaurant");
    });

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    // State should still have the config (not lost)
    const [state] = result.current;
    expect(state.config).not.toBeNull();
    expect(state.config.slug).toBe("restaurant");

    // localStorage should have been written to
    expect(mockStorage.setItem).toHaveBeenCalled();
  });

  it("exposes isSavingToSupabase state", async () => {
    // Make the save hang
    mockSingle.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() =>
      useBuilderState({ userId: "user_2abc123" })
    );

    act(() => {
      result.current[1].selectTemplate("restaurant");
    });

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    // While saving, isSavingToSupabase should be true
    const [state] = result.current;
    expect(state.isSavingToSupabase).toBe(true);
  });

  it("stores supabaseProjectId after successful save", async () => {
    mockSingle.mockResolvedValue({ data: { id: "proj_xyz" }, error: null });

    const { result } = renderHook(() =>
      useBuilderState({ userId: "user_2abc123" })
    );

    act(() => {
      result.current[1].selectTemplate("restaurant");
    });

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    // Wait for state update
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    const [state] = result.current;
    expect(state.supabaseProjectId).toBe("proj_xyz");
  });
});
