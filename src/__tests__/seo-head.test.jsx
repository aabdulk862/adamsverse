import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import SEOHead from "../components/SEOHead";

const liveProducts = [
  {
    id: "cs-reference-guide",
    name: "CS Reference Guide",
    description: "Interactive computer science reference with algorithms, data structures, and system design patterns.",
    category: "tools",
    url: "https://csreferenceguide.com",
    icon: "fas fa-book-open",
    status: "live",
    requiresSubscription: false,
    isExternal: true,
  },
  {
    id: "basecamp-atlas",
    name: "Basecamp Atlas",
    description: "Discover apartments and retreats with intelligent search, map views, and neighborhood insights.",
    category: "tools",
    url: "https://basecampatlas.com",
    icon: "fas fa-map-marked-alt",
    status: "live",
    requiresSubscription: false,
    isExternal: true,
  },
  {
    id: "website-packages",
    name: "Website Packages",
    description: "Ready-to-launch website designs for your industry. Preview live, pick a theme, launch in days.",
    category: "services",
    url: "/packages",
    icon: "fas fa-layer-group",
    status: "live",
    requiresSubscription: false,
    isExternal: false,
  },
];

afterEach(() => {
  cleanup();
});

describe("SEOHead", () => {
  it("sets page title between 30-60 chars containing 'Adverse Solutions'", () => {
    render(<SEOHead products={liveProducts} />);
    const title = document.title;
    expect(title).toContain("Adverse Solutions");
    expect(title.length).toBeGreaterThanOrEqual(30);
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it("sets meta description between 120-160 chars referencing ≥2 products", () => {
    render(<SEOHead products={liveProducts} />);
    const meta = document.querySelector('meta[name="description"]');
    expect(meta).not.toBeNull();
    const content = meta.getAttribute("content");
    expect(content.length).toBeGreaterThanOrEqual(120);
    expect(content.length).toBeLessThanOrEqual(160);
    // Should reference at least 2 products
    const productNames = liveProducts.map((p) => p.name);
    const matches = productNames.filter((name) => content.includes(name));
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("generates JSON-LD ItemList with all live products", () => {
    render(<SEOHead products={liveProducts} />);
    const script = document.getElementById("seo-jsonld-itemlist");
    expect(script).not.toBeNull();
    const data = JSON.parse(script.textContent);
    expect(data["@type"]).toBe("ItemList");
    expect(data.itemListElement).toHaveLength(liveProducts.length);
    data.itemListElement.forEach((item, i) => {
      expect(item["@type"]).toBe("ListItem");
      expect(item.position).toBe(i + 1);
      expect(item.name).toBe(liveProducts[i].name);
      expect(item.description).toBe(liveProducts[i].description);
      expect(item.url).toBeTruthy();
    });
  });

  it("generates JSON-LD Organization with correct fields", () => {
    render(<SEOHead products={liveProducts} />);
    const script = document.getElementById("seo-jsonld-organization");
    expect(script).not.toBeNull();
    const data = JSON.parse(script.textContent);
    expect(data["@type"]).toBe("Organization");
    expect(data.name).toBe("Adverse Solutions");
    expect(data.logo).toBeTruthy();
    expect(data.url).toBe("https://adversesolutions.com");
    expect(data.sameAs).toBeInstanceOf(Array);
    expect(data.sameAs.length).toBeGreaterThanOrEqual(1);
  });

  it("includes Open Graph tags", () => {
    render(<SEOHead products={liveProducts} />);
    expect(document.querySelector('meta[property="og:title"]')).not.toBeNull();
    expect(document.querySelector('meta[property="og:description"]')).not.toBeNull();
    expect(document.querySelector('meta[property="og:image"]')).not.toBeNull();
    expect(document.querySelector('meta[property="og:url"]')).not.toBeNull();
    const ogType = document.querySelector('meta[property="og:type"]');
    expect(ogType).not.toBeNull();
    expect(ogType.getAttribute("content")).toBe("website");
  });

  it("includes Twitter Card tags with summary_large_image", () => {
    render(<SEOHead products={liveProducts} />);
    const card = document.querySelector('meta[name="twitter:card"]');
    expect(card).not.toBeNull();
    expect(card.getAttribute("content")).toBe("summary_large_image");
    expect(document.querySelector('meta[name="twitter:title"]')).not.toBeNull();
    expect(document.querySelector('meta[name="twitter:description"]')).not.toBeNull();
    expect(document.querySelector('meta[name="twitter:image"]')).not.toBeNull();
  });

  it("handles empty products array gracefully (no ItemList)", () => {
    render(<SEOHead products={[]} />);
    const script = document.getElementById("seo-jsonld-itemlist");
    expect(script).toBeNull();
  });

  it("generates correct URLs for relative product paths", () => {
    render(<SEOHead products={liveProducts} />);
    const script = document.getElementById("seo-jsonld-itemlist");
    const data = JSON.parse(script.textContent);
    // Website Packages has relative URL "/packages"
    const packagesItem = data.itemListElement.find(
      (item) => item.name === "Website Packages"
    );
    expect(packagesItem.url).toBe("https://adversesolutions.com/packages");
  });
});
