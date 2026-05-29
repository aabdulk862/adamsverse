import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ContentEditor from "../components/builder/ContentEditor";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock ImageUploadField to simplify tests
vi.mock("../components/builder/ImageUploadField.jsx", () => ({
  default: ({ id, value, onChange, disabled, placeholder }) => (
    <input
      data-testid={`upload-${id}`}
      id={id}
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
    />
  ),
}));

const mockConfig = {
  slug: "restaurant",
  name: "Restaurant",
  packageType: "semi-dynamic",
  sections: {
    hero: {
      headline: "Test Headline",
      subheadline: "Test Subheadline",
      ctaText: "Click Me",
      heroImage: "https://example.com/image.jpg",
    },
    services: {
      heading: "Our Services",
      items: [
        { title: "Service 1", description: "Desc 1", icon: "⭐" },
      ],
    },
    cta: {
      heading: "CTA Heading",
      body: "CTA Body",
      buttonText: "Submit",
    },
    contact: {
      heading: "Contact Us",
      phone: "555-1234",
      email: "test@example.com",
      address: "123 Main St",
      hours: "9-5",
    },
  },
};

describe("ContentEditor", () => {
  const mockOnFieldChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders section groups for available sections", () => {
    render(<ContentEditor config={mockConfig} onFieldChange={mockOnFieldChange} />);

    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
    expect(screen.getByText("Call to Action")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders field inputs for hero section", () => {
    render(<ContentEditor config={mockConfig} onFieldChange={mockOnFieldChange} />);

    // Hero section fields should be visible (sections start expanded)
    expect(screen.getByDisplayValue("Test Headline")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Subheadline")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Click Me")).toBeInTheDocument();
  });

  it("calls onFieldChange when a field is edited", () => {
    render(<ContentEditor config={mockConfig} onFieldChange={mockOnFieldChange} />);

    const headlineInput = screen.getByDisplayValue("Test Headline");
    fireEvent.change(headlineInput, { target: { value: "New Headline" } });

    expect(mockOnFieldChange).toHaveBeenCalledWith(
      "hero",
      "headline",
      "New Headline"
    );
  });

  it("shows validation error for strings exceeding 500 characters", () => {
    render(<ContentEditor config={mockConfig} onFieldChange={mockOnFieldChange} />);

    const headlineInput = screen.getByDisplayValue("Test Headline");
    const longString = "a".repeat(501);
    fireEvent.change(headlineInput, { target: { value: longString } });

    expect(screen.getByText(/Maximum 500 characters/)).toBeInTheDocument();
  });

  it("collapses and expands sections on toggle click", () => {
    render(<ContentEditor config={mockConfig} onFieldChange={mockOnFieldChange} />);

    // Click the Hero section header to collapse it
    const heroToggle = screen.getByRole("button", { name: /Hero/i });
    expect(heroToggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(heroToggle);
    expect(heroToggle).toHaveAttribute("aria-expanded", "false");
  });

  it("renders in read-only mode when readOnly prop is true", () => {
    render(<ContentEditor config={mockConfig} onFieldChange={mockOnFieldChange} readOnly />);

    expect(screen.getByText("View Only")).toBeInTheDocument();
    const headlineInput = screen.getByDisplayValue("Test Headline");
    expect(headlineInput).toBeDisabled();
  });

  it("renders add button for array fields", () => {
    render(<ContentEditor config={mockConfig} onFieldChange={mockOnFieldChange} />);

    // Services section has an items array
    expect(screen.getByLabelText(/Add item to Items/i)).toBeInTheDocument();
  });
});
