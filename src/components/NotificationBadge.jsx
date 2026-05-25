import styles from "./NotificationBadge.module.css";

export default function NotificationBadge({ count }) {
  if (!count || count <= 0) return null;

  return (
    <span className={styles.badge} aria-label={`${count} unread`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
