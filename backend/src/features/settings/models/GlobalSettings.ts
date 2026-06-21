import mongoose, { Document, Schema } from 'mongoose';

export interface IGlobalSettings extends Document {
  companyName: string;
  slackConnected: boolean;
  slackAccessToken?: string;
  slackChannelId?: string;
  slackTeamId?: string;
  slackWebhookUrl?: string;
  googleWorkspaceConnected: boolean;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  vapidPublicKey?: string;
  vapidPrivateKey?: string;
}

const globalSettingsSchema = new Schema<IGlobalSettings>(
  {
    companyName: { type: String, default: 'WorkSphere Technologies Inc.' },
    slackConnected: { type: Boolean, default: false },
    slackAccessToken: { type: String },
    slackChannelId: { type: String },
    slackTeamId: { type: String },
    slackWebhookUrl: { type: String },
    googleWorkspaceConnected: { type: Boolean, default: false },
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    vapidPublicKey: { type: String },
    vapidPrivateKey: { type: String },
  },
  { timestamps: true }
);

export const GlobalSettings = mongoose.model<IGlobalSettings>('GlobalSettings', globalSettingsSchema);
