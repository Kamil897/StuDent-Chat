// Utility functions for managing notifications

export const addNotification = (text, type = 'info') => {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  notifications.push({
    text,
    date: new Date().toLocaleString(),
    read: false,
    type
  });
  localStorage.setItem("notifications", JSON.stringify(notifications));
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('notificationsUpdated'));
};

export const getUnreadCount = () => {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  return notifications.filter(n => !n.read).length;
};

export const markAsRead = (index) => {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  if (notifications[index]) {
    notifications[index].read = true;
    localStorage.setItem("notifications", JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  }
};

export const markAllAsRead = () => {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  const updated = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem("notifications", JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('notificationsUpdated'));
};

export const clearAllNotifications = () => {
  localStorage.removeItem("notifications");
  window.dispatchEvent(new CustomEvent('notificationsUpdated'));
};

// Predefined notification messages
export const NOTIFICATION_MESSAGES = {
  COMPLAINT_SENT: "Ваша жалоба успешно отправлена",
  COMPLAINT_RESOLVED: "Ваша жалоба была рассмотрена и решена",
  COMPLAINT_REJECTED: "Ваша жалоба была отклонена",
  SYSTEM_UPDATE: "Доступна новая версия системы",
  NEW_FEATURE: "Добавлена новая функция",
  MAINTENANCE: "Плановые работы по обслуживанию"
};

