import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

export default function Card({ icon, text, link, fullWidth, index = 0 }) {
  const isMobile = useIsMobile();
  const duration = isMobile ? 0.3 : 0.5;
  const delay = index * 0.1;

  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={`card ${fullWidth ? "full-width" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      <i className={icon}></i>
      <span>{text}</span>
    </motion.a>
  );
}
