import { useEffect, useCallback, useRef, useSyncExternalStore } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { logError } from '../lib/logger'

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000
const SIGNED_OUT_KEY = 'adverse-signed-out'

// ── Singleton auth store (shared across all useAuth instances) ──
let authState = {
  session: null,
  user: null,
  profile: null,
  loading: true,
  error: null,
  sessionExpired: false,
}
const listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn())
}

function setAuthState(partial) {
  authState = { ...authState, ...partial }
  notify()
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function getSnapshot() {
  return authState
}

// ── Profile helpers ──
async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, avatar_url, role')
      .eq('id', userId)
      .single()
    if (error) return null
    return data
  } catch {
    return null
  }
}

async function upsertProfile(supabaseUser) {
  try {
    const meta = supabaseUser.user_metadata || {}
    await supabase.from('profiles').upsert({
      id: supabaseUser.id,
      email: supabaseUser.email,
      display_name: meta.full_name || meta.name || '',
      avatar_url: meta.avatar_url || meta.picture || '',
    }, { onConflict: 'id' })
  } catch { /* table may not exist */ }
}

// ── One-time initialization (runs once at module load) ──
let initialized = false

function initOnce() {
  if (initialized) return
  initialized = true

  // If user explicitly signed out, bail
  if (localStorage.getItem(SIGNED_OUT_KEY)) {
    localStorage.removeItem(SIGNED_OUT_KEY)
    setAuthState({ loading: false })
    return
  }

  // Get current session (single call, no lock contention)
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      logError(error, { context: 'authInit' })
      setAuthState({ loading: false, error: error.message })
      return
    }
    setAuthState({
      session,
      user: session?.user ?? null,
      loading: false,
    })
    // Background profile ops
    if (session?.user) {
      upsertProfile(session.user)
      fetchProfile(session.user.id).then((p) => {
        if (p) setAuthState({ profile: p })
      })
    }
  }).catch((err) => {
    logError(err, { context: 'authInit' })
    setAuthState({ loading: false, error: err.message })
  })

  // Listen for auth state changes (single listener)
  supabase.auth.onAuthStateChange(async (event, newSession) => {
    if (localStorage.getItem(SIGNED_OUT_KEY)) {
      setAuthState({ session: null, user: null, profile: null })
      return
    }
    setAuthState({
      session: newSession,
      user: newSession?.user ?? null,
    })
    if (newSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
      upsertProfile(newSession.user)
      const p = await fetchProfile(newSession.user.id)
      if (p) setAuthState({ profile: p })
    }
    if (event === 'SIGNED_OUT') {
      setAuthState({ profile: null })
    }
  })
}

// ── Hook ──
export function useAuth() {
  // Trigger init on first hook mount
  useEffect(() => { initOnce() }, [])

  const state = useSyncExternalStore(subscribe, getSnapshot)
  const navigate = useNavigate()
  const inactivityTimerRef = useRef(null)

  const clearError = useCallback(() => {
    setAuthState({ error: null })
  }, [])

  // Inactivity timer
  useEffect(() => {
    if (!state.session) return
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    const reset = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = setTimeout(async () => {
        try {
          const { data, error } = await supabase.auth.getSession()
          if (error || !data.session) {
            await supabase.auth.signOut()
            setAuthState({ session: null, user: null, profile: null, sessionExpired: true })
            navigate('/login')
          }
        } catch {
          setAuthState({ session: null, user: null, profile: null, sessionExpired: true })
          navigate('/login')
        }
      }, INACTIVITY_TIMEOUT_MS)
    }
    events.forEach((e) => window.addEventListener(e, reset))
    reset()
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset))
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    }
  }, [state.session, navigate])

  const signInWithGoogle = useCallback(async () => {
    setAuthState({ error: null })
    localStorage.removeItem(SIGNED_OUT_KEY)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) {
      logError(error, { context: 'signInWithGoogle' })
      setAuthState({ error: error.message })
    }
  }, [])

  const signUpWithEmail = useCallback(async (email, password, displayName) => {
    setAuthState({ error: null })
    localStorage.removeItem(SIGNED_OUT_KEY)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: displayName || '' } },
    })
    if (error) {
      logError(error, { context: 'signUpWithEmail' })
      setAuthState({ error: error.message })
      return false
    }
    return true
  }, [])

  const signInWithEmail = useCallback(async (email, password) => {
    setAuthState({ error: null })
    localStorage.removeItem(SIGNED_OUT_KEY)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      logError(error, { context: 'signInWithEmail' })
      setAuthState({ error: error.message })
      return false
    }
    return true
  }, [])

  const signOut = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    localStorage.setItem(SIGNED_OUT_KEY, '1')
    window.location.replace('/')
  }, [])

  return {
    session: state.session,
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    isAdmin: state.profile?.role === 'admin',
    error: state.error,
    sessionExpired: state.sessionExpired,
    clearError,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  }
}
