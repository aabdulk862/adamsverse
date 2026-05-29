import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemePicker from "../components/builder/ThemePicker";

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

describe("ThemePicker", () => {
  const mockOnSelectTheme = vi.fn();
  const mockOnCustomizeColor = vi.fn();
  const mockOnReset = vi.fn();

  const defaultProps = {
    packageSlug: "restaurant",
    activeThemeIndex: 0,
    customColors: null,
    onSelectTheme: mockOnSelectTheme,
    onCustomizeColor: mockOnCustomizeColor,
    onReset: mockOnReset,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 3 theme cards for the package", () => {
    render(<ThemePicker {...defaultProps} />);

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("displays theme labels", () => {
    render(<ThemePicker {...defaultProps} />);

    expect(screen.getByText("Candlelit")).toBeInTheDocument();
    expect(screen.getByText("Garden Fresh")).toBeInTheDocument();
    expect(screen.getByText("Coastal")).toBeInTheDocument();
  });

  it("marks the active theme as checked", () => {
    render(<ThemePicker {...defaultProps} activeThemeIndex={1} />);

    const radios = screen.getAllByRole("radio");
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
  });

  it("calls onSelectTheme when a theme card is clicked", () => {
    render(<ThemePicker {...defaultProps} />);

    const radios = screen.getAllByRole("radio");
    fireEvent.click(radios[2]);

    expect(mockOnSelectTheme).toHaveBeenCalledWith(2);
  });

  it("shows color customization panel when toggle is clicked", () => {
    render(<ThemePicker {...defaultProps} />);

    const toggle = screen.getByText("Customize Colors");
    fireEvent.click(toggle);

    expect(screen.getByLabelText("Background Base hex value")).toBeInTheDocument();
    expect(screen.getByLabelText("Accent hex value")).toBeInTheDocument();
  });

  it("validates hex color input and shows error for invalid values", () => {
    render(<ThemePicker {...defaultProps} />);

    // Open customization panel
    fireEvent.click(screen.getByText("Customize Colors"));

    // Enter invalid hex color
    const accentInput = screen.getByLabelText("Accent hex value");
    fireEvent.change(accentInput, { target: { value: "not-a-color" } });

    expect(screen.getByText(/Enter a valid hex color/)).toBeInTheDocument();
    expect(mockOnCustomizeColor).not.toHaveBeenCalled();
  });

  it("calls onCustomizeColor for valid hex values", () => {
    render(<ThemePicker {...defaultProps} />);

    fireEvent.click(screen.getByText("Customize Colors"));

    const accentInput = screen.getByLabelText("Accent hex value");
    fireEvent.change(accentInput, { target: { value: "#ff6600" } });

    expect(mockOnCustomizeColor).toHaveBeenCalledWith("accent", "#ff6600");
  });

  it("shows reset button when customColors are present", () => {
    render(<ThemePicker {...defaultProps} customColors={{ accent: "#ff0000" }} />);

    const resetButton = screen.getByLabelText("Reset theme to original colors");
    expect(resetButton).toBeInTheDocument();

    fireEvent.click(resetButton);
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });
});
