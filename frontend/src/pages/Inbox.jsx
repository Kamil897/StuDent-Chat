import React, { useEffect, useState } from "react";
import { markAsRead, markAllAsRead, clearAllNotifications } from "../components/utils/notifications";

export default function Inbox() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = () => {
      const saved = JSON.parse(localStorage.getItem("notifications") || "[]");
      setNotifications(saved);
    };

    loadNotifications();

    // Listen for notification updates
    const handleNotificationsUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('notificationsUpdated', handleNotificationsUpdate);
    window.addEventListener('storage', handleNotificationsUpdate);

    return () => {
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdate);
      window.removeEventListener('storage', handleNotificationsUpdate);
    };
  }, []);

  const handleMarkAsRead = (index) => {
    markAsRead(index);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px",
        borderBottom: "2px solid #f0f0f0",
        paddingBottom: "10px"
      }}>
        <h2 style={{ margin: 0, color: "#333" }}>
          Уведомления {unreadCount > 0 && <span style={{ 
            background: "#ff4d4f", 
            color: "white", 
            borderRadius: "50%", 
            padding: "2px 8px", 
            fontSize: "12px",
            marginLeft: "8px"
          }}>{unreadCount}</span>}
        </h2>
        <div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              style={{
                background: "#1890ff",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px"
              }}
            >
              Прочитать все
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              style={{
                background: "#ff4d4f",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Очистить все
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "40px", 
          color: "#999",
          background: "#fafafa",
          borderRadius: "8px"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <p>Нет уведомлений</p>
          <p style={{ fontSize: "14px" }}>Здесь будут появляться уведомления о статусе ваших жалоб</p>
        </div>
      ) : (
        <div>
          {notifications.map((n, i) => (
            <div
              key={i}
              style={{
                padding: "16px",
                margin: "8px 0",
                background: n.read ? "#f8f9fa" : "#e6f7ff",
                borderRadius: "8px",
                cursor: "pointer",
                border: n.read ? "1px solid #e9ecef" : "1px solid #b3d9ff",
                transition: "all 0.2s ease",
                position: "relative"
              }}
              onClick={() => handleMarkAsRead(i)}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              {!n.read && (
                <div style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "8px",
                  height: "8px",
                  background: "#1890ff",
                  borderRadius: "50%"
                }} />
              )}
              <div style={{ 
                fontWeight: n.read ? "normal" : "600",
                color: n.read ? "#666" : "#333",
                marginBottom: "4px"
              }}>
                {n.text}
              </div>
              <div style={{ 
                fontSize: "12px", 
                color: "#999",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span>{n.date}</span>
                {n.read && (
                  <span style={{ 
                    fontSize: "10px", 
                    background: "#52c41a", 
                    color: "white", 
                    padding: "2px 6px", 
                    borderRadius: "10px" 
                  }}>
                    Прочитано
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
