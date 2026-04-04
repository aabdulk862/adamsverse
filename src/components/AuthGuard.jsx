import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AuthGuard({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
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

  return children
}
