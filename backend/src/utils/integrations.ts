import axios from 'axios';
import { google } from 'googleapis';
import { WebClient } from '@slack/web-api';
import { GlobalSettings } from '../features/settings/models/GlobalSettings';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { User } from '../features/users/models/User';

export const sendSlackMessage = async (message: string, overrideChannel?: string) => {
  try {
    const settings = await GlobalSettings.findOne();
    if (!settings || !settings.slackConnected || (!settings.slackWebhookUrl && !settings.slackAccessToken)) {
      logger.info('Slack not connected or missing credentials. Skipping message.');
      return;
    }

    if (settings.slackWebhookUrl) {
      // For webhooks, the channel is usually fixed, but some allow overriding via "channel" field
      const payload: any = { text: message };
      if (overrideChannel) payload.channel = overrideChannel;
      await axios.post(settings.slackWebhookUrl, payload);
    } else if (settings.slackAccessToken && (overrideChannel || settings.slackChannelId)) {
      const slack = new WebClient(settings.slackAccessToken);
      const targetChannel = overrideChannel || settings.slackChannelId;
      try {
        await slack.conversations.join({ channel: targetChannel! });
      } catch (e) {
        // Ignore already in channel errors
      }
      await slack.chat.postMessage({
        channel: targetChannel!,
        text: message,
      });
    }
  } catch (error) {
    logger.error('Failed to send Slack message from integrations util', error);
  }
};

export const createGoogleCalendarEvent = async (
  summary: string,
  description: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const settings = await GlobalSettings.findOne();
    if (!settings || !settings.googleWorkspaceConnected || (!settings.googleRefreshToken && !settings.googleAccessToken)) {
      logger.info('Google Workspace not connected. Skipping calendar event.');
      return;
    }

    const client = new google.auth.OAuth2(config.googleClientId, config.googleClientSecret);
    client.setCredentials({
      access_token: settings.googleAccessToken,
      refresh_token: settings.googleRefreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: client });

    const event = {
      summary,
      description,
      start: {
        date: startDate.toISOString().split('T')[0], // All day event start
      },
      end: {
        date: new Date(endDate.getTime() + 86400000).toISOString().split('T')[0], // All day event end is exclusive, so add 1 day
      },
    };

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    
    logger.info(`Successfully created Google Calendar event: ${summary}`);
  } catch (error) {
    logger.error('Failed to create Google Calendar event from integrations util', error);
  }
};

export const createCustomGoogleCalendarEvent = async (
  summary: string,
  description: string,
  startTime: Date,
  endTime: Date,
  location?: string,
  attendees?: string[]
) => {
  try {
    const settings = await GlobalSettings.findOne();
    if (!settings || !settings.googleWorkspaceConnected || (!settings.googleRefreshToken && !settings.googleAccessToken)) {
      throw new Error('Google Workspace not connected.');
    }

    const client = new google.auth.OAuth2(config.googleClientId, config.googleClientSecret);
    client.setCredentials({
      access_token: settings.googleAccessToken,
      refresh_token: settings.googleRefreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: client });

    const event: any = {
      summary,
      description,
      start: {
        dateTime: startTime.toISOString(),
      },
      end: {
        dateTime: endTime.toISOString(),
      },
    };

    if (location) {
      event.location = location;
    }

    if (attendees && attendees.length > 0) {
      event.attendees = attendees.map(email => ({ email: email.trim() }));
    }

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all' // Sends email notifications to attendees
    });
    
    logger.info(`Successfully created custom Google Calendar event: ${summary}`);
  } catch (error) {
    logger.error('Failed to create custom Google Calendar event', error);
    throw error;
  }
};

export const sendPersonalSlackMessage = async (userId: string, message: string) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.integrations?.slack?.connected || !user.integrations.slack.accessToken || !user.integrations.slack.channelId) {
      logger.info(`Slack not connected or missing credentials for user ${userId}. Skipping message.`);
      return;
    }

    const slack = new WebClient(user.integrations.slack.accessToken);
    try {
      await slack.conversations.join({ channel: user.integrations.slack.channelId });
    } catch (e) {
      // Ignore already in channel errors
    }
    await slack.chat.postMessage({
      channel: user.integrations.slack.channelId,
      text: message,
    });
  } catch (error) {
    logger.error(`Failed to send personal Slack message for user ${userId}`, error);
  }
};

export const createPersonalGoogleCalendarEvent = async (
  userId: string,
  summary: string,
  description: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.integrations?.google?.connected || !user.integrations.google.refreshToken) {
      logger.info(`Google Workspace not connected for user ${userId}. Skipping calendar event.`);
      return;
    }

    const client = new google.auth.OAuth2(config.googleClientId, config.googleClientSecret);
    client.setCredentials({
      refresh_token: user.integrations.google.refreshToken,
      // If access_token exists we can provide it, but refresh_token alone allows oauth2client to fetch a new one
      access_token: user.integrations.google.accessToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: client });

    const event = {
      summary,
      description,
      start: {
        date: startDate.toISOString().split('T')[0], // All day event start
      },
      end: {
        date: new Date(endDate.getTime() + 86400000).toISOString().split('T')[0], // All day event end is exclusive, so add 1 day
      },
    };

    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    
    logger.info(`Successfully created personal Google Calendar event: ${summary} for user ${userId}`);
  } catch (error) {
    logger.error(`Failed to create personal Google Calendar event for user ${userId}`, error);
  }
};
