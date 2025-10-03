import { Contact, Opportunity } from '@shared/schema';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailSequence {
  name: string;
  trigger: 'new_lead' | 'proposal_sent' | 'cold_lead' | 'won_deal' | 'lost_deal';
  emails: Array<{
    delay: number; // hours
    template: EmailTemplate;
  }>;
}

class EmailAutomationService {
  private sendgridApiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.sendgridApiKey = process.env.SENDGRID_API_KEY || '';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@tbdock.com';
    this.fromName = process.env.FROM_NAME || 'T&B Dock';
  }

  /**
   * Send an email using SendGrid API
   */
  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    if (!this.sendgridApiKey) {
      console.warn('SendGrid API key not configured - email not sent');
      console.log(`Would send email to ${to}: ${subject}`);
      return false;
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              subject,
            },
          ],
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          content: [
            {
              type: 'text/plain',
              value: text || this.stripHtml(html),
            },
            {
              type: 'text/html',
              value: html,
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
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Get email template by type
   */
  getTemplate(type: string, data: any): EmailTemplate {
    const templates: Record<string, (data: any) => EmailTemplate> = {
      welcome: (data) => ({
        subject: `Welcome to T&B Dock, ${data.firstName}!`,
        html: this.getWelcomeEmailHtml(data),
        text: this.getWelcomeEmailText(data),
      }),
      proposal_sent: (data) => ({
        subject: `Your T&B Dock Project Proposal - ${data.projectName}`,
        html: this.getProposalEmailHtml(data),
        text: this.getProposalEmailText(data),
      }),
      follow_up: (data) => ({
        subject: `Following up on your dock project`,
        html: this.getFollowUpEmailHtml(data),
        text: this.getFollowUpEmailText(data),
      }),
      reengagement: (data) => ({
        subject: `Still interested in your waterfront project?`,
        html: this.getReengagementEmailHtml(data),
        text: this.getReengagementEmailText(data),
      }),
      thank_you: (data) => ({
        subject: `Thank you for choosing T&B Dock!`,
        html: this.getThankYouEmailHtml(data),
        text: this.getThankYouEmailText(data),
      }),
    };

    return templates[type] ? templates[type](data) : templates.welcome(data);
  }

  /**
   * Trigger automated email sequence based on event
   */
  async triggerSequence(
    trigger: 'new_lead' | 'proposal_sent' | 'cold_lead' | 'won_deal' | 'lost_deal',
    contact: Contact,
    data?: any
  ): Promise<void> {
    const sequences = this.getSequences();
    const sequence = sequences.find(s => s.trigger === trigger);

    if (!sequence) {
      console.warn(`No sequence found for trigger: ${trigger}`);
      return;
    }

    console.log(`Triggering sequence "${sequence.name}" for contact ${contact.id}`);

    // In production, this would schedule emails using a job queue
    // For now, we'll log the sequence
    for (const email of sequence.emails) {
      console.log(`Would schedule email "${email.template.subject}" to ${contact.email} in ${email.delay} hours`);
    }
  }

  /**
   * Define email sequences
   */
  private getSequences(): EmailSequence[] {
    return [
      {
        name: 'New Lead Nurture',
        trigger: 'new_lead',
        emails: [
          {
            delay: 0, // Immediate
            template: this.getTemplate('welcome', {}),
          },
          {
            delay: 24, // 1 day later
            template: this.getTemplate('follow_up', {}),
          },
          {
            delay: 120, // 5 days later
            template: this.getTemplate('reengagement', {}),
          },
        ],
      },
      {
        name: 'Post-Proposal Follow-up',
        trigger: 'proposal_sent',
        emails: [
          {
            delay: 24,
            template: this.getTemplate('follow_up', {}),
          },
          {
            delay: 72,
            template: this.getTemplate('follow_up', {}),
          },
        ],
      },
      {
        name: 'Re-engagement Campaign',
        trigger: 'cold_lead',
        emails: [
          {
            delay: 0,
            template: this.getTemplate('reengagement', {}),
          },
        ],
      },
      {
        name: 'Thank You Sequence',
        trigger: 'won_deal',
        emails: [
          {
            delay: 0,
            template: this.getTemplate('thank_you', {}),
          },
        ],
      },
    ];
  }

  // Email Template HTML Generators

  private getWelcomeEmailHtml(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0a1628; color: #fbbf24; padding: 30px 20px; text-align: center; }
    .content { background: #fff; padding: 30px 20px; }
    .button { display: inline-block; padding: 12px 30px; background: #fbbf24; color: #0a1628; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to T&B Dock!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.firstName || 'there'},</p>

      <p>Thank you for reaching out to T&B Dock! We're excited to help you with your waterfront construction project.</p>

      <p>At T&B Dock, we specialize in:</p>
      <ul>
        <li>Custom dock construction with steel truss frames</li>
        <li>Full dock rebuilds and repairs</li>
        <li>Tarp installation and removal</li>
        <li>Ramps and waterfront accessories</li>
      </ul>

      <p>What happens next?</p>
      <ol>
        <li>One of our team members will review your inquiry</li>
        <li>We'll schedule a free on-site estimate at your convenience</li>
        <li>You'll receive a detailed proposal with timeline and pricing</li>
      </ol>

      <p style="text-align: center; margin: 30px 0;">
        <a href="https://tbdock.com/schedule" class="button">Schedule Your Free Estimate</a>
      </p>

      <p>In the meantime, feel free to browse our recent projects and customer testimonials on our website.</p>

      <p>We look forward to working with you!</p>

      <p>Best regards,<br>
      <strong>Tyler Hinton</strong><br>
      Owner, T&B Dock<br>
      Coeur d'Alene, Idaho</p>
    </div>
    <div class="footer">
      <p>T&B Dock | Coeur d'Alene, Idaho<br>
      Your Local Waterfront Construction Company</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getWelcomeEmailText(data: any): string {
    return `
Welcome to T&B Dock!

Hi ${data.firstName || 'there'},

Thank you for reaching out to T&B Dock! We're excited to help you with your waterfront construction project.

At T&B Dock, we specialize in:
- Custom dock construction with steel truss frames
- Full dock rebuilds and repairs
- Tarp installation and removal
- Ramps and waterfront accessories

What happens next?
1. One of our team members will review your inquiry
2. We'll schedule a free on-site estimate at your convenience
3. You'll receive a detailed proposal with timeline and pricing

Schedule your free estimate: https://tbdock.com/schedule

We look forward to working with you!

Best regards,
Tyler Hinton
Owner, T&B Dock
Coeur d'Alene, Idaho
    `;
  }

  private getProposalEmailHtml(data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0a1628; color: #fbbf24; padding: 30px 20px; text-align: center; }
    .content { background: #fff; padding: 30px 20px; }
    .button { display: inline-block; padding: 12px 30px; background: #fbbf24; color: #0a1628; text-decoration: none; border-radius: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Project Proposal is Ready</h1>
    </div>
    <div class="content">
      <p>Hi ${data.firstName || 'there'},</p>

      <p>Thank you for the opportunity to provide a proposal for your ${data.projectName || 'dock project'}.</p>

      <p>We've carefully reviewed your requirements and prepared a detailed proposal that includes:</p>
      <ul>
        <li>Comprehensive project scope and timeline</li>
        <li>Material specifications and quality guarantees</li>
        <li>Transparent pricing breakdown</li>
        <li>Our warranty and maintenance support</li>
      </ul>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${data.proposalUrl || '#'}" class="button">View Your Proposal</a>
      </p>

      <p>Have questions? I'm here to help! Feel free to reply to this email or give me a call.</p>

      <p>Best regards,<br>
      <strong>Tyler Hinton</strong><br>
      T&B Dock</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getProposalEmailText(data: any): string {
    return `
Your Project Proposal is Ready

Hi ${data.firstName || 'there'},

Thank you for the opportunity to provide a proposal for your ${data.projectName || 'dock project'}.

We've carefully reviewed your requirements and prepared a detailed proposal.

View your proposal: ${data.proposalUrl || 'Contact us for details'}

Have questions? I'm here to help!

Best regards,
Tyler Hinton
T&B Dock
    `;
  }

  private getFollowUpEmailHtml(data: any): string {
    return `<!DOCTYPE html><html><body><p>Hi ${data.firstName || 'there'},</p><p>I wanted to follow up on your dock project inquiry...</p></body></html>`;
  }

  private getFollowUpEmailText(data: any): string {
    return `Hi ${data.firstName || 'there'},\n\nI wanted to follow up on your dock project inquiry...`;
  }

  private getReengagementEmailHtml(data: any): string {
    return `<!DOCTYPE html><html><body><p>Hi ${data.firstName || 'there'},</p><p>It's been a while since we last connected about your waterfront project...</p></body></html>`;
  }

  private getReengagementEmailText(data: any): string {
    return `Hi ${data.firstName || 'there'},\n\nIt's been a while since we last connected about your waterfront project...`;
  }

  private getThankYouEmailHtml(data: any): string {
    return `<!DOCTYPE html><html><body><p>Hi ${data.firstName || 'there'},</p><p>Thank you for choosing T&B Dock for your project!</p></body></html>`;
  }

  private getThankYouEmailText(data: any): string {
    return `Hi ${data.firstName || 'there'},\n\nThank you for choosing T&B Dock for your project!`;
  }
}

export const emailAutomationService = new EmailAutomationService();
