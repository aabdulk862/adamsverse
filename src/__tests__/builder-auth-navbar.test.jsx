import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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

// Mock TemplateSelector
vi.mock("../components/builder/TemplateSelector", () => ({
  default: ({ onSelectTemplate, onSelectBlank }) => (
    <div data-testid="template-selector">
      <button onClick={() => onSelectTemplate("restaurant")}>Select Template</button>
      <button onClick={() => onSelectBlank()}>Start Blank</button>
    </div>
  ),
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

describe("BuilderPage — Auth-Aware Navbar Behavior", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("renders builder page for unauthenticated user without errors", async () => {
    vi.doMock("@clerk/clerk-react", () => ({
      useAuth: () => ({ isSignedIn: false, userId: null }),
    }));

    const { default: BuilderPage } = await import("../pages/BuilderPage");
    render(<BuilderPage />);

    expect(screen.getByLabelText("Website Builder")).toBeInTheDocument();
    expect(screen.getByTestId("template-selector")).toBeInTheDocument();
  });

  it("renders builder page for authenticated user without errors", async () => {
    vi.doMock("@clerk/clerk-react", () => ({
      useAuth: () => ({ isSignedIn: true, userId: "user_2abc123" }),
    }));

    const { default: BuilderPage } = await import("../pages/BuilderPage");
    render(<BuilderPage />);

    expect(screen.getByLabelText("Website Builder")).toBeInTheDocument();
    expect(screen.getByTestId("template-selector")).toBeInTheDocument();
  });

  it("does not require authentication to access the builder", async () => {
    vi.doMock("@clerk/clerk-react", () => ({
      useAuth: () => ({ isSignedIn: false, userId: null }),
    }));

    const { default: BuilderPage } = await import("../pages/BuilderPage");
    render(<BuilderPage />);

    // Builder should render without any login prompt
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/log in/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Website Builder")).toBeInTheDocument();
  });
});
