import React from "react";
import EmailForm from "../components/EmailForm";

export default function ContactSection() {
  return (
    <div className="page-container">
      <section className="section">
        <h2 className="section-title">Contact Me</h2>
        <div className="email-form-card-wrapper">
          <EmailForm />
        </div>
      </section>
    </div>
  );
}
