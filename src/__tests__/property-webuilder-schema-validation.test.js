// Feature: adverse-webuilder, Property 4: Package_Config JSON serialization round-trip
// Feature: adverse-webuilder, Property 5: Schema validation error reporting
// Feature: adverse-webuilder, Property 17: Schema self-documentation completeness
// **Validates: Requirements 2.3, 2.5, 9.1, 9.2**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  packageSchema,
  validatePackageConfig,
  getValidationErrors,
} from "../schemas/packageSchema.js";

// --- Generators ---

/**
 * Generator for valid slug strings (lowercase alphanumeric + hyphens, 1-128 chars).
 */
const slugArb = fc
  .tuple(
    fc.stringMatching(/^[a-z0-9]{1,10}$/),
    fc.array(fc.stringMatching(/^[a-z0-9]{1,10}$/), { minLength: 0, maxLength: 3 })
  )
  .map(([first, rest]) => [first, ...rest].join("-"))
  .filter((s) => s.length >= 1 && s.length <= 128);

/**
 * Generator for valid name strings (1-256 chars).
 */
const nameArb = fc.string({ minLength: 1, maxLength: 50 });

/**
 * Generator for valid category strings (1-128 chars).
 */
const categoryArb = fc.string({ minLength: 1, maxLength: 50 });

/**
 * Generator for valid description strings (0-1024 chars).
 */
const descriptionArb = fc.string({ minLength: 0, maxLength: 100 });

/**
 * Generator for valid packageType enum values.
 */
const packageTypeArb = fc.constantFrom("static", "semi-dynamic", "dynamic");

/**
 * Generator for valid themeRef strings.
 */
const themeRefArb = fc.string({ minLength: 1, maxLength: 50 });

/**
 * Generator for a valid section content object (simple hero-like content).
 */
const sectionContentArb = fc.record({
  headline: fc.string({ minLength: 1, maxLength: 50 }),
  subheadline: fc.string({ minLength: 0, maxLength: 50 }),
});

/**
 * Generator for a valid sections object (at least 1 key).
 */
const sectionsArb = fc
  .dictionary(
    fc.stringMatching(/^[a-z]{1,10}$/),
    sectionContentArb,
    { minKeys: 1, maxKeys: 4 }
  );

/**
 * Generator for valid metadata objects.
 */
const metadataArb = fc.option(
  fc.record({
    phone: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined }),
    email: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined }),
    address: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined }),
    hours: fc.option(fc.string({ minLength: 0, maxLength: 50 }), { nil: undefined }),
  }),
  { nil: undefined }
);

/**
 * Generator for a complete valid Package_Config.
 */
const validPackageConfigArb = fc
  .tuple(slugArb, nameArb, categoryArb, descriptionArb, packageTypeArb, themeRefArb, sectionsArb, metadataArb)
  .map(([slug, name, category, description, packageType, themeRef, sections, metadata]) => {
    const config = { slug, name, category, description, packageType, themeRef, sections };
    if (metadata !== undefined) {
      // Remove undefined keys from metadata
      const cleanMeta = {};
      if (metadata.phone !== undefined) cleanMeta.phone = metadata.phone;
      if (metadata.email !== undefined) cleanMeta.email = metadata.email;
      if (metadata.address !== undefined) cleanMeta.address = metadata.address;
      if (metadata.hours !== undefined) cleanMeta.hours = metadata.hours;
      if (Object.keys(cleanMeta).length > 0) {
        config.metadata = cleanMeta;
      }
    }
    return config;
  });

// --- Property 4: Package_Config JSON serialization round-trip ---

