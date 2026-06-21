import { Response } from 'express';
import { AuthRequest } from '../../../middlewares/authMiddleware';
import { Notification } from '../models/Notification';
import { addNotificationStream, removeNotificationStream } from '../../../utils/notifications';
import { logger } from '../../../config/logger';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user?._id })
      .sort({ createdAt: -1 })
      .limit(50); // Get latest 50 notifications

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: { message: 'Server Error' } });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user?._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: { message: 'Server Error' } });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { userId: req.user?._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, error: { message: 'Server Error' } });
  }
};

export const streamNotifications = (req: AuthRequest, res: Response) => {
  if (!req.user?._id) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  addNotificationStream(req.user._id.toString(), res);

  req.on('close', () => {
    removeNotificationStream(req.user!._id.toString(), res);
  });
};
