import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BuilderLayout from "../components/builder/BuilderLayout";

describe("BuilderLayout", () => {
  const editorContent = <div data-testid="editor-content">Editor</div>;
  const previewContent = <div data-testid="preview-content">Preview</div>;

  it("renders both editor and preview panels on desktop (default)", () => {
    render(
      <BuilderLayout editor={editorContent} preview={previewContent}>
        <button>CTA</button>
      </BuilderLayout>
    );

    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
    expect(screen.getByTestId("preview-content")).toBeInTheDocument();
  });

  it("renders the draggable divider on desktop", () => {
    render(
      <BuilderLayout editor={editorContent} preview={previewContent} />
    );

    const divider = screen.getByRole("separator");
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveAttribute("aria-orientation", "vertical");
  });

  it("renders children (CTA area) below panels", () => {
    render(
      <BuilderLayout editor={editorContent} preview={previewContent}>
        <button>Get This Website</button>
      </BuilderLayout>
    );

    expect(screen.getByText("Get This Website")).toBeInTheDocument();
  });

  it("supports keyboard navigation on the divider", () => {
    render(
      <BuilderLayout editor={editorContent} preview={previewContent} />
    );

    const divider = screen.getByRole("separator");
    const initialValue = parseInt(divider.getAttribute("aria-valuenow"));

    fireEvent.keyDown(divider, { key: "ArrowRight" });
    const newValue = parseInt(divider.getAttribute("aria-valuenow"));
    expect(newValue).toBe(initialValue + 2);

    fireEvent.keyDown(divider, { key: "ArrowLeft" });
    const resetValue = parseInt(divider.getAttribute("aria-valuenow"));
    expect(resetValue).toBe(initialValue);
  });

  it("renders mobile toggle when matchMedia reports mobile viewport", () => {
    // Override matchMedia to simulate mobile
    const originalMatchMedia = window.matchMedia;
    let changeHandler;
    window.matchMedia = vi.fn((query) => ({
      matches: true, // mobile
      media: query,
      onchange: null,
      addEventListener: (event, handler) => { changeHandler = handler; },
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => {},
    }));

    render(
      <BuilderLayout editor={editorContent} preview={previewContent} />
    );

    // Should show toggle tabs
    expect(screen.getByRole("tab", { name: /Editor/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Preview/i })).toBeInTheDocument();

    // Only editor should be visible initially
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
    expect(screen.queryByTestId("preview-content")).not.toBeInTheDocument();

    // Switch to preview
    fireEvent.click(screen.getByRole("tab", { name: /Preview/i }));
    expect(screen.queryByTestId("editor-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("preview-content")).toBeInTheDocument();

    window.matchMedia = originalMatchMedia;
  });
});
