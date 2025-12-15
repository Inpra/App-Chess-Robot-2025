import React, { useState, useEffect } from 'react';
import './NotificationBanner.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'maintenance' | 'success' | 'error';
  createdAt: string;
  recipientCount: number;
  emailSent: boolean;
}

const STORAGE_KEY = 'chess_robot_notifications';
const DISMISSED_KEY = 'chess_robot_dismissed_notifications';

const NotificationBanner: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  useEffect(() => {
    loadNotifications();
    loadDismissedIds();

    // Listen for localStorage changes (when admin sends new notification)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also poll localStorage periodically (in case storage event doesn't fire)
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Show first undismissed notification
    const undismissed = notifications.find(n => !dismissedIds.has(n.id));
    setCurrentNotification(undismissed || null);
  }, [notifications, dismissedIds]);

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadDismissedIds = () => {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDismissedIds(new Set(parsed));
      }
    } catch (error) {
      console.error('Error loading dismissed IDs:', error);
    }
  };

  const dismissNotification = (id: string) => {
    const newDismissedIds = new Set(dismissedIds);
    newDismissedIds.add(id);
    setDismissedIds(newDismissedIds);

    // Save to localStorage
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...newDismissedIds]));
    } catch (error) {
      console.error('Error saving dismissed IDs:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      info: 'ℹ️',
      warning: '⚠️',
      maintenance: '🔧',
      success: '✅',
      error: '❌'
    };
    return icons[type] || 'ℹ️';
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <div className={`notification-banner notification-${currentNotification.type}`}>
      <div className="notification-content">
        <span className="notification-icon">{getTypeIcon(currentNotification.type)}</span>
        <div className="notification-text">
          <strong className="notification-title">{currentNotification.title}</strong>
          <p className="notification-message">{currentNotification.message}</p>
        </div>
        <button
          className="notification-close"
          onClick={() => dismissNotification(currentNotification.id)}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;
