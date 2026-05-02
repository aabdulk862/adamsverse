import { useEffect, useRef, useCallback, useState } from "react";
import styles from "./Lightbox.module.css";

/**
 * Lightbox modal for viewing gallery images at full resolution.
 *
 * Props:
 *  - images: Array<{ src: string, alt: string }>
 *  - activeIndex: number
 *  - onClose: () => void
 *  - onPrev: () => void
 *  - onNext: () => void
 */
export default function Lightbox({
  images,
  activeIndex,
  onClose,
  onPrev,
  onNext,
}) {
  const backdropRef = useRef(null);
  const closeRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const touchStartX = useRef(0);

  const [isOpen, setIsOpen] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Fade-in on mount
  useEffect(() => {
    // Use rAF to ensure the initial opacity: 0 is painted before transitioning
    const frame = requestAnimationFrame(() => {
      setIsOpen(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Reset image fade on index change
  useEffect(() => {
    if (prefersReducedMotion) {
      setImageReady(true);
      return;
    }
    setImageReady(false);
    const timer = setTimeout(() => setImageReady(true), 16);
    return () => clearTimeout(timer);
  }, [activeIndex, prefersReducedMotion]);

  // Prevent background scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Focus the close button on open
  useEffect(() => {
    if (closeRef.current) {
      closeRef.current.focus();
    }
  }, []);

  // Keyboard handling
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (images && images.length > 1) onPrev();
          break;
        case "ArrowRight":
          if (images && images.length > 1) onNext();
          break;
        case "Tab": {
          // Focus trap: cycle through close, prev, next buttons
          const focusable = [
            closeRef.current,
            prevRef.current,
            nextRef.current,
          ].filter(Boolean);
          if (focusable.length === 0) return;

          const currentIndex = focusable.indexOf(document.activeElement);
          if (e.shiftKey) {
            e.preventDefault();
            const prevIndex =
              currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
            focusable[prevIndex].focus();
          } else {
            e.preventDefault();
            const nextIndex =
              currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1;
            focusable[nextIndex].focus();
          }
          break;
        }
        default:
          break;
      }
    },
    [onClose, onPrev, onNext, images?.length],
  );

  if (!images || images.length === 0) return null;

  const currentImage = images[activeIndex] || images[0];
  const showNav = images.length > 1;

  // Replace w=800 with w=1600 for larger resolution
  const fullSrc = currentImage.src
    ? currentImage.src.replace(/w=800/g, "w=1600")
    : currentImage.src;

  const backdropClassName = [
    styles.backdrop,
    isOpen || prefersReducedMotion ? styles.backdropVisible : "",
  ]
    .filter(Boolean)
    .join(" ");

  const imageClassName = [
    styles.image,
    imageReady || prefersReducedMotion ? styles.imageVisible : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={backdropRef}
      className={backdropClassName}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        // Close when clicking the backdrop (not the content)
        if (e.target === backdropRef.current) onClose();
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 50 && images.length > 1) {
          if (delta > 0) onPrev();
          else onNext();
        }
      }}
      data-testid="lightbox"
    >
      <div className={styles.content} tabIndex={-1}>
        <div className={styles.imageContainer}>
          <img
            className={imageClassName}
            src={fullSrc}
            alt={currentImage.alt || ""}
            data-testid="lightbox-image"
          />
        </div>

        {currentImage.alt && (
          <p className={styles.caption} data-testid="lightbox-caption">
            {currentImage.alt}
          </p>
        )}
      </div>

      {/* Close button — top-right */}
      <button
        ref={closeRef}
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close lightbox"
        data-testid="lightbox-close"
        type="button"
      >
        ✕
      </button>

      {/* Prev button — left edge */}
      {showNav && (
        <button
          ref={prevRef}
          className={styles.prevButton}
          onClick={onPrev}
          aria-label="Previous image"
          data-testid="lightbox-prev"
          type="button"
        >
          ‹
        </button>
      )}

      {/* Next button — right edge */}
      {showNav && (
        <button
          ref={nextRef}
          className={styles.nextButton}
          onClick={onNext}
          aria-label="Next image"
          data-testid="lightbox-next"
          type="button"
        >
          ›
        </button>
      )}
    </div>
  );
}
