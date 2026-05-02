import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import NotificationBadge from "./NotificationBadge";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: "fa-solid fa-house",
    end: true,
  },
  {
    to: "/dashboard/projects",
    label: "Projects",
    icon: "fa-solid fa-folder-open",
  },
  {
    to: "/dashboard/billing",
    label: "Billing",
    icon: "fa-solid fa-file-invoice-dollar",
    badgeKey: "invoices",
  },
  {
    to: "/dashboard/messages",
    label: "Messages",
    icon: "fa-solid fa-comments",
    badgeKey: "messages",
  },
  { to: "/dashboard/settings", label: "Settings", icon: "fa-solid fa-gear" },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadMessages, pendingInvoices, fetchNotifications } =
    useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const badgeCounts = {
    messages: unreadMessages,
    invoices: pendingInvoices,
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile sidebar toggle */}
      <button
        className="dashboard-sidebar-toggle"
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={sidebarOpen}
      >
        <i className={sidebarOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"} />
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="dashboard-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar navigation */}
      <nav
        className={`dashboard-sidebar${sidebarOpen ? " dashboard-sidebar--open" : ""}`}
        aria-label="Dashboard navigation"
      >
        <ul className="dashboard-sidebar-nav">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end || false}
                className={({ isActive }) =>
                  `dashboard-sidebar-link${isActive ? " dashboard-sidebar-link--active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <i className={item.icon} />
                <span>{item.label}</span>
                {item.badgeKey && (
                  <NotificationBadge count={badgeCounts[item.badgeKey]} />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content area */}
      <main className="dashboard-content">
        <Outlet />
      </main>

      {/* Mobile bottom navigation bar */}
      <nav className="dashboard-bottom-nav" aria-label="Dashboard navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end || false}
            className={({ isActive }) =>
              `dashboard-bottom-nav-item${isActive ? " dashboard-bottom-nav-item--active" : ""}`
            }
          >
            <span className="dashboard-bottom-nav-icon-wrap">
              <i className={item.icon} />
              {item.badgeKey && badgeCounts[item.badgeKey] > 0 && (
                <span
                  className="dashboard-badge dashboard-badge--bottom"
                  aria-label={`${badgeCounts[item.badgeKey]} unread`}
                >
                  {badgeCounts[item.badgeKey] > 99
                    ? "99+"
                    : badgeCounts[item.badgeKey]}
                </span>
              )}
            </span>
            <span className="dashboard-bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
