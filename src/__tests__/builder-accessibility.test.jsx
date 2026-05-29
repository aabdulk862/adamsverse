import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TemplateSelector from "../components/builder/TemplateSelector";
import ThemePicker from "../components/builder/ThemePicker";
import BuilderLayout from "../components/builder/BuilderLayout";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
    section: ({ children, ...props }) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <section {...rest}>{children}</section>;
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("Accessibility — TemplateSelector", () => {
  it("uses radiogroup role for category selection", () => {
    render(
      <TemplateSelector onSelectTemplate={vi.fn()} onSelectBlank={vi.fn()} />
    );

    const radiogroup = screen.getByRole("radiogroup", { name: "Business categories" });
    expect(radiogroup).toBeInTheDocument();
  });

  it("supports arrow key navigation between categories", () => {
    render(
      <TemplateSelector onSelectTemplate={vi.fn()} onSelectBlank={vi.fn()} />
    );

    const firstCategory = screen.getByRole("radio", { name: "Food & Hospitality" });
    firstCategory.focus();

    fireEvent.keyDown(firstCategory, { key: "ArrowRight" });

    // After arrow right, the next category should be focused
    const secondCategory = screen.getByRole("radio", { name: "Beauty & Wellness" });
    expect(document.activeElement).toBe(secondCategory);
  });

  it("category cards have aria-checked attribute", () => {
    render(
      <TemplateSelector onSelectTemplate={vi.fn()} onSelectBlank={vi.fn()} />
    );

    const firstCategory = screen.getByRole("radio", { name: "Food & Hospitality" });
    expect(firstCategory).toHaveAttribute("aria-checked", "false");

    fireEvent.click(firstCategory);
    expect(firstCategory).toHaveAttribute("aria-checked", "true");
  });
});

describe("Accessibility — ThemePicker", () => {
  const themeProps = {
    packageSlug: "restaurant",
    activeThemeIndex: 0,
    customColors: null,
    onSelectTheme: vi.fn(),
    onCustomizeColor: vi.fn(),
    onReset: vi.fn(),
  };

  it("theme cards use radio role with aria-checked", () => {
    render(<ThemePicker {...themeProps} />);

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("aria-checked", "false");
  });

  it("customize toggle has aria-expanded attribute", () => {
    render(<ThemePicker {...themeProps} />);

    const toggle = screen.getByText("Customize Colors");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("color inputs have accessible labels", () => {
    render(<ThemePicker {...themeProps} />);

    fireEvent.click(screen.getByText("Customize Colors"));

    expect(screen.getByLabelText("Background Base hex value")).toBeInTheDocument();
    expect(screen.getByLabelText("Text Primary hex value")).toBeInTheDocument();
    expect(screen.getByLabelText("Accent hex value")).toBeInTheDocument();
  });
});

describe("Accessibility — BuilderLayout", () => {
  it("divider has correct ARIA attributes", () => {
    render(
      <BuilderLayout
        editor={<div>Editor</div>}
        preview={<div>Preview</div>}
      />
    );

    const divider = screen.getByRole("separator");
    expect(divider).toHaveAttribute("aria-orientation", "vertical");
    expect(divider).toHaveAttribute("aria-valuemin", "20");
    expect(divider).toHaveAttribute("aria-valuemax", "80");
    expect(divider).toHaveAttribute("aria-label", "Resize panels");
    expect(divider).toHaveAttribute("tabindex", "0");
  });
});
