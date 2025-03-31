import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyToken } from "./middleware/auth";
import { getInteractionLimitByTier } from "./middleware/subscription";
import { generateApiKey } from "./lib/utils";
import { generateChatCompletion, analyzeSentiment, summarizeText } from "./lib/openai";
import stripe, { 
  PRODUCTS,
  createOrRetrieveProduct,
  createOrUpdatePrice,
  createCheckoutSession,
  createOrUpdateCustomer,
  retrieveSubscription,
  updateSubscription,
  cancelSubscription,
  handleWebhookEvent
} from "./lib/stripe";
import { webscraper } from "./lib/webscraper";
import { documentProcessor } from "./lib/document-processor";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { insertUserSchema, insertIntegrationSchema, insertMessageSchema, insertSitesContentSchema } from "@shared/schema";
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

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";

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

// Middleware para verificar si un usuario es administrador
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Obtener el usuario de la base de datos
    const user = await storage.getUser(req.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    console.log("Verificando permisos de administrador para:", user.username);
    
    // Verificar si el usuario es admin (username === 'admin')
    if (user.username !== 'admin') {
      console.log("Acceso denegado: El usuario no es administrador");
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    console.log("Acceso de administrador concedido para:", user.username);
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
        path: "/",
      });
      
      console.log("Login successful for user:", user.username);
      console.log("Token created:", token);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("auth_token");
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
      // Obtener los productos de Stripe con sus precios
      const products = [];
      
      // Añadir todos los planes desde nuestras constantes PRODUCTS
      for (const [key, product] of Object.entries(PRODUCTS)) {
        if (product.available) {
          products.push({
            id: key.toLowerCase(),
            name: product.name,
            description: product.description,
            price: product.price / 100, // Convertir centavos a dólares para mostrar
            currency: "cad", // Dólares canadienses por defecto
            interval: "month", // Todos los planes son mensuales
            features: getFeaturesByTier(key.toLowerCase()),
            tier: key,
            interactionsLimit: product.interactionsLimit
          });
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
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "ID del plan es requerido" });
      }
      
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
      for (const [key, product] of Object.entries(PRODUCTS)) {
        if (key.toLowerCase() === planId.toLowerCase()) {
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
      const price = await createOrUpdatePrice(stripeProduct, selectedProduct.price);
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
      // Devolver los planes disponibles desde la definición en stripe.ts
      const plans = Object.entries(PRODUCTS)
        .filter(([_, plan]) => plan.available)
        .map(([id, plan]) => ({
          id,
          ...plan
        }));
      
      res.json(plans);
    } catch (error) {
      console.error("Error obteniendo planes:", error);
      res.status(500).json({ message: "Error obteniendo planes disponibles" });
    }
  });
  
  // Crear una nueva suscripción o actualizar la existente
  app.post("/api/subscription/checkout", verifyToken, async (req, res) => {
    try {
      const { planId } = req.body;
      if (!planId) {
        return res.status(400).json({ message: "Se requiere un ID de plan" });
      }
      
      // Obtener el usuario actual
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // Encontrar el producto correspondiente al plan seleccionado
      const productInfo = PRODUCTS[planId];
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
      const price = await createOrUpdatePrice(product, productInfo.price);
      if (!price) {
        return res.status(500).json({ message: "Error creando precio en Stripe" });
      }
      
      // 3. Crear o actualizar cliente en Stripe si el usuario tiene un email
      let customerId = user.stripeCustomerId;
      if (user.email) {
        const customer = await createOrUpdateCustomer(user.email, user.fullName || user.username, user.stripeCustomerId);
        if (customer) {
          customerId = customer.id;
          
          // Actualizar ID de cliente en la base de datos si es nuevo
          if (!user.stripeCustomerId) {
            // Esta función debería estar implementada en storage
            /* await storage.updateUserStripeInfo(user.id, {
              stripeCustomerId: customer.id,
              stripeSubscriptionId: user.stripeSubscriptionId
            }); */
          }
        }
      }
      
      // 4. Crear sesión de checkout
      const successUrl = `${req.protocol}://${req.get('host')}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${req.protocol}://${req.get('host')}/dashboard/subscription/cancel`;
      
      const session = await createCheckoutSession(
        customerId,
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
  app.get("/api/conversations", verifyToken, async (req, res) => {
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
  
  // Get conversations for a specific integration
  app.get("/api/integrations/:integrationId/conversations", verifyToken, async (req, res) => {
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
  app.get("/api/conversations/:conversationId/messages", verifyToken, async (req, res) => {
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
  // Obtener todos los usuarios (solo admin)
  app.get("/api/admin/users", verifyToken, isAdmin, async (req, res) => {
    try {
      // Obtener todos los usuarios de la base de datos
      const queryResult = await pool.query(
        `SELECT id, username, email, full_name, created_at, 
          api_key, stripe_customer_id, stripe_subscription_id 
        FROM users 
        ORDER BY id ASC`
      );
      
      const users = queryResult.rows;
      res.json(users);
    } catch (error) {
      console.error("Error getting all users:", error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  });

  // Obtener detalles de un usuario específico (solo admin)
  app.get("/api/admin/users/:id", verifyToken, isAdmin, async (req, res) => {
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
  app.post("/api/admin/users", verifyToken, isAdmin, async (req, res) => {
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
  app.patch("/api/admin/users/:id", verifyToken, isAdmin, async (req, res) => {
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
  app.patch("/api/admin/users/:id/subscription", verifyToken, isAdmin, async (req, res) => {
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
        
        if (interactionsLimit) {
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
        
        if (!tier) {
          // Si no se especifica tier, usar valores por defecto según el tier
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
  app.get("/api/admin/stats", verifyToken, isAdmin, async (req, res) => {
    try {
      // Estadísticas de usuarios
      const usersResult = await pool.query(
        `SELECT COUNT(*) AS total_users,
         (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') AS new_users_last_7_days`
      );
      
      // Estadísticas de conversaciones
      const convsResult = await pool.query(
        `SELECT 
         COUNT(*) AS total_conversations,
         (SELECT COUNT(*) FROM conversations WHERE created_at > NOW() - INTERVAL '7 days') AS new_conversations_last_7_days,
         COUNT(CASE WHEN resolved = true THEN 1 END) AS resolved_conversations,
         ROUND(AVG(duration)::numeric, 2) AS avg_duration`
      );
      
      // Estadísticas de mensajes y estimación de tokens
      const msgsResult = await pool.query(
        `SELECT 
         COUNT(*) AS total_messages,
         COUNT(CASE WHEN role = 'assistant' THEN 1 END) AS assistant_messages,
         COUNT(CASE WHEN role = 'user' THEN 1 END) AS user_messages,
         (SELECT COUNT(*) FROM messages WHERE timestamp > NOW() - INTERVAL '7 days') AS new_messages_last_7_days`
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
         COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_subscriptions`
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
  app.get("/api/admin/users/near-limit", verifyToken, isAdmin, async (req, res) => {
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

  const httpServer = createServer(app);
  
  return httpServer;
}
