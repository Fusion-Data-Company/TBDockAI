import {
  users,
  contacts,
  projects,
  opportunities,
  tasks,
  interactions,
  documents,
  marketingCampaigns,
  aiContentGenerations,
  type User,
  type UpsertUser,
  type Contact,
  type InsertContact,
  type Project,
  type InsertProject,
  type Opportunity,
  type InsertOpportunity,
  type Task,
  type InsertTask,
  type Interaction,
  type InsertInteraction,
  type Document,
  type InsertDocument,
  type MarketingCampaign,
  type InsertMarketingCampaign,
  type AIContentGeneration,
  type InsertAIContentGeneration,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalLeads: number;
    pipelineValue: number;
    conversionRate: number;
    avgResponseTime: number;
    leadsGrowth: number;
    valueGrowth: number;
    conversionGrowth: number;
    responseImprovement: number;
  }>;

  // Contact operations
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;

  // Opportunity operations
  getOpportunities(): Promise<Opportunity[]>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity>;

  // Task operations
  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;

  // Interaction operations
  createInteraction(interaction: InsertInteraction): Promise<Interaction>;

  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;

  // Marketing campaign operations
  getMarketingCampaigns(): Promise<MarketingCampaign[]>;
  createMarketingCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign>;

  // AI content operations
  getAIContentGenerations(agentType?: string, status?: string, limit?: number): Promise<AIContentGeneration[]>;
  createAIContentGeneration(content: InsertAIContentGeneration): Promise<AIContentGeneration>;
  updateAIContentGeneration(id: number, content: Partial<InsertAIContentGeneration>): Promise<AIContentGeneration>;

  // Analytics operations
  getLeadSourceAnalytics(): Promise<Array<{ source: string; count: number; percentage: number }>>;
  getPipelineAnalytics(): Promise<{
    totalValue: number;
    activeCount: number;
    avgDealSize: number;
    closeRate: number;
  }>;
  getPerformanceAnalytics(): Promise<{
    avgResponseTime: number;
    conversionRate: number;
    monthlyGrowth: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Dashboard stats
  async getDashboardStats() {
    const [contactCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts);

    const [pipelineValue] = await db
      .select({ total: sql<number>`COALESCE(sum(value), 0)` })
      .from(opportunities)
      .where(and(
        eq(opportunities.stage, 'new_lead'),
        or(
          eq(opportunities.stage, 'qualification'),
          eq(opportunities.stage, 'proposal_sent'),
          eq(opportunities.stage, 'negotiation')
        )
      ));

    const [closedOpps] = await db
      .select({ 
        won: sql<number>`count(*) filter (where stage = 'closed_won')`,
        total: sql<number>`count(*)`
      })
      .from(opportunities);

    const conversionRate = closedOpps.total > 0 ? (closedOpps.won / closedOpps.total) * 100 : 0;

    return {
      totalLeads: contactCount.count || 0,
      pipelineValue: Number(pipelineValue.total) || 0,
      conversionRate: Number(conversionRate.toFixed(1)),
      avgResponseTime: 2.4, // Could be calculated from interaction timestamps
      leadsGrowth: 23, // Could be calculated by comparing to previous month
      valueGrowth: 18,
      conversionGrowth: 5.2,
      responseImprovement: -32,
    };
  }

  // Contact operations
  async getContacts(): Promise<Contact[]> {
    return db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async getContactById(id: number): Promise<Contact | undefined> {
    return this.getContact(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values({
      ...contact,
      updatedAt: new Date(),
    }).returning();
    return newContact;
  }

  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact> {
    const [updatedContact] = await db
      .update(contacts)
      .set({
        ...contact,
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact;
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values({
      ...project,
      updatedAt: new Date(),
    }).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({
        ...project,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  // Opportunity operations
  async getOpportunities(): Promise<Opportunity[]> {
    return db.select().from(opportunities).orderBy(desc(opportunities.createdAt));
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
    return opportunity;
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const [newOpportunity] = await db.insert(opportunities).values({
      ...opportunity,
      updatedAt: new Date(),
    }).returning();
    return newOpportunity;
  }

  async getOpportunitiesByContact(contactId: number): Promise<Opportunity[]> {
    return db.select().from(opportunities).where(eq(opportunities.contactId, contactId)).orderBy(desc(opportunities.createdAt));
  }

  async updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity> {
    const [updatedOpportunity] = await db
      .update(opportunities)
      .set({
        ...opportunity,
        updatedAt: new Date(),
      })
      .where(eq(opportunities.id, id))
      .returning();
    return updatedOpportunity;
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values({
      ...task,
      updatedAt: new Date(),
    }).returning();
    return newTask;
  }

  // Interaction operations
  async createInteraction(interaction: InsertInteraction): Promise<Interaction> {
    const [newInteraction] = await db.insert(interactions).values(interaction).returning();
    return newInteraction;
  }

  async getInteractionsByContact(contactId: number): Promise<Interaction[]> {
    return db.select().from(interactions).where(eq(interactions.contactId, contactId)).orderBy(desc(interactions.createdAt));
  }

  async updateInteraction(id: number, data: Partial<InsertInteraction>): Promise<Interaction> {
    const [interaction] = await db
      .update(interactions)
      .set(data)
      .where(eq(interactions.id, id))
      .returning();
    return interaction;
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  // Marketing campaign operations
  async getMarketingCampaigns(): Promise<MarketingCampaign[]> {
    return db.select().from(marketingCampaigns).orderBy(desc(marketingCampaigns.createdAt));
  }

  async createMarketingCampaign(campaign: InsertMarketingCampaign): Promise<MarketingCampaign> {
    const [newCampaign] = await db.insert(marketingCampaigns).values(campaign).returning();
    return newCampaign;
  }

  // AI content operations
  async getAIContentGenerations(agentType?: string, status?: string, limit?: number): Promise<AIContentGeneration[]> {
    let query = db.select().from(aiContentGenerations);
    
    const conditions = [];
    if (agentType) {
      conditions.push(eq(aiContentGenerations.agentType, agentType));
    }
    if (status) {
      conditions.push(eq(aiContentGenerations.status, status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(aiContentGenerations.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return query;
  }

  async createAIContentGeneration(content: InsertAIContentGeneration): Promise<AIContentGeneration> {
    const [newContent] = await db.insert(aiContentGenerations).values(content).returning();
    return newContent;
  }

  async updateAIContentGeneration(id: number, content: Partial<InsertAIContentGeneration>): Promise<AIContentGeneration> {
    const [updatedContent] = await db
      .update(aiContentGenerations)
      .set(content)
      .where(eq(aiContentGenerations.id, id))
      .returning();
    return updatedContent;
  }

  // Analytics operations
  async getLeadSourceAnalytics() {
    const results = await db
      .select({
        source: contacts.leadSource,
        count: sql<number>`count(*)`,
      })
      .from(contacts)
      .where(sql`${contacts.leadSource} IS NOT NULL`)
      .groupBy(contacts.leadSource);

    const total = results.reduce((sum, item) => sum + item.count, 0);
    
    return results.map(item => ({
      source: item.source || 'unknown',
      count: item.count,
      percentage: total > 0 ? Number(((item.count / total) * 100).toFixed(1)) : 0,
    }));
  }

  async getPipelineAnalytics() {
    const [pipelineData] = await db
      .select({
        totalValue: sql<number>`COALESCE(sum(value), 0)`,
        activeCount: sql<number>`count(*) filter (where stage NOT IN ('closed_won', 'closed_lost'))`,
        avgDealSize: sql<number>`COALESCE(avg(value), 0)`,
        wonCount: sql<number>`count(*) filter (where stage = 'closed_won')`,
        totalCount: sql<number>`count(*)`
      })
      .from(opportunities);

    const closeRate = pipelineData.totalCount > 0 
      ? Number(((pipelineData.wonCount / pipelineData.totalCount) * 100).toFixed(1))
      : 0;

    return {
      totalValue: Number(pipelineData.totalValue),
      activeCount: pipelineData.activeCount,
      avgDealSize: Number(pipelineData.avgDealSize),
      closeRate,
    };
  }

  async getPerformanceAnalytics() {
    // This would typically calculate from interaction timestamps
    // For now, returning realistic values
    return {
      avgResponseTime: 2.4,
      conversionRate: 34.8,
      monthlyGrowth: 23,
    };
  }

  // Document methods
  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(documentData)
      .returning();
    return document;
  }

  async getDocuments(projectId?: number, opportunityId?: number, type?: string): Promise<Document[]> {
    let query = db.select().from(documents).where(eq(documents.isActive, true));

    const conditions: any[] = [eq(documents.isActive, true)];

    if (projectId) {
      conditions.push(eq(documents.projectId, projectId));
    }
    if (opportunityId) {
      conditions.push(eq(documents.opportunityId, opportunityId));
    }
    if (type) {
      conditions.push(eq(documents.type, type));
    }

    return await db
      .select()
      .from(documents)
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt));
  }

  async getDocumentById(id: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return document;
  }

  async deleteDocument(id: number): Promise<void> {
    await db
      .update(documents)
      .set({ isActive: false })
      .where(eq(documents.id, id));
  }
}

export const storage = new DatabaseStorage();
