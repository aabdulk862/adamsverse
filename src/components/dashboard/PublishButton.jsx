import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./PublishButton.module.css";

/**
 * PublishButton — publish/update CTA with subscription gate modal.
 */
export default function PublishButton({ isPublished, onPublish }) {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // 'subscribe' | 'success' | 'error'
  const [publishedUrl, setPublishedUrl] = useState("");

  const handleClick = async () => {
    setLoading(true);
    const result = await onPublish();
    setLoading(false);

    if (result.success) {
      setPublishedUrl(result.url);
      setModal("success");
    } else if (result.reason === "no_subscription") {
      setModal("subscribe");
    } else {
      setModal("error");
    }
  };

  const copyUrl = () => {
    navigator.clipboard?.writeText(publishedUrl);
  };

  return (
    <>
      <button
        type="button"
        className={styles.btn}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Publishing…" : isPublished ? "Update Site" : "Publish"}
      </button>

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.card} onClick={(e) => e.stopPropagation()}>
            {modal === "success" && (
              <>
                <h3 className={styles.title}>
                  <i className="fa-solid fa-circle-check" /> Site Published!
                </h3>
                <p className={styles.url}>{publishedUrl}</p>
                <div className={styles.actions}>
                  <button type="button" className={styles.copyBtn} onClick={copyUrl}>
                    Copy URL
                  </button>
                  <button type="button" className={styles.closeBtn} onClick={() => setModal(null)}>
                    Done
                  </button>
                </div>
              </>
            )}
            {modal === "subscribe" && (
              <>
                <h3 className={styles.title}>Subscription Required</h3>
                <p>You need an active subscription to publish your site.</p>
                <div className={styles.actions}>
                  <Link to="/dashboard/billing" className={styles.copyBtn}>
                    View Plans
                  </Link>
                  <button type="button" className={styles.closeBtn} onClick={() => setModal(null)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
            {modal === "error" && (
              <>
                <h3 className={styles.title}>Publish Failed</h3>
                <p>Something went wrong. Please try again.</p>
                <button type="button" className={styles.closeBtn} onClick={() => setModal(null)}>
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
