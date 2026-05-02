import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Testimonials from "./Testimonials";

const makeItem = (overrides = {}) => ({
  quote: "Great service!",
  author: "Jane Doe",
  role: "CEO",
  ...overrides,
});

const makeContent = (items) => ({
  heading: "What Our Clients Say",
  items,
});

describe("Testimonials avatars", () => {
  it("renders avatar image when item has avatar URL", () => {
    const items = [makeItem({ avatar: "https://example.com/avatar.jpg" })];
    render(
      <Testimonials
        content={makeContent(items)}
        layout="professional"
      />,
    );
    const img = screen.getByAltText("Jane Doe avatar");
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe("IMG");
    expect(img.src).toContain("avatar.jpg");
  });

  it("renders circular avatar image (has avatar CSS class)", () => {
    const items = [makeItem({ avatar: "https://example.com/avatar.jpg" })];
    const { container } = render(
      <Testimonials
        content={makeContent(items)}
        layout="professional"
      />,
    );
    const img = container.querySelector("img");
    expect(img.className).toMatch(/avatar/);
  });

  it("renders initial-letter placeholder when avatar is absent", () => {
    const items = [makeItem({ avatar: undefined })];
    render(
      <Testimonials
        content={makeContent(items)}
        layout="professional"
      />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    const placeholder = screen.getByText("J");
    expect(placeholder).toBeInTheDocument();
    expect(placeholder.className).toMatch(/avatarPlaceholder/);
  });

  it("placeholder uses theme accent colors via inline styles", () => {
    const items = [makeItem({ avatar: undefined })];
    render(
      <Testimonials
        content={makeContent(items)}
        layout="beauty"
      />,
    );
    const placeholder = screen.getByText("J");
    expect(placeholder.style.backgroundColor).toBe("var(--color-accent)");
    expect(placeholder.style.color).toBe("var(--color-accentText)");
  });

  it("falls back to initial-letter placeholder on avatar load error", () => {
    const items = [makeItem({ avatar: "https://example.com/broken.jpg" })];
    render(
      <Testimonials
        content={makeContent(items)}
        layout="professional"
      />,
    );
    const img = screen.getByAltText("Jane Doe avatar");
    fireEvent.error(img);
    expect(screen.queryByAltText("Jane Doe avatar")).not.toBeInTheDocument();
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("renders avatar left of attribution for professional layout (attributionRow)", () => {
    const items = [makeItem({ avatar: "https://example.com/avatar.jpg" })];
    const { container } = render(
      <Testimonials
        content={makeContent(items)}
        layout="professional"
      />,
    );
    const row = container.querySelector('[class*="attributionRow"]');
    expect(row).toBeInTheDocument();
    const img = row.querySelector("img");
    expect(img).toBeInTheDocument();
    const footer = row.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });

  it("renders avatar left of attribution for homeServices layout (attributionRow)", () => {
    const items = [makeItem({ avatar: "https://example.com/avatar.jpg" })];
    const { container } = render(
      <Testimonials
        content={makeContent(items)}
        layout="homeServices"
      />,
    );
    const row = container.querySelector('[class*="attributionRow"]');
    expect(row).toBeInTheDocument();
  });

  it("renders avatar centered above attribution for beauty layout", () => {
    const items = [makeItem({ avatar: "https://example.com/avatar.jpg" })];
    const { container } = render(
      <Testimonials
        content={makeContent(items)}
        layout="beauty"
      />,
    );
    expect(container.querySelector('[class*="attributionRow"]')).not.toBeInTheDocument();
    const centered = container.querySelector('[class*="avatarCentered"]');
    expect(centered).toBeInTheDocument();
    const img = centered.querySelector("img");
    expect(img).toBeInTheDocument();
  });

  it("renders avatar centered above attribution for foodHospitality layout", () => {
    const items = [makeItem({ avatar: "https://example.com/avatar.jpg" })];
    const { container } = render(
      <Testimonials
        content={makeContent(items)}
        layout="foodHospitality"
      />,
    );
    expect(container.querySelector('[class*="attributionRow"]')).not.toBeInTheDocument();
    const centered = container.querySelector('[class*="avatarCentered"]');
    expect(centered).toBeInTheDocument();
  });

  it("renders ? as initial when author is missing", () => {
    const items = [makeItem({ author: undefined, avatar: undefined })];
    render(
      <Testimonials
        content={makeContent(items)}
        layout="professional"
      />,
    );
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("handles mix of items with and without avatars", () => {
    const items = [
      makeItem({ author: "Alice", avatar: "https://example.com/alice.jpg" }),
      makeItem({ author: "Bob", avatar: undefined }),
      makeItem({ author: "Carol", avatar: "https://example.com/carol.jpg" }),
    ];
    render(
      <Testimonials
        content={makeContent(items)}
        layout="professional"
      />,
    );
    expect(screen.getByAltText("Alice avatar")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByAltText("Carol avatar")).toBeInTheDocument();
  });

  it("tracks multiple errored avatars independently", () => {
    const items = [
      makeItem({ author: "Alice", avatar: "https://example.com/broken1.jpg" }),
      makeItem({ author: "Bob", avatar: "https://example.com/ok.jpg" }),
      makeItem({ author: "Carol", avatar: "https://example.com/broken2.jpg" }),
    ];
    render(
      <Testimonials
        content={makeContent(items)}
        layout="professional"
      />,
    );
    fireEvent.error(screen.getByAltText("Alice avatar"));
    fireEvent.error(screen.getByAltText("Carol avatar"));
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByAltText("Bob avatar")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });
});
