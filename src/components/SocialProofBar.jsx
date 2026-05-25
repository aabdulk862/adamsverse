import AnimatedSection from "./AnimatedSection";

const capabilities = [
  { icon: "fas fa-layer-group", label: "Website Packages" },
  { icon: "fas fa-robot", label: "AI Systems" },
  { icon: "fas fa-tools", label: "Developer Tools" },
  { icon: "fas fa-code", label: "Custom Platforms" },
];

export default function SocialProofBar() {
  return (
    <section className="social-proof-bar" aria-label="Core capabilities">
      {capabilities.map((cap, index) => (
        <AnimatedSection
          key={cap.label}
          delay={index * 0.1}
          className="social-proof-metric"
        >
          <span className="social-proof-value">
            <i className={cap.icon} aria-hidden="true"></i>
          </span>
          <span className="social-proof-label">{cap.label}</span>
        </AnimatedSection>
      ))}
    </section>
  );
}
