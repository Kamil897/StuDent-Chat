import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import s from './NotificationBell.module.scss';
import { getUnreadCount } from '../utils/notifications';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setUnreadCount(getUnreadCount());
    };

    // Initial count
    updateCount();

    // Listen for notification updates
    const handleNotificationsUpdate = () => {
      updateCount();
    };

    window.addEventListener('notificationsUpdated', handleNotificationsUpdate);
    window.addEventListener('storage', handleNotificationsUpdate);
    
    // Also check periodically for changes
    const interval = setInterval(updateCount, 2000);

    return () => {
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdate);
      window.removeEventListener('storage', handleNotificationsUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <Link to="/Inbox" className={s.notificationBell}>
      <div className={s.bellIcon}>
        🔔
        {unreadCount > 0 && (
          <span className={s.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
}
