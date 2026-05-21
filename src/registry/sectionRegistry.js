import { lazy } from "react";

/**
 * @typedef {Object} SectionRegistryEntry
 * @property {string} type - Section type identifier (e.g., "hero")
 * @property {() => Promise<{default: import('react').ComponentType}>} loader - Dynamic import function for the section component
 * @property {object} contentSchema - JSON Schema defining the section's content structure
 * @property {string[]} layouts - Supported layout variant identifiers
 */

/**
 * Content schema for HeroSection.
 * @type {object}
 */
const heroContentSchema = {
  type: "object",
  required: ["headline"],
  properties: {
    headline: {
      type: "string",
      description: "Main heading text displayed prominently in the hero area",
      examples: ["Welcome to Our Business"],
    },
    subheadline: {
      type: "string",
      description: "Supporting text displayed below the headline for additional context",
      examples: ["We provide exceptional services tailored to your needs"],
    },
    ctaText: {
      type: "string",
      description: "Call-to-action button label that encourages user interaction",
      examples: ["Get Started"],
    },
    heroImage: {
      type: "string",
      format: "uri",
      description: "URL for the hero background or feature image",
      examples: ["https://images.unsplash.com/photo-1234567890"],
    },
  },
  additionalProperties: false,
};

/**
 * Content schema for ServicesSection.
 * @type {object}
 */
const servicesContentSchema = {
  type: "object",
  required: ["heading", "items"],
  properties: {
    heading: {
      type: "string",
      description: "Section heading displayed above the services list",
      examples: ["Our Services"],
    },
    items: {
      type: "array",
      description: "List of service offerings displayed as cards or list items",
      minItems: 1,
      maxItems: 20,
      items: {
        type: "object",
        required: ["title", "description"],
        properties: {
          title: {
            type: "string",
            description: "Service name or title",
            examples: ["Web Design"],
          },
          description: {
            type: "string",
            description: "Brief description of the service offering",
            examples: ["Custom websites built for your business needs"],
          },
          icon: {
            type: "string",
            description: "Emoji or icon identifier representing the service",
            examples: ["🎨"],
          },
        },
        additionalProperties: false,
      },
      examples: [
        [
          { title: "Web Design", description: "Custom websites built for your business needs", icon: "🎨" },
        ],
      ],
    },
  },
  additionalProperties: false,
};

/**
 * Content schema for GallerySection.
 * @type {object}
 */
const galleryContentSchema = {
  type: "object",
  required: ["heading", "images"],
  properties: {
    heading: {
      type: "string",
      description: "Section heading displayed above the image gallery",
      examples: ["Our Work"],
    },
    images: {
      type: "array",
      description: "Collection of images displayed in a grid or carousel layout",
      minItems: 1,
      maxItems: 30,
      items: {
        type: "object",
        required: ["src", "alt"],
        properties: {
          src: {
            type: "string",
            format: "uri",
            description: "URL of the gallery image",
            examples: ["https://images.unsplash.com/photo-gallery-1"],
          },
          alt: {
            type: "string",
            description: "Accessible alt text describing the image content",
            examples: ["Completed project showcase"],
          },
        },
        additionalProperties: false,
      },
      examples: [
        [
          { src: "https://images.unsplash.com/photo-gallery-1", alt: "Completed project showcase" },
        ],
      ],
    },
  },
  additionalProperties: false,
};

/**
 * Content schema for TestimonialsSection.
 * @type {object}
 */
const testimonialsContentSchema = {
  type: "object",
  required: ["heading", "items"],
  properties: {
    heading: {
      type: "string",
      description: "Section heading displayed above the testimonials",
      examples: ["What Our Clients Say"],
    },
    items: {
      type: "array",
      description: "Collection of client testimonials displayed as quote cards",
      minItems: 1,
      maxItems: 20,
      items: {
        type: "object",
        required: ["quote", "author"],
        properties: {
          quote: {
            type: "string",
            description: "The testimonial text or client quote",
            examples: ["Outstanding service and attention to detail!"],
          },
          author: {
            type: "string",
            description: "Name of the person providing the testimonial",
            examples: ["Jane Smith"],
          },
          role: {
            type: "string",
            description: "Job title or role of the testimonial author",
            examples: ["CEO, Acme Corp"],
          },
          avatar: {
            type: "string",
            format: "uri",
            description: "URL of the author's profile photo or avatar",
            examples: ["https://images.unsplash.com/photo-avatar-1"],
          },
        },
        additionalProperties: false,
      },
      examples: [
        [
          { quote: "Outstanding service and attention to detail!", author: "Jane Smith", role: "CEO, Acme Corp" },
        ],
      ],
    },
  },
  additionalProperties: false,
};

/**
 * Content schema for CTASection.
 * @type {object}
 */
const ctaContentSchema = {
  type: "object",
  required: ["heading", "buttonText"],
  properties: {
    heading: {
      type: "string",
      description: "Main call-to-action heading that prompts user engagement",
      examples: ["Ready to Get Started?"],
    },
    body: {
      type: "string",
      description: "Supporting body text providing additional context for the CTA",
      examples: ["Contact us today and let's discuss your project"],
    },
    buttonText: {
      type: "string",
      description: "Text label for the primary action button",
      examples: ["Contact Us"],
    },
  },
  additionalProperties: false,
};

/**
 * Content schema for ContactSection.
 * @type {object}
 */
