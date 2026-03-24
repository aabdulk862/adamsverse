export default function Section({ title, id, children }) {
  return (
    <section className="section" id={id}>
      <div className="section-title">{title}</div>
      <div className="grid-container">{children}</div>
    </section>
  );
}
