// ContactSection.jsx
import React from "react";
import EmailForm from "../components/EmailForm";

export default function ContactSection() {
  return (
    <section className="section">
      <h2 className="section-title">Contact Me</h2>
      <div className="email-form-card-wrapper">
        <EmailForm />
      </div>
    </section>
  );
}
