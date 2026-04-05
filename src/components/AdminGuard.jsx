import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AdminGuard({ children }) {
  const { session, profile, loading } = useAuth()

  // Wait for both session and profile to resolve
  if (loading || (session && !profile)) {
    return (
      <div className="auth-guard-loading" role="status" aria-label="Loading">
        <div className="auth-guard-spinner" />
        <p>Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
