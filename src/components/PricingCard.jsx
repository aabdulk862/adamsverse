import React, { useState } from "react";

export default function PricingCard() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`card full-width pricing-card ${open ? "active" : ""}`}
      onClick={() => setOpen(!open)}
    >
      <i className="fas fa-tags"></i>
      <span>View Pricing</span>
      <div className="pricing-details">
        <strong>Web/App Development:</strong> $35–$50/hr or $500–$1,500/project
        <br />
        <strong>Content Creation:</strong> $25–$40/hr or $200–$600/month
        <br />
        <strong>Consulting:</strong> $40–$60/hr
        <br />
        <strong>Optional Add-ons:</strong> Rush +15–25%, Extra revisions $20–$50
      </div>
    </div>
  );
}
