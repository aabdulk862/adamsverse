import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { logError } from '../lib/logger'

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const SIGNED_OUT_KEY = 'adverse-signed-out'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const navigate = useNavigate()
  const inactivityTimerRef = useRef(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url, role')
        .eq('id', userId)
        .single()

      if (fetchErr) {
        // Table may not exist yet — don't crash
        if (fetchErr.code !== 'PGRST116' && fetchErr.message !== 'Not Found') {
          logError(fetchErr, { context: 'fetchProfile', userId })
        }
        return null
      }
      return data
    } catch {
      return null
    }
  }, [])

  const upsertProfile = useCallback(async (supabaseUser) => {
    try {
      const metadata = supabaseUser.user_metadata || {}
      const profileData = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        display_name: metadata.full_name || metadata.name || '',
        avatar_url: metadata.avatar_url || metadata.picture || '',
      }

      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })

      if (upsertErr) {
        // Table may not exist yet — don't crash
        logError(upsertErr, { context: 'upsertProfile', userId: supabaseUser.id })
      }
    } catch {
      // Silently fail if profiles table doesn't exist
    }
  }, [])

  // --- Inactivity timer logic ---
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    inactivityTimerRef.current = setTimeout(async () => {
      try {
        const { data, error: refreshErr } = await supabase.auth.getSession()
        if (refreshErr || !data.session) {
          logError(refreshErr || new Error('Session refresh returned no session'), {
            context: 'inactivityRefresh',
          })
          await supabase.auth.signOut()
          setSession(null)
          setUser(null)
          setProfile(null)
          setSessionExpired(true)
          navigate('/login')
        }
      } catch (err) {
        logError(err, { context: 'inactivityRefresh' })
        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
        setProfile(null)
        setSessionExpired(true)
        navigate('/login')
      }
    }, INACTIVITY_TIMEOUT_MS)
  }, [navigate])

  // Attach activity listeners when there is an active session
  useEffect(() => {
    if (!session) return

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart']
    const handleActivity = () => resetInactivityTimer()

    activityEvents.forEach((evt) => window.addEventListener(evt, handleActivity))
    resetInactivityTimer() // start the timer on mount / session change

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleActivity))
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [session, resetInactivityTimer])

  // --- Auth initialization and state change listener ---
  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        // If user explicitly signed out, don't restore session
        if (localStorage.getItem(SIGNED_OUT_KEY)) {
          localStorage.removeItem(SIGNED_OUT_KEY)
          if (mounted) setLoading(false)
          return
        }

        const { data: { session: currentSession }, error: initErr } = await supabase.auth.getSession()

        if (!mounted) return

        if (initErr) {
          logError(initErr, { context: 'authInit' })
          setError(initErr.message)
          setLoading(false)
          return
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        // Set loading false immediately — don't block on profile fetch
        setLoading(false)

        // Profile operations happen in background
        if (currentSession?.user) {
          upsertProfile(currentSession.user).catch(() => {})
          fetchProfile(currentSession.user.id).then((data) => {
            if (mounted) setProfile(data)
          }).catch(() => {})
        }
      } catch (err) {
        logError(err, { context: 'authInit' })
        if (mounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        // If user explicitly signed out, ignore any session restoration
        if (localStorage.getItem(SIGNED_OUT_KEY)) {
          setSession(null)
          setUser(null)
          setProfile(null)
          return
        }

        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          await upsertProfile(newSession.user)
          const profileData = await fetchProfile(newSession.user.id)
          if (mounted) setProfile(profileData)
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, upsertProfile])

  const signInWithGoogle = useCallback(async () => {
    setError(null)
    localStorage.removeItem(SIGNED_OUT_KEY)
    const { error: signInErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (signInErr) {
      logError(signInErr, { context: 'signInWithGoogle' })
      setError(signInErr.message)
    }
  }, [])

  const signUpWithEmail = useCallback(async (email, password, displayName) => {
    setError(null)
    localStorage.removeItem(SIGNED_OUT_KEY)
    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName || '' },
      },
    })
    if (signUpErr) {
      logError(signUpErr, { context: 'signUpWithEmail' })
      setError(signUpErr.message)
      return false
    }
    return true
  }, [])

  const signInWithEmail = useCallback(async (email, password) => {
    setError(null)
    localStorage.removeItem(SIGNED_OUT_KEY)
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (signInErr) {
      logError(signInErr, { context: 'signInWithEmail' })
      setError(signInErr.message)
      return false
    }
    return true
  }, [])

  const signOut = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    // Set flag — supabase.js will nuke session tokens on next page load
    localStorage.setItem(SIGNED_OUT_KEY, '1')
    // Redirect immediately — no async calls that could write tokens back
    window.location.replace('/')
  }, [])

  const isAdmin = profile?.role === 'admin'

  return {
    session,
    user,
    profile,
    loading,
    isAdmin,
    error,
    sessionExpired,
    clearError,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  }
}
