import { render, screen, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { useScrollAnimation } from "./useScrollAnimation";

// Helper: a component that uses the hook and attaches the ref to a real div
function TestComponent({ options = {} }) {
  const { ref, isVisible } = useScrollAnimation(options);
  return (
    <div ref={ref} data-testid="target" data-visible={String(isVisible)}>
      {isVisible ? "visible" : "hidden"}
    </div>
  );
}

// Controllable mock IntersectionObserver using a proper constructor function
let mockObserverInstances = [];
let MockIntersectionObserver;

function setupMockIO() {
  mockObserverInstances = [];

  MockIntersectionObserver = vi.fn(function (callback, options) {
    this.callback = callback;
    this.options = options;
    this.elements = [];
    this.observe = vi.fn((el) => this.elements.push(el));
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
    mockObserverInstances.push(this);
  });

  globalThis.IntersectionObserver = MockIntersectionObserver;
}

function triggerIntersection(isIntersecting, instanceIndex = 0) {
  const instance = mockObserverInstances[instanceIndex];
  if (instance) {
    act(() => {
      instance.callback([{ isIntersecting }]);
    });
  }
}

describe("useScrollAnimation", () => {
  let originalIO;
  let originalMatchMedia;

  beforeEach(() => {
    originalIO = globalThis.IntersectionObserver;
    originalMatchMedia = window.matchMedia;
    // Default matchMedia: no reduced motion
    window.matchMedia = vi.fn((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalIO;
    window.matchMedia = originalMatchMedia;
    mockObserverInstances = [];
    vi.restoreAllMocks();
  });

  it("returns ref and isVisible", () => {
    setupMockIO();
    const { result } = renderHook(() => useScrollAnimation());
    expect(result.current).toHaveProperty("ref");
    expect(result.current).toHaveProperty("isVisible");
  });

  it("starts with isVisible false by default", () => {
    setupMockIO();
    render(<TestComponent />);
    expect(screen.getByTestId("target")).toHaveTextContent("hidden");
  });

  it("returns isVisible true immediately when skip is true", () => {
    setupMockIO();
    render(<TestComponent options={{ skip: true }} />);
    expect(screen.getByTestId("target")).toHaveTextContent("visible");
  });

  it("returns isVisible true when prefers-reduced-motion: reduce is active", () => {
    setupMockIO();
    window.matchMedia = vi.fn((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<TestComponent />);
    expect(screen.getByTestId("target")).toHaveTextContent("visible");
  });

  it("returns isVisible true when IntersectionObserver is not supported", () => {
    delete globalThis.IntersectionObserver;

    render(<TestComponent />);
    expect(screen.getByTestId("target")).toHaveTextContent("visible");
  });

  it("creates observer with 0.15 as the default threshold", () => {
    setupMockIO();
    render(<TestComponent />);

    expect(MockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.15 },
    );
  });

  it("creates observer with a custom threshold", () => {
    setupMockIO();
    render(<TestComponent options={{ threshold: 0.5 }} />);

    expect(MockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.5 },
    );
  });

  it("observes the ref element", () => {
    setupMockIO();
    render(<TestComponent />);

    const instance = mockObserverInstances[0];
    expect(instance).toBeDefined();
    expect(instance.observe).toHaveBeenCalledWith(
      screen.getByTestId("target"),
    );
  });

  it("sets isVisible to true when intersection is triggered", () => {
    setupMockIO();
    render(<TestComponent />);

    expect(screen.getByTestId("target")).toHaveTextContent("hidden");

    triggerIntersection(true);

    expect(screen.getByTestId("target")).toHaveTextContent("visible");
  });

  it("disconnects observer after first intersection (trigger once)", () => {
    setupMockIO();
    render(<TestComponent />);

    const instance = mockObserverInstances[0];
    expect(instance).toBeDefined();

    triggerIntersection(true);

    expect(instance.disconnect).toHaveBeenCalled();
  });

  it("does not set isVisible when entry is not intersecting", () => {
    setupMockIO();
    render(<TestComponent />);

    triggerIntersection(false);

    expect(screen.getByTestId("target")).toHaveTextContent("hidden");
  });

  it("does not create observer when skip is true", () => {
    setupMockIO();
    render(<TestComponent options={{ skip: true }} />);

    expect(MockIntersectionObserver).not.toHaveBeenCalled();
  });
});
