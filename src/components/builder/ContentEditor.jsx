import { useState, useCallback, useRef } from "react";
import { getEditableFields } from "../../lib/contentLayer.js";
import ImageUploadField from "./ImageUploadField.jsx";
import styles from "./ContentEditor.module.css";

/**
 * Section display metadata — labels for each section type.
 */
const SECTION_META = {
  hero: { label: "Hero" },
  services: { label: "Services" },
  gallery: { label: "Gallery" },
  testimonials: { label: "Testimonials" },
  cta: { label: "Call to Action" },
  contact: { label: "Contact" },
};

/**
 * Array field constraints per section type.
 */
const ARRAY_MAX_ITEMS = {
  services: 20,
  gallery: 30,
  testimonials: 20,
};

/**
 * Default empty items for array fields when adding new entries.
 */
const DEFAULT_ARRAY_ITEMS = {
  services: { title: "", description: "", icon: "⭐" },
  gallery: "",
  testimonials: { quote: "", author: "", role: "", avatar: "" },
};

/**
 * Validates a field value based on its type.
 * @param {string} type - Field type ("string", "url", "array")
 * @param {*} value - The value to validate
 * @param {number} maxLength - Max length/items constraint
 * @returns {string|null} Error message or null if valid
 */
function validateField(type, value, maxLength) {
  if (type === "string") {
    if (typeof value === "string" && value.length > maxLength) {
      return `Maximum ${maxLength} characters (${value.length} used)`;
    }
  } else if (type === "url") {
    if (typeof value === "string") {
      if (value.length > maxLength) {
        return `Maximum ${maxLength} characters (${value.length} used)`;
      }
      if (
        value.length > 0 &&
        !value.startsWith("http://") &&
        !value.startsWith("https://") &&
        !value.startsWith("/")
      ) {
        return "URL must start with http://, https://, or /";
      }
    }
  } else if (type === "array") {
    if (Array.isArray(value) && value.length > maxLength) {
      return `Maximum ${maxLength} items (${value.length} added)`;
    }
  }
  return null;
}

/**
 * ContentEditor — Section-by-section content editing form.
 *
 * REUSABLE: designed to be imported by both BuilderPage and DashboardProjectPage (Phase 2).
 * Renders collapsible section groups with field inputs, array controls, and inline validation.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 14.6
 *
 * @param {Object} props
 * @param {object} props.config - PackageConfig with sections object
 * @param {(sectionKey: string, fieldPath: string, value: any) => void} props.onFieldChange - Field change handler
 * @param {boolean} [props.readOnly=false] - Disables all inputs when true (Phase 2: view-only mode)
 */
