import { Request, Response } from 'express';
import { GlobalSettings } from '../models/GlobalSettings';
import axios from 'axios';
import { logger } from '../../../config/logger';
import { WebClient } from '@slack/web-api';
import { Notification } from '../../notifications/models/Notification';

export const getSlackAuthUrl = async (req: Request, res: Response) => {
  try {
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.NODE_ENV === 'production' 
      ? 'https://worksphere.dev/settings' 
      : 'http://localhost:5173/settings';

    // Requesting scopes for incoming webhooks, chat messages, and reading channels
    const scopes = 'chat:write,incoming-webhook,channels:read,groups:read';
    const url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;

    res.status(200).json({ success: true, data: { url } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Server Error' } });
  }
};

export const handleSlackCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: { message: 'Missing code' } });
    }

    const redirectUri = process.env.NODE_ENV === 'production' 
      ? 'https://worksphere.dev/settings' 
      : 'http://localhost:5173/settings';

    const params = new URLSearchParams();
    params.append('client_id', process.env.SLACK_CLIENT_ID || '');
    params.append('client_secret', process.env.SLACK_CLIENT_SECRET || '');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);

    const response = await axios.post('https://slack.com/api/oauth.v2.access', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = response.data;
    
    if (!data.ok) {
      logger.error(`Slack OAuth error: ${data.error}`);
      return res.status(400).json({ success: false, error: { message: data.error || 'Failed to connect to Slack' } });
    }

    let globalSettings = await GlobalSettings.findOne();
    if (!globalSettings) {
      globalSettings = await GlobalSettings.create({});
    }

    globalSettings.slackConnected = true;
    globalSettings.slackAccessToken = data.access_token;
    globalSettings.slackTeamId = data.team?.id;
    globalSettings.slackChannelId = data.incoming_webhook?.channel_id || data.authed_user?.id;
    globalSettings.slackWebhookUrl = data.incoming_webhook?.url;

    await globalSettings.save();

    res.status(200).json({ success: true, message: 'Successfully connected to Slack' });
  } catch (error: any) {
    logger.error('Slack Callback error', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Server Error' } });
  }
};

export const testSlackMessage = async (req: Request, res: Response) => {
  try {
    const settings = await GlobalSettings.findOne();
    if (!settings || !settings.slackConnected || (!settings.slackWebhookUrl && !settings.slackAccessToken)) {
      return res.status(400).json({ success: false, error: { message: 'Slack is not fully connected. Please disconnect and reconnect.' } });
    }

    if (settings.slackWebhookUrl) {
      // Use the incoming webhook (guaranteed to post to the selected channel without invite issues)
      await axios.post(settings.slackWebhookUrl, {
        text: '👋 *Hello from WorkSphere HRMS!*\nYour Slack integration has been successfully connected and is working perfectly. You will now receive automated HR alerts in this channel.',
      });
    } else {
      // Fallback to WebClient if webhook is missing
      const slack = new WebClient(settings.slackAccessToken);
      try {
        await slack.conversations.join({ channel: settings.slackChannelId || '' });
      } catch (e) {}
      await slack.chat.postMessage({
        channel: settings.slackChannelId || '',
        text: '👋 *Hello from WorkSphere HRMS!*\nYour Slack integration has been successfully connected and is working perfectly. You will now receive automated HR alerts in this channel.',
      });
    }

    res.status(200).json({ success: true, data: { message: 'Test message sent successfully' } });
  } catch (error: any) {
    logger.error('Failed to send test message to Slack', error);
    
    let errorMessage = 'Failed to send test message';
    if (error.data && error.data.error === 'not_in_channel') {
      errorMessage = 'Please invite the WorkSphere bot to your Slack channel first. Go to your channel and type: /invite @WorkSphere HRMS';
    }
    
    res.status(500).json({ success: false, error: { message: errorMessage } });
  }
};

export const disconnectSlack = async (req: Request, res: Response) => {
  try {
    const settings = await GlobalSettings.findOne();
    if (settings) {
      settings.slackConnected = false;
      settings.slackAccessToken = undefined;
      settings.slackChannelId = undefined;
      settings.slackTeamId = undefined;
      settings.slackWebhookUrl = undefined;
      await settings.save();
    }
    
    res.status(200).json({ success: true, data: { message: 'Slack disconnected successfully' } });
  } catch (error) {
    logger.error('Failed to disconnect Slack', error);
    res.status(500).json({ success: false, error: { message: 'Failed to disconnect Slack' } });
  }
};

