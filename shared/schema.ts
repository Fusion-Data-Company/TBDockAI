import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contacts table - stores all contact information
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  company: varchar("company", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 10 }),
  notes: text("notes"),
  leadSource: varchar("lead_source", { length: 100 }),
  leadScore: integer("lead_score").default(0),
  leadTemperature: varchar("lead_temperature", { length: 10 }).default('cold'), // hot, warm, cold
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table - stores all project information
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  projectType: varchar("project_type", { length: 100 }), // new_dock, rebuild, repair, etc.
  status: varchar("status", { length: 50 }).default('planning'), // planning, in_progress, completed, cancelled
  priority: varchar("priority", { length: 20 }).default('normal'), // high, normal, low
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  actualValue: decimal("actual_value", { precision: 10, scale: 2 }),
  estimatedStartDate: timestamp("estimated_start_date"),
  actualStartDate: timestamp("actual_start_date"),
  estimatedEndDate: timestamp("estimated_end_date"),
  actualEndDate: timestamp("actual_end_date"),
  location: text("location"),
  lakeArea: varchar("lake_area", { length: 100 }), // Coeur d'Alene, Hayden, etc.
  materials: text("materials").array(),
  specialRequirements: text("special_requirements"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Opportunities table - tracks sales pipeline
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id),
  projectId: integer("project_id").references(() => projects.id),
  name: varchar("name", { length: 255 }).notNull(),
  stage: varchar("stage", { length: 50 }).default('new_lead'), // new_lead, qualification, proposal_sent, negotiation, closed_won, closed_lost
  probability: integer("probability").default(0), // 0-100
  value: decimal("value", { precision: 10, scale: 2 }),
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  lostReason: text("lost_reason"),
  nextAction: text("next_action"),
  nextActionDate: timestamp("next_action_date"),
  urgency: varchar("urgency", { length: 20 }).default('normal'), // emergency, high, normal, low
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table - stores follow-up tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id),
  opportunityId: integer("opportunity_id").references(() => opportunities.id),
  projectId: integer("project_id").references(() => projects.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }), // call, email, meeting, follow_up, etc.
  status: varchar("status", { length: 20 }).default('pending'), // pending, completed, cancelled
  priority: varchar("priority", { length: 20 }).default('normal'),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interactions table - logs all interactions
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id),
  opportunityId: integer("opportunity_id").references(() => opportunities.id),
  type: varchar("type", { length: 50 }).notNull(), // call, email, meeting, note, etc.
  subject: varchar("subject", { length: 255 }),
  content: text("content"),
  direction: varchar("direction", { length: 10 }), // inbound, outbound
  duration: integer("duration"), // minutes
  outcome: text("outcome"),
  nextSteps: text("next_steps"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents table - stores project documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  opportunityId: integer("opportunity_id").references(() => opportunities.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }), // estimate, drawing, permit, contract, etc.
  filePath: text("file_path"),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  version: integer("version").default(1),
  isActive: boolean("is_active").default(true),
  uploadedBy: varchar("uploaded_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketing campaigns table
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }), // email, sms, social, blog
  status: varchar("status", { length: 20 }).default('draft'), // draft, scheduled, sent, completed
  subject: varchar("subject", { length: 255 }),
  content: text("content"),
  targetAudience: text("target_audience"),
  scheduledDate: timestamp("scheduled_date"),
  sentDate: timestamp("sent_date"),
  openRate: decimal("open_rate", { precision: 5, scale: 2 }),
  clickRate: decimal("click_rate", { precision: 5, scale: 2 }),
  responseRate: decimal("response_rate", { precision: 5, scale: 2 }),
  generatedByAI: boolean("generated_by_ai").default(false),
  aiAgent: varchar("ai_agent", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI content generations table
export const aiContentGenerations = pgTable("ai_content_generations", {
  id: serial("id").primaryKey(),
  agentType: varchar("agent_type", { length: 50 }).notNull(), // blog, newsletter, social, capo
  contentType: varchar("content_type", { length: 50 }), // article, post, email, etc.
  prompt: text("prompt"),
  generatedContent: text("generated_content"),
  model: varchar("model", { length: 200 }),
  status: varchar("status", { length: 20 }).default('draft'), // draft, reviewed, published
  title: text("title"),
  metadata: jsonb("metadata"), // Additional data like hashtags, scheduling info, etc.
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Social media scheduled posts table
export const socialMediaPosts = pgTable("social_media_posts", {
  id: serial("id").primaryKey(),
  platform: varchar("platform", { length: 50 }).notNull(), // facebook, instagram, linkedin, twitter
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  hashtags: text("hashtags").array(),
  scheduledFor: timestamp("scheduled_for"),
  status: varchar("status", { length: 20 }).default('scheduled'), // scheduled, published, failed
  publishedAt: timestamp("published_at"),
  aiContentId: integer("ai_content_id").references(() => aiContentGenerations.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const contactsRelations = relations(contacts, ({ many }) => ({
  opportunities: many(opportunities),
  tasks: many(tasks),
  interactions: many(interactions),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  opportunities: many(opportunities),
  tasks: many(tasks),
  documents: many(documents),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [opportunities.contactId],
    references: [contacts.id],
  }),
  project: one(projects, {
    fields: [opportunities.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
  interactions: many(interactions),
  documents: many(documents),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  contact: one(contacts, {
    fields: [tasks.contactId],
    references: [contacts.id],
  }),
  opportunity: one(opportunities, {
    fields: [tasks.opportunityId],
    references: [opportunities.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  contact: one(contacts, {
    fields: [interactions.contactId],
    references: [contacts.id],
  }),
  opportunity: one(opportunities, {
    fields: [interactions.opportunityId],
    references: [opportunities.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  project: one(projects, {
    fields: [documents.projectId],
    references: [projects.id],
  }),
  opportunity: one(opportunities, {
    fields: [documents.opportunityId],
    references: [opportunities.id],
  }),
}));

// Insert schemas
export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
});

export const insertAIContentGenerationSchema = createInsertSchema(aiContentGenerations).omit({
  id: true,
  createdAt: true,
});

export const insertSocialMediaPostSchema = createInsertSchema(socialMediaPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Interaction = typeof interactions.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;

export type InsertAIContentGeneration = z.infer<typeof insertAIContentGenerationSchema>;
export type AIContentGeneration = typeof aiContentGenerations.$inferSelect;

export type InsertSocialMediaPost = z.infer<typeof insertSocialMediaPostSchema>;
export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
