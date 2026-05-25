import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import NotificationBadge from "./NotificationBadge";
import styles from "./DashboardLayout.module.css";

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
    <div className={styles.layout}>
      {/* Mobile sidebar toggle */}
      <button
        className={styles.sidebarToggle}
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={sidebarOpen}
      >
        <i className={sidebarOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"} />
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar navigation */}
      <nav
        className={`${styles.sidebar}${sidebarOpen ? ` ${styles.sidebarOpen}` : ""}`}
        aria-label="Dashboard navigation"
      >
        <ul className={styles.sidebarNav}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end || false}
                className={({ isActive }) =>
                  `${styles.sidebarLink}${isActive ? ` ${styles.sidebarLinkActive}` : ""}`
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
      <main className={styles.content}>
        <Outlet />
      </main>

      {/* Mobile bottom navigation bar */}
      <nav className={styles.bottomNav} aria-label="Dashboard navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end || false}
            className={({ isActive }) =>
              `${styles.bottomNavItem}${isActive ? ` ${styles.bottomNavItemActive}` : ""}`
            }
          >
            <span className={styles.bottomNavIconWrap}>
              <i className={item.icon} />
              {item.badgeKey && badgeCounts[item.badgeKey] > 0 && (
                <span
                  className={`${styles.badge} ${styles.badgeBottom}`}
                  aria-label={`${badgeCounts[item.badgeKey]} unread`}
                >
                  {badgeCounts[item.badgeKey] > 99
                    ? "99+"
                    : badgeCounts[item.badgeKey]}
                </span>
              )}
            </span>
            <span className={styles.bottomNavLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
