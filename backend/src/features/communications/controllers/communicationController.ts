import { Request, Response } from 'express';
import { Notification } from '../../notifications/models/Notification';
import { GlobalSettings } from '../../settings/models/GlobalSettings';
import { WebClient } from '@slack/web-api';
import { google } from 'googleapis';
import { logger } from '../../../config/logger';

export const getCompanyFeed = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    // For MVP, return recent notifications for this user
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    logger.error('Failed to get company feed', error);
    res.status(500).json({ success: false, error: { message: 'Server Error' } });
  }
};

export const getSlackActivity = async (req: Request, res: Response) => {
  try {
    const settings = await GlobalSettings.findOne();
    if (!settings || !settings.slackConnected || !settings.slackAccessToken || !settings.slackChannelId) {
      return res.status(200).json({ success: true, data: [] });
    }

    const slack = new WebClient(settings.slackAccessToken);
    const result = await slack.conversations.history({
      channel: settings.slackChannelId,
      limit: 10,
    });

    res.status(200).json({ success: true, data: result.messages || [] });
  } catch (error) {
    logger.error('Failed to get slack activity', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch Slack activity' } });
  }
};

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const settings = await GlobalSettings.findOne();
    if (!settings || !settings.googleWorkspaceConnected || !settings.googleAccessToken) {
      return res.status(200).json({ success: true, data: [] });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: settings.googleAccessToken,
      refresh_token: settings.googleRefreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: nextWeek.toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.status(200).json({ success: true, data: response.data.items || [] });
  } catch (error) {
    logger.error('Failed to get calendar events', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch Calendar events' } });
  }
};

