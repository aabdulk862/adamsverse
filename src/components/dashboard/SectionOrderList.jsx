import { useState } from "react";
import styles from "./SectionOrderList.module.css";

const SECTION_META = {
  hero: "Hero",
  services: "Services",
  gallery: "Gallery",
  testimonials: "Testimonials",
  cta: "Call to Action",
  contact: "Contact",
};

/**
 * SectionOrderList — drag-to-reorder list of website sections.
 * Uses native HTML Drag and Drop with up/down arrow fallbacks.
 */
export default function SectionOrderList({ sectionOrder, sections, onReorder }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setOverIdx(idx);
  };

  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setOverIdx(null); return; }
    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, moved);
    onReorder(newOrder);
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => { setDragIdx(null); setOverIdx(null); };

  const move = (from, to) => {
    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);
    onReorder(newOrder);
  };

  return (
    <div className={styles.list} role="list" aria-label="Section order">
      {sectionOrder.map((key, idx) => {
        if (!sections[key]) return null;
        const label = SECTION_META[key] || key;
        return (
          <div
            key={key}
            role="listitem"
            draggable
            className={`${styles.item}${dragIdx === idx ? ` ${styles.dragging}` : ""}${overIdx === idx && dragIdx !== idx ? ` ${styles.over}` : ""}`}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
          >
            <i className={`fa-solid fa-grip-vertical ${styles.grip}`} aria-hidden="true" />
            <span className={styles.label}>{label}</span>
            <div className={styles.arrows}>
              <button
                type="button"
                aria-label={`Move ${label} up`}
                disabled={idx === 0}
                onClick={() => move(idx, idx - 1)}
                className={styles.arrowBtn}
              >
                <i className="fa-solid fa-chevron-up" />
              </button>
              <button
                type="button"
                aria-label={`Move ${label} down`}
                disabled={idx === sectionOrder.length - 1}
                onClick={() => move(idx, idx + 1)}
                className={styles.arrowBtn}
              >
                <i className="fa-solid fa-chevron-down" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
