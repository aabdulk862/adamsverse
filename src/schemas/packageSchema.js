import Ajv from "ajv";

/**
 * JSON Schema (draft 2020-12) for Package_Config objects.
 *
 * Defines the structure for package configurations including:
 * - slug: unique identifier (lowercase alphanumeric + hyphens)
 * - name: display name
 * - category: business category
 * - description: package description
 * - packageType: static/semi-dynamic/dynamic (defaults to "static")
 * - themeRef: reference to a registered theme
 * - sections: object with section-type keys mapping to content objects
 * - metadata: optional business info (phone, email, address, hours)
 *
 * Every property includes `description` and `examples` for AI-readiness.
 */
export const packageSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Adverse WeBuilder Package_Config",
  description:
    "A complete package configuration defining a website's sections, content, theme reference, and metadata. Used by the Section Renderer to dynamically assemble pages from configuration.",
  type: "object",
  required: ["slug", "name", "category", "description", "sections"],
  additionalProperties: false,
  properties: {
    slug: {
      type: "string",
      description:
        "Unique URL-safe identifier for the package, used in routing (/packages/:slug) and as a lookup key. Must be lowercase alphanumeric with hyphens only.",
      pattern: "^[a-z0-9]+(-[a-z0-9]+)*$",
      minLength: 1,
      maxLength: 128,
      examples: ["restaurant", "lash-studio", "auto-repair"],
    },
    name: {
      type: "string",
      description:
        "Human-readable display name for the package shown in UI listings and page titles.",
      minLength: 1,
      maxLength: 256,
      examples: ["Restaurant", "Lash & Beauty Studio", "Auto Repair Shop"],
    },
    category: {
      type: "string",
      description:
        "Business category used for filtering, layout variant selection, and grouping packages in the browse view.",
      minLength: 1,
      maxLength: 128,
      examples: ["Food & Hospitality", "Beauty & Wellness", "Home Services", "Professional"],
    },
    description: {
      type: "string",
      description:
        "Brief description of the package explaining the type of business and key features. Used in package listings and SEO metadata.",
      minLength: 0,
      maxLength: 1024,
      examples: [
        "An elegant dining experience website with menus, reservations, and a gallery of signature dishes.",
      ],
    },
    packageType: {
      type: "string",
      description:
        "Classification controlling rendering and caching strategy. Static packages render once, semi-dynamic re-render on edit, dynamic fetch content on each navigation.",
      enum: ["static", "semi-dynamic", "dynamic"],
      default: "static",
      examples: ["static"],
    },
    themeRef: {
      type: "string",
      description:
        "Reference to a registered theme identifier in the Theme Engine. The referenced theme provides all design tokens (colors, typography, shape, etc.) for the package.",
      examples: ["restaurant-candlelit", "beauty-blush", "professional-slate"],
    },
    sections: {
      type: "object",
      description:
        "Object containing named section keys, each mapping to a section configuration with section-type-specific content fields. Sections are rendered in the order they appear.",
      minProperties: 1,
      additionalProperties: {
        type: "object",
        description:
          "A section configuration object containing content fields specific to the section type (e.g., hero, services, gallery, testimonials, cta, contact).",
        examples: [{ headline: "Welcome", subheadline: "Your journey starts here" }],
      },
      examples: [
        {
          hero: {
            headline: "A Culinary Journey Awaits",
            subheadline: "Savor handcrafted dishes...",
            ctaText: "Reserve a Table",
            heroImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
          },
          services: {
            heading: "What We Offer",
            items: [{ title: "Private Dining", description: "Host intimate gatherings...", icon: "🍽️" }],
          },
        },
      ],
    },
    metadata: {
      type: "object",
      description:
        "Optional business metadata providing contact and operational information. Each field is optional and limited to 512 characters.",
      additionalProperties: false,
      properties: {
        phone: {
          type: "string",
          description:
            "Business phone number in any standard format (e.g., +1-555-0100, (555) 010-0100).",
          maxLength: 512,
          examples: ["+1-555-0100"],
        },
        email: {
          type: "string",
          description:
            "Business contact email address for customer inquiries.",
          maxLength: 512,
          examples: ["info@restaurant.com"],
        },
        address: {
          type: "string",
          description:
            "Physical business address including street, city, state, and zip code.",
          maxLength: 512,
          examples: ["123 Main St, Springfield, IL 62701"],
        },
        hours: {
          type: "string",
          description:
            "Business operating hours in a human-readable format.",
          maxLength: 512,
          examples: ["Mon-Sat 5pm-11pm"],
        },
      },
      examples: [
        {
          phone: "+1-555-0100",
          email: "info@restaurant.com",
          address: "123 Main St",
          hours: "Mon-Sat 5pm-11pm",
        },
      ],
    },
  },
};

// Compile the schema with ajv (allErrors: true for complete validation feedback)
// validateSchema: false avoids requiring the $schema meta-schema to be loaded
const ajv = new Ajv({ allErrors: true, useDefaults: true, validateSchema: false });
const validate = ajv.compile(packageSchema);

/**
 * Last validation errors from the most recent failed validation.
 * @type {Array<{ path: string, message: string, expected: string }>}
 */
let lastErrors = [];

/**
 * Validates a Package_Config object against the Package Schema.
 * Uses ajv with allErrors: true for complete error reporting.
 *
 * @param {object} config - Package_Config object to validate
 * @returns {boolean} true if the config is valid
 */
export function validatePackageConfig(config) {
  const valid = validate(config);
  if (valid) {
    lastErrors = [];
    return true;
  }

  lastErrors = validate.errors.map((err) => ({
    path: err.instancePath || "/",
    message: err.message || "Unknown validation error",
    expected: err.params
      ? JSON.stringify(err.params)
      : "unknown",
  }));

  return false;
}

/**
 * Returns detailed validation errors from the last failed validation.
 * Call this after `validatePackageConfig` returns false to get error details.
 *
 * @returns {Array<{ path: string, message: string, expected: string }>}
 */
export function getValidationErrors() {
  return lastErrors;
}
