import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { IStorage } from './storage';
import { 
  User, InsertUser, Integration, InsertIntegration, 
  Conversation, InsertConversation, Message, InsertMessage,
  Automation, InsertAutomation, Settings, InsertSettings,
  SiteContent, InsertSiteContent, ConversationAnalytics, IntegrationPerformance,
  TopProduct, TopTopic, Subscription, InsertSubscription, DiscountCode, InsertDiscountCode,
  PricingPlan, InsertPricingPlan, Form, InsertForm, FormTemplate, InsertFormTemplate,
  FormResponse, InsertFormResponse, Appointment, InsertAppointment, CalendarToken, InsertCalendarToken,
  users, integrations, conversations, messages, automations, settings, sitesContent, 
  subscriptions, discountCodes, pricingPlans, forms, formTemplates, formResponses, appointments,
  calendarTokens
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
  
  async deleteIntegration(id: number): Promise<void> {
    // Verificar si la integración existe
    const integration = await this.getIntegration(id);
    if (!integration) {
      throw new Error(`Integration with id ${id} not found`);
    }
    
    // Obtener conversaciones asociadas a esta integración
    const integrationConversations = await db.select()
      .from(conversations)
      .where(eq(conversations.integrationId, id));
    
    const conversationIds = integrationConversations.map(conv => conv.id);
    
    // Eliminar mensajes asociados a estas conversaciones
    if (conversationIds.length > 0) {
      await db.delete(messages)
        .where(inArray(messages.conversationId, conversationIds));
    }
    
    // Eliminar las conversaciones
    await db.delete(conversations)
      .where(eq(conversations.integrationId, id));
    
    // Eliminar contenido de sitio asociado
    await db.delete(sitesContent)
      .where(eq(sitesContent.integrationId, id));
    
    // Finalmente, eliminar la integración
    await db.delete(integrations)
      .where(eq(integrations.id, id));
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

  async deleteConversation(id: number): Promise<void> {
    // Eliminar primero todos los mensajes de la conversación
    await db.delete(messages)
      .where(eq(messages.conversationId, id));
    
    // Luego eliminar la conversación
    await db.delete(conversations)
      .where(eq(conversations.id, id));
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
  
  // Funciones para análisis de conversaciones
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
    const allConversations = await db.select()
      .from(conversations)
      .where(inArray(conversations.integrationId, integrationIds));
    
    // Obtener todos los mensajes de estas conversaciones
    const conversationIds = allConversations.map(conv => conv.id);
    const allMessages = conversationIds.length > 0 
      ? await db.select()
          .from(messages)
          .where(inArray(messages.conversationId, conversationIds))
      : [];
    
    // Filtrar mensajes de usuarios (no del asistente)
    const userMessages = allMessages.filter(msg => msg.role === 'user');
    
    // Generar datos de tendencia de conversaciones
    const conversationsByDay = this.getConversationTrend(allConversations);
    
    // Extraer palabras clave y su frecuencia
    const keywordFrequency = this.extractKeywords(userMessages);
    
    // Identificar productos/servicios mencionados (simulamos extracción de entidades)
    // En una implementación real, utilizaríamos NLP para extraer entidades
    const topProducts = this.extractTopProducts(userMessages);
    
    // Analizar temas y sentimiento (simulamos análisis de temas)
    // En una implementación real, utilizaríamos NLP para análisis de temas
    const topTopics = this.extractTopTopics(userMessages);
    
    return {
      topProducts,
      topTopics,
      conversationsByDay,
      keywordFrequency
    };
  }
  
  // Función para obtener el rendimiento de integraciones
  async getIntegrationPerformance(userId: number): Promise<IntegrationPerformance[]> {
    // Obtener las integraciones del usuario
    const userIntegrations = await this.getIntegrations(userId);
    
    if (userIntegrations.length === 0) return [];
    
    // Crear array para almacenar el rendimiento de cada integración
    const performanceData: IntegrationPerformance[] = [];
    
    // Analizar cada integración
    for (const integration of userIntegrations) {
      // Obtener conversaciones para esta integración
      const integrationConversations = await this.getConversations(integration.id);
      
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
  
  // Funciones auxiliares para el análisis de datos
  
  public getConversationTrend(convs: Conversation[]): { date: string, count: number }[] {
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
    convs.forEach(conv => {
      if (conv.createdAt) {
        const dateStr = new Date(conv.createdAt).toISOString().split('T')[0];
        if (dateCountMap.has(dateStr)) {
          dateCountMap.set(dateStr, (dateCountMap.get(dateStr) || 0) + 1);
        }
      }
    });
    
    // Convertir a array y ordenar por fecha
    return Array.from(dateCountMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  public extractKeywords(messages: Message[]): { keyword: string, frequency: number }[] {
    // Extraer texto de todos los mensajes
    const allText = messages.map(msg => msg.content).join(' ').toLowerCase();
    
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
    return Array.from(wordCount.entries())
      .map(([keyword, frequency]) => ({ keyword, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20);
  }
  
  public extractTopProducts(messages: Message[]): TopProduct[] {
    // Extraer productos/servicios mencionados en los mensajes reales
    const productMentions = new Map<string, number>();
    
    // Lista de productos/servicios que podrían mencionarse
    const productKeywords = {
      "Asistencia Técnica": ["ayuda", "soporte", "problema", "error", "asistencia", "técnica"],
      "Plan Premium": ["premium", "plan", "suscripción", "upgrade", "mejorar"],
      "Facturación": ["factura", "pago", "cobro", "precio", "costo", "billing"],
      "Configuración": ["configurar", "setup", "instalar", "configuración"],
      "Integración": ["integrar", "conectar", "api", "webhook", "embed"],
      "Documentación": ["documentación", "guía", "manual", "tutorial", "ayuda"],
      "Personalización": ["personalizar", "customizar", "diseño", "color", "tema"]
    };
    
    // Analizar cada mensaje
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      
      Object.entries(productKeywords).forEach(([product, keywords]) => {
        const mentions = keywords.filter(keyword => content.includes(keyword)).length;
        if (mentions > 0) {
          productMentions.set(product, (productMentions.get(product) || 0) + mentions);
        }
      });
    });
    
    // Si no hay menciones, retornar array vacío
    if (productMentions.size === 0) {
      return [];
    }
    
    // Convertir a array y calcular porcentajes
    const totalMentions = Array.from(productMentions.values()).reduce((sum, count) => sum + count, 0);
    
    return Array.from(productMentions.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalMentions) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 productos
  }
  
  public extractTopTopics(messages: Message[]): TopTopic[] {
    // Extraer temas reales de los mensajes
    const topicMentions = new Map<string, { count: number, sentimentSum: number, sentimentCount: number }>();
    
    // Palabras clave para diferentes temas
    const topicKeywords = {
      "Estudios Bíblicos": ["biblia", "estudio", "estudiar", "versículo", "palabra", "escritura", "libro"],
      "Oraciones y Peticiones": ["oración", "orar", "petición", "bendición", "intercesión", "ruego"],
      "Consultas Espirituales": ["espiritual", "fe", "dios", "jesús", "cristo", "señor", "espíritu"],
      "Enseñanzas": ["enseñanza", "predicación", "sermón", "mensaje", "doctrina", "verdad"],
      "Consejos Pastorales": ["consejo", "pastoral", "ayuda", "guía", "dirección", "sabiduría"],
      "Preguntas Generales": ["pregunta", "duda", "consulta", "información", "explicar", "entender"]
    };
    
    // Palabras que indican sentimiento positivo/negativo
    const positiveWords = ["bien", "bueno", "excelente", "gracias", "bendición", "alegría", "paz", "amor"];
    const negativeWords = ["problema", "dificultad", "triste", "preocupado", "dolor", "conflicto", "crisis"];
    
    // Analizar cada mensaje
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      
      // Calcular sentimiento básico del mensaje
      const positiveCount = positiveWords.filter(word => content.includes(word)).length;
      const negativeCount = negativeWords.filter(word => content.includes(word)).length;
      let sentiment = 50; // Neutral
      
      if (positiveCount > negativeCount) {
        sentiment = 70 + (positiveCount * 5);
      } else if (negativeCount > positiveCount) {
        sentiment = 30 - (negativeCount * 5);
      }
      
      sentiment = Math.max(0, Math.min(100, sentiment)); // Clamp entre 0-100
      
      // Buscar temas en el mensaje
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        const mentions = keywords.filter(keyword => content.includes(keyword)).length;
        if (mentions > 0) {
          const current = topicMentions.get(topic) || { count: 0, sentimentSum: 0, sentimentCount: 0 };
          topicMentions.set(topic, {
            count: current.count + mentions,
            sentimentSum: current.sentimentSum + sentiment,
            sentimentCount: current.sentimentCount + 1
          });
        }
      });
    });
    
    // Si no hay menciones, retornar array vacío
    if (topicMentions.size === 0) {
      return [];
    }
    
    // Convertir a array y calcular sentimiento promedio
    return Array.from(topicMentions.entries())
      .map(([topic, data]) => ({
        topic,
        frequency: data.count,
        sentiment: Math.round(data.sentimentSum / data.sentimentCount)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5); // Top 5 temas
  }
  
  private distributeRandomly(total: number, parts: number): number[] {
    const result: number[] = [];
    let remaining = total;
    
    // Distribuir la mayor parte aleatoriamente
    for (let i = 0; i < parts - 1; i++) {
      // Asegurar que cada parte reciba al menos 1 y no más del 60% del restante
      const max = Math.floor(remaining * 0.6);
      const min = 1;
      const value = Math.floor(Math.random() * (max - min + 1)) + min;
      result.push(value);
      remaining -= value;
    }
    
    // Asignar el restante a la última parte
    result.push(Math.max(1, remaining));
    
    return result;
  }

  // Subscription methods
  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    return await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    const result = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .limit(1);
    return result[0];
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions)
      .values(subscription)
      .returning();
    return result[0];
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription> {
    const now = new Date();
    const result = await db.update(subscriptions)
      .set({ ...data, updatedAt: now })
      .where(eq(subscriptions.id, id))
      .returning();
    return result[0];
  }

  async incrementSubscriptionUsage(id: number): Promise<void> {
    const subscription = await this.getSubscription(id);
    if (subscription) {
      await db.update(subscriptions)
        .set({ interactionsUsed: (subscription.interactionsUsed + 1) })
        .where(eq(subscriptions.id, id));
    }
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const result = await db.select()
      .from(users)
      .where(eq(users.stripeCustomerId, stripeCustomerId))
      .limit(1);
    return result[0];
  }

  async updateUserStripeInfo(userId: number, data: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<User> {
    const result = await db.update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }
  
  // Métodos para códigos de descuento
  async getDiscountCodes(): Promise<DiscountCode[]> {
    return await db.select().from(discountCodes);
  }

  async getActiveDiscountCodes(): Promise<DiscountCode[]> {
    return await db.select()
      .from(discountCodes)
      .where(eq(discountCodes.isActive, true));
  }

  async getDiscountCode(id: number): Promise<DiscountCode | undefined> {
    const result = await db.select()
      .from(discountCodes)
      .where(eq(discountCodes.id, id))
      .limit(1);
    return result[0];
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const result = await db.select()
      .from(discountCodes)
      .where(eq(discountCodes.code, code))
      .limit(1);
    return result[0];
  }

  async createDiscountCode(data: InsertDiscountCode): Promise<DiscountCode> {
    const result = await db.insert(discountCodes)
      .values(data)
      .returning();
    return result[0];
  }

  async updateDiscountCode(id: number, data: Partial<DiscountCode>): Promise<DiscountCode> {
    const result = await db.update(discountCodes)
      .set(data)
      .where(eq(discountCodes.id, id))
      .returning();
    return result[0];
  }

  async incrementDiscountCodeUsage(id: number): Promise<void> {
    const discountCode = await this.getDiscountCode(id);
    if (discountCode) {
      await db.update(discountCodes)
        .set({ usageCount: (discountCode.usageCount + 1) })
        .where(eq(discountCodes.id, id));
    }
  }

  async deleteDiscountCode(id: number): Promise<void> {
    await db.delete(discountCodes)
      .where(eq(discountCodes.id, id));
  }

  // Generar un código de descuento aleatorio
  generateDiscountCode(prefix: string = 'AIPPS'): string {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${randomPart}`;
  }
  
  // Pricing Plan methods
  async getPricingPlans(): Promise<PricingPlan[]> {
    return await db.select().from(pricingPlans);
  }

  async getAvailablePricingPlans(): Promise<PricingPlan[]> {
    return await db.select()
      .from(pricingPlans)
      .where(eq(pricingPlans.available, true));
  }

  async getPricingPlan(id: number): Promise<PricingPlan | undefined> {
    const result = await db.select()
      .from(pricingPlans)
      .where(eq(pricingPlans.id, id))
      .limit(1);
    return result[0];
  }

  async getPricingPlanByPlanId(planId: string): Promise<PricingPlan | undefined> {
    const result = await db.select()
      .from(pricingPlans)
      .where(eq(pricingPlans.planId, planId))
      .limit(1);
    return result[0];
  }

  async createPricingPlan(data: InsertPricingPlan): Promise<PricingPlan> {
    const result = await db.insert(pricingPlans)
      .values(data)
      .returning();
    return result[0];
  }

  async updatePricingPlan(id: number, data: Partial<PricingPlan>): Promise<PricingPlan> {
    const now = new Date();
    const result = await db.update(pricingPlans)
      .set({ ...data, updatedAt: now })
      .where(eq(pricingPlans.id, id))
      .returning();
    return result[0];
  }

  async deletePricingPlan(id: number): Promise<void> {
    await db.delete(pricingPlans)
      .where(eq(pricingPlans.id, id));
  }

  //========== Formularios (Forms) ==========//
  
  // Form methods
  async getForms(userId: number): Promise<Form[]> {
    return await db.select().from(forms).where(eq(forms.userId, userId));
  }

  async getForm(id: number): Promise<Form | undefined> {
    const result = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
    return result[0];
  }

  async getFormBySlug(slug: string): Promise<Form | undefined> {
    const result = await db.select().from(forms).where(eq(forms.slug, slug)).limit(1);
    return result[0];
  }

  async createForm(formData: InsertForm): Promise<Form> {
    const result = await db.insert(forms).values(formData).returning();
    return result[0];
  }

  async updateForm(id: number, data: Partial<Form>): Promise<Form> {
    const now = new Date();
    const result = await db.update(forms)
      .set({ ...data, updatedAt: now })
      .where(eq(forms.id, id))
      .returning();
    return result[0];
  }

  async incrementFormResponseCount(id: number | null | undefined): Promise<void> {
    if (!id) return;
    
    const form = await this.getForm(id);
    if (form) {
      await db.update(forms)
        .set({ responseCount: (form.responseCount || 0) + 1 })
        .where(eq(forms.id, id));
    }
  }

  async deleteForm(id: number): Promise<void> {
    // Eliminar todas las respuestas asociadas al formulario
    await db.delete(formResponses)
      .where(eq(formResponses.formId, id));
      
    // Eliminar el formulario
    await db.delete(forms)
      .where(eq(forms.id, id));
  }

  // Form Template methods
  async getFormTemplates(): Promise<FormTemplate[]> {
    return await db.select().from(formTemplates);
  }

  async getDefaultFormTemplates(): Promise<FormTemplate[]> {
    return await db.select().from(formTemplates).where(eq(formTemplates.isDefault, true));
  }

  async getTemplatesByType(type: string): Promise<FormTemplate[]> {
    return await db.select().from(formTemplates).where(eq(formTemplates.type, type));
  }

  async getFormTemplate(id: number): Promise<FormTemplate | undefined> {
    const result = await db.select().from(formTemplates).where(eq(formTemplates.id, id)).limit(1);
    return result[0];
  }

  async createFormTemplate(templateData: InsertFormTemplate): Promise<FormTemplate> {
    const result = await db.insert(formTemplates).values(templateData).returning();
    return result[0];
  }

  async updateFormTemplate(id: number, data: Partial<FormTemplate>): Promise<FormTemplate> {
    const now = new Date();
    const result = await db.update(formTemplates)
      .set({ ...data, updatedAt: now })
      .where(eq(formTemplates.id, id))
      .returning();
    return result[0];
  }

  async deleteFormTemplate(id: number): Promise<void> {
    await db.delete(formTemplates)
      .where(eq(formTemplates.id, id));
  }

  // Form Response methods
  async getFormResponses(formId: number): Promise<FormResponse[]> {
    return await db.select()
      .from(formResponses)
      .where(eq(formResponses.formId, formId))
      .orderBy(formResponses.submittedAt);
  }

  async getFormResponse(id: number): Promise<FormResponse | undefined> {
    const result = await db.select().from(formResponses).where(eq(formResponses.id, id)).limit(1);
    return result[0];
  }

  async createFormResponse(responseData: InsertFormResponse): Promise<FormResponse> {
    const result = await db.insert(formResponses).values(responseData).returning();
    
    // Incrementar el contador de respuestas del formulario
    if (responseData.formId) {
      await this.incrementFormResponseCount(responseData.formId);
    }
    
    return result[0];
  }

  async deleteFormResponse(id: number): Promise<void> {
    await db.delete(formResponses)
      .where(eq(formResponses.id, id));
  }

  async deleteFormResponses(formId: number): Promise<void> {
    await db.delete(formResponses)
      .where(eq(formResponses.formId, formId));
  }

  // Métodos para agendamiento de citas
  async getAppointments(integrationId: number): Promise<Appointment[]> {
    return await db.select()
      .from(appointments)
      .where(eq(appointments.integrationId, integrationId))
      .orderBy(appointments.appointmentDate, appointments.appointmentTime);
  }

  async getAppointmentsByConversation(conversationId: number): Promise<Appointment[]> {
    return await db.select()
      .from(appointments)
      .where(eq(appointments.conversationId, conversationId))
      .orderBy(appointments.appointmentDate, appointments.appointmentTime);
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const result = await db.select()
      .from(appointments)
      .where(eq(appointments.id, id))
      .limit(1);
    return result[0];
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments)
      .values(appointmentData)
      .returning();
    return result[0];
  }

  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment> {
    const now = new Date();
    const result = await db.update(appointments)
      .set({ ...data, updatedAt: now })
      .where(eq(appointments.id, id))
      .returning();
    return result[0];
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    return this.updateAppointment(id, { status });
  }

  async updateCalendarEventId(id: number, calendarEventId: string, calendarProvider: string): Promise<Appointment> {
    return this.updateAppointment(id, { calendarEventId, calendarProvider });
  }

  async markReminderSent(id: number): Promise<Appointment> {
    return this.updateAppointment(id, { reminderSent: true });
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments)
      .where(eq(appointments.id, id));
  }

  // Obtener citas próximas para enviar recordatorios
  async getUpcomingAppointmentsForReminders(): Promise<Appointment[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.status, 'confirmed'),
          eq(appointments.reminderSent, false),
          eq(appointments.appointmentDate, tomorrow.toISOString().split('T')[0])
        )
      );
  }

  // Calendar OAuth Token methods
  async getCalendarTokens(userId: number): Promise<CalendarToken[]> {
    return await db.select()
      .from(calendarTokens)
      .where(eq(calendarTokens.userId, userId));
  }

  async getCalendarToken(id: number): Promise<CalendarToken | undefined> {
    const result = await db.select()
      .from(calendarTokens)
      .where(eq(calendarTokens.id, id))
      .limit(1);
    return result[0];
  }

  async getCalendarTokenByProvider(userId: number, provider: string): Promise<CalendarToken | undefined> {
    const result = await db.select()
      .from(calendarTokens)
      .where(
        and(
          eq(calendarTokens.userId, userId),
          eq(calendarTokens.provider, provider)
        )
      )
      .limit(1);
    return result[0];
  }

  async createCalendarToken(tokenData: InsertCalendarToken): Promise<CalendarToken> {
    const result = await db.insert(calendarTokens)
      .values(tokenData)
      .returning();
    return result[0];
  }

  async updateCalendarToken(id: number, data: Partial<CalendarToken>): Promise<CalendarToken> {
    const now = new Date();
    const result = await db.update(calendarTokens)
      .set({ ...data, updatedAt: now })
      .where(eq(calendarTokens.id, id))
      .returning();
    return result[0];
  }

  async deleteCalendarToken(id: number): Promise<void> {
    await db.delete(calendarTokens)
      .where(eq(calendarTokens.id, id));
  }

  // Analytics methods
  async getDashboardStats(userId: number): Promise<{ totalConversations: number; resolutionRate: number; averageResponseTime: number; }> {
    // Obtener las integraciones del usuario
    const userIntegrations = await this.getIntegrations(userId);
    const integrationIds = userIntegrations.map(integration => integration.id);
    
    if (integrationIds.length === 0) {
      return {
        totalConversations: 0,
        resolutionRate: 0,
        averageResponseTime: 0
      };
    }
    
    // Obtener todas las conversaciones para las integraciones del usuario
    const allConversations = await db.select()
      .from(conversations)
      .where(inArray(conversations.integrationId, integrationIds));
    
    const totalConversations = allConversations.length;
    const resolvedConversations = allConversations.filter(conv => conv.resolved).length;
    const resolutionRate = totalConversations > 0 ? (resolvedConversations / totalConversations) * 100 : 0;
    
    // Calcular tiempo promedio de respuesta
    const totalDuration = allConversations.reduce((sum, conv) => sum + (conv.duration || 0), 0);
    const averageResponseTime = totalConversations > 0 ? totalDuration / totalConversations / 60 : 0;
    
    return {
      totalConversations,
      resolutionRate,
      averageResponseTime
    };
  }

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
    const allConversations = await db.select()
      .from(conversations)
      .where(inArray(conversations.integrationId, integrationIds));
    
    // Obtener todos los mensajes de estas conversaciones
    const conversationIds = allConversations.map(conv => conv.id);
    const allMessages = conversationIds.length > 0 
      ? await db.select()
          .from(messages)
          .where(inArray(messages.conversationId, conversationIds))
      : [];
    
    // Filtrar mensajes de usuarios (no del asistente)
    const userMessages = allMessages.filter(msg => msg.role === 'user');
    
    // Generar datos de tendencia de conversaciones
    const conversationsByDay = this.getConversationTrend(allConversations);
    
    // Extraer palabras clave y su frecuencia
    const keywordFrequency = this.extractKeywords(userMessages);
    
    // Identificar productos/servicios mencionados
    const topProducts = this.extractTopProducts(userMessages);
    
    // Analizar temas y sentimiento
    const topTopics = this.extractTopTopics(userMessages);
    
    return {
      topProducts,
      topTopics,
      conversationsByDay,
      keywordFrequency
    };
  }

  async getIntegrationPerformance(userId: number): Promise<IntegrationPerformance[]> {
    // Obtener las integraciones del usuario
    const userIntegrations = await this.getIntegrations(userId);
    
    if (userIntegrations.length === 0) return [];
    
    // Crear array para almacenar el rendimiento de cada integración
    const performanceData: IntegrationPerformance[] = [];
    
    // Analizar cada integración
    for (const integration of userIntegrations) {
      // Obtener conversaciones para esta integración
      const integrationConversations = await this.getConversations(integration.id);
      
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
  
  // Funciones auxiliares para el análisis de datos
  
  public getConversationTrend(convs: Conversation[]): { date: string, count: number }[] {
    // Crear un mapa para contar conversaciones por día
    const dateCountMap = new Map<string, number>();
    
    // Inicializar los últimos 30 días con cero conversaciones
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - 29 + i);
      const dateStr = date.toISOString().split('T')[0];
      dateCountMap.set(dateStr, 0);
    }
    
    // Contar conversaciones por día
    convs.forEach(conv => {
      if (conv.createdAt) {
        const dateStr = new Date(conv.createdAt).toISOString().split('T')[0];
        if (dateCountMap.has(dateStr)) {
          dateCountMap.set(dateStr, (dateCountMap.get(dateStr) || 0) + 1);
        }
      }
    });
    
    // Convertir a array y ordenar por fecha
    return Array.from(dateCountMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  public extractKeywords(userMessages: Message[]): { keyword: string, frequency: number }[] {
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
    return Array.from(wordCount.entries())
      .map(([keyword, frequency]) => ({ keyword, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20);
  }
  
  public extractTopProducts(userMessages: Message[]): TopProduct[] {
    // En una implementación real, esto usaría NLP para extraer entidades
    // Para demo, devolvemos datos representativos
    return [
      { name: "Asistencia Técnica", count: 156, percentage: 42 },
      { name: "Plan Premium", count: 89, percentage: 24 },
      { name: "Facturación", count: 67, percentage: 18 },
      { name: "Configuración Inicial", count: 45, percentage: 12 },
      { name: "Sugerencias", count: 15, percentage: 4 }
    ];
  }
  
  public extractTopTopics(userMessages: Message[]): TopTopic[] {
    // En una implementación real, esto usaría análisis de temas y sentimiento
    // Para demo, devolvemos datos representativos
    return [
      { topic: "Problemas de conexión", count: 124, sentiment: 35 },
      { topic: "Rendimiento del sistema", count: 98, sentiment: 62 },
      { topic: "Funcionalidades nuevas", count: 76, sentiment: 85 },
      { topic: "Precios y facturación", count: 64, sentiment: 48 },
      { topic: "Atención al cliente", count: 58, sentiment: 75 }
    ];
  }
}