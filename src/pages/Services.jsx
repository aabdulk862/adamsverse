import React from "react";
import Section from "../components/Section";
import PricingCard from "../components/PricingCard";

export default function Services() {
  return (
    <div className="page-container">
      <Section title="Pricing">
        <PricingCard />
      </Section>
    </div>
  );
}
