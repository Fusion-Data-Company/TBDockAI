import { Contact, Interaction, Opportunity } from '@shared/schema';

interface LeadScoreFactors {
  baseScore: number;
  engagementScore: number;
  projectValueScore: number;
  urgencyScore: number;
  sourceScore: number;
  timeScore: number;
  totalScore: number;
}

interface LeadScoringResult {
  score: number;
  temperature: 'hot' | 'warm' | 'cold';
  factors: LeadScoreFactors;
  recommendations: string[];
  autoActions: string[];
}

class LeadScoringService {
  /**
   * Calculate comprehensive lead score based on multiple factors
   */
  calculateLeadScore(
    contact: Contact,
    interactions: Interaction[] = [],
    opportunities: Opportunity[] = []
  ): LeadScoringResult {
    const factors: LeadScoreFactors = {
      baseScore: 0,
      engagementScore: 0,
      projectValueScore: 0,
      urgencyScore: 0,
      sourceScore: 0,
      timeScore: 0,
      totalScore: 0,
    };

    const recommendations: string[] = [];
    const autoActions: string[] = [];

    // 1. Base Score (Contact Completeness) - Max 20 points
    factors.baseScore = this.calculateCompletenessScore(contact);

    // 2. Engagement Score (Interactions) - Max 30 points
    factors.engagementScore = this.calculateEngagementScore(interactions);

    // 3. Project Value Score - Max 25 points
    factors.projectValueScore = this.calculateProjectValueScore(opportunities);

    // 4. Urgency Score - Max 15 points
    factors.urgencyScore = this.calculateUrgencyScore(opportunities, contact);

    // 5. Source Score (Lead Quality) - Max 10 points
    factors.sourceScore = this.calculateSourceScore(contact.leadSource);

    // 6. Time Decay Score - Can reduce by up to 20 points
    factors.timeScore = this.calculateTimeDecayScore(contact.createdAt, interactions);

    // Calculate total score (0-100)
    factors.totalScore = Math.max(
      0,
      Math.min(
        100,
        factors.baseScore +
          factors.engagementScore +
          factors.projectValueScore +
          factors.urgencyScore +
          factors.sourceScore -
          Math.abs(factors.timeScore)
      )
    );

    // Determine temperature based on score
    const temperature = this.determineTemperature(factors.totalScore);

    // Generate recommendations
    if (factors.baseScore < 15) {
      recommendations.push('Collect more contact information (phone, address)');
    }
    if (factors.engagementScore < 10 && interactions.length === 0) {
      recommendations.push('Schedule initial contact call');
      autoActions.push('SEND_WELCOME_EMAIL');
    }
    if (factors.engagementScore > 20) {
      recommendations.push('High engagement - prioritize for follow-up');
      autoActions.push('ASSIGN_TO_SALES_REP');
    }
    if (factors.urgencyScore >= 12) {
      recommendations.push('URGENT: Contact within 1 hour - emergency service needed');
      autoActions.push('SEND_SMS_ALERT');
      autoActions.push('ESCALATE_TO_MANAGER');
    }
    if (factors.projectValueScore >= 20) {
      recommendations.push('High-value opportunity - involve senior team member');
    }
    if (factors.timeScore < -15) {
      recommendations.push('Lead is going cold - re-engagement campaign needed');
      autoActions.push('TRIGGER_REENGAGEMENT_EMAIL');
    }
    if (temperature === 'hot' && !opportunities.some(o => o.stage === 'proposal_sent')) {
      recommendations.push('Send project proposal ASAP');
      autoActions.push('GENERATE_PROPOSAL_TEMPLATE');
    }

    return {
      score: Math.round(factors.totalScore),
      temperature,
      factors,
      recommendations,
      autoActions,
    };
  }

  /**
   * Calculate score based on contact completeness
   */
  private calculateCompletenessScore(contact: Contact): number {
    let score = 5; // Base for existing contact

    if (contact.email) score += 3;
    if (contact.phone) score += 4;
    if (contact.company) score += 2;
    if (contact.address && contact.city && contact.state) score += 3;
    if (contact.notes && contact.notes.length > 20) score += 3;

    return Math.min(20, score);
  }

  /**
   * Calculate engagement score based on interactions
   */
  private calculateEngagementScore(interactions: Interaction[]): number {
    if (interactions.length === 0) return 0;

    let score = 0;

    // Interaction count (1 point per interaction, max 10)
    score += Math.min(10, interactions.length);

    // Recent interactions (within 7 days get bonus)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentInteractions = interactions.filter(
      i => new Date(i.createdAt!) >= sevenDaysAgo
    );
    score += Math.min(10, recentInteractions.length * 2);

    // Interaction types diversity
    const types = new Set(interactions.map(i => i.type));
    score += Math.min(5, types.size);

    // Bidirectional communication bonus
    const hasInbound = interactions.some(i => i.direction === 'inbound');
    const hasOutbound = interactions.some(i => i.direction === 'outbound');
    if (hasInbound && hasOutbound) score += 5;

