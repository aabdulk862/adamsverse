import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import usa from "../assets/images/usa.png";
import eritrea from "../assets/images/eritrea.png";

function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mql.matches);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

const subtitleText =
  "Building experiences, creating content, and connecting communities.";

const rolePills = [
  { label: "Web Development 💻", cls: "role-pill role-pill--dev" },
  { label: "Content Creation 📲", cls: "role-pill role-pill--content" },
  { label: "Community Engagement 🌐", cls: "role-pill role-pill--community" },
];

function AnimatedSubtitle({ text, isMobile }) {
  const words = text.split(" ");
  const baseDuration = isMobile ? 0.25 : 0.4;
  const baseDelay = isMobile ? 0.04 : 0.08;
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: baseDelay,
        delayChildren: isMobile ? 0.2 : 0.4,
      },
    },
  };
  const child = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 0.85,
      y: 0,
      transition: { duration: baseDuration, ease: "easeOut" },
    },
  };
  return (
    <motion.p
      className="profile-subtitle"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={child}
          style={{ display: "inline-block", marginRight: "0.3em" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}

export default function ProfileHeader() {
  const isMobile = useIsMobile();
  const duration = isMobile ? 0.3 : 0.6;

  return (
    <motion.div
      className="profile-header"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: "easeOut" }}
    >
      <span className="bg-circle circle-1"></span>
      <span className="bg-circle circle-2"></span>

      <div className="profile-identity">
        <h1 className="profile-title">
          Content • Community
          <img src={usa} alt="USA flag" className="flag" />
          <img src={eritrea} alt="Eritrea flag" className="flag" />
        </h1>
        <AnimatedSubtitle text={subtitleText} isMobile={isMobile} />
      </div>

      <div className="roles">
        {rolePills.map((pill) => (
          <span key={pill.label} className={pill.cls}>
            {pill.label}
          </span>
        ))}
      </div>

      <a href="/#contact" className="profile-cta">
        Let&apos;s Work Together
      </a>
    </motion.div>
  );
}
