import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
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
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  userId: true,
  name: true,
  url: true,
  themeColor: true,
  position: true,
  botBehavior: true,
  widgetType: true,
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
  assistantName: text("assistant_name").default("AIPI Assistant"),
  defaultGreeting: text("default_greeting").default("👋 Hi there! I'm AIPI, your AI assistant. How can I help you today?"),
  showAvailability: boolean("show_availability").default(true),
  avatarUrl: text("avatar_url"),
  userBubbleColor: text("user_bubble_color").default("#3B82F6"),
  assistantBubbleColor: text("assistant_bubble_color").default("#E5E7EB"),
  font: text("font").default("inter"),
  conversationStyle: text("conversation_style").default("professional"),
  knowledgeBase: text("knowledge_base").default("default"),
  enableLearning: boolean("enable_learning").default(true),
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
