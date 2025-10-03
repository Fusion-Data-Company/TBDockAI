import { Contact } from '@shared/schema';
import { emailAutomationService } from './emailAutomation';

interface SequenceStep {
  id: string;
  delayHours: number;
  subject: string;
  templateType: string;
  condition?: (contact: Contact) => boolean;
}

interface EmailSequence {
  id: string;
  name: string;
  description: string;
  trigger: 'new_lead' | 'proposal_sent' | 'cold_lead' | 'won_deal' | 'lost_deal' | 'manual';
  steps: SequenceStep[];
  active: boolean;
}

interface SequenceEnrollment {
  id: string;
  contactId: number;
  sequenceId: string;
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
}

class EmailSequenceService {
  private sequences: EmailSequence[] = [];
  private enrollments: Map<string, SequenceEnrollment> = new Map();

  constructor() {
    this.initializeSequences();
  }

  /**
   * Initialize predefined email sequences
   */
  private initializeSequences() {
    this.sequences = [
      {
        id: 'new-lead-nurture',
        name: 'New Lead Nurture',
        description: 'Welcome and educate new leads over 7 days',
        trigger: 'new_lead',
        active: true,
        steps: [
          {
            id: 'welcome',
            delayHours: 0,
            subject: 'Welcome to T&B Dock - Your Waterfront Construction Partner',
            templateType: 'welcome',
          },
          {
            id: 'education-1',
            delayHours: 24,
            subject: 'Why Choose Steel Truss Docks? Expert Insights',
            templateType: 'education',
          },
          {
            id: 'social-proof',
            delayHours: 72,
            subject: 'See What Our Customers Are Saying',
            templateType: 'testimonials',
          },
          {
            id: 'call-to-action',
            delayHours: 120,
            subject: 'Ready to Transform Your Waterfront? Let\'s Talk',
            templateType: 'cta',
          },
          {
            id: 'final-touch',
            delayHours: 168,
            subject: 'Still Interested? We\'re Here to Help',
            templateType: 'follow_up',
          },
        ],
      },
      {
        id: 'proposal-follow-up',
        name: 'Proposal Follow-Up',
        description: 'Follow up after sending a proposal',
        trigger: 'proposal_sent',
        active: true,
        steps: [
          {
            id: 'proposal-received',
            delayHours: 2,
            subject: 'Did You Receive Your Proposal?',
            templateType: 'proposal_check',
          },
          {
            id: 'answer-questions',
            delayHours: 48,
            subject: 'Questions About Your Dock Project?',
            templateType: 'faq',
          },
          {
            id: 'urgency',
            delayHours: 96,
            subject: 'Spring Booking Season is Here - Let\'s Get Started',
            templateType: 'urgency',
          },
          {
            id: 'final-proposal',
            delayHours: 168,
            subject: 'Last Chance: Your Custom Dock Proposal',
            templateType: 'final_call',
          },
        ],
      },
      {
        id: 'cold-lead-reactivation',
        name: 'Cold Lead Reactivation',
        description: 'Re-engage leads that have gone cold',
        trigger: 'cold_lead',
        active: true,
        steps: [
          {
            id: 'reconnect',
            delayHours: 0,
            subject: 'It\'s Been A While - Still Thinking About That Dock?',
            templateType: 'reengagement',
          },
          {
            id: 'new-offer',
            delayHours: 72,
            subject: 'Special Offer: 10% Off Spring Dock Projects',
            templateType: 'promotion',
          },
          {
            id: 'case-study',
            delayHours: 120,
            subject: 'How We Transformed a Hayden Lake Waterfront',
            templateType: 'case_study',
          },
        ],
      },
      {
        id: 'post-sale-onboarding',
        name: 'Post-Sale Onboarding',
        description: 'Welcome and guide new customers',
        trigger: 'won_deal',
        active: true,
        steps: [
          {
            id: 'thank-you',
            delayHours: 0,
            subject: 'Welcome to the T&B Dock Family!',
            templateType: 'thank_you',
          },
          {
            id: 'what-to-expect',
            delayHours: 24,
            subject: 'What to Expect During Your Dock Construction',
            templateType: 'onboarding',
          },
          {
            id: 'prep-checklist',
            delayHours: 72,
            subject: 'Pre-Construction Checklist for Your Property',
            templateType: 'checklist',
          },
        ],
      },
      {
        id: 'lost-deal-feedback',
        name: 'Lost Deal Feedback',
        description: 'Learn from lost opportunities',
        trigger: 'lost_deal',
        active: true,
        steps: [
          {
            id: 'feedback-request',
            delayHours: 24,
            subject: 'We\'d Love Your Feedback',
            templateType: 'feedback',
          },
          {
            id: 'stay-connected',
            delayHours: 168,
            subject: 'Keep Us in Mind for Future Projects',
            templateType: 'stay_connected',
          },
        ],
      },
    ];
  }

  /**
   * Get all sequences
   */
  getSequences(): EmailSequence[] {
    return this.sequences;
  }

  /**
   * Get sequence by ID
   */
  getSequenceById(id: string): EmailSequence | undefined {
    return this.sequences.find(seq => seq.id === id);
  }

  /**
   * Get sequences by trigger
   */
  getSequencesByTrigger(trigger: string): EmailSequence[] {
    return this.sequences.filter(seq => seq.trigger === trigger && seq.active);
  }

