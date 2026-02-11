import React from "react";
import Section from "../components/Section";
import Card from "../components/Card";

export default function Projects() {
  return (
    <div>
      <h1>Coming soon...</h1>
      <Section title="Projects">
        <Card
          icon="fas fa-star"
          text="Client Testimonials"
          link="#"
          fullWidth
        />
        <Card
          icon="fas fa-project-diagram"
          text="My Portfolio"
          link="https://adam-abdul.com/"
        />
      </Section>
    </div>
  );
}
