import React from "react";

export default function Card({ icon, text, link, fullWidth }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={`card ${fullWidth ? "full-width" : ""}`}
    >
      <i className={icon}></i>
      <span>{text}</span>
    </a>
  );
}
