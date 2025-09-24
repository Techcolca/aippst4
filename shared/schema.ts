import { pgTable, text, serial, integer, boolean, timestamp, json, date, time, numeric, unique, check, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  apiKey: text("api_key").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

// Website integration schema
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  apiKey: text("api_key").notNull().unique(),
  themeColor: text("theme_color").default("#3B82F6"),
  position: text("position").default("bottom-right"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  visitorCount: integer("visitor_count").default(0),
  botBehavior: text("bot_behavior").default("Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web."),
  documentsData: json("documents_data").default([]), // Almacenará metadatos de los documentos subidos
  widgetType: text("widget_type").default("bubble"), // Tipo de widget: "bubble" (original) o "fullscreen" (estilo ChatGPT)
  ignoredSections: json("ignored_sections").default([]), // Lista de nombres de secciones a ignorar (ej: "Our Services", "Contact", etc.)
  description: text("description"), // Descripción de la integración
  ignoredSectionsText: text("ignored_sections_text"), // Texto de secciones ignoradas para scraping
  customization: json("customization"), // Personalización del agente de IA (colores, fuentes, mensajes, etc.)
  language: text("language").default("es"), // Idioma del widget (es, en, fr)
  textColor: text("text_color").default("auto"), // Color del texto: auto (automático), white (blanco), black (negro)
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  userId: true,
  name: true,
  url: true,
  themeColor: true,
  position: true,
  botBehavior: true,
  widgetType: true,
  documentsData: true,
  ignoredSections: true,
  description: true,
  language: true,
  textColor: true,
});

// Conversation schema
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").references(() => integrations.id),
  visitorId: text("visitor_id"),
  visitorName: text("visitor_name"), // AGREGAR ESTA LÍNEA
  visitorEmail: text("visitor_email"), // AGREGAR ESTA LÍNEA
  title: text("title"),
  resolved: boolean("resolved").default(false),
  duration: integer("duration").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  integrationId: true,
  visitorId: true,
});

// Message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  content: true,
  role: true,
});

// Automation schema
export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("active"), // active, paused, in_testing
  config: json("config").notNull(),
  processedCount: integer("processed_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  lastModified: timestamp("last_modified").defaultNow(),
});

export const insertAutomationSchema = createInsertSchema(automations).pick({
  userId: true,
  name: true,
  description: true,
  status: true,
  config: true,
});

