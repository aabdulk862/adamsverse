import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, avatar_url, role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error.message)
      return null
    }
    return data
  }, [])

  const upsertProfile = useCallback(async (supabaseUser) => {
    const metadata = supabaseUser.user_metadata || {}
    const profileData = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      display_name: metadata.full_name || metadata.name || '',
      avatar_url: metadata.avatar_url || metadata.picture || '',
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })

    if (error) {
      console.error('Error upserting profile:', error.message)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()

        if (!mounted) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          await upsertProfile(currentSession.user)
          const profileData = await fetchProfile(currentSession.user.id)
          if (mounted) setProfile(profileData)
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) {
      console.error('Google sign-in error:', error.message)
    }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign-out error:', error.message)
    }
    navigate('/')
  }, [navigate])

  const isAdmin = profile?.role === 'admin'

  return {
    session,
    user,
    profile,
    loading,
    isAdmin,
    signInWithGoogle,
    signOut,
  }
}
