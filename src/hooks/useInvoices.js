import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useInvoices() {
  const [invoices, setInvoices] = useState([])
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('id, project_id, status, total_amount, tax_amount, due_date, paid_at, created_at')
        .order('due_date', { ascending: true })

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return []
      }

      setInvoices(data || [])
      setLoading(false)
      return data || []
    } catch {
      setLoading(false)
      return []
    }
  }, [])

  const fetchInvoice = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('invoices')
      .select('id, project_id, client_id, status, line_items, total_amount, tax_amount, due_date, paid_at, stripe_payment_intent_id, created_at')
      .eq('id', id)
      .single()

    if (fetchError) {
      setError(fetchError.message)
      setInvoice(null)
      setLoading(false)
      return null
    }

    setInvoice(data)
    setLoading(false)
    return data
  }, [])

  return {
    invoices,
    invoice,
    loading,
    error,
    fetchInvoices,
    fetchInvoice,
  }
}
