import { useRef, useState, useEffect } from "react";

/**
 * Custom hook that uses Intersection Observer to trigger a one-time
 * entrance animation when an element scrolls into view.
 *
 * Returns { ref, isVisible } — attach `ref` to the target element and
 * use `isVisible` to toggle CSS animation classes.
 *
 * @param {Object} [options]
 * @param {number} [options.threshold=0.15] - Intersection Observer visibility threshold.
 * @param {boolean} [options.skip=false] - If true, returns isVisible: true immediately (e.g. Hero exemption).
 * @returns {{ ref: React.RefObject, isVisible: boolean }}
 */
export function useScrollAnimation({ threshold = 0.15, skip = false } = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(() => {
    // Skip animation entirely when requested (e.g. Hero section)
    if (skip) return true;

    // Fall back to visible if IntersectionObserver is not supported
    if (typeof IntersectionObserver === "undefined") return true;

    // Respect prefers-reduced-motion: show content immediately
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return true;
    }

    return false;
  });

  useEffect(() => {
    // Nothing to observe if already visible
    if (isVisible) return;

    // Guard: no IntersectionObserver support
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, isVisible]);

  return { ref, isVisible };
}
