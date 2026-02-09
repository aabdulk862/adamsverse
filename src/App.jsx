import React from "react";
import Banner from "./components/Banner";
import ProfileHeader from "./components/ProfileHeader";
import Section from "./components/Section";
import PricingCard from "./components/PricingCard";
import Card from "./components/Card";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function App() {
  return (
    <div className="container">
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

      <Section title="Pricing">
        <PricingCard />
      </Section>

      <Section title="Contact Me">
        <div className="email-form-card-wrapper">
          <form
            className="email-form"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Form submitted!");
            }}
          >
            <div className="form-row">
              <label>
                Name
                <input type="text" placeholder="Enter your name" required />
              </label>

              <label>
                Email
                <input type="email" placeholder="Enter your email" required />
              </label>
            </div>

            <label>
              Reason
              <select required>
                <option value="">Select a reason</option>
                <option value="work">Work Inquiry</option>
                <option value="collab">Collaboration</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              Message
              <textarea
                placeholder="Write your message here..."
                rows={4}
                required
              />
            </label>

            <button type="submit">
              <i className="fas fa-paper-plane"></i> Send Message
            </button>
          </form>
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

      <br />
      <footer>&copy; 2026 Adams Verse</footer>
    </div>
  );
}
