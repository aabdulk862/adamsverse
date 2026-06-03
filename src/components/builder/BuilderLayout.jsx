import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./BuilderLayout.module.css";

/**
 * BuilderLayout — responsive split-panel layout with draggable divider.
 *
 * Desktop (≥768px): side-by-side editor + preview with a draggable divider
 * that allows the user to adjust the panel width ratio.
 * Mobile (<768px): full-width with a toggle bar to switch between editor/preview.
 *
 * The CTA button area (children rendered below panels) remains visible on all viewports.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.editor - Editor panel content
 * @param {React.ReactNode} props.preview - Preview panel content
 * @param {React.ReactNode} [props.children] - Content rendered below panels (e.g. HandoffButton)
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */
export default function BuilderLayout({ editor, preview, children }) {
  // Split ratio as a percentage for the editor panel (0–100)
  const [splitRatio, setSplitRatio] = useState(35);
  const [isDragging, setIsDragging] = useState(false);
  const [activeView, setActiveView] = useState("editor"); // mobile toggle
  const containerRef = useRef(null);

  // Detect mobile via matchMedia (≥768px = desktop)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handleChange = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // --- Draggable divider logic (desktop only) ---
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      // Clamp between 25% and 45% to keep preview dominant
      setSplitRatio(Math.min(45, Math.max(25, pct)));
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach pointer events to window while dragging for smooth tracking
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => handlePointerMove(e);
    const onUp = () => handlePointerUp();
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // --- Mobile view ---
  if (isMobile) {
    return (
      <div className={styles.layout}>
        <nav aria-label="Builder view navigation">
          <div className={styles.mobileToggle} role="tablist" aria-label="View toggle">
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "editor"}
              aria-controls="builder-editor-panel"
              className={`${styles.toggleButton} ${activeView === "editor" ? styles.toggleActive : ""}`}
              onClick={() => setActiveView("editor")}
            >
              Editor
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === "preview"}
              aria-controls="builder-preview-panel"
              className={`${styles.toggleButton} ${activeView === "preview" ? styles.toggleActive : ""}`}
              onClick={() => setActiveView("preview")}
            >
              Preview
            </button>
          </div>
        </nav>

        <div className={styles.mobileContent}>
          {activeView === "editor" && (
            <div
              id="builder-editor-panel"
              role="tabpanel"
              aria-label="Editor panel"
              className={styles.mobilePanel}
            >
              {editor}
            </div>
          )}
          {activeView === "preview" && (
            <div
              id="builder-preview-panel"
              role="tabpanel"
              aria-label="Preview panel"
              className={styles.mobilePanel}
            >
              {preview}
            </div>
          )}
        </div>

        {children && <div className={styles.ctaArea}>{children}</div>}
      </div>
    );
  }

  // --- Desktop view ---
  return (
    <div className={styles.layout}>
      <div
        ref={containerRef}
        className={`${styles.splitContainer} ${isDragging ? styles.dragging : ""}`}
      >
        <div
          className={styles.editorPane}
          style={{ flexBasis: `${splitRatio}%` }}
          aria-label="Editor panel"
        >
          {editor}
        </div>

        <div
          className={styles.divider}
          onPointerDown={handlePointerDown}
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={Math.round(splitRatio)}
          aria-valuemin={25}
          aria-valuemax={45}
          aria-label="Resize panels"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              setSplitRatio((r) => Math.max(25, r - 2));
            } else if (e.key === "ArrowRight") {
              setSplitRatio((r) => Math.min(45, r + 2));
            }
          }}
        >
          <div className={styles.dividerHandle} />
        </div>

        <div
          className={styles.previewPane}
          style={{ flexBasis: `${100 - splitRatio}%` }}
          aria-label="Preview panel"
          role="complementary"
        >
          {preview}
        </div>
      </div>

      {children && <div className={styles.ctaArea}>{children}</div>}
    </div>
  );
}
