import webpush from 'web-push';
import { logger } from '../config/logger';
import { GlobalSettings } from '../features/settings/models/GlobalSettings';

export const sendPushNotification = async (subscription: any, payload: any) => {
  try {
    const settings = await GlobalSettings.findOne();
    if (!settings || !settings.vapidPublicKey || !settings.vapidPrivateKey) {
      logger.warn('VAPID keys not configured. Cannot send push notification.');
      return false;
    }

    webpush.setVapidDetails(
      'mailto:contact@worksphere.dev',
      settings.vapidPublicKey,
      settings.vapidPrivateKey
    );

    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    logger.error('Failed to send push notification', error);
    return false;
  }
};
