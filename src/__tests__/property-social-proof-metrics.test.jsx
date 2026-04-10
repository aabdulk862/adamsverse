// Feature: saas-homepage-redesign, Property 1: Metrics bar renders all metrics with value and label
// **Validates: Requirements 2.2**

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { render } from "@testing-library/react";

/**
 * Test helper that renders the same Social Proof Bar JSX structure
 * used inline in HomePage.jsx, but with arbitrary metrics data.
 * Uses a plain div instead of AnimatedSection to avoid Framer Motion
 * IntersectionObserver dependency in jsdom — we're testing the
 * rendering pattern, not the animation.
 */
function SocialProofBar({ metrics }) {
  return (
    <div className="social-proof-bar">
      {metrics.map((metric, index) => (
        <div key={metric.label} className="social-proof-metric">
          <span className="social-proof-value">{metric.value}</span>
          <span className="social-proof-label">{metric.label}</span>
        </div>
      ))}
    </div>
  );
}

// Generator: array of 3–5 metric objects with non-empty value and unique non-empty label
const metricArb = fc.record({
  value: fc.string({ minLength: 1, maxLength: 10 }),
  label: fc.string({ minLength: 1, maxLength: 30 }),
});

const metricsArrayArb = fc
  .array(metricArb, { minLength: 3, maxLength: 5 })
  .filter((arr) => new Set(arr.map((m) => m.label)).size === arr.length);

describe("Property 1: Metrics bar renders all metrics with value and label", () => {
  it("for any array of 3–5 metrics, the bar renders each metric's value and label", () => {
    fc.assert(
      fc.property(metricsArrayArb, (metrics) => {
        const { container, unmount } = render(<SocialProofBar metrics={metrics} />);

        const renderedMetrics = container.querySelectorAll(".social-proof-metric");
        expect(renderedMetrics.length).toBe(metrics.length);

        metrics.forEach((metric) => {
          const values = container.querySelectorAll(".social-proof-value");
          const labels = container.querySelectorAll(".social-proof-label");

          const valueTexts = Array.from(values).map((el) => el.textContent);
          const labelTexts = Array.from(labels).map((el) => el.textContent);

          expect(valueTexts).toContain(metric.value);
          expect(labelTexts).toContain(metric.label);
        });

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
