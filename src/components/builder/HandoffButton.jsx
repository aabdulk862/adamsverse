import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient } from "../../hooks/useSupabaseClient";
import styles from "./HandoffButton.module.css";

/**
 * HandoffButton — Persistent CTA bar for the builder.
 * Auth-aware: different behavior for signed-in vs anonymous users.
 *
 * - Unauthenticated: "Get This Website" → saves config to localStorage → navigates to /signup
 * - Authenticated: "Save & Go to Dashboard" → creates project in Supabase → navigates to /dashboard
 * - "Download Config" secondary action (JSON file download)
 * - "Prefer to talk first? Contact us" tertiary link
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */
export default function HandoffButton({
  config,
  packageName,
  themeLabel,
  category,
}) {
  const { isSignedIn, userId } = useAuth();
  const navigate = useNavigate();
  const supabase = useSupabaseClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle the primary CTA click.
   * - Unauthenticated: save to localStorage, navigate to signup
   * - Authenticated: create project in Supabase, navigate to dashboard
   */
  const handlePrimaryClick = async () => {
    if (!isSignedIn) {
      // Unauthenticated flow: save config to localStorage and redirect to signup
      try {
        localStorage.setItem(
          "webuilder_pending_config",
          JSON.stringify(config)
        );
      } catch {
        // If localStorage fails, still navigate — user can re-do from builder
      }
      navigate("/signup?redirect=/dashboard");
      return;
    }

    // Authenticated flow: create project in Supabase
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from("projects")
        .insert({
          client_id: userId,
          name: config?.name || "Custom Website",
          service_tier: category,
          intake_data: config,
          status: "active",
        })
        .select("id")
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      if (data?.id) {
        navigate(`/dashboard/projects/${data.id}`);
      }
    } catch (err) {
      console.error("[HandoffButton] Project creation failed:", err?.message);
      setError(
        "Could not save project. Try again or download your config."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Download the current config as a JSON file.
   */
  const handleDownloadConfig = () => {
    if (!config) return;

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const filename = `${(packageName || "website").replace(/\s+/g, "_")}_Config.json`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Build the contact link with query params
  const contactParams = new URLSearchParams();
  if (packageName) contactParams.set("package", packageName);
  if (themeLabel) contactParams.set("theme", themeLabel);
  const contactLink = `/contact${contactParams.toString() ? `?${contactParams.toString()}` : ""}`;

  const primaryLabel = isSignedIn ? "Save & Go to Dashboard" : "Get This Website";

  return (
    <div className={styles.handoffBar} role="region" aria-label="Builder actions">
      <div className={styles.handoffContent}>
        {/* Error message */}
        {error && (
          <div className={styles.errorMessage} role="alert" aria-live="polite">
            <span>{error}</span>
            <button
              type="button"
              className={styles.errorDownload}
              onClick={handleDownloadConfig}
              aria-label="Download config as fallback"
            >
              Download Config
            </button>
          </div>
        )}

        {/* Actions row */}
        <div className={styles.actionsRow}>
          {/* Tertiary: Contact link */}
          <a href={contactLink} className={styles.contactLink}>
            Prefer to talk first? Contact us
          </a>

          {/* Secondary: Download Config */}
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleDownloadConfig}
            aria-label="Download configuration as JSON file"
          >
            Download Config
          </button>

          {/* Primary CTA */}
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handlePrimaryClick}
            disabled={isLoading}
            aria-label={primaryLabel}
          >
            {isLoading ? "Saving…" : primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
