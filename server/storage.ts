import { 
  User, InsertUser, Integration, InsertIntegration, 
  Conversation, InsertConversation, Message, InsertMessage,
  Automation, InsertAutomation, Settings, InsertSettings,
  SiteContent, InsertSiteContent, ConversationAnalytics, IntegrationPerformance,
  TopProduct, TopTopic, Subscription, InsertSubscription,
  DiscountCode, InsertDiscountCode, PricingPlan, InsertPricingPlan,
  Form, InsertForm, FormTemplate, InsertFormTemplate, FormResponse, InsertFormResponse,
  Appointment, InsertAppointment, CalendarToken, InsertCalendarToken
} from "@shared/schema";
import { generateApiKey } from "./lib/utils";
import fs from "fs";

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
  deleteIntegration(id: number): Promise<void>;
  incrementVisitorCount(id: number): Promise<void>;

  // Conversation methods
  getConversations(integrationId: number): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, data: Partial<Conversation>): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;

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

  // Document methods
  getDocuments(integrationId: number): Promise<any[]>;
  createDocument(doc: any): Promise<any>;
  deleteDocument(id: number): Promise<void>;

  // Site content methods
  getSiteContent(integrationId: number): Promise<any[]>;
  createSiteContent(content: any): Promise<any>;
  updateSiteContent(integrationId: number, url: string, data: any): Promise<any>;

  // Dashboard methods
  getDashboardStats(userId: number): Promise<{
    totalConversations: number;
    resolutionRate: number;
    averageResponseTime: number;
  }>;
  
  // Analytics methods
  getConversationAnalytics(userId: number): Promise<ConversationAnalytics>;
  getIntegrationPerformance(userId: number): Promise<IntegrationPerformance[]>;

  // Site content methods
  getSiteContent(integrationId: number): Promise<SiteContent[]>;
  getSiteContentByUrl(integrationId: number, url: string): Promise<SiteContent | undefined>;
  createSiteContent(content: InsertSiteContent): Promise<SiteContent>;
  updateSiteContent(id: number, data: Partial<SiteContent>): Promise<SiteContent>;
  deleteSiteContent(id: number): Promise<void>;

  // Subscription methods
  getUserSubscriptions(userId: number): Promise<Subscription[]>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription>;
  incrementSubscriptionUsage(id: number): Promise<void>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: number, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User>;
  
  // Discount code methods
  getDiscountCodes(): Promise<DiscountCode[]>;
  getActiveDiscountCodes(): Promise<DiscountCode[]>;
  getDiscountCode(id: number): Promise<DiscountCode | undefined>;
  getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined>;
  createDiscountCode(data: InsertDiscountCode): Promise<DiscountCode>;
  updateDiscountCode(id: number, data: Partial<DiscountCode>): Promise<DiscountCode>;
  incrementDiscountCodeUsage(id: number): Promise<void>;
  deleteDiscountCode(id: number): Promise<void>;
  generateDiscountCode(prefix?: string): string;
  
  // Pricing plan methods
  getPricingPlans(): Promise<PricingPlan[]>;
  getAvailablePricingPlans(): Promise<PricingPlan[]>;
  getPricingPlan(id: number): Promise<PricingPlan | undefined>;
  getPricingPlanByPlanId(planId: string): Promise<PricingPlan | undefined>;
  createPricingPlan(data: InsertPricingPlan): Promise<PricingPlan>;
  updatePricingPlan(id: number, data: Partial<PricingPlan>): Promise<PricingPlan>;
  deletePricingPlan(id: number): Promise<void>;
  
  // Form methods
  getForms(userId: number): Promise<Form[]>;
  getForm(id: number): Promise<Form | undefined>;
  getFormBySlug(slug: string): Promise<Form | undefined>;
  createForm(formData: InsertForm): Promise<Form>;
  updateForm(id: number, data: Partial<Form>): Promise<Form>;
  incrementFormResponseCount(id: number): Promise<void>;
  deleteForm(id: number): Promise<void>;

  // Form Template methods
  getFormTemplates(): Promise<FormTemplate[]>;
  getDefaultFormTemplates(): Promise<FormTemplate[]>;
  getTemplatesByType(type: string): Promise<FormTemplate[]>;
  getFormTemplate(id: number): Promise<FormTemplate | undefined>;
  createFormTemplate(templateData: InsertFormTemplate): Promise<FormTemplate>;
  updateFormTemplate(id: number, data: Partial<FormTemplate>): Promise<FormTemplate>;
  deleteFormTemplate(id: number): Promise<void>;

  // Form Response methods
  getFormResponses(formId: number): Promise<FormResponse[]>;
  getFormResponse(id: number): Promise<FormResponse | undefined>;
  createFormResponse(responseData: InsertFormResponse): Promise<FormResponse>;
  deleteFormResponse(id: number): Promise<void>;
  deleteFormResponses(formId: number): Promise<void>;
  
  // Appointment methods
  getAppointments(integrationId: number): Promise<Appointment[]>;
  getAppointmentsByConversation(conversationId: number): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointmentData: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment>;
  updateCalendarEventId(id: number, calendarEventId: string, calendarProvider: string): Promise<Appointment>;
  markReminderSent(id: number): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
  getUpcomingAppointmentsForReminders(): Promise<Appointment[]>;
  
  // Calendar OAuth Token methods
  getCalendarTokens(userId: number): Promise<CalendarToken[]>;
  getCalendarToken(id: number): Promise<CalendarToken | undefined>;
  getCalendarTokenByProvider(userId: number, provider: string): Promise<CalendarToken | undefined>;
  createCalendarToken(tokenData: InsertCalendarToken): Promise<CalendarToken>;
  updateCalendarToken(id: number, data: Partial<CalendarToken>): Promise<CalendarToken>;
  deleteCalendarToken(id: number): Promise<void>;
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
  private subscriptions: Map<number, Subscription>;
  private discountCodes: Map<number, DiscountCode>;
  private pricingPlans: Map<number, PricingPlan>;
  private forms: Map<number, Form>;
  private formTemplates: Map<number, FormTemplate>;
  private formResponses: Map<number, FormResponse>;
  private appointments: Map<number, Appointment>;
  private calendarTokens: Map<number, CalendarToken>;

  private userIdCounter: number;
  private integrationIdCounter: number;
  private conversationIdCounter: number;
  private messageIdCounter: number;
  private automationIdCounter: number;
  private settingsIdCounter: number;
  private siteContentIdCounter: number;
  private subscriptionIdCounter: number;
  private discountCodeIdCounter: number;
  private pricingPlanIdCounter: number;
  private formIdCounter: number;
  private formTemplateIdCounter: number;
  private formResponseIdCounter: number;
  private appointmentIdCounter: number;
  private calendarTokenIdCounter: number;

  constructor() {
    this.users = new Map();
    this.integrations = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.automations = new Map();
    this.settings = new Map();
    this.siteContents = new Map();
    this.subscriptions = new Map();
    this.discountCodes = new Map();
    this.pricingPlans = new Map();
    this.forms = new Map();
    this.formTemplates = new Map();
    this.formResponses = new Map();
    this.appointments = new Map();
    this.calendarTokens = new Map();

    this.userIdCounter = 1;
    this.integrationIdCounter = 1;
    this.conversationIdCounter = 1;
    this.messageIdCounter = 1;
    this.automationIdCounter = 1;
    this.settingsIdCounter = 1;
    this.siteContentIdCounter = 1;
    this.subscriptionIdCounter = 1;
    this.discountCodeIdCounter = 1;
    this.pricingPlanIdCounter = 1;
    this.formIdCounter = 1;
    this.formTemplateIdCounter = 1;
    this.formResponseIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.calendarTokenIdCounter = 1;

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
      createdAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null
    };
    this.users.set(demoUser.id, demoUser);

    // Add demo settings
    const demoSettings: Settings = {
      id: this.settingsIdCounter++,
      userId: demoUser.id,
      assistantName: "AIPPS Assistant",
      defaultGreeting: "👋 Hi there! I'm AIPPS, your AI assistant. How can I help you today?",
      showAvailability: true,
      avatarUrl: null,
      userBubbleColor: "#3B82F6",
      assistantBubbleColor: "#E5E7EB",
      font: "inter",
      conversationStyle: "professional",
      knowledgeBase: "default",
      enableLearning: true,
      emailNotificationAddress: "notifications@example.com",
      welcomePageChatEnabled: true,
      welcomePageChatGreeting: "👋 ¡Hola! Soy AIPPS, tu asistente de IA. ¿En qué puedo ayudarte hoy?",
      welcomePageChatBubbleColor: "#111827",
      welcomePageChatTextColor: "#FFFFFF",
      welcomePageChatBehavior: "Sé amable, informativo y conciso al responder preguntas sobre AIPPS y sus características.",
      welcomePageChatScrapingEnabled: false,
      welcomePageChatScrapingDepth: 5,
      welcomePageChatScrapingData: null
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
      visitorCount: 2845,
      language: "es",
      botBehavior: "Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web.",
      documentsData: [],
      widgetType: "bubble",
      ignoredSections: [],
      description: null,
      ignoredSectionsText: null,
      customization: null,
      textColor: "auto"
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
      visitorCount: 5231,
      language: "es",
      botBehavior: "Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web.",
      documentsData: [],
      widgetType: "bubble",
      ignoredSections: [],
      description: null,
      ignoredSectionsText: null,
      customization: null,
      textColor: "auto"
    };
    this.integrations.set(demoIntegration2.id, demoIntegration2);

    // Update all existing integrations to include language field if missing
    for (const [id, integration] of this.integrations.entries()) {
      if (!integration.language) {
        const updatedIntegration = { ...integration, language: "es" };
        this.integrations.set(id, updatedIntegration);
      }
    }

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
          features: "AIPPS offers conversational AI, task automation, real-time assistance, and seamless website integration.",
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
      title: "Consulta sobre precios",
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
      title: "Soporte técnico",
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
      title: "Información de servicios",
      resolved: true,
      duration: 290, // 4m 50s
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    };
    this.conversations.set(demoConversation3.id, demoConversation3);
    
    // Add demo form templates
    const formTemplates = [
      {
        id: this.formTemplateIdCounter++,
        name: "Lista de Espera",
        type: "waitlist",
        description: "Formulario básico para lista de espera de productos o servicios",
        structure: {
          fields: [
            { name: "nombre", label: "Nombre", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "interes", label: "Interés", type: "select", options: ["Producto A", "Producto B", "Servicio C"], required: true }
          ],
          submitButton: "Únete a la lista de espera"
        },
        isDefault: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: this.formTemplateIdCounter++,
        name: "Contacto",
        type: "contact",
        description: "Formulario de contacto para clientes potenciales",
        structure: {
          fields: [
            { name: "nombre", label: "Nombre", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "telefono", label: "Teléfono", type: "tel", required: false },
            { name: "mensaje", label: "Mensaje", type: "textarea", required: true }
          ],
          submitButton: "Enviar mensaje"
        },
        isDefault: true,
        createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), // 29 days ago
        updatedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
      },
      {
        id: this.formTemplateIdCounter++,
        name: "Registro para Webinar",
        type: "event",
        description: "Formulario para registrarse en un webinar o evento",
        structure: {
          fields: [
            { name: "nombre", label: "Nombre completo", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "empresa", label: "Empresa", type: "text", required: false },
            { name: "cargo", label: "Cargo", type: "text", required: false },
            { name: "fechaPreferida", label: "Fecha preferida", type: "select", options: ["Martes 15:00", "Jueves 17:00", "Viernes 10:00"], required: true }
          ],
          submitButton: "Registrarse ahora"
        },
        isDefault: true,
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
        updatedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      }
    ];
    
    for (const template of formTemplates) {
      this.formTemplates.set(template.id, template as FormTemplate);
    }
    
    // Add demo forms (created from templates)
    const demoForm1: Form = {
      id: this.formIdCounter++,
      userId: demoUser.id,
      title: "Waitlist para Beta",
      slug: "waitlist-beta",
      type: "waitlist",
      published: true,
      structure: {
        fields: [
          { name: "nombre", label: "Nombre", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "empresa", label: "Empresa", type: "text", required: false },
          { name: "interes", label: "¿Qué características te interesan más?", type: "select", options: ["Chat AI", "Automaciones", "Análisis de datos"], required: true }
        ],
        submitButton: "Registrarme para la beta",
        successMessage: "¡Gracias por tu registro! Te contactaremos pronto."
      },
      styling: null,
      settings: null,
      language: "es",
      description: "Formulario para registrarse en la lista de espera del beta",
      responseCount: 24,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    };
    this.forms.set(demoForm1.id, demoForm1);
    
    const demoForm2: Form = {
      id: this.formIdCounter++,
      userId: demoUser.id,
      title: "Solicitud de Demo",
      slug: "solicitud-demo",
      type: "lead",
      published: true,
      structure: {
        fields: [
          { name: "nombre", label: "Nombre completo", type: "text", required: true },
          { name: "email", label: "Email corporativo", type: "email", required: true },
          { name: "telefono", label: "Teléfono", type: "tel", required: true },
          { name: "empresa", label: "Empresa", type: "text", required: true },
          { name: "tamanoEmpresa", label: "Tamaño de empresa", type: "select", options: ["1-10", "11-50", "51-200", "201+"], required: true },
          { name: "mensaje", label: "¿Qué te gustaría ver en la demo?", type: "textarea", required: false }
        ],
        submitButton: "Solicitar una demo",
        successMessage: "Hemos recibido tu solicitud. Un representante te contactará en 24-48 horas."
      },
      styling: null,
      settings: null,
      language: "es",
      description: "Formulario para solicitar una demostración del producto",
      responseCount: 18,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
    };
    this.forms.set(demoForm2.id, demoForm2);
    
    // Add some form responses
    const demoResponses = [
      {
        id: this.formResponseIdCounter++,
        formId: demoForm1.id,
        data: {
          nombre: "Ana García",
          email: "ana.garcia@example.com",
          interes: "Chat AI"
        },
        submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      },
      {
        id: this.formResponseIdCounter++,
        formId: demoForm1.id,
        data: {
          nombre: "Carlos Rodríguez",
          email: "carlos.rodriguez@company.com",
          empresa: "Company SL",
          interes: "Automaciones"
        },
        submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) // 12 days ago
      },
      {
        id: this.formResponseIdCounter++,
        formId: demoForm2.id,
        data: {
          nombre: "María López",
          email: "maria.lopez@enterprise.com",
          telefono: "+34612345678",
          empresa: "Enterprise Inc",
          tamanoEmpresa: "51-200",
          mensaje: "Me gustaría ver cómo se integra con nuestros sistemas actuales."
        },
        submittedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) // 9 days ago
      },
      {
        id: this.formResponseIdCounter++,
        formId: demoForm2.id,
        data: {
          nombre: "Pedro Sánchez",
          email: "pedro.sanchez@startup.co",
          telefono: "+34698765432",
          empresa: "Startup Co",
          tamanoEmpresa: "1-10",
          mensaje: "Especialmente interesado en las capacidades de automatización."
        },
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    ];
    
    for (const response of demoResponses) {
      this.formResponses.set(response.id, response as FormResponse);
    }
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
      id,
      username: user.username,
      password: user.password,
      email: user.email,
      fullName: user.fullName || null,
      apiKey: user.apiKey,
      createdAt: new Date(),
      stripeCustomerId: null,
      stripeSubscriptionId: null
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
      id,
      userId: integration.userId,
      name: integration.name,
      url: integration.url,
      apiKey: integration.apiKey,
      themeColor: integration.themeColor || "#3B82F6",
      position: integration.position || "bottom-right",
      active: true,
      createdAt: new Date(),
      visitorCount: 0,
      botBehavior: integration.botBehavior || "Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web.",
      documentsData: integration.documentsData || [],
      widgetType: integration.widgetType || "bubble",
      ignoredSections: integration.ignoredSections || [],
      description: integration.description || null,
      ignoredSectionsText: null,
      customization: null,
      language: integration.language || "es",
      textColor: integration.textColor || "auto"
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
    
    // Log language changes for debugging
    if (data.language && integration.language !== data.language) {
      console.log(`Language updated for integration ${id}: ${integration.language} → ${data.language}`);
    }
    
    return updatedIntegration;
  }

  async incrementVisitorCount(id: number): Promise<void> {
    const integration = this.integrations.get(id);
    if (integration && integration.visitorCount !== null) {
      integration.visitorCount += 1;
      this.integrations.set(id, integration);
    }
  }
  
  async deleteIntegration(id: number): Promise<void> {
    if (!this.integrations.has(id)) {
      throw new Error(`Integration with id ${id} not found`);
    }
    
    this.integrations.delete(id);
    
    // También eliminar todas las conversaciones asociadas
    const conversationsToDelete = Array.from(this.conversations.values())
      .filter(conv => conv.integrationId === id);
      
    for (const conv of conversationsToDelete) {
      this.conversations.delete(conv.id);
      
      // Y también eliminar los mensajes de esas conversaciones
      const messagesToDelete = Array.from(this.messages.values())
        .filter(msg => msg.conversationId === conv.id);
        
      for (const msg of messagesToDelete) {
        this.messages.delete(msg.id);
      }
    }
    
    // Eliminar el contenido de sitio asociado
    const siteContentsToDelete = Array.from(this.siteContents.values())
      .filter(content => content.integrationId === id);
      
    for (const content of siteContentsToDelete) {
      this.siteContents.delete(content.id);
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
      id,
      integrationId: conversation.integrationId || null,
      visitorId: conversation.visitorId || null,
      title: null,
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
      .sort((a, b) => {
        const aTime = a.timestamp ? a.timestamp.getTime() : 0;
        const bTime = b.timestamp ? b.timestamp.getTime() : 0;
        return aTime - bTime;
      });
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = {
      id,
      conversationId: message.conversationId || null,
      content: message.content,
      role: message.role,
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
      id,
      userId: automation.userId,
      name: automation.name,
      description: automation.description || null,
      status: automation.status || "active",
      config: automation.config,
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
      assistantName: "AIPPS Assistant",
      defaultGreeting: "👋 Hi there! I'm AIPPS, your AI assistant. How can I help you today?",
      showAvailability: true,
      avatarUrl: null,
      userBubbleColor: "#3B82F6",
      assistantBubbleColor: "#E5E7EB",
      font: "inter",
      conversationStyle: "professional",
      knowledgeBase: "default",
      enableLearning: true,
      emailNotificationAddress: "notifications@example.com",
      welcomePageChatEnabled: true,
      welcomePageChatGreeting: "👋 ¡Hola! Soy AIPPS, tu asistente de IA. ¿En qué puedo ayudarte hoy?",
      welcomePageChatBubbleColor: "#111827",
      welcomePageChatTextColor: "#FFFFFF",
      welcomePageChatBehavior: "Sé amable, informativo y conciso al responder preguntas sobre AIPPS y sus características.",
      welcomePageChatScrapingEnabled: false,
      welcomePageChatScrapingDepth: 5,
      welcomePageChatScrapingData: null
    };
    this.settings.set(id, newSettings);
    return newSettings;
  }

  // Document methods (enhanced to get real documents from documentsData)
  async getDocuments(integrationId: number): Promise<any[]> {
    // Get documents from integration's documentsData field
    const integration = await this.getIntegration(integrationId);
    if (integration && integration.documentsData && Array.isArray(integration.documentsData)) {
      // Process each document to extract content
      const processedDocs = [];
      
      for (const doc of integration.documentsData) {
        let content = doc.content || 'Contenido no disponible';
        
        // If no content but we have a file path, try to process it
        if (!doc.content && doc.path && fs.existsSync(doc.path)) {
          try {
            const { enhancedDocumentProcessor } = await import('./lib/document-processor-enhanced');
            content = await enhancedDocumentProcessor.processDocumentContent(doc.path, doc.mimetype);
          } catch (error) {
            console.error('Error processing document content:', error);
            content = 'Error al procesar el contenido del documento';
          }
        }
        
        processedDocs.push({
          id: doc.id,
          integration_id: integrationId,
          filename: doc.filename,
          original_name: doc.originalName || doc.filename,
          content: content,
          content_type: doc.mimetype,
          file_size: doc.size
        });
      }
      
      return processedDocs;
    }
    
    return [];
  }

  async createDocument(doc: any): Promise<any> {
    // Mock implementation - in real system this would insert into documents table
    return { id: 1, ...doc };
  }

  async deleteDocument(id: number): Promise<void> {
    // Mock implementation - in real system this would delete from documents table
  }

  // Site content methods (personalized for each integration)
  async getSiteContent(integrationId: number): Promise<any[]> {
    // Get the integration to check for specific site content
    const integration = await this.getIntegration(integrationId);
    if (!integration) {
      return [];
    }
    
    // Check existing site contents for this integration
    const existingContent = Array.from(this.siteContents.values())
      .filter(content => content.integrationId === integrationId);
    
    if (existingContent.length > 0) {
      return existingContent.map(content => ({
        id: content.id,
        integration_id: content.integrationId,
        url: content.url,
        title: content.title,
        content: content.content,
        meta_description: content.metaDescription
      }));
    }
    
    // Only return demo content for AIPPS-specific integrations
    if (integration.name.toLowerCase().includes('aipps') || integration.apiKey === 'aipps_web_internal') {
      return [
        {
          id: 1,
          integration_id: integrationId,
          url: integration.url || 'https://techcolca.com/',
          title: 'AIPPS - Plataforma de IA',
          content: 'AIPPS es una plataforma de inteligencia artificial que permite crear chatbots inteligentes para sitios web, generar formularios interactivos personalizados, automatizar procesos de atención al cliente e integrar fácilmente con WordPress y otros CMS. Planes disponibles: Gratuito (100 conversaciones/mes), Profesional (conversaciones ilimitadas), Empresarial (soluciones personalizadas).',
          meta_description: 'Plataforma de inteligencia artificial AIPPS'
        }
      ];
    }
    
    // For other integrations, return empty array to rely on user-uploaded documents
    return [];
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
  
  // Subscription methods
  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      subscription => subscription.userId === userId
    );
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionIdCounter++;
    const now = new Date();
    
    const newSubscription: Subscription = {
      ...subscription,
      id,
      createdAt: now,
      updatedAt: now,
      interactionsUsed: 0,
    };
    
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) {
      throw new Error(`Subscription with id ${id} not found`);
    }

    const updatedSubscription = {
      ...subscription,
      ...data,
      updatedAt: new Date()
    };
    
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async incrementSubscriptionUsage(id: number): Promise<void> {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      subscription.interactionsUsed += 1;
      this.subscriptions.set(id, subscription);
    }
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.stripeCustomerId === stripeCustomerId
    );
  }

  async updateUserStripeInfo(
    userId: number, 
    data: { stripeCustomerId: string, stripeSubscriptionId: string }
  ): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const updatedUser = { 
      ...user, 
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId 
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Discount code methods
  async getDiscountCodes(): Promise<DiscountCode[]> {
    return Array.from(this.discountCodes.values());
  }
  
  async getActiveDiscountCodes(): Promise<DiscountCode[]> {
    return Array.from(this.discountCodes.values())
      .filter(code => code.isActive);
  }
  
  async getDiscountCode(id: number): Promise<DiscountCode | undefined> {
    return this.discountCodes.get(id);
  }
  
  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    return Array.from(this.discountCodes.values())
      .find(discountCode => discountCode.code === code);
  }
  
  async createDiscountCode(data: InsertDiscountCode): Promise<DiscountCode> {
    const id = this.discountCodeIdCounter++;
    const newDiscountCode: DiscountCode = {
      ...data,
      id,
      usageCount: 0,
      createdAt: new Date()
    };
    
    this.discountCodes.set(id, newDiscountCode);
    return newDiscountCode;
  }
  
  async updateDiscountCode(id: number, data: Partial<DiscountCode>): Promise<DiscountCode> {
    const discountCode = this.discountCodes.get(id);
    if (!discountCode) {
      throw new Error(`Discount code with id ${id} not found`);
    }
    
    const updatedDiscountCode = {
      ...discountCode,
      ...data
    };
    
    this.discountCodes.set(id, updatedDiscountCode);
    return updatedDiscountCode;
  }
  
  async incrementDiscountCodeUsage(id: number): Promise<void> {
    const discountCode = this.discountCodes.get(id);
    if (discountCode) {
      discountCode.usageCount += 1;
      this.discountCodes.set(id, discountCode);
    }
  }
  
  async deleteDiscountCode(id: number): Promise<void> {
    this.discountCodes.delete(id);
  }
  
  generateDiscountCode(prefix: string = 'AIPPS'): string {
    // Generar un código alfanumérico único de 8 caracteres
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    const charactersLength = characters.length;
    
    // Asegurar que el prefijo no sea más de 4 caracteres
    if (result.length > 4) {
      result = result.substring(0, 4);
    }
    
    // Añadir guión después del prefijo
    result += '-';
    
    // Añadir 4 caracteres aleatorios
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  }

  // Pricing Plan methods
  async getPricingPlans(): Promise<PricingPlan[]> {
    return Array.from(this.pricingPlans.values());
  }

  async getAvailablePricingPlans(): Promise<PricingPlan[]> {
    return Array.from(this.pricingPlans.values())
      .filter(plan => plan.available);
  }

  async getPricingPlan(id: number): Promise<PricingPlan | undefined> {
    return this.pricingPlans.get(id);
  }

  async getPricingPlanByPlanId(planId: string): Promise<PricingPlan | undefined> {
    return Array.from(this.pricingPlans.values())
      .find(plan => plan.planId === planId);
  }

  async createPricingPlan(data: InsertPricingPlan): Promise<PricingPlan> {
    const id = this.pricingPlanIdCounter++;
    const now = new Date();
    
    const newPlan: PricingPlan = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.pricingPlans.set(id, newPlan);
    return newPlan;
  }

  async updatePricingPlan(id: number, data: Partial<PricingPlan>): Promise<PricingPlan> {
    const plan = this.pricingPlans.get(id);
    if (!plan) {
      throw new Error(`Pricing plan with id ${id} not found`);
    }
    
    const updatedPlan = {
      ...plan,
      ...data,
      updatedAt: new Date()
    };
    
    this.pricingPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deletePricingPlan(id: number): Promise<void> {
    this.pricingPlans.delete(id);
  }
  
  // Form methods
  async getForms(userId: number): Promise<Form[]> {
    return Array.from(this.forms.values()).filter(
      (form) => form.userId === userId
    );
  }

  async getForm(id: number): Promise<Form | undefined> {
    return this.forms.get(id);
  }

  async getFormBySlug(slug: string): Promise<Form | undefined> {
    return Array.from(this.forms.values()).find(
      (form) => form.slug === slug
    );
  }

  async createForm(formData: InsertForm): Promise<Form> {
    const id = this.formIdCounter++;
    const now = new Date();
    const newForm: Form = {
      id,
      userId: formData.userId,
      title: formData.name || "",
      slug: formData.slug || "",
      type: formData.type || null,
      description: formData.description || null,
      status: formData.status || "draft",
      structure: formData.structure || {},
      settings: formData.settings || {},
      styling: formData.styling || {},
      published: formData.published || false,
      responseCount: 0,
      embedCode: formData.embedCode || null,
      createdAt: now,
      updatedAt: now
    };
    this.forms.set(id, newForm);
    return newForm;
  }

  async updateForm(id: number, data: Partial<Form>): Promise<Form> {
    const form = this.forms.get(id);
    if (!form) {
      throw new Error(`Form with id ${id} not found`);
    }

    const updatedForm = {
      ...form,
      ...data,
      updatedAt: new Date()
    };
    this.forms.set(id, updatedForm);
    return updatedForm;
  }

  async incrementFormResponseCount(id: number): Promise<void> {
    const form = this.forms.get(id);
    if (form) {
      form.responseCount += 1;
      this.forms.set(id, form);
    }
  }

  async deleteForm(id: number): Promise<void> {
    if (!this.forms.has(id)) {
      throw new Error(`Form with id ${id} not found`);
    }
    
    // Eliminar todas las respuestas asociadas
    await this.deleteFormResponses(id);
    
    // Eliminar el formulario
    this.forms.delete(id);
  }

  // Form Template methods
  async getFormTemplates(): Promise<FormTemplate[]> {
    return Array.from(this.formTemplates.values());
  }

  async getDefaultFormTemplates(): Promise<FormTemplate[]> {
    return Array.from(this.formTemplates.values()).filter(
      (template) => template.isDefault === true
    );
  }

  async getTemplatesByType(type: string): Promise<FormTemplate[]> {
    return Array.from(this.formTemplates.values()).filter(
      (template) => template.type === type
    );
  }

  async getFormTemplate(id: number): Promise<FormTemplate | undefined> {
    return this.formTemplates.get(id);
  }

  async createFormTemplate(templateData: InsertFormTemplate): Promise<FormTemplate> {
    const id = this.formTemplateIdCounter++;
    const now = new Date();
    const newTemplate: FormTemplate = {
      id,
      name: templateData.name,
      type: templateData.type,
      description: templateData.description || null,
      structure: templateData.structure || {},
      settings: templateData.settings || {},
      styling: templateData.styling || {},
      thumbnail: templateData.thumbnail || null,
      isDefault: templateData.isDefault || false,
      createdBy: templateData.createdBy || null,
      createdAt: now,
      updatedAt: now
    };
    this.formTemplates.set(id, newTemplate);
    return newTemplate;
  }

  async updateFormTemplate(id: number, data: Partial<FormTemplate>): Promise<FormTemplate> {
    const template = this.formTemplates.get(id);
    if (!template) {
      throw new Error(`Form template with id ${id} not found`);
    }

    const updatedTemplate = {
      ...template,
      ...data,
      updatedAt: new Date()
    };
    this.formTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteFormTemplate(id: number): Promise<void> {
    this.formTemplates.delete(id);
  }

  // Form Response methods
  async getFormResponses(formId: number): Promise<FormResponse[]> {
    return Array.from(this.formResponses.values())
      .filter((response) => response.formId === formId)
      .sort((a, b) => {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });
  }

  async getFormResponse(id: number): Promise<FormResponse | undefined> {
    return this.formResponses.get(id);
  }

  async createFormResponse(responseData: InsertFormResponse): Promise<FormResponse> {
    const id = this.formResponseIdCounter++;
    const newResponse: FormResponse = {
      id,
      formId: responseData.formId,
      data: responseData.data || {},
      metadata: responseData.metadata || {},
      submittedAt: new Date()
    };
    this.formResponses.set(id, newResponse);
    
    // Incrementar el contador de respuestas si hay un formId válido
    if (responseData.formId) {
      await this.incrementFormResponseCount(responseData.formId);
    }
    
    return newResponse;
  }

  async deleteFormResponse(id: number): Promise<void> {
    this.formResponses.delete(id);
  }

  async deleteFormResponses(formId: number): Promise<void> {
    const responsesToDelete = Array.from(this.formResponses.values())
      .filter(response => response.formId === formId);
      
    for (const response of responsesToDelete) {
      this.formResponses.delete(response.id);
    }
  }
  
  // Appointment methods
  async getAppointments(integrationId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.integrationId === integrationId)
      .sort((a, b) => {
        // Ordenar por fecha/hora de la cita
        const dateComparison = new Date(a.appointmentDate + ' ' + a.appointmentTime).getTime() - 
                              new Date(b.appointmentDate + ' ' + b.appointmentTime).getTime();
        return dateComparison;
      });
  }
  
  async getAppointmentsByConversation(conversationId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.conversationId === conversationId)
      .sort((a, b) => {
        // Ordenar por fecha/hora de la cita
        const dateComparison = new Date(a.appointmentDate + ' ' + a.appointmentTime).getTime() - 
                              new Date(b.appointmentDate + ' ' + b.appointmentTime).getTime();
        return dateComparison;
      });
  }
  
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const newAppointment: Appointment = {
      ...appointmentData,
      id,
      createdAt: new Date()
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }
  
  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) {
      throw new Error(`Appointment with id ${id} not found`);
    }
    
    const updatedAppointment = { ...appointment, ...data };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) {
      throw new Error(`Appointment with id ${id} not found`);
    }
    
    const updatedAppointment = { ...appointment, status };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  async updateCalendarEventId(id: number, calendarEventId: string, calendarProvider: string): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) {
      throw new Error(`Appointment with id ${id} not found`);
    }
    
    const updatedAppointment = { 
      ...appointment, 
      calendarEventId,
      calendarProvider
    };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  async markReminderSent(id: number): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) {
      throw new Error(`Appointment with id ${id} not found`);
    }
    
    const updatedAppointment = { ...appointment, reminderSent: true };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  async deleteAppointment(id: number): Promise<void> {
    if (!this.appointments.has(id)) {
      throw new Error(`Appointment with id ${id} not found`);
    }
    
    this.appointments.delete(id);
  }
  
  async getUpcomingAppointmentsForReminders(): Promise<Appointment[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    return Array.from(this.appointments.values())
      .filter(appointment => {
        // Filtrar citas para mañana que no han recibido recordatorio
        return appointment.appointmentDate === tomorrowStr && 
               appointment.status !== 'cancelled' &&
               !appointment.reminderSent;
      });
  }

  // Calendar OAuth Token methods
  async getCalendarTokens(userId: number): Promise<CalendarToken[]> {
    return Array.from(this.calendarTokens.values()).filter(
      (token) => token.userId === userId
    );
  }

  async getCalendarToken(id: number): Promise<CalendarToken | undefined> {
    return this.calendarTokens.get(id);
  }

  async getCalendarTokenByProvider(userId: number, provider: string): Promise<CalendarToken | undefined> {
    return Array.from(this.calendarTokens.values()).find(
      (token) => token.userId === userId && token.provider === provider
    );
  }

  async createCalendarToken(tokenData: InsertCalendarToken): Promise<CalendarToken> {
    const id = this.calendarTokenIdCounter++;
    const now = new Date();
    const newToken: CalendarToken = {
      ...tokenData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.calendarTokens.set(id, newToken);
    return newToken;
  }

  async updateCalendarToken(id: number, data: Partial<CalendarToken>): Promise<CalendarToken> {
    const token = this.calendarTokens.get(id);
    if (!token) {
      throw new Error(`Calendar token with id ${id} not found`);
    }

    const updatedToken = { 
      ...token, 
      ...data,
      updatedAt: new Date()
    };
    this.calendarTokens.set(id, updatedToken);
    return updatedToken;
  }

  async deleteCalendarToken(id: number): Promise<void> {
    if (!this.calendarTokens.has(id)) {
      throw new Error(`Calendar token with id ${id} not found`);
    }
    
    this.calendarTokens.delete(id);
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
      (sum, conversation) => sum + (conversation.duration || 0), 
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
  
  // Implementación de análisis de conversación para MemStorage
  async getConversationAnalytics(userId: number): Promise<ConversationAnalytics> {
    // Obtener las integraciones del usuario
    const userIntegrations = await this.getIntegrations(userId);
    const integrationIds = userIntegrations.map(integration => integration.id);
    
    // Si no hay integraciones, devolver datos vacíos
    if (integrationIds.length === 0) {
      return {
        topProducts: [],
        topTopics: [],
        conversationsByDay: [],
        keywordFrequency: []
      };
    }
    
    // Obtener todas las conversaciones para las integraciones del usuario
    const allConversations = Array.from(this.conversations.values()).filter(
      conversation => integrationIds.includes(conversation.integrationId)
    );
    
    // Obtener todos los mensajes de estas conversaciones
    const conversationIds = allConversations.map(conv => conv.id);
    const allMessages = conversationIds.length > 0 
      ? Array.from(this.messages.values()).filter(
          message => conversationIds.includes(message.conversationId)
        )
      : [];
    
    // Filtrar mensajes de usuarios (no del asistente)
    const userMessages = allMessages.filter(msg => msg.role === 'user');
    
    // Generar datos de tendencia de conversaciones
    const conversationsByDay: { date: string, count: number }[] = [];
    
    // Crear un mapa para contar conversaciones por día
    const dateCountMap = new Map<string, number>();
    
    // Inicializar los últimos 30 días con cero conversaciones
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - 29 + i);
      const dateStr = date.toISOString().split('T')[0]; // formato YYYY-MM-DD
      dateCountMap.set(dateStr, 0);
    }
    
    // Contar conversaciones por día
    allConversations.forEach(conv => {
      if (conv.createdAt) {
        const dateStr = new Date(conv.createdAt).toISOString().split('T')[0];
        if (dateCountMap.has(dateStr)) {
          dateCountMap.set(dateStr, (dateCountMap.get(dateStr) || 0) + 1);
        }
      }
    });
    
    // Convertir a array y ordenar por fecha
    const orderedConversationsByDay = Array.from(dateCountMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Extraer palabras clave y su frecuencia
    const keywordFrequency: { keyword: string, frequency: number }[] = [];
    
    // Extraer texto de todos los mensajes
    const allText = userMessages.map(msg => msg.content).join(' ').toLowerCase();
    
    // Lista de palabras de parada en español
    const stopWords = new Set([
      'a', 'al', 'algo', 'algunas', 'algunos', 'ante', 'antes', 'como', 'con', 'contra',
      'cual', 'cuando', 'de', 'del', 'desde', 'donde', 'durante', 'e', 'el', 'ella',
      'ellas', 'ellos', 'en', 'entre', 'era', 'erais', 'eran', 'eras', 'eres', 'es',
      'esa', 'esas', 'ese', 'eso', 'esos', 'esta', 'estaba', 'estaban', 'estado',
      'estais', 'estamos', 'estan', 'estar', 'estas', 'este', 'esto', 'estos', 'estoy',
      'etc', 'fue', 'fueron', 'fui', 'fuimos', 'han', 'has', 'hay', 'he', 'hemos',
      'hube', 'hubo', 'la', 'las', 'le', 'les', 'lo', 'los', 'me', 'mi', 'mia',
      'mias', 'mio', 'mios', 'mis', 'mu', 'muy', 'nada', 'ni', 'no', 'nos', 'nosotras',
      'nosotros', 'nuestra', 'nuestras', 'nuestro', 'nuestros', 'o', 'os', 'otra',
      'otras', 'otro', 'otros', 'para', 'pero', 'por', 'porque', 'que', 'quien',
      'quienes', 'qué', 'se', 'sea', 'seais', 'seamos', 'sean', 'seas', 'ser',
      'sereis', 'seremos', 'seria', 'seriais', 'seriamos', 'serian', 'serias', 'será',
      'seran', 'seras', 'seré', 'seréis', 'seríamos', 'si', 'sido', 'siendo', 'sin',
      'sobre', 'sois', 'somos', 'son', 'soy', 'su', 'sus', 'suya', 'suyas', 'suyo',
      'suyos', 'sí', 'también', 'tanto', 'te', 'teneis', 'tenemos', 'tener', 'tengo',
      'ti', 'tiene', 'tienen', 'tienes', 'todo', 'todos', 'tu', 'tus', 'tuve', 'tuvimos',
      'tuviste', 'tuvisteis', 'tuvo', 'tuvieron', 'tuya', 'tuyas', 'tuyo', 'tuyos',
      'tú', 'un', 'una', 'uno', 'unos', 'vosotras', 'vosotros', 'vuestra', 'vuestras',
      'vuestro', 'vuestros', 'y', 'ya', 'yo'
    ]);
    
    // Dividir el texto en palabras
    const words = allText.split(/\s+/)
      .map(word => word.replace(/[.,;!?()]/g, ''))
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    // Contar frecuencia de cada palabra
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    // Convertir a array, ordenar por frecuencia y tomar las 20 más frecuentes
    const orderedKeywords = Array.from(wordCount.entries())
      .map(([keyword, frequency]) => ({ keyword, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20);
      
    // Productos/servicios más demandados (demo)
    const topProducts: TopProduct[] = [
      { name: "Asistencia Técnica", count: 156, percentage: 42 },
      { name: "Plan Premium", count: 89, percentage: 24 },
      { name: "Facturación", count: 67, percentage: 18 },
      { name: "Configuración Inicial", count: 45, percentage: 12 },
      { name: "Sugerencias", count: 15, percentage: 4 }
    ];
    
    // Temas más discutidos con sentimiento (demo)
    const topTopics: TopTopic[] = [
      { topic: "Problemas de conexión", count: 124, sentiment: 35 },
      { topic: "Rendimiento del sistema", count: 98, sentiment: 62 },
      { topic: "Funcionalidades nuevas", count: 76, sentiment: 85 },
      { topic: "Precios y facturación", count: 64, sentiment: 48 },
      { topic: "Atención al cliente", count: 58, sentiment: 75 }
    ];
    
    return {
      topProducts,
      topTopics,
      conversationsByDay: orderedConversationsByDay,
      keywordFrequency: orderedKeywords
    };
  }
  
  // Implementación de rendimiento de integraciones para MemStorage
  async getIntegrationPerformance(userId: number): Promise<IntegrationPerformance[]> {
    // Obtener las integraciones del usuario
    const userIntegrations = await this.getIntegrations(userId);
    
    if (userIntegrations.length === 0) return [];
    
    // Crear array para almacenar el rendimiento de cada integración
    const performanceData: IntegrationPerformance[] = [];
    
    // Analizar cada integración
    for (const integration of userIntegrations) {
      // Obtener conversaciones para esta integración
      const integrationConversations = Array.from(this.conversations.values()).filter(
        conversation => conversation.integrationId === integration.id
      );
      
      if (integrationConversations.length === 0) {
        // Si no hay conversaciones, añadir datos con valores predeterminados
        performanceData.push({
          integrationId: integration.id,
          integrationName: integration.name,
          conversationCount: 0,
          responseTime: 0,
          resolutionRate: 0,
          userSatisfaction: 0
        });
        continue;
      }
      
      // Contar conversaciones resueltas
      const resolvedCount = integrationConversations.filter(conv => conv.resolved).length;
      
      // Calcular tasa de resolución
      const resolutionRate = (resolvedCount / integrationConversations.length) * 100;
      
      // Calcular tiempo de respuesta promedio
      const totalDuration = integrationConversations.reduce(
        (sum, conv) => sum + (conv.duration || 0), 
        0
      );
      const responseTime = totalDuration / integrationConversations.length;
      
      // Calcular satisfacción del usuario (simulado)
      // En una implementación real, esto podría basarse en encuestas o análisis de sentimiento
      // Para esta simulación, generamos un valor entre 65 y 95
      const userSatisfaction = Math.floor(Math.random() * 30) + 65;
      
      performanceData.push({
        integrationId: integration.id,
        integrationName: integration.name,
        conversationCount: integrationConversations.length,
        responseTime,
        resolutionRate,
        userSatisfaction
      });
    }
    
    return performanceData;
  }
}

// Import PgStorage implementation
import { PgStorage } from './pg-storage';

// Use PostgreSQL storage instead of in-memory storage
export const storage = new PgStorage();
