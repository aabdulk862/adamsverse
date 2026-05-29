import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HandoffButton from "../components/builder/HandoffButton";

const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock Clerk — unauthenticated user
vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ isSignedIn: false, userId: null }),
}));

// Mock useSupabaseClient (path as imported by HandoffButton)
vi.mock("../hooks/useSupabaseClient", () => ({
  useSupabaseClient: () => null,
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

describe("HandoffButton — Unauthenticated Flow", () => {
  const mockConfig = {
    slug: "restaurant",
    name: "Restaurant",
    category: "Food & Hospitality",
    sections: { hero: { headline: "Test" } },
  };

  let originalLocalStorage;
  let mockStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    originalLocalStorage = Object.getOwnPropertyDescriptor(window, "localStorage");
    mockStorage = createLocalStorageMock();
    Object.defineProperty(window, "localStorage", { value: mockStorage, writable: true });
  });

  afterEach(() => {
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
  });

  it("renders 'Get This Website' button when not signed in", () => {
    render(
      <HandoffButton
        config={mockConfig}
        packageName="Restaurant"
        themeLabel="Candlelit"
        category="Food & Hospitality"
      />
    );

    expect(screen.getByLabelText("Get This Website")).toBeInTheDocument();
  });

  it("saves config to localStorage and navigates to /signup on click", () => {
    render(
      <HandoffButton
        config={mockConfig}
        packageName="Restaurant"
        themeLabel="Candlelit"
        category="Food & Hospitality"
      />
    );

    fireEvent.click(screen.getByLabelText("Get This Website"));

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      "webuilder_pending_config",
      JSON.stringify(mockConfig)
    );
    expect(mockNavigate).toHaveBeenCalledWith("/signup?redirect=/dashboard");
  });

  it("renders Download Config button", () => {
    render(
      <HandoffButton
        config={mockConfig}
        packageName="Restaurant"
        themeLabel="Candlelit"
        category="Food & Hospitality"
      />
    );

    expect(screen.getByLabelText("Download configuration as JSON file")).toBeInTheDocument();
  });

  it("renders contact link with correct query params", () => {
    render(
      <HandoffButton
        config={mockConfig}
        packageName="Restaurant"
        themeLabel="Candlelit"
        category="Food & Hospitality"
      />
    );

    const contactLink = screen.getByText("Prefer to talk first? Contact us");
    expect(contactLink).toHaveAttribute(
      "href",
      "/contact?package=Restaurant&theme=Candlelit"
    );
  });
});