describe("Property 4: Package_Config JSON serialization round-trip", () => {
  it("serializing via JSON.stringify and parsing via JSON.parse produces a deeply equal object", () => {
    fc.assert(
      fc.property(validPackageConfigArb, (config) => {
        // Ensure the config is valid first
        const isValid = validatePackageConfig(config);
        if (!isValid) return; // skip invalid configs from generator edge cases

        const serialized = JSON.stringify(config);
        const deserialized = JSON.parse(serialized);

        expect(deserialized).toEqual(config);
      }),
      { numRuns: 25 }
    );
  });

  it("valid configs contain no non-serializable values (functions, undefined, circular refs)", () => {
    fc.assert(
      fc.property(validPackageConfigArb, (config) => {
        const isValid = validatePackageConfig(config);
        if (!isValid) return;

        // JSON.stringify should not throw (no circular refs)
        const serialized = JSON.stringify(config);
        expect(typeof serialized).toBe("string");

        // No undefined values should survive in the parsed result
        const parsed = JSON.parse(serialized);
        const checkNoUndefined = (obj) => {
          for (const [, value] of Object.entries(obj)) {
            expect(value).not.toBeUndefined();
            if (value !== null && typeof value === "object") {
              checkNoUndefined(value);
            }
          }
        };
        checkNoUndefined(parsed);
      }),
      { numRuns: 25 }
    );
  });
});

// --- Property 5: Schema validation error reporting ---

describe("Property 5: Schema validation error reporting", () => {
  it("missing required fields produce errors identifying the invalid field paths", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("slug", "name", "category", "description", "sections"),
        (fieldToRemove) => {
          // Start with a known valid config
          const config = {
            slug: "test-pkg",
            name: "Test Package",
            category: "Testing",
            description: "A test package",
            sections: { hero: { headline: "Hello" } },
          };

          // Remove one required field
          delete config[fieldToRemove];

          const isValid = validatePackageConfig(config);
          expect(isValid).toBe(false);

          const errors = getValidationErrors();
          expect(errors.length).toBeGreaterThan(0);

          // At least one error should reference the missing field
          const hasRelevantError = errors.some(
            (err) =>
              err.message.includes(fieldToRemove) ||
              err.path === "/" ||
              err.path === ""
          );
          expect(hasRelevantError).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });

  it("wrong types produce errors with field path information", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { field: "slug", value: 123, path: "/slug" },
          { field: "name", value: true, path: "/name" },
          { field: "category", value: [], path: "/category" },
          { field: "description", value: {}, path: "/description" },
          { field: "sections", value: "not-an-object", path: "/sections" }
        ),
        ({ field, value, path }) => {
          const config = {
            slug: "test-pkg",
            name: "Test Package",
            category: "Testing",
            description: "A test package",
            sections: { hero: { headline: "Hello" } },
          };

          config[field] = value;

          const isValid = validatePackageConfig(config);
          expect(isValid).toBe(false);

          const errors = getValidationErrors();
          expect(errors.length).toBeGreaterThan(0);

          // Error should reference the field path
          const hasPathError = errors.some((err) => err.path === path || err.path === "/");
          expect(hasPathError).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });

  it("slug constraint violations produce descriptive errors", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "UPPERCASE",
          "has spaces",
          "special!chars",
          "-starts-with-hyphen",
          "ends-with-hyphen-",
          ""
        ),
        (invalidSlug) => {
          const config = {
            slug: invalidSlug,
            name: "Test",
            category: "Testing",
            description: "Test",
            sections: { hero: { headline: "Hello" } },
          };

          const isValid = validatePackageConfig(config);
          expect(isValid).toBe(false);

          const errors = getValidationErrors();
          expect(errors.length).toBeGreaterThan(0);

          // Should have an error related to slug
          const hasSlugError = errors.some(
            (err) => err.path === "/slug" || err.path === "/"
          );
          expect(hasSlugError).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });

  it("empty sections object produces a validation error", () => {
    const config = {
      slug: "test-pkg",
      name: "Test Package",
      category: "Testing",
      description: "A test package",
      sections: {},
    };

    const isValid = validatePackageConfig(config);
    expect(isValid).toBe(false);

    const errors = getValidationErrors();
    expect(errors.length).toBeGreaterThan(0);

    const hasSectionsError = errors.some(
      (err) => err.path === "/sections" || err.message.includes("minProperties")
    );
    expect(hasSectionsError).toBe(true);
  });

  it("invalid packageType enum value produces a validation error", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(
          (s) => !["static", "semi-dynamic", "dynamic"].includes(s)
        ),
        (invalidType) => {
          const config = {
            slug: "test-pkg",
            name: "Test Package",
            category: "Testing",
            description: "A test package",
            packageType: invalidType,
            sections: { hero: { headline: "Hello" } },
          };

          const isValid = validatePackageConfig(config);
          expect(isValid).toBe(false);

          const errors = getValidationErrors();
          expect(errors.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 20 }
    );
  });
});

