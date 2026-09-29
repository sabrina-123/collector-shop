import { useEffect, useMemo, useState } from "react";

import api from "../api/api";

const notificationIcons = {
  PRICE_CHANGED: "↗",
  PRODUCT_APPROVED: "✓",
  PRODUCT_REJECTED: "!",
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [view, setView] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    const response = await api.get("notifications/");
    setNotifications(response.data);
  }

  useEffect(() => {
    loadNotifications()
      .catch(() => setError("Impossible de charger vos notifications."))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id) {
    try {
      await api.patch(`notifications/${id}/`, { is_read: true });
      setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, is_read: true } : notification));
    } catch {
      setError("Impossible de mettre à jour cette notification.");
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const visibleNotifications = useMemo(() => view === "unread" ? notifications.filter((notification) => !notification.is_read) : notifications, [notifications, view]);

  if (loading) return <p className="page-loading">Chargement de vos notifications...</p>;

  return (
    <section className="notifications-page">
      <header className="notifications-header">
        <div><p className="eyebrow">Votre activité</p><h1>Notifications</h1><p>Les nouvelles importantes de votre collection, au même endroit.</p></div>
        <div className="notification-summary"><strong>{unreadCount}</strong><span>non lue{unreadCount > 1 ? "s" : ""}</span></div>
      </header>

      {error && <p className="message-error">{error}</p>}

      <div className="notifications-tabs" role="tablist" aria-label="Filtrer les notifications">
        <button className={view === "all" ? "notification-tab active" : "notification-tab"} onClick={() => setView("all")}>Toutes <span>{notifications.length}</span></button>
        <button className={view === "unread" ? "notification-tab active" : "notification-tab"} onClick={() => setView("unread")}>Non lues <span>{unreadCount}</span></button>
      </div>

      <div className="notification-list">
        {visibleNotifications.length ? visibleNotifications.map((notification) => <article className={notification.is_read ? "notification-card" : "notification-card unread"} key={notification.id}>
          <div className={`notification-icon notification-${notification.notification_type?.toLowerCase() || "default"}`}>{notificationIcons[notification.notification_type] || "•"}</div>
          <div className="notification-content"><div className="notification-card-top"><h2>{notification.title}</h2><time>{new Date(notification.created_at).toLocaleDateString("fr-FR")}</time></div><p>{notification.message}</p>{!notification.is_read && <button className="mark-read" onClick={() => markRead(notification.id)}>Marquer comme lue</button>}</div>
          {!notification.is_read && <span className="unread-dot" aria-label="Non lue" />}
        </article>) : <div className="empty-state"><span className="empty-notification-mark">✦</span><h2>Tout est à jour</h2><p>Vous n'avez aucune notification dans cette vue.</p></div>}
      </div>
    </section>
  );
}

export default Notifications;
