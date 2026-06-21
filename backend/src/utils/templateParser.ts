import { NotificationTemplate } from '../features/settings/models/NotificationTemplate';

export const parseTemplate = async (
  eventTrigger: 'NEW_HIRE' | 'LEAVE_APPROVED' | 'PAYROLL_COMPLETED' | 'PROJECT_MILESTONE',
  type: 'Slack' | 'GoogleCalendar' | 'Email',
  payload: Record<string, string>,
  defaultSubject: string = '',
  defaultBody: string = ''
): Promise<{ subject: string; body: string; channel?: string }> => {
  
  const template = await NotificationTemplate.findOne({ eventTrigger, type, isActive: true });

  if (!template) {
    return { subject: defaultSubject, body: defaultBody };
  }

  let resolvedSubject = template.subject || defaultSubject;
  let resolvedBody = template.body;

  // Replace all {{variables}} with payload values
  for (const [key, value] of Object.entries(payload)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    resolvedSubject = resolvedSubject.replace(regex, value || '');
    resolvedBody = resolvedBody.replace(regex, value || '');
  }

  return { 
    subject: resolvedSubject, 
    body: resolvedBody,
    channel: template.channel
  };
};