// Automation analysis requests schema - For Enterprise plan users
export const automationAnalysisRequests = pgTable("automation_analysis_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Allow null for anonymous requests
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  industry: text("industry"),
  companySize: text("company_size"), // small, medium, large, enterprise
  currentProcesses: text("current_processes").notNull(), // Description of current manual processes
  automationGoals: text("automation_goals").notNull(), // What they want to automate
  existingSystems: text("existing_systems"), // Current tools and systems they use
  budgetRange: text("budget_range"), // Expected investment range
  timeline: text("timeline"), // When they want to implement
  technicalTeam: text("technical_team"), // Technical team situation (yes-full-team, yes-limited-team, no-team, external-help)
  previousAutomation: text("previous_automation"), // Experience with automation tools
  priorityLevel: text("priority_level").default("medium"), // low, medium, high, urgent
  aiPreference: text("ai_preference"), // "local", "cloud", "hybrid", "no-preference"
  sensitiveDataHandling: text("sensitive_data_handling"), // "yes-highly-sensitive", "yes-moderate", "no", "not-sure"
  estimatedTimeSavings: integer("estimated_time_savings"), // Hours per week estimated
  estimatedCostSavings: integer("estimated_cost_savings"), // CAD per month estimated
  recommendedApproach: text("recommended_approach"), // Our recommendation: native vs n8n/make
  analysisStatus: text("analysis_status").default("pending"), // pending, in_review, analyzed, contacted, quoted
  analysisNotes: text("analysis_notes"), // Internal notes from analysis
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAutomationAnalysisRequestSchema = createInsertSchema(automationAnalysisRequests).pick({
  userId: true,
  companyName: true,
  contactName: true,
  email: true,
  phone: true,
  industry: true,
  companySize: true,
  currentProcesses: true,
  automationGoals: true,
  existingSystems: true,
  budgetRange: true,
  timeline: true,
  technicalTeam: true,
  previousAutomation: true,
  priorityLevel: true,
  aiPreference: true,
  sensitiveDataHandling: true,
}).extend({
  technicalTeam: z.enum(["yes-full-team", "yes-limited-team", "no-team", "external-help"]),
  aiPreference: z.enum(["local", "cloud", "hybrid", "no-preference"]).optional(),
  sensitiveDataHandling: z.enum(["yes-highly-sensitive", "yes-moderate", "no", "not-sure"]).optional(),
});

// Schema for user updates (excludes internal/admin fields)
export const updateAutomationAnalysisRequestUserSchema = createInsertSchema(automationAnalysisRequests).pick({
  companyName: true,
  contactName: true,
  email: true,
  phone: true,
  industry: true,
  companySize: true,
  currentProcesses: true,
  automationGoals: true,
  existingSystems: true,
  budgetRange: true,
  timeline: true,
  technicalTeam: true,
  previousAutomation: true,
  priorityLevel: true,
  aiPreference: true,
  sensitiveDataHandling: true,
}).partial();

// Schema for admin/internal updates (includes analysis fields)
export const updateAutomationAnalysisRequestAdminSchema = createInsertSchema(automationAnalysisRequests).pick({
  estimatedTimeSavings: true,
  estimatedCostSavings: true,
  recommendedApproach: true,
  analysisStatus: true,
  analysisNotes: true,
  followUpDate: true,
}).partial();

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  assistantName: text("assistant_name").default("AIPPS Assistant"),
  defaultGreeting: text("default_greeting").default("👋 Hi there! I'm AIPPS, your AI assistant. How can I help you today?"),
  showAvailability: boolean("show_availability").default(true),
  avatarUrl: text("avatar_url"),
  userBubbleColor: text("user_bubble_color").default("#3B82F6"),
  assistantBubbleColor: text("assistant_bubble_color").default("#E5E7EB"),
  font: text("font").default("inter"),
  conversationStyle: text("conversation_style").default("professional"),
  knowledgeBase: text("knowledge_base").default("default"),
  enableLearning: boolean("enable_learning").default(true),
  emailNotificationAddress: text("email_notification_address"),
  // Configuración para el chatbot de la página de bienvenida
  welcomePageChatEnabled: boolean("welcome_page_chat_enabled").default(true),
  welcomePageChatGreeting: text("welcome_page_chat_greeting").default("👋 ¡Hola! Soy AIPPS, tu asistente de IA. ¿En qué puedo ayudarte hoy?"),
  welcomePageChatBubbleColor: text("welcome_page_chat_bubble_color").default("#111827"),
  welcomePageChatTextColor: text("welcome_page_chat_text_color").default("#FFFFFF"),
  welcomePageChatBehavior: text("welcome_page_chat_behavior").default("Sé amable, informativo y conciso al responder preguntas sobre AIPPS y sus características."),
  welcomePageChatScrapingEnabled: boolean("welcome_page_chat_scraping_enabled").default(false),
  welcomePageChatScrapingDepth: integer("welcome_page_chat_scraping_depth").default(5),
  welcomePageChatScrapingData: text("welcome_page_chat_scraping_data"),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = z.infer<typeof insertAutomationSchema>;

export type AutomationAnalysisRequest = typeof automationAnalysisRequests.$inferSelect;
export type InsertAutomationAnalysisRequest = z.infer<typeof insertAutomationAnalysisRequestSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// Tipos de datos para analytics
export interface TopProduct {
  name: string;
  count: number;
  percentage: number;
}

export interface TopTopic {
  topic: string;
  count: number;
  sentiment: number;
}

export interface ConversationAnalytics {
  topProducts: TopProduct[];
  topTopics: TopTopic[];
  conversationsByDay: {
    date: string;
    count: number;
  }[];
  keywordFrequency: {
    keyword: string;
    frequency: number;
  }[];
}

export interface IntegrationPerformance {
  integrationId: number;
  integrationName: string;
  conversationCount: number;
  responseTime: number;
  resolutionRate: number;
  userSatisfaction: number;
}

export interface DashboardStats {
  totalConversations: number;
  resolutionRate: number;
  averageResponseTime: number;
}

// Tipos para suscripciones
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  stripeCustomerId: text("stripe_customer_id"),
  stripePriceId: text("stripe_price_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull().default("inactive"),
  tier: text("tier").notNull().default("free"),
  interactionsLimit: integer("interactions_limit").notNull().default(20),
  interactionsUsed: integer("interactions_used").notNull().default(0),
  startDate: timestamp("start_date", { mode: "date" }),
  endDate: timestamp("end_date", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  stripeCustomerId: true,
  stripePriceId: true,
  stripeSubscriptionId: true,
  status: true,
  tier: true,
  interactionsLimit: true,
  startDate: true,
  endDate: true,
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Tabla para códigos de descuento
export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  discountPercentage: integer("discount_percentage").notNull(),
  applicableTier: text("applicable_tier").notNull(), // Puede ser 'basic', 'professional', 'enterprise' o 'all'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").notNull().default(0),
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).pick({
  code: true,
  name: true,
  discountPercentage: true,
  applicableTier: true,
  isActive: true,
  expiresAt: true,
  usageLimit: true,
});

export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;

// Tabla para planes de precios
export const pricingPlans = pgTable("pricing_plans", {
  id: serial("id").primaryKey(),
  planId: text("plan_id").notNull().unique(), // Identificador único del plan (free, basic, etc.)
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Precio en centavos
  priceDisplay: text("price_display").notNull(),
  currency: text("currency").notNull().default("cad"),
  interval: text("interval").notNull().default("month"),
  features: json("features").notNull(), // Array de características
  tier: text("tier").notNull(),
  interactionsLimit: integer("interactions_limit").notNull(),
  isAnnual: boolean("is_annual").default(false),
  discount: integer("discount"),
  popular: boolean("popular").default(false),
  available: boolean("available").default(true),
  stripeProductId: text("stripe_product_id"),
  stripePriceId: text("stripe_price_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPricingPlanSchema = createInsertSchema(pricingPlans).pick({
  planId: true,
  name: true,
  description: true,
  price: true,
  priceDisplay: true,
  currency: true,
  interval: true,
  features: true,
  tier: true,
  interactionsLimit: true,
  isAnnual: true,
  discount: true,
  popular: true,
  available: true,
  stripeProductId: true,
  stripePriceId: true,
});

export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = z.infer<typeof insertPricingPlanSchema>;

// Tabla para almacenar información del sitio web scrapeado
export const sitesContent = pgTable("sites_content", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").notNull().references(() => integrations.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertSitesContentSchema = createInsertSchema(sitesContent).pick({
  integrationId: true,
  url: true,
  title: true,
  content: true,
});

export type SiteContent = typeof sitesContent.$inferSelect;
export type InsertSiteContent = z.infer<typeof insertSitesContentSchema>;

// Modelo para formularios
export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  type: text("type").default("standard"), // standard, waitlist, contact, survey, etc.
  published: boolean("published").default(false),
  structure: json("structure").notNull(), // Estructura del formulario (campos, configuración, etc.)
  styling: json("styling"), // Estilos personalizados
  settings: json("settings"), // Configuración adicional (notificaciones, redirecciones, etc.)
  language: text("language").default("es"), // Idioma del formulario: es, en, fr
  responseCount: integer("response_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFormSchema = createInsertSchema(forms).pick({
  userId: true,
  title: true,
  description: true,
  slug: true,
  type: true,
  published: true,
  structure: true,
  styling: true,
  settings: true,
  language: true,
});

// Modelo para plantillas de formularios
export const formTemplates = pgTable("form_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // standard, waitlist, contact, survey, etc.
  thumbnail: text("thumbnail"),
  structure: json("structure").notNull(), // Estructura predefinida de la plantilla
  styling: json("styling"), // Estilos predefinidos
  settings: json("settings"), // Configuración predefinida
  isDefault: boolean("is_default").default(false),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFormTemplateSchema = createInsertSchema(formTemplates).pick({
  name: true,
  description: true,
  type: true,
  thumbnail: true,
  structure: true,
  styling: true,
  settings: true,
  isDefault: true,
  createdBy: true,
});

// Modelo para respuestas de formularios
export const formResponses = pgTable("form_responses", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => forms.id, { onDelete: "cascade" }),
  data: json("data").notNull(), // Datos de la respuesta
  metadata: json("metadata"), // Metadatos adicionales (IP, user agent, etc.)
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const insertFormResponseSchema = createInsertSchema(formResponses).pick({
  formId: true,
  data: true,
  metadata: true,
});

export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;

export type FormTemplate = typeof formTemplates.$inferSelect;
export type InsertFormTemplate = z.infer<typeof insertFormTemplateSchema>;

export type FormResponse = typeof formResponses.$inferSelect;
export type InsertFormResponse = z.infer<typeof insertFormResponseSchema>;

// Modelo para agendamiento de citas
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").notNull().references(() => integrations.id, { onDelete: "cascade" }),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }),
  visitorName: text("visitor_name").notNull(),
  visitorEmail: text("visitor_email").notNull(),
  purpose: text("purpose").notNull(),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: time("appointment_time").notNull(),
  duration: integer("duration").default(30), // duración en minutos
  status: text("status").default("pending"), // pending, confirmed, cancelled, completed
  calendarEventId: text("calendar_event_id"), // ID del evento en Google Calendar/Outlook
  calendarProvider: text("calendar_provider"), // google, outlook, etc.
  notes: text("notes"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  integrationId: true,
  conversationId: true,
  visitorName: true,
  visitorEmail: true,
  purpose: true,
  appointmentDate: true,
  appointmentTime: true,
  duration: true,
  notes: true,
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Modelo para tokens OAuth de calendario
export const calendarTokens = pgTable("calendar_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // "google" o "outlook"
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCalendarTokenSchema = createInsertSchema(calendarTokens).pick({
  userId: true,
  provider: true,
  accessToken: true,
  refreshToken: true,
  expiresAt: true,
});

export type CalendarToken = typeof calendarTokens.$inferSelect;
export type InsertCalendarToken = z.infer<typeof insertCalendarTokenSchema>;

// Tabla para mensajes de bienvenida rotativos
export const welcomeMessages = pgTable("welcome_messages", {
  id: serial("id").primaryKey(),
  messageText: text("message_text").notNull(),
  messageTextFr: text("message_text_fr"), // Traducción al francés
  messageTextEn: text("message_text_en"), // Traducción al inglés
  messageType: text("message_type").notNull(), // "welcome", "automation", "commercial"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  orderIndex: integer("order_index").notNull(), // Para ordenar los mensajes 1-7
});

export const insertWelcomeMessageSchema = createInsertSchema(welcomeMessages).pick({
  messageText: true,
  messageTextFr: true,
  messageTextEn: true,
  messageType: true,
  isActive: true,
  expiresAt: true,
  orderIndex: true,
});
// Tabla para mensajes promocionales
export const promotionalMessages = pgTable("promotional_messages", {
  id: serial("id").primaryKey(),
  message_text: text("message_text").notNull(),
  message_type: text("message_type").notNull().default("ai_generated"),
  display_order: integer("display_order").notNull().default(0),
  language: text("language").notNull().default("es"),
  is_active: boolean("is_active").notNull().default(true),
  campaign_id: integer("campaign_id"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertPromotionalMessageSchema = createInsertSchema(promotionalMessages).pick({
  message_text: true,
  message_type: true,
  display_order: true,
  language: true,
  is_active: true,
  campaign_id: true,
});
// Tabla para campañas de marketing  
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  max_subscribers: integer("max_subscribers").notNull(),
  current_subscribers: integer("current_subscribers").default(0),
  start_date: timestamp("start_date").defaultNow(),
  end_date: timestamp("end_date"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});
export type PromotionalMessage = typeof promotionalMessages.$inferSelect;
export type InsertPromotionalMessage = z.infer<typeof insertPromotionalMessageSchema>;
export type WelcomeMessage = typeof welcomeMessages.$inferSelect;
export type InsertWelcomeMessage = z.infer<typeof insertWelcomeMessageSchema>;

// ===================================================================
// NUEVAS TABLAS - SISTEMA DE PRESUPUESTOS FLEXIBLES
// ===================================================================

// Tabla de presupuestos de usuario
export const userBudgets = pgTable("user_budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  monthlyBudget: numeric("monthly_budget", { precision: 12, scale: 2 }).notNull(), // Presupuesto mensual con precisión decimal
  currentSpent: numeric("current_spent", { precision: 12, scale: 2 }).default("0.00").notNull(), // Gasto actual del mes
  currency: text("currency").default("CAD").notNull(), // Moneda del presupuesto
  billingCycleDay: integer("billing_cycle_day").default(1).notNull(), // Día del mes para reset (1-28)
  alertThreshold50: boolean("alert_threshold_50").default(true), // Alerta al 50%
  alertThreshold80: boolean("alert_threshold_80").default(true), // Alerta al 80%
  alertThreshold90: boolean("alert_threshold_90").default(true), // Alerta al 90%
  alertThreshold100: boolean("alert_threshold_100").default(true), // Alerta al 100%
  isSuspended: boolean("is_suspended").default(false), // Estado de suspensión
  suspendedAt: timestamp("suspended_at"), // Fecha de suspensión
  lastResetAt: timestamp("last_reset_at").defaultNow(), // Último reset mensual
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Constraint único: un presupuesto por usuario
  uniqueUserId: unique().on(table.userId),
  // Validaciones CHECK
  validBillingDay: check("valid_billing_day", sql`${table.billingCycleDay} >= 1 AND ${table.billingCycleDay} <= 28`),
  positiveMonthlyBudget: check("positive_monthly_budget", sql`${table.monthlyBudget} >= 0`),
  positiveCurrentSpent: check("positive_current_spent", sql`${table.currentSpent} >= 0`),
}));

export const insertUserBudgetSchema = createInsertSchema(userBudgets).pick({
  userId: true,
  monthlyBudget: true,
  currency: true,
  billingCycleDay: true,
  alertThreshold50: true,
  alertThreshold80: true,
  alertThreshold90: true,
  alertThreshold100: true,
}).extend({
  // Validaciones adicionales para campos numéricos
  monthlyBudget: z.union([z.string(), z.number()]).transform(val => Number(val)).pipe(z.number().min(0, "Monthly budget must be positive")),
  billingCycleDay: z.number().int().min(1, "Billing cycle day must be between 1 and 28").max(28, "Billing cycle day must be between 1 and 28"),
});

// Tabla de costos por acción
export const actionCosts = pgTable("action_costs", {
  id: serial("id").primaryKey(),
  actionType: text("action_type").notNull().unique(), // "create_integration", "create_form", "send_email", "chat_conversation"
  baseCost: numeric("base_cost", { precision: 12, scale: 2 }).notNull(), // Costo base con precisión decimal
  markupPercentage: integer("markup_percentage").default(30).notNull(), // Porcentaje de ganancia (default 30%)
  finalCost: numeric("final_cost", { precision: 12, scale: 2 }).notNull(), // Costo final calculado (base + markup)
  currency: text("currency").default("CAD").notNull(),
  isActive: boolean("is_active").default(true),
  updateMethod: text("update_method").default("manual").notNull(), // "manual", "ai_suggested", "automatic"
  lastUpdatedBy: integer("last_updated_by").references(() => users.id), // Admin que hizo el último cambio
  aiJustification: text("ai_justification"), // Justificación de sugerencia IA
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Validaciones CHECK para costos
  positiveBaseCost: check("positive_base_cost", sql`${table.baseCost} >= 0`),
  positiveFinalCost: check("positive_final_cost", sql`${table.finalCost} >= 0`),
  validMarkup: check("valid_markup", sql`${table.markupPercentage} >= 0 AND ${table.markupPercentage} <= 1000`),
}));

export const insertActionCostSchema = createInsertSchema(actionCosts).pick({
  actionType: true,
  baseCost: true,
  markupPercentage: true,
  finalCost: true,
  currency: true,
  isActive: true,
  updateMethod: true,
  lastUpdatedBy: true,
  aiJustification: true,
}).extend({
  // Validaciones adicionales para campos numéricos
  baseCost: z.union([z.string(), z.number()]).transform(val => Number(val)).pipe(z.number().min(0, "Base cost must be positive")),
  finalCost: z.union([z.string(), z.number()]).transform(val => Number(val)).pipe(z.number().min(0, "Final cost must be positive")),
  markupPercentage: z.number().int().min(0, "Markup percentage must be positive").max(1000, "Markup percentage cannot exceed 1000%"),
});

// Tabla de seguimiento de uso
export const usageTracking = pgTable("usage_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  actionType: text("action_type").notNull().references(() => actionCosts.actionType),
  actionCostId: integer("action_cost_id").notNull().references(() => actionCosts.id), // Referencia al precio usado para auditoría
  costApplied: numeric("cost_applied", { precision: 12, scale: 2 }).notNull(), // Costo que se aplicó en el momento
  currency: text("currency").default("CAD").notNull(),
  resourceId: integer("resource_id"), // ID del recurso creado (integración, formulario, etc.)
  resourceType: text("resource_type"), // Tipo de recurso ("integration", "form", "conversation", etc.)
  billingMonth: text("billing_month").notNull(), // YYYY-MM para agrupación mensual
  metadata: json("metadata"), // Datos adicionales específicos de la acción
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Índices para performance
  userBillingIdx: index("usage_user_billing_idx").on(table.userId, table.billingMonth),
  actionTypeIdx: index("usage_action_type_idx").on(table.actionType),
  createdAtIdx: index("usage_created_at_idx").on(table.createdAt),
  // Validaciones CHECK
  positiveCostApplied: check("positive_cost_applied", sql`${table.costApplied} >= 0`),
  validBillingMonth: check("valid_billing_month", sql`${table.billingMonth} ~ '^\\d{4}-\\d{2}$'`),
}));

export const insertUsageTrackingSchema = createInsertSchema(usageTracking).pick({
  userId: true,
  actionType: true,
  actionCostId: true,
  costApplied: true,
  currency: true,
  resourceId: true,
  resourceType: true,
  billingMonth: true,
  metadata: true,
}).extend({
  // Validaciones adicionales para campos numéricos y de formato
  costApplied: z.union([z.string(), z.number()]).transform(val => Number(val)).pipe(z.number().min(0, "Cost applied must be positive")),
  billingMonth: z.string().regex(/^\d{4}-\d{2}$/, "Billing month must be in YYYY-MM format"),
});

// Tabla de alertas enviadas
export const sentAlerts = pgTable("sent_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  alertType: text("alert_type").notNull(), // "threshold_50", "threshold_80", "threshold_90", "budget_exceeded", "budget_suspended"
  thresholdReached: integer("threshold_reached"), // Porcentaje alcanzado (50, 80, 90, 100)
  currentSpent: numeric("current_spent", { precision: 12, scale: 2 }).notNull(), // Gasto al momento de la alerta
  monthlyBudget: numeric("monthly_budget", { precision: 12, scale: 2 }).notNull(), // Presupuesto mensual al momento
  deliveryMethod: text("delivery_method").notNull(), // "email", "in_app", "push"
  deliveryStatus: text("delivery_status").default("pending").notNull(), // "pending", "sent", "delivered", "failed"
  emailAddress: text("email_address"), // Email al que se envió (si aplica)
  messageContent: text("message_content"), // Contenido del mensaje enviado
  billingMonth: text("billing_month").notNull(), // YYYY-MM para evitar spam de alertas repetidas
  createdAt: timestamp("created_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"), // Timestamp cuando se confirmó la entrega
}, (table) => ({
  // Constraint único anti-spam: evita alertas duplicadas para el mismo usuario, tipo, umbral y mes
  uniqueAlert: unique().on(table.userId, table.alertType, table.thresholdReached, table.billingMonth),
  // Índices para performance
  userBillingAlertIdx: index("alerts_user_billing_idx").on(table.userId, table.billingMonth),
  deliveryStatusIdx: index("alerts_delivery_status_idx").on(table.deliveryStatus),
  createdAtIdx: index("alerts_created_at_idx").on(table.createdAt),
  // Validaciones CHECK
  validThreshold: check("valid_threshold", sql`${table.thresholdReached} IN (50, 80, 90, 100) OR ${table.thresholdReached} IS NULL`),
  positiveCurrentSpent: check("positive_current_spent_alert", sql`${table.currentSpent} >= 0`),
  positiveMonthlyBudget: check("positive_monthly_budget_alert", sql`${table.monthlyBudget} >= 0`),
  validBillingMonth: check("valid_billing_month_alert", sql`${table.billingMonth} ~ '^\\d{4}-\\d{2}$'`),
}));

