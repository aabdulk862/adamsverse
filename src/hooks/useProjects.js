import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('id, name, status, service_tier, updated_at')
        .order('updated_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return []
      }

      setProjects(data || [])
      setLoading(false)
      return data || []
    } catch {
      setLoading(false)
      return []
    }
  }, [])

  const fetchProject = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('projects')
      .select(`
        id, client_id, name, status, service_tier, intake_data, created_at, updated_at,
        project_status_history ( id, status, description, changed_by, created_at ),
        project_feedback ( id, client_id, content, created_at ),
        messages ( id, sender_id, content, file_url, file_name, read, created_at )
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      setError(fetchError.message)
      setProject(null)
      setLoading(false)
      return null
    }

    setProject(data)
    setLoading(false)
    return data
  }, [])

  const createProject = useCallback(async (data) => {
    setLoading(true)
    setError(null)

    const { data: newProject, error: insertError } = await supabase
      .from('projects')
      .insert({
        name: data.name,
        service_tier: data.service_tier,
        intake_data: data.intake_data || {},
        status: 'Discovery',
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return null
    }

    setProjects((prev) => [newProject, ...prev])
    setLoading(false)
    return newProject
  }, [])

  const submitFeedback = useCallback(async (projectId, content) => {
    setLoading(true)
    setError(null)

    const { data: feedback, error: feedbackError } = await supabase
      .from('project_feedback')
      .insert({ project_id: projectId, content })
      .select()
      .single()

    if (feedbackError) {
      setError(feedbackError.message)
      setLoading(false)
      return null
    }

    setLoading(false)
    return feedback
  }, [])

  return {
    projects,
    project,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    submitFeedback,
  }
}