const contactContentSchema = {
  type: "object",
  required: ["heading"],
  properties: {
    heading: {
      type: "string",
      description: "Section heading displayed above the contact information",
      examples: ["Get In Touch"],
    },
    phone: {
      type: "string",
      description: "Business phone number for customer inquiries",
      examples: ["+1-555-0100"],
    },
    email: {
      type: "string",
      description: "Business email address for customer communication",
      examples: ["info@business.com"],
    },
    address: {
      type: "string",
      description: "Physical business address or location",
      examples: ["123 Main Street, City, State 12345"],
    },
    hours: {
      type: "string",
      description: "Business operating hours",
      examples: ["Mon-Fri 9am-5pm"],
    },
  },
  additionalProperties: false,
};

/**
 * The section registry manifest mapping section type identifiers
 * to their component loaders, content schemas, and layout variants.
 * @type {Record<string, SectionRegistryEntry>}
 */
export const sectionRegistry = {
  hero: {
    type: "hero",
    loader: () => import("../components/packages/Hero.jsx"),
    contentSchema: heroContentSchema,
    layouts: ["professional", "beauty", "homeServices", "foodHospitality"],
  },
  services: {
    type: "services",
    loader: () => import("../components/packages/Services.jsx"),
    contentSchema: servicesContentSchema,
    layouts: ["professional", "beauty", "homeServices", "foodHospitality"],
  },
  gallery: {
    type: "gallery",
    loader: () => import("../components/packages/Gallery.jsx"),
    contentSchema: galleryContentSchema,
    layouts: ["professional", "beauty", "homeServices", "foodHospitality"],
  },
  testimonials: {
    type: "testimonials",
    loader: () => import("../components/packages/Testimonials.jsx"),
    contentSchema: testimonialsContentSchema,
    layouts: ["professional", "beauty", "homeServices", "foodHospitality"],
  },
  cta: {
    type: "cta",
    loader: () => import("../components/packages/CTA.jsx"),
    contentSchema: ctaContentSchema,
    layouts: ["professional", "beauty", "homeServices", "foodHospitality"],
  },
  contact: {
    type: "contact",
    loader: () => import("../components/packages/ContactSection.jsx"),
    contentSchema: contactContentSchema,
    layouts: ["professional", "beauty"],
  },
};

/**
 * Cache for React.lazy components to avoid creating new lazy wrappers on each call.
 * @type {Map<string, import('react').LazyExoticComponent>}
 */
const lazyCache = new Map();

/**
 * Resolves a section type to its lazy-loaded React component.
 * Returns null if the type is not registered.
 *
 * @param {string} type - Section type identifier (e.g., "hero", "services")
 * @returns {import('react').LazyExoticComponent | null} Lazy-loaded component or null if type not found
 */
export function resolveSection(type) {
  const entry = sectionRegistry[type];
  if (!entry) {
    return null;
  }

  if (!lazyCache.has(type)) {
    lazyCache.set(type, lazy(entry.loader));
  }

  return lazyCache.get(type);
}

/**
 * Returns the full section registry manifest for AI consumption.
 * Each entry contains the type identifier, content schema (JSON Schema),
 * and supported layout variant identifiers.
 *
 * @returns {Record<string, SectionRegistryEntry>} The complete registry manifest
 */
export function getManifest() {
  return sectionRegistry;
}

/**
 * Package_Schema top-level field definitions used for conflict detection.
 * Maps field names to their expected types in the Package_Schema.
 * @type {Record<string, string>}
 */
const PACKAGE_SCHEMA_FIELDS = {
  slug: "string",
  name: "string",
  category: "string",
  description: "string",
  packageType: "string",
  themeRef: "string",
  sections: "object",
  metadata: "object",
};

/**
 * Checks if any registered section's content schema has field name conflicts
 * with the Package_Schema structure. A conflict occurs when a section content
 * schema defines a field with the same name as a Package_Schema top-level field
 * but with an incompatible type.
 *
 * This helps prevent confusion when section content is embedded within a
 * Package_Config, ensuring field names don't collide with structural fields.
 *
 * @param {Record<string, SectionRegistryEntry>} [registryOverride] - Optional registry to check (defaults to the main sectionRegistry)
 * @returns {Array<{ sectionType: string, field: string, sectionFieldType: string, packageFieldType: string, message: string }>} Array of detected conflicts
 */
export function checkContentSchemaConflicts(registryOverride) {
  const registry = registryOverride || sectionRegistry;
  const conflicts = [];

  for (const [sectionType, entry] of Object.entries(registry)) {
    const contentSchema = entry.contentSchema;
    if (!contentSchema || !contentSchema.properties) continue;

    for (const [fieldName, fieldDef] of Object.entries(contentSchema.properties)) {
      if (fieldName in PACKAGE_SCHEMA_FIELDS) {
        const packageFieldType = PACKAGE_SCHEMA_FIELDS[fieldName];
        const sectionFieldType = fieldDef.type || "unknown";

        // Conflict exists if the types are incompatible
        if (sectionFieldType !== packageFieldType) {
          const conflict = {
            sectionType,
            field: fieldName,
            sectionFieldType,
            packageFieldType,
            message: `Section "${sectionType}" content schema defines field "${fieldName}" as type "${sectionFieldType}" which conflicts with Package_Schema field "${fieldName}" of type "${packageFieldType}"`,
          };
          conflicts.push(conflict);
          console.warn(
            `[Section_Registry] Content schema conflict: ${conflict.message}`
          );
        }
      }
    }
  }

  return conflicts;
}

// Run conflict detection at module load time (Requirement 10.5)
checkContentSchemaConflicts();