export const insertSentAlertSchema = createInsertSchema(sentAlerts).pick({
  userId: true,
  alertType: true,
  thresholdReached: true,
  currentSpent: true,
  monthlyBudget: true,
  deliveryMethod: true,
  deliveryStatus: true,
  emailAddress: true,
  messageContent: true,
  billingMonth: true,
}).extend({
  // Validaciones adicionales para campos numéricos y de formato
  currentSpent: z.union([z.string(), z.number()]).transform(val => Number(val)).pipe(z.number().min(0, "Current spent must be positive")),
  monthlyBudget: z.union([z.string(), z.number()]).transform(val => Number(val)).pipe(z.number().min(0, "Monthly budget must be positive")),
  thresholdReached: z.number().int().refine(val => val === null || [50, 80, 90, 100].includes(val), "Threshold must be 50, 80, 90, or 100").optional(),
  billingMonth: z.string().regex(/^\d{4}-\d{2}$/, "Billing month must be in YYYY-MM format"),
});

// Widget Users schema - for users registered specifically in widgets (per integration)
export const widgetUsers = pgTable("widget_users", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").notNull().references(() => integrations.id),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Unique constraint per integration (same username/email can exist in different integrations)
  uniqueUsernamePerIntegration: unique("unique_username_per_integration").on(table.integrationId, table.username),
  uniqueEmailPerIntegration: unique("unique_email_per_integration").on(table.integrationId, table.email),
}));

