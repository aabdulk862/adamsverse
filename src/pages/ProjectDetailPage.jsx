import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useProjects } from "../hooks/useProjects";
import { supabase } from "../lib/supabase";
import ProjectTimeline from "../components/ProjectTimeline";
import MessageThread from "../components/MessageThread";
import FileUpload from "../components/FileUpload";

const TIER_LABELS = {
  "landing-page": "Landing Page",
  "full-stack-application": "Full-Stack Application",
  consulting: "Consulting",
};

const TABS = [
  { key: "overview", label: "Overview", icon: "fa-solid fa-circle-info" },
  { key: "messages", label: "Messages", icon: "fa-solid fa-comments" },
  { key: "files", label: "Files", icon: "fa-solid fa-folder-open" },
  { key: "feedback", label: "Feedback", icon: "fa-solid fa-message" },
];

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { project, loading, error, fetchProject, submitFeedback } =
    useProjects();
  const [activeTab, setActiveTab] = useState("overview");
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState(null);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  useEffect(() => {
    if (id) fetchProject(id);
  }, [id, fetchProject]);

  const fetchFiles = useCallback(async () => {
    if (!id) return;
    setFilesLoading(true);
    setFilesError(null);

    const { data, error: listError } = await supabase.storage
      .from("project-files")
      .list(id, { sortBy: { column: "created_at", order: "desc" } });

    if (listError) {
      setFilesError(listError.message);
      setFilesLoading(false);
      return;
    }

    setFiles(data || []);
    setFilesLoading(false);
  }, [id]);

  useEffect(() => {
    if (activeTab === "files") fetchFiles();
  }, [activeTab, fetchFiles]);

  const handleDownload = async (fileName) => {
    const filePath = `${id}/${fileName}`;
    const { data, error: urlError } = await supabase.storage
      .from("project-files")
      .createSignedUrl(filePath, 900); // 15-min expiry

    if (urlError) {
      alert("Failed to generate download link. Please try again.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const handleUploadComplete = () => {
    fetchFiles();
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;

    setFeedbackSubmitting(true);
    setFeedbackError(null);
    setFeedbackSuccess(false);

    const result = await submitFeedback(id, feedbackContent.trim());

    setFeedbackSubmitting(false);

    if (result) {
      setFeedbackContent("");
      setFeedbackSuccess(true);
      fetchProject(id); // refresh feedback list
      setTimeout(() => setFeedbackSuccess(false), 4000);
    } else {
      setFeedbackError("Failed to submit feedback. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-loading">
          <div className="auth-guard-spinner" />
          <span>Loading project…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>Failed to load project. Please try again.</span>
        </div>
        <Link to="/dashboard/projects" className="project-detail-back">
          <i className="fa-solid fa-arrow-left" /> Back to projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>Project not found.</span>
        </div>
        <Link to="/dashboard/projects" className="project-detail-back">
          <i className="fa-solid fa-arrow-left" /> Back to projects
        </Link>
      </div>
    );
  }

  const statusClass = project.status?.toLowerCase().replace(/\s+/g, "-");
  const isReview = project.status === "Review";
  const history = project.project_status_history || [];
  const feedbackList = project.project_feedback || [];
  const intakeData = project.intake_data || {};

  return (
    <div className="project-detail-page">
      <Link to="/dashboard/projects" className="project-detail-back">
        <i className="fa-solid fa-arrow-left" /> Back to projects
      </Link>

      {/* Header */}
      <div className="project-detail-header">
        <div className="project-detail-header-info">
          <h1 className="project-detail-name">{project.name}</h1>
          <div className="project-detail-meta">
            <span
              className={`dashboard-project-status dashboard-project-status--${statusClass}`}
            >
              {project.status}
            </span>
            <span className="project-detail-tier">
              {TIER_LABELS[project.service_tier] || project.service_tier}
            </span>
          </div>
        </div>
        <div className="project-detail-dates">
          <span className="project-detail-date-item">
            Created {formatDate(project.created_at)}
          </span>
          <span className="project-detail-date-item">
            Updated {formatDate(project.updated_at)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="project-detail-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`project-detail-tab${activeTab === tab.key ? " project-detail-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <i className={tab.icon} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="project-detail-content" role="tabpanel">
        {activeTab === "overview" && (
          <div className="project-detail-overview">
            {/* Intake data */}
            {Object.keys(intakeData).length > 0 && (
              <div className="project-detail-section">
                <h3 className="project-detail-section-title">
                  Project Details
                </h3>
                <div className="project-detail-intake">
                  {Object.entries(intakeData).map(([key, value]) => (
                    <div className="project-detail-intake-row" key={key}>
                      <span className="project-detail-intake-label">
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <span className="project-detail-intake-value">
                        {Array.isArray(value)
                          ? value.join(", ")
                          : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="project-detail-section">
              <h3 className="project-detail-section-title">Status History</h3>
              <ProjectTimeline history={history} />
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="project-detail-messages">
            <MessageThread projectId={id} />
          </div>
        )}

        {activeTab === "files" && (
          <div className="project-detail-files">
            <div className="project-detail-section">
              <h3 className="project-detail-section-title">Upload Files</h3>
              <FileUpload
                projectId={id}
                onUploadComplete={handleUploadComplete}
              />
            </div>

            <div className="project-detail-section">
              <h3 className="project-detail-section-title">Project Files</h3>
              {filesLoading ? (
                <div className="project-detail-loading">
                  <div className="auth-guard-spinner" />
                  <span>Loading files…</span>
                </div>
              ) : filesError ? (
                <div className="project-detail-error">
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{filesError}</span>
                </div>
              ) : files.length === 0 ? (
                <div className="project-detail-files-empty">
                  <i className="fa-regular fa-folder-open" />
                  <p>No files uploaded yet</p>
                </div>
              ) : (
                <div className="project-detail-file-list">
                  <div className="project-detail-file-header">
                    <span className="project-detail-file-col project-detail-file-col--name">
                      Name
                    </span>
                    <span className="project-detail-file-col project-detail-file-col--size">
                      Size
                    </span>
                    <span className="project-detail-file-col project-detail-file-col--date">
                      Uploaded
                    </span>
                    <span className="project-detail-file-col project-detail-file-col--action" />
                  </div>
                  {files.map((file) => (
                    <div
                      className="project-detail-file-row"
                      key={file.id || file.name}
                    >
                      <span className="project-detail-file-col project-detail-file-col--name">
                        <i className="fa-solid fa-file" />
                        {file.name?.replace(/^\d+-/, "")}
                      </span>
                      <span className="project-detail-file-col project-detail-file-col--size">
                        {formatFileSize(file.metadata?.size)}
                      </span>
                      <span className="project-detail-file-col project-detail-file-col--date">
                        {formatDate(file.created_at)}
                      </span>
                      <span className="project-detail-file-col project-detail-file-col--action">
                        <button
                          className="project-detail-file-download"
                          onClick={() => handleDownload(file.name)}
                          aria-label={`Download ${file.name}`}
                        >
                          <i className="fa-solid fa-download" />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="project-detail-feedback">
            {isReview && (
              <div className="project-detail-section">
                <h3 className="project-detail-section-title">
                  Submit Feedback
                </h3>
                <p className="project-detail-feedback-hint">
                  Your project is in review. Share your feedback or request
                  revisions below.
                </p>
                <form
                  className="project-detail-feedback-form"
                  onSubmit={handleFeedbackSubmit}
                >
                  <textarea
                    className="project-detail-feedback-input"
                    placeholder="Describe your feedback or revision requests…"
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    rows={4}
                    disabled={feedbackSubmitting}
                  />
                  <button
                    type="submit"
                    className="project-detail-feedback-submit"
                    disabled={feedbackSubmitting || !feedbackContent.trim()}
                  >
                    {feedbackSubmitting ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin" />{" "}
                        Submitting…
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane" /> Submit
                        Feedback
                      </>
                    )}
                  </button>
                  {feedbackSuccess && (
                    <div className="project-detail-feedback-success">
                      <i className="fa-solid fa-check-circle" /> Feedback
                      submitted successfully
                    </div>
                  )}
                  {feedbackError && (
                    <div className="project-detail-feedback-error">
                      <i className="fa-solid fa-circle-exclamation" />{" "}
                      {feedbackError}
                    </div>
                  )}
                </form>
              </div>
            )}

            {!isReview && (
              <div className="project-detail-feedback-disabled">
                <i className="fa-solid fa-info-circle" />
                <p>
                  Feedback can only be submitted when the project is in Review
                  status.
                </p>
              </div>
            )}

            {feedbackList.length > 0 && (
              <div className="project-detail-section">
                <h3 className="project-detail-section-title">
                  Previous Feedback
                </h3>
                <div className="project-detail-feedback-list">
                  {feedbackList.map((fb) => (
                    <div className="project-detail-feedback-item" key={fb.id}>
                      <p className="project-detail-feedback-content">
                        {fb.content}
                      </p>
                      <span className="project-detail-feedback-date">
                        {formatDate(fb.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
