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

// Mock TemplateSelector
vi.mock("../components/builder/TemplateSelector", () => ({
  default: ({ onSelectTemplate, onSelectBlank }) => (
    <div data-testid="template-selector">
      <button onClick={() => onSelectTemplate("restaurant")}>Select Template</button>
      <button onClick={() => onSelectBlank()}>Start Blank</button>
    </div>
  ),
}));

describe("BuilderPage — Auth-Aware Navbar Behavior", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("renders builder page for unauthenticated user without errors", async () => {
    vi.doMock("@clerk/clerk-react", () => ({
      useAuth: () => ({ isSignedIn: false, userId: null }),
      useUser: () => ({ user: null }),
    }));

    const { default: BuilderPage } = await import("../pages/BuilderPage");
    render(<BuilderPage />);

    expect(screen.getByLabelText("Website Builder")).toBeInTheDocument();
    expect(screen.getByTestId("template-selector")).toBeInTheDocument();
  });

  it("renders builder page for authenticated user and shows user info in edit step", async () => {
    vi.doMock("@clerk/clerk-react", () => ({
      useAuth: () => ({ isSignedIn: true, userId: "user_2abc123" }),
      useUser: () => ({
        user: {
          fullName: "John Doe",
          imageUrl: "https://example.com/avatar.jpg",
          primaryEmailAddress: { emailAddress: "john@example.com" },
        },
      }),
    }));

    const { default: BuilderPage } = await import("../pages/BuilderPage");
    const { fireEvent } = await import("@testing-library/react");

    render(<BuilderPage />);

    // Transition to edit step
    fireEvent.click(screen.getByText("Select Template"));

    // Should show auth info in the edit step
    expect(screen.getByText(/Editing as John Doe/)).toBeInTheDocument();
  });

  it("does not require authentication to access the builder", async () => {
    vi.doMock("@clerk/clerk-react", () => ({
      useAuth: () => ({ isSignedIn: false, userId: null }),
      useUser: () => ({ user: null }),
    }));

    const { default: BuilderPage } = await import("../pages/BuilderPage");
    render(<BuilderPage />);

    // Builder should render without any login prompt
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/log in/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Website Builder")).toBeInTheDocument();
  });
});
