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
          {/* Add 'data-netlify="true"' for Netlify Forms */}
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            className="email-form"
          >
            {/* Hidden input for Netlify */}
            <input type="hidden" name="form-name" value="contact" />
            {/* Honeypot for spam bots */}
            <input type="hidden" name="bot-field" />

             <h2>Let’s Work Together</h2>
          <p
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              fontSize: "0.95rem",
              opacity: 0.85,
              lineHeight: 1.5,
            }}
          >
            I’m excited to hear about your project! Please provide your name,
            email, and a brief description of your requirements. If you have a
            budget in mind, let me know — I’ll work with you to find the best
            solution. The more details you share, the better I can understand
            your needs and deliver exactly what you’re looking for.
          </p>

            <div className="form-row">
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                />
              </label>
            </div>

            <label>
              Reason
              <select name="reason" required>
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
                name="message"
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
