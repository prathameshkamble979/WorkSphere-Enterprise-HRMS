import { WebClient } from '@slack/web-api';
import { logger } from '../config/logger';
import { GlobalSettings } from '../features/settings/models/GlobalSettings';

export const sendSlackNotification = async (message: string) => {
  try {
    const settings = await GlobalSettings.findOne();
    if (!settings || !settings.slackConnected || !settings.slackAccessToken || !settings.slackChannelId) {
      logger.warn('Slack not fully connected. Cannot send notification.');
      return false;
    }

    const slack = new WebClient(settings.slackAccessToken);
    await slack.chat.postMessage({
      channel: settings.slackChannelId,
      text: message,
    });
    return true;
  } catch (error) {
    logger.error('Failed to send Slack notification', error);
    return false;
  }
};
