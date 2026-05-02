import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const {
    session,
    loading,
    error,
    clearError,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
  } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(
    searchParams.get("mode") === "signup" ? "signup" : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  if (loading) {
    return (
      <div className="container">
        <div className="login-page">
          <div className="auth-guard-loading">
            <div className="auth-guard-spinner" />
            <span>Loading…</span>
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    const selectedTier = sessionStorage.getItem("selectedTier");
    if (selectedTier) {
      sessionStorage.removeItem("selectedTier");
      return <Navigate to={`/dashboard/intake/${selectedTier}`} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    clearError();

    if (mode === "signup") {
      const success = await signUpWithEmail(email, password, name);
      if (success) {
        setConfirmationSent(true);
      }
    } else {
      const success = await signInWithEmail(email, password);
      if (success) {
        // onAuthStateChange will handle the redirect
      }
    }
    setSubmitting(false);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "signin" ? "signup" : "signin"));
    clearError();
    setConfirmationSent(false);
  };

  if (confirmationSent) {
    return (
      <div className="container">
        <div className="login-page">
          <div className="login-card">
            <div className="login-header">
              <h1 className="login-title">Check your email</h1>
              <p className="login-subtitle">
                We sent a confirmation link to{" "}
                <span style={{ fontWeight: 600 }}>{email}</span>. Click the link
                to activate your account, then come back and sign in.
              </p>
            </div>
            <button
              className="login-google-btn"
              onClick={() => {
                setConfirmationSent(false);
                setMode("signin");
              }}
              type="button"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">
              {mode === "signin"
                ? "Sign in to your account"
                : "Create an account"}
            </h1>
            <p className="login-subtitle">
              Manage your projects, view invoices, and message us directly.
            </p>
          </div>

          {/* Google OAuth */}
          <button
            className="login-google-btn"
            onClick={signInWithGoogle}
            type="button"
          >
            <svg
              className="login-google-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="login-divider">
            <span>or</span>
          </div>

          {/* Email form */}
          <form className="login-email-form" onSubmit={handleEmailSubmit}>
            {mode === "signup" && (
              <label htmlFor="login-name">
                Name
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>
            )}

            <label htmlFor="login-email">
              Email
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </label>

            <label htmlFor="login-password">
              Password
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "signup" ? "At least 6 characters" : "Your password"
                }
                required
                minLength={6}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
              />
            </label>

            {error && (
              <div className="form-status-error" role="alert">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="login-email-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>{" "}
                  {mode === "signup" ? "Creating account..." : "Signing in..."}
                </>
              ) : mode === "signup" ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="login-toggle">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="login-toggle-btn"
                  onClick={toggleMode}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="login-toggle-btn"
                  onClick={toggleMode}
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="login-note">
            We only use your email to verify your identity. We never share it
            with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
