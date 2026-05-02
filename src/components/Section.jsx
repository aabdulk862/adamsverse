import AnimatedSection from "./AnimatedSection";

export default function Section({ title, subtitle, id, children, className }) {
  return (
    <section className={`section${className ? ` ${className}` : ""}`} id={id}>
      <AnimatedSection>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        {children}
      </AnimatedSection>
    </section>
  );
}
