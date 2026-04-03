import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'placeholder',
    pass: process.env.SMTP_PASS || 'placeholder',
  },
});

export const sendInvitationEmail = async (
  email: string,
  inviterName: string,
  orgName: string,
  token: string
) => {
  const acceptUrl = `${process.env.WEB_URL || 'http://localhost:5173'}/accept-invitation/${token}`;

  const mailOptions = {
    from: `"TaskFlow" <${process.env.SMTP_USER || 'no-reply@taskflow.com'}>`,
    to: email,
    subject: `You're invited to join ${orgName} on TaskFlow`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">TASKFLOW</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-top: 0;">Hello!</h2>
          <p style="color: #64748b; line-height: 1.6; font-size: 16px;">
            <strong>${inviterName}</strong> has invited you to join their team <strong>${orgName}</strong> on TaskFlow.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${acceptUrl}" 
               style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);">
               Join the Workspace
            </a>
          </div>
          <p style="color: #64748b; line-height: 1.6; font-size: 14px;">
            This invitation will expire in 7 days. If you weren't expecting this invitation, you can safely ignore this email.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} TaskFlow Inc. Modern productivity for teams.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // In dev mode, we just log the link
    console.log(`PREVIEW LINK: ${acceptUrl}`);
  }
};