export default function ContentEditor({ config, onFieldChange, readOnly = false }) {
  const [expandedSections, setExpandedSections] = useState(() => {
    // Start with only the first section (hero) expanded
    const initial = {};
    Object.keys(SECTION_META).forEach((key) => {
      initial[key] = false;
    });
    initial.hero = true;
    return initial;
  });
  const [errors, setErrors] = useState({});

  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }, []);

  const handleFieldChange = useCallback(
    (sectionKey, fieldPath, value, fieldType, maxLength) => {
      // Validate and set error state
      const errorKey = `${sectionKey}.${fieldPath}`;
      const error = validateField(fieldType, value, maxLength);
      setErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[errorKey] = error;
        } else {
          delete next[errorKey];
        }
        return next;
      });

      // Always propagate the change (don't prevent editing)
      onFieldChange(sectionKey, fieldPath, value);
    },
    [onFieldChange]
  );

  const handleArrayAdd = useCallback(
    (sectionKey, fieldPath, currentArray, maxItems) => {
      if (currentArray.length >= maxItems) return;
      const defaultItem = DEFAULT_ARRAY_ITEMS[sectionKey] ?? "";
      const newArray = [...currentArray, typeof defaultItem === "object" ? { ...defaultItem } : defaultItem];
      onFieldChange(sectionKey, fieldPath, newArray);
    },
    [onFieldChange]
  );

  const handleArrayRemove = useCallback(
    (sectionKey, fieldPath, currentArray, index) => {
      const newArray = currentArray.filter((_, i) => i !== index);
      onFieldChange(sectionKey, fieldPath, newArray);
    },
    [onFieldChange]
  );

  const sections = config?.sections || {};
  const sectionKeys = Object.keys(SECTION_META).filter(
    (key) => sections[key] !== undefined
  );

  return (
    <div className={styles.editor} role="form" aria-label="Content editor">
      <header className={styles.header}>
        <h2 className={styles.title}>Edit Content</h2>
        {readOnly && (
          <span className={styles.readOnlyBadge} aria-label="Read-only mode">
            View Only
          </span>
        )}
      </header>

      <div className={styles.sections}>
        {sectionKeys.map((sectionKey) => (
          <SectionGroup
            key={sectionKey}
            sectionKey={sectionKey}
            content={sections[sectionKey]}
            expanded={expandedSections[sectionKey]}
            onToggle={toggleSection}
            onFieldChange={handleFieldChange}
            onArrayAdd={handleArrayAdd}
            onArrayRemove={handleArrayRemove}
            errors={errors}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * SectionGroup — Collapsible section with fields.
 */
function SectionGroup({
  sectionKey,
  content,
  expanded,
  onToggle,
  onFieldChange,
  onArrayAdd,
  onArrayRemove,
  errors,
  readOnly,
}) {
  const meta = SECTION_META[sectionKey];
  const fields = getEditableFields(sectionKey);
  const sectionRef = useRef(null);

  /**
   * Handle Escape key to collapse expanded section.
   */
  const handleKeyDown = (e) => {
    if (e.key === "Escape" && expanded) {
      e.stopPropagation();
      onToggle(sectionKey);
    }
  };

  return (
    <div className={styles.sectionGroup} onKeyDown={handleKeyDown} ref={sectionRef}>
      <button
        type="button"
        className={styles.sectionHeader}
        onClick={() => onToggle(sectionKey)}
        aria-expanded={expanded}
        aria-controls={`section-${sectionKey}-content`}
      >
        <span className={styles.sectionLabel}>{meta.label}</span>
        <span
          className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      <div
        id={`section-${sectionKey}-content`}
        role="group"
        aria-label={`${meta.label} fields`}
        className={`${styles.sectionContent} ${expanded ? styles.sectionContentExpanded : ""}`}
      >
        <div className={styles.fieldsContainer}>
          {fields.map((field) => (
            <FieldRenderer
              key={field.path}
              sectionKey={sectionKey}
              field={field}
              value={content?.[field.path]}
              onFieldChange={onFieldChange}
              onArrayAdd={onArrayAdd}
              onArrayRemove={onArrayRemove}
              errors={errors}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * FieldRenderer — Renders the appropriate input for a field based on its type.
 */
function FieldRenderer({
  sectionKey,
  field,
  value,
  onFieldChange,
  onArrayAdd,
  onArrayRemove,
  errors,
  readOnly,
}) {
  const errorKey = `${sectionKey}.${field.path}`;
  const error = errors[errorKey];
  const fieldId = `field-${sectionKey}-${field.path}`;
  const errorId = `${fieldId}-error`;

  if (field.type === "array") {
    return (
      <ArrayField
        sectionKey={sectionKey}
        field={field}
        value={value}
        onFieldChange={onFieldChange}
        onArrayAdd={onArrayAdd}
        onArrayRemove={onArrayRemove}
        errors={errors}
        readOnly={readOnly}
      />
    );
  }

  // Image field — render with upload control
  if (isImageField(sectionKey, field.path)) {
    const label = formatFieldLabel(field.path);
    return (
      <div className={styles.fieldGroup}>
        <label htmlFor={fieldId} className={styles.fieldLabel}>
          {label}
          <span className={styles.fieldHint}>(Image URL or upload)</span>
        </label>
        <ImageUploadField
          id={fieldId}
          value={value ?? ""}
          onChange={(newValue) =>
            onFieldChange(sectionKey, field.path, newValue, field.type, field.maxLength || 500)
          }
          disabled={readOnly}
          placeholder="https://example.com/image.jpg"
          label={`Upload image for ${label}`}
          error={error}
          errorId={error ? errorId : undefined}
        />
        {error && (
          <p id={errorId} className={styles.fieldError} aria-live="polite" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  // String or URL field
  const label = formatFieldLabel(field.path);

  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={fieldId} className={styles.fieldLabel}>
        {label}
        {field.type === "url" && (
          <span className={styles.fieldHint}>(URL)</span>
        )}
      </label>
      <input
        id={fieldId}
        type="text"
        className={`${styles.fieldInput} ${error ? styles.fieldInputError : ""}`}
        value={value ?? ""}
        onChange={(e) =>
          onFieldChange(sectionKey, field.path, e.target.value, field.type, field.maxLength || 500)
        }
        disabled={readOnly}
        placeholder={field.type === "url" ? "https://..." : ""}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? "true" : undefined}
      />
      {error && (
        <p id={errorId} className={styles.fieldError} aria-live="polite" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * ArrayField — Renders array fields with add/remove controls.
 * Handles services (objects), gallery (strings), and testimonials (objects).
 */
function ArrayField({
  sectionKey,
  field,
  value,
  onFieldChange,
  onArrayAdd,
  onArrayRemove,
  errors,
  readOnly,
}) {
  const items = Array.isArray(value) ? value : [];
  const maxItems = ARRAY_MAX_ITEMS[sectionKey] || field.maxLength || 50;
  const atMax = items.length >= maxItems;
  const label = formatFieldLabel(field.path);
  const errorKey = `${sectionKey}.${field.path}`;
  const error = errors[errorKey];

  return (
    <div className={styles.arrayField}>
      <div className={styles.arrayHeader}>
        <span className={styles.fieldLabel}>{label}</span>
        <span className={styles.arrayCount}>
          {items.length} / {maxItems}
        </span>
      </div>

      {error && (
        <p className={styles.fieldError} aria-live="polite" role="alert">
          {error}
        </p>
      )}

      <div className={styles.arrayItems}>
        {items.map((item, index) => (
          <ArrayItem
            key={index}
            sectionKey={sectionKey}
            fieldPath={field.path}
            item={item}
            index={index}
            onFieldChange={onFieldChange}
            onRemove={() => onArrayRemove(sectionKey, field.path, items, index)}
            errors={errors}
            readOnly={readOnly}
          />
        ))}
      </div>

      {!readOnly && (
        <button
          type="button"
          className={styles.addButton}
          onClick={() => onArrayAdd(sectionKey, field.path, items, maxItems)}
          disabled={atMax}
          aria-label={`Add ${sectionKey === "gallery" ? "image" : "item"} to ${label}`}
          title={atMax ? `Maximum ${maxItems} items reached` : undefined}
        >
          <span aria-hidden="true">+</span>
          Add {sectionKey === "gallery" ? "Image" : "Item"}
        </button>
      )}
    </div>
  );
}

/**
 * ArrayItem — Renders a single item in an array field.
 * For gallery: a single URL input with image upload.
 * For services/testimonials: multiple sub-fields (with upload for avatar).
 */
function ArrayItem({
  sectionKey,
  fieldPath,
  item,
  index,
  onFieldChange,
  onRemove,
  errors,
  readOnly,
}) {
  // Gallery items are simple strings (URLs) — render with image upload
  if (sectionKey === "gallery") {
    const itemFieldPath = `${fieldPath}.${index}`;
    const errorKey = `${sectionKey}.${itemFieldPath}`;
    const error = errors[errorKey];
    const fieldId = `field-${sectionKey}-${itemFieldPath}`;
    const errorId = `${fieldId}-error`;

    return (
      <div className={styles.arrayItem}>
        <div className={styles.arrayItemContent}>
          <ImageUploadField
            id={fieldId}
            value={item ?? ""}
            onChange={(newValue) =>
              onFieldChange(sectionKey, itemFieldPath, newValue, "url", 500)
            }
            disabled={readOnly}
            placeholder="https://example.com/image.jpg"
            label={`Upload image ${index + 1}`}
            error={error}
            errorId={error ? errorId : undefined}
          />
          {error && (
            <p id={errorId} className={styles.fieldError} aria-live="polite" role="alert">
              {error}
            </p>
          )}
        </div>
        {!readOnly && (
          <button
            type="button"
            className={styles.removeButton}
            onClick={onRemove}
            aria-label={`Remove image ${index + 1}`}
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  // Services and testimonials are objects with sub-fields
  const subFields = getSubFields(sectionKey);

  return (
    <div className={styles.arrayItem}>
      <div className={styles.arrayItemContent}>
        <span className={styles.arrayItemIndex}>#{index + 1}</span>
        {subFields.map((subField) => {
          const itemFieldPath = `${fieldPath}.${index}.${subField.key}`;
          const errorKey = `${sectionKey}.${itemFieldPath}`;
          const error = errors[errorKey];
          const fieldId = `field-${sectionKey}-${itemFieldPath}`;
          const errorId = `${fieldId}-error`;

          // Render image upload for avatar fields in testimonials
          if (isImageSubField(sectionKey, subField.key)) {
            return (
              <div key={subField.key} className={styles.subField}>
                <label htmlFor={fieldId} className={styles.subFieldLabel}>
                  {subField.label}
                  <span className={styles.fieldHint}> (Image URL or upload)</span>
                </label>
                <ImageUploadField
                  id={fieldId}
                  value={item?.[subField.key] ?? ""}
                  onChange={(newValue) =>
                    onFieldChange(
                      sectionKey,
                      itemFieldPath,
                      newValue,
                      subField.type || "url",
                      500
                    )
                  }
                  disabled={readOnly}
                  placeholder="https://example.com/avatar.jpg"
                  label={`Upload avatar for testimonial ${index + 1}`}
                  error={error}
                  errorId={error ? errorId : undefined}
                />
                {error && (
                  <p id={errorId} className={styles.fieldError} aria-live="polite" role="alert">
                    {error}
                  </p>
                )}
              </div>
            );
          }

          return (
            <div key={subField.key} className={styles.subField}>
              <label htmlFor={fieldId} className={styles.subFieldLabel}>
                {subField.label}
              </label>
              <input
                id={fieldId}
                type="text"
                className={`${styles.fieldInput} ${styles.fieldInputSmall} ${error ? styles.fieldInputError : ""}`}
                value={item?.[subField.key] ?? ""}
                onChange={(e) =>
                  onFieldChange(
                    sectionKey,
                    itemFieldPath,
                    e.target.value,
                    subField.type || "string",
                    500
                  )
                }
                disabled={readOnly}
                placeholder={subField.placeholder || ""}
                aria-label={`${subField.label} for item ${index + 1}`}
                aria-describedby={error ? errorId : undefined}
                aria-invalid={error ? "true" : undefined}
              />
              {error && (
                <p id={errorId} className={styles.fieldError} aria-live="polite" role="alert">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!readOnly && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          aria-label={`Remove item ${index + 1}`}
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * Returns sub-field definitions for array item types.
 */
function getSubFields(sectionKey) {
  if (sectionKey === "services") {
    return [
      { key: "title", label: "Title", placeholder: "Service name" },
      { key: "description", label: "Description", placeholder: "Brief description" },
      { key: "icon", label: "Icon", placeholder: "⭐" },
    ];
  }
  if (sectionKey === "testimonials") {
    return [
      { key: "quote", label: "Quote", placeholder: "What they said..." },
      { key: "author", label: "Author", placeholder: "Client name" },
      { key: "role", label: "Role", placeholder: "e.g. Customer" },
      { key: "avatar", label: "Avatar URL", placeholder: "https://...", type: "url" },
    ];
  }
  return [];
}

/**
 * Determines if a field path represents an image field that should show upload controls.
 * Image fields: heroImage, gallery images (array items), testimonial avatars.
 * @param {string} sectionKey - The section key (e.g., "hero", "gallery")
 * @param {string} fieldPath - The field path (e.g., "heroImage", "images.0")
 * @returns {boolean}
 */
function isImageField(sectionKey, fieldPath) {
  if (sectionKey === "hero" && fieldPath === "heroImage") return true;
  if (sectionKey === "gallery" && /^images(\.\d+)?$/.test(fieldPath)) return true;
  return false;
}

/**
 * Determines if a sub-field within an array item is an image field.
 * @param {string} sectionKey - The section key
 * @param {string} subFieldKey - The sub-field key (e.g., "avatar")
 * @returns {boolean}
 */
function isImageSubField(sectionKey, subFieldKey) {
  if (sectionKey === "testimonials" && subFieldKey === "avatar") return true;
  return false;
}

/**
 * Formats a field path into a human-readable label.
 * e.g. "ctaText" → "CTA Text", "heroImage" → "Hero Image"
 */
function formatFieldLabel(path) {
  return path
    .replace(/\bcta\b/i, "CTA")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