// --- Property 17: Schema self-documentation completeness ---

describe("Property 17: Schema self-documentation completeness", () => {
  /**
   * Recursively collects all property definitions from a JSON Schema.
   */
  function collectProperties(schema, path = "") {
    const results = [];

    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const propPath = path ? `${path}.${key}` : key;
        results.push({ path: propPath, schema: propSchema });

        // Recurse into nested objects
        if (propSchema.type === "object" && propSchema.properties) {
          results.push(...collectProperties(propSchema, propPath));
        }
      }
    }

    // Check additionalProperties if it's a schema object
    if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      const addPath = path ? `${path}.[additionalProperties]` : "[additionalProperties]";
      results.push({ path: addPath, schema: schema.additionalProperties });
      if (schema.additionalProperties.properties) {
        results.push(...collectProperties(schema.additionalProperties, addPath));
      }
    }

    return results;
  }

  /**
   * Collects required fields from the schema at all nesting levels.
   */
  function collectRequiredFields(schema, path = "") {
    const results = [];

    if (schema.required && schema.properties) {
      for (const reqField of schema.required) {
        const propPath = path ? `${path}.${reqField}` : reqField;
        const propSchema = schema.properties[reqField];
        if (propSchema) {
          results.push({ path: propPath, schema: propSchema });
        }
      }
    }

    // Recurse into nested objects
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const propPath = path ? `${path}.${key}` : key;
        if (propSchema.type === "object") {
          results.push(...collectRequiredFields(propSchema, propPath));
        }
      }
    }

    return results;
  }

  it("every property at all nesting levels has a description field", () => {
    const allProperties = collectProperties(packageSchema);

    fc.assert(
      fc.property(fc.constantFrom(...allProperties), ({ path, schema }) => {
        expect(schema.description).toBeDefined();
        expect(typeof schema.description).toBe("string");
        expect(schema.description.length).toBeGreaterThan(0);
      }),
      { numRuns: Math.min(allProperties.length, 30) }
    );
  });

  it("every required field has an examples keyword with at least one valid example", () => {
    const requiredFields = collectRequiredFields(packageSchema);

    fc.assert(
      fc.property(fc.constantFrom(...requiredFields), ({ path, schema }) => {
        expect(schema.examples).toBeDefined();
        expect(Array.isArray(schema.examples)).toBe(true);
        expect(schema.examples.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: Math.min(requiredFields.length, 30) }
    );
  });

  it("enum-constrained properties have description explaining valid values", () => {
    const allProperties = collectProperties(packageSchema);
    const enumProperties = allProperties.filter(({ schema }) => schema.enum);

    if (enumProperties.length === 0) return; // skip if no enums

    fc.assert(
      fc.property(fc.constantFrom(...enumProperties), ({ path, schema }) => {
        expect(schema.description).toBeDefined();
        expect(typeof schema.description).toBe("string");
        expect(schema.description.length).toBeGreaterThan(0);
        // Enum should be an array with at least one value
        expect(Array.isArray(schema.enum)).toBe(true);
        expect(schema.enum.length).toBeGreaterThan(0);
      }),
      { numRuns: Math.min(enumProperties.length, 30) }
    );
  });

  it("example values for required fields conform to their type constraints", () => {
    const requiredFields = collectRequiredFields(packageSchema);

    fc.assert(
      fc.property(fc.constantFrom(...requiredFields), ({ path, schema }) => {
        if (!schema.examples || schema.examples.length === 0) return;

        for (const example of schema.examples) {
          if (schema.type === "string") {
            expect(typeof example).toBe("string");
            if (schema.minLength !== undefined) {
              expect(example.length).toBeGreaterThanOrEqual(schema.minLength);
            }
            if (schema.maxLength !== undefined) {
              expect(example.length).toBeLessThanOrEqual(schema.maxLength);
            }
          } else if (schema.type === "object") {
            expect(typeof example).toBe("object");
            expect(example).not.toBeNull();
          } else if (schema.type === "array") {
            expect(Array.isArray(example)).toBe(true);
          }
        }
      }),
      { numRuns: Math.min(requiredFields.length, 30) }
    );
  });
});
