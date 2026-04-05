import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const [preferences, setPreferences] = useState({
    project_updates: true,
    invoice_updates: true,
    message_updates: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  const fetchPreferences = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('project_updates, invoice_updates, message_updates')
      .eq('client_id', user.id)
      .maybeSingle()

    if (data && !error) {
      setPreferences({
        project_updates: data.project_updates ?? true,
        invoice_updates: data.invoice_updates ?? true,
        message_updates: data.message_updates ?? true,
      })
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  // Check for unsubscribe query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('unsubscribe') === 'true') {
      setPreferences({
        project_updates: false,
        invoice_updates: false,
        message_updates: false,
      })
      // Auto-save unsubscribe
      if (user) {
        savePreferences({
          project_updates: false,
          invoice_updates: false,
          message_updates: false,
        })
      }
    }
  }, [user])

  async function savePreferences(prefsToSave) {
    if (!user) return
    setSaving(true)
    setSaveStatus(null)

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(
        { client_id: user.id, ...prefsToSave },
        { onConflict: 'client_id' }
      )

    if (error) {
      setSaveStatus('error')
    } else {
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 3000)
    }
    setSaving(false)
  }

  function handleToggle(key) {
    const updated = { ...preferences, [key]: !preferences[key] }
    setPreferences(updated)
    savePreferences(updated)
  }

  const displayName = profile?.display_name || ''
  const email = profile?.email || user?.email || ''
  const avatarUrl = profile?.avatar_url || ''
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : email.charAt(0).toUpperCase()

  const toggles = [
    { key: 'project_updates', label: 'Project Updates', desc: 'Get notified when your project status changes' },
    { key: 'invoice_updates', label: 'Invoice Updates', desc: 'Get notified when a new invoice is created' },
    { key: 'message_updates', label: 'Message Updates', desc: 'Get notified when you receive a new message' },
  ]

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      {/* Profile section */}
      <section className="settings-section">
        <h2 className="settings-section-title">Profile</h2>
        <div className="settings-profile-card">
          <div className="settings-avatar-wrap">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="settings-avatar" />
            ) : (
              <div className="settings-avatar-fallback">{initials}</div>
            )}
          </div>
          <div className="settings-profile-info">
            <span className="settings-profile-name">{displayName || 'No name set'}</span>
            <span className="settings-profile-email">{email}</span>
            <span className="settings-profile-source">
              <i className="fa-brands fa-google" /> Signed in with Google
            </span>
          </div>
        </div>
      </section>

      {/* Notification preferences */}
      <section className="settings-section">
        <h2 className="settings-section-title">Email Notifications</h2>
        <p className="settings-section-desc">
          Choose which email notifications you'd like to receive.
        </p>

        {loading ? (
          <div className="settings-loading">
            <div className="auth-guard-spinner" />
            <span>Loading preferences…</span>
          </div>
        ) : (
          <div className="settings-toggles">
            {toggles.map((t) => (
              <label key={t.key} className="settings-toggle-row">
                <div className="settings-toggle-text">
                  <span className="settings-toggle-label">{t.label}</span>
                  <span className="settings-toggle-desc">{t.desc}</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences[t.key]}
                  className={`settings-toggle-switch${preferences[t.key] ? ' settings-toggle-switch--on' : ''}`}
                  onClick={() => handleToggle(t.key)}
                  disabled={saving}
                >
                  <span className="settings-toggle-knob" />
                </button>
              </label>
            ))}
          </div>
        )}

        {saveStatus === 'success' && (
          <div className="settings-save-status settings-save-status--success">
            <i className="fa-solid fa-check" /> Preferences saved
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="settings-save-status settings-save-status--error">
            <i className="fa-solid fa-exclamation-triangle" /> Failed to save. Please try again.
          </div>
        )}
      </section>
    </div>
  )
}
