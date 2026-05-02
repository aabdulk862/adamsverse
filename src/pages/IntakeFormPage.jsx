import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import services from "../data/services";

const TIER_CONFIG = {
  "landing-page": {
    fields: [
      {
        name: "businessName",
        label: "Business Name",
        type: "text",
        required: true,
        placeholder: "e.g. Acme Corp",
      },
      {
        name: "targetAudience",
        label: "Target Audience",
        type: "textarea",
        required: true,
        placeholder: "Describe your ideal customer or visitor",
      },
      {
        name: "sectionCount",
        label: "Number of Sections (1–5)",
        type: "select",
        required: true,
        options: [1, 2, 3, 4, 5],
      },
      {
        name: "referenceUrls",
        label: "Reference URLs",
        type: "textarea",
        required: false,
        placeholder: "Paste any reference sites, one per line",
      },
    ],
    projectName: (data) => `${data.businessName || "Untitled"} — Landing Page`,
  },
  "full-stack-application": {
    fields: [
      {
        name: "projectDescription",
        label: "Project Description",
        type: "textarea",
        required: true,
        placeholder: "What are you building and why?",
      },
      {
        name: "featureList",
        label: "Feature List",
        type: "textarea",
        required: true,
        placeholder: "List the key features, one per line",
      },
      {
        name: "expectedUserCount",
        label: "Expected User Count",
        type: "text",
        required: false,
        placeholder: "e.g. 500 monthly active users",
      },
      {
        name: "techStackPreferences",
        label: "Tech Stack Preferences",
        type: "textarea",
        required: false,
        placeholder: "Any preferred languages, frameworks, or services?",
      },
      {
        name: "deploymentRequirements",
        label: "Deployment Requirements",
        type: "textarea",
        required: false,
        placeholder: "e.g. AWS, Docker, specific region requirements",
      },
    ],
    projectName: (data) => {
      const desc = data.projectDescription || "";
      const short = desc.split(/[.\n]/)[0].slice(0, 50);
      return `${short || "Untitled"} — Full-Stack App`;
    },
  },
  consulting: {
    fields: [
      {
        name: "topicArea",
        label: "Topic Area",
        type: "text",
        required: true,
        placeholder: "e.g. Architecture review, migration planning",
      },
      {
        name: "estimatedHours",
        label: "Estimated Hours",
        type: "text",
        required: true,
        placeholder: "e.g. 10",
      },
      {
        name: "meetingFormat",
        label: "Meeting Format",
        type: "select",
        required: true,
        options: ["video", "async"],
      },
      {
        name: "availabilityWindows",
        label: "Availability Windows",
        type: "textarea",
        required: false,
        placeholder: "e.g. Weekdays 9am–5pm EST",
      },
    ],
    projectName: (data) => `${data.topicArea || "Untitled"} — Consulting`,
  },
};

export default function IntakeFormPage() {
  const { tierId } = useParams();
  const navigate = useNavigate();
  const {
    createProject,
    loading: submitting,
    error: projectError,
  } = useProjects();

  const service = services.find((s) => s.id === tierId);
  const tierConfig = TIER_CONFIG[tierId];

  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  if (!service || !tierConfig) {
    return (
      <div className="intake-page">
        <div className="intake-not-found">
          <i className="fa-solid fa-circle-exclamation" />
          <h2>Service tier not found</h2>
          <p>
            The selected service doesn't exist. Choose a service to get started.
          </p>
          <Link to="/services" className="intake-back-link">
            <i className="fa-solid fa-arrow-left" /> Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errors = {};
    for (const field of tierConfig.fields) {
      if (field.required && !formData[field.name]?.toString().trim()) {
        errors[field.name] = `${field.label} is required`;
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const projectName = tierConfig.projectName(formData);
    const result = await createProject({
      name: projectName,
      service_tier: tierId,
      intake_data: formData,
    });

    if (result) {
      navigate("/dashboard/projects");
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] || "";
    const hasError = !!validationErrors[field.name];
    const fieldId = `intake-${field.name}`;

    if (field.type === "select") {
      return (
        <label key={field.name} htmlFor={fieldId} className="intake-field">
          <span className="intake-label">
            {field.label}
            {field.required && (
              <span className="intake-required" aria-hidden="true">
                {" "}
                *
              </span>
            )}
          </span>
          <select
            id={fieldId}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={hasError ? "intake-input--error" : ""}
            aria-required={field.required}
            aria-invalid={hasError}
          >
            <option value="">Select…</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {typeof opt === "string"
                  ? opt.charAt(0).toUpperCase() + opt.slice(1)
                  : opt}
              </option>
            ))}
          </select>
          {hasError && (
            <span className="intake-error" role="alert">
              {validationErrors[field.name]}
            </span>
          )}
        </label>
      );
    }

    if (field.type === "textarea") {
      return (
        <label key={field.name} htmlFor={fieldId} className="intake-field">
          <span className="intake-label">
            {field.label}
            {field.required && (
              <span className="intake-required" aria-hidden="true">
                {" "}
                *
              </span>
            )}
          </span>
          <textarea
            id={fieldId}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? "intake-input--error" : ""}
            aria-required={field.required}
            aria-invalid={hasError}
            rows={4}
          />
          {hasError && (
            <span className="intake-error" role="alert">
              {validationErrors[field.name]}
            </span>
          )}
        </label>
      );
    }

    return (
      <label key={field.name} htmlFor={fieldId} className="intake-field">
        <span className="intake-label">
          {field.label}
          {field.required && (
            <span className="intake-required" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </span>
        <input
          id={fieldId}
          type="text"
          value={value}
          onChange={(e) => handleChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={hasError ? "intake-input--error" : ""}
          aria-required={field.required}
          aria-invalid={hasError}
        />
        {hasError && (
          <span className="intake-error" role="alert">
            {validationErrors[field.name]}
          </span>
        )}
      </label>
    );
  };

  return (
    <div className="intake-page">
      <div className="intake-header">
        <Link to="/services" className="intake-back-link">
          <i className="fa-solid fa-arrow-left" /> Services
        </Link>
        <h1 className="intake-title">{service.title} Intake</h1>
        <p className="intake-subtitle">
          Tell us about your project so we can scope the work and get started.
        </p>
      </div>

      <div className="intake-pricing-banner">
        <i className={`${service.icon} intake-pricing-icon`} />
        <div className="intake-pricing-info">
          <span className="intake-pricing-tier">{service.title}</span>
          <span className="intake-pricing-range">{service.priceRange}</span>
        </div>
      </div>

      <form className="intake-form" onSubmit={handleSubmit} noValidate>
        {tierConfig.fields.map(renderField)}

        {tierId === "landing-page" && (
          <div className="intake-field">
            <span className="intake-label">Brand Assets</span>
            <p className="intake-hint">
              Upload logos, color palettes, or style guides. You can also add
              files after project creation.
            </p>
            <input
              type="file"
              multiple
              className="intake-file-input"
              onChange={(e) => {
                const names = Array.from(e.target.files || []).map(
                  (f) => f.name,
                );
                handleChange("brandAssets", names.join(", "));
              }}
              aria-label="Upload brand assets"
            />
          </div>
        )}

        {projectError && (
          <div className="intake-submit-error" role="alert">
            <i className="fa-solid fa-circle-exclamation" />
            <span>{projectError}</span>
          </div>
        )}

        <button type="submit" className="intake-submit" disabled={submitting}>
          {submitting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" /> Submitting…
            </>
          ) : (
            <>
              Submit Project <i className="fa-solid fa-arrow-right" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
