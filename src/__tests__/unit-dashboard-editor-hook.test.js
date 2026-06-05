import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDashboardEditor } from "../hooks/useDashboardEditor";

vi.mock("../hooks/useSupabaseClient", () => ({
  useSupabaseClient: () => mockSupabase,
}));

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ getToken: () => Promise.resolve("test-token") }),
}));

let mockSupabase;
const mockUpdateResult = { error: null };
const mockSelect = vi.fn();
let updateCallCount = 0;
let updatePayloads = [];

beforeEach(() => {
  vi.useFakeTimers();
  updateCallCount = 0;
  updatePayloads = [];
  mockUpdateResult.error = null;
  mockSelect.mockReturnValue({ data: { subscription_status: "active" }, error: null });
  mockSupabase = {
    from: (table) => {
      if (table === "profiles") return { select: () => ({ single: () => Promise.resolve(mockSelect()) }) };
      return {
        update: (data) => ({
          eq: () => {
            updateCallCount++;
            updatePayloads.push(data);
            if (updateCallCount === 1 && mockUpdateResult._firstError) {
              return Promise.resolve({ error: { message: "fail" } });
            }
            return Promise.resolve({ error: mockUpdateResult.error });
          },
        }),
      };
    },
  };
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const INTAKE = {
  slug: "real-estate-agent",
  name: "Test Site",
  category: "Professional",
  description: "Test",
  packageType: "semi-dynamic",
  themeRef: "",
  sections: {
    hero: { headline: "Hello", subheadline: "World", ctaText: "Go", heroImage: "https://example.com/img.jpg" },
    services: { heading: "Services", items: [{ title: "Svc", description: "Desc", icon: "⭐" }] },
  },
};

describe("useDashboardEditor", () => {
  it("initializes state from intakeData", () => {
    const { result } = renderHook(() => useDashboardEditor({ projectId: "p1", intakeData: INTAKE }));
    const [state] = result.current;
    expect(state.config).toEqual(INTAKE);
    expect(state.sectionOrder).toEqual(["hero", "services"]);
    expect(state.isReadOnly).toBe(false);
    expect(state.saveStatus).toBe("idle");
    expect(state.activeTheme).not.toBeNull();
  });

  it("sets isReadOnly for static packages", () => {
    const { result } = renderHook(() => useDashboardEditor({ projectId: "p1", intakeData: { ...INTAKE, packageType: "static" } }));
    expect(result.current[0].isReadOnly).toBe(true);
  });

  it("updateField produces new config reference", () => {
    const { result } = renderHook(() => useDashboardEditor({ projectId: "p1", intakeData: INTAKE }));
    const origConfig = result.current[0].config;
    act(() => { result.current[1].updateField("hero", "headline", "New"); });
    expect(result.current[0].config).not.toBe(origConfig);
    expect(result.current[0].config.sections.hero.headline).toBe("New");
  });

  it("reorderSections updates sectionOrder", () => {
    const { result } = renderHook(() => useDashboardEditor({ projectId: "p1", intakeData: INTAKE }));
    act(() => { result.current[1].reorderSections(["services", "hero"]); });
    expect(result.current[0].sectionOrder).toEqual(["services", "hero"]);
  });

  it("auto-saves to Supabase after 1s debounce", async () => {
    const { result } = renderHook(() => useDashboardEditor({ projectId: "p1", intakeData: INTAKE }));
    act(() => { result.current[1].updateField("hero", "headline", "Saved"); });
    expect(updateCallCount).toBe(0);
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(updateCallCount).toBe(1);
    expect(updatePayloads[0].intake_data.sections.hero.headline).toBe("Saved");
  });

  it("retries once on save failure", async () => {
    mockUpdateResult._firstError = true;
    const { result } = renderHook(() => useDashboardEditor({ projectId: "p1", intakeData: INTAKE }));
    act(() => { result.current[1].updateField("hero", "headline", "Retry"); });
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(result.current[0].saveStatus).toBe("error");
    expect(updateCallCount).toBe(1);
    await act(async () => { vi.advanceTimersByTime(3000); });
    expect(updateCallCount).toBe(2);
  });

  it("publish returns no_subscription when inactive", async () => {
    mockSelect.mockReturnValue({ data: { subscription_status: "inactive" }, error: null });
    const { result } = renderHook(() => useDashboardEditor({ projectId: "p1", intakeData: INTAKE }));
    let res;
    await act(async () => { res = await result.current[1].publish(); });
    expect(res).toEqual({ success: false, reason: "no_subscription" });
  });
});
