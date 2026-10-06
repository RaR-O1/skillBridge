import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

let transporter: nodemailer.Transporter | null = null;

if (env.EMAIL_USER && env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    if (transporter) {
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });
      logger.info({ to, subject }, 'Email sent successfully via SMTP');
    } else {
      logger.info({ to, subject, preview: html.substring(0, 120) }, 'Email service in mock/log mode: Email output logged');
    }
    return true;
  } catch (err) {
    logger.error({ err, to, subject }, 'Failed to deliver email');
    return false;
  }
}
