import React from 'react';

const STATUS_CONFIG = {
  Draft: { className: 'invoice-status--draft', label: 'Draft' },
  Sent: { className: 'invoice-status--sent', label: 'Sent' },
  Paid: { className: 'invoice-status--paid', label: 'Paid' },
  Overdue: { className: 'invoice-status--overdue', label: 'Overdue' },
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount ?? 0);
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
  const showPayButton = status === 'Sent' || status === 'Overdue';
  const subtotal = (total_amount ?? 0) - (tax_amount ?? 0);

  return (
    <div className="invoice-card" role="article" aria-label={`Invoice ${id ? id.slice(0, 8) : ''}`}>
      <div className="invoice-card-header">
        <div className="invoice-card-title-row">
          <span className="invoice-card-id">Invoice #{id ? id.slice(0, 8) : '—'}</span>
          <span className={`invoice-status ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
        </div>
        <div className="invoice-card-dates">
          {due_date && (
            <span className="invoice-card-date">
              Due: {formatDate(due_date)}
            </span>
          )}
          {paid_at && (
            <span className="invoice-card-date invoice-card-date--paid">
              Paid: {formatDate(paid_at)}
            </span>
          )}
        </div>
      </div>

      {line_items.length > 0 && (
        <div className="invoice-card-items">
          <table className="invoice-card-table" aria-label="Line items">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {line_items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description || '—'}</td>
                  <td className="invoice-card-amount">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="invoice-card-summary">
        {tax_amount > 0 && (
          <>
            <div className="invoice-card-summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="invoice-card-summary-row">
              <span>Tax</span>
              <span>{formatCurrency(tax_amount)}</span>
            </div>
          </>
        )}
        <div className="invoice-card-summary-row invoice-card-total">
          <span>Total</span>
          <span>{formatCurrency(total_amount)}</span>
        </div>
      </div>

      {showPayButton && (
        <div className="invoice-card-actions">
          <button
            className="invoice-card-pay-btn"
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