export const getPersonalSlackUrl = async (req: Request, res: Response) => {
  try {
    const clientId = process.env.SLACK_CLIENT_ID;
    const redirectUri = process.env.NODE_ENV === 'production' 
      ? 'https://worksphere.dev/settings' 
      : 'http://localhost:5173/settings';

    // State will be used to differentiate personal vs global callback
    const state = 'personal-slack';
    const scopes = 'chat:write,incoming-webhook';
    const url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;

    res.status(200).json({ success: true, data: { url } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Server Error' } });
  }
};

export const handlePersonalSlackCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: { message: 'Missing code' } });
    }

    const redirectUri = process.env.NODE_ENV === 'production' 
      ? 'https://worksphere.dev/settings' 
      : 'http://localhost:5173/settings';

    const params = new URLSearchParams();
    params.append('client_id', process.env.SLACK_CLIENT_ID || '');
    params.append('client_secret', process.env.SLACK_CLIENT_SECRET || '');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);

    const response = await axios.post('https://slack.com/api/oauth.v2.access', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = response.data;
    
    if (!data.ok) {
      logger.error(`Personal Slack OAuth error: ${data.error}`);
      return res.status(400).json({ success: false, error: { message: data.error || 'Failed to connect personal Slack' } });
    }

    const user = (req as any).user;
    if (!user.integrations) user.integrations = {};
    if (!user.integrations.slack) user.integrations.slack = {};
    
    user.integrations.slack.connected = true;
    user.integrations.slack.accessToken = data.access_token;
    user.integrations.slack.channelId = data.authed_user?.id || data.incoming_webhook?.channel_id;

    await user.save();

    res.status(200).json({ success: true, message: 'Successfully connected personal Slack' });
  } catch (error: any) {
    logger.error('Personal Slack Callback error', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Server Error' } });
  }
};

export const testPersonalSlackMessage = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const slackSettings = user.integrations?.slack;
    
    if (!slackSettings || !slackSettings.connected || !slackSettings.accessToken) {
      return res.status(400).json({ success: false, error: { message: 'Personal Slack is not connected.' } });
    }

    const slack = new WebClient(slackSettings.accessToken);
    try {
      await slack.conversations.join({ channel: slackSettings.channelId || '' });
    } catch (e) {}
    
    await slack.chat.postMessage({
      channel: slackSettings.channelId || '',
      text: `👋 *Hello ${user.name}!*\nYour personal Slack integration has been successfully connected to WorkSphere HRMS.`,
    });

    res.status(200).json({ success: true, data: { message: 'Test message sent successfully' } });
  } catch (error: any) {
    logger.error('Failed to send personal test message to Slack', error);
    res.status(500).json({ success: false, error: { message: 'Failed to send test message. Check your Slack permissions.' } });
  }
};

export const disconnectPersonalSlack = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.integrations && user.integrations.slack) {
      user.integrations.slack.connected = false;
      user.integrations.slack.accessToken = undefined;
      user.integrations.slack.channelId = undefined;
      await user.save();
    }
    
    res.status(200).json({ success: true, data: { message: 'Personal Slack disconnected successfully' } });
  } catch (error) {
    logger.error('Failed to disconnect personal Slack', error);
    res.status(500).json({ success: false, error: { message: 'Failed to disconnect personal Slack' } });
  }
};

export const getSlackChannels = async (req: Request, res: Response) => {
  try {
    const settings = await GlobalSettings.findOne();
    if (!settings || !settings.slackConnected || !settings.slackAccessToken) {
      return res.status(400).json({ success: false, error: { message: 'Slack is not fully connected or token is missing.' } });
    }

    const slack = new WebClient(settings.slackAccessToken);
    let allChannels: any[] = [];
    
    try {
      // Try to fetch both public and private channels
      const response = await slack.conversations.list({
        types: 'public_channel,private_channel',
        exclude_archived: true,
        limit: 100
      });
      allChannels = response.channels || [];
    } catch (err: any) {
      logger.warn('Failed to fetch private channels (missing groups:read scope), falling back to public only');
      try {
        // Fallback to public channels only
        const response = await slack.conversations.list({
          types: 'public_channel',
          exclude_archived: true,
          limit: 100
        });
        allChannels = response.channels || [];
      } catch (fallbackErr: any) {
        logger.warn('Failed to fetch public channels. Token likely missing channels:read scope.', fallbackErr.message);
        return res.status(403).json({ 
          success: false, 
          error: { message: 'Missing Slack permissions. An Admin must reconnect Slack in Company Integrations.' } 
        });
      }
    }

    const channels = allChannels.map(c => ({
      id: c.id,
      name: c.name
    }));

    res.status(200).json({ success: true, data: channels });
  } catch (error: any) {
    logger.error('Failed to get slack channels', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch Slack channels' } });
  }
};

export const sendCustomSlackMessage = async (req: Request, res: Response) => {
  try {
    const { channelId, message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: { message: 'Message is required' } });
    }

    const settings = await GlobalSettings.findOne();
    if (!settings || !settings.slackConnected || !settings.slackAccessToken) {
      return res.status(400).json({ success: false, error: { message: 'Slack is not fully connected or token is missing.' } });
    }

    const slack = new WebClient(settings.slackAccessToken);
    const targetChannel = channelId || settings.slackChannelId;

    if (!targetChannel) {
      return res.status(400).json({ success: false, error: { message: 'No target channel specified and no default channel found.' } });
    }

    try {
      await slack.conversations.join({ channel: targetChannel });
    } catch (e) {}

    await slack.chat.postMessage({
      channel: targetChannel,
      text: message,
    });

    // Create a notification so this action appears in the dashboard's Recent Activities feed
    if ((req as any).user) {
      await Notification.create({
        userId: (req as any).user.id,
        title: 'Slack Announcement',
        message: `Posted a custom message to Slack.`,
        type: 'info',
        isRead: true
      });
    }

    res.status(200).json({ success: true, data: { message: 'Message sent successfully' } });
  } catch (error: any) {
    logger.error('Failed to send custom slack message', error);
    res.status(500).json({ success: false, error: { message: 'Failed to send custom Slack message' } });
  }
};
