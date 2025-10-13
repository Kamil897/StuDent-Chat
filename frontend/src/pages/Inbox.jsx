import React, { useEffect, useState } from "react";
import {
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} from "../components/utils/notifications";

export default function Inbox() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = () => {
      const saved = JSON.parse(localStorage.getItem("notifications") || "[]");
      setNotifications(saved);
    };

    loadNotifications();

    const handleNotificationsUpdate = () => loadNotifications();

    window.addEventListener("notificationsUpdated", handleNotificationsUpdate);
    window.addEventListener("storage", handleNotificationsUpdate);

    return () => {
      window.removeEventListener("notificationsUpdated", handleNotificationsUpdate);
      window.removeEventListener("storage", handleNotificationsUpdate);
    };
  }, []);

  const handleMarkAsRead = (index) => markAsRead(index);
  const handleMarkAllAsRead = () => markAllAsRead();
  const handleClearAll = () => clearAllNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      style={{
        margin: "50px",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          width: "100%",
          margin: "auto",
          padding: "40px 20px 60px",
          background: "white",
          boxShadow: "0 4px 40px rgba(0,0,0,0.05)",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* Заголовок */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #f3f4f6",
            paddingBottom: "16px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ margin: 0, color: "#1f2937", fontSize: "1.8rem" }}>
            Уведомления{" "}
            {unreadCount > 0 && (
              <span
                style={{
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  padding: "4px 10px",
                  fontSize: "0.8rem",
                  marginLeft: "8px",
                }}
              >
                {unreadCount}
              </span>
            )}
          </h2>

          <div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  marginRight: "10px",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "#2563eb")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "#3b82f6")
                }
              >
                Прочитать все
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = "#dc2626")
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = "#ef4444")
                }
              >
                Очистить все
              </button>
            )}
          </div>
        </div>

        {/* Контент */}
        {notifications.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
            }}
          >
            <div style={{ fontSize: "72px", marginBottom: "16px" }}>📭</div>
            <h3 style={{ marginBottom: "8px", color: "#1f2937" }}>
              Нет уведомлений
            </h3>
            <p style={{ fontSize: "15px", maxWidth: "400px" }}>
              Здесь будут появляться уведомления о статусе ваших действий и жалоб
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              overflowY: "auto",
              maxHeight: "70vh",
              paddingRight: "6px",
            }}
          >
            {notifications.map((n, i) => (
              <div
                key={i}
                onClick={() => handleMarkAsRead(i)}
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  background: n.read ? "#f9fafb" : "#e0f2fe",
                  border: "1px solid " + (n.read ? "#e5e7eb" : "#bae6fd"),
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(0,0,0,0.05)";
                }}
              >
                {!n.read && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      width: "8px",
                      height: "8px",
                      background: "#3b82f6",
                      borderRadius: "50%",
                    }}
                  />
                )}
                <div
                  style={{
                    fontWeight: n.read ? "500" : "600",
                    color: n.read ? "#374151" : "#111827",
                    marginBottom: "6px",
                  }}
                >
                  {n.text}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{n.date}</span>
                  {n.read && (
                    <span
                      style={{
                        fontSize: "11px",
                        background: "#22c55e",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "12px",
                      }}
                    >
                      Прочитано
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
