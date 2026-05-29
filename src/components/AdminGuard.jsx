import { Navigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";

export default function AdminGuard({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <div className="auth-guard-loading" role="status" aria-label="Loading">
        <div className="auth-guard-spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (user?.publicMetadata?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
