import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
const transporter = env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass
    ? nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        auth: {
            user: env.smtpUser,
            pass: env.smtpPass,
        },
    })
    : null;
export const sendEmail = async (to, subject, html) => {
    if (!transporter) {
        logger.info('SMTP is not configured, skipping email.', { to, subject });
        return;
    }
    await transporter.sendMail({
        from: env.emailFrom,
        to,
        subject,
        html,
    });
};
