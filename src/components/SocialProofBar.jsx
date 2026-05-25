import AnimatedSection from "./AnimatedSection";
import styles from "./SocialProofBar.module.css";

const capabilities = [
  { icon: "fas fa-rocket", label: "Launch Faster" },
  { icon: "fas fa-cogs", label: "Automate Operations" },
  { icon: "fas fa-chart-line", label: "Scale Smarter" },
  { icon: "fas fa-cube", label: "Build Custom Systems" },
];

export default function SocialProofBar() {
  return (
    <section className={styles.socialProofBar} aria-label="Core capabilities">
      {capabilities.map((cap, index) => (
        <AnimatedSection
          key={cap.label}
          delay={index * 0.1}
          className={styles.metric}
        >
          <span className={styles.value}>
            <i className={cap.icon} aria-hidden="true"></i>
          </span>
          <span className={styles.label}>{cap.label}</span>
        </AnimatedSection>
      ))}
    </section>
  );
}
