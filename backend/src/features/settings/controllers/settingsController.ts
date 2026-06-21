import { Request, Response } from 'express';
import { GlobalSettings } from '../models/GlobalSettings';
import { User } from '../../users/models/User';
import webpush from 'web-push';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    let globalSettings = await GlobalSettings.findOne();
    if (!globalSettings) {
      globalSettings = await GlobalSettings.create({});
    }

    res.status(200).json({
      success: true,
      data: {
        global: {
          companyName: globalSettings.companyName,
          slackConnected: globalSettings.slackConnected,
          googleWorkspaceConnected: globalSettings.googleWorkspaceConnected,
        },
        user: {
          emailNotifications: user.preferences?.emailNotifications ?? true,
          pushNotifications: user.preferences?.pushNotifications ?? true,
          slackConnected: user.integrations?.slack?.connected ?? false,
          googleConnected: user.integrations?.google?.connected ?? false,
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Server Error' } });
  }
};

export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const { emailNotifications, pushNotifications } = req.body;
    
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    user.preferences = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : user.preferences?.emailNotifications,
      pushNotifications: pushNotifications !== undefined ? pushNotifications : user.preferences?.pushNotifications,
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: user.preferences
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Server Error' } });
  }
};

export const subscribeToPush = async (req: Request, res: Response) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, error: { message: 'Invalid subscription object' } });
    }

    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    if (!user.pushSubscriptions) {
      user.pushSubscriptions = [];
    }

    // Check if it already exists
    const exists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!exists) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Subscribed to push notifications' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Server Error' } });
  }
};

export const getPushPublicKey = async (req: Request, res: Response) => {
  try {
    let settings = await GlobalSettings.findOne();
    if (!settings) {
      settings = await GlobalSettings.create({});
    }

    if (!settings.vapidPublicKey || !settings.vapidPrivateKey) {
      const vapidKeys = webpush.generateVAPIDKeys();
      settings.vapidPublicKey = vapidKeys.publicKey;
      settings.vapidPrivateKey = vapidKeys.privateKey;
      await settings.save();
    }

    res.status(200).json({ success: true, publicKey: settings.vapidPublicKey });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Server Error' } });
  }
};
