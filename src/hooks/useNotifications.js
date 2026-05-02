import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useNotifications() {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch unread messages where sender is not the current user
      const { count: messageCount, error: msgError } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("read", false)
        .neq("sender_id", user.id);

      if (msgError) {
        setError(msgError.message);
        setLoading(false);
        return;
      }

      // Fetch invoices with Sent or Overdue status (new invoice activity)
      const { count: invoiceCount, error: invError } = await supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .in("status", ["Sent", "Overdue"]);

      if (invError) {
        setError(invError.message);
        setLoading(false);
        return;
      }

      setUnreadMessages(messageCount || 0);
      setPendingInvoices(invoiceCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    unreadMessages,
    pendingInvoices,
    loading,
    error,
    fetchNotifications,
  };
}
