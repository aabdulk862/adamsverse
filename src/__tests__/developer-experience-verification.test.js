/**
 * Developer Experience Verification Tests
 *
 * These tests verify that the Adverse WeBuilder platform delivers on its
 * developer experience promises:
 *
 * 1. A new package can be created with ONLY a Package_Config JSON — no new
 *    React components needed (Requirement 10.1)
 * 2. A new theme can be created with ONLY a theme object — no CSS file
 *    modifications needed (Requirement 10.2)
 * 3. The Section_Registry reports content schema conflicts via console
 *    warnings at module load time (Requirement 10.5)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validatePackageConfig, getValidationErrors } from "../schemas/packageSchema.js";
import { validateTheme } from "../schemas/themeSchema.js";
import { sectionRegistry, resolveSection, getManifest } from "../registry/sectionRegistry.js";
import { checkContentSchemaConflicts } from "../registry/sectionRegistry.js";

describe("Developer Experience: New Package Creation (Requirement 10.1)", () => {
  it("a new 'pet-grooming' package using only existing section types passes validation without any new components", () => {
    // This Package_Config uses ONLY section types already in the registry:
    // hero, services, gallery, testimonials, cta, contact
    const petGroomingPackage = {
      slug: "pet-grooming",
      name: "Pet Grooming Salon",
      category: "Pet Services",
      description:
        "A friendly pet grooming website with service listings, gallery of happy pets, and online booking.",
      packageType: "static",
      themeRef: "pet-grooming-pawprint",
      sections: {
        hero: {
          headline: "Pamper Your Furry Friend",
          subheadline:
            "Professional grooming services that keep your pet looking and feeling their best.",
          ctaText: "Book a Grooming Session",
          heroImage: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
        },
        services: {
          heading: "Our Grooming Services",
          items: [
            {
              title: "Full Groom Package",
              description:
                "Bath, blow-dry, haircut, nail trim, ear cleaning, and finishing spritz for a complete refresh.",
              icon: "🐕",
            },
            {
              title: "Bath & Brush",
              description:
                "A thorough bath with premium shampoo, blow-dry, and brush-out to keep coats shiny and tangle-free.",
              icon: "🛁",
            },
            {
              title: "Nail Trim & Paw Care",
              description:
                "Gentle nail trimming and paw pad moisturizing to keep your pet comfortable and healthy.",
              icon: "✂️",
            },
            {
              title: "De-Shedding Treatment",
              description:
                "Specialized treatment to reduce shedding by up to 80%, keeping your home fur-free.",
              icon: "🧹",
            },
          ],
        },
        gallery: {
          heading: "Happy Pets Gallery",
          images: [
            {
              src: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
              alt: "Golden retriever after a fresh grooming session",
            },
            {
              src: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
              alt: "Two happy dogs playing after their bath",
            },
            {
              src: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80",
              alt: "Poodle with a fresh haircut looking proud",
            },
          ],
        },
        testimonials: {
          heading: "What Pet Parents Say",
          items: [
            {
              quote:
                "My dog actually gets excited when we pull into the parking lot. They clearly love animals here.",
              author: "Sarah Mitchell",
              role: "Dog Mom",
            },
            {
              quote:
                "Best grooming service in town. My cat came back looking like a show cat!",
              author: "Tom Rodriguez",
              role: "Cat Owner",
            },
          ],
        },
        cta: {
          heading: "Your Pet Deserves the Best",
          body: "Book a grooming session today and see the difference professional care makes.",
          buttonText: "Schedule Now",
        },
        contact: {
          heading: "Visit Us",
          phone: "+1-555-PETS",
          email: "hello@petgrooming.com",
          address: "456 Bark Avenue, Petville, CA 90210",
          hours: "Mon-Sat 8am-6pm, Sun 10am-4pm",
        },
      },
      metadata: {
        phone: "+1-555-PETS",
        email: "hello@petgrooming.com",
        address: "456 Bark Avenue, Petville, CA 90210",
        hours: "Mon-Sat 8am-6pm, Sun 10am-4pm",
      },
    };

    // Validate the package config passes schema validation
    const isValid = validatePackageConfig(petGroomingPackage);
    if (!isValid) {
      const errors = getValidationErrors();
      throw new Error(
        `Package validation failed:\n${errors.map((e) => `  ${e.path}: ${e.message}`).join("\n")}`
      );
    }
    expect(isValid).toBe(true);

    // Verify all section types used are registered in the Section_Registry
    const sectionTypes = Object.keys(petGroomingPackage.sections);
    const manifest = getManifest();
    for (const type of sectionTypes) {
      expect(manifest[type]).toBeDefined();
      expect(resolveSection(type)).not.toBeNull();
    }

    // Verify no new components are needed — all types resolve to existing components
    expect(sectionTypes.every((type) => type in manifest)).toBe(true);
  });

  it("a new 'yoga-studio' package using a subset of section types also passes validation", () => {
    const yogaStudioPackage = {
      slug: "yoga-studio",
      name: "Serenity Yoga Studio",
      category: "Beauty & Wellness",
      description: "A calming yoga studio website with class schedules and instructor profiles.",
      sections: {
        hero: {
          headline: "Find Your Inner Peace",
          subheadline: "Join our community of mindful practitioners.",
          ctaText: "View Class Schedule",
        },
        services: {
          heading: "Our Classes",
          items: [
            {
              title: "Vinyasa Flow",
              description: "Dynamic sequences linking breath with movement.",
              icon: "🧘",
            },
          ],
        },
        cta: {
          heading: "Start Your Journey",
          buttonText: "Sign Up Free",
        },
      },
    };

    const isValid = validatePackageConfig(yogaStudioPackage);
    expect(isValid).toBe(true);
  });
});

describe("Developer Experience: New Theme Creation (Requirement 10.2)", () => {
  it("a new theme object passes validation without any CSS file modifications", () => {
    // A completely new theme for the hypothetical pet-grooming package
    const petGroomingTheme = {
      name: "pet-grooming-pawprint",
      label: "Pawprint",
      colors: {
        bgBase: "#faf8f5",
        bgSurface: "#f0ebe4",
        bgMuted: "#e4ddd4",
        textPrimary: "#2a2420",
        textSecondary: "#5a4e44",
        textMuted: "#8a7e74",
        accent: "#d4804a",
        accentHover: "#e0925a",
        accentText: "#ffffff",
        border: "#d8cec4",
      },
      typography: {
        fontDisplay: "Fredoka",
        fontBody: "Nunito",
        weightLight: "300",
        weightRegular: "400",
        weightMedium: "500",
        weightBold: "700",
        trackingDisplay: "0.01em",
        trackingBody: "0.005em",
      },
      shape: {
        radiusSmall: "8px",
        radiusMedium: "14px",
        radiusLarge: "24px",
        buttonStyle: "pill",
        cardStyle: "elevated",
      },
    };

    // Validate the theme passes schema validation
    const result = validateTheme(petGroomingTheme);
    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it("a new theme with optional groups (spacing, shadow, motion) also passes validation", () => {
    const fullTheme = {
      name: "pet-grooming-ocean",
      label: "Ocean Breeze",
      colors: {
        bgBase: "#f0f6fa",
        bgSurface: "#e0ecf4",
        bgMuted: "#c8dae8",
        textPrimary: "#14202e",
        textSecondary: "#3a5068",
        textMuted: "#7a90a4",
        accent: "#1a6aa0",
        accentHover: "#2a7ab0",
        accentText: "#ffffff",
        border: "#b0c8d8",
      },
      typography: {
        fontDisplay: "Quicksand",
        fontBody: "Open Sans",
        weightLight: "300",
        weightRegular: "400",
        weightMedium: "500",
        weightBold: "700",
        trackingDisplay: "0.01em",
        trackingBody: "0.005em",
      },
      shape: {
        radiusSmall: "6px",
        radiusMedium: "12px",
        radiusLarge: "20px",
        buttonStyle: "rounded",
        cardStyle: "bordered",
      },
      spacing: {
        sectionPadding: "4rem 1.5rem",
        containerMaxWidth: "1100px",
        gridGap: "1.5rem",
        stackGap: "1rem",
      },
      shadow: {
        shadowSmall: "0 1px 2px rgba(0,0,0,0.08)",
        shadowMedium: "0 3px 10px rgba(0,0,0,0.12)",
        shadowLarge: "0 6px 24px rgba(0,0,0,0.18)",
        shadowCard: "0 2px 6px rgba(0,0,0,0.08)",
      },
      motion: {
        durationFast: "120ms",
        durationNormal: "250ms",
        durationSlow: "450ms",
        easingDefault: "cubic-bezier(0.4, 0, 0.2, 1)",
        easingBounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    };

    const result = validateTheme(fullTheme);
    expect(result.valid).toBe(true);
  });

  it("a theme missing required fields is correctly rejected", () => {
    const invalidTheme = {
      name: "incomplete-theme",
      label: "Incomplete",
      colors: {
        bgBase: "#ffffff",
        // Missing other required color keys
      },
      typography: {
        fontDisplay: "Arial",
        fontBody: "Helvetica",
        weightLight: "300",
        weightRegular: "400",
        weightMedium: "500",
        weightBold: "700",
        trackingDisplay: "0.01em",
        trackingBody: "0.005em",
      },
      shape: {
        radiusSmall: "4px",
        radiusMedium: "8px",
        radiusLarge: "12px",
        buttonStyle: "rounded",
        cardStyle: "flat",
      },
    };

    const result = validateTheme(invalidTheme);
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("Developer Experience: Section Registry Content Schema Conflict Detection (Requirement 10.5)", () => {
  let consoleWarnSpy;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it("checkContentSchemaConflicts is exported and callable", () => {
    expect(typeof checkContentSchemaConflicts).toBe("function");
  });

  it("reports no conflicts for the current registry (no field name conflicts with Package_Schema)", () => {
    // The current section content schemas should not conflict with Package_Schema structure
    const conflicts = checkContentSchemaConflicts();
    // Current registry should have no conflicts since section content fields
    // (headline, subheadline, items, etc.) don't overlap with Package_Schema
    // top-level fields (slug, name, category, description, packageType, themeRef, sections, metadata)
    expect(conflicts).toEqual([]);
  });

  it("detects conflicts when a section content schema has fields that clash with Package_Schema structure", () => {
    // Simulate a conflicting section by temporarily adding one to the registry
    // A section with a "slug" field of type "number" would conflict with Package_Schema's "slug" (string)
    const conflictingSchema = {
      type: "object",
      required: ["heading"],
      properties: {
        heading: { type: "string" },
        slug: { type: "number", description: "This conflicts with Package_Schema slug (string)" },
      },
    };

    // Test the conflict detection with a custom schema
    const conflicts = checkContentSchemaConflicts({
      "test-conflicting": {
        type: "test-conflicting",
        contentSchema: conflictingSchema,
        layouts: ["default"],
      },
    });

    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0]).toMatchObject({
      sectionType: "test-conflicting",
      field: "slug",
    });
  });
});
