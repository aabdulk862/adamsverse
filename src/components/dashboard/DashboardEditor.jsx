import { useState } from "react";
import { useDashboardEditor } from "../../hooks/useDashboardEditor";
import { validatePackageConfig } from "../../schemas/packageSchema";
import BuilderLayout from "../builder/BuilderLayout";
import ContentEditor from "../builder/ContentEditor";
import ThemePicker from "../builder/ThemePicker";
import LivePreview from "../builder/LivePreview";
import ViewportToggle from "./ViewportToggle";
import SectionOrderList from "./SectionOrderList";
import PublishButton from "./PublishButton";
import styles from "./DashboardEditor.module.css";

const VIEWPORT_WIDTHS = { desktop: "1280px", tablet: "768px", phone: "375px" };

/**
 * DashboardEditor — orchestrates the editor tab in ProjectDetailPage.
 * Reuses builder components with Supabase persistence via useDashboardEditor.
 */
export default function DashboardEditor({ projectId, project }) {
  const [activeTab, setActiveTab] = useState("content");
  const [activeViewport, setActiveViewport] = useState("desktop");

  const intakeData = project?.intake_data;
  const hasValidSections = !!intakeData?.sections;
  const configValid = hasValidSections && validatePackageConfig(intakeData);

  const [state, actions] = useDashboardEditor({ projectId, intakeData: configValid ? intakeData : null });

  if (!hasValidSections) {
    return (
      <div className={styles.error}>
        <p>No editable site configuration found for this project.</p>
      </div>
    );
  }

  if (!configValid) {
    const downloadConfig = () => {
      const blob = new Blob([JSON.stringify(intakeData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `config-${projectId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
    return (
      <div className={styles.error}>
        <h3>Configuration Issue</h3>
        <p>Your site configuration has an issue. Please contact support.</p>
        <button type="button" className={styles.downloadBtn} onClick={downloadConfig}>
          Download Config
        </button>
      </div>
    );
  }

  if (!state.config) return null;

  const saveLabel = state.saveStatus === "saving" ? "Saving…"
    : state.saveStatus === "saved" ? "Saved ✓"
    : state.saveStatus === "error" ? "Save failed" : null;

  return (
    <div className={styles.wrapper}>
      {saveLabel && (
        <div className={`${styles.saveStatus} ${styles[state.saveStatus]}`} role="status" aria-live="polite">
          {saveLabel}
        </div>
      )}

      <BuilderLayout
        editor={
          <div className={styles.sidebar}>
            <div className={styles.tabBar} role="tablist" aria-label="Editor panels">
              {["content", "design", "sections"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`${styles.tab}${activeTab === tab ? ` ${styles.tabActive}` : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.tabContent}>
              {activeTab === "content" && (
                <ContentEditor
                  config={state.config}
                  onFieldChange={actions.updateField}
                  readOnly={state.isReadOnly}
                />
              )}
              {activeTab === "design" && (
                <ThemePicker
                  packageSlug={state.config.slug}
                  activeThemeIndex={state.baseThemeIndex}
                  customColors={state.customColors}
                  onSelectTheme={actions.selectTheme}
                  onCustomizeColor={actions.customizeColor}
                  onReset={actions.resetTheme}
                />
              )}
              {activeTab === "sections" && (
                <SectionOrderList
                  sectionOrder={state.sectionOrder}
                  sections={state.config.sections}
                  onReorder={actions.reorderSections}
                />
              )}
            </div>
          </div>
        }
        preview={
          <div className={styles.previewArea}>
            <ViewportToggle activeViewport={activeViewport} onChange={setActiveViewport} />
            <div className={styles.viewportFrame} style={{ maxWidth: VIEWPORT_WIDTHS[activeViewport] }}>
              <LivePreview config={state.config} theme={state.activeTheme} layout={undefined} />
            </div>
          </div>
        }
      >
        <PublishButton
          projectId={projectId}
          isPublished={state.isPublished}
          slug={state.config.slug}
          onPublish={actions.publish}
        />
      </BuilderLayout>
    </div>
  );
}
