import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyToken, JWT_SECRET, authenticateJWT, isAdmin as authIsAdmin } from "./middleware/auth";
import { getInteractionLimitByTier } from "./middleware/subscription";
import { generateApiKey } from "./lib/utils";
import { generateChatCompletion, analyzeSentiment, summarizeText } from "./lib/openai";
import stripe, { 
  PRODUCTS,
  ProductInfo,
  createOrRetrieveProduct,
  createOrUpdatePrice,
  createCheckoutSession,
  createOrUpdateCustomer,
  retrieveSubscription,
  updateSubscription,
  cancelSubscription,
  handleWebhookEvent
} from "./lib/stripe";
import { createOrUpdateStripeProduct, syncPlansWithStripe } from "./lib/stripe-utils";
import { webscraper } from "./lib/webscraper";
import { documentProcessor } from "./lib/document-processor";
import { 
  createGoogleCalendarEvent, 
  getGoogleAuthUrl,
  updateGoogleCalendarEvent,
  exchangeCodeForTokens as exchangeGoogleCodeForTokens,
  deleteGoogleCalendarEvent as cancelGoogleCalendarEvent
} from "./lib/google-calendar";
import { 
  createOutlookCalendarEvent, 
  getOutlookAuthUrl,
  updateOutlookCalendarEvent,
  exchangeCodeForTokens as exchangeOutlookCodeForTokens,
  deleteOutlookCalendarEvent as cancelOutlookCalendarEvent
} from "./lib/outlook-calendar";
import { 
  sendAppointmentConfirmation, 
  sendAppointmentReminder,
  sendAppointmentUpdateNotification,
  sendAppointmentCancellationNotification
} from "./lib/aws-email";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { insertUserSchema, insertIntegrationSchema, insertMessageSchema, insertSitesContentSchema, insertPricingPlanSchema } from "@shared/schema";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { db, pool } from "./db";

// Obtener el equivalente a __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para manejar subida de archivos
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Crear carpeta uploads si no existe
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      // Generar nombre único para evitar colisiones
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
  // Limitar tipos de archivos aceptados
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado. Solo se permiten PDF, DOCX, Excel y TXT.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // Limitar a 10MB por archivo
  }
});

// Función para obtener las características de cada plan según su nivel
function getFeaturesByTier(tier: string): string[] {
  switch (tier) {
    case 'basic':
      return [
        "Hasta 500 interacciones mensuales",
        "Incluye todas las funcionalidades del Paquete Gratuito",
        "Carga y procesamiento de documentos específicos (PDF, DOCX, Excel)",
        "Captura básica de leads con almacenamiento de información de contacto",
        "Análisis detallados de interacciones y consultas frecuentes"
      ];
    case 'professional':
      return [
        "Hasta 2,000 interacciones mensuales",
        "Incluye todas las funcionalidades del Paquete Básico",
        "Integración en pantalla completa tipo ChatGPT para una experiencia más inmersiva",
        "Automatización de tareas frecuentes y programación de seguimientos",
        "Análisis avanzados con métricas de rendimiento y tendencias",
        "Soporte prioritario"
      ];
    case 'enterprise':
      return [
        "Interacciones ilimitadas",
        "Incluye todas las funcionalidades del Paquete Profesional",
        "Personalización avanzada del asistente virtual (tono, estilo, branding)",
        "Integración con sistemas CRM y otras plataformas empresariales",
        "Análisis personalizados y reportes a medida",
        "Soporte dedicado con gestor de cuenta asignado"
      ];
    case 'free':
    default:
      return [
        "Hasta 20 interacciones por día",
        "Acceso al widget flotante para integración sencilla en el sitio web",
        "Respuestas basadas en la información disponible públicamente en el sitio web",
        "Sin personalización ni carga de documentos específicos",
        "Sin captura de leads ni seguimiento posterior",
        "Análisis básicos de interacciones"
      ];
  }
}

// Función para crear una integración interna específica para el sitio web principal
async function createInternalWebsiteIntegration() {
  try {
    // Verificar si ya existe la integración interna
    const existingIntegration = await storage.getIntegrationByApiKey("aipi_web_internal");
    
    if (existingIntegration) {
      console.log("La integración interna para el sitio web principal ya existe");
      return;
    }
    
    // Crear la integración interna
    await storage.createIntegration({
      name: "AIPI Web Integration",
      url: "localhost",
      userId: 1, // Usuario Pablo
      themeColor: "#6366f1",
      position: "bottom-right",
      botBehavior: "Eres AIPI, un asistente integrado en el sitio web principal de AIPI. Tu objetivo es ayudar a los usuarios a entender cómo funciona la plataforma, sus características y beneficios. Debes ser informativo, profesional y claro en tus respuestas. Brinda ejemplos concretos de cómo se puede utilizar AIPI en diferentes contextos.",
      widgetType: "floating",
      apiKey: "aipi_web_internal",
      documentsData: []
    });
    
    console.log("Se ha creado la integración interna para el sitio web principal");
  } catch (error) {
    console.error("Error al crear integración interna:", error);
  }
}

// Usando el middleware isAdmin desde middleware/auth.ts
// Definir el middleware isAdmin como función para poder usarlo en las rutas existentes
const isAdmin = authIsAdmin;

