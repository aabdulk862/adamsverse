import Ajv from "ajv";

/**
 * JSON Schema (draft 2020-12) for Theme objects.
 *
 * Defines required groups (colors: 10 keys, typography: 8 keys, shape: 5 keys)
 * and optional groups (spacing: 4 keys, shadow: 4 keys, motion: 5 keys).
 *
 * Every property includes `description` and `examples` for AI-readiness.
 */
const themeSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Adverse WeBuilder Theme",
  description:
    "A theme object defining design tokens for colors, typography, shape, and optional spacing, shadow, and motion groups. Used by the Theme Engine to apply scoped CSS custom properties.",
  type: "object",
  required: ["name", "label", "colors", "typography", "shape"],
  additionalProperties: false,
  properties: {
    name: {
      type: "string",
      description:
        "Unique theme identifier used as a reference key in package configurations",
      examples: ["restaurant-candlelit"],
    },
    label: {
      type: "string",
      description: "Human-readable display name for the theme shown in UI",
      examples: ["Candlelit"],
    },
    colors: {
      type: "object",
      description:
        "Color design tokens applied as --color-{key} CSS custom properties",
      required: [
        "bgBase",
        "bgSurface",
        "bgMuted",
        "textPrimary",
        "textSecondary",
        "textMuted",
        "accent",
        "accentHover",
        "accentText",
        "border",
      ],
      additionalProperties: false,
      properties: {
        bgBase: {
          type: "string",
          description:
            "Base background color for the page or outermost container",
          examples: ["#1a1210"],
        },
        bgSurface: {
          type: "string",
          description:
            "Surface background color for cards, modals, and elevated elements",
          examples: ["#2a1f1a"],
        },
        bgMuted: {
          type: "string",
          description:
            "Muted background color for subtle sections and disabled states",
          examples: ["#3a2f28"],
        },
        textPrimary: {
          type: "string",
          description: "Primary text color for headings and body content",
          examples: ["#f5ede4"],
        },
        textSecondary: {
          type: "string",
          description:
            "Secondary text color for subheadings and supporting content",
          examples: ["#d4b87d"],
        },
        textMuted: {
          type: "string",
          description:
            "Muted text color for captions, placeholders, and de-emphasized content",
          examples: ["#8a7560"],
        },
        accent: {
          type: "string",
          description:
            "Primary accent color for buttons, links, and interactive elements",
          examples: ["#c9a96e"],
        },
        accentHover: {
          type: "string",
          description:
            "Hover state color for accent elements providing visual feedback",
          examples: ["#d4b87d"],
        },
        accentText: {
          type: "string",
          description:
            "Text color used on accent-colored backgrounds for contrast",
          examples: ["#1a1210"],
        },
        border: {
          type: "string",
          description:
            "Border color for dividers, card edges, and input outlines",
          examples: ["#3a2f28"],
        },
      },
    },
    typography: {
      type: "object",
      description:
        "Typography design tokens applied as --font-{key} CSS custom properties",
      required: [
        "fontDisplay",
        "fontBody",
        "weightLight",
        "weightRegular",
        "weightMedium",
        "weightBold",
        "trackingDisplay",
        "trackingBody",
      ],
      additionalProperties: false,
      properties: {
        fontDisplay: {
          type: "string",
          description:
            "Font family for display headings and hero text (e.g., serif or decorative fonts)",
          examples: ["Cormorant Garamond"],
        },
        fontBody: {
          type: "string",
          description:
            "Font family for body text, paragraphs, and UI elements (e.g., sans-serif fonts)",
          examples: ["DM Sans"],
        },
        weightLight: {
          type: "string",
          description:
            "CSS font-weight value for light text (captions, subtle labels)",
          examples: ["300"],
        },
        weightRegular: {
          type: "string",
          description:
            "CSS font-weight value for regular body text",
          examples: ["400"],
        },
        weightMedium: {
          type: "string",
          description:
            "CSS font-weight value for medium emphasis text (subheadings, buttons)",
          examples: ["500"],
        },
        weightBold: {
          type: "string",
          description:
            "CSS font-weight value for bold text (headings, strong emphasis)",
          examples: ["700"],
        },
        trackingDisplay: {
          type: "string",
          description:
            "CSS letter-spacing value for display/heading text",
          examples: ["0.02em"],
        },
        trackingBody: {
          type: "string",
          description:
            "CSS letter-spacing value for body text",
          examples: ["0.01em"],
        },
      },
    },
    shape: {
      type: "object",
      description:
        "Shape design tokens applied as --shape-{key} CSS custom properties",
      required: [
        "radiusSmall",
        "radiusMedium",
        "radiusLarge",
        "buttonStyle",
        "cardStyle",
      ],
      additionalProperties: false,
      properties: {
        radiusSmall: {
          type: "string",
          description:
            "Small border-radius for chips, badges, and compact elements",
          examples: ["2px"],
        },
        radiusMedium: {
          type: "string",
          description:
            "Medium border-radius for buttons, inputs, and standard cards",
          examples: ["4px"],
        },
        radiusLarge: {
          type: "string",
          description:
            "Large border-radius for modals, hero sections, and featured cards",
          examples: ["8px"],
        },
        buttonStyle: {
          type: "string",
          description:
            "Named button shape variant controlling border-radius and padding style",
          enum: ["sharp", "rounded", "pill"],
          examples: ["sharp"],
        },
        cardStyle: {
          type: "string",
          description:
            "Named card shape variant controlling border, shadow, and radius treatment",
          enum: ["flat", "bordered", "elevated"],
          examples: ["flat"],
        },
      },
    },
    spacing: {
      type: "object",
      description:
        "Optional spacing design tokens applied as --spacing-{key} CSS custom properties. Themes without this group remain valid.",
      additionalProperties: false,
      properties: {
        sectionPadding: {
          type: "string",
          description:
            "CSS padding value for major page sections (supports shorthand like '5rem 2rem')",
          examples: ["5rem 2rem"],
        },
        containerMaxWidth: {
          type: "string",
          description:
            "Maximum width for the main content container",
          examples: ["1200px"],
        },
        gridGap: {
          type: "string",
          description:
            "Gap between grid items in multi-column layouts",
          examples: ["2rem"],
        },
        stackGap: {
          type: "string",
          description:
            "Vertical gap between stacked elements in a column layout",
          examples: ["1.5rem"],
        },
      },
      required: ["sectionPadding", "containerMaxWidth", "gridGap", "stackGap"],
    },
    shadow: {
      type: "object",
      description:
        "Optional shadow design tokens applied as --shadow-{key} CSS custom properties. Themes without this group remain valid.",
      additionalProperties: false,
      properties: {
        shadowSmall: {
          type: "string",
          description:
            "Subtle box-shadow for hover states and small interactive elements",
          examples: ["0 1px 3px rgba(0,0,0,0.12)"],
        },
        shadowMedium: {
          type: "string",
          description:
            "Medium box-shadow for cards and floating elements",
          examples: ["0 4px 12px rgba(0,0,0,0.15)"],
        },
        shadowLarge: {
          type: "string",
          description:
            "Large box-shadow for modals, dropdowns, and prominent overlays",
          examples: ["0 8px 30px rgba(0,0,0,0.2)"],
        },
        shadowCard: {
          type: "string",
          description:
            "Default box-shadow applied to card components",
          examples: ["0 2px 8px rgba(0,0,0,0.1)"],
        },
      },
      required: ["shadowSmall", "shadowMedium", "shadowLarge", "shadowCard"],
    },
    motion: {
      type: "object",
      description:
        "Optional motion preset tokens applied as --motion-{key} CSS custom properties. Themes without this group remain valid.",
      additionalProperties: false,
      properties: {
        durationFast: {
          type: "string",
          description:
            "Short animation duration for micro-interactions (hover, focus)",
          examples: ["150ms"],
        },
        durationNormal: {
          type: "string",
          description:
            "Standard animation duration for transitions and state changes",
          examples: ["300ms"],
        },
        durationSlow: {
          type: "string",
          description:
            "Long animation duration for entrance animations and page transitions",
          examples: ["500ms"],
        },
        easingDefault: {
          type: "string",
          description:
            "Default CSS easing function for smooth, natural transitions",
          examples: ["cubic-bezier(0.4, 0, 0.2, 1)"],
        },
        easingBounce: {
          type: "string",
          description:
            "Bouncy CSS easing function for playful, attention-grabbing animations",
          examples: ["cubic-bezier(0.68, -0.55, 0.265, 1.55)"],
        },
      },
      required: [
        "durationFast",
        "durationNormal",
        "durationSlow",
        "easingDefault",
        "easingBounce",
      ],
    },
  },
};

// Compile the schema with ajv (allErrors: true for complete validation feedback)
// validateSchema: false avoids requiring the $schema meta-schema to be loaded
const ajv = new Ajv({ allErrors: true, validateSchema: false });
const validate = ajv.compile(themeSchema);

/**
 * Validates a theme object against the theme JSON Schema.
 *
 * @param {object} theme - Theme object to validate
 * @returns {{ valid: boolean, errors?: Array<{ path: string, message: string }> }}
 */
export function validateTheme(theme) {
  const valid = validate(theme);
  if (valid) {
    return { valid: true };
  }

  const errors = validate.errors.map((err) => ({
    path: err.instancePath || "/",
    message: err.message || "Unknown validation error",
  }));

  return { valid: false, errors };
}

/**
 * Returns the raw JSON Schema object for theme validation.
 * Useful for AI systems to introspect the schema structure.
 *
 * @returns {object} JSON Schema (draft 2020-12)
 */
export function getThemeSchema() {
  return themeSchema;
}
