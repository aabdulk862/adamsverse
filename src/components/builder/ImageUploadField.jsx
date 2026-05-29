import { useState, useRef, useCallback } from "react";
import { uploadFile } from "../../lib/uploadService.js";
import styles from "./ImageUploadField.module.css";

/**
 * Path prefix for builder preview uploads in Supabase Storage.
 */
const UPLOAD_PATH_PREFIX = "builder-preview/";

/**
 * ImageUploadField — Provides file upload + manual URL entry for image fields.
 *
 * Delegates to Upload_Service with `builder-preview/` path prefix.
 * Shows loading indicator during upload, disables duplicate submissions.
 * Displays inline error messages on failure (size, MIME, network).
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 *
 * @param {Object} props
 * @param {string} props.id - Unique field ID for accessibility
 * @param {string} props.value - Current URL value
 * @param {(url: string) => void} props.onChange - Called with new URL on manual entry or successful upload
 * @param {boolean} [props.disabled=false] - Disables all inputs
 * @param {string} [props.placeholder="https://..."] - Placeholder for URL input
 * @param {string} [props.label] - Accessible label for the upload button
 * @param {string} [props.error] - External validation error (from parent)
 * @param {string} [props.errorId] - ID for aria-describedby on error
 */
export default function ImageUploadField({
  id,
  value,
  onChange,
  disabled = false,
  placeholder = "https://...",
  label = "Upload image",
  error: externalError,
  errorId,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file || uploading) return;

      setUploadError(null);
      setUploading(true);

      try {
        const result = await uploadFile(file, UPLOAD_PATH_PREFIX);

        if (result.success) {
          onChange(result.url);
        } else {
          setUploadError(result.error);
        }
      } catch (err) {
        setUploadError(
          `Upload failed due to network error: ${err.message || "Unknown error"}`
        );
      } finally {
        setUploading(false);
        // Reset file input so the same file can be re-selected
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onChange, uploading]
  );

  const handleUploadClick = useCallback(() => {
    if (!uploading && !disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [uploading, disabled]);

  const displayError = uploadError || externalError;
  const displayErrorId = uploadError ? `${id}-upload-error` : errorId;

  return (
    <div className={styles.imageUploadField}>
      {/* Manual URL input */}
      <input
        id={id}
        type="text"
        className={`${styles.urlInput} ${displayError ? styles.urlInputError : ""}`}
        value={value ?? ""}
        onChange={(e) => {
          setUploadError(null);
          onChange(e.target.value);
        }}
        disabled={disabled || uploading}
        placeholder={placeholder}
        aria-describedby={displayError ? displayErrorId : undefined}
        aria-invalid={displayError ? "true" : undefined}
      />

      {/* Upload button + hidden file input */}
      <div className={styles.uploadControls}>
        <button
          type="button"
          className={styles.uploadButton}
          onClick={handleUploadClick}
          disabled={disabled || uploading}
          aria-label={label}
          title={uploading ? "Upload in progress..." : label}
        >
          {uploading ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <span className={styles.uploadIcon} aria-hidden="true">
              📁
            </span>
          )}
          <span className={styles.uploadText}>
            {uploading ? "Uploading…" : "Upload"}
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className={styles.hiddenFileInput}
          onChange={handleFileChange}
          disabled={disabled || uploading}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* Image preview thumbnail */}
      {value && !displayError && (
        <div className={styles.preview}>
          <img
            src={value}
            alt="Preview"
            className={styles.previewImage}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Upload error message */}
      {uploadError && (
        <p
          id={`${id}-upload-error`}
          className={styles.errorMessage}
          aria-live="polite"
          role="alert"
        >
          {uploadError}
        </p>
      )}
    </div>
  );
}
