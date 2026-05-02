import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Lightbox from "./Lightbox";

const makeImages = (count = 3) =>
  Array.from({ length: count }, (_, i) => ({
    src: `https://images.unsplash.com/photo-${i}?w=800&q=80&fm=webp`,
    alt: `Test image ${i + 1}`,
  }));

describe("Lightbox", () => {
  let onClose, onPrev, onNext;

  beforeEach(() => {
    onClose = vi.fn();
    onPrev = vi.fn();
    onNext = vi.fn();
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("renders the lightbox dialog", () => {
    render(
      <Lightbox
        images={makeImages()}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("displays the correct image with w=1600 resolution", () => {
    render(
      <Lightbox
        images={makeImages()}
        activeIndex={1}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    const img = screen.getByTestId("lightbox-image");
    expect(img.src).toContain("w=1600");
    expect(img.src).not.toContain("w=800");
    expect(img.src).toContain("photo-1");
  });

  it("shows the alt text as a visible caption", () => {
    render(
      <Lightbox
        images={makeImages()}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    expect(screen.getByTestId("lightbox-caption")).toHaveTextContent(
      "Test image 1",
    );
  });

  it("renders close, prev, and next buttons", () => {
    render(
      <Lightbox
        images={makeImages()}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    expect(screen.getByTestId("lightbox-close")).toBeInTheDocument();
    expect(screen.getByTestId("lightbox-prev")).toBeInTheDocument();
    expect(screen.getByTestId("lightbox-next")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <Lightbox
        images={makeImages()}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    fireEvent.click(screen.getByTestId("lightbox-close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onPrev when prev button is clicked", () => {
    render(
      <Lightbox
        images={makeImages()}
        activeIndex={1}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    fireEvent.click(screen.getByTestId("lightbox-prev"));
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when next button is clicked", () => {
    render(
      <Lightbox
        images={makeImages()}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    fireEvent.click(screen.getByTestId("lightbox-next"));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onClose on Escape key", () => {
    render(
      <Lightbox
        images={makeImages()}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onPrev on ArrowLeft key", () => {
    render(
      <Lightbox
        images={makeImages()}
        activeIndex={1}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowLeft" });
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("calls onNext on ArrowRight key", () => {
    render(
      <Lightbox
        images={makeImages()}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowRight" });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("hides prev/next buttons when gallery has only 1 image", () => {
    render(
      <Lightbox
        images={makeImages(1)}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    expect(screen.queryByTestId("lightbox-prev")).not.toBeInTheDocument();
    expect(screen.queryByTestId("lightbox-next")).not.toBeInTheDocument();
    expect(screen.getByTestId("lightbox-close")).toBeInTheDocument();
  });

  it("does not call onPrev/onNext on arrow keys when single image", () => {
    render(
      <Lightbox
        images={makeImages(1)}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowLeft" });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowRight" });
    expect(onPrev).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("prevents background scroll on open", () => {
    render(
      <Lightbox
        images={makeImages()}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores background scroll on unmount", () => {
    document.body.style.overflow = "auto";
    const { unmount } = render(
      <Lightbox
        images={makeImages()}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("returns null when images array is empty", () => {
    const { container } = render(
      <Lightbox
        images={[]}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("returns null when images is null", () => {
    const { container } = render(
      <Lightbox
        images={null}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("has aria-modal and dialog role for accessibility", () => {
    render(
      <Lightbox
        images={makeImages()}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Image lightbox");
  });

  it("does not render caption when alt text is empty", () => {
    const images = [{ src: "https://example.com/photo.jpg", alt: "" }];
    render(
      <Lightbox
        images={images}
        activeIndex={0}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );
    expect(screen.queryByTestId("lightbox-caption")).not.toBeInTheDocument();
  });
});