  /**
   * Enroll contact in sequence
   */
  enrollContact(contactId: number, sequenceId: string): SequenceEnrollment {
    const enrollmentId = `${contactId}-${sequenceId}-${Date.now()}`;

    const enrollment: SequenceEnrollment = {
      id: enrollmentId,
      contactId,
      sequenceId,
      currentStep: 0,
      startedAt: new Date(),
      status: 'active',
    };

    this.enrollments.set(enrollmentId, enrollment);

    console.log(`Enrolled contact ${contactId} in sequence ${sequenceId}`);
    return enrollment;
  }

  /**
   * Get enrollment by ID
   */
  getEnrollment(enrollmentId: string): SequenceEnrollment | undefined {
    return this.enrollments.get(enrollmentId);
  }

  /**
   * Get active enrollments for contact
   */
  getContactEnrollments(contactId: number): SequenceEnrollment[] {
    return Array.from(this.enrollments.values()).filter(
      e => e.contactId === contactId && e.status === 'active'
    );
  }

  /**
   * Process sequence step (send email)
   */
  async processStep(
    enrollment: SequenceEnrollment,
    contact: Contact
  ): Promise<boolean> {
    const sequence = this.getSequenceById(enrollment.sequenceId);
    if (!sequence) return false;

    const step = sequence.steps[enrollment.currentStep];
    if (!step) return false;

    // Check condition if exists
    if (step.condition && !step.condition(contact)) {
      console.log(`Skipping step ${step.id} due to condition`);
      return this.advanceToNextStep(enrollment);
    }

    // Calculate if step should be sent based on delay
    const hoursSinceStart = (Date.now() - enrollment.startedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceStart < step.delayHours) {
      console.log(`Step ${step.id} not ready yet. Waiting for ${step.delayHours - hoursSinceStart} more hours`);
      return false;
    }

    // Send email
    const template = emailAutomationService.getTemplate(step.templateType, {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
    });

    const sent = await emailAutomationService.sendEmail(
      contact.email!,
      step.subject,
      template.html,
      template.text
    );

    if (sent) {
      console.log(`Sent email: ${step.subject} to ${contact.email}`);
      return this.advanceToNextStep(enrollment);
    }

    return false;
  }

  /**
   * Advance to next step in sequence
   */
  private advanceToNextStep(enrollment: SequenceEnrollment): boolean {
    const sequence = this.getSequenceById(enrollment.sequenceId);
    if (!sequence) return false;

    enrollment.currentStep++;

    // Check if sequence is complete
    if (enrollment.currentStep >= sequence.steps.length) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
      console.log(`Sequence ${enrollment.sequenceId} completed for contact ${enrollment.contactId}`);
      return true;
    }

    this.enrollments.set(enrollment.id, enrollment);
    return true;
  }

  /**
   * Pause enrollment
   */
  pauseEnrollment(enrollmentId: string): boolean {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment) return false;

    enrollment.status = 'paused';
    this.enrollments.set(enrollmentId, enrollment);
    return true;
  }

  /**
   * Resume enrollment
   */
  resumeEnrollment(enrollmentId: string): boolean {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment || enrollment.status !== 'paused') return false;

    enrollment.status = 'active';
    this.enrollments.set(enrollmentId, enrollment);
    return true;
  }

  /**
   * Cancel enrollment
   */
  cancelEnrollment(enrollmentId: string): boolean {
    const enrollment = this.enrollments.get(enrollmentId);
    if (!enrollment) return false;

    enrollment.status = 'cancelled';
    this.enrollments.set(enrollmentId, enrollment);
    return true;
  }

  /**
   * Process all active enrollments (should be run on a schedule)
   */
  async processAllEnrollments(contacts: Map<number, Contact>): Promise<void> {
    const activeEnrollments = Array.from(this.enrollments.values()).filter(
      e => e.status === 'active'
    );

    console.log(`Processing ${activeEnrollments.length} active enrollments`);

    for (const enrollment of activeEnrollments) {
      const contact = contacts.get(enrollment.contactId);
      if (!contact || !contact.email) continue;

      await this.processStep(enrollment, contact);
    }
  }

  /**
   * Auto-enroll contact based on trigger
   */
  autoEnroll(contact: Contact, trigger: 'new_lead' | 'proposal_sent' | 'cold_lead' | 'won_deal' | 'lost_deal'): SequenceEnrollment[] {
    const sequences = this.getSequencesByTrigger(trigger);
    const enrollments: SequenceEnrollment[] = [];

    for (const sequence of sequences) {
      // Check if already enrolled
      const existing = this.getContactEnrollments(contact.id).find(
        e => e.sequenceId === sequence.id
      );

      if (!existing) {
        const enrollment = this.enrollContact(contact.id, sequence.id);
        enrollments.push(enrollment);
      }
    }

    return enrollments;
  }

  /**
   * Get sequence analytics
   */
  getSequenceAnalytics(sequenceId: string): {
    totalEnrolled: number;
    active: number;
    completed: number;
    cancelled: number;
    avgCompletionTime: number;
  } {
    const enrollments = Array.from(this.enrollments.values()).filter(
      e => e.sequenceId === sequenceId
    );

    const completed = enrollments.filter(e => e.status === 'completed');
    const avgCompletionTime = completed.length > 0
      ? completed.reduce((sum, e) => {
          const duration = e.completedAt!.getTime() - e.startedAt.getTime();
          return sum + duration;
        }, 0) / completed.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      totalEnrolled: enrollments.length,
      active: enrollments.filter(e => e.status === 'active').length,
      completed: completed.length,
      cancelled: enrollments.filter(e => e.status === 'cancelled').length,
      avgCompletionTime,
    };
  }
}

export const emailSequenceService = new EmailSequenceService();
