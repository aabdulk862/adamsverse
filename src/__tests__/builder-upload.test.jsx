import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImageUploadField from "../components/builder/ImageUploadField";

// Mock uploadService
vi.mock("../lib/uploadService.js", () => ({
  uploadFile: vi.fn(),
}));

import { uploadFile } from "../lib/uploadService.js";

describe("ImageUploadField", () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    id: "test-image",
    value: "",
    onChange: mockOnChange,
    disabled: false,
    placeholder: "https://...",
    label: "Upload image",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders URL input and upload button", () => {
    render(<ImageUploadField {...defaultProps} />);

    expect(screen.getByPlaceholderText("https://...")).toBeInTheDocument();
    expect(screen.getByLabelText("Upload image")).toBeInTheDocument();
  });

  it("calls onChange when URL is typed manually", () => {
    render(<ImageUploadField {...defaultProps} />);

    const input = screen.getByPlaceholderText("https://...");
    fireEvent.change(input, { target: { value: "https://example.com/img.jpg" } });

    expect(mockOnChange).toHaveBeenCalledWith("https://example.com/img.jpg");
  });

  it("shows loading state during upload", async () => {
    // Make upload hang
    uploadFile.mockReturnValue(new Promise(() => {}));

    render(<ImageUploadField {...defaultProps} />);

    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Uploading…")).toBeInTheDocument();
    });
  });

  it("calls onChange with URL on successful upload", async () => {
    uploadFile.mockResolvedValue({
      success: true,
      url: "https://storage.example.com/builder-preview/test.jpg",
    });

    render(<ImageUploadField {...defaultProps} />);

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        "https://storage.example.com/builder-preview/test.jpg"
      );
    });
  });

  it("shows error message on upload failure", async () => {
    uploadFile.mockResolvedValue({
      success: false,
      error: "File too large. Maximum size is 5 MB.",
    });

    render(<ImageUploadField {...defaultProps} />);

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["test"], "big.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("File too large");
    });

    // onChange should NOT have been called with a new URL
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("disables upload button when disabled prop is true", () => {
    render(<ImageUploadField {...defaultProps} disabled={true} />);

    expect(screen.getByLabelText("Upload image")).toBeDisabled();
  });

  it("shows preview thumbnail when value is set", () => {
    render(<ImageUploadField {...defaultProps} value="https://example.com/img.jpg" />);

    const img = screen.getByAltText("Preview");
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
  });
});
