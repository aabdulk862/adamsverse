import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { render } from "@testing-library/react";
import SectionRenderer from "../components/packages/SectionRenderer";
import themes from "../data/themes";

beforeAll(() => {
  global.IntersectionObserver = class {
    constructor(cb) { this._cb = cb; }
    observe() { this._cb([{ isIntersecting: true, intersectionRatio: 1 }]); }
    unobserve() {}
    disconnect() {}
  };
});

afterAll(() => { delete global.IntersectionObserver; });

const BASE_CONFIG = {
  slug: "real-estate-agent",
  name: "Test",
  category: "Professional",
  description: "Test package",
  packageType: "static",
  themeRef: "",
  sections: {
    hero: { headline: "Hello", subheadline: "World", ctaText: "Go", heroImage: "https://example.com/img.jpg" },
    services: { heading: "Services", items: [{ title: "Svc", description: "Desc", icon: "⭐" }] },
    cta: { heading: "CTA", body: "Body", buttonText: "Click" },
  },
};

const theme = themes["real-estate-agent"]?.[0] || null;

describe("SectionRenderer sectionOrder support", () => {
  it("renders in sectionOrder when provided", () => {
    const config = { ...BASE_CONFIG, sectionOrder: ["cta", "services", "hero"] };
    const { container } = render(
      <SectionRenderer config={config} theme={theme} layout="professional" packageName="Test" />
    );
    const sections = container.querySelectorAll("[data-section]");
    expect(sections[0].getAttribute("data-section")).toBe("cta");
    expect(sections[1].getAttribute("data-section")).toBe("services");
    expect(sections[2].getAttribute("data-section")).toBe("hero");
  });

  it("falls back to Object.keys when sectionOrder is absent", () => {
    const { container } = render(
      <SectionRenderer config={BASE_CONFIG} theme={theme} layout="professional" packageName="Test" />
    );
    const sections = container.querySelectorAll("[data-section]");
    const keys = Object.keys(BASE_CONFIG.sections);
    expect(sections.length).toBe(keys.length);
    keys.forEach((key, i) => {
      expect(sections[i].getAttribute("data-section")).toBe(key);
    });
  });

  it("filters out invalid keys in sectionOrder", () => {
    const config = { ...BASE_CONFIG, sectionOrder: ["hero", "nonexistent", "cta"] };
    const { container } = render(
      <SectionRenderer config={config} theme={theme} layout="professional" packageName="Test" />
    );
    const sections = container.querySelectorAll("[data-section]");
    expect(sections.length).toBe(2);
    expect(sections[0].getAttribute("data-section")).toBe("hero");
    expect(sections[1].getAttribute("data-section")).toBe("cta");
  });
});
