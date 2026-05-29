import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LivePreview from "../components/builder/LivePreview";

// Mock SectionRenderer
vi.mock("../components/packages/SectionRenderer", () => ({
  default: ({ config, theme, layout, packageName }) => (
    <div data-testid="section-renderer">
      <span data-testid="sr-package">{packageName}</span>
      <span data-testid="sr-layout">{layout}</span>
    </div>
  ),
}));

// Mock applyTheme and loadFonts
vi.mock("../utils/applyTheme", () => ({
  default: vi.fn(),
}));

vi.mock("../utils/fontLoader", () => ({
  default: vi.fn(),
}));

describe("LivePreview", () => {
  const mockConfig = {
    slug: "restaurant",
    name: "Restaurant",
    category: "Food & Hospitality",
    sections: {
      hero: { headline: "Test", subheadline: "Sub", ctaText: "CTA", heroImage: "" },
    },
  };

  const mockTheme = {
    name: "restaurant-candlelit",
    label: "Candlelit",
    colors: { accent: "#c9a96e", bgBase: "#1a1210", textPrimary: "#f5ede4" },
  };

  it("renders placeholder when config is null", () => {
    render(<LivePreview config={null} theme={mockTheme} layout="foodHospitality" />);

    expect(screen.getByText("Select a template to see your website preview.")).toBeInTheDocument();
  });

  it("renders placeholder when config has no sections", () => {
    render(<LivePreview config={{ slug: "test" }} theme={mockTheme} layout="professional" />);

    expect(screen.getByText("Select a template to see your website preview.")).toBeInTheDocument();
  });

  it("renders SectionRenderer with correct props when config is valid", () => {
    render(<LivePreview config={mockConfig} theme={mockTheme} layout="foodHospitality" />);

    expect(screen.getByTestId("section-renderer")).toBeInTheDocument();
    expect(screen.getByTestId("sr-package")).toHaveTextContent("Restaurant");
    expect(screen.getByTestId("sr-layout")).toHaveTextContent("foodHospitality");
  });

  it("has correct aria attributes for accessibility", () => {
    render(<LivePreview config={mockConfig} theme={mockTheme} layout="foodHospitality" />);

    const region = screen.getByRole("region", { name: "Website preview" });
    expect(region).toBeInTheDocument();
  });

  it("derives layout from config category when layout prop is not provided", () => {
    render(<LivePreview config={mockConfig} theme={mockTheme} layout="" />);

    expect(screen.getByTestId("sr-layout")).toHaveTextContent("foodHospitality");
  });
});
