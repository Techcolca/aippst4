import { pgTable, text, serial, integer, boolean, timestamp, json, date, time } from "drizzle-orm/pg-core";
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
  customization: json("customization"), // Personalización del chatbot (colores, fuentes, mensajes, etc.)
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
});

// Conversation schema
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").references(() => integrations.id),
  visitorId: text("visitor_id"),
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
