import { useEffect, useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { supabase } from "../lib/supabase";
import { useInvoices } from "../hooks/useInvoices";
import InvoiceCard from "../components/InvoiceCard";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      fontFamily: '"Inter", sans-serif',
      color: "#1a1a2e",
      "::placeholder": { color: "#6b7280" },
    },
    invalid: { color: "#ef4444" },
  },
};

function PaymentForm({ invoice, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Call Supabase Edge Function to create PaymentIntent
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-payment-intent",
        { body: { invoice_id: invoice.id } },
      );

      if (fnError || !data?.client_secret) {
        setError(
          fnError?.message || "Failed to create payment. Please try again.",
        );
        setProcessing(false);
        return;
      }

      // Confirm payment with Stripe.js
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(data.client_secret, {
          payment_method: { card: elements.getElement(CardElement) },
        });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount ?? 0);

  return (
    <div
      className="billing-payment-modal"
      role="dialog"
      aria-label="Payment form"
    >
      <div className="billing-payment-modal-content">
        <div className="billing-payment-header">
          <h3>Pay Invoice #{invoice.id?.slice(0, 8)}</h3>
          <button
            className="billing-payment-close"
            onClick={onCancel}
            type="button"
            aria-label="Close payment form"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="billing-payment-amount">
          {formatCurrency(invoice.total_amount)}
        </div>

        <form onSubmit={handleSubmit} className="billing-payment-form">
          <div className="billing-card-element-wrapper">
            <label htmlFor="card-element" className="billing-card-label">
              Card details
            </label>
            <div className="billing-card-element">
              <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          {error && (
            <div className="billing-payment-error" role="alert">
              <i className="fa-solid fa-circle-exclamation" />
              <span>{error}</span>
            </div>
          )}

          <div className="billing-payment-actions">
            <button
              type="button"
              className="billing-payment-cancel-btn"
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="billing-payment-submit-btn"
              disabled={!stripe || processing}
            >
              {processing ? (
                <>
                  <span className="billing-spinner" aria-hidden="true" />
                  Processing…
                </>
              ) : (
                `Pay ${formatCurrency(invoice.total_amount)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { invoices, loading, error, fetchInvoices } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handlePayClick = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setSuccessMessage(null);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    setSelectedInvoice(null);
    setSuccessMessage("Payment successful! Your invoice has been updated.");
    fetchInvoices();
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(null), 5000);
  }, [fetchInvoices]);

  const handlePaymentCancel = useCallback(() => {
    setSelectedInvoice(null);
  }, []);

  return (
    <div className="billing-page">
      <h1 className="billing-page-title">Billing</h1>
      <p className="billing-page-subtitle">View and pay your invoices.</p>

      {successMessage && (
        <div className="billing-success-message" role="status">
          <i className="fa-solid fa-circle-check" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="billing-loading">
          <div className="auth-guard-spinner" />
          <span>Loading invoices…</span>
        </div>
      ) : error ? (
        <div className="billing-error" role="alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>Failed to load invoices: {error}</span>
        </div>
      ) : invoices.length === 0 ? (
        <div className="billing-empty">
          <div className="billing-empty-icon">
            <i className="fa-solid fa-file-invoice-dollar" />
          </div>
          <h3>No invoices yet</h3>
          <p>
            Invoices will appear here once they're created for your projects.
          </p>
        </div>
      ) : (
        <div className="billing-invoices-list">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onPayClick={handlePayClick}
            />
          ))}
        </div>
      )}

      {selectedInvoice && (
        <Elements stripe={stripePromise}>
          <PaymentForm
            invoice={selectedInvoice}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </Elements>
      )}
    </div>
  );
}
