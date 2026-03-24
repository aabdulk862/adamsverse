import AnimatedSection from "./AnimatedSection";

export default function Section({ title, id, children }) {
  return (
    <section className="section" id={id}>
      <AnimatedSection>
        <div className="section-title">{title}</div>
        <div className="grid-container">{children}</div>
      </AnimatedSection>
    </section>
  );
}