export async function registerRoutes(app: Express): Promise<Server> {
  // Crear integración interna para el sitio principal
  await createInternalWebsiteIntegration();
  
  // Servir archivos estáticos desde la carpeta /static
  const staticDir = path.join(__dirname, '../public/static');
  console.log('Sirviendo archivos estáticos desde:', staticDir);
  app.use('/static', express.static(staticDir));
  
  // API routes
  const apiRouter = app.route("/api");
  
  // ================ Auth Routes ================
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);
      
      // Generate API key
      const apiKey = generateApiKey();
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        apiKey
      });
      
      // Create default settings for the user
      await storage.createSettings({ userId: user.id });
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Get user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Create token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      // Set cookie
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: true, // Siempre usar secure en entornos de desarrollo Replit
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "none", // Usar "none" para permitir cookies cross-origin en Replit
        path: "/",
      });
      
      console.log("Login successful for user:", user.username);
      console.log("Token created:", token);
      
      // Return user without password and también incluir el token en la respuesta
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        token: token // Incluimos el token en la respuesta para usarlo como Bearer token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.json({ message: "Logged out successfully" });
  });
  
  // Endpoint para obtener el token actual para debugging
  app.get("/api/auth/token", verifyToken, (req, res) => {
    try {
      const token = jwt.sign({ userId: req.userId }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token });
    } catch (error) {
      console.error("Get token error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", verifyToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("Usuario autenticado encontrado:", user.username);
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ================ Dashboard Routes ================
  app.get("/api/dashboard/stats", verifyToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.userId);
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // API para obtener los análisis de conversaciones (con datos reales)
  // Obtener analíticas para una integración específica
  app.get("/api/analytics/integration/:integrationId", authenticateJWT, async (req, res) => {
    try {
      const integrationId = parseInt(req.params.integrationId);
      
      // Verificar que la integración pertenece al usuario
      const integration = await storage.getIntegration(integrationId);
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      if (integration.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Obtener las conversaciones para esta integración
      const conversations = await storage.getConversations(integrationId);
      
      // Calcular estadísticas básicas
      const totalConversations = conversations.length;
      const resolvedConversations = conversations.filter(conv => conv.resolved).length;
      const resolutionRate = totalConversations > 0 ? resolvedConversations / totalConversations : 0;
      
      // Obtener todos los mensajes de estas conversaciones
      let allMessages = [];
      for (const conversation of conversations) {
        const messages = await storage.getConversationMessages(conversation.id);
        allMessages.push(...messages);
      }
      
      // Extraer temas populares, productos, etc.
      // Generamos datos simples para temas populares (normalmente esto vendría de un análisis NLP)
      const topTopics = [
        { topic: "Soporte técnico", frequency: Math.floor(Math.random() * 50) + 10 },
        { topic: "Precios y planes", frequency: Math.floor(Math.random() * 40) + 5 },
        { topic: "Funcionalidades", frequency: Math.floor(Math.random() * 30) + 10 },
        { topic: "Integración", frequency: Math.floor(Math.random() * 25) + 5 },
        { topic: "Problemas de acceso", frequency: Math.floor(Math.random() * 20) + 5 }
      ];
      
      // Generamos datos simples para productos mencionados
      const topProducts = [
        { name: "Plan Básico", frequency: Math.floor(Math.random() * 30) + 5 },
        { name: "Plan Profesional", frequency: Math.floor(Math.random() * 40) + 10 },
        { name: "Plan Enterprise", frequency: Math.floor(Math.random() * 20) + 5 },
        { name: "Widget de Chat", frequency: Math.floor(Math.random() * 35) + 15 },
        { name: "Automatización", frequency: Math.floor(Math.random() * 25) + 5 }
      ];
      
      // Generamos datos de tendencia de conversaciones para los últimos 7 días
      const conversationsByDate = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Distribuir las conversaciones entre estos días
        let count = 0;
        if (conversations.length > 0) {
          // Asignar un número aleatorio de conversaciones a cada día, pero que sumen el total
          if (i === 0) { // El último día (hoy) toma las conversaciones restantes
            count = Math.max(0, conversations.length - conversationsByDate.reduce((acc, item) => acc + item.count, 0));
          } else {
            // Para los otros días, distribuir aleatoriamente pero dejar suficientes para los días restantes
            const remainingDays = i;
            const remainingConvs = conversations.length - conversationsByDate.reduce((acc, item) => acc + item.count, 0);
            const maxForThisDay = Math.floor(remainingConvs / (remainingDays + 1)) * 2;
            count = Math.min(Math.floor(Math.random() * maxForThisDay), remainingConvs);
          }
        }
        
        conversationsByDate.push({ date: dateStr, count });
      }
      
      res.json({
        integrationId,
        integrationName: integration.name,
        totalConversations,
        resolvedConversations,
        resolutionRate,
        messageCount: allMessages.length,
        userMessageCount: allMessages.filter(msg => msg.role === 'user').length,
        assistantMessageCount: allMessages.filter(msg => msg.role === 'assistant').length,
        topTopics,
        topProducts,
        conversationTrend: conversationsByDate
      });
    } catch (error) {
      console.error("Error getting integration analytics:", error);
      res.status(500).json({ message: "Error getting integration analytics" });
    }
  });

  app.get("/api/analytics/conversation", verifyToken, async (req, res) => {
    try {
      const userId = req.userId;
      
      // Utilizar la función de análisis de conversaciones que trabaja con datos reales
      const conversationAnalytics = await storage.getConversationAnalytics(userId);
      
      res.json(conversationAnalytics);
    } catch (error) {
      console.error("Error getting conversation analytics:", error);
      res.status(500).json({ message: "Error obteniendo análisis de conversaciones" });
    }
  });
  
  // API para obtener rendimiento de integraciones (con datos reales)
  app.get("/api/analytics/integration-performance", verifyToken, async (req, res) => {
    try {
      const userId = req.userId;
      
      // Utilizar la función que calcula el rendimiento de integraciones usando datos reales
      const performanceData = await storage.getIntegrationPerformance(userId);
      
      res.json(performanceData);
    } catch (error) {
      console.error("Error getting integration performance:", error);
      res.status(500).json({ message: "Error obteniendo rendimiento de integraciones" });
    }
  });
  
  // ================ Automation Routes ================
  app.get("/api/automations", verifyToken, async (req, res) => {
    try {
      const automations = await storage.getAutomations(req.userId);
      res.json(automations);
    } catch (error) {
      console.error("Get automations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/automations", verifyToken, async (req, res) => {
    try {
      const validatedData = z.object({
        name: z.string(),
        description: z.string(),
        status: z.enum(["active", "inactive", "in_testing"]),
        config: z.any(),
      }).parse(req.body);
      
      const automation = await storage.createAutomation({
        ...validatedData,
        userId: req.userId,
      });
      
      res.status(201).json(automation);
    } catch (error) {
      console.error("Create automation error:", error);
      res.status(400).json({ message: "Invalid automation data" });
    }
  });
  
  // ================ Integration Routes ================
  app.get("/api/integrations", verifyToken, async (req, res) => {
    try {
      const integrations = await storage.getIntegrations(req.userId);
      res.json(integrations);
    } catch (error) {
      console.error("Get integrations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/integrations", verifyToken, upload.array('documents'), async (req, res) => {
    try {
      console.log("Create integration request body:", req.body);
      console.log("User ID from token:", req.userId);
      
      // Comprobar si el usuario está tratando de crear una integración con el nombre restringido
      const isPablo = req.userId === 1; // ID del usuario Pablo
      const isReservdName = req.body.name === 'Techcolca21';
      
      if (isReservdName && !isPablo) {
        return res.status(403).json({ 
          message: "No puedes crear una integración con este nombre. Está reservado para el chat principal del sitio web." 
        });
      }
      
      // Obtenemos la API key del cuerpo de la solicitud
      const apiKey = req.body.apiKey || generateApiKey();
      
      // Extraemos solo los campos necesarios para la base de datos
      const integrationData = {
        name: req.body.name,
        url: req.body.url,
        themeColor: req.body.themeColor || "#3B82F6",
        position: req.body.position || "bottom-right",
        userId: req.userId,
        botBehavior: req.body.botBehavior || "Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web.",
        widgetType: req.body.widgetType || "bubble",
        ignoredSections: req.body.ignoredSections || [],
      };
      
      console.log("Cleaned integration data:", integrationData);
      
      // Preparar la información de los documentos subidos (si hay)
      const uploadedFiles = req.files as Express.Multer.File[];
      const documentsData = uploadedFiles ? uploadedFiles.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date()
      })) : [];
      
      console.log("Documentos subidos:", documentsData.length);
      
      // Creamos la integración con los datos del formulario y información de documentos
      const integration = await storage.createIntegration({
        ...integrationData,
        apiKey: apiKey,
        documentsData: documentsData
      });
      
      console.log("Integration created successfully:", integration);
      
      res.status(201).json(integration);
    } catch (error) {
      console.error("Create integration error:", error);
      
      // Si hubo un error, intentar eliminar archivos subidos para no dejar basura
      try {
        const uploadedFiles = req.files as Express.Multer.File[];
        if (uploadedFiles && uploadedFiles.length > 0) {
          uploadedFiles.forEach(file => {
            fs.unlinkSync(file.path);
            console.log(`Archivo temporal eliminado: ${file.path}`);
          });
        }
      } catch (cleanupError) {
        console.error("Error al limpiar archivos temporales:", cleanupError);
      }
      
      // Proporcionar más detalles sobre el error para depuración
      if (error instanceof Error) {
        res.status(400).json({ 
          message: "Invalid integration data", 
          error: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
      } else {
        res.status(400).json({ message: "Invalid integration data" });
      }
    }
  });
  
  // Obtener una integración específica
  app.get("/api/integrations/:id", verifyToken, async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      if (isNaN(integrationId)) {
        return res.status(400).json({ message: "Invalid integration ID" });
      }
      
      const integration = await storage.getIntegration(integrationId);
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      // Comprobar si es la integración principal (Techcolca21 en este caso) y si el usuario no es Pablo
      const isMainWebsiteIntegration = integration.name === 'Techcolca21';
      const isPablo = req.userId === 1; // ID del usuario Pablo
      
      if (isMainWebsiteIntegration && !isPablo) {
        return res.status(403).json({ message: "Solo Pablo puede configurar el chat principal del sitio web" });
      }
      
      // Verificar que el usuario es el propietario de la integración
      if (integration.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(integration);
    } catch (error) {
      console.error("Get integration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Actualizar una integración específica
  app.patch("/api/integrations/:id", verifyToken, async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      if (isNaN(integrationId)) {
        return res.status(400).json({ message: "Invalid integration ID" });
      }
      
      // Verificar que la integración existe
      const integration = await storage.getIntegration(integrationId);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      // Comprobar si es la integración principal (Techcolca21 en este caso) y si el usuario no es Pablo
      const isMainWebsiteIntegration = integration.name === 'Techcolca21';
      const isPablo = req.userId === 1; // ID del usuario Pablo
      
      if (isMainWebsiteIntegration && !isPablo) {
        return res.status(403).json({ message: "Solo Pablo puede configurar el chat principal del sitio web" });
      }
      
      // Verificar que el usuario es el propietario de la integración
      if (integration.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Actualizar los campos de la integración
      const updatedIntegration = await storage.updateIntegration(integrationId, {
        name: req.body.name,
        url: req.body.url,
        themeColor: req.body.themeColor,
        ignoredSections: req.body.ignoredSections || [],
        position: req.body.position,
        active: req.body.active,
        widgetType: req.body.widgetType,
        botBehavior: req.body.botBehavior
      });
      
      res.json(updatedIntegration);
    } catch (error) {
      console.error("Update integration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Eliminar una integración específica
  app.delete("/api/integrations/:id", verifyToken, async (req, res) => {
    try {
      const integrationId = parseInt(req.params.id);
      if (isNaN(integrationId)) {
        return res.status(400).json({ message: "Invalid integration ID" });
      }
      
      // Verificar que la integración existe
      const integration = await storage.getIntegration(integrationId);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      // Comprobar si es la integración principal (Techcolca21 en este caso) y si el usuario no es Pablo
      const isMainWebsiteIntegration = integration.name === 'Techcolca21';
      const isPablo = req.userId === 1; // ID del usuario Pablo
      
      if (isMainWebsiteIntegration && !isPablo) {
        return res.status(403).json({ message: "Solo Pablo puede eliminar el chat principal del sitio web" });
      }
      
      // Verificar que el usuario es el propietario de la integración
      if (integration.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Eliminar la integración
      await storage.deleteIntegration(integrationId);
      
      res.json({ message: "Integration deleted successfully" });
    } catch (error) {
      console.error("Delete integration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ================ Settings Routes ================
  app.get("/api/settings", verifyToken, async (req, res) => {
    try {
      const settings = await storage.getSettings(req.userId);
      res.json(settings);
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/settings", verifyToken, async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.userId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ================ Site Content Routes ================
  // Ruta para scraping de sitio web
  app.post("/api/scrape", verifyToken, async (req, res) => {
    try {
      const { url, integrationId, maxPages } = req.body;
      
      if (!url || !integrationId) {
        return res.status(400).json({ message: "URL and integrationId are required" });
      }
      
      // Verificar que la integración existe y pertenece al usuario
      const integration = await storage.getIntegration(parseInt(integrationId));
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      if (integration.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      console.log(`Iniciando scraping de sitio web: ${url} para integrationId: ${integrationId}`);
      
      // Realizar el scraping
      const scrapedData = await webscraper.scrapeSite(url, maxPages || 5);
      
      // Guardar el contenido extraído en la base de datos
      const savedContent = [];
      
      for (const pageContent of scrapedData.pages) {
        // Verificar si ya existe contenido para esta URL
        const existingContent = await storage.getSiteContentByUrl(integration.id, pageContent.url);
        
        if (existingContent) {
          // Actualizar contenido existente
          const updatedContent = await storage.updateSiteContent(existingContent.id, {
            content: pageContent.content,
            title: pageContent.title,
            lastUpdated: new Date()
          });
          savedContent.push(updatedContent);
        } else {
          // Crear nuevo contenido
          const newContent = await storage.createSiteContent({
            url: pageContent.url,
            content: pageContent.content,
            title: pageContent.title,
            integrationId: integration.id
          });
          savedContent.push(newContent);
        }
      }
      
      res.json({
        message: "Scraping completado con éxito",
        pagesProcessed: scrapedData.pagesProcessed,
        savedContent
      });
    } catch (error) {
      console.error("Error in scraping:", error);
      res.status(500).json({ 
        message: "Error durante el scraping del sitio", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Obtener todo el contenido del sitio para una integración
  app.get("/api/site-content/:integrationId", verifyToken, async (req, res) => {
    try {
      const integrationId = parseInt(req.params.integrationId);
      
      if (isNaN(integrationId)) {
        return res.status(400).json({ message: "Invalid integration ID" });
      }
      
      // Verificar que la integración existe y pertenece al usuario
      const integration = await storage.getIntegration(integrationId);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      if (integration.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const content = await storage.getSiteContent(integrationId);
      res.json(content);
    } catch (error) {
      console.error("Error getting site content:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Eliminar contenido del sitio por ID
  app.delete("/api/site-content/:id", verifyToken, async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      // Verificar que el contenido existe
      const content = await storage.updateSiteContent(contentId, {});
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      // Verificar que la integración pertenece al usuario
      const integration = await storage.getIntegration(content.integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteSiteContent(contentId);
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Error deleting site content:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ================ OpenAI Routes ================
  app.post("/api/openai/completion", async (req, res) => {
    try {
      const { messages, context } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }
      
      const completion = await generateChatCompletion(messages, context);
      res.json(completion);
    } catch (error) {
      console.error("OpenAI completion error:", error);
      res.status(500).json({ message: "Error generating completion" });
    }
  });
  
  app.post("/api/openai/sentiment", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      const sentiment = await analyzeSentiment(text);
      res.json(sentiment);
    } catch (error) {
      console.error("OpenAI sentiment analysis error:", error);
      res.status(500).json({ message: "Error analyzing sentiment" });
    }
  });
  
  app.post("/api/openai/summarize", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      const summary = await summarizeText(text);
      res.json({ summary });
    } catch (error) {
      console.error("OpenAI summarize error:", error);
      res.status(500).json({ message: "Error summarizing text" });
    }
  });
  
  // ================ Stripe Routes ================
  // No necesitamos inicializar los productos de Stripe aquí
  // Los productos se crean según sea necesario cuando alguien intenta suscribirse
  
  // Obtener los planes disponibles
  app.get("/api/pricing/plans", async (req, res) => {
    try {
      // Obtener los planes de precios de la base de datos
      const pricingPlans = await storage.getAvailablePricingPlans();
      
      // Transformar los planes para que coincidan con el formato que espera el frontend
      const products = pricingPlans.map(plan => ({
        id: plan.planId.toLowerCase(),
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency || "cad",
        interval: plan.interval,
        features: Array.isArray(plan.features) ? plan.features : getFeaturesByTier(plan.tier),
        tier: plan.tier,
        interactionsLimit: plan.interactionsLimit,
        isAnnual: plan.isAnnual,
        discount: plan.discount
      }));
      
      // Si no hay planes en la base de datos, utilizamos los planes predefinidos
      if (products.length === 0) {
        console.log("No hay planes en la base de datos, utilizando planes predefinidos");
        
        // Añadir todos los planes desde nuestras constantes PRODUCTS (como fallback)
        for (const [key, product] of Object.entries(PRODUCTS)) {
          if (product.available) {
            products.push({
              id: key.toLowerCase(),
              name: product.name,
              description: product.description,
              price: product.price / 100, // Convertir centavos a dólares para mostrar
              currency: product.currency || "cad", // Dólares canadienses por defecto
              interval: product.interval || "month", // Por defecto mensual
              features: product.features || getFeaturesByTier(key.toLowerCase()),
              tier: product.tier,
              interactionsLimit: product.interactionsLimit,
              isAnnual: product.isAnnual || false,
              discount: product.discount
            });
          }
        }
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error obteniendo planes:", error);
      res.status(500).json({ message: "Error obteniendo planes de precios" });
    }
  });
  
  // Iniciar proceso de checkout para un plan
  app.post("/api/pricing/checkout", verifyToken, async (req, res) => {
    try {
      const { planId, billingType } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "ID del plan es requerido" });
      }
      
      // Verificar si se ha seleccionado facturación anual o mensual
      const isAnnual = billingType === 'annual';
      
      // Si es el plan gratuito, activarlo directamente
      if (planId === "free") {
        // Obtener o crear suscripción gratuita para el usuario
        // TODO: Implementar lógica para suscripción gratuita
        return res.json({ 
          success: true, 
          message: "Plan gratuito activado", 
          redirectUrl: "/dashboard" 
        });
      }
      
      // Obtener información del usuario
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // Encontrar el producto correspondiente al plan seleccionado
      let priceId = "";
      let selectedProduct: ProductInfo | null = null;
      let productKey = planId.toLowerCase();
      
      // Si seleccionó facturación anual pero el planId no contiene 'annual', 
      // buscamos la versión anual del mismo plan
      if (isAnnual && !productKey.includes('annual')) {
        productKey = `${productKey}-annual`;
      }
      
      for (const [key, product] of Object.entries(PRODUCTS)) {
        if (key.toLowerCase() === productKey) {
          selectedProduct = product;
          break;
        }
      }
      
      if (!selectedProduct) {
        return res.status(404).json({ message: "Plan no encontrado" });
      }
      
      // Crear o recuperar producto en Stripe
      const stripeProduct = await createOrRetrieveProduct(selectedProduct);
      if (!stripeProduct) {
        return res.status(500).json({ message: "Error creando producto en Stripe" });
      }
      
      // Crear o actualizar precio en Stripe
      const price = await createOrUpdatePrice(
        stripeProduct, 
        selectedProduct.price, 
        selectedProduct.interval as 'month' | 'year' || 'month'
      );
      if (!price || !price.id) {
        return res.status(500).json({ message: "Error creando precio en Stripe" });
      }
      
      // Crear sesión de checkout
      const successUrl = `${req.protocol}://${req.get('host')}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${req.protocol}://${req.get('host')}/dashboard/subscription/cancel`;
      
      const session = await createCheckoutSession(
        user.stripeCustomerId || undefined,
        price.id,
        successUrl,
        cancelUrl
      );
      
      res.json({ 
        success: true, 
        sessionId: session.id,
        sessionUrl: session.url
      });
    } catch (error) {
      console.error("Error creando sesión de checkout:", error);
      res.status(500).json({ message: "Error procesando la solicitud de pago" });
    }
  });
  
  // Verificar status de suscripción después de un pago exitoso
  app.get("/api/subscription/verify", verifyToken, async (req, res) => {
    try {
      const sessionId = req.query.session_id as string;
      
      if (!sessionId) {
        return res.status(400).json({ success: false, message: "Se requiere ID de sesión" });
      }
      
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }
      
      // Verificar la sesión con Stripe
      if (!stripe) {
        return res.status(500).json({ success: false, message: "Stripe no está configurado" });
      }
      
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (!session) {
        return res.status(404).json({ success: false, message: "Sesión no encontrada" });
      }
      
      // Si la sesión fue exitosa y tiene una suscripción
      if (session.status === "complete" && session.subscription) {
        const subscriptionId = session.subscription as string;
        
        // Recuperar los detalles de la suscripción
        const subscription = await retrieveSubscription(subscriptionId);
        
        if (!subscription) {
          return res.status(404).json({ success: false, message: "Suscripción no encontrada" });
        }
        
        // Actualizar los datos del usuario en nuestra base de datos
        await storage.updateUserStripeInfo(user.id, {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId
        });
        
        // Retornar información de la suscripción
        const planItem = subscription.items.data[0];
        const productId = planItem.price.product as string;
        const product = await stripe.products.retrieve(productId);
        
        const transformedSubscription = {
          id: subscription.id,
          status: subscription.status,
          plan: product.name,
          interval: planItem.plan.interval,
          amount: planItem.price.unit_amount / 100, // Convertir de centavos a unidades
          currency: planItem.price.currency,
          currentPeriodStart: subscription.current_period_start * 1000, // Convertir a milisegundos
          currentPeriodEnd: subscription.current_period_end * 1000, // Convertir a milisegundos
        };
        
        return res.json({ success: true, subscription: transformedSubscription });
      } else {
        return res.status(400).json({ success: false, message: "La sesión no fue completada exitosamente" });
      }
    } catch (error: any) {
      console.error("Error verificando suscripción:", error);
      res.status(500).json({ success: false, message: error.message || "Error verificando el estado de la suscripción" });
    }
  });
  
  // Webhook para eventos de Stripe
  app.post("/api/webhook/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      // Verificar que la petición es legítima de Stripe
      let event;
      try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        // Si no hay webhook secret configurado, omitir verificación en desarrollo
        if (!webhookSecret && process.env.NODE_ENV !== 'production') {
          event = req.body;
        } else if (webhookSecret && stripe) {
          event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            webhookSecret
          );
        } else {
          return res.status(400).send('Webhook secret requerido en producción o Stripe no está configurado');
        }
      } catch (err: any) {
        console.error(`Error verificando webhook: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      
      // Procesar el evento utilizando nuestra función en lib/stripe
      await handleWebhookEvent(event);
      
      res.json({ received: true });
    } catch (error) {
      console.error('Error en webhook de Stripe:', error);
      res.status(500).json({ message: "Error procesando webhook" });
    }
  });
  
  // ================ Document Management Routes ================
  
  // Ruta para subir documentos adicionales a una integración existente
  app.post('/api/documents/upload', authenticateJWT, upload.array('documents'), async (req, res) => {
    try {
      const { integrationId } = req.body;
      
      if (!integrationId) {
        return res.status(400).json({ message: 'ID de integración no proporcionado' });
      }
      
      // Obtener la integración
      const integration = await storage.getIntegration(parseInt(integrationId));
      
      if (!integration) {
        return res.status(404).json({ message: 'Integración no encontrada' });
      }
      
      // Verificar que el usuario autenticado sea dueño de la integración
      const user = req.user as { id: number };
      if (integration.userId !== user.id) {
        return res.status(403).json({ message: 'No tienes permiso para modificar esta integración' });
      }
      
      const uploadedFiles = req.files as Express.Multer.File[];
      
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ message: 'No se subieron archivos' });
      }
      
      console.log(`Subiendo ${uploadedFiles.length} documentos a la integración ${integrationId}`);
      
      // Preparar la información de los documentos subidos
      const documentsData = uploadedFiles.map(file => ({
        id: crypto.randomUUID(),  // Asignar un ID único a cada documento
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        originalName: file.originalname,
      }));
      
      // Actualizar documentsData en la integración
      const currentDocs = Array.isArray(integration.documentsData) ? integration.documentsData : [];
      const updatedDocs = [...currentDocs, ...documentsData];
      
      console.log(`Actualizando integración ${integrationId} con ${updatedDocs.length} documentos`);
      
      // Actualizar la integración con los nuevos documentos
      const updatedIntegration = await storage.updateIntegration(integration.id, {
        documentsData: updatedDocs
      });
      
      console.log(`Integración actualizada correctamente. Nuevos documentos añadidos: ${documentsData.length}`);
      
      res.json({ 
        success: true, 
        message: `${documentsData.length} documentos subidos correctamente`,
        documents: documentsData,
        integration: updatedIntegration
      });
    } catch (error) {
      console.error('Error en carga de documentos:', error);
      res.status(500).json({ 
        message: 'Error al procesar la carga de documentos',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Ruta para eliminar un documento específico de una integración
  app.delete('/api/documents/:id', authenticateJWT, async (req, res) => {
    try {
      const documentId = req.params.id;
      console.log(`Intentando eliminar documento con ID: ${documentId}`);
      
      if (!documentId) {
        return res.status(400).json({ message: 'ID de documento no proporcionado' });
      }
      
      // Como necesitamos buscar en todas las integraciones del usuario para encontrar el documento,
      // primero obtenemos todas las integraciones del usuario autenticado
      const user = req.user as { id: number };
      const integrations = await storage.getIntegrations(user.id);
      
      // Buscar la integración que contiene el documento
      let foundIntegration = null;
      let foundDocumentIndex = -1;
      
      for (const integration of integrations) {
        if (Array.isArray(integration.documentsData)) {
          const docIndex = integration.documentsData.findIndex(doc => doc.id === documentId);
          if (docIndex !== -1) {
            foundIntegration = integration;
            foundDocumentIndex = docIndex;
            break;
          }
        }
      }
      
      if (!foundIntegration || foundDocumentIndex === -1) {
        return res.status(404).json({ message: 'Documento no encontrado' });
      }
      
      // Eliminar el archivo físico si existe
      const doc = foundIntegration.documentsData[foundDocumentIndex];
      if (doc.path && fs.existsSync(doc.path)) {
        fs.unlinkSync(doc.path);
      }
      
      // Eliminar el documento de la lista de documentos
      const updatedDocs = [...foundIntegration.documentsData];
      updatedDocs.splice(foundDocumentIndex, 1);
      
      console.log(`Actualizando integración ${foundIntegration.id} después de eliminar documento. Documentos restantes: ${updatedDocs.length}`);
      
      // Actualizar la integración con la lista de documentos actualizada
      await storage.updateIntegration(foundIntegration.id, {
        documentsData: updatedDocs
      });
      
      res.json({ 
        success: true, 
        message: 'Documento eliminado correctamente',
        integrationId: foundIntegration.id
      });
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      res.status(500).json({ 
        message: 'Error al eliminar el documento',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // ================ Subscription Routes ================

  // Obtener el estado de la suscripción del usuario
  app.get("/api/subscription/status", verifyToken, async (req, res) => {
    try {
      const userId = req.userId;
      
      // Obtener todas las suscripciones del usuario
      const subscriptions = await storage.getUserSubscriptions(userId);
      
      // Si no hay suscripciones, devolver el plan gratuito por defecto
      if (!subscriptions || subscriptions.length === 0) {
        return res.json({
          tier: "free",
          status: "active",
          interactionsLimit: getInteractionLimitByTier("free"),
          interactionsUsed: 0,
          expiresAt: null
        });
      }
      
      // Encontrar la suscripción activa más reciente (ordenadas por fecha de creación descendente)
      const activeSubscription = subscriptions
        .filter(sub => sub.status === "active")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      
      if (!activeSubscription) {
        return res.json({
          tier: "free",
          status: "active",
          interactionsLimit: getInteractionLimitByTier("free"),
          interactionsUsed: 0,
          expiresAt: null
        });
      }
      
      // Si hay una suscripción activa con Stripe, verificar su estado actual
      if (activeSubscription.stripeSubscriptionId) {
        try {
          const stripeSubscription = await retrieveSubscription(activeSubscription.stripeSubscriptionId);
          
          // Actualizar el estado si ha cambiado en Stripe
          if (stripeSubscription && stripeSubscription.status !== activeSubscription.status) {
            await storage.updateSubscription(activeSubscription.id, {
              status: stripeSubscription.status
            });
            activeSubscription.status = stripeSubscription.status;
          }
        } catch (stripeError) {
          console.error("Error verificando suscripción en Stripe:", stripeError);
          // Continuar con los datos que tenemos almacenados localmente
        }
      }
      
      // Devolver información de la suscripción activa
      res.json({
        id: activeSubscription.id,
        tier: activeSubscription.tier,
        status: activeSubscription.status,
        interactionsLimit: activeSubscription.interactionsLimit,
        interactionsUsed: activeSubscription.interactionsUsed,
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.endDate,
        stripeCustomerId: activeSubscription.stripeCustomerId,
        stripeSubscriptionId: activeSubscription.stripeSubscriptionId
      });
    } catch (error) {
      console.error("Error obteniendo estado de suscripción:", error);
      res.status(500).json({ message: "Error obteniendo estado de suscripción" });
    }
  });
  
  // Obtener los planes disponibles
  app.get("/api/subscription/plans", async (req, res) => {
    try {
      // Obtener los planes de precios disponibles desde la base de datos
      const pricingPlans = await storage.getAvailablePricingPlans();
      
      // Transformar los planes para que coincidan con el formato que espera el frontend
      const plans = pricingPlans.map(plan => ({
        id: plan.planId,
        tier: plan.tier,
        name: plan.name,
        description: plan.description,
        price: plan.price * 100, // Convertir a centavos para mantener compatibilidad con el formato existente
        priceDisplay: plan.priceDisplay,
        features: Array.isArray(plan.features) ? plan.features : getFeaturesByTier(plan.tier),
        interactionsLimit: plan.interactionsLimit,
        popular: plan.popular,
        available: plan.available,
        currency: plan.currency,
        interval: plan.interval,
        isAnnual: plan.isAnnual,
        discount: plan.discount,
        metadata: {
          tier: plan.tier,
          interactions: plan.interactionsLimit,
          isAnnual: plan.isAnnual
        }
      }));
      
      // Si no hay planes en la base de datos, utilizamos los planes predefinidos
      if (plans.length === 0) {
        console.log("No hay planes en la base de datos, utilizando planes predefinidos");
        
        const fallbackPlans = Object.entries(PRODUCTS)
          .filter(([_, plan]) => plan.available)
          .map(([id, plan]) => ({
            id,
            ...plan
          }));
        
        return res.json(fallbackPlans);
      }
      
      res.json(plans);
    } catch (error) {
      console.error("Error obteniendo planes:", error);
      res.status(500).json({ message: "Error obteniendo planes disponibles" });
    }
  });
  
  // Crear una nueva suscripción o actualizar la existente
  app.post("/api/subscription/checkout", verifyToken, async (req, res) => {
    try {
      const { planId, billingType } = req.body;
      if (!planId) {
        return res.status(400).json({ message: "Se requiere un ID de plan" });
      }
      
      // Verificar si se ha seleccionado facturación anual o mensual
      const isAnnual = billingType === 'annual';
      
      // Obtener el usuario actual
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // Construir la clave del producto según el plan y tipo de facturación
      let productKey = planId.toLowerCase();
      
      // Si seleccionó facturación anual pero el planId no contiene 'annual', 
      // buscamos la versión anual del mismo plan
      if (isAnnual && !productKey.includes('annual')) {
        productKey = `${productKey}-annual`;
      }
      
      // Encontrar el producto correspondiente al plan seleccionado
      const productInfo = PRODUCTS[productKey];
      if (!productInfo) {
        return res.status(404).json({ message: "Plan no encontrado" });
      }
      
      // Si es plan gratuito, crear una suscripción sin pasar por Stripe
      if (planId === 'free' || productInfo.price === 0) {
        // Revisar si ya existe una suscripción activa gratuita
        const existingSubs = await storage.getUserSubscriptions(req.userId);
        const activeFree = existingSubs.find(sub => 
          sub.tier === 'free' && sub.status === 'active'
        );
        
        if (activeFree) {
          return res.json({
            success: true,
            subscription: activeFree,
            message: "Ya tienes un plan gratuito activo"
          });
        }
        
        // Crear nueva suscripción gratuita
        const newSub = await storage.createSubscription({
          userId: req.userId,
          tier: 'free',
          status: 'active',
          interactionsLimit: getInteractionLimitByTier('free'),
          interactionsUsed: 0,
          startDate: new Date(),
          // El plan gratuito no tiene fecha de finalización
        });
        
        return res.json({
          success: true,
          subscription: newSub,
          message: "Plan gratuito activado con éxito"
        });
      }
      
      // Para planes pagos, procesar con Stripe
      // 1. Crear o recuperar producto en Stripe
      const product = await createOrRetrieveProduct(productInfo);
      if (!product) {
        return res.status(500).json({ message: "Error creando producto en Stripe" });
      }
      
      // 2. Crear o actualizar precio en Stripe
      const price = await createOrUpdatePrice(
        product, 
        productInfo.price,
        productInfo.interval as 'month' | 'year' || 'month'
      );
      if (!price) {
        return res.status(500).json({ message: "Error creando precio en Stripe" });
      }
      
      // 3. Crear o actualizar cliente en Stripe si el usuario tiene un email
      let customerId = user.stripeCustomerId;
      if (user.email) {
        const customer = await createOrUpdateCustomer(user.email, user.fullName || user.username, user.stripeCustomerId || undefined);
        if (customer) {
          customerId = customer.id;
          
          // Actualizar ID de cliente en la base de datos si es nuevo
          if (!user.stripeCustomerId) {
            // Esta función debería estar implementada en storage
            await storage.updateUserStripeInfo(user.id, {
              stripeCustomerId: customer.id,
              stripeSubscriptionId: user.stripeSubscriptionId || ''
            });
          }
        }
      }
      
      // 4. Crear sesión de checkout
      const successUrl = `${req.protocol}://${req.get('host')}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${req.protocol}://${req.get('host')}/dashboard/subscription/cancel`;
      
      const session = await createCheckoutSession(
        customerId || undefined,
        price.id,
        successUrl,
        cancelUrl
      );
      
      if (!session) {
        return res.status(500).json({ message: "Error creando sesión de checkout" });
      }
      
      res.json({ 
        success: true, 
        sessionId: session.id,
        sessionUrl: session.url,
        message: "Sesión de checkout creada con éxito"
      });
    } catch (error) {
      console.error("Error creando sesión de checkout:", error);
      res.status(500).json({ message: "Error procesando la solicitud de pago" });
    }
  });
  
  // Cancelar una suscripción activa
  app.post("/api/subscription/cancel", verifyToken, async (req, res) => {
    try {
      const userId = req.userId;
      const { subscriptionId } = req.body;
      
      if (!subscriptionId) {
        return res.status(400).json({ message: "Se requiere ID de suscripción" });
      }
      
      // Verificar que la suscripción existe y pertenece al usuario
      const subscription = await storage.getSubscription(subscriptionId);
      
      if (!subscription) {
        return res.status(404).json({ message: "Suscripción no encontrada" });
      }
      
      if (subscription.userId !== userId) {
        return res.status(403).json({ message: "No tienes permiso para cancelar esta suscripción" });
      }
      
      // Cancelar en Stripe si tiene ID de suscripción de Stripe
      if (subscription.stripeSubscriptionId) {
        try {
          await cancelSubscription(subscription.stripeSubscriptionId);
        } catch (stripeError) {
          console.error("Error cancelando suscripción en Stripe:", stripeError);
          // Continuar con la cancelación local incluso si falló en Stripe
        }
      }
      
      // Actualizar estado en nuestra base de datos
      const updated = await storage.updateSubscription(subscriptionId, {
        status: "canceled",
        endDate: new Date()
      });
      
      res.json({
        success: true,
        subscription: updated,
        message: "Suscripción cancelada con éxito"
      });
    } catch (error) {
      console.error("Error cancelando suscripción:", error);
      res.status(500).json({ message: "Error procesando la solicitud de cancelación" });
    }
  });
  
  // ================ Widget Routes ================
  app.get("/api/widget/:apiKey", async (req, res) => {
    try {
      const { apiKey } = req.params;
      
      // Validate API key and get integration
      const integration = await storage.getIntegrationByApiKey(apiKey);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      // Verificar si es la integración del sitio principal y restringir acceso
      // Las IDs son diferentes en tu entorno, en la estructura original el sitio web principal usa ID 0
      const isMainIntegration = integration.name === 'Techcolca21';
      const isPablo = req.userId === 1; // ID del usuario Pablo
      
      // Si es la integración principal y el usuario no es Pablo, verificar la operación
      if (isMainIntegration && req.path.includes('/edit') && !isPablo) {
        return res.status(403).json({ message: "Solo Pablo puede configurar el chat principal del sitio web" });
      }
      
      // Get user settings
      const settings = await storage.getSettings(integration.userId);
      
      // Update visitor count
      await storage.incrementVisitorCount(integration.id);
      
      // Return widget configuration
      res.json({
        integration: {
          id: integration.id,
          name: integration.name,
          url: integration.url,
          themeColor: integration.themeColor,
          position: integration.position,
          active: integration.active,
          visitorCount: integration.visitorCount,
          botBehavior: integration.botBehavior,
          widgetType: integration.widgetType || 'bubble', // Incluir tipo de widget, con valor por defecto
          // No enviamos datos sensibles como userId o apiKey al cliente
        },
        settings: {
          assistantName: settings.assistantName,
          defaultGreeting: settings.defaultGreeting,
          showAvailability: settings.showAvailability,
          userBubbleColor: settings.userBubbleColor,
          assistantBubbleColor: settings.assistantBubbleColor,
          font: settings.font,
          conversationStyle: settings.conversationStyle,
        },
      });
    } catch (error) {
      console.error("Get widget error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/widget/:apiKey/conversation", async (req, res) => {
    try {
      const { apiKey } = req.params;
      const { visitorId } = req.body;
      
      // Validate API key and get integration
      const integration = await storage.getIntegrationByApiKey(apiKey);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      // Create conversation
      const conversation = await storage.createConversation({
        integrationId: integration.id,
        visitorId,
      });
      
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/widget/:apiKey/message", async (req, res) => {
    try {
      const { apiKey } = req.params;
      const { conversationId, content, role, pageContext } = req.body;
      
      // Validate input
      if (!conversationId || !content || !role) {
        return res.status(400).json({ message: "conversationId, content, and role are required" });
      }
      
      // Validate API key and get integration
      const integration = await storage.getIntegrationByApiKey(apiKey);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      // Create message
      const message = await storage.createMessage({
        conversationId,
        content,
        role,
      });
      
      // If user message, generate AI response
      if (role === "user") {
        // Get conversation messages
        const messages = await storage.getConversationMessages(conversationId);
        
        // Get site content for context
        let context = "";
        
        // First check if there's page context from current page
        if (pageContext && pageContext.content) {
          console.log(`Recibido contenido de página actual: ${pageContext.url}`);
          
          // Store the current page content in the database for future use
          try {
            const existingContent = await storage.getSiteContentByUrl(integration.id, pageContext.url);
            
            if (existingContent) {
              // Update existing record
              await storage.updateSiteContent(existingContent.id, {
                content: pageContext.content,
                title: pageContext.title || null,
                // El campo lastUpdated se actualizará automáticamente en la base de datos
              });
              console.log(`Actualizado contenido existente para: ${pageContext.url}`);
            } else {
              // Create new record
              await storage.createSiteContent({
                integrationId: integration.id,
                url: pageContext.url,
                title: pageContext.title || null,
                content: pageContext.content,
                // Nota: lastUpdated se establece automáticamente como valor predeterminado en el esquema
              });
              console.log(`Almacenado nuevo contenido para: ${pageContext.url}`);
            }
          } catch (error) {
            console.error("Error al guardar contenido de página:", error);
            // Continúa con la ejecución incluso si hay error en el almacenamiento
          }
          
          // Use the current page content as context
          context = `Información de la página actual (${pageContext.url}):\nTítulo: ${pageContext.title || 'Sin título'}\n${pageContext.content}\n\nResponde basándote en esta información cuando sea relevante.`;
        } else {
          // If no current page context, use stored site content
          const siteContent = await storage.getSiteContent(integration.id);
          
          if (siteContent && siteContent.length > 0) {
            // Limitar la cantidad de contenido para no exceder tokens de OpenAI
            const combinedContent = siteContent
              .map(page => `Página: ${page.url}\nTítulo: ${page.title || 'Sin título'}\n${page.content}`)
              .join('\n\n')
              .slice(0, 10000); // Limitar a ~10k caracteres
              
            context = `Información del sitio web:\n${combinedContent}\n\nResponde usando esta información cuando sea relevante.`;
          }
        }
        
        // Procesar el contenido de los documentos, si existen
        let documentsContext = '';
        if (integration.documentsData && Array.isArray(integration.documentsData) && integration.documentsData.length > 0) {
          console.log(`Procesando ${integration.documentsData.length} documentos para contexto...`);
          
          try {
            // Procesar todos los documentos y extraer su contenido
            const processedDocs = await documentProcessor.processDocuments(integration.documentsData);
            
            if (processedDocs.length > 0) {
              // Crear contexto con el contenido de los documentos, limitando el tamaño total
              let totalContent = '';
              const maxContentLength = 8000; // Limitar a aproximadamente 8000 caracteres en total para no exceder límites de tokens
              
              for (const doc of processedDocs) {
                const docContent = `Documento: ${doc.originalName}\nContenido:\n${doc.content.substring(0, Math.min(doc.content.length, 2000))}${doc.content.length > 2000 ? '...(continúa)' : ''}`;
                
                // Si agregar este documento excedería el límite, paramos
                if (totalContent.length + docContent.length > maxContentLength) {
                  totalContent += `\n\n[Hay ${processedDocs.length - totalContent.split('Documento:').length + 1} documentos más que no se incluyen por limitaciones de espacio]`;
                  break;
                }
                
                totalContent += (totalContent ? '\n\n' : '') + docContent;
              }
              
              const docsContent = totalContent;
              
              documentsContext = `\n\nInformación de documentos cargados:\n${docsContent}\n\n`;
              console.log(`Procesados ${processedDocs.length} documentos para incluir en respuesta.`);
            }
          } catch (error) {
            console.error("Error al procesar documentos:", error);
            // Si hay error, incluimos solo los nombres como antes
            const docsInfo = integration.documentsData.map((doc: any) => 
              `Documento: ${doc.originalName} (${doc.mimetype})`
            ).join('\n');
            
            documentsContext = `\n\nInformación de documentos disponibles:\n${docsInfo}\n\n`;
          }
        }
        
        // Agregar comportamiento del bot al contexto, si existe
        if (integration.botBehavior) {
          const botBehaviorContext = `Instrucciones de comportamiento: ${integration.botBehavior}\n\n`;
          context = botBehaviorContext + (context || '');
        }
        
        // Añadir el contexto de los documentos
        if (documentsContext) {
          context = (context || '') + documentsContext;
        }
        
        console.log(`Generando respuesta con ${context ? 'contexto del sitio web y documentos' : 'sin contexto'}`);
        
        // Generate AI response
        const completion = await generateChatCompletion(
          messages.map(msg => ({ role: msg.role, content: msg.content })),
          context
        );
        
        // Save AI response
        const aiMessage = await storage.createMessage({
          conversationId,
          content: completion.message.content,
          role: "assistant",
        });
        
        // Return both messages
        res.status(201).json({
          userMessage: message,
          aiMessage,
        });
      } else {
        // Return the message
        res.status(201).json(message);
      }
    } catch (error) {
      console.error("Create message error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ================ Conversation Routes ================
  // Get all conversations for a user (from all their integrations)
  app.get("/api/conversations", authenticateJWT, async (req, res) => {
    try {
      // Obtener todas las integraciones del usuario
      const integrations = await storage.getIntegrations(req.userId);
      
      if (!integrations || integrations.length === 0) {
        return res.json([]);
      }
      
      // Obtener IDs de integraciones
      const integrationIds = integrations.map(integration => integration.id);
      
      // Array para almacenar todas las conversaciones
      let allConversations = [];
      
      // Obtener conversaciones para cada integración
      for (const integrationId of integrationIds) {
        const conversations = await storage.getConversations(integrationId);
        if (conversations && conversations.length > 0) {
          // Añadir información de la integración a cada conversación
          const integration = integrations.find(i => i.id === integrationId);
          const conversationsWithIntegration = conversations.map(conv => ({
            ...conv,
            integrationName: integration?.name || "Unknown Integration",
            integrationUrl: integration?.url || ""
          }));
          
          allConversations = [...allConversations, ...conversationsWithIntegration];
        }
      }
      
      // Ordenar por fecha de creación (más reciente primero)
      allConversations.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      res.json(allConversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get one conversation by ID
  app.get("/api/conversations/:id", authenticateJWT, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
      
      // Get conversation
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Verify that user owns the integration this conversation belongs to
      const integration = await storage.getIntegration(conversation.integrationId);
      
      if (!integration || integration.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized to view this conversation" });
      }
      
      // Get integration details to add to response
      const integrationData = {
        name: integration.name,
        url: integration.url
      };
      
      // Get message count for this conversation
      const messages = await storage.getConversationMessages(conversationId);
      const messageCount = messages.length;
      
      // Enhance the conversation with additional data
      const enhancedConversation = {
        ...conversation,
        integrationName: integration.name,
        integrationUrl: integration.url,
        messageCount
      };
      
      res.json(enhancedConversation);
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get conversations for a specific integration
  app.get("/api/integrations/:integrationId/conversations", authenticateJWT, async (req, res) => {
    try {
      const { integrationId } = req.params;
      
      // Verificar que la integración pertenece al usuario
      const integration = await storage.getIntegration(parseInt(integrationId));
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      if (integration.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const conversations = await storage.getConversations(parseInt(integrationId));
      res.json(conversations);
    } catch (error) {
      console.error("Get integration conversations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Get messages for a specific conversation
  app.get("/api/conversations/:conversationId/messages", authenticateJWT, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      
      // Verificar que la conversación existe
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Verificar que el usuario tiene acceso a esta conversación
      const integration = await storage.getIntegration(conversation.integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Get conversation messages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Serve the embed script
  app.get("/embed.js", (req, res) => {
    // Use import.meta.url instead of __dirname (which is not available in ES modules)
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    const embedScriptPath = path.resolve(currentDir, '../public/embed.js');
    
    // Check if file exists
    if (fs.existsSync(embedScriptPath)) {
      res.setHeader("Content-Type", "application/javascript");
      res.sendFile(embedScriptPath);
    } else {
      res.status(404).json({ message: "Embed script not found" });
    }
  });
  
  // Serve the fullscreen embed script
  app.get("/fullscreen-embed.js", (req, res) => {
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    const embedScriptPath = path.resolve(currentDir, '../public/fullscreen-embed.js');
    
    if (fs.existsSync(embedScriptPath)) {
      res.setHeader("Content-Type", "application/javascript");
      res.sendFile(embedScriptPath);
    } else {
      res.status(404).json({ message: "Fullscreen embed script not found" });
    }
  });
  
  // Serve test HTML file
  app.get("/test-fullscreen.html", (req, res) => {
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    const testFilePath = path.resolve(currentDir, '../test-fullscreen.html');
    
    if (fs.existsSync(testFilePath)) {
      res.setHeader("Content-Type", "text/html");
      res.sendFile(testFilePath);
    } else {
      res.status(404).json({ message: "Test file not found" });
    }
  });
  
  // Serve new test HTML file
  app.get("/test-fullscreen-new.html", (req, res) => {
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    const testFilePath = path.resolve(currentDir, '../public/test-fullscreen-new.html');
    
    if (fs.existsSync(testFilePath)) {
      res.setHeader("Content-Type", "text/html");
      res.sendFile(testFilePath);
    } else {
      res.status(404).json({ message: "New test file not found" });
    }
  });
  
  // Serve simple fullscreen HTML file
  app.get("/simple-fullscreen.html", (req, res) => {
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    const testFilePath = path.resolve(currentDir, '../public/simple-fullscreen.html');
    
    if (fs.existsSync(testFilePath)) {
      res.setHeader("Content-Type", "text/html");
      res.sendFile(testFilePath);
    } else {
      res.status(404).json({ message: "Simple fullscreen file not found" });
    }
  });
  
  // ================ Admin Routes ================
  // Obtener todos los usuarios con sus suscripciones (solo admin)
  app.get("/api/admin/users", authenticateJWT, isAdmin, async (req, res) => {
    try {
      // Obtener todos los usuarios con sus suscripciones en una sola consulta
      const queryResult = await pool.query(
        `SELECT 
          u.id, u.username, u.email, u.full_name, u.created_at, u.api_key, 
          u.stripe_customer_id, u.stripe_subscription_id,
          s.id as subscription_id, s.tier, s.interactions_limit, s.interactions_used, 
          s.status, s.start_date, s.end_date  
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id
        ORDER BY u.id ASC`
      );
      
      // Transformar el resultado plano en una estructura anidada
      const userMap = new Map();
      
      // Agrupar usuarios con sus suscripciones
      queryResult.rows.forEach(row => {
        if (!userMap.has(row.id)) {
          // Extraer datos del usuario
          userMap.set(row.id, {
            id: row.id,
            username: row.username,
            email: row.email,
            full_name: row.full_name,
            created_at: row.created_at,
            api_key: row.api_key,
            stripe_customer_id: row.stripe_customer_id,
            stripe_subscription_id: row.stripe_subscription_id,
            subscriptions: []
          });
        }
        
        // Añadir suscripción si existe
        if (row.subscription_id) {
          const user = userMap.get(row.id);
          user.subscriptions.push({
            id: row.subscription_id,
            tier: row.tier,
            status: row.status,
            interactions_limit: row.interactions_limit,
            interactions_used: row.interactions_used,
            start_date: row.start_date,
            end_date: row.end_date
          });
        }
      });
      
      // Convertir Map a Array
      const users = Array.from(userMap.values());
      console.log(`Encontrados ${users.length} usuarios con sus suscripciones`);
      
      res.json(users);
    } catch (error) {
      console.error("Error getting all users:", error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  });

  // Obtener detalles de un usuario específico (solo admin)
  app.get("/api/admin/users/:id", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuario inválido" });
      }
      
      // Obtener usuario
      const userResult = await pool.query(
        `SELECT id, username, email, full_name, created_at, 
          api_key, stripe_customer_id, stripe_subscription_id 
        FROM users WHERE id = $1`, 
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      const user = userResult.rows[0];
      
      // Obtener suscripciones del usuario
      const subscriptionsResult = await pool.query(
        `SELECT id, tier, status, interactions_limit, interactions_used, 
          created_at, start_date, end_date 
        FROM subscriptions 
        WHERE user_id = $1 
        ORDER BY created_at DESC`, 
        [userId]
      );
      
      // Obtener integraciones del usuario
      const integrationsResult = await pool.query(
        `SELECT id, name, url, theme_color, position, active, 
          api_key, visitor_count, created_at, bot_behavior, widget_type 
        FROM integrations 
        WHERE user_id = $1 
        ORDER BY created_at DESC`, 
        [userId]
      );
      
      // Obtener conversaciones del usuario a través de sus integraciones
      const conversationsResult = await pool.query(
        `SELECT c.id, c.integration_id, c.visitor_id, c.resolved, c.duration, 
          c.created_at, c.updated_at, i.name as integration_name 
        FROM conversations c 
        JOIN integrations i ON c.integration_id = i.id 
        WHERE i.user_id = $1 
        ORDER BY c.created_at DESC 
        LIMIT 100`, 
        [userId]
      );
      
      // Obtener estadísticas de uso
      const statsResult = await pool.query(
        `SELECT 
          COUNT(DISTINCT c.id) as total_conversations,
          COUNT(DISTINCT m.id) as total_messages,
          SUM(CASE WHEN c.resolved = true THEN 1 ELSE 0 END) as resolved_conversations,
          SUM(CASE WHEN m.role = 'assistant' THEN 1 ELSE 0 END) as assistant_messages,
          SUM(CASE WHEN m.role = 'user' THEN 1 ELSE 0 END) as user_messages
        FROM integrations i
        LEFT JOIN conversations c ON i.id = c.integration_id
        LEFT JOIN messages m ON c.id = m.conversation_id
        WHERE i.user_id = $1`,
        [userId]
      );
      
      // Calcular tokens aproximados (estimación básica)
      // Promedio de 4 caracteres por token para mensajes en español
      const messagesResult = await pool.query(
        `SELECT m.content 
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        JOIN integrations i ON c.integration_id = i.id
        WHERE i.user_id = $1
        AND m.role = 'assistant'`,
        [userId]
      );
      
      let totalTokensEstimation = 0;
      if (messagesResult.rows.length > 0) {
        // Estimación de tokens usados basada en el contenido de los mensajes
        messagesResult.rows.forEach(msg => {
          if (msg.content) {
            // Estimación aproximada: 1 token ≈ 4 caracteres en español
            totalTokensEstimation += Math.ceil(msg.content.length / 4);
          }
        });
      }
      
      // Construir la respuesta
      const response = {
        user,
        subscriptions: subscriptionsResult.rows,
        integrations: integrationsResult.rows,
        recentConversations: conversationsResult.rows,
        usage: {
          ...statsResult.rows[0],
          estimated_tokens: totalTokensEstimation
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error getting user details:", error);
      res.status(500).json({ message: "Error al obtener detalles del usuario" });
    }
  });

  // Crear un nuevo usuario (solo admin)
  app.post("/api/admin/users", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const { username, password, email, fullName, tier } = req.body;
      
      // Validar datos
      if (!username || !password || !email) {
        return res.status(400).json({ 
          message: "Se requieren username, password y email" 
        });
      }
      
      // Verificar si el usuario ya existe
      const checkUserResult = await pool.query(
        "SELECT id FROM users WHERE username = $1 OR email = $2",
        [username, email]
      );
      
      if (checkUserResult.rows.length > 0) {
        return res.status(400).json({ 
          message: "El nombre de usuario o email ya están en uso" 
        });
      }
      
      // Generar API key y hash de contraseña
      const apiKey = 'aipi_' + crypto.randomBytes(16).toString('hex');
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Insertar usuario
      const insertUserResult = await pool.query(
        `INSERT INTO users 
         (username, password, email, full_name, api_key, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id, username, email, full_name, api_key, created_at`,
        [username, hashedPassword, email, fullName, apiKey]
      );
      
      const newUser = insertUserResult.rows[0];
      
      // Crear suscripción según el tier especificado
      let interactions_limit = 20;
      let end_date = null;
      
      switch(tier) {
        case 'basic':
          interactions_limit = 500;
          // 30 días a partir de hoy
          end_date = new Date(new Date().setDate(new Date().getDate() + 30));
          break;
        case 'professional':
          interactions_limit = 2000;
          // 30 días a partir de hoy
          end_date = new Date(new Date().setDate(new Date().getDate() + 30));
          break;
        case 'enterprise':
          interactions_limit = 99999;
          // 365 días a partir de hoy
          end_date = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
          break;
        default: // free
          interactions_limit = 20;
          // Sin fecha de expiración (o usar null)
          end_date = null;
      }
      
      await pool.query(
        `INSERT INTO subscriptions 
         (user_id, tier, status, interactions_limit, interactions_used, 
          created_at, updated_at, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW(), $6)`,
        [newUser.id, tier || 'free', 'active', interactions_limit, 0, end_date]
      );
      
      res.status(201).json({
        message: "Usuario creado exitosamente",
        user: newUser
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error al crear usuario" });
    }
  });

  // Modificar un usuario existente (solo admin)
  app.patch("/api/admin/users/:id", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuario inválido" });
      }
      
      // Verificar que el usuario existe
      const checkUser = await pool.query(
        "SELECT id FROM users WHERE id = $1",
        [userId]
      );
      
      if (checkUser.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      const { username, email, fullName, password } = req.body;
      
      // Construir la consulta dinámicamente basada en los campos proporcionados
      let updateQuery = "UPDATE users SET ";
      const updateValues = [];
      const updateFields = [];
      
      let paramIndex = 1;
      
      if (username) {
        updateFields.push(`username = $${paramIndex}`);
        updateValues.push(username);
        paramIndex++;
      }
      
      if (email) {
        updateFields.push(`email = $${paramIndex}`);
        updateValues.push(email);
        paramIndex++;
      }
      
      if (fullName) {
        updateFields.push(`full_name = $${paramIndex}`);
        updateValues.push(fullName);
        paramIndex++;
      }
      
      if (password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        updateFields.push(`password = $${paramIndex}`);
        updateValues.push(hashedPassword);
        paramIndex++;
      }
      
      // Si no hay campos para actualizar, devolver error
      if (updateFields.length === 0) {
        return res.status(400).json({ 
          message: "No se proporcionaron campos para actualizar" 
        });
      }
      
      updateQuery += updateFields.join(", ");
      updateQuery += ` WHERE id = $${paramIndex} RETURNING id, username, email, full_name, created_at`;
      updateValues.push(userId);
      
      // Ejecutar la actualización
      const updateResult = await pool.query(updateQuery, updateValues);
      
      res.json({
        message: "Usuario actualizado exitosamente",
        user: updateResult.rows[0]
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error al actualizar usuario" });
    }
  });

  // Modificar la suscripción de un usuario (solo admin)
  app.patch("/api/admin/users/:id/subscription", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID de usuario inválido" });
      }
      
      const { tier, status, interactionsLimit, endDate } = req.body;
      
      // Verificar que el usuario existe
      const checkUser = await pool.query(
        "SELECT id FROM users WHERE id = $1",
        [userId]
      );
      
      if (checkUser.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // Buscar la suscripción activa del usuario
      const subResult = await pool.query(
        "SELECT id FROM subscriptions WHERE user_id = $1 AND status = 'active'",
        [userId]
      );
      
      let subscriptionId;
      
      if (subResult.rows.length > 0) {
        // Actualizar suscripción existente
        subscriptionId = subResult.rows[0].id;
        
        // Construir la consulta dinámicamente
        let updateQuery = "UPDATE subscriptions SET updated_at = NOW()";
        const updateValues = [];
        let paramIndex = 1;
        
        if (tier) {
          updateQuery += `, tier = $${paramIndex}`;
          updateValues.push(tier);
          paramIndex++;
        }
        
        if (status) {
          updateQuery += `, status = $${paramIndex}`;
          updateValues.push(status);
          paramIndex++;
        }
        
        if (interactionsLimit !== undefined) {
          updateQuery += `, interactions_limit = $${paramIndex}`;
          updateValues.push(interactionsLimit);
          paramIndex++;
        }
        
        if (endDate) {
          updateQuery += `, end_date = $${paramIndex}`;
          updateValues.push(new Date(endDate));
          paramIndex++;
        }
        
        updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
        updateValues.push(subscriptionId);
        
        const updateResult = await pool.query(updateQuery, updateValues);
        
        res.json({
          message: "Suscripción actualizada exitosamente",
          subscription: updateResult.rows[0]
        });
      } else {
        // Crear nueva suscripción
        let interactions_limit = interactionsLimit || 20;
        let end_date = endDate ? new Date(endDate) : null;
        
        // Si se especifica tier, usar valores por defecto según el tier
        if (tier) {
          switch(tier) {
            case 'basic':
              interactions_limit = 500;
              // 30 días a partir de hoy si no se especifica endDate
              if (!endDate) end_date = new Date(new Date().setDate(new Date().getDate() + 30));
              break;
            case 'professional':
              interactions_limit = 2000;
              // 30 días a partir de hoy si no se especifica endDate
              if (!endDate) end_date = new Date(new Date().setDate(new Date().getDate() + 30));
              break;
            case 'enterprise':
              interactions_limit = 99999;
              // 365 días a partir de hoy si no se especifica endDate
              if (!endDate) end_date = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
              break;
            default: // free
              interactions_limit = 20;
              // Sin fecha de expiración (o usar null)
              end_date = null;
          }
        }
        
        const insertResult = await pool.query(
          `INSERT INTO subscriptions 
           (user_id, tier, status, interactions_limit, interactions_used, 
            created_at, updated_at, start_date, end_date)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW(), $6)
           RETURNING *`,
          [userId, tier || 'free', status || 'active', interactions_limit, 0, end_date]
        );
        
        res.json({
          message: "Nueva suscripción creada exitosamente",
          subscription: insertResult.rows[0]
        });
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Error al actualizar suscripción" });
    }
  });

  // Obtener estadísticas globales para administrador
  app.get("/api/admin/stats", authenticateJWT, isAdmin, async (req, res) => {
    try {
      // Estadísticas de usuarios
      const usersResult = await pool.query(
        `SELECT COUNT(*) AS total_users,
         (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') AS new_users_last_7_days
         FROM users`
      );
      
      // Estadísticas de conversaciones
      const convsResult = await pool.query(
        `SELECT 
         COUNT(*) AS total_conversations,
         (SELECT COUNT(*) FROM conversations WHERE created_at > NOW() - INTERVAL '7 days') AS new_conversations_last_7_days,
         COUNT(CASE WHEN conversations.resolved = true THEN 1 END) AS resolved_conversations,
         ROUND(AVG(COALESCE(conversations.duration, 0))::numeric, 2)::float AS avg_duration
        FROM conversations`
      );
      
      // Estadísticas de mensajes y estimación de tokens
      const msgsResult = await pool.query(
        `SELECT 
         COUNT(*) AS total_messages,
         COUNT(CASE WHEN role = 'assistant' THEN 1 END) AS assistant_messages,
         COUNT(CASE WHEN role = 'user' THEN 1 END) AS user_messages,
         (SELECT COUNT(*) FROM messages WHERE timestamp > NOW() - INTERVAL '7 days') AS new_messages_last_7_days
         FROM messages`
      );
      
      // Calcular tokens aproximados (estimación)
      const tokensResult = await pool.query(
        `SELECT SUM(LENGTH(content)) AS total_content_length FROM messages WHERE role = 'assistant'`
      );
      
      const totalContentLength = parseInt(tokensResult.rows[0].total_content_length) || 0;
      // Estimación aproximada: 1 token ≈ 4 caracteres en español
      const estimatedTokensUsed = Math.ceil(totalContentLength / 4);
      
      // Estadísticas de suscripciones
      const subsResult = await pool.query(
        `SELECT 
         COUNT(*) AS total_subscriptions,
         COUNT(CASE WHEN tier = 'free' THEN 1 END) AS free_subscriptions,
         COUNT(CASE WHEN tier = 'basic' THEN 1 END) AS basic_subscriptions,
         COUNT(CASE WHEN tier = 'professional' THEN 1 END) AS professional_subscriptions,
         COUNT(CASE WHEN tier = 'enterprise' THEN 1 END) AS enterprise_subscriptions,
         COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_subscriptions
         FROM subscriptions`
      );
      
      // Usuarios que se acercan a su límite (>80% de uso)
      const nearLimitResult = await pool.query(
        `SELECT 
         COUNT(*) AS users_near_limit
         FROM subscriptions
         WHERE interactions_limit > 0
         AND interactions_used > (interactions_limit * 0.8)`
      );
      
      // Usuarios que están por encima de su límite
      const overLimitResult = await pool.query(
        `SELECT 
         COUNT(*) AS users_over_limit
         FROM subscriptions
         WHERE interactions_limit > 0
         AND interactions_used > interactions_limit`
      );
      
      // Construir respuesta con todas las estadísticas
      const response = {
        users: {
          ...usersResult.rows[0]
        },
        conversations: {
          ...convsResult.rows[0]
        },
        messages: {
          ...msgsResult.rows[0]
        },
        subscriptions: {
          ...subsResult.rows[0]
        },
        tokens: {
          estimated_tokens_used: estimatedTokensUsed,
          // Dependiendo del modelo usado, calcular el costo aproximado (GPT-4o-mini = $5 por millón de tokens de salida)
          estimated_cost_usd: (estimatedTokensUsed / 1000000) * 5
        },
        limits: {
          users_near_limit: parseInt(nearLimitResult.rows[0].users_near_limit),
          users_over_limit: parseInt(overLimitResult.rows[0].users_over_limit)
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error getting admin stats:", error);
      res.status(500).json({ message: "Error al obtener estadísticas de administración" });
    }
  });

  // Obtener lista de usuarios cercanos a su límite
  app.get("/api/admin/users/near-limit", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT u.id, u.username, u.email, u.full_name,
         s.tier, s.interactions_limit, s.interactions_used,
         s.end_date, s.status,
         ROUND((s.interactions_used::float / s.interactions_limit::float) * 100, 2) AS usage_percentage
         FROM subscriptions s
         JOIN users u ON s.user_id = u.id
         WHERE s.interactions_limit > 0
         AND s.interactions_used > (s.interactions_limit * 0.8)
         ORDER BY usage_percentage DESC`
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error("Error getting users near limit:", error);
      res.status(500).json({ message: "Error al obtener usuarios cercanos al límite" });
    }
  });
  
  // ================ Discount Code Routes ================
  
  // Obtener todos los códigos de descuento (solo admin)
  app.get("/api/discount-codes", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const codes = await storage.getDiscountCodes();
      res.json(codes);
    } catch (error) {
      console.error("Error al obtener códigos de descuento:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  });
  
  // Obtener un código de descuento específico por código
  app.get("/api/discount-codes/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const discountCode = await storage.getDiscountCodeByCode(code);
      
      if (!discountCode) {
        return res.status(404).json({ message: "Código de descuento no encontrado" });
      }
      
      if (!discountCode.isActive) {
        return res.status(400).json({ message: "Este código de descuento ya no está activo" });
      }
      
      // Verificar si el código ha expirado
      if (discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Este código de descuento ha expirado" });
      }
      
      // Verificar si se ha alcanzado el límite de uso
      if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
        return res.status(400).json({ message: "Este código de descuento ha alcanzado su límite de uso" });
      }
      
      res.json({
        code: discountCode.code,
        name: discountCode.name,
        discountPercentage: discountCode.discountPercentage,
        applicableTier: discountCode.applicableTier
      });
    } catch (error) {
      console.error("Error al obtener código de descuento:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  });
  
  // Crear un nuevo código de descuento (solo admin)
  app.post("/api/discount-codes", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const { name, discountPercentage, applicableTier, expiresAt, usageLimit } = req.body;
      
      // Validaciones básicas
      if (!name || typeof discountPercentage !== 'number' || !applicableTier) {
        return res.status(400).json({ message: "Faltan campos requeridos o son inválidos" });
      }
      
      // Validar porcentaje de descuento
      if (discountPercentage <= 0 || discountPercentage > 100) {
        return res.status(400).json({ message: "El porcentaje de descuento debe estar entre 1 y 100" });
      }
      
      // Validar tier aplicable
      const validTiers = ['basic', 'professional', 'enterprise', 'all'];
      if (!validTiers.includes(applicableTier)) {
        return res.status(400).json({ 
          message: "Nivel inválido. Debe ser uno de: " + validTiers.join(', ')
        });
      }
      
      // Generar código único
      const code = storage.generateDiscountCode(name.substring(0, 4).toUpperCase());
      
      // Crear nuevo código de descuento
      const newDiscountCode = await storage.createDiscountCode({
        code,
        name,
        discountPercentage,
        applicableTier,
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit || null
      });
      
      res.status(201).json(newDiscountCode);
    } catch (error) {
      console.error("Error al crear código de descuento:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  });
  
  // Actualizar un código de descuento (solo admin)
  app.put("/api/discount-codes/:id", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, discountPercentage, applicableTier, isActive, expiresAt, usageLimit } = req.body;
      
      // Verificar que el código existe
      const existingCode = await storage.getDiscountCode(parseInt(id));
      if (!existingCode) {
        return res.status(404).json({ message: "Código de descuento no encontrado" });
      }
      
      // Validar porcentaje de descuento si se proporciona
      if (discountPercentage !== undefined) {
        if (discountPercentage <= 0 || discountPercentage > 100) {
          return res.status(400).json({ message: "El porcentaje de descuento debe estar entre 1 y 100" });
        }
      }
      
      // Validar tier aplicable si se proporciona
      if (applicableTier !== undefined) {
        const validTiers = ['basic', 'professional', 'enterprise', 'all'];
        if (!validTiers.includes(applicableTier)) {
          return res.status(400).json({ 
            message: "Nivel inválido. Debe ser uno de: " + validTiers.join(', ')
          });
        }
      }
      
      // Actualizar código de descuento
      const updatedDiscountCode = await storage.updateDiscountCode(parseInt(id), {
        name,
        discountPercentage,
        applicableTier,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        usageLimit
      });
      
      res.json(updatedDiscountCode);
    } catch (error) {
      console.error("Error al actualizar código de descuento:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  });
  
  // Eliminar un código de descuento (solo admin)
  app.delete("/api/discount-codes/:id", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar que el código existe
      const existingCode = await storage.getDiscountCode(parseInt(id));
      if (!existingCode) {
        return res.status(404).json({ message: "Código de descuento no encontrado" });
      }
      
      // Eliminar código de descuento
      await storage.deleteDiscountCode(parseInt(id));
      
      res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar código de descuento:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  });
  
  // Validar y aplicar código de descuento
  app.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const { code, tier } = req.body;
      
      if (!code || !tier) {
        return res.status(400).json({ message: "Se requiere código y nivel" });
      }
      
      const discountCode = await storage.getDiscountCodeByCode(code);
      
      if (!discountCode) {
        return res.status(404).json({ message: "Código de descuento no encontrado" });
      }
      
      if (!discountCode.isActive) {
        return res.status(400).json({ message: "Este código de descuento ya no está activo" });
      }
      
      // Verificar si el código ha expirado
      if (discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Este código de descuento ha expirado" });
      }
      
      // Verificar si se ha alcanzado el límite de uso
      if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
        return res.status(400).json({ message: "Este código de descuento ha alcanzado su límite de uso" });
      }
      
      // Verificar si es aplicable al nivel solicitado
      if (discountCode.applicableTier !== 'all' && discountCode.applicableTier !== tier) {
        return res.status(400).json({ 
          message: `Este código de descuento solo es válido para el nivel ${discountCode.applicableTier}` 
        });
      }
      
      // Todo correcto, devolver información del descuento
      res.json({
        valid: true,
        code: discountCode.code,
        discountPercentage: discountCode.discountPercentage,
        name: discountCode.name
      });
    } catch (error) {
      console.error("Error al validar código de descuento:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  });
  
  // Aplicar código de descuento (incrementa el contador de uso)
  app.post("/api/discount-codes/:code/apply", verifyToken, async (req, res) => {
    try {
      const { code } = req.params;
      
      const discountCode = await storage.getDiscountCodeByCode(code);
      
      if (!discountCode) {
        return res.status(404).json({ message: "Código de descuento no encontrado" });
      }
      
      // Incrementar contador de uso
      await storage.incrementDiscountCodeUsage(discountCode.id);
      
      res.json({ success: true, message: "Código de descuento aplicado correctamente" });
    } catch (error) {
      console.error("Error al aplicar código de descuento:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  });

  // ================ Pricing Plan Routes ================
  // GET todos los planes de precios (públicos y disponibles)
  app.get("/api/pricing-plans", async (req, res) => {
    try {
      const pricingPlans = await storage.getAvailablePricingPlans();
      res.json(pricingPlans);
    } catch (error) {
      console.error("Error getting pricing plans:", error);
      res.status(500).json({ message: "Error al obtener los planes de precio" });
    }
  });

  // GET todos los planes de precios (admin, incluye no disponibles)
  app.get("/api/admin/pricing-plans", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const pricingPlans = await storage.getPricingPlans();
      res.json(pricingPlans);
    } catch (error) {
      console.error("Error getting all pricing plans:", error);
      res.status(500).json({ message: "Error al obtener todos los planes de precio" });
    }
  });

  // GET un plan de precios específico por ID
  app.get("/api/admin/pricing-plans/:id", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de plan inválido" });
      }

      const pricingPlan = await storage.getPricingPlan(id);
      if (!pricingPlan) {
        return res.status(404).json({ message: "Plan de precio no encontrado" });
      }

      res.json(pricingPlan);
    } catch (error) {
      console.error("Error getting pricing plan:", error);
      res.status(500).json({ message: "Error al obtener el plan de precio" });
    }
  });

  // POST crear un nuevo plan de precios (admin)
  app.post("/api/admin/pricing-plans", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const validatedData = insertPricingPlanSchema.parse(req.body);
      
      // Verificar si ya existe un plan con el mismo planId
      if (validatedData.planId) {
        const existingPlan = await storage.getPricingPlanByPlanId(validatedData.planId);
        if (existingPlan) {
          return res.status(400).json({ 
            message: "Ya existe un plan con el mismo ID de plan (planId)" 
          });
        }
      }
      
      let pricingPlan = await storage.createPricingPlan(validatedData);
      
      // Sincronizar con Stripe - Crear producto y precio correspondiente
      try {
        const stripeInfo = await createOrUpdateStripeProduct(pricingPlan);
        
        // Actualizar el plan con los IDs de Stripe
        pricingPlan = await storage.updatePricingPlan(pricingPlan.id, {
          stripeProductId: stripeInfo.stripeProductId,
          stripePriceId: stripeInfo.stripePriceId
        });
        
        console.log("Plan sincronizado con Stripe:", pricingPlan.name);
      } catch (stripeError) {
        console.error("Error sincronizando con Stripe:", stripeError);
        // Continuamos sin error fatal, pero registramos el problema
      }
      
      res.status(201).json(pricingPlan);
    } catch (error) {
      console.error("Error creating pricing plan:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Datos de plan inválidos", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error al crear el plan de precio" });
    }
  });

  // PUT actualizar un plan de precios existente (admin)
  app.put("/api/admin/pricing-plans/:id", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de plan inválido" });
      }

      // Verificar si el plan existe
      const existingPlan = await storage.getPricingPlan(id);
      if (!existingPlan) {
        return res.status(404).json({ message: "Plan de precio no encontrado" });
      }

      // Si se está cambiando el planId, verificar que no exista otro plan con ese planId
      if (req.body.planId && req.body.planId !== existingPlan.planId) {
        const planWithSameId = await storage.getPricingPlanByPlanId(req.body.planId);
        if (planWithSameId && planWithSameId.id !== id) {
          return res.status(400).json({ 
            message: "Ya existe otro plan con el mismo ID de plan (planId)" 
          });
        }
      }

      // Actualizar el plan en la base de datos
      const updatedPlan = await storage.updatePricingPlan(id, req.body);
      
      // Sincronizar con Stripe - Actualizar producto y precio correspondiente
      try {
        if (updatedPlan) {
          const stripeInfo = await createOrUpdateStripeProduct(updatedPlan);
          
          // Si los IDs de Stripe no coinciden con los que ya teníamos, actualizamos el plan
          if (stripeInfo.stripeProductId !== updatedPlan.stripeProductId || 
              stripeInfo.stripePriceId !== updatedPlan.stripePriceId) {
            
            await storage.updatePricingPlan(id, {
              stripeProductId: stripeInfo.stripeProductId,
              stripePriceId: stripeInfo.stripePriceId
            });
            
            // Actualizar el objeto del plan con los nuevos IDs de Stripe
            updatedPlan.stripeProductId = stripeInfo.stripeProductId;
            updatedPlan.stripePriceId = stripeInfo.stripePriceId;
          }
          console.log("Plan sincronizado con Stripe:", updatedPlan.name);
        }
      } catch (stripeError) {
        console.error("Error sincronizando con Stripe:", stripeError);
        // Continuamos sin error fatal, pero registramos el problema
      }
      
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating pricing plan:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Datos de actualización inválidos", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error al actualizar el plan de precio" });
    }
  });

  // DELETE eliminar un plan de precios (admin)
  app.delete("/api/admin/pricing-plans/:id", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de plan inválido" });
      }

      // Verificar si el plan existe
      const existingPlan = await storage.getPricingPlan(id);
      if (!existingPlan) {
        return res.status(404).json({ message: "Plan de precio no encontrado" });
      }

      // Para Stripe no eliminamos productos, solo los marcamos como inactivos en nuestra BD
      // Stripe maneja esto de forma separada con archivado de productos

      await storage.deletePricingPlan(id);
      res.json({ message: "Plan de precio eliminado correctamente" });
    } catch (error) {
      console.error("Error deleting pricing plan:", error);
      res.status(500).json({ message: "Error al eliminar el plan de precio" });
    }
  });
  
  // Sincronizar todos los planes con Stripe (admin)
  app.post("/api/admin/pricing-plans/sync-with-stripe", authenticateJWT, isAdmin, async (req, res) => {
    try {
      // Obtener todos los planes de precios
      const pricingPlans = await storage.getPricingPlans();
      
      // Sincronizar todos los planes con Stripe
      const syncedPlans = await syncPlansWithStripe(pricingPlans);
      
      // Responder con los planes sincronizados
      res.json({
        message: `${syncedPlans.length} planes sincronizados con Stripe`,
        plans: syncedPlans
      });
    } catch (error) {
      console.error("Error synchronizing plans with Stripe:", error);
      res.status(500).json({ message: "Error al sincronizar planes con Stripe" });
    }
  });

  // Forms API endpoints
  app.get("/api/forms", authenticateJWT, async (req, res) => {
    try {
      const userId = req.user!.id;
      const forms = await storage.getForms(userId);
      res.json(forms);
    } catch (error) {
      console.error("Error getting forms:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/forms/:id", authenticateJWT, async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      const form = await storage.getForm(formId);
      
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      
      // Verificar que el usuario es propietario del formulario
      if (form.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to this form" });
      }
      
      res.json(form);
    } catch (error) {
      console.error("Error getting form:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/forms", authenticateJWT, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { templateId, ...formData } = req.body;
      
      // Si se proporciona templateId, crear formulario basado en plantilla
      if (templateId) {
        // Obtener la plantilla
        const template = await storage.getFormTemplate(templateId);
        
        if (!template) {
          return res.status(404).json({ error: "Template not found" });
        }
        
        // Crear un título para el formulario basado en la plantilla
        const title = `${template.name} ${new Date().toLocaleDateString('es-ES')}`;
        
        // Generar slug único basado en el título
        const slug = title.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
        
        // Verificar si ya existe un formulario con ese slug
        const existingForm = await storage.getFormBySlug(slug);
        
        const finalSlug = existingForm 
          ? `${slug}-${Math.floor(Math.random() * 1000)}` 
          : slug;
        
        // Crear el nuevo formulario con datos de la plantilla
        const newForm = await storage.createForm({
          title,
          slug: finalSlug,
          description: template.description,
          type: template.type,
          published: false,
          structure: template.structure,
          styling: template.styling,
          settings: template.settings,
          userId
        });
        
        return res.status(201).json(newForm);
      }
      
      // Caso normal - crear formulario desde datos proporcionados
      // Generar slug único basado en el nombre del formulario
      const slug = formData.title.toLowerCase()
        .replace(/\s+/g, '-')        // Reemplazar espacios con guiones
        .replace(/[^\w\-]+/g, '')    // Eliminar caracteres especiales
        .replace(/\-\-+/g, '-')      // Eliminar guiones múltiples
        .replace(/^-+/, '')          // Eliminar guiones del inicio
        .replace(/-+$/, '');         // Eliminar guiones del final
      
      // Verificar si ya existe un formulario con ese slug
      const existingForm = await storage.getFormBySlug(slug);
      
      const finalSlug = existingForm 
        ? `${slug}-${Math.floor(Math.random() * 1000)}` 
        : slug;
      
      const newForm = await storage.createForm({
        ...formData,
        userId,
        slug: finalSlug
      });
      
      res.status(201).json(newForm);
    } catch (error) {
      console.error("Error creating form:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/forms/:id", authenticateJWT, async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      const formData = req.body;
      
      console.log("Actualizando formulario ID:", formId);
      console.log("Datos recibidos:", JSON.stringify(formData, null, 2));
      console.log("Usuario autenticado:", req.user.username);

      // Verificar que el formulario existe
      const existingForm = await storage.getForm(formId);
      
      if (!existingForm) {
        return res.status(404).json({ error: "Form not found" });
      }
      
      // Verificar que el usuario es propietario del formulario
      if (existingForm.userId !== req.user!.id) {
        console.log(`Error de autorización: el formulario pertenece al usuario ${existingForm.userId} pero el usuario actual es ${req.user!.id}`);
        return res.status(403).json({ error: "Unauthorized access to this form" });
      }
      
      const updatedForm = await storage.updateForm(formId, formData);
      console.log("Formulario actualizado:", JSON.stringify(updatedForm, null, 2));
      res.json(updatedForm);
    } catch (error) {
      console.error("Error updating form:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/forms/:id", authenticateJWT, async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      
      // Verificar que el formulario existe
      const existingForm = await storage.getForm(formId);
      
      if (!existingForm) {
        return res.status(404).json({ error: "Form not found" });
      }
      
      // Verificar que el usuario es propietario del formulario
      if (existingForm.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to this form" });
      }
      
      await storage.deleteForm(formId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting form:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Form Templates API endpoints
  app.get("/api/form-templates", async (req, res) => {
    try {
      const templates = await storage.getFormTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error getting form templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/form-templates/default", async (req, res) => {
    try {
      const templates = await storage.getDefaultFormTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error getting default form templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/form-templates/type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const templates = await storage.getTemplatesByType(type);
      res.json(templates);
    } catch (error) {
      console.error("Error getting form templates by type:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/form-templates/:id", async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const template = await storage.getFormTemplate(templateId);
      
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error getting form template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Solo permitir crear/editar/eliminar templates a administradores
  app.post("/api/form-templates", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const templateData = req.body;
      const newTemplate = await storage.createFormTemplate(templateData);
      res.status(201).json(newTemplate);
    } catch (error) {
      console.error("Error creating form template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/form-templates/:id", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const templateData = req.body;
      
      // Verificar que el template existe
      const existingTemplate = await storage.getFormTemplate(templateId);
      
      if (!existingTemplate) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      const updatedTemplate = await storage.updateFormTemplate(templateId, templateData);
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating form template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/form-templates/:id", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      
      // Verificar que el template existe
      const existingTemplate = await storage.getFormTemplate(templateId);
      
      if (!existingTemplate) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      await storage.deleteFormTemplate(templateId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting form template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public Form API endpoints
  app.get("/api/forms/public/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      
      // Obtener el formulario por su slug
      const form = await storage.getFormBySlug(slug);
      
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      
      // Devolver solo la información pública necesaria para renderizar el formulario
      // Excluimos información sensible
      const publicFormData = {
        id: form.id,
        title: form.title,
        description: form.description,
        buttonColor: form.settings?.buttonColor || '#2563EB',
        submitButtonText: form.settings?.submitButtonText || 'Enviar',
        successMessage: form.settings?.successMessage || '¡Gracias! Tu información ha sido enviada correctamente.',
        successUrl: form.settings?.successRedirectUrl,
        fields: form.fields
      };
      
      res.json(publicFormData);
    } catch (error) {
      console.error("Error getting public form:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // El endpoint de envío de formularios ya existe como "/api/public/form/:slug/submit"

  // Form Responses API endpoints
  app.get("/api/forms/:formId/responses", authenticateJWT, async (req, res) => {
    try {
      const formId = parseInt(req.params.formId);
      
      // Verificar que el formulario existe
      const existingForm = await storage.getForm(formId);
      
      if (!existingForm) {
        return res.status(404).json({ error: "Form not found" });
      }
      
      // Verificar que el usuario es propietario del formulario
      if (existingForm.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to this form's responses" });
      }
      
      const responses = await storage.getFormResponses(formId);
      res.json(responses);
    } catch (error) {
      console.error("Error getting form responses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Endpoint público para enviar respuestas de formulario
  app.post("/api/public/form/:slug/submit", async (req, res) => {
    try {
      const slug = req.params.slug;
      const responseData = req.body;
      
      // Verificar que el formulario existe
      const form = await storage.getFormBySlug(slug);
      
      if (!form) {
        return res.status(404).json({ error: "Form not found" });
      }
      
      // Verificar que el formulario está activo
      if (form.status !== "active") {
        return res.status(403).json({ error: "This form is not active" });
      }
      
      // Validar los datos de la respuesta según la estructura del formulario
      const requiredFields = form.structure.fields
        .filter(field => field.required)
        .map(field => field.name);
      
      for (const field of requiredFields) {
        if (!responseData.data[field]) {
          return res.status(400).json({ 
            error: "Missing required fields", 
            missingFields: requiredFields.filter(f => !responseData.data[f])
          });
        }
      }
      
      // Crear la respuesta
      const newResponse = await storage.createFormResponse({
        formId: form.id,
        data: responseData.data,
        metadata: responseData.metadata || {}
      });
      
      res.status(201).json({ 
        success: true, 
        message: form.structure.successMessage || "Form submitted successfully" 
      });
    } catch (error) {
      console.error("Error submitting form response:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/forms/:formId/responses/:responseId", authenticateJWT, async (req, res) => {
    try {
      const formId = parseInt(req.params.formId);
      const responseId = parseInt(req.params.responseId);
      
      // Verificar que el formulario existe
      const existingForm = await storage.getForm(formId);
      
      if (!existingForm) {
        return res.status(404).json({ error: "Form not found" });
      }
      
      // Verificar que el usuario es propietario del formulario
      if (existingForm.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to this form's responses" });
      }
      
      // Verificar que la respuesta existe y pertenece a este formulario
      const existingResponse = await storage.getFormResponse(responseId);
      
      if (!existingResponse || existingResponse.formId !== formId) {
        return res.status(404).json({ error: "Response not found for this form" });
      }
      
      await storage.deleteFormResponse(responseId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting form response:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/forms/:formId/responses", authenticateJWT, async (req, res) => {
    try {
      const formId = parseInt(req.params.formId);
      
      // Verificar que el formulario existe
      const existingForm = await storage.getForm(formId);
      
      if (!existingForm) {
        return res.status(404).json({ error: "Form not found" });
      }
      
      // Verificar que el usuario es propietario del formulario
      if (existingForm.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to this form's responses" });
      }
      
      await storage.deleteFormResponses(formId);
      
      // Restaurar el contador de respuestas
      await storage.updateForm(formId, { responseCount: 0 });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting all form responses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Ruta para la vista pública del formulario (página completa)
  app.get("/forms/:id/view", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      
      // Obtener el formulario
      const form = await storage.getForm(formId);
      
      if (!form) {
        return res.status(404).send('Formulario no encontrado');
      }
      
      // Renderizar una página HTML completa para ver el formulario
      const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${form.title || 'Formulario AIPI'}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #333;
              background-color: #f5f5f5;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            
            .branding {
              font-size: 0.8rem;
              text-align: center;
              margin-top: 2rem;
              color: #888;
            }
            
            .branding a {
              color: #666;
              text-decoration: none;
            }
            
            .branding a:hover {
              text-decoration: underline;
            }
            
            .container {
              width: 100%;
              max-width: 600px;
              margin: 2rem auto;
              padding: 2rem;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            h1 {
              font-size: 1.8rem;
              margin-bottom: 1rem;
              color: #333;
            }
            
            p {
              margin-bottom: 1.5rem;
              color: #666;
            }
            
            .form-container {
              max-width: 100%;
            }
            
            form {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }
            
            label {
              font-weight: 500;
              margin-bottom: 0.25rem;
              display: block;
            }
            
            input, textarea, select {
              width: 100%;
              padding: 0.75rem;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 1rem;
              font-family: inherit;
              box-sizing: border-box;
            }
            
            button {
              background-color: ${form.styling?.primaryColor || '#3B82F6'};
              color: white;
              border: none;
              padding: 0.75rem 1rem;
              border-radius: 4px;
              font-size: 1rem;
              cursor: pointer;
              font-weight: 500;
              margin-top: 0.5rem;
              transition: background-color 0.2s;
            }
            
            button:hover {
              opacity: 0.9;
            }
            
            .required:after {
              content: " *";
              color: #e53e3e;
            }
            
            .form-field {
              margin-bottom: 1rem;
            }
            
            @media (max-width: 640px) {
              .container {
                padding: 1.5rem;
                margin: 1rem;
                width: auto;
              }
              
              h1 {
                font-size: 1.5rem;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="form-container">
              <h1>${form.title || 'Formulario'}</h1>
              ${form.description ? `<p>${form.description}</p>` : ''}
              
              <form id="aipi-form">
                ${form.structure.fields.map(field => `
                  <div class="form-field">
                    <label for="${field.name}" class="${field.required ? 'required' : ''}">${field.label}</label>
                    ${field.type === 'text' ? `
                      <input type="text" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>
                    ` : field.type === 'email' ? `
                      <input type="email" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>
                    ` : field.type === 'number' ? `
                      <input type="number" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>
                    ` : field.type === 'textarea' ? `
                      <textarea id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" rows="4" ${field.required ? 'required' : ''}></textarea>
                    ` : field.type === 'select' ? `
                      <select id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                        <option value="">Selecciona una opción</option>
                        ${field.options && field.options.map(option => {
                          const optionValue = typeof option === 'string' ? option : option.value || option.label;
                          const optionLabel = typeof option === 'string' ? option : option.label;
                          return `<option value="${optionValue}">${optionLabel}</option>`;
                        }).join('')}
                      </select>
                    ` : `
                      <input type="text" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>
                    `}
                  </div>
                `).join('')}
                
                <button type="submit">${form.structure.submitButtonText || 'Enviar'}</button>
              </form>
              
              <div id="success-message" style="display: none; margin-top: 1rem; padding: 1rem; background-color: #f0fff4; color: #2f855a; border-radius: 4px; border: 1px solid #c6f6d5;">
                ${form.settings?.successMessage || '¡Gracias! Tu información ha sido enviada correctamente.'}
              </div>
            </div>
          </div>
          
          <div class="branding">
            Formulario creado con <a href="${req.protocol}://${req.get('host')}/" target="_blank">AIPI Forms</a>
          </div>
          
          <script>
            document.getElementById('aipi-form').addEventListener('submit', async function(e) {
              e.preventDefault();
              
              const formData = new FormData(this);
              const formDataObj = Object.fromEntries(formData.entries());
              
              try {
                const response = await fetch('/api/form-responses', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    formId: ${formId},
                    data: formDataObj
                  })
                });
                
                if (response.ok) {
                  // Mostrar mensaje de éxito
                  document.getElementById('aipi-form').style.display = 'none';
                  document.getElementById('success-message').style.display = 'block';
                  
                  // Si hay URL de redirección configurada, redirigir después de un breve retraso
                  ${form.settings?.redirectUrl ? `
                    setTimeout(() => {
                      window.location.href = "${form.settings.redirectUrl}";
                    }, 3000);
                  ` : ''}
                } else {
                  alert('Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo.');
                }
              } catch (error) {
                console.error('Error al enviar el formulario:', error);
                alert('Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo.');
              }
            });
          </script>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Error al renderizar la vista pública del formulario:", error);
      res.status(500).send('Error interno del servidor');
    }
  });

  // Ruta para la vista embebida de formularios
  app.get("/forms/:id/embed", async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      
      // Obtener el formulario
      const form = await storage.getForm(formId);
      
      if (!form) {
        return res.status(404).send('Formulario no encontrado');
      }
      
      // Renderizar una página HTML simple con el formulario embebido
      // Este HTML será servido en un iframe
      const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${form.title || 'Formulario AIPI'}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 16px;
              color: #333;
              background-color: #fff;
            }
            
            h1 {
              font-size: 1.5rem;
              margin-bottom: 1rem;
            }
            
            p {
              margin-bottom: 1.5rem;
              color: #666;
            }
            
            .form-container {
              max-width: 100%;
              border-radius: ${form.styling?.borderRadius || '8px'};
              overflow: hidden;
            }
            
            form {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }
            
            label {
              font-weight: 500;
              margin-bottom: 0.25rem;
              display: block;
            }
            
            input, textarea, select {
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 1rem;
              font-family: inherit;
            }
            
            button {
              background-color: ${form.styling?.primaryColor || '#3B82F6'};
              color: white;
              border: none;
              padding: 0.75rem 1rem;
              border-radius: 4px;
              font-size: 1rem;
              cursor: pointer;
              font-weight: 500;
              margin-top: 0.5rem;
            }
            
            button:hover {
              opacity: 0.9;
            }
            
            .required:after {
              content: " *";
              color: #e53e3e;
            }
          </style>
        </head>
        <body>
          <div class="form-container">
            <h1>${form.title || 'Formulario'}</h1>
            ${form.description ? `<p>${form.description}</p>` : ''}
            
            <form id="aipi-form">
              ${form.structure.fields.map(field => `
                <div class="form-field">
                  <label for="${field.name}" class="${field.required ? 'required' : ''}">${field.label}</label>
                  ${field.type === 'text' ? `
                    <input type="text" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>
                  ` : field.type === 'email' ? `
                    <input type="email" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>
                  ` : field.type === 'number' ? `
                    <input type="number" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>
                  ` : field.type === 'textarea' ? `
                    <textarea id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" rows="4" ${field.required ? 'required' : ''}></textarea>
                  ` : field.type === 'select' ? `
                    <select id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                      <option value="">Selecciona una opción</option>
                      ${field.options && field.options.map(option => {
                        const optionValue = typeof option === 'string' ? option : option.value || option.label;
                        const optionLabel = typeof option === 'string' ? option : option.label;
                        return `<option value="${optionValue}">${optionLabel}</option>`;
                      }).join('')}
                    </select>
                  ` : `
                    <input type="text" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>
                  `}
                </div>
              `).join('')}
              
              <button type="submit">${form.structure.submitButtonText || 'Enviar'}</button>
            </form>
            
            <div id="success-message" style="display: none; margin-top: 1rem; padding: 1rem; background-color: #f0fff4; color: #2f855a; border-radius: 4px; border: 1px solid #c6f6d5;">
              ${form.settings?.successMessage || '¡Gracias! Tu información ha sido enviada correctamente.'}
            </div>
          </div>
          
          <script>
            document.getElementById('aipi-form').addEventListener('submit', async function(e) {
              e.preventDefault();
              
              const formData = new FormData(this);
              const formDataObj = Object.fromEntries(formData.entries());
              
              try {
                const response = await fetch('/api/form-responses', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    formId: ${formId},
                    data: formDataObj
                  })
                });
                
                if (response.ok) {
                  // Mostrar mensaje de éxito
                  document.getElementById('aipi-form').style.display = 'none';
                  document.getElementById('success-message').style.display = 'block';
                  
                  // Si hay URL de redirección configurada, redirigir después de un breve retraso
                  ${form.settings?.redirectUrl ? `
                    setTimeout(() => {
                      window.top.location.href = "${form.settings.redirectUrl}";
                    }, 3000);
                  ` : ''}
                } else {
                  alert('Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo.');
                }
              } catch (error) {
                console.error('Error al enviar el formulario:', error);
                alert('Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo.');
              }
            });
          </script>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Error al renderizar el formulario embebido:", error);
      res.status(500).send('Error interno del servidor');
    }
  });
  
  // Ruta para manejar las respuestas de formularios
  app.post("/api/form-responses", async (req, res) => {
    try {
      const { formId, data } = req.body;
      
      if (!formId || !data) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
      }
      
      // Validar que el formulario existe
      const form = await storage.getForm(parseInt(formId));
      
      if (!form) {
        return res.status(404).json({ error: "Formulario no encontrado" });
      }
      
      // Crear la respuesta del formulario
      const response = await storage.createFormResponse({
        formId: parseInt(formId),
        data: data,
        createdAt: new Date(),
      });
      
      // Incrementar el contador de respuestas del formulario
      await storage.incrementFormResponseCount(parseInt(formId));
      
      res.status(201).json({ success: true, responseId: response.id });
    } catch (error) {
      console.error("Error al procesar la respuesta del formulario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  const httpServer = createServer(app);
  
  // ================ Appointment Routes ================
  // GET appointments for an integration
  app.get("/api/appointments/integration/:integrationId", authenticateJWT, async (req, res) => {
    try {
      const integrationId = parseInt(req.params.integrationId);
      
      // Verificar que la integración pertenece al usuario
      const integration = await storage.getIntegration(integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta integración" });
      }
      
      const appointments = await storage.getAppointments(integrationId);
      res.json(appointments);
    } catch (error) {
      console.error("Error al obtener citas:", error);
      res.status(500).json({ message: "Error al obtener citas" });
    }
  });
  
  // GET appointments for a specific conversation
  app.get("/api/appointments/conversation/:conversationId", authenticateJWT, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      
      // Verificar que la conversación pertenece a una integración del usuario
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversación no encontrada" });
      }
      
      const integration = await storage.getIntegration(conversation.integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta conversación" });
      }
      
      const appointments = await storage.getAppointmentsByConversation(conversationId);
      res.json(appointments);
    } catch (error) {
      console.error("Error al obtener citas por conversación:", error);
      res.status(500).json({ message: "Error al obtener citas por conversación" });
    }
  });
  
  // GET specific appointment
  app.get("/api/appointments/:id", authenticateJWT, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }
      
      // Verificar que la cita está asociada a una integración del usuario
      const integration = await storage.getIntegration(appointment.integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(403).json({ message: "No tienes permiso para acceder a esta cita" });
      }
      
      res.json(appointment);
    } catch (error) {
      console.error("Error al obtener detalles de la cita:", error);
      res.status(500).json({ message: "Error al obtener detalles de la cita" });
    }
  });
  
  // POST create new appointment
  app.post("/api/appointments", authenticateJWT, async (req, res) => {
    try {
      const {
        integrationId,
        conversationId,
        visitorName,
        visitorEmail,
        appointmentDate,
        appointmentTime,
        duration,
        purpose,
        notes,
        status,
        calendarProvider
      } = req.body;
      
      // Validar datos mínimos requeridos
      if (!integrationId || !visitorName || !visitorEmail || !appointmentDate || !appointmentTime || !purpose) {
        return res.status(400).json({ message: "Faltan datos obligatorios para crear la cita" });
      }
      
      // Verificar que la integración pertenece al usuario
      const integration = await storage.getIntegration(integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(403).json({ message: "No tienes permiso para crear citas en esta integración" });
      }
      
      // Crear la cita
      const newAppointment = await storage.createAppointment({
        integrationId,
        conversationId: conversationId || null,
        visitorName,
        visitorEmail,
        appointmentDate,
        appointmentTime,
        duration: duration || 30, // Duración predeterminada de 30 minutos
        purpose,
        notes: notes || null,
        status: status || 'pending',
        calendarProvider: calendarProvider || null,
        calendarEventId: null,
        reminderSent: false,
        createdAt: new Date()
      });
      
      // Obtener la configuración del usuario para las notificaciones
      const settings = await storage.getSettings(req.userId);
      
      // Sincronizar con el servicio de calendario si se especificó un proveedor
      if (calendarProvider) {
        try {
          let calendarEventId = null;
          
          // Aquí simularíamos la obtención del token de OAuth del usuario.
          // En una implementación real, esto vendría de una tabla de tokens OAuth o similar
          const mockAccessToken = "mock_access_token";
          
          if (calendarProvider === 'google') {
            calendarEventId = await createGoogleCalendarEvent(
              newAppointment, 
              integration.userId.toString(), 
              mockAccessToken
            );
          } else if (calendarProvider === 'outlook') {
            calendarEventId = await createOutlookCalendarEvent(
              newAppointment, 
              integration.userId.toString(), 
              mockAccessToken
            );
          }
          
          if (calendarEventId) {
            // Actualizar la cita con el ID del evento del calendario
            await storage.updateCalendarEventId(newAppointment.id, calendarEventId, calendarProvider);
            newAppointment.calendarEventId = calendarEventId;
          }
        } catch (calendarError) {
          console.error("Error al sincronizar con el calendario:", calendarError);
          // Continuamos aunque falle la sincronización del calendario
        }
      }
      
      // Enviar confirmación por correo electrónico si están configuradas las credenciales AWS
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        try {
          const fromEmail = settings.emailNotificationAddress || 'info@example.com';
          
          // Enviar confirmación por email usando AWS SES
          await sendAppointmentConfirmation(newAppointment, fromEmail, settings);
        } catch (emailError) {
          console.error("Error al enviar confirmación por correo:", emailError);
          // Continuamos aunque falle el envío del correo
        }
      } else {
        console.log("AWS credenciales no configuradas, no se envió email de confirmación");
      }
      
      res.status(201).json(newAppointment);
    } catch (error) {
      console.error("Error al crear cita:", error);
      res.status(500).json({ message: "Error al crear cita" });
    }
  });
  
  // PATCH update appointment 
  app.patch("/api/appointments/:id", authenticateJWT, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }
      
      // Verificar que la cita está asociada a una integración del usuario
      const integration = await storage.getIntegration(appointment.integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(403).json({ message: "No tienes permiso para modificar esta cita" });
      }
      
      // Actualizar la cita
      const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
      
      // Si hay cambios en la fecha o la hora y existe un ID de evento de calendario, actualizar el evento
      if ((req.body.appointmentDate || req.body.appointmentTime) && appointment.calendarEventId && appointment.calendarProvider) {
        try {
          // Aquí simularíamos la obtención del token de OAuth del usuario.
          const mockAccessToken = "mock_access_token";
          
          if (appointment.calendarProvider === 'google') {
            await updateGoogleCalendarEvent(
              updatedAppointment, 
              appointment.calendarEventId, 
              mockAccessToken
            );
          } else if (appointment.calendarProvider === 'outlook') {
            await updateOutlookCalendarEvent(
              updatedAppointment, 
              appointment.calendarEventId, 
              mockAccessToken
            );
          }
        } catch (calendarError) {
          console.error("Error al actualizar evento en el calendario:", calendarError);
          // Continuamos aunque falle la actualización del calendario
        }
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error al actualizar cita:", error);
      res.status(500).json({ message: "Error al actualizar cita" });
    }
  });
  
  // PATCH update appointment status
  app.patch("/api/appointments/:id/status", authenticateJWT, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Estado no válido" });
      }
      
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }
      
      // Verificar que la cita está asociada a una integración del usuario
      const integration = await storage.getIntegration(appointment.integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(403).json({ message: "No tienes permiso para modificar esta cita" });
      }
      
      // Actualizar el estado de la cita
      const updatedAppointment = await storage.updateAppointmentStatus(appointmentId, status);
      
      // Si se cancela la cita y existe un ID de evento de calendario, cancelar el evento
      if (status === 'cancelled' && appointment.calendarEventId && appointment.calendarProvider) {
        try {
          // Aquí simularíamos la obtención del token de OAuth del usuario.
          const mockAccessToken = "mock_access_token";
          
          if (appointment.calendarProvider === 'google') {
            await cancelGoogleCalendarEvent(
              appointment.calendarEventId, 
              mockAccessToken
            );
          } else if (appointment.calendarProvider === 'outlook') {
            await cancelOutlookCalendarEvent(
              appointment.calendarEventId, 
              mockAccessToken
            );
          }
        } catch (calendarError) {
          console.error("Error al cancelar evento en el calendario:", calendarError);
          // Continuamos aunque falle la cancelación en el calendario
        }
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error al actualizar estado de la cita:", error);
      res.status(500).json({ message: "Error al actualizar estado de la cita" });
    }
  });
  
  // DELETE appointment
  app.delete("/api/appointments/:id", authenticateJWT, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }
      
      // Verificar que la cita está asociada a una integración del usuario
      const integration = await storage.getIntegration(appointment.integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(403).json({ message: "No tienes permiso para eliminar esta cita" });
      }
      
      // Si existe un ID de evento de calendario, cancelar el evento
      if (appointment.calendarEventId && appointment.calendarProvider) {
        try {
          // Aquí simularíamos la obtención del token de OAuth del usuario.
          const mockAccessToken = "mock_access_token";
          
          if (appointment.calendarProvider === 'google') {
            await cancelGoogleCalendarEvent(
              appointment.calendarEventId, 
              mockAccessToken
            );
          } else if (appointment.calendarProvider === 'outlook') {
            await cancelOutlookCalendarEvent(
              appointment.calendarEventId, 
              mockAccessToken
            );
          }
        } catch (calendarError) {
          console.error("Error al cancelar evento en el calendario:", calendarError);
          // Continuamos aunque falle la cancelación en el calendario
        }
      }
      
      // Eliminar la cita
      await storage.deleteAppointment(appointmentId);
      
      res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar cita:", error);
      res.status(500).json({ message: "Error al eliminar cita" });
    }
  });
  
  // Endpoint para enviar recordatorios de citas (a ejecutar por un cronjob)
  app.post("/api/appointments/send-reminders", async (req, res) => {
    try {
      // Verificar que la solicitud proviene de un origen autorizado
      // En una implementación real, deberíamos verificar algún tipo de secreto o auth
      // para este endpoint que se ejecutaría como un cronjob
      
      // Obtener todas las citas programadas para mañana que no han recibido recordatorio
      const upcomingAppointments = await storage.getUpcomingAppointmentsForReminders();
      let sentCount = 0;
      
      if (upcomingAppointments.length === 0) {
        return res.json({ message: "No hay recordatorios pendientes para enviar" });
      }
      
      for (const appointment of upcomingAppointments) {
        // Obtener la integración y los ajustes correspondientes
        const integration = await storage.getIntegration(appointment.integrationId);
        if (!integration) continue;
        
        const settings = await storage.getSettings(integration.userId);
        
        // Enviar el recordatorio por correo electrónico usando AWS SES
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
          try {
            const fromEmail = settings.emailNotificationAddress || 'info@example.com';
            
            // Enviar recordatorio por email usando AWS SES
            await sendAppointmentReminder(appointment, fromEmail);
            
            // Marcar que se ha enviado el recordatorio
            await storage.markReminderSent(appointment.id);
            sentCount++;
          } catch (emailError) {
            console.error(`Error al enviar recordatorio para cita ${appointment.id}:`, emailError);
          }
        } else {
          console.log("AWS credenciales no configuradas, no se pueden enviar recordatorios");
          break;
        }
      }
      
      res.json({ 
        message: `Se enviaron ${sentCount} recordatorios de citas`, 
        sent: sentCount, 
        total: upcomingAppointments.length 
      });
    } catch (error) {
      console.error("Error al enviar recordatorios de citas:", error);
      res.status(500).json({ message: "Error al enviar recordatorios de citas" });
    }
  });

  // ================ Calendar OAuth Routes ================
  
  // Ruta de diagnóstico para obtener información sobre las variables de entorno
  app.get("/api/debug/environment", authenticateJWT, (req, res) => {
    // Recopilamos información del entorno sin exponer secretos
    const envInfo = {
      host: req.headers.host,
      origin: req.headers.origin,
      replit: {
        slug: process.env.REPL_SLUG || 'no disponible',
        owner: process.env.REPL_OWNER || 'no disponible',
        id: process.env.REPL_ID || 'no disponible'
      },
      redirectUrl: {
        google: process.env.APP_URL ? 
          `${process.env.APP_URL}/api/auth/google-calendar/callback` : 
          process.env.REPL_ID ? 
            `https://${process.env.REPL_ID}-00.picard.replit.dev/api/auth/google-calendar/callback` :
            'https://localhost:5000/api/auth/google-calendar/callback'
      },
      authConfigured: {
        google: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
        outlook: !!process.env.MS_CLIENT_ID && !!process.env.MS_CLIENT_SECRET
      }
    };
    
    res.json(envInfo);
  });
  // Google Calendar Auth - URL endpoint
  app.get("/api/auth/google-calendar-url", authenticateJWT, async (req, res) => {
    try {
      const userId = req.userId;
      
      // Verificar si se proporciona una URL personalizada
      const customRedirectUrl = req.query.customRedirectUrl as string;
      
      // Pasar la solicitud para obtener la URL correcta (con URL personalizada si está disponible)
      const authUrl = getGoogleAuthUrl(userId, undefined, req, customRedirectUrl);
      
      // Loguear información para verificar
      console.log("INFO REDIRECCIÓN GOOGLE CALENDAR:");
      console.log("URL de autorización:", authUrl);
      console.log("REDIRECT_URL completa:", authUrl.match(/redirect_uri=([^&]*)/)?.[1]);
      console.log("URL personalizada proporcionada:", customRedirectUrl || "No");
      
      res.json({ authUrl });
    } catch (error) {
      console.error("Error al obtener URL de autenticación con Google Calendar:", error);
      res.status(500).json({ message: "Error al obtener URL de autenticación" });
    }
  });

  // Google Calendar Auth - Direct endpoint (deprecado pero mantenido por compatibilidad)
  app.get("/api/auth/google-calendar", authenticateJWT, async (req, res) => {
    try {
      const userId = req.userId;
      
      // Verificar si se proporciona una URL personalizada
      const customRedirectUrl = req.query.customRedirectUrl as string;
      
      // Usar req para obtener la URL de redirección correcta
      const authUrl = getGoogleAuthUrl(userId, undefined, req, customRedirectUrl);
      res.redirect(authUrl);
    } catch (error) {
      console.error("Error al iniciar la autenticación con Google Calendar:", error);
      res.redirect("/dashboard?tab=settings&error=google_auth_failed");
    }
  });

  // Google Calendar Auth Callback
  app.get("/api/auth/google-calendar/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        throw new Error("No se recibió el código de autorización");
      }
      
      // Extraer el ID de usuario del estado
      const stateStr = state as string;
      const userIdMatch = stateStr.match(/user_id=(\d+)/);
      
      if (!userIdMatch || !userIdMatch[1]) {
        throw new Error("No se pudo identificar al usuario");
      }
      
      const userId = parseInt(userIdMatch[1]);
      
      // Intercambiar el código por tokens
      const tokens = await exchangeGoogleCodeForTokens(code as string);
      
      // Calcular la fecha de expiración del token
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);
      
      // Verificar si ya existe un token para este usuario y proveedor
      const existingToken = await storage.getCalendarTokenByProvider(userId, 'google');
      
      if (existingToken) {
        // Actualizar el token existente
        await storage.updateCalendarToken(existingToken.id, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existingToken.refreshToken,
          expiresAt
        });
      } else {
        // Crear un nuevo registro de token
        await storage.createCalendarToken({
          userId,
          provider: 'google',
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt
        });
      }
      
      // Redirigir al usuario de vuelta a la página de configuración
      res.redirect("/dashboard?tab=settings&success=google_calendar_connected");
    } catch (error) {
      console.error("Error en el callback de Google Calendar:", error);
      res.redirect("/dashboard?tab=settings&error=google_auth_callback_failed");
    }
  });

  // Outlook Calendar Auth - URL endpoint
  app.get("/api/auth/outlook-calendar-url", authenticateJWT, async (req, res) => {
    try {
      const userId = req.userId;
      const authUrl = getOutlookAuthUrl(userId);
      res.json({ authUrl });
    } catch (error) {
      console.error("Error al obtener URL de autenticación con Outlook Calendar:", error);
      res.status(500).json({ message: "Error al obtener URL de autenticación" });
    }
  });

  // Outlook Calendar Auth - Direct endpoint (deprecado pero mantenido por compatibilidad)
  app.get("/api/auth/outlook-calendar", authenticateJWT, async (req, res) => {
    try {
      const userId = req.userId;
      const authUrl = getOutlookAuthUrl(userId);
      res.redirect(authUrl);
    } catch (error) {
      console.error("Error al iniciar la autenticación con Outlook Calendar:", error);
      res.redirect("/dashboard?tab=settings&error=outlook_auth_failed");
    }
  });

  // Outlook Calendar Auth Callback
  app.get("/api/auth/outlook-calendar/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        throw new Error("No se recibió el código de autorización");
      }
      
      // Extraer el ID de usuario del estado
      const stateStr = state as string;
      const userIdMatch = stateStr.match(/user_id=(\d+)/);
      
      if (!userIdMatch || !userIdMatch[1]) {
        throw new Error("No se pudo identificar al usuario");
      }
      
      const userId = parseInt(userIdMatch[1]);
      
      // Intercambiar el código por tokens
      const tokens = await exchangeOutlookCodeForTokens(code as string);
      
      // Calcular la fecha de expiración del token
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);
      
      // Verificar si ya existe un token para este usuario y proveedor
      const existingToken = await storage.getCalendarTokenByProvider(userId, 'outlook');
      
      if (existingToken) {
        // Actualizar el token existente
        await storage.updateCalendarToken(existingToken.id, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existingToken.refreshToken,
          expiresAt
        });
      } else {
        // Crear un nuevo registro de token
        await storage.createCalendarToken({
          userId,
          provider: 'outlook',
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt
        });
      }
      
      // Redirigir al usuario de vuelta a la página de configuración
      res.redirect("/dashboard?tab=settings&success=outlook_calendar_connected");
    } catch (error) {
      console.error("Error en el callback de Outlook Calendar:", error);
      res.redirect("/dashboard?tab=settings&error=outlook_auth_callback_failed");
    }
  });

  // Calendar Token Management
  app.get("/api/calendar-tokens", authenticateJWT, async (req, res) => {
    try {
      const tokens = await storage.getCalendarTokens(req.userId);
      res.json(tokens);
    } catch (error) {
      console.error("Error al obtener tokens de calendario:", error);
      res.status(500).json({ message: "Error al obtener tokens de calendario" });
    }
  });

  app.delete("/api/calendar-tokens/:id", authenticateJWT, async (req, res) => {
    try {
      const tokenId = parseInt(req.params.id);
      const token = await storage.getCalendarToken(tokenId);
      
      if (!token) {
        return res.status(404).json({ message: "Token no encontrado" });
      }
      
      if (token.userId !== req.userId) {
        return res.status(403).json({ message: "No tienes permiso para eliminar este token" });
      }
      
      await storage.deleteCalendarToken(tokenId);
      res.status(204).end();
    } catch (error) {
      console.error("Error al eliminar token de calendario:", error);
      res.status(500).json({ message: "Error al eliminar token de calendario" });
    }
  });

  return httpServer;
}
