import { Request, Response } from 'express';
import { Notification } from '../features/notifications/models/Notification';
import { User } from '../features/users/models/User';
import { sendPushNotification } from './webpush';
import { Types } from 'mongoose';

// Map of userId string to their active Server-Sent Events (SSE) Response objects
const userStreams = new Map<string, Response[]>();

/**
 * Adds an Express Response object to a user's active SSE connections.
 */
export const addNotificationStream = (userId: string, res: Response) => {
  const streams = userStreams.get(userId) || [];
  streams.push(res);
  userStreams.set(userId, streams);

  // Send initial connected event to avoid timeout
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`);

  res.on('close', () => {
    removeNotificationStream(userId, res);
  });
};

/**
 * Removes an Express Response object from a user's active SSE connections.
 */
export const removeNotificationStream = (userId: string, res: Response) => {
  const streams = userStreams.get(userId) || [];
  const index = streams.indexOf(res);
  if (index !== -1) {
    streams.splice(index, 1);
  }
  if (streams.length === 0) {
    userStreams.delete(userId);
  } else {
    userStreams.set(userId, streams);
  }
};

/**
 * Sends a notification to a specific user.
 * 1. Saves it to the database.
 * 2. Pushes it to any active SSE streams for that user.
 */
export const sendInAppNotification = async (
  userId: string | Types.ObjectId,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  link?: string
) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      link
    });

    // Push to active streams
    const streams = userStreams.get(userId.toString());
    if (streams && streams.length > 0) {
      const dataString = `data: ${JSON.stringify({
        event: 'NEW_NOTIFICATION',
        notification
      })}\n\n`;

      streams.forEach(res => {
        res.write(dataString);
      });
    }

    // Web Push
    const user = await User.findById(userId);
    if (user && user.preferences?.pushNotifications && user.pushSubscriptions && user.pushSubscriptions.length > 0) {
      const payload = {
        title,
        message,
        url: link || '/',
      };

      const pushPromises = user.pushSubscriptions.map(sub => sendPushNotification(sub, payload));
      await Promise.allSettled(pushPromises);
    }

    return notification;
  } catch (error) {
    console.error('Failed to send in-app notification:', error);
  }
};
