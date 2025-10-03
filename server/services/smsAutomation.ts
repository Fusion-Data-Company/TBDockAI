import { Contact, Opportunity } from '@shared/schema';

interface SMSMessage {
  to: string;
  body: string;
  mediaUrls?: string[];
}

interface SMSTemplate {
  body: string;
}

class SMSAutomationService {
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private twilioPhoneNumber: string;

  constructor() {
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+12085551234';
  }

  /**
   * Send SMS using Twilio API
   */
  async sendSMS(to: string, body: string, mediaUrls?: string[]): Promise<boolean> {
    if (!this.twilioAccountSid || !this.twilioAuthToken) {
      console.warn('Twilio credentials not configured - SMS not sent');
      console.log(`Would send SMS to ${to}: ${body}`);
      return false;
    }

    // Clean phone number (remove non-digits except +)
    const cleanTo = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;

    try {
      const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64');

      const formData = new URLSearchParams();
      formData.append('To', cleanTo);
      formData.append('From', this.twilioPhoneNumber);
      formData.append('Body', body);

      if (mediaUrls && mediaUrls.length > 0) {
        mediaUrls.forEach(url => formData.append('MediaUrl', url));
      }

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Twilio API error:', error);
        return false;
      }

      const result = await response.json();
      console.log('SMS sent successfully:', result.sid);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Send appointment reminder SMS
   */
  async sendAppointmentReminder(contact: Contact, appointmentDate: Date, appointmentType: string): Promise<boolean> {
    if (!contact.phone) {
      console.warn('Contact has no phone number');
      return false;
    }

    const dateStr = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const timeStr = appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const body = `Hi ${contact.firstName}, this is T&B Dock. Reminder: Your ${appointmentType} is scheduled for ${dateStr} at ${timeStr}. Reply CONFIRM to confirm or call us at (208) 555-1234 to reschedule.`;

    return await this.sendSMS(contact.phone, body);
  }

  /**
   * Send emergency lead alert to sales team
   */
  async sendEmergencyLeadAlert(salesRepPhone: string, contact: Contact, urgencyNote: string): Promise<boolean> {
    const body = `🚨 URGENT LEAD: ${contact.firstName} ${contact.lastName} needs emergency dock service. ${urgencyNote}. Contact: ${contact.phone || contact.email}. Respond ASAP!`;

    return await this.sendSMS(salesRepPhone, body);
  }

  /**
   * Send new lead notification to sales rep
   */
  async sendNewLeadNotification(salesRepPhone: string, contact: Contact, leadScore: number): Promise<boolean> {
    const tempEmoji = leadScore >= 70 ? '🔥' : leadScore >= 40 ? '⚡' : '❄️';
    const body = `${tempEmoji} New Lead: ${contact.firstName} ${contact.lastName} (Score: ${leadScore}). ${contact.leadSource || 'Website'} inquiry. Check CRM for details.`;

    return await this.sendSMS(salesRepPhone, body);
  }

  /**
   * Send proposal sent confirmation to client
   */
  async sendProposalSentConfirmation(contact: Contact, proposalUrl?: string): Promise<boolean> {
    if (!contact.phone) return false;

    const body = proposalUrl
      ? `Hi ${contact.firstName}, your T&B Dock project proposal is ready! View it here: ${proposalUrl}. Questions? Call Tyler at (208) 555-1234.`
      : `Hi ${contact.firstName}, your T&B Dock project proposal has been sent to ${contact.email}. Questions? Call Tyler at (208) 555-1234.`;

    return await this.sendSMS(contact.phone, body);
  }

  /**
   * Send project milestone update to client
   */
  async sendProjectMilestoneUpdate(contact: Contact, milestone: string, projectName: string): Promise<boolean> {
    if (!contact.phone) return false;

    const body = `Hi ${contact.firstName}, great news! Your ${projectName} has reached the "${milestone}" stage. We're on track and looking forward to completion. - T&B Dock`;

    return await this.sendSMS(contact.phone, body);
  }

  /**
   * Send post-project follow-up
   */
  async sendPostProjectFollowUp(contact: Contact, projectName: string, reviewUrl?: string): Promise<boolean> {
    if (!contact.phone) return false;

    const body = reviewUrl
      ? `Hi ${contact.firstName}, thank you for choosing T&B Dock for your ${projectName}! We'd love to hear your feedback: ${reviewUrl}. Enjoy your new dock!`
      : `Hi ${contact.firstName}, thank you for choosing T&B Dock for your ${projectName}! If you need anything, we're just a call away. Enjoy your new dock!`;

    return await this.sendSMS(contact.phone, body);
  }

  /**
   * Send estimate scheduled confirmation
   */
  async sendEstimateScheduledConfirmation(contact: Contact, estimateDate: Date): Promise<boolean> {
    if (!contact.phone) return false;

    const dateStr = estimateDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const timeStr = estimateDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const body = `Hi ${contact.firstName}, your free dock estimate with T&B Dock is confirmed for ${dateStr} at ${timeStr}. See you soon! Reply CANCEL to reschedule.`;

    return await this.sendSMS(contact.phone, body);
  }

  /**
   * Send re-engagement SMS to cold leads
   */
  async sendReengagementSMS(contact: Contact): Promise<boolean> {
    if (!contact.phone) return false;

    const body = `Hi ${contact.firstName}, it's been a while! Still thinking about that dock project? T&B Dock is here to help. Spring is the perfect time to start. Call Tyler at (208) 555-1234 or reply YES.`;

    return await this.sendSMS(contact.phone, body);
  }

  /**
   * Send bulk SMS (for announcements, seasonal promotions)
   */
  async sendBulkSMS(contacts: Contact[], message: string): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const contact of contacts) {
      if (!contact.phone) {
        failed++;
        continue;
      }

      // Personalize message
      const personalizedMessage = message.replace('{firstName}', contact.firstName || 'there');

      const success = await this.sendSMS(contact.phone, personalizedMessage);

      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Rate limiting - wait 100ms between sends to avoid Twilio throttling
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed };
  }

  /**
   * Send seasonal promotion SMS
   */
  async sendSeasonalPromotion(contacts: Contact[], season: 'spring' | 'summer' | 'fall' | 'winter'): Promise<{ sent: number; failed: number }> {
    const seasonalMessages = {
      spring: `Hi {firstName}! Spring is here 🌸 Perfect time for dock repairs & new installations. T&B Dock is offering 10% off spring projects. Book your free estimate: (208) 555-1234`,
      summer: `Hi {firstName}! ☀️ Summer is in full swing. Need dock repairs or upgrades? T&B Dock can help keep your waterfront ready. Call (208) 555-1234 to schedule.`,
      fall: `Hi {firstName}! 🍂 Fall is the best time for dock winterization & tarp installation. T&B Dock can protect your investment. Schedule now: (208) 555-1234`,
      winter: `Hi {firstName}! ❄️ Planning your spring dock project? T&B Dock is taking bookings now with early-bird pricing. Call Tyler at (208) 555-1234`,
    };

    return await this.sendBulkSMS(contacts, seasonalMessages[season]);
  }

  /**
   * Parse incoming SMS (for CONFIRM, CANCEL, YES responses)
   */
  parseIncomingSMS(body: string): { action: string; intent: string } {
    const normalizedBody = body.trim().toUpperCase();

    if (['CONFIRM', 'YES', 'Y', 'OK', 'CONFIRMED'].includes(normalizedBody)) {
      return { action: 'confirm', intent: 'positive' };
    }

    if (['CANCEL', 'NO', 'N', 'STOP', 'UNSUBSCRIBE'].includes(normalizedBody)) {
      return { action: 'cancel', intent: 'negative' };
    }

    if (['HELP', 'INFO', '?'].includes(normalizedBody)) {
      return { action: 'help', intent: 'inquiry' };
    }

    return { action: 'unknown', intent: 'unknown' };
  }

  /**
   * Handle incoming SMS webhook from Twilio
   */
  handleIncomingWebhook(from: string, body: string): { response: string; action: string } {
    const parsed = this.parseIncomingSMS(body);

    switch (parsed.action) {
      case 'confirm':
        return {
          response: 'Thank you for confirming! We look forward to seeing you. - T&B Dock',
          action: 'mark_confirmed',
        };
      case 'cancel':
        return {
          response: 'Understood. Please call us at (208) 555-1234 to reschedule. - T&B Dock',
          action: 'mark_cancelled',
        };
      case 'help':
        return {
          response: 'T&B Dock - Your local waterfront construction company. Call (208) 555-1234 or visit tbdock.com. Reply STOP to opt out.',
          action: 'send_info',
        };
      default:
        return {
          response: 'Thanks for your message! A team member will respond soon. For immediate assistance, call (208) 555-1234. - T&B Dock',
          action: 'create_interaction',
        };
    }
  }
}

export const smsAutomationService = new SMSAutomationService();
