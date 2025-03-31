import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyToken } from "./middleware/auth";
import { generateApiKey } from "./lib/utils";
import { generateChatCompletion, analyzeSentiment, summarizeText } from "./lib/openai";
import { 
  stripe, 
  initializeProducts, 
  createCheckoutSession, 
  handleWebhookEvent, 
  PRODUCTS 
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
  // Inicializar productos de Stripe
  // Esta ruta se ejecuta una vez al iniciar el servidor para asegurar que los productos existen en Stripe
  (async () => {
    try {
      console.log("Inicializando productos en Stripe...");
      await initializeProducts();
    } catch (error) {
      console.error("Error inicializando productos en Stripe:", error);
    }
  })();
  
  // Obtener los planes disponibles
  app.get("/api/pricing/plans", async (req, res) => {
    try {
      // Obtener los productos de Stripe con sus precios
      const products = [];
      
      // Añadir el plan gratuito que no está en Stripe
      products.push({
        id: "free",
        name: "Paquete Gratuito (Prueba)",
        description: "Hasta 20 interacciones por día",
        price: 0,
        currency: "cad",
        interval: "month",
        features: [
          "Acceso al widget flotante para integración sencilla en el sitio web",
          "Respuestas basadas en la información disponible públicamente en el sitio web",
          "Sin personalización ni carga de documentos específicos",
          "Sin captura de leads ni seguimiento posterior",
          "Análisis básicos de interacciones"
        ],
        tier: "free",
        interactionsLimit: 20
      });
      
      // Añadir los planes de pago
      for (const [key, product] of Object.entries(PRODUCTS)) {
        products.push({
          id: key.toLowerCase(),
          name: product.name,
          description: product.description,
          price: product.price / 100, // Convertir centavos a dólares para mostrar
          currency: product.currency,
          interval: product.interval,
          features: getFeaturesByTier(key.toLowerCase()),
          tier: product.metadata.tier,
          interactionsLimit: product.metadata.interactions
        });
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
      
      // Encontrar el priceId correspondiente al plan seleccionado
      let priceId = "";
      for (const [key, product] of Object.entries(PRODUCTS)) {
        if (key.toLowerCase() === planId.toLowerCase()) {
          // Crear o actualizar el producto/precio en Stripe
          const { priceId: stripePriceId } = await createOrUpdatePrice(product);
          priceId = stripePriceId;
          break;
        }
      }
      
      if (!priceId) {
        return res.status(404).json({ message: "Plan no encontrado" });
      }
      
      // Crear sesión de checkout
      const session = await createCheckoutSession(priceId, req.userId, user.email);
      
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
        } else if (webhookSecret) {
          event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            webhookSecret
          );
        } else {
          return res.status(400).send('Webhook secret requerido en producción');
        }
      } catch (err) {
        console.error(`Error verificando webhook: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      
      // Procesar el evento
      await handleWebhookEvent(event);
      
      res.json({ received: true });
    } catch (error) {
      console.error('Error en webhook de Stripe:', error);
      res.status(500).json({ message: "Error procesando webhook" });
    }
  });
  
  // Obtener el estado de la suscripción del usuario
  app.get("/api/subscription/status", verifyToken, async (req, res) => {
    try {
      // TODO: Implementar lógica para obtener el estado de la suscripción
      // Por ahora, devolver un estado ficticio
      res.json({
        tier: "free",
        status: "active",
        interactionsLimit: 20,
        interactionsUsed: 5,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (error) {
      console.error("Error obteniendo estado de suscripción:", error);
      res.status(500).json({ message: "Error obteniendo estado de suscripción" });
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
  
  const httpServer = createServer(app);
  
  return httpServer;
}
