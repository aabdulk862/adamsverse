import React from "react";
import styles from "./InvoiceCard.module.css";

const STATUS_CONFIG = {
  Draft: { className: styles.statusDraft, label: "Draft" },
  Sent: { className: styles.statusSent, label: "Sent" },
  Paid: { className: styles.statusPaid, label: "Paid" },
  Overdue: { className: styles.statusOverdue, label: "Overdue" },
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount ?? 0);
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InvoiceCard({ invoice, onPayClick }) {
  if (!invoice) return null;

  const {
    id,
    status,
    line_items = [],
    total_amount,
    tax_amount,
    due_date,
    paid_at,
    created_at,
  } = invoice;

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Draft;
  const showPayButton = status === "Sent" || status === "Overdue";
  const subtotal = (total_amount ?? 0) - (tax_amount ?? 0);

  return (
    <div
      className={styles.card}
      role="article"
      aria-label={`Invoice ${id ? id.slice(0, 8) : ""}`}
    >
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.id}>
            Invoice #{id ? id.slice(0, 8) : "—"}
          </span>
          <span className={`${styles.status} ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
        </div>
        <div className={styles.dates}>
          {due_date && (
            <span className={styles.date}>
              Due: {formatDate(due_date)}
            </span>
          )}
          {paid_at && (
            <span className={`${styles.date} ${styles.datePaid}`}>
              Paid: {formatDate(paid_at)}
            </span>
          )}
        </div>
      </div>

      {line_items.length > 0 && (
        <div className={styles.items}>
          <table className={styles.table} aria-label="Line items">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {line_items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description || "—"}</td>
                  <td className={styles.amount}>
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.summary}>
        {tax_amount > 0 && (
          <>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Tax</span>
              <span>{formatCurrency(tax_amount)}</span>
            </div>
          </>
        )}
        <div className={`${styles.summaryRow} ${styles.total}`}>
          <span>Total</span>
          <span>{formatCurrency(total_amount)}</span>
        </div>
      </div>

      {showPayButton && (
        <div className={styles.actions}>
          <button
            className={styles.payBtn}
            onClick={() => onPayClick?.(invoice)}
            type="button"
          >
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
}
