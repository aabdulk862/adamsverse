import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <h1>404 — Page Not Found</h1>
      <p style={{ marginTop: "1rem" }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" style={{ marginTop: "1.5rem", display: "inline-block", color: "var(--accent-primary, #7c5cfc)" }}>
        ← Back to Home
      </Link>
    </div>
  );
}
