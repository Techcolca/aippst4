import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { IStorage } from './storage';
import { 
  User, InsertUser, Integration, InsertIntegration, 
  Conversation, InsertConversation, Message, InsertMessage,
  Automation, InsertAutomation, Settings, InsertSettings,
  SiteContent, InsertSiteContent,
  users, integrations, conversations, messages, automations, settings, sitesContent
} from "@shared/schema";
import { eq, and, inArray } from 'drizzle-orm';

// Initialize PostgreSQL client
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString as string);
const db = drizzle(client);

export class PgStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser & { apiKey: string }): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Integration methods
  async getIntegrations(userId: number): Promise<Integration[]> {
    return await db.select().from(integrations).where(eq(integrations.userId, userId));
  }

  async getIntegration(id: number): Promise<Integration | undefined> {
    const result = await db.select().from(integrations).where(eq(integrations.id, id)).limit(1);
    return result[0];
  }

  async getIntegrationByApiKey(apiKey: string): Promise<Integration | undefined> {
    const result = await db.select().from(integrations).where(eq(integrations.apiKey, apiKey)).limit(1);
    return result[0];
  }

  async createIntegration(integration: InsertIntegration & { apiKey: string }): Promise<Integration> {
    const result = await db.insert(integrations).values(integration).returning();
    return result[0];
  }

  async updateIntegration(id: number, data: Partial<Integration>): Promise<Integration> {
    const result = await db.update(integrations).set(data).where(eq(integrations.id, id)).returning();
    return result[0];
  }

  async incrementVisitorCount(id: number): Promise<void> {
    const integration = await this.getIntegration(id);
    if (integration && integration.visitorCount !== null) {
      await db.update(integrations)
        .set({ visitorCount: (integration.visitorCount || 0) + 1 })
        .where(eq(integrations.id, id));
    }
  }

  // Conversation methods
  async getConversations(integrationId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.integrationId, integrationId));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return result[0];
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async updateConversation(id: number, data: Partial<Conversation>): Promise<Conversation> {
    const now = new Date();
    const result = await db.update(conversations)
      .set({ ...data, updatedAt: now })
      .where(eq(conversations.id, id))
      .returning();
    return result[0];
  }

  // Message methods
  async getMessages(conversationId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId));
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  // Automation methods
  async getAutomations(userId: number): Promise<Automation[]> {
    return await db.select().from(automations).where(eq(automations.userId, userId));
  }

  async getAutomation(id: number): Promise<Automation | undefined> {
    const result = await db.select().from(automations).where(eq(automations.id, id)).limit(1);
    return result[0];
  }

  async createAutomation(automation: InsertAutomation): Promise<Automation> {
    const result = await db.insert(automations).values(automation).returning();
    return result[0];
  }

  async updateAutomation(id: number, data: Partial<Automation>): Promise<Automation> {
    const now = new Date();
    const result = await db.update(automations)
      .set({ ...data, lastModified: now })
      .where(eq(automations.id, id))
      .returning();
    return result[0];
  }

  // Settings methods
  async getSettings(userId: number): Promise<Settings> {
    const result = await db.select().from(settings).where(eq(settings.userId, userId)).limit(1);
    if (result[0]) {
      return result[0];
    }
    // If settings don't exist, create default settings
    return this.createSettings({ userId });
  }

  async updateSettings(userId: number, data: Partial<Settings>): Promise<Settings> {
    // First, ensure settings exist
    await this.getSettings(userId);
    
    // Then update
    const result = await db.update(settings)
      .set(data)
      .where(eq(settings.userId, userId))
      .returning();
    return result[0];
  }

  async createSettings(settingsData: { userId: number }): Promise<Settings> {
    // Create with defaults from schema
    const result = await db.insert(settings)
      .values(settingsData)
      .returning();
    return result[0];
  }

  // Site content methods
  async getSiteContent(integrationId: number): Promise<SiteContent[]> {
    return await db.select()
      .from(sitesContent)
      .where(eq(sitesContent.integrationId, integrationId));
  }

  async getSiteContentByUrl(integrationId: number, url: string): Promise<SiteContent | undefined> {
    const result = await db.select()
      .from(sitesContent)
      .where(
        and(
          eq(sitesContent.integrationId, integrationId),
          eq(sitesContent.url, url)
        )
      )
      .limit(1);
    return result[0];
  }

  async createSiteContent(content: InsertSiteContent): Promise<SiteContent> {
    const result = await db.insert(sitesContent)
      .values(content)
      .returning();
    return result[0];
  }

  async updateSiteContent(id: number, data: Partial<SiteContent>): Promise<SiteContent> {
    const now = new Date();
    const result = await db.update(sitesContent)
      .set({ ...data, lastUpdated: now })
      .where(eq(sitesContent.id, id))
      .returning();
    return result[0];
  }

  async deleteSiteContent(id: number): Promise<void> {
    await db.delete(sitesContent)
      .where(eq(sitesContent.id, id));
  }

  // Dashboard methods
  async getDashboardStats(userId: number): Promise<{
    totalConversations: number;
    resolutionRate: number;
    averageResponseTime: number;
  }> {
    // Get all integrations for user
    const userIntegrations = await this.getIntegrations(userId);
    const integrationIds = userIntegrations.map(integration => integration.id);
    
    // Return defaults if no integrations
    if (integrationIds.length === 0) {
      return {
        totalConversations: 0,
        resolutionRate: 0,
        averageResponseTime: 0
      };
    }
    
    // Count all conversations
    const allConversations = await db.select()
      .from(conversations)
      .where(inArray(conversations.integrationId, integrationIds));
    
    const totalConversations = allConversations.length;
    
    // Count resolved conversations
    const resolvedConversations = allConversations.filter(
      conversation => conversation.resolved === true
    ).length;
    
    // Calculate resolution rate
    const resolutionRate = totalConversations > 0 
      ? (resolvedConversations / totalConversations) * 100 
      : 0;
    
    // Calculate average duration (response time)
    const totalDuration = allConversations.reduce(
      (sum, conversation) => sum + (conversation.duration || 0), 
      0
    );
    
    const averageResponseTime = totalConversations > 0 
      ? totalDuration / totalConversations 
      : 0;
    
    return {
      totalConversations,
      resolutionRate,
      averageResponseTime
    };
  }
}