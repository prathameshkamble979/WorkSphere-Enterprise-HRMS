import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationTemplate extends Document {
  name: string;
  type: 'Slack' | 'GoogleCalendar' | 'Email';
  eventTrigger: 'NEW_HIRE' | 'LEAVE_APPROVED' | 'PAYROLL_COMPLETED' | 'PROJECT_MILESTONE';
  subject?: string;
  body: string;
  isActive: boolean;
  channel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationTemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['Slack', 'GoogleCalendar', 'Email'], required: true },
    eventTrigger: {
      type: String,
      enum: ['NEW_HIRE', 'LEAVE_APPROVED', 'PAYROLL_COMPLETED', 'PROJECT_MILESTONE'],
      required: true
    },
    subject: { type: String }, // Used for email subject or calendar title
    body: { type: String, required: true }, // Template with variables e.g., {{firstName}}
    isActive: { type: Boolean, default: true },
    channel: { type: String } // Slack channel override if any
  },
  {
    timestamps: true
  }
);

// Ensure only one active template per type and eventTrigger exists
notificationTemplateSchema.index({ type: 1, eventTrigger: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export const NotificationTemplate = mongoose.model<INotificationTemplate>('NotificationTemplate', notificationTemplateSchema);
