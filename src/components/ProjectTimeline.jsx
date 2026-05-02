import React from "react";

const STATUS_COLORS = {
  Discovery: "#8b5cf6",
  "In Progress": "#0066ff",
  Review: "#d97706",
  Revision: "#d97706",
  Delivered: "#22c55e",
  Closed: "#6b7280",
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusToClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export default function ProjectTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="project-timeline-empty">
        <p>No status history yet</p>
      </div>
    );
  }

  return (
    <div
      className="project-timeline"
      role="list"
      aria-label="Project status history"
    >
      {history.map((entry) => {
        const dotColor = STATUS_COLORS[entry.status] || "#6b7280";
        const statusClass = statusToClass(entry.status);

        return (
          <div
            className="project-timeline-entry"
            key={entry.id}
            role="listitem"
          >
            <div className="project-timeline-rail">
              <span
                className={`project-timeline-dot project-timeline-dot--${statusClass}`}
                style={{ backgroundColor: dotColor }}
                aria-hidden="true"
              />
              <span className="project-timeline-line" aria-hidden="true" />
            </div>
            <div className="project-timeline-content">
              <span
                className={`project-timeline-status dashboard-project-status dashboard-project-status--${statusClass}`}
              >
                {entry.status}
              </span>
              {entry.description && (
                <p className="project-timeline-description">
                  {entry.description}
                </p>
              )}
              <time
                className="project-timeline-date"
                dateTime={entry.created_at}
              >
                {formatDate(entry.created_at)}
              </time>
            </div>
          </div>
        );
      })}
    </div>
  );
}
