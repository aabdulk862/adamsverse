import React from "react";
import Banner from "../components/Banner";
import ProfileHeader from "../components/ProfileHeader";
import Section from "../components/Section";
import Card from "../components/Card";

export default function Home() {
  return (
    <div className="page-container">
      <ProfileHeader />
      <Section title="Development">
        <Card
          icon="fas fa-file-code"
          text="Check out my Work"
          link="https://adam-abdul.com/"
          fullWidth
        />
      </Section>

      <Section title="Discord">
        <div className="verse-card">
          <p className="verse-text">
            Join the community, collaborate with creators, and stay connected
            inside the Verse.
          </p>

          <a
            href="https://discord.gg/bCyn6j6bh"
            target="_blank"
            rel="noopener noreferrer"
            className="verse-discord-link"
          >
            <i className="fa-brands fa-discord"></i>
            Enter the Verse
          </a>
        </div>
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
        <Card
          icon="fab fa-tiktok"
          text="TikTok"
          link="https://www.tiktok.com/@adams_verse"
        />
        <Card
          icon="fab fa-twitter"
          text="Twitter"
          link="https://x.com/theadamverse"
        />
        <Card
          icon="fab fa-instagram"
          text="Instagram"
          link="https://instagram.com/adam.abdulkadir"
        />
      </Section>

      {/* Support Section */}
      <Section title="Support">
        <Card
          icon="fas fa-dollar-sign"
          text="Cash App"
          link="https://cash.app/$AdamAbdulkadir"
        />
        <Card
          icon="fas fa-money-bill-wave"
          text="Venmo"
          link="https://venmo.com/Adam862"
        />
      </Section>
    </div>
  );
}
