import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TemplateSelector from "../components/builder/TemplateSelector";

// Mock framer-motion to simplify rendering
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...filterMotionProps(props)}>{children}</div>,
    button: ({ children, ...props }) => <button {...filterMotionProps(props)}>{children}</button>,
    section: ({ children, ...props }) => <section {...filterMotionProps(props)}>{children}</section>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

function filterMotionProps(props) {
  const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
  return rest;
}

describe("TemplateSelector", () => {
  const mockOnSelectTemplate = vi.fn();
  const mockOnSelectBlank = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all 4 category cards", () => {
    render(
      <TemplateSelector
        onSelectTemplate={mockOnSelectTemplate}
        onSelectBlank={mockOnSelectBlank}
      />
    );

    expect(screen.getByRole("radio", { name: "Food & Hospitality" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Beauty & Wellness" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Home Services" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Professional" })).toBeInTheDocument();
  });

  it("shows packages when a category is selected", () => {
    render(
      <TemplateSelector
        onSelectTemplate={mockOnSelectTemplate}
        onSelectBlank={mockOnSelectBlank}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "Food & Hospitality" }));

    // Should show Food & Hospitality packages
    expect(screen.getByText("Restaurant")).toBeInTheDocument();
  });

  it("calls onSelectTemplate when a template is clicked", () => {
    render(
      <TemplateSelector
        onSelectTemplate={mockOnSelectTemplate}
        onSelectBlank={mockOnSelectBlank}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "Food & Hospitality" }));
    fireEvent.click(screen.getByLabelText(/Select Restaurant template/));

    expect(mockOnSelectTemplate).toHaveBeenCalledWith("restaurant");
  });

  it("calls onSelectBlank when Start Blank is clicked", () => {
    render(
      <TemplateSelector
        onSelectTemplate={mockOnSelectTemplate}
        onSelectBlank={mockOnSelectBlank}
      />
    );

    fireEvent.click(screen.getByLabelText("Start with a blank template"));

    expect(mockOnSelectBlank).toHaveBeenCalledTimes(1);
  });

  it("filters packages by selected category", () => {
    render(
      <TemplateSelector
        onSelectTemplate={mockOnSelectTemplate}
        onSelectBlank={mockOnSelectBlank}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "Professional" }));

    expect(screen.getByText("Real Estate Agent")).toBeInTheDocument();
    // Should not show packages from other categories
    expect(screen.queryByText("Restaurant")).not.toBeInTheDocument();
  });

  it("renders the radiogroup with correct aria attributes", () => {
    render(
      <TemplateSelector
        onSelectTemplate={mockOnSelectTemplate}
        onSelectBlank={mockOnSelectBlank}
      />
    );

    const radiogroup = screen.getByRole("radiogroup", { name: "Business categories" });
    expect(radiogroup).toBeInTheDocument();
  });
});
