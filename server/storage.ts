import { 
  User, InsertUser, Integration, InsertIntegration, 
  Conversation, InsertConversation, Message, InsertMessage,
  Automation, InsertAutomation, Settings, InsertSettings,
  SiteContent, InsertSiteContent
} from "@shared/schema";
import { generateApiKey } from "./lib/utils";

// Interface for storage methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { apiKey: string }): Promise<User>;

  // Integration methods
  getIntegrations(userId: number): Promise<Integration[]>;
  getIntegration(id: number): Promise<Integration | undefined>;
  getIntegrationByApiKey(apiKey: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration & { apiKey: string }): Promise<Integration>;
  updateIntegration(id: number, data: Partial<Integration>): Promise<Integration>;
  incrementVisitorCount(id: number): Promise<void>;

  // Conversation methods
  getConversations(integrationId: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, data: Partial<Conversation>): Promise<Conversation>;

  // Message methods
  getMessages(conversationId: number): Promise<Message[]>;
  getConversationMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Automation methods
  getAutomations(userId: number): Promise<Automation[]>;
  getAutomation(id: number): Promise<Automation | undefined>;
  createAutomation(automation: InsertAutomation): Promise<Automation>;
  updateAutomation(id: number, data: Partial<Automation>): Promise<Automation>;

  // Settings methods
  getSettings(userId: number): Promise<Settings>;
  updateSettings(userId: number, data: Partial<Settings>): Promise<Settings>;
  createSettings(settings: { userId: number }): Promise<Settings>;

  // Dashboard methods
  getDashboardStats(userId: number): Promise<{
    totalConversations: number;
    resolutionRate: number;
    averageResponseTime: number;
  }>;

  // Site content methods
  getSiteContent(integrationId: number): Promise<SiteContent[]>;
  getSiteContentByUrl(integrationId: number, url: string): Promise<SiteContent | undefined>;
  createSiteContent(content: InsertSiteContent): Promise<SiteContent>;
  updateSiteContent(id: number, data: Partial<SiteContent>): Promise<SiteContent>;
  deleteSiteContent(id: number): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private integrations: Map<number, Integration>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private automations: Map<number, Automation>;
  private settings: Map<number, Settings>;
  private siteContents: Map<number, SiteContent>;

  private userIdCounter: number;
  private integrationIdCounter: number;
  private conversationIdCounter: number;
  private messageIdCounter: number;
  private automationIdCounter: number;
  private settingsIdCounter: number;
  private siteContentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.integrations = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.automations = new Map();
    this.settings = new Map();
    this.siteContents = new Map();

    this.userIdCounter = 1;
    this.integrationIdCounter = 1;
    this.conversationIdCounter = 1;
    this.messageIdCounter = 1;
    this.automationIdCounter = 1;
    this.settingsIdCounter = 1;
    this.siteContentIdCounter = 1;

    // Initialize with some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Add a demo user with the hashed password for "password123"
    const demoUser: User = {
      id: this.userIdCounter++,
      username: "demo",
      password: "$2b$10$3euPj1KDKAKEJemQaPStEOouJXRNzALZX/Kvtmvh9RyJL35MR1hky", // hashed "password123"
      email: "demo@example.com",
      fullName: "Demo User",
      apiKey: generateApiKey(),
      createdAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);

    // Add demo settings
    const demoSettings: Settings = {
      id: this.settingsIdCounter++,
      userId: demoUser.id,
      assistantName: "AIPI Assistant",
      defaultGreeting: "👋 Hi there! I'm AIPI, your AI assistant. How can I help you today?",
      showAvailability: true,
      avatarUrl: null,
      userBubbleColor: "#3B82F6",
      assistantBubbleColor: "#E5E7EB",
      font: "inter",
      conversationStyle: "professional",
      knowledgeBase: "default",
      enableLearning: true
    };
    this.settings.set(demoSettings.id, demoSettings);

    // Add demo integrations
    const demoIntegration1: Integration = {
      id: this.integrationIdCounter++,
      userId: demoUser.id,
      name: "Main Company Website",
      url: "www.example.com",
      apiKey: generateApiKey(),
      themeColor: "#3B82F6",
      position: "bottom-right",
      active: true,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      visitorCount: 2845
    };
    this.integrations.set(demoIntegration1.id, demoIntegration1);

    const demoIntegration2: Integration = {
      id: this.integrationIdCounter++,
      userId: demoUser.id,
      name: "Support Portal",
      url: "support.example.com",
      apiKey: generateApiKey(),
      themeColor: "#3B82F6",
      position: "bottom-right",
      active: true,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      visitorCount: 5231
    };
    this.integrations.set(demoIntegration2.id, demoIntegration2);

    // Add demo automations
    const demoAutomation1: Automation = {
      id: this.automationIdCounter++,
      userId: demoUser.id,
      name: "Customer Inquiry Response",
      description: "Automates responses to common customer questions",
      status: "active",
      config: { 
        triggers: ["pricing", "features", "support"],
        responses: {
          pricing: "Our pricing starts at $29/month. Would you like to see our full pricing details?",
          features: "AIPI offers conversational AI, task automation, real-time assistance, and seamless website integration.",
          support: "Our support team is available 24/7. You can reach them at support@example.com."
        }
      },
      processedCount: 328,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    };
    this.automations.set(demoAutomation1.id, demoAutomation1);

    const demoAutomation2: Automation = {
      id: this.automationIdCounter++,
      userId: demoUser.id,
      name: "Lead Qualification",
      description: "Qualifies leads based on conversation patterns",
      status: "active",
      config: {
        qualificationCriteria: ["budget", "timeline", "authority"],
        scoreThreshold: 7
      },
      processedCount: 142,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    };
    this.automations.set(demoAutomation2.id, demoAutomation2);

    const demoAutomation3: Automation = {
      id: this.automationIdCounter++,
      userId: demoUser.id,
      name: "Appointment Scheduling",
      description: "Handles calendar scheduling through conversation",
      status: "in_testing",
      config: {
        calendarIntegration: "google_calendar",
        availableSlots: ["morning", "afternoon", "evening"],
        confirmationRequired: true
      },
      processedCount: 27,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    };
    this.automations.set(demoAutomation3.id, demoAutomation3);

    // Add some demo conversations and messages
    const demoConversation1: Conversation = {
      id: this.conversationIdCounter++,
      integrationId: demoIntegration1.id,
      visitorId: "visitor123",
      resolved: true,
      duration: 222, // 3m 42s
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.conversations.set(demoConversation1.id, demoConversation1);

    const demoConversation2: Conversation = {
      id: this.conversationIdCounter++,
      integrationId: demoIntegration2.id,
      visitorId: "visitor456",
      resolved: false,
      duration: 495, // 8m 15s
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    };
    this.conversations.set(demoConversation2.id, demoConversation2);

    const demoConversation3: Conversation = {
      id: this.conversationIdCounter++,
      integrationId: demoIntegration1.id,
      visitorId: "visitor789",
      resolved: true,
      duration: 290, // 4m 50s
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    };
    this.conversations.set(demoConversation3.id, demoConversation3);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser & { apiKey: string }): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // Integration methods
  async getIntegrations(userId: number): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(
      (integration) => integration.userId === userId
    );
  }

  async getIntegration(id: number): Promise<Integration | undefined> {
    return this.integrations.get(id);
  }

  async getIntegrationByApiKey(apiKey: string): Promise<Integration | undefined> {
    return Array.from(this.integrations.values()).find(
      (integration) => integration.apiKey === apiKey
    );
  }

  async createIntegration(integration: InsertIntegration & { apiKey: string }): Promise<Integration> {
    const id = this.integrationIdCounter++;
    const newIntegration: Integration = {
      ...integration,
      id,
      active: true,
      createdAt: new Date(),
      visitorCount: 0
    };
    this.integrations.set(id, newIntegration);
    return newIntegration;
  }

  async updateIntegration(id: number, data: Partial<Integration>): Promise<Integration> {
    const integration = this.integrations.get(id);
    if (!integration) {
      throw new Error(`Integration with id ${id} not found`);
    }

    const updatedIntegration = { ...integration, ...data };
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async incrementVisitorCount(id: number): Promise<void> {
    const integration = this.integrations.get(id);
    if (integration) {
      integration.visitorCount += 1;
      this.integrations.set(id, integration);
    }
  }

  // Conversation methods
  async getConversations(integrationId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.integrationId === integrationId
    );
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.conversationIdCounter++;
    const now = new Date();
    const newConversation: Conversation = {
      ...conversation,
      id,
      resolved: false,
      duration: 0,
      createdAt: now,
      updatedAt: now
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversation(id: number, data: Partial<Conversation>): Promise<Conversation> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error(`Conversation with id ${id} not found`);
    }

    const updatedConversation = { 
      ...conversation, 
      ...data, 
      updatedAt: new Date() 
    };
    this.conversations.set(id, updatedConversation);
    return updatedConversation;
  }

  // Message methods
  async getMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.conversationId === conversationId
    );
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  // Automation methods
  async getAutomations(userId: number): Promise<Automation[]> {
    return Array.from(this.automations.values()).filter(
      (automation) => automation.userId === userId
    );
  }

  async getAutomation(id: number): Promise<Automation | undefined> {
    return this.automations.get(id);
  }

  async createAutomation(automation: InsertAutomation): Promise<Automation> {
    const id = this.automationIdCounter++;
    const now = new Date();
    const newAutomation: Automation = {
      ...automation,
      id,
      processedCount: 0,
      createdAt: now,
      lastModified: now
    };
    this.automations.set(id, newAutomation);
    return newAutomation;
  }

  async updateAutomation(id: number, data: Partial<Automation>): Promise<Automation> {
    const automation = this.automations.get(id);
    if (!automation) {
      throw new Error(`Automation with id ${id} not found`);
    }

    const updatedAutomation = { 
      ...automation, 
      ...data, 
      lastModified: new Date() 
    };
    this.automations.set(id, updatedAutomation);
    return updatedAutomation;
  }

  // Settings methods
  async getSettings(userId: number): Promise<Settings> {
    const userSettings = Array.from(this.settings.values()).find(
      (setting) => setting.userId === userId
    );

    if (userSettings) {
      return userSettings;
    }

    // If no settings exist for user, create default settings
    return this.createSettings({ userId });
  }

  async updateSettings(userId: number, data: Partial<Settings>): Promise<Settings> {
    const userSettings = await this.getSettings(userId);
    
    const updatedSettings = { ...userSettings, ...data };
    this.settings.set(userSettings.id, updatedSettings);
    return updatedSettings;
  }

  async createSettings(settings: { userId: number }): Promise<Settings> {
    const id = this.settingsIdCounter++;
    const newSettings: Settings = {
      id,
      userId: settings.userId,
      assistantName: "AIPI Assistant",
      defaultGreeting: "👋 Hi there! I'm AIPI, your AI assistant. How can I help you today?",
      showAvailability: true,
      avatarUrl: null,
      userBubbleColor: "#3B82F6",
      assistantBubbleColor: "#E5E7EB",
      font: "inter",
      conversationStyle: "professional",
      knowledgeBase: "default",
      enableLearning: true
    };
    this.settings.set(id, newSettings);
    return newSettings;
  }

  // Site content methods
  async getSiteContent(integrationId: number): Promise<SiteContent[]> {
    return Array.from(this.siteContents.values())
      .filter(content => content.integrationId === integrationId);
  }

  async getSiteContentByUrl(integrationId: number, url: string): Promise<SiteContent | undefined> {
    return Array.from(this.siteContents.values())
      .find(content => content.integrationId === integrationId && content.url === url);
  }

  async createSiteContent(content: InsertSiteContent): Promise<SiteContent> {
    const id = this.siteContentIdCounter++;
    const now = new Date();
    
    const newContent: SiteContent = {
      ...content,
      id,
      lastUpdated: now,
      createdAt: now
    };
    
    this.siteContents.set(id, newContent);
    return newContent;
  }

  async updateSiteContent(id: number, data: Partial<SiteContent>): Promise<SiteContent> {
    const content = this.siteContents.get(id);
    if (!content) {
      throw new Error(`Site content with id ${id} not found`);
    }

    const updatedContent = {
      ...content,
      ...data,
      lastUpdated: new Date()
    };
    
    this.siteContents.set(id, updatedContent);
    return updatedContent;
  }

  async deleteSiteContent(id: number): Promise<void> {
    this.siteContents.delete(id);
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
    
    // Get all conversations for these integrations
    const allConversations = Array.from(this.conversations.values()).filter(
      conversation => integrationIds.includes(conversation.integrationId)
    );
    
    // Calculate stats
    const totalConversations = allConversations.length;
    
    const resolvedConversations = allConversations.filter(
      conversation => conversation.resolved
    ).length;
    
    const resolutionRate = totalConversations > 0 
      ? (resolvedConversations / totalConversations) * 100 
      : 0;
    
    const totalDuration = allConversations.reduce(
      (sum, conversation) => sum + conversation.duration, 
      0
    );
    
    const averageResponseTime = totalConversations > 0 
      ? totalDuration / totalConversations / 60 // Convert to seconds
      : 0;
    
    return {
      totalConversations,
      resolutionRate,
      averageResponseTime
    };
  }
}

// Import PgStorage implementation
import { PgStorage } from './pg-storage';

// Use PostgreSQL storage instead of in-memory storage
export const storage = new PgStorage();
