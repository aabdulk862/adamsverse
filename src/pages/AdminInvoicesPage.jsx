import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useSupabaseClient } from "../hooks/useSupabaseClient";
import styles from "./Admin.module.css";


const INVOICE_STATUSES = ["Draft", "Sent", "Paid", "Overdue"];

export default function AdminInvoicesPage() {
  const { isLoaded, getToken } = useAuth();
  const supabase = useSupabaseClient();
  const authLoading = !isLoaded;
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    project_id: "",
    status: "Draft",
    due_date: "",
    tax_amount: 0,
    line_items: [{ description: "", amount: "" }],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [invoicesRes, projectsRes] = await Promise.all([
        supabase
          .from("invoices")
          .select(
            "id, project_id, client_id, status, line_items, total_amount, tax_amount, due_date, paid_at, created_at, profiles:client_id(display_name), projects:project_id(name)",
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("id, name, client_id, profiles:client_id(display_name)")
          .order("name", { ascending: true }),
      ]);

      if (invoicesRes.error) throw invoicesRes.error;
      if (projectsRes.error) throw projectsRes.error;

      setInvoices(invoicesRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const resetForm = () => {
    setFormData({
      project_id: "",
      status: "Draft",
      due_date: "",
      tax_amount: 0,
      line_items: [{ description: "", amount: "" }],
    });
    setEditingInvoice(null);
    setFormError(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      project_id: invoice.project_id || "",
      status: invoice.status || "Draft",
      due_date: invoice.due_date || "",
      tax_amount: Number(invoice.tax_amount || 0),
      line_items: invoice.line_items?.length
        ? invoice.line_items.map((li) => ({
            description: li.description || "",
            amount: String(li.amount || ""),
          }))
        : [{ description: "", amount: "" }],
    });
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      line_items: [...prev.line_items, { description: "", amount: "" }],
    }));
  };

  const removeLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  };

  const updateLineItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      line_items: prev.line_items.map((li, i) =>
        i === index ? { ...li, [field]: value } : li,
      ),
    }));
  };

  const calcTotal = () => {
    const subtotal = formData.line_items.reduce(
      (sum, li) => sum + (parseFloat(li.amount) || 0),
      0,
    );
    return subtotal + (parseFloat(formData.tax_amount) || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.project_id) {
      setFormError("Please select a project");
      return;
    }
    if (!formData.due_date) {
      setFormError("Please set a due date");
      return;
    }
    const validItems = formData.line_items.filter(
      (li) => li.description && li.amount,
    );
    if (validItems.length === 0) {
      setFormError("Add at least one line item with description and amount");
      return;
    }

    setSaving(true);

    try {
      const token = await getToken({ template: "supabase" });
      const selectedProject = projects.find(
        (p) => p.id === formData.project_id,
      );

      const payload = {
        action: editingInvoice ? "update_invoice" : "create_invoice",
        ...(editingInvoice && { invoice_id: editingInvoice.id }),
        project_id: formData.project_id,
        client_id: selectedProject?.client_id,
        status: formData.status,
        due_date: formData.due_date,
        tax_amount: parseFloat(formData.tax_amount) || 0,
        line_items: validItems.map((li) => ({
          description: li.description,
          amount: parseFloat(li.amount) || 0,
        })),
        total_amount: calcTotal(),
      };

      const res = await supabase.functions.invoke("admin-mutations", {
        body: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.error) throw res.error;

      closeForm();
      fetchData();
    } catch (err) {
      setFormError(err.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const handleSendInvoice = async (invoiceId) => {
    try {
      const token = await getToken({ template: "supabase" });
      const res = await supabase.functions.invoke("admin-mutations", {
        body: { action: "send_invoice", invoice_id: invoiceId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.error) throw res.error;
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId ? { ...inv, status: "Sent" } : inv,
        ),
      );
    } catch (err) {
      setError(`Failed to send invoice: ${err.message}`);
    }
  };

  if (authLoading || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className="auth-guard-spinner" />
          <span>Loading invoices…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>Invoices</h1>
        <div className={styles.error}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
          <button onClick={fetchData} className={styles.retryBtn}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Invoices</h1>
        <div className={styles.headerActions}>
          <Link to="/admin" className={styles.backLink}>
            <i className="fa-solid fa-arrow-left" /> Dashboard
          </Link>
          <button onClick={openCreateForm} className={styles.primaryBtn}>
            <i className="fa-solid fa-plus" /> New Invoice
          </button>
        </div>
      </div>

      {/* Invoice form modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={closeForm}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingInvoice ? "Edit Invoice" : "Create Invoice"}</h2>
              <button
                onClick={closeForm}
                className={styles.modalClose}
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.invoiceForm}>
              {formError && (
                <div className={styles.formError}>
                  <i className="fa-solid fa-circle-exclamation" /> {formError}
                </div>
              )}

              <label className={styles.formLabel}>
                Project
                <select
                  className={styles.formSelect}
                  value={formData.project_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Select a project…</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.profiles?.display_name || "Unknown client"}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Status
                  <select
                    className={styles.formSelect}
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    {INVOICE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.formLabel}>
                  Due Date
                  <input
                    type="date"
                    className={styles.formInput}
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        due_date: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              {/* Line items */}
              <div className={styles.lineItems}>
                <div className={styles.lineItemsHeader}>
                  <h3>Line Items</h3>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className={styles.addLineBtn}
                  >
                    <i className="fa-solid fa-plus" /> Add Item
                  </button>
                </div>
                {formData.line_items.map((li, i) => (
                  <div key={i} className={styles.lineItemRow}>
                    <input
                      type="text"
                      className={`${styles.formInput} ${styles.lineDesc}`}
                      placeholder="Description"
                      value={li.description}
                      onChange={(e) =>
                        updateLineItem(i, "description", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      className={`${styles.formInput} ${styles.lineAmount}`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={li.amount}
                      onChange={(e) =>
                        updateLineItem(i, "amount", e.target.value)
                      }
                    />
                    {formData.line_items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(i)}
                        className={styles.removeLineBtn}
                        aria-label="Remove line item"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <label className={styles.formLabel}>
                Tax Amount (USD)
                <input
                  type="number"
                  className={styles.formInput}
                  step="0.01"
                  min="0"
                  value={formData.tax_amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tax_amount: e.target.value,
                    }))
                  }
                />
              </label>

              <div className={styles.invoiceTotal}>
                <span>Total:</span>
                <span className={styles.invoiceTotalValue}>
                  $
                  {calcTotal().toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={closeForm}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editingInvoice
                      ? "Update Invoice"
                      : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <div className={styles.empty}>
          No invoices yet.
          <button onClick={openCreateForm} className={styles.emptyAction}>
            Create your first invoice
          </button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.profiles?.display_name || "—"}</td>
                  <td className={styles.tableName}>
                    {inv.projects?.name || "—"}
                  </td>
                  <td className={styles.tableAmount}>
                    $
                    {Number(inv.total_amount || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[`status${inv.status?.replace(/\s+/g, "")}`] || ""}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className={styles.tableDate}>
                    {inv.due_date
                      ? new Date(inv.due_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className={styles.tableActions}>
                    <button
                      onClick={() => openEditForm(inv)}
                      className={styles.actionBtn}
                      title="Edit"
                      aria-label="Edit invoice"
                    >
                      <i className="fa-solid fa-pen" />
                    </button>
                    {inv.status === "Draft" && (
                      <button
                        onClick={() => handleSendInvoice(inv.id)}
                        className={`${styles.actionBtn} ${styles.actionBtnSend}`}
                        title="Send to client"
                        aria-label="Send invoice"
                      >
                        <i className="fa-solid fa-paper-plane" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
