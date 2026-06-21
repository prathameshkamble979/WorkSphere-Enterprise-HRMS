import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from './logger';

export const sendEmail = async (options: { email: string, subject: string, message: string }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.smtp.email,
        pass: config.smtp.password,
      },
    });

    const message = {
      from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
    };

    const info = await transporter.sendMail(message);
    logger.info(`Message sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Email sending failed', error);
    return false;
  }
};