    return Math.min(30, score);
  }

  /**
   * Calculate score based on project value
   */
  private calculateProjectValueScore(opportunities: Opportunity[]): number {
    if (opportunities.length === 0) return 0;

    let score = 0;

    // Opportunity exists
    score += 5;

    // Total value of opportunities
    const totalValue = opportunities.reduce((sum, opp) => {
      return sum + (opp.value ? Number(opp.value) : 0);
    }, 0);

    // Value tiers
    if (totalValue >= 100000) score += 20; // $100k+
    else if (totalValue >= 50000) score += 15; // $50k-100k
    else if (totalValue >= 25000) score += 10; // $25k-50k
    else if (totalValue >= 10000) score += 5; // $10k-25k

    return Math.min(25, score);
  }

  /**
   * Calculate urgency score
   */
  private calculateUrgencyScore(opportunities: Opportunity[], contact: Contact): number {
    let score = 0;

    // Check for emergency opportunities
    const hasEmergency = opportunities.some(o => o.urgency === 'emergency');
    if (hasEmergency) return 15; // Max urgent

    const hasHigh = opportunities.some(o => o.urgency === 'high');
    if (hasHigh) score += 10;

    // Check for urgent keywords in notes
    const urgentKeywords = ['emergency', 'urgent', 'asap', 'immediately', 'damage', 'broken'];
    const notesLower = (contact.notes || '').toLowerCase();
    const hasUrgentKeyword = urgentKeywords.some(keyword => notesLower.includes(keyword));
    if (hasUrgentKeyword) score += 8;

    // Close deadline approaching
    const soonOpportunities = opportunities.filter(o => {
      if (!o.expectedCloseDate) return false;
      const closeDate = new Date(o.expectedCloseDate);
      const daysUntilClose = Math.ceil((closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilClose >= 0 && daysUntilClose <= 7;
    });
    if (soonOpportunities.length > 0) score += 7;

    return Math.min(15, score);
  }

  /**
   * Calculate score based on lead source quality
   */
  private calculateSourceScore(leadSource: string | null): number {
    const sourceScores: Record<string, number> = {
      referral: 10, // Highest quality
      partner: 9,
      existing_customer: 9,
      website: 7,
      social_media: 6,
      email_campaign: 6,
      trade_show: 5,
      cold_call: 3,
      purchased_list: 2,
      unknown: 1,
    };

    const source = (leadSource || 'unknown').toLowerCase().replace(/\s+/g, '_');
    return sourceScores[source] || 5;
  }

  /**
   * Calculate time decay (negative score for old, inactive leads)
   */
  private calculateTimeDecayScore(createdAt: Date | null, interactions: Interaction[]): number {
    if (!createdAt) return 0;

    const now = new Date();
    const created = new Date(createdAt);
    const daysSinceCreation = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

    // If there are recent interactions, reduce decay
    if (interactions.length > 0) {
      const lastInteraction = interactions.reduce((latest, current) => {
        const latestDate = new Date(latest.createdAt!);
        const currentDate = new Date(current.createdAt!);
        return currentDate > latestDate ? current : latest;
      });

      const daysSinceLastInteraction = Math.ceil(
        (now.getTime() - new Date(lastInteraction.createdAt!).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Decay based on last interaction
      if (daysSinceLastInteraction <= 7) return 0; // No decay
      if (daysSinceLastInteraction <= 14) return -3;
      if (daysSinceLastInteraction <= 30) return -8;
      if (daysSinceLastInteraction <= 60) return -15;
      return -20; // Maximum decay
    }

    // No interactions - decay based on creation date
    if (daysSinceCreation <= 7) return 0;
    if (daysSinceCreation <= 14) return -5;
    if (daysSinceCreation <= 30) return -10;
    if (daysSinceCreation <= 60) return -15;
    return -20;
  }

  /**
   * Determine temperature based on score
   */
  private determineTemperature(score: number): 'hot' | 'warm' | 'cold' {
    if (score >= 70) return 'hot';
    if (score >= 40) return 'warm';
    return 'cold';
  }

  /**
   * Detect potential duplicate contacts
   */
  detectDuplicates(contact: Contact, allContacts: Contact[]): Contact[] {
    const duplicates: Contact[] = [];

    for (const other of allContacts) {
      if (other.id === contact.id) continue;

      let matchScore = 0;

      // Email match (strong indicator)
      if (contact.email && other.email && contact.email.toLowerCase() === other.email.toLowerCase()) {
        matchScore += 50;
      }

      // Phone match (strong indicator)
      if (contact.phone && other.phone) {
        const cleanPhone1 = contact.phone.replace(/\D/g, '');
        const cleanPhone2 = other.phone.replace(/\D/g, '');
        if (cleanPhone1 === cleanPhone2) {
          matchScore += 40;
        }
      }

      // Name similarity
      const name1 = `${contact.firstName} ${contact.lastName}`.toLowerCase();
      const name2 = `${other.firstName} ${other.lastName}`.toLowerCase();
      if (name1 === name2) {
        matchScore += 30;
      } else if (this.isSimilar(name1, name2)) {
        matchScore += 15;
      }

      // Address similarity
      if (contact.address && other.address && this.isSimilar(contact.address, other.address)) {
        matchScore += 10;
      }

      // Consider it a duplicate if match score >= 60
      if (matchScore >= 60) {
        duplicates.push(other);
      }
    }

    return duplicates;
  }

  /**
   * Simple string similarity check (Levenshtein distance)
   */
  private isSimilar(str1: string, str2: string): boolean {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return true;

    const distance = this.levenshteinDistance(longer, shorter);
    const similarity = (longer.length - distance) / longer.length;

    return similarity >= 0.8; // 80% similar
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

export const leadScoringService = new LeadScoringService();
