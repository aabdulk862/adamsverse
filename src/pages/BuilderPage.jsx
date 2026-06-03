import { useState, useEffect, useRef, Component } from "react";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBuilderState } from "../hooks/useBuilderState";
import BuilderLayout from "../components/builder/BuilderLayout";
import ContentEditor from "../components/builder/ContentEditor";
import LivePreview from "../components/builder/LivePreview";
import ThemePicker from "../components/builder/ThemePicker";
import HandoffButton from "../components/builder/HandoffButton";
import TemplateSelector from "../components/builder/TemplateSelector";
import styles from "./BuilderPage.module.css";

const STORAGE_KEY = "webuilder_preview_session";

function getSavedSessionName() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw)?.config?.name || null;
  } catch {
    return null;
  }
}

/**
 * BuilderErrorBoundary — builder-specific error boundary that preserves
 * localStorage state so users can resume after reload.
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

const stepTransition = { duration: 0.2 };
const stepInitial = { opacity: 0, y: 12 };
const stepAnimate = { opacity: 1, y: 0 };
const stepExit = { opacity: 0, y: -12 };

/**
 * BuilderPage — orchestrates the builder flow:
 * template selection → editing + preview → handoff.
 *
 * Edit step uses a Wix-inspired layout:
 * - Narrow left sidebar with Content/Design tabs
 * - Wide preview taking majority of screen
 * - Optimized for 15" MacBook (1440×900+)
 *
 * Auth-aware: reads Clerk state but does not require it.
 */
export default function BuilderPage() {
  const { userId } = useAuth();
  const [state, actions] = useBuilderState({ userId });
  const [toastHidden, setToastHidden] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const timerRef = useRef(null);

  // Derive toast message from state
  const derivedToast = !state.storageAvailable
    ? "Auto-save unavailable. Your progress won't be saved if you close this tab."
    : state.supabaseSaveError || null;

  // Reset hidden state when message source changes
  const prevToastRef = useRef(derivedToast);
  if (prevToastRef.current !== derivedToast) {
    prevToastRef.current = derivedToast;
    setToastHidden(false);
  }

  const toastMessage = toastHidden ? null : derivedToast;

  // Auto-dismiss timer
  useEffect(() => {
    if (!toastMessage) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToastHidden(true), 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [toastMessage]);

  // Determine what to render
  const showResume = state.hasSavedSession && state.step === "select";
  const showSelect =
    (state.step === "select" && !state.hasSavedSession) ||
    (state.step === "edit" && !state.config);
  const showEdit = state.step === "edit" && state.config;

  return (
    <BuilderErrorBoundary>
      <main className={styles.builderPage} aria-label="Website Builder">
        <AnimatePresence mode="wait">
          {showResume && (
            <motion.section
              key="resume"
              className={styles.resumePrompt}
              initial={stepInitial}
              animate={stepAnimate}
              exit={stepExit}
              transition={stepTransition}
              aria-label="Resume session"
            >
              <h2>Welcome Back</h2>
              <p>
                You have a saved session
                {getSavedSessionName()
                  ? `: ${getSavedSessionName()}`
                  : ""}
                .
              </p>
              <div className={styles.resumeActions}>
                <button
                  type="button"
                  className={styles.reloadButton}
                  onClick={actions.resumeSession}
                >
                  Resume
                </button>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={actions.startFresh}
                >
                  Start Fresh
                </button>
              </div>
            </motion.section>
          )}

          {showSelect && (
            <motion.section
              key="select"
              className={styles.stepContainer}
              initial={stepInitial}
              animate={stepAnimate}
              exit={stepExit}
              transition={stepTransition}
              aria-label="Template selection"
            >
              <TemplateSelector
                onSelectTemplate={actions.selectTemplate}
                onSelectBlank={actions.selectBlankTemplate}
              />
            </motion.section>
          )}

          {showEdit && (
            <motion.section
              key="edit"
              className={styles.editView}
              initial={stepInitial}
              animate={stepAnimate}
              exit={stepExit}
              transition={stepTransition}
              aria-label="Content editor and preview"
            >
              <BuilderLayout
                editor={
                  <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                      <button
                        type="button"
                        className={styles.backButton}
                        onClick={actions.startFresh}
                        aria-label="Back to templates"
                      >
                        ← Templates
                      </button>
                      {state.isSavingToSupabase && (
                        <span className={styles.savingDot} aria-label="Saving">
                          Saving…
                        </span>
                      )}
                    </div>

                    <div className={styles.tabBar} role="tablist" aria-label="Editor panels">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "content"}
                        aria-controls="panel-content"
                        className={`${styles.tab} ${activeTab === "content" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("content")}
                      >
                        Content
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "design"}
                        aria-controls="panel-design"
                        className={`${styles.tab} ${activeTab === "design" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("design")}
                      >
                        Design
                      </button>
                    </div>

                    <div className={styles.tabContent}>
                      {activeTab === "content" && (
                        <div id="panel-content" role="tabpanel" aria-label="Content editing">
                          <ContentEditor
                            config={state.config}
                            onFieldChange={actions.updateField}
                            readOnly={false}
                          />
                        </div>
                      )}
                      {activeTab === "design" && (
                        <div id="panel-design" role="tabpanel" aria-label="Design customization">
                          <ThemePicker
                            packageSlug={state.packageSlug}
                            activeThemeIndex={state.baseThemeIndex}
                            customColors={state.customColors}
                            onSelectTheme={actions.selectTheme}
                            onCustomizeColor={actions.customizeColor}
                            onReset={actions.resetTheme}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                }
                preview={
                  <LivePreview
                    config={state.config}
                    theme={state.activeTheme}
                    layout={undefined}
                  />
                }
              >
                <HandoffButton
                  config={state.config}
                  packageName={state.config?.name || "Custom Website"}
                  themeLabel={state.activeTheme?.label || ""}
                  category={state.category || ""}
                />
              </BuilderLayout>
            </motion.section>
          )}
        </AnimatePresence>

        {toastMessage && (
          <div className={styles.toast} role="status" aria-live="polite">
            {toastMessage}
          </div>
        )}
      </main>
    </BuilderErrorBoundary>
  );
}
