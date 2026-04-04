import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function AdminClientsPage() {
  const { loading: authLoading } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const [expandedClient, setExpandedClient] = useState(null)
  const [clientDetail, setClientDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: profiles, error: profilesErr } = await supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url, role, created_at')
        .eq('role', 'client')
        .order('created_at', { ascending: false })

      if (profilesErr) throw profilesErr

      // Fetch project counts and revenue per client
      const { data: projects, error: projErr } = await supabase
        .from('projects')
        .select('id, client_id, status')

      if (projErr) throw projErr

      const { data: invoices, error: invErr } = await supabase
        .from('invoices')
        .select('id, client_id, total_amount, status')

      if (invErr) throw invErr

      const enriched = (profiles || []).map((client) => {
        const clientProjects = projects?.filter((p) => p.client_id === client.id) || []
        const activeCount = clientProjects.filter(
          (p) => p.status !== 'Closed' && p.status !== 'Delivered'
        ).length
        const clientInvoices = invoices?.filter((i) => i.client_id === client.id) || []
        const totalRevenue = clientInvoices
          .filter((i) => i.status === 'Paid')
          .reduce((sum, i) => sum + Number(i.total_amount || 0), 0)

        return {
          ...client,
          activeProjectCount: activeCount,
          totalProjectCount: clientProjects.length,
          totalRevenue,
        }
      })

      setClients(enriched)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) fetchClients()
  }, [authLoading, fetchClients])

  const fetchClientDetail = useCallback(async (clientId) => {
    setDetailLoading(true)
    try {
      const [projectsRes, invoicesRes, messagesRes] = await Promise.all([
        supabase
          .from('projects')
          .select('id, name, status, service_tier, created_at, updated_at')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false }),
        supabase
          .from('invoices')
          .select('id, project_id, status, total_amount, due_date, paid_at, created_at')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false }),
        supabase
          .from('messages')
          .select('id, project_id, sender_id, content, created_at')
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      // Filter messages to only those belonging to this client's projects
      const clientProjectIds = (projectsRes.data || []).map((p) => p.id)
      const clientMessages = (messagesRes.data || []).filter((m) =>
        clientProjectIds.includes(m.project_id)
      )

      setClientDetail({
        projects: projectsRes.data || [],
        invoices: invoicesRes.data || [],
        messages: clientMessages,
      })
    } catch (err) {
      setClientDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const handleExpand = (clientId) => {
    if (expandedClient === clientId) {
      setExpandedClient(null)
      setClientDetail(null)
    } else {
      setExpandedClient(clientId)
      fetchClientDetail(clientId)
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.display_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]
    if (sortField === 'totalRevenue' || sortField === 'activeProjectCount') {
      aVal = Number(aVal || 0)
      bVal = Number(bVal || 0)
    } else if (sortField === 'created_at') {
      aVal = new Date(aVal || 0).getTime()
      bVal = new Date(bVal || 0).getTime()
    } else {
      aVal = String(aVal || '').toLowerCase()
      bVal = String(bVal || '').toLowerCase()
    }
    if (aVal < bVal) return sortAsc ? -1 : 1
    if (aVal > bVal) return sortAsc ? 1 : -1
    return 0
  })

  const SortIcon = ({ field }) => (
    <i className={`fa-solid fa-sort${sortField === field ? (sortAsc ? '-up' : '-down') : ''}`} />
  )

  if (authLoading || loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="auth-guard-spinner" />
          <span>Loading clients…</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <h1 className="admin-page-title">Clients</h1>
        <div className="admin-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
          <button onClick={fetchClients} className="admin-retry-btn">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-page-title">Clients</h1>
        <Link to="/admin" className="admin-back-link">
          <i className="fa-solid fa-arrow-left" /> Dashboard
        </Link>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search clients"
          />
        </div>
        <span className="admin-result-count">{sorted.length} client{sorted.length !== 1 ? 's' : ''}</span>
      </div>

      {sorted.length === 0 ? (
        <div className="admin-empty">
          {search ? 'No clients match your search' : 'No clients registered yet'}
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--clickable">
            <thead>
              <tr>
                <th onClick={() => handleSort('display_name')} className="admin-th-sortable">
                  Client <SortIcon field="display_name" />
                </th>
                <th onClick={() => handleSort('created_at')} className="admin-th-sortable">
                  Registered <SortIcon field="created_at" />
                </th>
                <th onClick={() => handleSort('activeProjectCount')} className="admin-th-sortable">
                  Active Projects <SortIcon field="activeProjectCount" />
                </th>
                <th onClick={() => handleSort('totalRevenue')} className="admin-th-sortable">
                  Revenue <SortIcon field="totalRevenue" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((client) => (
                <>
                  <tr
                    key={client.id}
                    className={`admin-client-row${expandedClient === client.id ? ' admin-client-row--expanded' : ''}`}
                    onClick={() => handleExpand(client.id)}
                  >
                    <td>
                      <div className="admin-client-cell">
                        {client.avatar_url ? (
                          <img src={client.avatar_url} alt="" className="admin-client-avatar" />
                        ) : (
                          <div className="admin-client-avatar-fallback">
                            {(client.display_name || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="admin-client-name">{client.display_name || 'Unnamed'}</div>
                          <div className="admin-client-email">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="admin-table-date">
                      {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>{client.activeProjectCount}</td>
                    <td className="admin-table-amount">
                      ${client.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  {expandedClient === client.id && (
                    <tr key={`${client.id}-detail`} className="admin-client-detail-row">
                      <td colSpan={4}>
                        <ClientDetailPanel detail={clientDetail} loading={detailLoading} />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


function ClientDetailPanel({ detail, loading }) {
  if (loading) {
    return (
      <div className="admin-detail-panel">
        <div className="admin-loading admin-loading--inline">
          <div className="auth-guard-spinner" />
          <span>Loading details…</span>
        </div>
      </div>
    )
  }

  if (!detail) return null

  return (
    <div className="admin-detail-panel">
      {/* Project history */}
      <div className="admin-detail-section">
        <h4 className="admin-detail-title">
          <i className="fa-solid fa-folder-open" /> Projects ({detail.projects.length})
        </h4>
        {detail.projects.length === 0 ? (
          <p className="admin-detail-empty">No projects</p>
        ) : (
          <div className="admin-detail-list">
            {detail.projects.map((p) => (
              <div key={p.id} className="admin-detail-item">
                <span className="admin-detail-item-name">{p.name}</span>
                <span className={`admin-status-badge admin-status--${p.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {p.status}
                </span>
                <span className="admin-detail-item-meta">{formatTier(p.service_tier)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice history */}
      <div className="admin-detail-section">
        <h4 className="admin-detail-title">
          <i className="fa-solid fa-file-invoice-dollar" /> Invoices ({detail.invoices.length})
        </h4>
        {detail.invoices.length === 0 ? (
          <p className="admin-detail-empty">No invoices</p>
        ) : (
          <div className="admin-detail-list">
            {detail.invoices.map((inv) => (
              <div key={inv.id} className="admin-detail-item">
                <span className="admin-detail-item-name">
                  ${Number(inv.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`admin-status-badge admin-status--${inv.status?.toLowerCase()}`}>
                  {inv.status}
                </span>
                <span className="admin-detail-item-meta">
                  {inv.due_date ? `Due ${new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message history */}
      <div className="admin-detail-section">
        <h4 className="admin-detail-title">
          <i className="fa-solid fa-comments" /> Recent Messages ({detail.messages.length})
        </h4>
        {detail.messages.length === 0 ? (
          <p className="admin-detail-empty">No messages</p>
        ) : (
          <div className="admin-detail-list">
            {detail.messages.slice(0, 5).map((msg) => (
              <div key={msg.id} className="admin-detail-item admin-detail-item--message">
                <p className="admin-detail-message-text">
                  {msg.content?.length > 100 ? msg.content.slice(0, 100) + '…' : msg.content}
                </p>
                <span className="admin-detail-item-meta">
                  {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTier(tier) {
  if (!tier) return '—'
  return tier.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
