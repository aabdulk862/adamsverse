import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

export function useMessages(projectId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const channelRef = useRef(null)

  const fetchMessages = useCallback(async (pid) => {
    const id = pid || projectId
    if (!id) return []

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('messages')
      .select('id, project_id, sender_id, content, file_url, file_name, read, created_at')
      .eq('project_id', id)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return []
    }

    setMessages(data)
    setLoading(false)
    return data
  }, [projectId])

  const sendMessage = useCallback(async (pid, content, file) => {
    const id = pid || projectId
    if (!id) {
      setError('No project ID provided')
      return null
    }

    setError(null)

    let fileUrl = null
    let fileName = null

    // Handle file upload if provided
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds the 25 MB limit')
        return null
      }

      const filePath = `${id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file)

      if (uploadError) {
        setError(uploadError.message)
        // Content is retained by the caller — we return null without clearing input
        return null
      }

      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath)

      fileUrl = urlData?.publicUrl || filePath
      fileName = file.name
    }

    const messageData = {
      project_id: id,
      content,
      file_url: fileUrl,
      file_name: fileName,
    }

    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert(messageData)
      .select('id, project_id, sender_id, content, file_url, file_name, read, created_at')
      .single()

    if (insertError) {
      setError(insertError.message)
      // Content is retained by the caller — we return null without clearing input
      return null
    }

    // Append optimistically (real-time will also fire, deduped below)
    setMessages((prev) => {
      const exists = prev.some((m) => m.id === newMessage.id)
      return exists ? prev : [...prev, newMessage]
    })

    return newMessage
  }, [projectId])

  // Real-time subscription
  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel(`messages:project_id=eq.${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const newMsg = payload.new
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMsg.id)
            return exists ? prev : [...prev, newMsg]
          })
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [projectId])

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
  }
}
