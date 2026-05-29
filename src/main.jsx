import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import "./tokens.css";
import "./styles.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function MissingClerkKeyError() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        backgroundColor: "#fef2f2",
        color: "#991b1b",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Configuration Error
      </h1>
      <p style={{ maxWidth: "480px", lineHeight: 1.6 }}>
        The <code>VITE_CLERK_PUBLISHABLE_KEY</code> environment variable is
        missing. Please add it to your <code>.env</code> file to enable
        authentication.
      </p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

if (!clerkPubKey) {
  root.render(
    <React.StrictMode>
      <MissingClerkKeyError />
    </React.StrictMode>,
  );
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider
        publishableKey={clerkPubKey}
        signInUrl="/login"
        signUpUrl="/signup"
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    </React.StrictMode>,
  );
}
