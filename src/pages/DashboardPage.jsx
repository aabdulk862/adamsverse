import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import { useInvoices } from '../hooks/useInvoices'
import { useNotifications } from '../hooks/useNotifications'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { projects, loading: projectsLoading, fetchProjects } = useProjects()
  const { invoices, loading: invoicesLoading, fetchInvoices } = useInvoices()
  const { unreadMessages, loading: notificationsLoading, fetchNotifications } = useNotifications()

  useEffect(() => {
    fetchProjects()
    fetchInvoices()
    fetchNotifications()
  }, [fetchProjects, fetchInvoices, fetchNotifications])

  const activeProjects = projects.filter(
    (p) => p.status !== 'Closed' && p.status !== 'Delivered'
  )

  const outstandingInvoices = invoices.filter(
    (inv) => inv.status === 'Sent' || inv.status === 'Overdue'
  )
  const outstandingTotal = outstandingInvoices.reduce(
    (sum, inv) => sum + Number(inv.total_amount || 0),
    0
  )
  const nextDueInvoice = outstandingInvoices
    .filter((inv) => inv.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0]

  const loading = projectsLoading || invoicesLoading || notificationsLoading
  const displayName = profile?.display_name || 'there'
  const firstName = displayName.split(' ')[0]

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page-greeting">
        Welcome back, {firstName}
      </h1>

      {loading ? (
        <div className="dashboard-page-loading">
          <div className="auth-guard-spinner" />
          <span>Loading your dashboard…</span>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="dashboard-summary-cards">
            <div className="dashboard-summary-card">
              <div className="dashboard-summary-icon dashboard-summary-icon--projects">
                <i className="fa-solid fa-folder-open" />
              </div>
              <div className="dashboard-summary-info">
                <span className="dashboard-summary-value">{activeProjects.length}</span>
                <span className="dashboard-summary-label">Active Projects</span>
              </div>
            </div>

            <div className="dashboard-summary-card">
              <div className="dashboard-summary-icon dashboard-summary-icon--billing">
                <i className="fa-solid fa-file-invoice-dollar" />
              </div>
              <div className="dashboard-summary-info">
                <span className="dashboard-summary-value">
                  ${outstandingTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="dashboard-summary-label">
                  {nextDueInvoice
                    ? `Due ${new Date(nextDueInvoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : 'Outstanding Balance'}
                </span>
              </div>
            </div>

            <div className="dashboard-summary-card">
              <div className="dashboard-summary-icon dashboard-summary-icon--messages">
                <i className="fa-solid fa-comments" />
              </div>
              <div className="dashboard-summary-info">
                <span className="dashboard-summary-value">
                  {unreadMessages}
                  {unreadMessages > 0 && (
                    <span className="dashboard-summary-badge">{unreadMessages}</span>
                  )}
                </span>
                <span className="dashboard-summary-label">Unread Messages</span>
              </div>
            </div>
          </div>

          {/* Recent projects or empty state */}
          <div className="dashboard-recent-section">
            <div className="dashboard-recent-header">
              <h2 className="dashboard-recent-title">Recent Projects</h2>
              {activeProjects.length > 0 && (
                <Link to="/dashboard/projects" className="dashboard-recent-link">
                  View all <i className="fa-solid fa-arrow-right" />
                </Link>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="dashboard-empty-state">
                <div className="dashboard-empty-icon">
                  <i className="fa-solid fa-rocket" />
                </div>
                <h3>No projects yet</h3>
                <p>Ready to bring your idea to life? Pick a service tier and let's get started.</p>
                <Link to="/services" className="dashboard-empty-cta">
                  Start a new project <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            ) : (
              <div className="dashboard-projects-list">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    to={`/dashboard/projects/${project.id}`}
                    className="dashboard-project-row"
                  >
                    <div className="dashboard-project-name">{project.name}</div>
                    <div className="dashboard-project-meta">
                      <span className={`dashboard-project-status dashboard-project-status--${project.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {project.status}
                      </span>
                      <span className="dashboard-project-date">
                        {project.updated_at
                          ? new Date(project.updated_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