export const insertWidgetUserSchema = createInsertSchema(widgetUsers).pick({
  integrationId: true,
  username: true,
  email: true,
  password: true,
  fullName: true,
});

// Widget Tokens schema - for secure token validation per integration
export const widgetTokens = pgTable("widget_tokens", {
  id: serial("id").primaryKey(),
  tokenHash: text("token_hash").notNull().unique(), // Hash del JWT para búsqueda rápida
  widgetUserId: integer("widget_user_id").notNull().references(() => widgetUsers.id),
  integrationId: integer("integration_id").notNull().references(() => integrations.id),
  jwtPayload: text("jwt_payload").notNull(), // JWT completo para validación
  expiresAt: timestamp("expires_at").notNull(), // Expiración del token
  createdAt: timestamp("created_at").defaultNow(),
  isRevoked: boolean("is_revoked").default(false), // Para invalidar tokens
}, (table) => ({
  // Un token por usuario+integración
  uniqueUserIntegration: unique("unique_widget_user_integration").on(table.widgetUserId, table.integrationId),
  // Índice para búsquedas rápidas por hash
  tokenHashIndex: index("widget_tokens_hash_idx").on(table.tokenHash),
}));

export const insertWidgetTokenSchema = createInsertSchema(widgetTokens).pick({
  tokenHash: true,
  widgetUserId: true,
  integrationId: true,
  jwtPayload: true,
  expiresAt: true,
});

// Tipos TypeScript para las nuevas tablas
export type UserBudget = typeof userBudgets.$inferSelect;
export type InsertUserBudget = z.infer<typeof insertUserBudgetSchema>;

export type ActionCost = typeof actionCosts.$inferSelect;
export type InsertActionCost = z.infer<typeof insertActionCostSchema>;

export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = z.infer<typeof insertUsageTrackingSchema>;

export type SentAlert = typeof sentAlerts.$inferSelect;
export type InsertSentAlert = z.infer<typeof insertSentAlertSchema>;

export type WidgetUser = typeof widgetUsers.$inferSelect;
export type InsertWidgetUser = z.infer<typeof insertWidgetUserSchema>;

export type WidgetToken = typeof widgetTokens.$inferSelect;
export type InsertWidgetToken = z.infer<typeof insertWidgetTokenSchema>;
