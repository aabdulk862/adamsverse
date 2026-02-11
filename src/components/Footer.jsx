import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>&copy; {new Date().getFullYear()} AdamsVerse LLC</p>
      </div>
    </footer>
  );
}