import { SignIn, useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import styles from "./SignInPage.module.css";

export default function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="container">
        <div className={styles.page}>
          <div className={styles.authGuardLoading} role="status" aria-label="Loading">
            <div className={styles.authGuardSpinner} />
            <span>Loading…</span>
          </div>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    const selectedTier = sessionStorage.getItem("selectedTier");
    if (selectedTier) {
      sessionStorage.removeItem("selectedTier");
      return <Navigate to={`/dashboard/intake/${selectedTier}`} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/signup"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
