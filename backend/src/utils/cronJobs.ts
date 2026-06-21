import cron from 'node-cron';
import { User } from '../features/users/models/User';
import { Notification } from '../features/notifications/models/Notification';
import { sendEmail } from '../config/sendEmail';
import { logger } from '../config/logger';

export const initCronJobs = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    logger.info('Running daily email summary job');
    try {
      // Find all users who have email notifications enabled
      const users = await User.find({ 'preferences.emailNotifications': true, isActive: true });
      
      for (const user of users) {
        // Find unread notifications for this user
        const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });
        
        if (unreadCount > 0) {
          const message = `
            <h2>Daily Summary</h2>
            <p>Hello ${user.name},</p>
            <p>You have <strong>${unreadCount}</strong> unread notifications waiting for you in WorkSphere.</p>
            <p><a href="http://localhost:5173/dashboard">Log in to view them</a></p>
          `;

          await sendEmail({
            email: user.email,
            subject: 'WorkSphere HRMS - Daily Summary',
            message
          });
        }
      }
      logger.info('Daily email summary job completed');
    } catch (error) {
      logger.error('Error running daily email summary job:', error);
    }
  });
};

