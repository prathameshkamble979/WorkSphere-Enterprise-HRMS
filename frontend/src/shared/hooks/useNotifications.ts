import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/apiClient';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/notifications');
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, []);

  // Web Push Subscription
  const subscribeToPush = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Get public key from backend
      const { data } = await apiClient.get('/settings/push/public-key');
      if (!data.success || !data.publicKey) return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: data.publicKey
      });

      // Send to backend
      await apiClient.post('/settings/push/subscribe', { subscription });
    } catch (error) {
      console.error('Failed to subscribe to push notifications', error);
    }
  };

  // Set up SSE and Push
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    subscribeToPush();

    const token = localStorage.getItem('worksphere_access_token');
    if (!token) return;

    // We append the token to the URL since EventSource doesn't support custom headers easily in standard browser API
    const baseUrl = apiClient.defaults.baseURL || '/api/v1';
    const sseUrl = `${baseUrl}/notifications/stream?token=${token}`;
    
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'NEW_NOTIFICATION') {
          setNotifications(prev => [data.notification, ...prev]);
        }
      } catch (err) {
        console.error('Failed to parse SSE data', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [fetchNotifications]);


  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};
