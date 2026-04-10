import AnimatedSection from "./AnimatedSection";

export default function Section({ title, subtitle, id, children, className }) {
  return (
    <section className={`section${className ? ` ${className}` : ''}`} id={id}>
      <AnimatedSection>
        <div className="section-title">{title}</div>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        {children}
      </AnimatedSection>
    </section>
  );
}
