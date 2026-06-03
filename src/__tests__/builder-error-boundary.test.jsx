import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock Clerk
vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ isSignedIn: false, userId: null }),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    section: ({ children, ...props }) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <section {...rest}>{children}</section>;
    },
    button: ({ children, ...props }) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock useBuilderState
vi.mock("../hooks/useBuilderState", () => ({
  useBuilderState: () => [
    {
      step: "select",
      config: null,
      activeTheme: null,
      baseThemeIndex: 0,
      category: null,
      packageSlug: null,
      customColors: null,
      hasSavedSession: false,
      storageAvailable: true,
      isSavingToSupabase: false,
      supabaseSaveError: null,
      isAuthenticated: false,
    },
    {
      selectTemplate: vi.fn(),
      selectBlankTemplate: vi.fn(),
      startFresh: vi.fn(),
      resumeSession: vi.fn(),
      updateField: vi.fn(),
      selectTheme: vi.fn(),
      customizeColor: vi.fn(),
      resetTheme: vi.fn(),
    },
  ],
}));

// Mock useSupabaseClient
vi.mock("../hooks/useSupabaseClient", () => ({
  useSupabaseClient: () => null,
}));

// Mock builder components
vi.mock("../components/builder/BuilderLayout", () => ({
  default: ({ editor, preview, children }) => (
    <div data-testid="builder-layout">{editor}{preview}{children}</div>
  ),
}));

vi.mock("../components/builder/ContentEditor", () => ({
  default: () => <div data-testid="content-editor" />,
}));

vi.mock("../components/builder/LivePreview", () => ({
  default: () => <div data-testid="live-preview" />,
}));

vi.mock("../components/builder/ThemePicker", () => ({
  default: () => <div data-testid="theme-picker" />,
}));

vi.mock("../components/builder/HandoffButton", () => ({
  default: () => <div data-testid="handoff-button" />,
}));

// Mock TemplateSelector to optionally throw
let shouldThrow = false;
vi.mock("../components/builder/TemplateSelector", () => ({
  default: (props) => {
    if (shouldThrow) {
      throw new Error("Test render error");
    }
    return <div data-testid="template-selector">TemplateSelector</div>;
  },
}));

import BuilderPage from "../pages/BuilderPage";

describe("BuilderErrorBoundary", () => {
  beforeEach(() => {
    shouldThrow = false;
    vi.clearAllMocks();
    // Suppress console.error for expected error boundary logs
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children normally when no error occurs", () => {
    render(<BuilderPage />);

    expect(screen.getByTestId("template-selector")).toBeInTheDocument();
  });

  it("shows error fallback when a child component throws", () => {
    shouldThrow = true;

    render(<BuilderPage />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/Your progress has been saved/)).toBeInTheDocument();
    expect(screen.getByText("Reload Builder")).toBeInTheDocument();
  });

  it("provides a reload button in the error state", () => {
    shouldThrow = true;

    // Mock window.location.reload
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });

    render(<BuilderPage />);

    const reloadButton = screen.getByText("Reload Builder");
    fireEvent.click(reloadButton);

    expect(reloadMock).toHaveBeenCalled();
  });
});
