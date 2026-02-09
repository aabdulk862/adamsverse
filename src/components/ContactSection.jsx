// ContactSection.jsx
import React from "react";
import EmailForm from "./EmailForm";

export default function ContactSection() {
  return (
    <section className="section">
      <h2 className="section-title">Contact Me</h2>
      <EmailForm />
    </section>
  );
}
