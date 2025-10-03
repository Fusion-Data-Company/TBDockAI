import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertContactSchema, 
  insertOpportunitySchema, 
  insertTaskSchema, 
  insertInteractionSchema,
  insertProjectSchema,
  insertDocumentSchema,
  insertMarketingCampaignSchema,
  insertAIContentGenerationSchema 
} from "@shared/schema";
import { openRouterService } from "./services/openRouter";
import { agentService } from "./services/agents";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard API
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Contacts API
  app.get("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.put("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.updateContact(id, validatedData);
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  // Projects API
  app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Opportunities API (Sales Pipeline)
  app.get("/api/opportunities", isAuthenticated, async (req, res) => {
    try {
      const opportunities = await storage.getOpportunities();
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  app.post("/api/opportunities", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(validatedData);
      res.json(opportunity);
    } catch (error) {
      console.error("Error creating opportunity:", error);
      res.status(500).json({ message: "Failed to create opportunity" });
    }
  });

  app.put("/api/opportunities/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.updateOpportunity(id, validatedData);
      res.json(opportunity);
    } catch (error) {
      console.error("Error updating opportunity:", error);
      res.status(500).json({ message: "Failed to update opportunity" });
    }
  });

  // Tasks API
  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Interactions API
  app.post("/api/interactions", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertInteractionSchema.parse(req.body);
      const interaction = await storage.createInteraction(validatedData);
      res.json(interaction);
    } catch (error) {
      console.error("Error creating interaction:", error);
      res.status(500).json({ message: "Failed to create interaction" });
    }
  });

  // AI Agents API
  app.post("/api/ai/generate-content", isAuthenticated, async (req, res) => {
    try {
      const { agentType, prompt, contentType, metadata } = req.body;
      
      if (!agentType || !prompt) {
        return res.status(400).json({ message: "Agent type and prompt are required" });
      }

      const result = await agentService.generateContent(agentType, prompt, contentType, metadata);
      
      // Save to database
      const contentGeneration = await storage.createAIContentGeneration({
        agentType,
        contentType: contentType || 'text',
        prompt,
        generatedContent: result.content,
        model: result.model,
        status: 'draft',
        title: result.title,
        metadata: result.metadata,
      });

      res.json({
        id: contentGeneration.id,
        content: result.content,
        title: result.title,
        metadata: result.metadata,
        model: result.model
      });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  app.get("/api/ai/content", isAuthenticated, async (req, res) => {
    try {
      const { agentType, status, limit } = req.query;
      const content = await storage.getAIContentGenerations(
        agentType as string,
        status as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(content);
    } catch (error) {
      console.error("Error fetching AI content:", error);
      res.status(500).json({ message: "Failed to fetch AI content" });
    }
  });

  app.put("/api/ai/content/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, title, generatedContent, publishedAt } = req.body;
      
      const content = await storage.updateAIContentGeneration(id, {
        status,
        title,
        generatedContent,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined
      });
      
      res.json(content);
    } catch (error) {
      console.error("Error updating AI content:", error);
      res.status(500).json({ message: "Failed to update AI content" });
    }
  });

  // Lead capture API (for website integration)
  app.post("/api/leads/capture", async (req, res) => {
    try {
      const { firstName, lastName, email, phone, projectType, message, leadSource } = req.body;
      
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "First name, last name, and email are required" });
      }

      // Create contact
      const contact = await storage.createContact({
        firstName,
        lastName,
        email,
        phone: phone || null,
        notes: message || null,
        leadSource: leadSource || 'website',
        leadTemperature: 'warm',
        leadScore: 50,
      });

      // Create opportunity if project type is specified
      if (projectType) {
        await storage.createOpportunity({
          contactId: contact.id,
          name: `${projectType} - ${firstName} ${lastName}`,
          stage: 'new_lead',
          probability: 25,
          urgency: message && message.toLowerCase().includes('emergency') ? 'emergency' : 'normal',
        });
      }

      // Log interaction
      await storage.createInteraction({
        contactId: contact.id,
        type: 'web_form',
        subject: 'Lead form submission',
        content: message || 'Contact form submitted via website',
        direction: 'inbound',
      });

      res.json({ success: true, contactId: contact.id });
    } catch (error) {
      console.error("Error capturing lead:", error);
      res.status(500).json({ message: "Failed to capture lead" });
    }
  });

  // Marketing campaigns API
  app.get("/api/marketing/campaigns", isAuthenticated, async (req, res) => {
    try {
      const campaigns = await storage.getMarketingCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/marketing/campaigns", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMarketingCampaignSchema.parse(req.body);
      const campaign = await storage.createMarketingCampaign(validatedData);
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Analytics API
  app.get("/api/analytics/lead-sources", isAuthenticated, async (req, res) => {
    try {
      const leadSources = await storage.getLeadSourceAnalytics();
      res.json(leadSources);
    } catch (error) {
      console.error("Error fetching lead source analytics:", error);
      res.status(500).json({ message: "Failed to fetch lead source analytics" });
    }
  });

  app.get("/api/analytics/pipeline", isAuthenticated, async (req, res) => {
    try {
      const pipelineData = await storage.getPipelineAnalytics();
      res.json(pipelineData);
    } catch (error) {
      console.error("Error fetching pipeline analytics:", error);
      res.status(500).json({ message: "Failed to fetch pipeline analytics" });
    }
  });

  app.get("/api/analytics/performance", isAuthenticated, async (req, res) => {
    try {
      const performance = await storage.getPerformanceAnalytics();
      res.json(performance);
    } catch (error) {
      console.error("Error fetching performance analytics:", error);
      res.status(500).json({ message: "Failed to fetch performance analytics" });
    }
  });

  // Document upload API
  app.post("/api/documents/upload", isAuthenticated, async (req: any, res) => {
    try {
      // File upload using multipart/form-data will be handled by multer middleware
      // For now, we'll accept base64 encoded files in JSON
      const { fileName, fileData, mimeType, projectId, opportunityId, documentType } = req.body;

      if (!fileName || !fileData) {
        return res.status(400).json({ message: "File name and data are required" });
      }

      // Decode base64
      const buffer = Buffer.from(fileData, 'base64');

      // Upload to storage
      const { storageService } = await import('./services/storage');
      const uploadedFile = await storageService.uploadFile(buffer, fileName, mimeType || 'application/octet-stream');

      // Create document record
      const document = await storage.createDocument({
        projectId: projectId || null,
        opportunityId: opportunityId || null,
        name: fileName,
        type: documentType || 'general',
        filePath: uploadedFile.url,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimeType,
        version: 1,
        isActive: true,
        uploadedBy: req.user.claims.sub,
      });

      res.json({
        success: true,
        document,
        file: {
          url: uploadedFile.url,
          filename: uploadedFile.filename,
          size: uploadedFile.size
        }
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      const { projectId, opportunityId, type } = req.query;
      const documents = await storage.getDocuments(
        projectId ? parseInt(projectId as string) : undefined,
        opportunityId ? parseInt(opportunityId as string) : undefined,
        type as string
      );
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.delete("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocumentById(id);

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete from storage
      const { storageService } = await import('./services/storage');
      const filename = document.filePath?.split('/').pop();
      if (filename) {
        await storageService.deleteFile(filename);
      }

      // Delete from database
      await storage.deleteDocument(id);

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Lead scoring and automation API
  app.post("/api/leads/score/:id", isAuthenticated, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContactById(contactId);

      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      const interactions = await storage.getInteractionsByContact(contactId);
      const opportunities = await storage.getOpportunitiesByContact(contactId);

      const { leadScoringService } = await import('./services/leadScoring');
      const scoringResult = leadScoringService.calculateLeadScore(contact, interactions, opportunities);

      // Update contact with new score and temperature
      await storage.updateContact(contactId, {
        leadScore: scoringResult.score,
        leadTemperature: scoringResult.temperature,
      });

      res.json(scoringResult);
    } catch (error) {
      console.error("Error scoring lead:", error);
      res.status(500).json({ message: "Failed to score lead" });
    }
  });

  app.post("/api/leads/score-all", isAuthenticated, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      const results = [];

      const { leadScoringService } = await import('./services/leadScoring');

      for (const contact of contacts) {
        const interactions = await storage.getInteractionsByContact(contact.id);
        const opportunities = await storage.getOpportunitiesByContact(contact.id);
        const scoringResult = leadScoringService.calculateLeadScore(contact, interactions, opportunities);

        await storage.updateContact(contact.id, {
          leadScore: scoringResult.score,
          leadTemperature: scoringResult.temperature,
        });

        results.push({
          contactId: contact.id,
          name: `${contact.firstName} ${contact.lastName}`,
          score: scoringResult.score,
          temperature: scoringResult.temperature,
        });
      }

      res.json({ success: true, scoredCount: results.length, results });
    } catch (error) {
      console.error("Error scoring all leads:", error);
      res.status(500).json({ message: "Failed to score leads" });
    }
  });

  app.get("/api/leads/duplicates/:id", isAuthenticated, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContactById(contactId);

      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      const allContacts = await storage.getContacts();
      const { leadScoringService } = await import('./services/leadScoring');
      const duplicates = leadScoringService.detectDuplicates(contact, allContacts);

      res.json({ duplicates, count: duplicates.length });
    } catch (error) {
      console.error("Error detecting duplicates:", error);
      res.status(500).json({ message: "Failed to detect duplicates" });
    }
  });

  app.post("/api/leads/merge", isAuthenticated, async (req, res) => {
    try {
      const { primaryId, duplicateId } = req.body;

      if (!primaryId || !duplicateId) {
        return res.status(400).json({ message: "Primary and duplicate contact IDs are required" });
      }

      const primary = await storage.getContactById(primaryId);
      const duplicate = await storage.getContactById(duplicateId);

      if (!primary || !duplicate) {
        return res.status(404).json({ message: "Contact not found" });
      }

      // Merge data - keep primary but fill in missing fields from duplicate
      const mergedData: any = {
        email: primary.email || duplicate.email,
        phone: primary.phone || duplicate.phone,
        company: primary.company || duplicate.company,
        address: primary.address || duplicate.address,
        city: primary.city || duplicate.city,
        state: primary.state || duplicate.state,
        zipCode: primary.zipCode || duplicate.zipCode,
        notes: [primary.notes, duplicate.notes].filter(Boolean).join('\n\n---MERGED---\n\n'),
        leadScore: Math.max(primary.leadScore || 0, duplicate.leadScore || 0),
      };

      // Update primary contact
      await storage.updateContact(primaryId, mergedData);

      // Transfer opportunities and interactions from duplicate to primary
      const duplicateOpportunities = await storage.getOpportunitiesByContact(duplicateId);
      for (const opp of duplicateOpportunities) {
        await storage.updateOpportunity(opp.id, { contactId: primaryId });
      }

      const duplicateInteractions = await storage.getInteractionsByContact(duplicateId);
      for (const interaction of duplicateInteractions) {
        await storage.updateInteraction(interaction.id, { contactId: primaryId });
      }

      // Mark duplicate as merged (soft delete by adding note)
      await storage.updateContact(duplicateId, {
        notes: `MERGED INTO CONTACT #${primaryId} - ${duplicate.notes || ''}`,
        leadScore: 0,
      });

      res.json({ success: true, mergedInto: primaryId });
    } catch (error) {
      console.error("Error merging contacts:", error);
      res.status(500).json({ message: "Failed to merge contacts" });
    }
  });

  // Serve uploaded files
  const express_static = await import('express');
  const { storageService } = await import('./services/storage');
  app.use('/uploads', express_static.default.static(storageService.getUploadDir()));

  const httpServer = createServer(app);
  return httpServer;
}
