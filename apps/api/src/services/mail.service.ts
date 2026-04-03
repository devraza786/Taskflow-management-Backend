import nodemailer from 'nodemailer';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // For production, use environment variables for SMTP settings
    // For now, we'll use a placeholder or log to console
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.warn('Mail Service: SMTP credentials not provided. Emails will be logged to console.');
    }
  }

  async sendMail(options: MailOptions): Promise<boolean> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"Taskflow" <${process.env.SMTP_FROM || 'noreply@taskflow.com'}>`,
          ...options,
        });
        return true;
      } catch (error) {
        console.error('Mail Service: Failed to send email', error);
        return false;
      }
    } else {
      console.log('--- EMAIL MOCK ---');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Body:', options.html);
      console.log('------------------');
      return true;
    }
  }

  async sendInvitation(email: string, inviterName: string, orgName: string, inviteUrl: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.025em; margin-bottom: 24px;">
          You're Invited to Join Taskflow
        </h1>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Hello! <strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on Taskflow.
        </p>
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #64748b; margin-bottom: 16px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">
            Action Required
          </p>
          <p style="font-size: 16px; margin-bottom: 24px;">
            To accept the invitation and set up your account, click the button below:
          </p>
          <a href="${inviteUrl}" style="display: inline-block; background-color: #2563eb; color: white; font-weight: 800; padding: 16px 32px; border-radius: 12px; text-decoration: none; text-transform: uppercase; font-size: 14px; letter-spacing: 0.025em;">
            Accept Invitation
          </a>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="font-size: 14px; word-break: break-all; color: #2563eb;">
          <a href="${inviteUrl}">${inviteUrl}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          &copy; ${new Date().getFullYear()} Taskflow SaaS. All rights reserved.
        </p>
      </div>
    `;

    return this.sendMail({
      to: email,
      subject: `Invitation to join ${orgName} on Taskflow`,
      html,
    });
  }
}

export const mailService = new MailService();
