import { useState, useEffect, useRef } from "react";
import { useMessages } from "../hooks/useMessages";
import { useAuth } from "../hooks/useAuth";
import styles from "./MessageThread.module.css";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

function formatTimestamp(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isToday) return time;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString())
    return `Yesterday ${time}`;

  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}

export default function MessageThread({ projectId }) {
  const { messages, loading, error, fetchMessages, sendMessage } =
    useMessages(projectId);
  const { user, profile } = useAuth();
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [fileError, setFileError] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (projectId) fetchMessages();
  }, [projectId, fetchMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setFileError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError("File size exceeds the 25 MB limit");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(selected);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    setSending(true);
    const result = await sendMessage(
      projectId,
      content.trim(),
      file || undefined,
    );
    setSending(false);

    if (result) {
      // Success — clear inputs
      setContent("");
      setFile(null);
      setFileError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    // On failure, content is retained (not cleared)
  };

  const currentUserId = user?.id;

  return (
    <div className={styles.thread}>
      {/* Messages area */}
      <div className={styles.messages}>
        {loading && messages.length === 0 && (
          <div className={styles.loading}>
            <i className="fa-solid fa-spinner fa-spin" />
            <span>Loading messages…</span>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className={styles.empty}>
            <i className={`fa-regular fa-comments ${styles.emptyIcon}`} />
            <p>No messages yet. Start the conversation.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`${styles.bubbleWrap} ${isOwn ? styles.bubbleWrapOwn : ""}`}
            >
              {!isOwn && (
                <div className={styles.avatar}>
                  {msg.sender_avatar_url ? (
                    <img
                      src={msg.sender_avatar_url}
                      alt=""
                      className={styles.avatarImg}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>
                      {(msg.sender_name || msg.sender_id || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
              )}
              <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : ""}`}>
                {!isOwn && (
                  <span className={styles.senderName}>
                    {msg.sender_name || "Unknown"}
                  </span>
                )}
                {msg.content && <p className={styles.msgContent}>{msg.content}</p>}
                {msg.file_url && (
                  <a
                    href={msg.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.attachment}
                  >
                    <i className="fa-solid fa-paperclip" />
                    <span className={styles.attachmentText}>{msg.file_name || "Attachment"}</span>
                    <i className={`fa-solid fa-arrow-up-right-from-square ${styles.attachmentIcon}`} />
                  </a>
                )}
                <span className={styles.timestamp}>
                  {formatTimestamp(msg.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className={styles.error}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {/* File error */}
      {fileError && (
        <div className={styles.error}>
          <i className="fa-solid fa-circle-exclamation" />
          <span>{fileError}</span>
        </div>
      )}

      {/* Input area */}
      <form className={styles.inputBar} onSubmit={handleSend}>
        {file && (
          <div className={styles.filePreview}>
            <i className={`fa-solid fa-file ${styles.filePreviewIcon}`} />
            <span className={styles.filePreviewName}>{file.name}</span>
            <button
              type="button"
              className={styles.filePreviewRemove}
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              aria-label="Remove file"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        )}
        <div className={styles.inputRow}>
          <button
            type="button"
            className={styles.attachBtn}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach file"
          >
            <i className="fa-solid fa-paperclip" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className={styles.fileInput}
            onChange={handleFileChange}
            tabIndex={-1}
          />
          <input
            type="text"
            className={styles.textInput}
            placeholder="Type a message…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={sending || (!content.trim() && !file)}
            aria-label="Send message"
          >
            {sending ? (
              <i className="fa-solid fa-spinner fa-spin" />
            ) : (
              <i className="fa-solid fa-paper-plane" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
