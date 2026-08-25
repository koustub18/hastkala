import { useState, useEffect } from 'react';
import { subscribeToNotifications, markNotificationRead, markAllNotificationsRead, Notification } from '@hastkala/core';

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeToNotifications(userId, 20, (newNotifications) => {
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;
    await markNotificationRead(userId, notificationId);
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
};
