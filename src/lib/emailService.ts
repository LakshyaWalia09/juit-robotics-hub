/**
 * Email Service with Multiple Provider Support
 * Supports: Resend, SendGrid, and SMTP
 */

import { supabase } from '@/integrations/supabase/client';

// Email provider types
export type EmailProvider = 'resend' | 'sendgrid' | 'smtp' | 'supabase';

// Email configuration
interface EmailConfig {
  provider: EmailProvider;
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
}

// Email template data
interface EmailTemplateData {
  projectTitle?: string;
  studentName?: string;
  status?: string;
  comments?: string;
  projectId?: string;
  [key: string]: any;
}

// Email options
interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  templateName?: string;
  templateData?: EmailTemplateData;
}

class EmailService {
  private config: EmailConfig;

  constructor() {
    // Load configuration from environment variables
    this.config = {
      provider: (import.meta.env.VITE_EMAIL_PROVIDER as EmailProvider) || 'supabase',
      apiKey: import.meta.env.VITE_EMAIL_API_KEY,
      fromEmail: import.meta.env.VITE_EMAIL_FROM || 'noreply@juit-robotics.edu',
      fromName: import.meta.env.VITE_EMAIL_FROM_NAME || 'JUIT Robotics Lab',
    };
  }

  /**
   * Send email using configured provider
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      // Queue email in database for reliable delivery
      const { error } = await supabase.rpc('queue_email', {
        p_to_email: options.to,
        p_to_name: options.toName || '',
        p_subject: options.subject,
        p_body_html: options.html,
        p_body_text: options.text || this.htmlToText(options.html),
        p_template_name: options.templateName || null,
        p_template_data: options.templateData || null,
      });

      if (error) {
        console.error('Error queueing email:', error);
        return false;
      }

      // If using client-side provider, send immediately
      if (this.config.provider !== 'supabase') {
        return await this.sendViaProvider(options);
      }

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send email via specific provider
   */
  private async sendViaProvider(options: SendEmailOptions): Promise<boolean> {
    switch (this.config.provider) {
      case 'resend':
        return await this.sendViaResend(options);
      case 'sendgrid':
        return await this.sendViaSendGrid(options);
      case 'smtp':
        console.warn('SMTP requires server-side implementation');
        return false;
      default:
        return true; // Queued in database
    }
  }

  /**
   * Send via Resend (recommended)
   */
  private async sendViaResend(options: SendEmailOptions): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Resend API error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending via Resend:', error);
      return false;
    }
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(options: SendEmailOptions): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: options.to, name: options.toName }],
          }],
          from: {
            email: this.config.fromEmail,
            name: this.config.fromName,
          },
          subject: options.subject,
          content: [
            {
              type: 'text/html',
              value: options.html,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('SendGrid API error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending via SendGrid:', error);
      return false;
    }
  }

  /**
   * Convert HTML to plain text (simple version)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Send project submission confirmation to student
   */
  async sendProjectConfirmation(
    studentEmail: string,
    studentName: string,
    projectTitle: string,
    projectId: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .detail-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { color: #1e40af; font-size: 20px; }
          ul { list-style: none; padding: 0; }
          li { padding: 8px 0; }
          strong { color: #1f2937; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Project Submitted Successfully!</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>Thank you for submitting your project proposal to the JUIT Robotics Lab! Your submission has been received and is now pending faculty review.</p>
            
            <div class="detail-box">
              <h2>Submission Details</h2>
              <ul>
                <li><strong>Project Title:</strong> ${projectTitle}</li>
                <li><strong>Submission ID:</strong> ${projectId.substring(0, 8)}</li>
                <li><strong>Status:</strong> Pending Review</li>
                <li><strong>Submitted:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
              </ul>
            </div>
            
            <h3>What's Next?</h3>
            <p>Our faculty members will review your proposal within <strong>3-5 business days</strong>. You will receive an email notification once your project has been reviewed with feedback and next steps.</p>
            
            <p>If you have any questions in the meantime, please don't hesitate to contact us.</p>
            
            <div class="footer">
              <p>Best regards,<br><strong>JUIT Robotics Lab Team</strong></p>
              <p style="font-size: 12px; color: #9ca3af;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: studentEmail,
      toName: studentName,
      subject: `Project Submission Confirmed - ${projectTitle}`,
      html,
      templateName: 'project_confirmation',
      templateData: { projectTitle, studentName, projectId },
    });
  }

  /**
   * Send project status update to student
   */
  async sendStatusUpdate(
    studentEmail: string,
    studentName: string,
    projectTitle: string,
    status: string,
    comments?: string
  ): Promise<boolean> {
    const statusEmoji = {
      approved: '✅',
      rejected: '❌',
      under_review: '🔍',
      completed: '🎆',
    }[status] || '📝';

    const statusColor = {
      approved: '#10b981',
      rejected: '#ef4444',
      under_review: '#3b82f6',
      completed: '#8b5cf6',
    }[status] || '#6b7280';

    const statusTitle = status.replace('_', ' ').toUpperCase();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { background: ${statusColor}; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; }
          .comments-box { background: #fef3c7; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusEmoji} Project Status Update</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${studentName}</strong>,</p>
            <p>We have an update regarding your project submission:</p>
            
            <p><strong>Project:</strong> ${projectTitle}</p>
            <div class="status-badge">Status: ${statusTitle}</div>
            
            ${comments ? `
              <div class="comments-box">
                <h3 style="margin-top: 0; color: #92400e;">💬 Faculty Feedback</h3>
                <p style="margin-bottom: 0;">${comments}</p>
              </div>
            ` : ''}
            
            ${status === 'approved' ? `
              <p><strong>Congratulations!</strong> Your project has been approved. You can now proceed with the implementation. Please coordinate with the lab in-charge for equipment allocation and lab access.</p>
            ` : ''}
            
            ${status === 'under_review' ? `
              <p>Your project is currently being reviewed by our faculty. We will update you soon with the outcome.</p>
            ` : ''}
            
            <div class="footer">
              <p>Best regards,<br><strong>JUIT Robotics Lab Team</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: studentEmail,
      toName: studentName,
      subject: `Project ${statusTitle} - ${projectTitle}`,
      html,
      templateName: 'status_update',
      templateData: { projectTitle, studentName, status, comments },
    });
  }

  /**
   * Send new project notification to admins
   */
  async sendNewProjectNotification(
    adminEmail: string,
    adminName: string,
    projectTitle: string,
    studentName: string,
    category: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .project-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #7c3aed; border-radius: 5px; }
          .button { background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📨 New Project Submission</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${adminName}</strong>,</p>
            <p>A new project proposal has been submitted and requires your review:</p>
            
            <div class="project-box">
              <h3 style="margin-top: 0; color: #7c3aed;">${projectTitle}</h3>
              <p><strong>Student:</strong> ${studentName}</p>
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <center>
              <a href="${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/admin/dashboard" class="button">
                View in Dashboard →
              </a>
            </center>
            
            <div class="footer">
              <p>JUIT Robotics Hub - Admin Notification System</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: adminEmail,
      toName: adminName,
      subject: `New Project: ${projectTitle}`,
      html,
      templateName: 'new_project_admin',
      templateData: { projectTitle, studentName, category, adminName },
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
