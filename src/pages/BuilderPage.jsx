import { useState, Component } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import styles from "./BuilderPage.module.css";

/**
 * BuilderErrorBoundary — builder-specific error boundary that preserves
 * localStorage state so users can resume after reload.
 *
 * Requirements: 11.6 (Framer Motion), Error Handling (design doc)
 */
class BuilderErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log error for debugging — localStorage state is intentionally preserved
    console.error("[BuilderErrorBoundary]", error, info?.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorFallback} role="alert">
          <div className={styles.errorContent}>
            <h2>Something went wrong</h2>
            <p>
              Your progress has been saved. Click below to reload the builder and
              resume where you left off.
            </p>
            <button
              type="button"
              className={styles.reloadButton}
              onClick={this.handleReload}
            >
              Reload Builder
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * BuilderPage — orchestrates the builder flow:
 * template selection → editing + preview → handoff.
 *
 * Auth-aware: reads Clerk state but does not require it.
 * Uses step-based conditional rendering:
 *   - "select" → TemplateSelector placeholder
 *   - "edit" → editor + preview placeholder
 *
 * Requirements: 1.4, 1.7, 11.6, 11.7
 */
export default function BuilderPage() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  // Local step state placeholder — will be replaced by useBuilderState hook (task 2.1)
  const [step, setStep] = useState("select");

  return (
    <BuilderErrorBoundary>
      <main className={styles.builderPage} aria-label="Website Builder">
        {step === "select" && (
          <motion.section
            className={styles.stepContainer}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Template selection"
          >
            {/* TemplateSelector placeholder — replaced by task 3.1 */}
            <div className={styles.placeholder}>
              <h2>Choose a Template</h2>
              <p>Select a business category and starting template to begin.</p>
              <button
                type="button"
                className={styles.placeholderButton}
                onClick={() => setStep("edit")}
              >
                Continue to Editor (placeholder)
              </button>
            </div>
          </motion.section>
        )}

        {step === "edit" && (
          <motion.section
            className={styles.stepContainer}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Content editor and preview"
          >
            {/* Editor + Preview placeholder — replaced by tasks 4.1, 6.1, 7.1 */}
            <div className={styles.editorPreviewLayout}>
              <div className={styles.editorPanel}>
                <h2>Content Editor</h2>
                <p>Edit your website content here.</p>
                {isSignedIn && user && (
                  <p className={styles.authInfo}>
                    Editing as {user.fullName || user.primaryEmailAddress?.emailAddress}
                  </p>
                )}
              </div>
              <div
                className={styles.previewPanel}
                role="region"
                aria-label="Website preview"
              >
                <h2>Live Preview</h2>
                <p>Your website preview will appear here.</p>
              </div>
            </div>
            <button
              type="button"
              className={styles.placeholderButton}
              onClick={() => setStep("select")}
            >
              Back to Templates (placeholder)
            </button>
          </motion.section>
        )}
      </main>
    </BuilderErrorBoundary>
  );
}
