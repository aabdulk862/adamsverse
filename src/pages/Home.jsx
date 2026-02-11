import React from "react";
import Banner from "../components/Banner";
import ProfileHeader from "../components/ProfileHeader";
import Section from "../components/Section";
import Card from "../components/Card";

export default function Home() {
  return (
    <div>
      <Banner />
      <ProfileHeader />

      <Section title="Development">
        <Card
          icon="fas fa-file-code"
          text="Check out my Work"
          link="https://adam-abdul.com/"
          fullWidth
        />
      </Section>

      <Section title="Content & Socials">
        <Card
          icon="fas fa-envelope"
          text="Email"
          link="mailto:adamvmedia@outlook.com"
        />
        <Card
          icon="fab fa-youtube"
          text="YouTube"
          link="https://www.youtube.com/@theadamverse"
        />
        <Card
          icon="fab fa-twitch"
          text="Twitch"
          link="https://twitch.tv/adams_verse"
        />
      </Section>
    </div>
  );
}
