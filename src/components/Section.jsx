import React from "react";

export default function Section({ title, children }) {
  return (
    <>
      <div className="section-title">{title}</div>
      <div className="grid-container">{children}</div>
    </>
  );
}
