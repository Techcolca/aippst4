import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import { verifyToken, JWT_SECRET, authenticateJWT, isAdmin as authIsAdmin } from "./middleware/auth";
import { getInteractionLimitByTier, verifySubscription, incrementInteractionCount, InteractionType, getUserSubscription } from "./middleware/subscription";
import { checkResourceLimit, checkFeatureAccess, getUserLimitsSummary, requireResourceLimit, requireBudgetCheck, LimitableResource, LimitableFeature } from "./middleware/plan-limits";
import { setupAuth } from './auth';
// Feature access middleware removed - implementing directly in routes
import { generateApiKey } from "./lib/utils";
import { generateChatCompletion, analyzeSentiment, summarizeText, generateAIPromotionalMessages } from "./lib/openai";

import { buildKnowledgeBase } from "./lib/content-knowledge";
import { webscraper } from "./lib/webscraper";
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
import { z } from "zod";
import { insertUserSchema, insertIntegrationSchema, insertMessageSchema, insertSitesContentSchema, insertPricingPlanSchema, welcomeMessages, forms } from "@shared/schema";
import cookieParser from "cookie-parser";
import OpenAI from 'openai';
import { and, eq, gt } from "drizzle-orm";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { db, pool } from "./db";



// Función para detectar el idioma del mensaje del usuario
function detectLanguage(message: string): string {

  const text = message.toLowerCase().trim();

  // Palabras comunes en español
  const spanishWords = [
    "hola", "gracias", "por favor", "adiós", "sí", "no", "cómo", "qué", "dónde", "cuándo",
    "quién", "por qué", "ayuda", "información", "precio", "servicio", "empresa", "contacto",
    "productos", "disponible", "horario", "ubicación", "teléfono", "correo", "página",
    "necesito", "quiero", "busco", "me interesa", "puedo", "tienes", "tienen", "ofrecen",
    "buenos días", "buenas tardes", "buenas noches", "muchas gracias", "de nada", "está",
    "son", "estoy", "tengo", "puede", "hacer", "muy", "bien", "malo", "bueno"
  ];

  // Palabras comunes en francés
  const frenchWords = [
    "bonjour", "merci", "au revoir", "oui", "non", "comment", "quoi", "où", "quand",
    "qui", "pourquoi", "aide", "information", "prix", "service", "entreprise", "contact",
    "produits", "disponible", "horaire", "emplacement", "téléphone", "email", "page",
    "besoin", "veux", "cherche", "intéresse", "puis", "avez", "offrez", "vous",
    "journée", "soirée", "nuit", "beaucoup", "rien", "salut", "est", "sont", "suis",
    "avoir", "être", "faire", "très", "bien", "mal", "bon", "bonne"
  ];

  // Palabras comunes en inglés
  const englishWords = [
    "hello", "thank", "please", "goodbye", "yes", "no", "how", "what", "where", "when",
    "who", "why", "help", "information", "price", "service", "company", "contact",
    "products", "available", "schedule", "location", "phone", "email", "page",
    "need", "want", "looking", "interested", "can", "have", "offer", "you",
    "morning", "afternoon", "evening", "night", "much", "welcome", "hi", "are",
    "is", "am", "do", "make", "very", "good", "bad", "well"
  ];

  let spanishScore = 0;
  let frenchScore = 0;
  let englishScore = 0;

  // Contar coincidencias para cada idioma
  spanishWords.forEach(word => {
    if (text.includes(word)) {
      spanishScore++;
    }
  });

  frenchWords.forEach(word => {
    if (text.includes(word)) {
      frenchScore++;
    }
  });

  englishWords.forEach(word => {
    if (text.includes(word)) {
      englishScore++;
    }
  });

  // Determinar idioma con mayor puntuación
  if (spanishScore > frenchScore && spanishScore > englishScore) {
    return "es";
  } else if (frenchScore > spanishScore && frenchScore > englishScore) {
    return "fr";
  } else if (englishScore > 0) {
    return "en";
  } else {
    return "es";
  }
}

// Función para extraer contenido de documentos
async function extractDocumentContent(doc: any): Promise<string> {
  let content = `Información del archivo: ${doc.originalName || doc.filename}`;

  if (doc.path && fs.existsSync(doc.path)) {
    try {
      if (doc.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        try {
          const mammoth = await import("mammoth");
          const fileBuffer = fs.readFileSync(doc.path);
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          content = `Documento Word: ${doc.originalName}\n\nContenido:\n${result.value}`;
        } catch (mammothError) {
          console.error(`Error extracting DOCX content from ${doc.originalName}:`, mammothError);
          content = `Documento Word: ${doc.originalName}. Error al extraer contenido automáticamente.`;
        }
      } else if (doc.mimetype === "application/pdf") {
        try {
          const pdfParse = await import("pdf-parse");
          const fileBuffer = fs.readFileSync(doc.path);
          const pdfData = await pdfParse.default(fileBuffer);
          content = `Documento PDF: ${doc.originalName}\n\nContenido:\n${pdfData.text}`;
        } catch (pdfError) {
          console.error(`Error extracting PDF content from ${doc.originalName}:`, pdfError);
          content = `Documento PDF: ${doc.originalName}. Error al extraer contenido automáticamente.`;
        }
      } else if (doc.mimetype === "text/plain") {
        content = fs.readFileSync(doc.path, "utf8");
      } else {
        content = `Archivo ${doc.originalName}: Contiene información relevante sobre su organización.`;
      }
    } catch (error) {
      content = `Documento ${doc.originalName}: Información no disponible para procesamiento automático.`;
    }
  }

  return content;
}
// Función auxiliar para generar y almacenar mensajes promocionales - DEBE IR AL INICIO
async function generateAndStorePromotionalMessages(language = 'es') {
  try {
    if (!pool) {
      console.error("Database pool not available");
      return;
    }

    // Generar mensajes con IA para el idioma específico
    const messages = await generateAIPromotionalMessages(language);

    // Limpiar mensajes anteriores del mismo idioma
    await pool.query(`DELETE FROM promotional_messages WHERE message_type = 'ai_generated' AND language = $1`, [language]);

    // Insertar nuevos mensajes
    for (const message of messages) {
      await pool.query(`
        INSERT INTO promotional_messages (message_text, message_type, display_order, is_active, created_at, language)
        VALUES ($1, $2, $3, true, NOW(), $4)
      `, [message.message_text, message.message_type, message.display_order, language]);
    }

  } catch (error) {
    console.error("Error generating and storing promotional messages:", error);
  }
}

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
    const existingIntegration = await storage.getIntegrationByApiKey("aipps_web_internal");

    if (existingIntegration) {
      return;
    }

    // Crear la integración interna como integración compartida (userId: null indica que es compartida)
    await storage.createIntegration({
      name: "AIPPS Web Integration",
      url: "localhost",
      userId: 1, // Usar ID del administrador por defecto
      themeColor: "#6366f1",
      position: "bottom-right",
      botBehavior: "Eres AIPPS, un asistente integrado en el sitio web principal de AIPPS. Tu objetivo es ayudar a los usuarios a entender cómo funciona la plataforma, sus características y beneficios. Debes ser informativo, profesional y claro en tus respuestas. Brinda ejemplos concretos de cómo se puede utilizar AIPPS en diferentes contextos.",
      widgetType: "floating",
      apiKey: "aipps_web_internal",
      documentsData: []
    });

  } catch (error) {
    console.error("Error al crear integración interna:", error);
  }
}
// Obtener el equivalente a __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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




export async function registerRoutes(app: Express): Promise<Server> {
  // Configure cookie parser middleware
  app.use(cookieParser());
  const isAdmin = authIsAdmin;
  // Crear integración interna para el sitio principal
  // await createInternalWebsiteIntegration(); // Comentado temporalmente para fix Railway

  // Servir archivos estáticos desde la carpeta /static
  const staticDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/static');
  app.use('/static', express.static(staticDir));

  // API routes
  const apiRouter = app.route("/api");

// ================ Health Check Route (for Railway) ================
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});
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

      // Create token for immediate login after registration
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      // Set cookie
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "none",
        path: "/",
      });


      // Return user without password and include token
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        ...userWithoutPassword,
        token: token
      });
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

      // Return user without password and API key for security
      const { password, apiKey, ...userWithoutSecrets } = user;
      res.json(userWithoutSecrets);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User session endpoint - verifica y devuelve información de sesión
  app.get("/api/user-session", verifyToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password and API key for security
      const { password, apiKey, ...userWithoutSecrets } = user;
      res.json({
        user: userWithoutSecrets,
        authenticated: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Get user session error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ================ Plan Limits Routes ================
  
  // Get user limits summary
  app.get("/api/limits/summary", verifyToken, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const summary = await getUserLimitsSummary(req.userId);
      
      if (!summary) {
        return res.status(404).json({ message: 'No se encontró información de suscripción' });
      }

      res.json(summary);
    } catch (error) {
      console.error('Error obteniendo resumen de límites:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  // Check if user can create a resource
  app.get("/api/limits/check-resource/:resourceType", verifyToken, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const resourceType = req.params.resourceType as LimitableResource;
      
      // Validate resource type
      const validResources: LimitableResource[] = ['integrations', 'forms', 'conversations'];
      if (!validResources.includes(resourceType)) {
        return res.status(400).json({ message: `Tipo de recurso no válido: ${resourceType}` });
      }

      const result = await checkResourceLimit(req.userId, resourceType);
      res.json(result);
    } catch (error) {
      console.error('Error verificando límite de recurso:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  // Check if user has access to a feature
  app.get("/api/limits/check-feature/:feature", verifyToken, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const feature = req.params.feature as LimitableFeature;
      
      // Validate feature
      const validFeatures: LimitableFeature[] = [
        'customBranding', 'advancedAnalytics', 'apiAccess', 'basicAutomations',
        'advancedAutomations', 'webhooks', 'basicExport', 'advancedExport', 
        'dataBackups', 'crmIntegrations', 'calendarIntegrations', 'emailIntegrations',
        'multiUserAccess', 'teamManagement', 'whiteLabel'
      ];
      
      if (!validFeatures.includes(feature)) {
        return res.status(400).json({ message: `Funcionalidad no válida: ${feature}` });
      }

      const result = await checkFeatureAccess(req.userId, feature);
      res.json(result);
    } catch (error) {
      console.error('Error verificando acceso a funcionalidad:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });

  // ================ Authenticated Conversations Routes ================

  // Get user conversations specifically for fullscreen widget with apiKey verification
  app.get("/api/widget/:apiKey/conversations/user", async (req, res) => {
    try {
      const { apiKey } = req.params;

      // Validate API key first
      const integration = await storage.getIntegrationByApiKey(apiKey);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }

      // Check if user is authenticated via token
      const token = req.cookies?.auth_token || 
                    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                     ? req.headers.authorization.slice(7) : null);

      if (!token) {
        return res.status(401).json({ message: "Authentication required for fullscreen widget" });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

       // Verify user owns this integration OR it's the demo integration for AIPPS website
  const isDemoIntegration = integration.apiKey === '57031f04127cd041251b1e9abd678439fd199b2f30b75a1f';
  // Para widgets externos, permitir acceso si la integración existe y es válida
  const isExternalWidget = req.headers.origin && !req.headers.origin.includes('aipps.ca');
  if (!isDemoIntegration && !isExternalWidget && integration.userId !== decoded.userId) {
  return res.status(403).json({ message: "Unauthorized access to this integration" });
  }

        // Get conversations for this specific integration and user
        const conversations = await storage.getConversations(integration.id);

        // Filter conversations that belong to this authenticated user
        // For authenticated users, we use visitorId pattern: `user_${userId}`
        const userVisitorId = `user_${decoded.userId}`;
        const userConversations = conversations.filter(conv => 
          conv.visitorId === userVisitorId
        );

        // Sort by creation date (newest first)
        userConversations.sort((a, b) => {
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          return dateB - dateA;
        });


        res.json(userConversations);
      } catch (error) {
        console.error('JWT verification failed:', error);
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    } catch (error) {
      console.error("Get fullscreen widget conversations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user conversations for fullscreen widget
  app.get("/api/conversations", authenticateJWT, async (req, res) => {
    try {
      // Get user's integrations
      const integrations = await storage.getIntegrations(req.userId);

      if (integrations.length === 0) {
        return res.json([]);
      }

      // Get conversations from all user integrations
      let allConversations: any[] = [];
      for (const integration of integrations) {
        const conversations = await storage.getConversations(integration.id);
        allConversations = allConversations.concat(conversations);
      }

      // Sort by creation date (newest first)
      allConversations.sort((a, b) => {
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      res.json(allConversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new conversation for fullscreen widget with apiKey verification
  app.post("/api/widget/:apiKey/conversations/user", async (req, res) => {
    try {
      const { apiKey } = req.params;
      const { title, visitorName, visitorEmail } = req.body;

      // Validate API key first
      const integration = await storage.getIntegrationByApiKey(apiKey);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }

      // Check if user is authenticated via token
      const token = req.cookies?.auth_token || 
                    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                     ? req.headers.authorization.slice(7) : null);

      if (!token) {
        return res.status(401).json({ message: "Authentication required for fullscreen widget" });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

        // Verify user owns this integration OR it's the demo integration for AIPPS website
  const isDemoIntegration = integration.apiKey === '57031f04127cd041251b1e9abd678439fd199b2f30b75a1f';
  // Para widgets externos, permitir acceso si la integración existe y es válida
  const isExternalWidget = req.headers.origin && !req.headers.origin.includes('aipps.ca');
  if (!isDemoIntegration && !isExternalWidget && integration.userId !== decoded.userId) {
  return res.status(403).json({ message: "Unauthorized access to this integration" });
  }

        // Get authenticated user data for visitor info
        const authenticatedUser = await storage.getUser(decoded.userId);
        
        // Create conversation with authenticated user's visitorId pattern
        const conversation = await storage.createConversation({
          integrationId: integration.id,
          visitorId: `user_${decoded.userId}`
        });


        res.status(201).json(conversation);
      } catch (error) {
        console.error('JWT verification failed:', error);
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    } catch (error) {
      console.error("Create fullscreen widget conversation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new conversation for authenticated user
  app.post("/api/conversations", authenticateJWT, async (req, res) => {
    try {
      const { title } = req.body;

      // Get user's first integration (for simplicity, use the first one)
      const integrations = await storage.getIntegrations(req.userId);

      if (integrations.length === 0) {
        return res.status(400).json({ message: "No integrations found for user" });
      }
      
      // Get authenticated user data for visitor info
      const authenticatedUser = await storage.getUser(req.userId);
      
      const conversation = await storage.createConversation({
        integrationId: integrations[0].id,
        visitorId: `user_${req.userId}`
      });

      res.status(201).json(conversation);
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get messages for a specific conversation
  app.get("/api/conversations/:conversationId/messages", authenticateJWT, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);

      // Verify conversation exists and user has access
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Verify user owns the integration associated with this conversation
      if (!conversation.integrationId) {
        return res.status(404).json({ message: "Conversation has no associated integration" });
      }
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

  // Send message to conversation
  app.post("/api/conversations/:conversationId/messages", authenticateJWT, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const { content, role } = req.body;

      if (!content || !role) {
        return res.status(400).json({ message: "Content and role are required" });
      }

      // Verify conversation exists and user has access
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (!conversation.integrationId) {
        return res.status(404).json({ message: "Conversation has no associated integration" });
      }
      const integration = await storage.getIntegration(conversation.integrationId);
      if (!integration || integration.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Create user message
      const message = await storage.createMessage({
        conversationId,
        content,
        role,
      });

      // If user message, generate AI response
      if (role === "user") {
        try {
          // Get conversation messages for context
          const messages = await storage.getConversationMessages(conversationId);

          // Get site content for context
          const siteContent = await storage.getSiteContent(integration.id);
          let context = "";

          if (siteContent && siteContent.length > 0) {
            context = siteContent.map(content => `${content.title || 'Sin título'}: ${content.content}`).join('\n\n');
          }

          // Prepare conversation history
          const conversationHistory = messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));

          // Generate AI response
          const aiResponse = await generateChatCompletion(
            conversationHistory,
            context,
            integration.botBehavior || "Eres un asistente virtual útil y amigable."
          );

          // Save AI response
          await storage.createMessage({
            conversationId,
            content: aiResponse.message.content || "Error generating response",
            role: "assistant",
          });

          res.json({ 
            userMessage: message,
            aiResponse: { content: aiResponse.message.content || "Error generating response", role: "assistant" }
          });
        } catch (aiError) {
          console.error("Error generating AI response:", aiError);
          res.json({ 
            userMessage: message,
            error: "Error generating AI response"
          });
        }
      } else {
        res.json({ message });
      }
    } catch (error) {
      console.error("Create message error:", error);
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

  // Endpoint para obtener análisis de conversaciones globales del usuario
  app.get("/api/analytics/conversation", verifyToken, async (req, res) => {
    try {
      const conversationAnalytics = await storage.getConversationAnalytics(req.userId);
      res.json(conversationAnalytics);
    } catch (error) {
      console.error("Get conversation analytics error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Endpoint para obtener rendimiento de integraciones
  app.get("/api/analytics/integration-performance", verifyToken, async (req, res) => {
    try {
      const integrationPerformance = await storage.getIntegrationPerformance(req.userId);
      res.json(integrationPerformance);
    } catch (error) {
      console.error("Get integration performance error:", error);
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

      // Filtrar mensajes de usuarios para análisis
      const userMessages = allMessages.filter(msg => msg.role === 'user');

      // Usar las funciones públicas de PgStorage para analizar datos reales
      const pgStorage = storage as any;

      // Extraer temas reales de los mensajes de usuarios
      const topTopics = userMessages.length > 0 ? pgStorage.extractTopTopics(userMessages) : [];

      // Extraer productos/servicios reales mencionados en los mensajes
      const topProducts = userMessages.length > 0 ? pgStorage.extractTopProducts(userMessages) : [];

      // Generar tendencia real de conversaciones basada en fechas de creación
      const conversationTrend = conversations.length > 0 ? pgStorage.getConversationTrend(conversations) : [];

      // Extraer palabras clave de los mensajes de usuarios
      const keywordFrequency = userMessages.length > 0 ? pgStorage.extractKeywords(userMessages) : [];

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
        conversationTrend,
        keywordFrequency
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
  app.get("/api/automations", authenticateJWT, async (req, res) => {
    try {
      const automations = await storage.getAutomations(req.userId);
      res.json(automations);
    } catch (error) {
      console.error("Get automations error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/automations", authenticateJWT, async (req, res) => {
    try {
      const validatedData = z.object({
        name: z.string(),
        description: z.string(),
        status: z.enum(["active", "inactive", "in_testing"]),
        config: z.any(),
      }).parse(req.body);

      const automation = await storage.createAutomation({
        userId: req.userId,
        name: validatedData.name,
        description: validatedData.description,
        status: validatedData.status,
        config: validatedData.config || {}
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

    app.post("/api/integrations", verifyToken, requireBudgetCheck('integrations'), upload.array('documents'), async (req, res) => {
      try {

        // Comprobar si el usuario está tratando de crear una integración con el nombre restringido
         //const isPablo = req.userId === 1; // ID del usuario Pablo
         //const isReservdName = req.body.name === 'Techcolca21';

        // if (isReservdName && !isPablo) {
          // return res.status(403).json({ 
          //   message: "No puedes crear una integración con este nombre. Está reservado para el chat principal del sitio web." 
         //  });
       //  }

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


        // Creamos la integración con los datos del formulario y información de documentos
        const integration = await storage.createIntegration({
          ...integrationData,
          apiKey: apiKey,
          documentsData: documentsData
        });


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
         //const isMainWebsiteIntegration = integration.name === 'Techcolca21';
        // const isPablo = req.userId === 1; // ID del usuario Pablo

         //if (isMainWebsiteIntegration && !isPablo) {
         //  return res.status(403).json({ message: "Solo Pablo puede configurar el chat principal del sitio web" });
        // }

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
         //const isMainWebsiteIntegration = integration.name === 'Techcolca21';
         //const isPablo = req.userId === 1; // ID del usuario Pablo

       // if (isMainWebsiteIntegration && !isPablo) {
        //   return res.status(403).json({ message: "Solo Pablo puede configurar el chat principal del sitio web" });
       //  }

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
          ignoredSectionsText: req.body.ignoredSectionsText,
          position: req.body.position,
          active: req.body.active,
          widgetType: req.body.widgetType,
          botBehavior: req.body.botBehavior,
          description: req.body.description,
          language: req.body.language,
          textColor: req.body.textColor,
          customization: req.body.customization
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
        // const isMainWebsiteIntegration = integration.name === 'Techcolca21';
         //const isPablo = req.userId === 1; // ID del usuario Pablo

        // if (isMainWebsiteIntegration && !isPablo) {
         //  return res.status(403).json({ message: "Solo Pablo puede eliminar el chat principal del sitio web" });
         //}

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

    // Ruta para obtener configuración del chatbot de la página de bienvenida
    app.get("/api/welcome-chat-settings", async (req, res) => {
      try {
        // Obtener configuración desde una cuenta de administrador
        // Por defecto usar la configuración del user ID 4 (admin) u obtener el primer usuario admin
        const adminUserId = 4; // Esta es la cuenta de admin predeterminada

        // Obtener configuración
        const settings = await storage.getSettings(adminUserId);

        // Devolver solo la configuración relacionada con el chatbot de bienvenida
        // Nota: Ya no incluimos un mensaje de bienvenida predeterminado en español para permitir que el cliente use i18n
        res.json({
          welcomePageChatEnabled: settings?.welcomePageChatEnabled || true,
          welcomePageChatGreeting: settings?.welcomePageChatGreeting || null, // Permitir que el cliente use su i18n para elegir el mensaje
          welcomePageChatBubbleColor: settings?.welcomePageChatBubbleColor || '#111827',
          welcomePageChatTextColor: settings?.welcomePageChatTextColor || '#FFFFFF',
          welcomePageChatBehavior: settings?.welcomePageChatBehavior || 'Sé amable, informativo y conciso al responder preguntas sobre AIPPS y sus características.',
          welcomePageChatScrapingEnabled: settings?.welcomePageChatScrapingEnabled || false,
          welcomePageChatScrapingDepth: settings?.welcomePageChatScrapingDepth || 5,
          welcomePageChatScrapingData: settings?.welcomePageChatScrapingData || null
        });
      } catch (error) {
        console.error("Get welcome chat settings error:", error);
        // En caso de error, devolver configuración predeterminada
        // Permitimos que el cliente elija el mensaje de bienvenida según el idioma
        res.json({
          welcomePageChatEnabled: true,
          welcomePageChatGreeting: null, // Permitir que el cliente use i18n
          welcomePageChatBubbleColor: '#111827',
          welcomePageChatTextColor: '#FFFFFF',
          welcomePageChatBehavior: 'Sé amable, informativo y conciso al responder preguntas sobre AIPPS y sus características.',
          welcomePageChatScrapingEnabled: false,
          welcomePageChatScrapingDepth: 5,
          welcomePageChatScrapingData: null
        });
      }
    });

    // Ruta para actualizar configuración del chatbot de bienvenida
    app.post("/api/welcome-chat-settings", verifyToken, isAdmin, async (req, res) => {
      try {
        const {
          welcomePageChatEnabled,
          welcomePageChatGreeting,
          welcomePageChatBubbleColor,
          welcomePageChatTextColor,
          welcomePageChatBehavior,
          welcomePageChatScrapingEnabled,
          welcomePageChatScrapingDepth
        } = req.body;

        // Actualizar configuración del administrador
        const adminUserId = 4; // Usamos la cuenta admin predeterminada
        const currentSettings = await storage.getSettings(adminUserId);

        if (!currentSettings) {
          return res.status(404).json({ message: "Admin settings not found" });
        }

        // Preparar objeto con los campos a actualizar
        const updateData: any = {};

        if (typeof welcomePageChatEnabled === 'boolean') {
          updateData.welcomePageChatEnabled = welcomePageChatEnabled;
        }

        if (welcomePageChatGreeting !== undefined) {
          updateData.welcomePageChatGreeting = welcomePageChatGreeting;
        }

        if (welcomePageChatBubbleColor) {
          updateData.welcomePageChatBubbleColor = welcomePageChatBubbleColor;
        }

        if (welcomePageChatTextColor) {
          updateData.welcomePageChatTextColor = welcomePageChatTextColor;
        }

        if (welcomePageChatBehavior) {
          updateData.welcomePageChatBehavior = welcomePageChatBehavior;
        }

        if (typeof welcomePageChatScrapingEnabled === 'boolean') {
          updateData.welcomePageChatScrapingEnabled = welcomePageChatScrapingEnabled;
        }

        if (welcomePageChatScrapingDepth) {
          updateData.welcomePageChatScrapingDepth = welcomePageChatScrapingDepth;
        }

        // Actualizar settings
        const updatedSettings = await storage.updateSettings(adminUserId, updateData);

        res.json({
          success: true,
          settings: updatedSettings
        });
      } catch (error: any) {
        console.error("Update welcome chat settings error:", error);
        res.status(500).json({ 
          message: "Error updating welcome chat settings", 
          error: error.message 
        });
      }
    });

    // Ruta para ejecutar scraping para el chatbot de bienvenida
    app.post("/api/welcome-chat/scrape", async (req, res) => {
      try {
        // Obtener información de autenticación
        const token = req.cookies?.auth_token || 
                      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                       ? req.headers.authorization.slice(7) : null);

        let adminUser = null;

        if (token) {
          try {
            // Verificar el token
            // Token verification (logging removed for security)
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            console.log("Token verificado correctamente");

            // Obtener los datos completos del usuario
            adminUser = await storage.getUser(decoded.userId);
            console.log("Usuario para scraping autenticado");

            if (adminUser?.username !== 'admin') {
              return res.status(403).json({ message: "Forbidden: Admin access required" });
            }
          } catch (error) {
            console.error('Error al verificar token para scraping:', error);
            return res.status(401).json({ message: 'Invalid token' });
          }
        } else {
          console.log("No se encontró token para scraping");
          return res.status(401).json({ message: 'Authentication required' });
        }

        // Datos del scraping
        const { url, maxPages } = req.body;

        // Asegurarnos de que tenemos una URL válida
        let siteUrl = url;
        if (!siteUrl) {
          // Usar la URL del host como fallback
          if (req.headers.host) {
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            siteUrl = `${protocol}://${req.headers.host}`;
          } else {
            // URL de respaldo para Replit
            siteUrl = "https://aipps.ca";
          }
        }

        console.log(`Iniciando scraping para chatbot de bienvenida: ${siteUrl}`);

        // Scraper las páginas más importantes primero
        const pagesLimit = maxPages || 5;

        try {
          // Realizar el scraping
          const scrapedData = await webscraper.scrapeSite(siteUrl, pagesLimit);
          console.log(`Scraping completado: ${scrapedData.pagesProcessed || 1} páginas procesadas`);

          // Asegurar que se muestre al menos 1 página si encontramos datos
          if ((scrapedData.pagesProcessed === 0 || !scrapedData.pagesProcessed) && 
              (scrapedData.extraData && 
               ((scrapedData.extraData.pricingPlans && scrapedData.extraData.pricingPlans.length > 0) ||
                scrapedData.extraData.forms || 
                scrapedData.extraData.documentation))) {
            console.log("Ajustando contador: encontramos información relevante pero el contador está en 0");
            scrapedData.pagesProcessed = 1;
          }

          // Obtener los datos de precios actuales
          const pricingPlans = await storage.getAvailablePricingPlans();

          // Crear una estructura de datos con información de precios
          const pricingData = pricingPlans.map(plan => ({
            name: plan.name,
            tier: plan.tier,
            price: plan.price,
            currency: plan.currency || 'USD',
            interval: plan.interval || 'month',
            description: plan.description,
            features: plan.features || getFeaturesByTier(plan.tier),
            interactionsLimit: plan.interactionsLimit
          }));

          // Añadir datos de precios al resultado del scraping
          scrapedData.extraData = {
            pricingPlans: pricingData
          };

          // Actualizar configuración del administrador con los datos extraídos
          const adminUserId = adminUser?.id || 4; // Usamos la cuenta admin (ID 4 como fallback)
          const currentSettings = await storage.getSettings(adminUserId);

          if (!currentSettings) {
            return res.status(404).json({ message: "Admin settings not found" });
          }

          // Verificar los datos obtenidos
          if (!scrapedData || !scrapedData.pages || scrapedData.pages.length === 0) {
            console.warn("No se encontró contenido durante el scraping");

            // Crear un dato mínimo para que el chatbot tenga algo de contexto
            scrapedData.pages = [{
              url: siteUrl,
              title: "AIPPS - Plataforma de IA Conversacional",
              content: "AIPPS es una plataforma de IA conversacional que permite a las empresas integrar asistentes virtuales en sus sitios web. Ofrecemos diversos planes adaptados a diferentes necesidades empresariales."
            }];

            // Asegurarnos de reportar al menos 1 página procesada
            scrapedData.pagesProcessed = 1;
          } else if (scrapedData.pagesProcessed === 0) {
            // Si encontramos contenido pero el contador es 0, asignar al menos 1 página
            console.log("Ajustando contador: se encontró contenido pero el contador estaba en 0");
            scrapedData.pagesProcessed = Math.max(1, scrapedData.pages.length);
          }

          // Transformar los datos a un formato más útil para el chatbot
          const processedData = {
            sitemap: scrapedData.pages.map(page => ({
              url: page.url,
              title: page.title
            })),
            pricing: scrapedData.extraData?.pricingPlans || [],
            forms: scrapedData.extraData?.forms || {},
            content: scrapedData.pages.reduce((acc, page) => {
              acc[page.url] = {
                title: page.title,
                content: page.content
              };
              return acc;
            }, {}),
            pagesProcessed: scrapedData.pagesProcessed,
            timestamp: new Date().toISOString()
          };

          console.log(`Scraping procesado: ${processedData.pagesProcessed} páginas, ${processedData.pricing.length} planes de precios, info de formularios incluida`);

          // Guardar datos procesados
          const scrapingDataString = JSON.stringify(processedData);
          console.log(`Tamaño de los datos de scraping: ${scrapingDataString.length} caracteres`);

          // Actualizar settings con la información de scraping
          await storage.updateSettings(adminUserId, {
            welcomePageChatScrapingEnabled: true,
            welcomePageChatScrapingData: scrapingDataString,
            welcomePageChatScrapingDepth: maxPages || 5
          });

          // Devolver los datos de scraping
          res.json({
            success: true,
            scrapedData: processedData
          });
        } catch (scrapeError: any) {
          console.error("Error durante el scraping:", scrapeError);
          res.status(500).json({ 
            message: "Error durante el proceso de scraping", 
            error: scrapeError.message 
          });
        }
      } catch (error: any) {
        console.error("Error en la autenticación para scraping:", error);
        res.status(500).json({ 
          message: "Error durante el proceso de autenticación para scraping", 
          error: error.message 
        });
      }
    });

    // ================ Site Content Routes ================
    // Ruta para extracción de contenido del sitio (alias de scrape)
    app.post("/api/site-content/extract", verifyToken, async (req, res) => {
      try {
        const { url, integrationId, maxPages } = req.body;

        if (!url || !integrationId) {
          return res.status(400).json({ 
            success: false,
            message: "URL and integrationId are required" 
          });
        }

        // Verificar que la integración existe y pertenece al usuario
        const integration = await storage.getIntegration(parseInt(integrationId));
        if (!integration) {
          return res.status(404).json({ 
            success: false,
            message: "Integration not found" 
          });
        }

        if (integration.userId !== req.userId) {
          return res.status(403).json({ 
            success: false,
            message: "Unauthorized" 
          });
        }

        console.log(`Iniciando extracción de contenido: ${url} para integrationId: ${integrationId}`);

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

        // Asegurar que reportamos al menos 1 página si tenemos contenido
        const reportedPageCount = scrapedData.pagesProcessed > 0 ? 
                                 scrapedData.pagesProcessed : 
                                 (savedContent.length > 0 ? savedContent.length : 1);

        res.json({
          success: true,
          message: "Extracción completada con éxito",
          pagesProcessed: reportedPageCount,
          savedContent
        });
      } catch (error) {
        console.error("Error en extracción de contenido:", error);
        res.status(500).json({ 
          success: false,
          message: "Error durante la extracción del contenido del sitio", 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });

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
          // Asegurar que reportamos al menos 1 página si tenemos contenido
              const reportedPageCount = scrapedData.pagesProcessed > 0 ? 
                                       scrapedData.pagesProcessed : 
                                       (savedContent.length > 0 ? savedContent.length : 1);

              res.json({
                message: "Scraping completado con éxito",
                pagesProcessed: reportedPageCount,
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

         // ================ Marketing Routes ================
        // Endpoint para obtener mensajes promocionales dinámicos generados por IA
        app.get("/api/marketing/promotional-messages", async (req, res) => {
          try {
            // ✅ VERIFICAR POOL ANTES DE USAR
            if (!pool) {
              console.error("Database pool not available");
              return res.status(500).json({ 
                message: "Database connection not available",
                fallback: []
              });
            }

            const language = req.query.lang as string || 'es';

            // Verificar si necesitamos generar nuevos mensajes (cada 7 días)
            const lastGenerated = await pool.query(`
              SELECT created_at FROM promotional_messages 
              WHERE message_type = 'ai_generated' 
              AND language = $1
              ORDER BY created_at DESC 
              LIMIT 1
            `, [language]);

            const needsRegen = !lastGenerated.rows[0] || 
              (Date.now() - new Date(lastGenerated.rows[0].created_at).getTime()) > (7 * 24 * 60 * 60 * 1000);

            if (needsRegen) {
              console.log(`Generando nuevos mensajes promocionales con IA para idioma: ${language}...`);
              try {
                // Generate messages directly using the available function
                const messages = await generateAIPromotionalMessages(language);
                
                // Clear previous messages for this language
                await pool.query(`DELETE FROM promotional_messages WHERE message_type = 'ai_generated' AND language = $1`, [language]);
                
                // Insert new messages
                for (const message of messages) {
                  await pool.query(`
                    INSERT INTO promotional_messages (message_text, message_type, display_order, is_active, created_at, language)
                    VALUES ($1, $2, $3, true, NOW(), $4)
                  `, [message.message_text, message.message_type, message.display_order, language]);
                }
              } catch (error) {
                console.error("Error generating promotional messages:", error);
              }
            }

            // Obtener mensajes generados por IA para el idioma específico
            const result = await pool.query(`
              SELECT pm.message_text, pm.message_type, pm.display_order, pm.language
              FROM promotional_messages pm
              WHERE pm.message_type = 'ai_generated'
              AND pm.is_active = true
              AND pm.language = $1
              ORDER BY pm.display_order ASC
            `, [language]);

            res.json(result.rows);
          } catch (error) {
            console.error("Error getting promotional messages:", error);

            // ✅ VERIFICAR POOL EN FALLBACK TAMBIÉN
            if (!pool) {
              return res.status(500).json({ 
                message: "Database connection error", 
                fallback: [] 
              });
            }

            try {
              // Fallback a mensajes estáticos si falla la IA
              const fallbackResult = await pool.query(`
                SELECT pm.message_text, pm.message_type, pm.display_order
                FROM promotional_messages pm
                JOIN marketing_campaigns mc ON pm.campaign_id = mc.id
                WHERE mc.is_active = true 
                AND pm.message_type != 'ai_generated'
                AND pm.is_active = true
                ORDER BY pm.display_order ASC
              `);

              res.json(fallbackResult.rows);
            } catch (fallbackError) {
              console.error("Error in fallback query:", fallbackError);
              res.status(500).json({ message: "Database error", fallback: [] });
            }
          }
        });

          // Endpoint para obtener información de campaña activa
          app.get("/api/marketing/active-campaign", async (req, res) => {
            try {
              const result = await pool.query(`
                SELECT 
                  name,
                  description,
                  max_subscribers,
                  current_subscribers,
                  (max_subscribers - current_subscribers) as remaining_spots,
                  end_date
                FROM marketing_campaigns 
                WHERE is_active = true 
                AND start_date <= NOW() 
                AND (end_date IS NULL OR end_date >= NOW())
                AND current_subscribers < max_subscribers
                LIMIT 1
              `);

              if (result.rows.length > 0) {
                res.json(result.rows[0]);
              } else {
                res.json(null);
              }
            } catch (error) {
              console.error("Error getting active campaign:", error);
              res.status(500).json({ message: "Internal server error" });
            }
          });

          // Endpoint para forzar regeneración de mensajes promocionales (admin)
          app.post("/api/marketing/regenerate-messages", authenticateJWT, async (req, res) => {
            try {
              console.log("Regenerando mensajes promocionales manualmente...");
              const newMessages = await generateAIPromotionalMessages(pool);
              res.json({ 
                message: "Mensajes regenerados exitosamente", 
                count: newMessages.length,
                messages: newMessages 
              });
            } catch (error) {
              console.error("Error regenerating messages:", error);
              res.status(500).json({ message: "Error regenerando mensajes" });
            }
          });

          // Endpoint de prueba para generar mensajes (sin autenticación)
          app.get("/api/test-generate-messages", async (req, res) => {
            try {
              console.log("Generando mensajes de prueba...");
              const newMessages = await generateAIPromotionalMessages(pool);
              res.json({ 
                success: true,
                count: newMessages.length,
                messages: newMessages 
              });
            } catch (error: any) {
              console.error("Error en prueba de generación:", error);
              res.status(500).json({ error: error.message });
            }
          });

          // ================ Feature Access Routes ================
          app.post("/api/features/check-access", authenticateJWT, async (req, res) => {
            try {
              const { feature } = req.body;

              if (!feature) {
                return res.status(400).json({ message: "Feature parameter is required" });
              }

              // Obtener suscripción del usuario
              const subscription = await getUserSubscription(req.userId);
              const userPlan = subscription?.tier || 'basic';

              // Importar funciones de verificación de características
              const { hasFeatureAccess, getNextPlanForFeature, PLAN_NAMES, getUpgradeMessage } = await import('../shared/feature-permissions');

              // Verificar si tiene acceso a la característica
              const hasAccess = hasFeatureAccess(userPlan, feature as any);

              if (!hasAccess) {
                const requiredPlan = getNextPlanForFeature(userPlan, feature as any);
                const upgradeMessage = getUpgradeMessage(userPlan, feature);

                return res.json({
                  hasAccess: false,
                  currentPlan: userPlan,
                  requiredPlan: requiredPlan,
                  requiredPlanName: PLAN_NAMES[requiredPlan || 'professional'] || 'Plan Superior',
                  upgradeMessage: upgradeMessage,
                  feature: feature
                });
              }

              res.json({
                hasAccess: true,
                currentPlan: userPlan,
                feature: feature
              });
            } catch (error) {
              console.error("Error checking feature access:", error);
              res.status(500).json({ message: "Internal server error" });
            }
          });

          // ================ OpenAI Routes ================
          app.post("/api/openai/completion", async (req, res) => {
            try {
              const { messages, context, language } = req.body;

              if (!messages || !Array.isArray(messages)) {
                return res.status(400).json({ message: "Invalid messages format" });
              }

              // Corregido para manejar el nuevo parámetro de idioma
              const completion = await generateChatCompletion(messages, context, language as string | undefined);
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

          // Helper function to get translated plan information (name, description, features)
          function getTranslatedPlanInfo(planId: string, language: string = 'es') {
            const planTranslations: { [key: string]: { [lang: string]: { name: string, description: string, features: string[] } } } = {
              'basic': {
                'es': {
                  name: 'Básico',
                  description: 'Plan básico para sitios web pequeños',
                  features: [
                    '500 conversaciones/mes',
                    '1 formulario personalizable (2 plantillas disponibles)',
                    'Widget de chat tipo burbuja únicamente',
                    'Integración en 1 sitio web',
                    'Procesamiento básico de documentos (PDF, DOCX)',
                    'Captura básica de leads',
                    'Análisis básicos de conversaciones',
                    'Soporte por email',
                    'Personalización limitada de branding'
                  ]
                },
                'en': {
                  name: 'Basic',
                  description: 'Basic plan for small websites',
                  features: [
                    '500 conversations/month',
                    '1 customizable form (2 templates available)',
                    'Bubble chat widget only',
                    'Integration on 1 website',
                    'Basic document processing (PDF, DOCX)',
                    'Basic lead capture',
                    'Basic conversation analytics',
                    'Email support',
                    'Limited branding customization'
                  ]
                },
                'fr': {
                  name: 'Basique',
                  description: 'Plan de base pour petits sites web',
                  features: [
                    '500 conversations/mois',
                    '1 formulaire personnalisable (2 modèles disponibles)',
                    'Widget de chat bulle uniquement',
                    'Intégration sur 1 site web',
                    'Traitement de base des documents (PDF, DOCX)',
                    'Capture de leads de base',
                    'Analyses de base des conversations',
                    'Support par email',
                    'Personnalisation limitée du branding'
                  ]
                }
              },
              'startup': {
                'es': {
                  name: 'Startup',
                  description: 'Perfecto para negocios en crecimiento',
                  features: [
                    '2.000 conversaciones/mes',
                    '5 formularios personalizables (todas las plantillas)',
                    'Widget chat + modo pantalla completa tipo ChatGPT',
                    'Integración en hasta 3 sitios web',
                    'Procesamiento avanzado de documentos',
                    'Base de conocimiento personalizada',
                    'Captura y seguimiento de leads',
                    'Análisis avanzados con métricas',
                    'Personalización completa de branding',
                    'Soporte prioritario por email y chat',
                    'Exportación básica de datos'
                  ]
                },
                'en': {
                  name: 'Startup',
                  description: 'Perfect for growing businesses',
                  features: [
                    '2,000 conversations/month',
                    '5 customizable forms (all templates)',
                    'Chat widget + fullscreen ChatGPT mode',
                    'Integration on up to 3 websites',
                    'Advanced document processing',
                    'Custom knowledge base',
                    'Lead capture and tracking',
                    'Advanced analytics with metrics',
                    'Complete branding customization',
                    'Priority email and chat support',
                    'Basic data export'
                  ]
                },
                'fr': {
                  name: 'Startup',
                  description: 'Parfait pour les entreprises en croissance',
                  features: [
                    '2 000 conversations/mois',
                    '5 formulaires personnalisables (tous les modèles)',
                    'Widget chat + mode plein écran ChatGPT',
                    'Intégration sur jusqu\'à 3 sites web',
                    'Traitement avancé des documents',
                    'Base de connaissances personnalisée',
                    'Capture et suivi des leads',
                    'Analyses avancées avec métriques',
                    'Personnalisation complète du branding',
                    'Support prioritaire par email et chat',
                    'Exportation de base des données'
                  ]
                }
              },
              'professional': {
                'es': {
                  name: 'Profesional',
                  description: 'Para empresas profesionales',
                  features: [
                    '10.000 conversaciones/mes',
                    'Formularios ilimitados',
                    'Todas las funciones del plan Profesional',
                    'Integración en sitios web ilimitados',
                    'Automatizaciones básicas (respuestas automáticas)',
                    'Integración con CRM (Salesforce, HubSpot)',
                    'API del desarrollador acceso',
                    'Análisis avanzados con reportes personalizados',
                    'Exportación de datos en múltiples formatos',
                    'Respaldos automáticos',
                    'Gestión de equipos (hasta 5 usuarios)',
                    'Soporte por email, chat y teléfono',
                    'Onboarding personalizado'
                  ]
                },
                'en': {
                  name: 'Professional',
                  description: 'For professional companies',
                  features: [
                    '10,000 conversations/month',
                    'Unlimited forms',
                    'All Professional plan features',
                    'Unlimited website integrations',
                    'Basic automations (automatic responses)',
                    'CRM integration (Salesforce, HubSpot)',
                    'Developer API access',
                    'Advanced analytics with custom reports',
                    'Multi-format data export',
                    'Automatic backups',
                    'Team management (up to 5 users)',
                    'Email, chat and phone support',
                    'Custom onboarding'
                  ]
                },
                'fr': {
                  name: 'Professionnel',
                  description: 'Pour les entreprises professionnelles',
                  features: [
                    '10 000 conversations/mois',
                    'Formulaires illimités',
                    'Toutes les fonctionnalités du plan Professionnel',
                    'Intégrations de sites web illimitées',
                    'Automatisations de base (réponses automatiques)',
                    'Intégration CRM (Salesforce, HubSpot)',
                    'Accès API développeur',
                    'Analyses avancées avec rapports personnalisés',
                    'Exportation de données multi-formats',
                    'Sauvegardes automatiques',
                    'Gestion d\'équipe (jusqu\'à 5 utilisateurs)',
                    'Support par email, chat et téléphone',
                    'Intégration personnalisée'
                  ]
                }
              },
              'enterprise': {
                'es': {
                  name: 'Empresarial',
                  description: 'Plan completo con IA automatizada',
                  features: [
                    'Conversaciones ilimitadas',
                    'Formularios ilimitados',
                    'Todas las funciones disponibles',
                    'Integración en sitios web ilimitados',
                    'Automatizaciones completas con IA',
                    'IA local vs IA normal',
                    'Integración con todos los CRM',
                    'API completa con capacidades avanzadas',
                    'Análisis empresariales avanzados',
                    'Exportación de datos ilimitada',
                    'Respaldos automáticos diarios',
                    'Gestión de equipos ilimitada',
                    'Soporte 24/7 dedicado',
                    'Gerente de cuenta dedicado',
                    'SLA garantizado'
                  ]
                },
                'en': {
                  name: 'Enterprise',
                  description: 'Complete plan with automated AI',
                  features: [
                    'Unlimited conversations',
                    'Unlimited forms',
                    'All available features',
                    'Unlimited website integrations',
                    'Complete AI automations',
                    'Local AI vs normal AI',
                    'Integration with all CRMs',
                    'Complete API with advanced capabilities',
                    'Advanced enterprise analytics',
                    'Unlimited data export',
                    'Daily automatic backups',
                    'Unlimited team management',
                    '24/7 dedicated support',
                    'Dedicated account manager',
                    'Guaranteed SLA'
                  ]
                },
                'fr': {
                  name: 'Entreprise',
                  description: 'Plan complet avec IA automatisée',
                  features: [
                    'Conversations illimitées',
                    'Formulaires illimités',
                    'Toutes les fonctionnalités disponibles',
                    'Intégrations de sites web illimitées',
                    'Automatisations IA complètes',
                    'IA locale vs IA normale',
                    'Intégration avec tous les CRM',
                    'API complète avec capacités avancées',
                    'Analyses d\'entreprise avancées',
                    'Exportation de données illimitée',
                    'Sauvegardes automatiques quotidiennes',
                    'Gestion d\'équipe illimitée',
                    'Support dédié 24/7',
                    'Gestionnaire de compte dédié',
                    'SLA garanti'
                  ]
                }
              }
            };

            const defaultPlan = { name: planId, description: '', features: [] };
            return planTranslations[planId]?.[language] || planTranslations[planId]?.['es'] || defaultPlan;
          }

          function getTranslatedFeatures(planId: string, language: string = 'es') {
            return getTranslatedPlanInfo(planId, language).features;
          }

          // Obtener los planes disponibles con promociones activas
          app.get("/api/pricing/plans", async (req, res) => {
            try {
              const language = req.query.lang as string || 'es';

              // Obtener campaña activa
              const campaignResult = await pool.query(`
                SELECT * FROM marketing_campaigns 
                WHERE is_active = true 
                AND start_date <= NOW() 
                AND (end_date IS NULL OR end_date >= NOW())
                AND current_subscribers < max_subscribers
                LIMIT 1
              `);

              const activeCampaign = campaignResult.rows[0];

              // Obtener los planes de precios de la base de datos
              const pricingPlans = await storage.getAvailablePricingPlans();

              let products = [];

              // Si hay campaña activa, aplicar descuentos
              if (activeCampaign) {
                const discountsResult = await pool.query(`
                  SELECT * FROM campaign_discounts 
                  WHERE campaign_id = $1
                `, [activeCampaign.id]);

                const discounts = discountsResult.rows;

                products = pricingPlans.map(plan => {
                  const discount = discounts.find(d => d.plan_id === plan.planId.toLowerCase());
                  const planVariants = [];
                  const translatedInfo = getTranslatedPlanInfo(plan.planId.toLowerCase(), language);

                  // Plan mensual
                  const monthlyPlan = {
                    id: plan.planId.toLowerCase(),
                    name: translatedInfo.name,
                    description: translatedInfo.description,
                    price: plan.price,
                    currency: plan.currency || "usd",
                    interval: plan.interval,
                    features: Array.isArray(plan.features) ? plan.features : [],
                    tier: plan.tier,
                    interactionsLimit: plan.interactionsLimit,
                    isAnnual: false,
                    discount: discount ? discount.monthly_discount_percent : 0,
                    originalPrice: plan.price,
                    promotionalPrice: discount && discount.monthly_discount_percent > 0 
                      ? Math.round(plan.price * (1 - discount.monthly_discount_percent / 100))
                      : plan.price,
                    campaignInfo: activeCampaign ? {
                      name: activeCampaign.name,
                      remainingSpots: activeCampaign.max_subscribers - activeCampaign.current_subscribers,
                      maxSubscribers: activeCampaign.max_subscribers,
                      promotionalMonths: discount ? discount.promotional_months : 0
                    } : null
                  };

                  planVariants.push(monthlyPlan);

                  // Plan anual
                  const annualDiscount = discount ? discount.annual_discount_percent : 0;
                  const annualPrice = plan.price * 12;
                  const annualPlan = {
                    id: plan.planId.toLowerCase() + '_annual',
                    name: translatedInfo.name,
                    description: translatedInfo.description,
                    price: annualDiscount > 0 
                      ? Math.round(annualPrice * (1 - annualDiscount / 100))
                      : Math.round(annualPrice * 0.85), // 15% descuento estándar anual
                    currency: plan.currency || "usd",
                    interval: 'year',
                    features: Array.isArray(plan.features) ? plan.features : [],
                    tier: plan.tier,
                    interactionsLimit: plan.interactionsLimit,
                    originalPrice: annualPrice,
                    promotionalPrice: annualDiscount > 0 
                      ? Math.round(annualPrice * (1 - annualDiscount / 100))
                      : Math.round(annualPrice * 0.85),
                    isAnnual: true,
                    discount: annualDiscount > 0 ? annualDiscount : 15,
                    campaignInfo: activeCampaign ? {
                      name: activeCampaign.name,
                      remainingSpots: activeCampaign.max_subscribers - activeCampaign.current_subscribers,
                      maxSubscribers: activeCampaign.max_subscribers,
                      promotionalMonths: 12
                    } : null
                  };

                  planVariants.push(annualPlan);

                  return planVariants;
                });
              } else {
                // Sin campaña activa, transformar planes normalmente usando los planes reales de la DB
                products = pricingPlans.map(plan => {
                  const translatedInfo = getTranslatedPlanInfo(plan.planId.toLowerCase(), language);
                  return {
                    id: plan.planId.toLowerCase(),
                    name: translatedInfo.name,
                    description: translatedInfo.description,
                    price: plan.price,
                    priceDisplay: plan.priceDisplay || `$${plan.price}/${plan.interval === 'year' ? 'año' : 'mes'}`,
                    currency: plan.currency || "usd",
                    interval: plan.interval,
                    features: Array.isArray(plan.features) ? plan.features : [],
                    tier: plan.tier,
                    interactionsLimit: plan.interactionsLimit,
                    isAnnual: plan.interval === 'year',
                    discount: 0
                  };
                });
              }

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
                      price: (product.price || 0) / 100, // Convertir centavos a dólares para mostrar
                      currency: product.currency || "cad", // Dólares canadienses por defecto
                      interval: product.interval || "month", // Por defecto mensual
                      features: product.features || getFeaturesByTier(key.toLowerCase()),
                      tier: product.tier,
                      interactionsLimit: product.interactionsLimit,
                      isAnnual: product.isAnnual || false,
                      discount: product.discount || 0
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

              // Verificar si Stripe está disponible
              if (!stripe) {
                console.warn("API de Stripe no disponible. Redirigiendo a página de contacto.");
                return res.status(503).json({ 
                  success: false, 
                  message: "El sistema de pagos no está disponible en este momento. Por favor contacte al administrador.",
                  redirectUrl: "/contact" 
                });
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

              let session;
              try {
                session = await createCheckoutSession(
                  user.stripeCustomerId || undefined,
                  price.id,
                  successUrl,
                  cancelUrl
                );

                if (!session) {
                  throw new Error("No se pudo crear la sesión de checkout");
                }
              } catch (sessionError) {
                console.error("Error creando la sesión de checkout:", sessionError);
                return res.status(500).json({ 
                  success: false, 
                  message: "Error al crear la sesión de pago. Por favor intente más tarde."
                });
              }

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
                console.warn("API de Stripe no configurada. No se puede verificar la suscripción.");
                return res.status(503).json({ 
                  success: false, 
                  message: "El servicio de pagos no está disponible actualmente. Contacte al administrador.",
                  code: "STRIPE_NOT_CONFIGURED" 
                });
              }

              let session;
              try {
                session = await stripe.checkout.sessions.retrieve(sessionId);
              } catch (stripeError) {
                console.error("Error recuperando sesión de Stripe:", stripeError);
                return res.status(404).json({ 
                  success: false, 
                  message: "No se pudo recuperar la información de la sesión de pago" 
                });
              }

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

                let product;
                try {
                  product = await stripe.products.retrieve(productId);
                } catch (productError) {
                  console.error("Error recuperando producto de Stripe:", productError);
                  // Continuar con datos parciales en caso de error
                  product = { name: "Plan desconocido" };
                }

                const transformedSubscription = {
                  id: subscription.id,
                  status: subscription.status,
                  plan: product.name,
                  interval: planItem.plan.interval,
                  amount: (planItem.price.unit_amount || 0) / 100, // Convertir de centavos a unidades
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
          .sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime())[0];

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
        // const isMainIntegration = integration.name === 'Techcolca21';
        // const isPablo = req.userId === 1; // ID del usuario Pablo

        // Si es la integración principal y el usuario no es Pablo, verificar la operación
        // if (isMainIntegration && req.path.includes('/edit') && !isPablo) {
       //    return res.status(403).json({ message: "Solo Pablo puede configurar el chat principal del sitio web" });
     //    }

        // Get user settings
        const settings = await storage.getSettings(integration.userId);

        // Update visitor count
        await storage.incrementVisitorCount(integration.id);

        // Use integration-specific customization if available, fallback to global settings
        const customization = integration.customization || {};

        // Check if request is authenticated to provide user info
        const token = req.cookies?.auth_token || 
                      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                       ? req.headers.authorization.slice(7) : null);

        let userInfo = null;
        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            const authenticatedUser = await storage.getUser(decoded.userId);
            if (authenticatedUser) {
              userInfo = {
                name: authenticatedUser.fullName || authenticatedUser.username
              };
            }
          } catch (error) {
            console.error("Error getting user info for widget:", error);
          }
        }

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
            widgetType: integration.widgetType || 'bubble',
            description: integration.description,
            ignoredSectionsText: integration.ignoredSectionsText,
            language: integration.language || 'es',
            textColor: integration.textColor || 'auto',
            // No enviamos datos sensibles como userId o apiKey al cliente
          },
          settings: {
            assistantName: customization?.assistantName || settings?.assistantName || integration.name,
            defaultGreeting: customization?.defaultGreeting || settings?.defaultGreeting || `Hola, soy ${integration.name}. ¿En qué puedo ayudarte?`,
            showAvailability: customization?.showAvailability !== undefined ? customization.showAvailability : settings?.showAvailability !== undefined ? settings.showAvailability : true,
            userBubbleColor: customization?.userBubbleColor || settings?.userBubbleColor || "#3B82F6",
            assistantBubbleColor: customization?.assistantBubbleColor || settings?.assistantBubbleColor || "#E5E7EB",
            font: customization?.font || settings?.font || "inter",
            conversationStyle: customization?.conversationStyle || settings?.conversationStyle || "professional",
                  },
          userInfo: userInfo, // Include user info for personalized greetings
        });
      } catch (error) {
        console.error("Get widget error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // New endpoint for getting visitor conversations (supports fullscreen mode)
    app.get("/api/widget/:apiKey/conversations/:visitorId", async (req, res) => {
      try {
        const { apiKey, visitorId } = req.params;

        // Validate API key and get integration
        const integration = await storage.getIntegrationByApiKey(apiKey);
        if (!integration) {
          return res.status(404).json({ message: "Integration not found" });
        }

        // Get conversations for this visitor
        const conversations = await storage.getConversations(integration.id);
        const visitorConversations = conversations.filter(conv => 
          conv.visitorId === visitorId
        );

        res.json(visitorConversations);
      } catch (error) {
        console.error("Get visitor conversations error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // New endpoint for getting messages from a specific conversation (supports fullscreen mode)
    app.get("/api/widget/:apiKey/conversation/:conversationId/messages", async (req, res) => {
      try {
        const { apiKey, conversationId } = req.params;

        // Validate API key and get integration
        const integration = await storage.getIntegrationByApiKey(apiKey);
        if (!integration) {
          return res.status(404).json({ message: "Integration not found" });
        }

        // SECURITY FIX: Get conversation and verify it belongs to this integration
        const conversation = await storage.getConversation(parseInt(conversationId));
        if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
        }
        
        // CRITICAL: Verify conversation belongs to this integration (prevent cross-chatbot access)
        if (conversation.integrationId !== integration.id) {
          console.warn(`🚨 SECURITY: Attempted cross-integration access. Conversation ${conversationId} belongs to integration ${conversation.integrationId}, but request used apiKey for integration ${integration.id}`);
          return res.status(403).json({ message: "Access denied" });
        }

        // Get messages for this conversation
        const messages = await storage.getConversationMessages(parseInt(conversationId));

        res.json(messages);
      } catch (error) {
        console.error("Get conversation messages error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/widget/:apiKey/conversation", async (req, res) => {
      try {
        const { apiKey } = req.params;
        const { visitorId, visitorName, visitorEmail } = req.body;

        // Validate API key and get integration
        const integration = await storage.getIntegrationByApiKey(apiKey);
        if (!integration) {
          return res.status(404).json({ message: "Integration not found" });
        }

        // Create conversation
        const conversation = await storage.createConversation({
          integrationId: integration.id,
          visitorId,
          visitorName: visitorName || null,
          visitorEmail: visitorEmail || null,
        });

        res.status(201).json(conversation);
      } catch (error) {
        console.error("Create conversation error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // New endpoint for bubble widget system
    app.post("/api/widget/:apiKey/send", async (req, res) => {
      try {
        const { apiKey } = req.params;
        const { message, visitorId, currentUrl, pageTitle, visitorName, visitorEmail } = req.body;

        // Validate input
        if (!message || !visitorId) {
          return res.status(400).json({ message: "message and visitorId are required" });
        }

        // Validate API key and get integration
        const integration = await storage.getIntegrationByApiKey(apiKey);
        if (!integration) {
          return res.status(404).json({ message: "Integration not found" });
        }

        // Find or create conversation for this visitor
        const conversations = await storage.getConversations(integration.id);
        let conversation = conversations.find(conv => conv.visitorId === visitorId);

        if (!conversation) {
          // Create new conversation
          conversation = await storage.createConversation({
            integrationId: integration.id,
            visitorId,
            visitorName: visitorName || null,
            visitorEmail: visitorEmail || null,
            title: message.substring(0, 50) + "..."
          });
        }

        // Create user message
        await storage.createMessage({
          conversationId: conversation.id,
          content: message,
          role: "user",
        });

        // Get all messages for context
        const messages = await storage.getConversationMessages(conversation.id);

        // Get site content for context (same logic as working endpoint)
        let context = "";
        const siteContent = await storage.getSiteContent(integration.id);
        if (siteContent.length > 0) {
          context = siteContent.map(content => 
            `URL: ${content.url}\nTitle: ${content.title || 'N/A'}\nContent: ${content.content.substring(0, 500)}...`
          ).join('\n\n');
        }

        // Get user settings only for greeting (if needed)
        const userSettings = await storage.getSettings(integration.userId);

        // Prepare bot configuration using INTEGRATION-SPECIFIC settings
        const botConfig = {
          assistantName: integration.name, // Use integration name
          defaultGreeting: userSettings?.defaultGreeting || `Hola, soy ${integration.name}. ¿En qué puedo ayudarte?`,
          conversationStyle: integration.botBehavior, // Use integration's specific bot behavior
          description: integration.description,
          isWidget: true // Marca este bot como widget para aplicar restricciones
        };

        console.log('AIPPS Debug: Integration-specific bot configuration prepared for AI:', {
          integrationName: integration.name,
          assistantName: botConfig.assistantName,
          conversationStyle: botConfig.conversationStyle?.substring(0, 100) + '...',
          hasIntegrationBehavior: !!integration.botBehavior
        });

        // Get documents and site content for knowledge base  
        let documents = [];
        let siteContentItems = [];


        // Load site content items
        try {
          siteContentItems = await storage.getSiteContent(integration.id);
        } catch (error) {
          console.error('Error loading site content:', error);
          siteContentItems = [];
        }

        // Extract and process documents from integration's documentsData
        if (integration.documentsData && Array.isArray(integration.documentsData)) {
          for (const doc of integration.documentsData) {
            const content = await extractDocumentContent(doc);

            documents.push({
              original_name: doc.originalName || doc.filename,
              filename: doc.filename,
              content: content,
              path: doc.path
            });
          }
        }


        // Build enhanced context with knowledge base
        const knowledgeBase = buildKnowledgeBase(integration, documents, siteContentItems);
        const enhancedContext = context + "\n\n" + knowledgeBase;


        // Detect language and generate AI response with bot configuration
        const detectedLanguage = detectLanguage(message);



        // Add timeout wrapper for OpenAI call
  const completionPromise = generateChatCompletion(
    messages.map(m => ({ role: m.role, content: m.content })),
    enhancedContext,
    detectedLanguage,
    botConfig
  );

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('OpenAI timeout')), 25000)
  );

  const completion = await Promise.race([completionPromise, timeoutPromise]);

        // Validate completion response
        if (!completion || typeof completion !== 'object' || !('message' in completion) || 
            !completion.message || typeof completion.message !== 'object' || !('content' in completion.message) ||
            !completion.message.content) {
          console.error("AI completion returned null or empty content:", completion);
          throw new Error("Failed to generate AI response");
        }

        // Create assistant message
        await storage.createMessage({
          conversationId: conversation.id,
          content: completion.message.content,
          role: "assistant",
        });

        // Generate conversation title if needed (after 1st or 2nd user message)
        const allMessages = await storage.getConversationMessages(conversation.id);
        const userMessages = allMessages.filter(m => m.role === 'user');


        if ((!conversation.title || conversation.title === null || conversation.title === "null" || conversation.title === "Nueva conversación" || conversation.title === "New conversation" || conversation.title === "Nouvelle conversation") && userMessages.length >= 1) {
          try {
            const { generateConversationTitle } = await import('./lib/openai');
            const firstMessage = userMessages[0].content;
            const secondMessage = userMessages[1]?.content;

            const title = await generateConversationTitle(
              firstMessage,
              secondMessage,
              detectedLanguage
            );

            await storage.updateConversation(conversation.id, { title });
          } catch (error) {
            console.error("Error generating conversation title:", error);
          }
        }

        res.status(201).json({
          response: completion.message.content,
          conversationId: conversation.id,
          success: true
        });
      } catch (error) {
        console.error("Widget send message error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  // New endpoint for sending messages to specific conversations (supports both bubble and authenticated modes)
    app.post("/api/widget/:apiKey/conversation/:conversationId/send", async (req, res) => {
      try {
        console.log(`🚀 POST /api/widget/.../conversation/.../send iniciado`);
      console.log(`Request body:`, req.body);
      console.log(`Params:`, req.params);
        const { apiKey, conversationId } = req.params;
        const { message, visitorId, currentUrl, pageTitle, visitorName, visitorEmail } = req.body;

        // Validate API key and get integration
        const integration = await storage.getIntegrationByApiKey(apiKey);
        if (!integration) {
          return res.status(404).json({ message: "Integration not found" });
        }

        // SECURITY FIX: Verify conversation belongs to this integration (prevent cross-chatbot access)
        const conversation = await storage.getConversation(parseInt(conversationId));
        if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
        }
        
        if (conversation.integrationId !== integration.id) {
          console.warn(`🚨 SECURITY: Attempted cross-integration conversation access. Conversation ${conversationId} belongs to integration ${conversation.integrationId}, but request used apiKey for integration ${integration.id}`);
          return res.status(404).json({ message: "Conversation not found" });
        }

        // Check if this is an authenticated request (fullscreen widget)
        const token = req.cookies?.auth_token || 
                      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                       ? req.headers.authorization.slice(7) : null);

        let isAuthenticated = false;
        let authenticatedUserId = null;

        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            isAuthenticated = true;
            authenticatedUserId = decoded.userId;
          } catch (error) {
            console.error('JWT verification failed:', error);
            return res.status(401).json({ message: "Invalid or expired token" });
          }
        }

        // Validate input based on authentication mode
        if (!message) {
          return res.status(400).json({ message: "message is required" });
        }

        if (!isAuthenticated && !visitorId) {
          return res.status(400).json({ message: "visitorId is required for anonymous access" });
        }

        const conversationIdNum = parseInt(conversationId);
        if (isNaN(conversationIdNum)) {
          return res.status(400).json({ message: "Invalid conversation ID" });
        }

        // (integration and conversation already validated above in SECURITY FIX section)

        // Additional security check for authenticated users
        if (isAuthenticated) {
          // Verify user owns this integration OR it's the demo integration for AIPPS website
         const isDemoIntegration = integration.apiKey === '57031f04127cd041251b1e9abd678439fd199b2f30b75a1f';
  // Para widgets externos, permitir acceso si la integración existe y es válida
  const isExternalWidget = req.headers.origin && !req.headers.origin.includes('aipps.ca');
  if (!isDemoIntegration && !isExternalWidget && integration.userId !== authenticatedUserId) {
    return res.status(403).json({ message: "Unauthorized access to this integration" });
  }

          // Verify conversation belongs to this authenticated user
          const expectedVisitorId = `user_${authenticatedUserId}`;
          if (conversation.visitorId !== expectedVisitorId) {
            return res.status(403).json({ message: "Unauthorized access to this conversation" });
          }

        }

        // Create user message
        await storage.createMessage({
          conversationId: conversationIdNum,
          content: message,
          role: "user",
        });

        // Get all messages for context
        const messages = await storage.getConversationMessages(conversationIdNum);

        // Get site content for context
        let context = "";
        const siteContent = await storage.getSiteContent(integration.id);
        if (siteContent.length > 0) {
          context = siteContent.map(content => 
            `URL: ${content.url}\nTitle: ${content.title || 'N/A'}\nContent: ${content.content.substring(0, 500)}...`
          ).join('\n\n');
        }

        // Get user settings
        const userSettings = await storage.getSettings(integration.userId);

        // Get authenticated user information for personalization
        let userContext = "";
        if (isAuthenticated && authenticatedUserId) {
          try {
            const authenticatedUser = await storage.getUser(authenticatedUserId);
            if (authenticatedUser) {
              const userName = authenticatedUser.fullName || authenticatedUser.username;

              // Get user's conversation history to understand context
              const allConversations = await storage.getConversations(integration.id);
              const userConversations = allConversations.filter(conv => 
                conv.visitorId === `user_${authenticatedUserId}`
              );

              let conversationHistory = "";
              if (userConversations.length > 1) {
                // Get recent conversation titles for context

                  const recentTitles = userConversations
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3)
                  .map(conv => conv.title)
                  .filter(title => title && title !== 'Nueva conversación')
                  .join(', ');

                if (recentTitles) {
                  conversationHistory = `\n\nCONTEXTO DE CONVERSACIONES ANTERIORES: ${userName} ha hablado contigo antes sobre estos temas: ${recentTitles}. Úsalo como contexto para ser más natural y evitar preguntas repetitivas.`;
                }
              }

              userContext = `\n\nNOTA IMPORTANTE: El usuario que te está escribiendo se llama ${userName}. Puedes dirigirte a él por su nombre para hacer la conversación más personal y cercana. Sé natural y amigable, no repitas siempre las mismas preguntas sobre problemas o proyectos.${conversationHistory}`;
            }
          } catch (error) {
            console.error("Error getting authenticated user info:", error);
          }
        }

        // Prepare bot configuration using integration-specific settings
        const botConfig = {
          assistantName: integration.name,
          defaultGreeting: userSettings?.defaultGreeting || `Hola, soy ${integration.name}. ¿En qué puedo ayudarte?`,
          conversationStyle: integration.botBehavior + userContext,
          description: integration.description,
          isWidget: true // Marca este bot como widget para aplicar restricciones
        };

        console.log('AIPPS Debug: Sending message to specific conversation:', {
          conversationId: conversationIdNum,
          integrationName: integration.name,
          messagePreview: message.substring(0, 50) + '...'
        });

             // Detect language from user message
        const detectedLanguage = detectLanguage(message);

        // Get documents and site content for knowledge base
        let documents = [];
        let siteContentItems = [];

        // Extract documents from integration
        if (integration.documentsData && Array.isArray(integration.documentsData)) {
          for (const doc of integration.documentsData) {
            const content = await extractDocumentContent(doc);
            documents.push({
              original_name: doc.originalName || doc.filename,
              filename: doc.filename,
              content: content,
              path: doc.path
            });
          }
        }

        // Get site content
        try {
          siteContentItems = await storage.getSiteContent(integration.id);
        } catch (error) {
          console.error('Error loading site content:', error);
          siteContentItems = [];
        }

        // Build enhanced context with knowledge base
        const knowledgeBase = buildKnowledgeBase(integration, documents, siteContentItems);
        const enhancedContext = context + userContext + "\n\n" + knowledgeBase;


  // Add timeout wrapper for OpenAI call
  const completionPromise = generateChatCompletion(
          messages.map(m => ({ role: m.role, content: m.content })),
          enhancedContext,
          detectedLanguage,
          botConfig
        );

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('OpenAI timeout')), 25000)
  );

  const completion = await Promise.race([completionPromise, timeoutPromise]);

        // Validate completion response
        if (!completion || !completion.message || !completion.message.content) {
          console.error("AI completion returned null or empty content:", completion);
          throw new Error("Failed to generate AI response");
        }

        // Create assistant message
        await storage.createMessage({
          conversationId: conversationIdNum,
          content: completion.message.content,
          role: "assistant",
        });

        // Generate conversation title if needed (after 1st or 2nd user message)
        const allMessages = await storage.getConversationMessages(conversationIdNum);
        const userMessages = allMessages.filter(m => m.role === 'user');


        if ((!conversation.title || conversation.title === null || conversation.title === "null" || conversation.title === "Nueva conversación" || conversation.title === "New conversation" || conversation.title === "Nouvelle conversation") && userMessages.length >= 1) {
          try {
            const { generateConversationTitle } = await import('./lib/openai');
            const firstMessage = userMessages[0].content;
            const secondMessage = userMessages[1]?.content;

            const title = await generateConversationTitle(
              firstMessage,
              secondMessage,
              detectedLanguage
            );

            await storage.updateConversation(conversationIdNum, { title: title || "Nueva conversación" });
          } catch (error) {
            console.error("Error generating conversation title:", error);
          }
        }

        res.status(201).json({
          response: completion.message.content,
          conversationId: conversationIdNum,
          success: true
              });
      } catch (error: any) {
        console.error("🚨 Widget specific conversation send error:", {
          error: error.message,
          stack: error.stack,
          apiKey: req.params.apiKey,
          conversationId: req.params.conversationId,
          timestamp: new Date().toISOString()
        });
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/widget/:apiKey/message", async (req, res) => {
      try {
        const { apiKey } = req.params;
        const { conversationId, content, role, pageContext, language } = req.body;

        // Validate input
        if (!conversationId || !content || !role) {
          return res.status(400).json({ message: "conversationId, content, and role are required" });
        }

        // Validate API key and get integration
        const integration = await storage.getIntegrationByApiKey(apiKey);
        if (!integration) {
          return res.status(404).json({ message: "Integration not found" });
        }

        // SECURITY FIX: Verify conversation belongs to this integration (prevent cross-chatbot access)
        const conversationIdNum = parseInt(conversationId);
        if (isNaN(conversationIdNum)) {
          return res.status(400).json({ message: "Invalid conversation ID" });
        }
        
        const conversation = await storage.getConversation(conversationIdNum);
        if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
        }
        
        if (conversation.integrationId !== integration.id) {
          console.warn(`🚨 SECURITY: Attempted cross-integration message access. Conversation ${conversationIdNum} belongs to integration ${conversation.integrationId}, but request used apiKey for integration ${integration.id}`);
          return res.status(404).json({ message: "Conversation not found" });
        }

        // Create message
        const message = await storage.createMessage({
          conversationId: conversationIdNum,
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

          // Detect language from user message - ALWAYS use detection, ignore external language parameter
          const detectedLanguage = detectLanguage(content);
          console.log(`Idioma detectado del mensaje "${content}": ${detectedLanguage}`);
          console.log(`Parámetro de idioma recibido (ignorado): ${language}`);

          // ALWAYS use detected language, ignore any external language parameter
          const responseLanguage = detectedLanguage;

          // Prepare bot configuration for widget with restrictions
          const userSettings = await storage.getSettings(integration.userId);
          const botConfig = {
            assistantName: integration.name,
            defaultGreeting: userSettings?.defaultGreeting || `Hola, soy ${integration.name}. ¿En qué puedo ayudarte?`,
            conversationStyle: integration.botBehavior,
            description: integration.description,
            isWidget: true // Marca este bot como widget para aplicar restricciones
          };

          // Get documents and site content for knowledge base
          let widgetDocuments = [];
          let widgetSiteContent = [];

          // Extract and process documents from integration's documentsData
          if (integration.documentsData && Array.isArray(integration.documentsData)) {
            for (const doc of integration.documentsData) {
              const content = await extractDocumentContent(doc);

              widgetDocuments.push({
                original_name: doc.originalName || doc.filename,
                filename: doc.filename,
                content: content,
                path: doc.path
              });
            }
          }


          // Build enhanced context with knowledge base
          const knowledgeBase = buildKnowledgeBase(integration, widgetDocuments, widgetSiteContent);
          const enhancedContext = context + "\n\n" + knowledgeBase;

          // Generate AI response with detected language support and widget restrictions
          console.log(`Generating response in language: ${responseLanguage}`);
          const completion = await generateChatCompletion(
            messages.map(msg => ({ role: msg.role, content: msg.content || '' })),
            enhancedContext,
            responseLanguage,
            botConfig
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
        if (!conversation.integrationId) {
          return res.status(404).json({ message: "Conversation has no associated integration" });
        }
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

    // Delete conversation endpoint
    app.delete("/api/widget/:apiKey/conversation/:conversationId", async (req, res) => {
      try {
        const { apiKey, conversationId } = req.params;
        const conversationIdNum = parseInt(conversationId);

        // Validar que conversationId es un número válido
        if (isNaN(conversationIdNum)) {
          return res.status(400).json({ message: "Invalid conversation ID" });
        }

        // Obtener la integración por API key
        const integration = await storage.getIntegrationByApiKey(apiKey);
        if (!integration) {
          return res.status(404).json({ message: "Integration not found" });
        }

        // SECURITY FIX: Verify conversation belongs to this integration (prevent cross-chatbot access)
        const conversation = await storage.getConversation(conversationIdNum);
        if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
        }
        
        if (conversation.integrationId !== integration.id) {
          console.warn(`🚨 SECURITY: Attempted cross-integration conversation deletion. Conversation ${conversationIdNum} belongs to integration ${conversation.integrationId}, but request used apiKey for integration ${integration.id}`);
          return res.status(404).json({ message: "Conversation not found" });
        }


        // Para modo fullscreen, verificar autenticación de usuario
        if (req.headers.authorization) {
          const token = req.headers.authorization.replace('Bearer ', '');
          try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

            // Verify user owns this integration OR it's the demo integration for AIPPS website
            const isDemoIntegration = integration.apiKey === '57031f04127cd041251b1e9abd678439fd199b2f30b75a1f';
            if (!isDemoIntegration && integration.userId !== decoded.userId) {
              return res.status(403).json({ message: "Unauthorized access to this integration" });
            }

            // Verify conversation belongs to this authenticated user
            const expectedVisitorId = `user_${decoded.userId}`;
            if (conversation.visitorId !== expectedVisitorId) {
              return res.status(403).json({ message: "Unauthorized access to this conversation" });
            }
          } catch (jwtError) {
            return res.status(401).json({ message: "Invalid authentication token" });
          }
        }

        // Eliminar la conversación
        await storage.deleteConversation(conversationIdNum);

        res.json({ success: true, message: "Conversation deleted successfully" });

      } catch (error) {
        console.error("Delete conversation error:", error);
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

    // Serve the form embed script with cache busting
    app.get("/static/form-embed.js", (req, res) => {
      const currentDir = path.dirname(new URL(import.meta.url).pathname);
      const formEmbedPath = path.resolve(currentDir, '../public/static/form-embed.js');

      if (fs.existsSync(formEmbedPath)) {
        // Add cache control headers to force fresh downloads
        res.setHeader("Content-Type", "application/javascript");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.sendFile(formEmbedPath);
      } else {
        res.status(404).json({ message: "Form embed script not found" });
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
            u.id, u.username, u.email, u.full_name, u.created_at, 
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
            stripe_customer_id, stripe_subscription_id 
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
            visitor_count, created_at, bot_behavior, widget_type 
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
           RETURNING id, username, email, full_name, created_at`,
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
    } catch (error: any) {
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
    } catch (error: any) {
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

  // ================ Cost Management Admin Routes ================
  
  // GET all action costs (admin)
  app.get("/api/admin/action-costs", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const { getActionCosts } = await import('./lib/cost-engine');
      const actionCosts = await getActionCosts();
      res.json(actionCosts);
    } catch (error) {
      console.error("Error fetching action costs:", error);
      res.status(500).json({ error: "Failed to fetch action costs" });
    }
  });

  // PUT update action cost (admin)  
  app.put("/api/admin/action-costs/:id", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const costId = parseInt(req.params.id);
      if (isNaN(costId)) {
        return res.status(400).json({ error: "Invalid cost ID" });
      }

      const { baseCost, description, isActive } = req.body;
      
      if (typeof baseCost !== 'string' || !baseCost) {
        return res.status(400).json({ error: "Base cost is required and must be a string" });
      }

      const { updateActionCost } = await import('./lib/cost-engine');
      const updatedCost = await updateActionCost(costId, {
        baseCost,
        description,
        isActive: isActive ?? true
      });

      if (!updatedCost) {
        return res.status(404).json({ error: "Action cost not found" });
      }

      res.json(updatedCost);
    } catch (error) {
      console.error("Error updating action cost:", error);
      res.status(500).json({ error: "Failed to update action cost" });
    }
  });

  // GET user budgets summary (admin)
  app.get("/api/admin/user-budgets", authenticateJWT, isAdmin, async (req, res) => {
    try {
      const { getUserBudgetsSummary } = await import('./lib/cost-engine');
      const budgetsSummary = await getUserBudgetsSummary();
      res.json(budgetsSummary);
    } catch (error) {
      console.error("Error fetching user budgets:", error);
      res.status(500).json({ error: "Failed to fetch user budgets" });
    }
  });

  // Forms API endpoints
  app.get("/api/forms", authenticateJWT, async (req, res) => {
    try {
      const userId = req.userId;
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

      // Consultar directamente PostgreSQL para obtener todos los campos incluyendo 'language'
      const result = await db.select().from(forms).where(eq(forms.id, formId));

      if (result.length === 0) {
        return res.status(404).json({ error: "Form not found" });
      }

      const form = result[0];

      // Verificar que el usuario es propietario del formulario
      if (form.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized access to this form" });
      }

      res.json(form);
    } catch (error) {
      console.error("Error getting form:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Función auxiliar para traducir campos de plantillas
  const translateTemplateFields = (structure: any, language: string) => {
    // Diccionario completo de traducciones
    const fieldTranslations: Record<string, Record<string, string>> = {
      // CAMPOS BÁSICOS
      'Nombre': { en: 'Name', fr: 'Nom', es: 'Nombre' },
      'Nombre completo': { en: 'Full name', fr: 'Nom complet', es: 'Nombre completo' },
      'Correo electrónico': { en: 'Email', fr: 'Email', es: 'Correo electrónico' },
      'Tu correo electrónico': { en: 'Your email', fr: 'Votre email', es: 'Tu correo electrónico' },
      'Teléfono': { en: 'Phone', fr: 'Téléphone', es: 'Teléfono' },
      'Empresa': { en: 'Company', fr: 'Entreprise', es: 'Empresa' },
      'Mensaje': { en: 'Message', fr: 'Message', es: 'Mensaje' },
      'Asunto': { en: 'Subject', fr: 'Sujet', es: 'Asunto' },

      // CAMPOS DE ENCUESTA DE SATISFACCIÓN
      '¿Cómo calificarías tu experiencia con nosotros?': { en: 'How would you rate your experience with us?', fr: 'Comment évalueriez-vous votre expérience avec nous?', es: '¿Cómo calificarías tu experiencia con nosotros?' },
      '¿Qué servicio has utilizado?': { en: 'Which service have you used?', fr: 'Quel service avez-vous utilisé?', es: '¿Qué servicio has utilizado?' },
      '¿Qué podríamos mejorar?': { en: 'What could we improve?', fr: 'Que pourrions-nous améliorer?', es: '¿Qué podríamos mejorar?' },
      '¿Podemos contactarte para seguimiento?': { en: 'Can we contact you for follow-up?', fr: 'Pouvons-nous vous contacter pour un suivi?', es: '¿Podemos contactarte para seguimiento?' },

      // CAMPOS DE SOLICITUD DE PRESUPUESTO
      'Nombre de la empresa': { en: 'Company name', fr: 'Nom de l\'entreprise', es: 'Nombre de la empresa' },
      'Nombre de contacto': { en: 'Contact name', fr: 'Nom de contact', es: 'Nombre de contacto' },
      'Tipo de servicio': { en: 'Service type', fr: 'Type de service', es: 'Tipo de servicio' },
      'Detalles del proyecto': { en: 'Project details', fr: 'Détails du projet', es: 'Detalles del proyecto' },
      'Presupuesto estimado (€)': { en: 'Estimated budget (€)', fr: 'Budget estimé (€)', es: 'Presupuesto estimado (€)' },
      'Fecha límite': { en: 'Deadline', fr: 'Date limite', es: 'Fecha límite' },

      // CAMPOS DE REGISTRO WEBINAR
      'Cargo': { en: 'Job title', fr: 'Poste', es: 'Cargo' },
      '¿Cómo nos encontraste?': { en: 'How did you find us?', fr: 'Comment nous avez-vous trouvés?', es: '¿Cómo nos encontraste?' },
      '¿Cómo te enteraste de nosotros?': { en: 'How did you hear about us?', fr: 'Comment avez-vous entendu parler de nous?', es: '¿Cómo te enteraste de nosotros?' },
      'Comment avez-vous entendu parler de nous?': { en: 'How did you hear about us?', fr: 'Comment avez-vous entendu parler de nous?', es: '¿Cómo te enteraste de nosotros?' },
      'Quiero recibir un recordatorio por email 24h antes del evento': { en: 'I want to receive an email reminder 24h before the event', fr: 'Je veux recevoir un rappel par email 24h avant l\'événement', es: 'Quiero recibir un recordatorio por email 24h antes del evento' },
      'Acepto recibir emails sobre futuros webinars y contenido relacionado': { en: 'I accept to receive emails about future webinars and related content', fr: 'J\'accepte de recevoir des emails sur les futurs webinaires et contenus connexes', es: 'Acepto recibir emails sobre futuros webinars y contenido relacionado' },

      // CAMPOS DE FORMULARIO DE PEDIDO
      'Nombre del cliente': { en: 'Customer name', fr: 'Nom du client', es: 'Nombre del cliente' },
      'Dirección de envío': { en: 'Shipping address', fr: 'Adresse de livraison', es: 'Dirección de envío' },
      'Producto': { en: 'Product', fr: 'Produit', es: 'Producto' },
      'Cantidad': { en: 'Quantity', fr: 'Quantité', es: 'Cantidad' },
      'Método de pago': { en: 'Payment method', fr: 'Méthode de paiement', es: 'Método de pago' },
      'Notas adicionales': { en: 'Additional notes', fr: 'Notes supplémentaires', es: 'Notas adicionales' },

      // CAMPOS DE EVALUACIÓN DE EVENTO
      'Nombre (opcional)': { en: 'Name (optional)', fr: 'Nom (optionnel)', es: 'Nombre (opcional)' },
      'Selecciona el evento': { en: 'Select the event', fr: 'Sélectionnez l\'événement', es: 'Selecciona el evento' },
      'Valoración general del evento': { en: 'Overall event rating', fr: 'Évaluation générale de l\'événement', es: 'Valoración general del evento' },
      'Calidad del contenido': { en: 'Content quality', fr: 'Qualité du contenu', es: 'Calidad del contenido' },
      'Ponentes': { en: 'Speakers', fr: 'Intervenants', es: 'Ponentes' },
      'Organización': { en: 'Organization', fr: 'Organisation', es: 'Organización' },
      '¿Qué fue lo mejor del evento?': { en: 'What was the best part of the event?', fr: 'Qu\'est-ce qui était le mieux dans l\'événement?', es: '¿Qué fue lo mejor del evento?' },
      'Me gustaría recibir información sobre futuros eventos': { en: 'I would like to receive information about future events', fr: 'J\'aimerais recevoir des informations sur les futurs événements', es: 'Me gustaría recibir información sobre futuros eventos' },

      // CAMPOS ADICIONALES EVALUACIÓN EVENTO
      'Tu evaluación': { en: 'Your evaluation', fr: 'Votre évaluation', es: 'Tu evaluación' },
      'Valoración del contenido': { en: 'Content rating', fr: 'Évaluation du contenu', es: 'Valoración del contenido' },
      'Valoración de ponentes': { en: 'Speakers rating', fr: 'Évaluation des intervenants', es: 'Valoración de ponentes' },
      'Valoración de la organización': { en: 'Organization rating', fr: 'Évaluation de l\'organisation', es: 'Valoración de la organización' },
      'Comentarios adicionales': { en: 'Additional comments', fr: 'Commentaires supplémentaires', es: 'Comentarios adicionales' },
      'Aspectos destacados': { en: 'Highlights', fr: 'Points forts', es: 'Aspectos destacados' },
      'Área de mejora': { en: 'Improvement areas', fr: 'Domaines d\'amélioration', es: 'Área de mejora' },

      // CAMPOS DE SOLICITUD DE EMPLEO
      'Puesto al que aplicas': { en: 'Position you are applying for', fr: 'Poste auquel vous postulez', es: 'Puesto al que aplicas' },
      'Experiencia relevante': { en: 'Relevant experience', fr: 'Expérience pertinente', es: 'Experiencia relevante' },
      'Adjunta tu CV': { en: 'Attach your CV', fr: 'Joignez votre CV', es: 'Adjunta tu CV' },
      'Portfolio (opcional)': { en: 'Portfolio (optional)', fr: 'Portfolio (optionnel)', es: 'Portfolio (opcional)' },
      'Perfil de LinkedIn': { en: 'LinkedIn profile', fr: 'Profil LinkedIn', es: 'Perfil de LinkedIn' },
      'Disponibilidad': { en: 'Availability', fr: 'Disponibilité', es: 'Disponibilidad' },
      'Doy mi consentimiento para el tratamiento de mis datos personales según la política de privacidad': { en: 'I give my consent for the processing of my personal data according to the privacy policy', fr: 'Je donne mon consentement pour le traitement de mes données personnelles selon la politique de confidentialité', es: 'Doy mi consentimiento para el tratamiento de mis datos personales según la política de privacidad' },

      // CAMPOS DE NEWSLETTER
      'Temas de interés': { en: 'Topics of interest', fr: 'Sujets d\'intérêt', es: 'Temas de interés' },
      'Frecuencia de envío preferida': { en: 'Preferred sending frequency', fr: 'Fréquence d\'envoi préférée', es: 'Frecuencia de envío preferida' },
      'Acepto recibir comunicaciones comerciales': { en: 'I accept to receive commercial communications', fr: 'J\'accepte de recevoir des communications commerciales', es: 'Acepto recibir comunicaciones comerciales' },
      'Acepto los términos y condiciones': { en: 'I accept the terms and conditions', fr: 'J\'accepte les termes et conditions', es: 'Acepto los términos y condiciones' },

      // CAMPOS DE ENCUESTA DE OPINIÓN
      'Producto/Servicio evaluado': { en: 'Product/Service evaluated', fr: 'Produit/Service évalué', es: 'Producto/Servicio evaluado' },
      'Valoración general': { en: 'Overall rating', fr: 'Évaluation générale', es: 'Valoración general' },
      'Aspectos positivos': { en: 'Positive aspects', fr: 'Aspects positifs', es: 'Aspectos positivos' },
      'Aspectos a mejorar': { en: 'Aspects to improve', fr: 'Aspects à améliorer', es: 'Aspectos a mejorar' },
      'Probabilidad de recomendación': { en: 'Likelihood of recommendation', fr: 'Probabilité de recommandation', es: 'Probabilidad de recomendación' },

      // PLACEHOLDERS Y TEXTOS ESPECÍFICOS
      'Tu nombre placeholder': { en: 'Your name', fr: 'Votre nom', es: 'Tu nombre' },
      'Tu nombre completo placeholder': { en: 'Your full name', fr: 'Votre nom complet', es: 'Tu nombre completo' },
      'email placeholder': { en: 'you@email.com', fr: 'vous@email.com', es: 'tu@email.com' },
      'Nombre de tu empresa placeholder': { en: 'Your company name', fr: 'Nom de votre entreprise', es: 'Nombre de tu empresa' },
      'Describe tu proyecto...': { en: 'Describe your project...', fr: 'Décrivez votre projet...', es: 'Describe tu proyecto...' },
      'Cuéntanos tu experiencia': { en: 'Tell us about your experience', fr: 'Parlez-nous de votre expérience', es: 'Cuéntanos tu experiencia' },
      'Comparte lo que más te gustó': { en: 'Share what you liked most', fr: 'Partagez ce que vous avez le plus aimé', es: 'Comparte lo que más te gustó' },
      'Tus sugerencias son importantes': { en: 'Your suggestions are important', fr: 'Vos suggestions sont importantes', es: 'Tus sugerencias son importantes' },

      // BOTONES DE ENVÍO
      'Enviar btn': { en: 'Submit', fr: 'Envoyer', es: 'Enviar' },
      'Enviar solicitud btn': { en: 'Submit request', fr: 'Envoyer la demande', es: 'Enviar solicitud' },
      'Registrarse btn': { en: 'Register', fr: 'S\'inscrire', es: 'Registrarse' },
      'Realizar pedido btn': { en: 'Place order', fr: 'Passer commande', es: 'Realizar pedido' },
      'Enviar evaluación btn': { en: 'Submit evaluation', fr: 'Envoyer l\'évaluation', es: 'Enviar evaluación' },
      'Postular btn': { en: 'Apply', fr: 'Postuler', es: 'Postular' },
      'Suscribirse btn': { en: 'Subscribe', fr: 'S\'abonner', es: 'Suscribirse' },
      'Enviar opinión btn': { en: 'Submit opinion', fr: 'Envoyer l\'avis', es: 'Enviar opinión' },

      // OPCIONES MÚLTIPLES COMUNES
      'Redes sociales': { en: 'Social media', fr: 'Réseaux sociaux', es: 'Redes sociales' },
      'Búsqueda en Google': { en: 'Google search', fr: 'Recherche Google', es: 'Búsqueda en Google' },
      'Recomendación': { en: 'Recommendation', fr: 'Recommandation', es: 'Recomendación' },
      'Email': { en: 'Email', fr: 'Email', es: 'Email' },
      'Otro': { en: 'Other', fr: 'Autre', es: 'Otro' },

      // OPCIONES DE SERVICIOS
      'Atención al cliente': { en: 'Customer service', fr: 'Service client', es: 'Atención al cliente' },
      'Ventas': { en: 'Sales', fr: 'Ventes', es: 'Ventas' },
      'Soporte técnico': { en: 'Technical support', fr: 'Support technique', es: 'Soporte técnico' },
      'Otros': { en: 'Others', fr: 'Autres', es: 'Otros' },

      // OPCIONES DE TIPO DE SERVICIO
      'Desarrollo web': { en: 'Web development', fr: 'Développement web', es: 'Desarrollo web' },
      'Diseño gráfico': { en: 'Graphic design', fr: 'Design graphique', es: 'Diseño gráfico' },
      'Marketing digital': { en: 'Digital marketing', fr: 'Marketing numérique', es: 'Marketing digital' },
      'Consultoría': { en: 'Consulting', fr: 'Conseil', es: 'Consultoría' },

      // OPCIONES DE CARGO
      'Director/a': { en: 'Director', fr: 'Directeur/trice', es: 'Director/a' },
      'Gerente': { en: 'Manager', fr: 'Responsable', es: 'Gerente' },
      'Técnico/a': { en: 'Technical', fr: 'Technicien/ne', es: 'Técnico/a' },
      'Estudiante': { en: 'Student', fr: 'Étudiant/e', es: 'Estudiante' },

      // OPCIONES DE PRODUCTOS
      'Producto A - 29.99€': { en: 'Product A - €29.99', fr: 'Produit A - 29,99€', es: 'Producto A - 29.99€' },
      'Producto B - 49.99€': { en: 'Product B - €49.99', fr: 'Produit B - 49,99€', es: 'Producto B - 49.99€' },
      'Producto C - 99.99€': { en: 'Product C - €99.99', fr: 'Produit C - 99,99€', es: 'Producto C - 99.99€' },
      'Pack Completo - 149.99€': { en: 'Complete Pack - €149.99', fr: 'Pack Complet - 149,99€', es: 'Pack Completo - 149.99€' },

      // OPCIONES DE PAGO
      'Tarjeta de crédito': { en: 'Credit card', fr: 'Carte de crédit', es: 'Tarjeta de crédito' },
      'PayPal': { en: 'PayPal', fr: 'PayPal', es: 'PayPal' },
      'Transferencia bancaria': { en: 'Bank transfer', fr: 'Virement bancaire', es: 'Transferencia bancaria' },

      // OPCIONES DE PUESTOS DE TRABAJO
      'Desarrollador/a Frontend': { en: 'Frontend Developer', fr: 'Développeur/se Frontend', es: 'Desarrollador/a Frontend' },
      'Desarrollador/a Backend': { en: 'Backend Developer', fr: 'Développeur/se Backend', es: 'Desarrollador/a Backend' },
      'Diseñador/a UX/UI': { en: 'UX/UI Designer', fr: 'Designer UX/UI', es: 'Diseñador/a UX/UI' },
      'Project Manager': { en: 'Project Manager', fr: 'Chef de projet', es: 'Project Manager' },

      // OPCIONES DE DISPONIBILIDAD
      'Inmediata': { en: 'Immediate', fr: 'Immédiate', es: 'Inmediata' },
      'En 2 semanas': { en: 'In 2 weeks', fr: 'Dans 2 semaines', es: 'En 2 semanas' },
      'En 1 mes': { en: 'In 1 month', fr: 'Dans 1 mois', es: 'En 1 mes' },
      'Más de 1 mes': { en: 'More than 1 month', fr: 'Plus d\'1 mois', es: 'Más de 1 mes' },

      // OPCIONES DE TEMAS DE INTERÉS
      'Tecnología': { en: 'Technology', fr: 'Technologie', es: 'Tecnología' },
      'Marketing': { en: 'Marketing', fr: 'Marketing', es: 'Marketing' },
      'Negocios': { en: 'Business', fr: 'Affaires', es: 'Negocios' },
      'Diseño': { en: 'Design', fr: 'Design', es: 'Diseño' },

      // OPCIONES DE FRECUENCIA
      'Semanal': { en: 'Weekly', fr: 'Hebdomadaire', es: 'Semanal' },
      'Quincenal': { en: 'Bi-weekly', fr: 'Bimensuel', es: 'Quincenal' },
      'Mensual': { en: 'Monthly', fr: 'Mensuel', es: 'Mensual' },

      // PLACEHOLDERS
      'Tu nombre': { en: 'Your name', fr: 'Votre nom', es: 'Tu nombre' },
      'Tu nombre completo': { en: 'Your full name', fr: 'Votre nom complet', es: 'Tu nombre completo' },
      'tu@email.com': { en: 'you@email.com', fr: 'vous@email.com', es: 'tu@email.com' },
      'correo@ejemplo.com': { en: 'email@example.com', fr: 'email@exemple.com', es: 'correo@ejemplo.com' },
      'Tu empresa': { en: 'Your company', fr: 'Votre entreprise', es: 'Tu empresa' },
      'Nombre de tu empresa': { en: 'Your company name', fr: 'Nom de votre entreprise', es: 'Nombre de tu empresa' },
      '+34 600000000': { en: '+1 555000000', fr: '+33 600000000', es: '+34 600000000' },
      'Tu opinión es muy importante para nosotros': { en: 'Your opinion is very important to us', fr: 'Votre opinion est très importante pour nous', es: 'Tu opinión es muy importante para nosotros' },
      'Describe tu proyecto y necesidades específicas': { en: 'Describe your project and specific needs', fr: 'Décrivez votre projet et besoins spécifiques', es: 'Describe tu proyecto y necesidades específicas' },
      'Describe brevemente tu experiencia relacionada con el puesto': { en: 'Briefly describe your experience related to the position', fr: 'Décrivez brièvement votre expérience liée au poste', es: 'Describe brevemente tu experiencia relacionada con el puesto' },
      'https://linkedin.com/in/tu-perfil': { en: 'https://linkedin.com/in/your-profile', fr: 'https://linkedin.com/in/votre-profil', es: 'https://linkedin.com/in/tu-perfil' },
      'Dirección completa incluyendo código postal': { en: 'Complete address including postal code', fr: 'Adresse complète y compris le code postal', es: 'Dirección completa incluyendo código postal' },
      'Instrucciones especiales para el pedido': { en: 'Special instructions for the order', fr: 'Instructions spéciales pour la commande', es: 'Instrucciones especiales para el pedido' },
      'Comparte lo que más te gustó': { en: 'Share what you liked most', fr: 'Partagez ce que vous avez le plus aimé', es: 'Comparte lo que más te gustó' },
      'Tus sugerencias son importantes': { en: 'Your suggestions are important', fr: 'Vos suggestions sont importantes', es: 'Tus sugerencias son importantes' },
      '1000': { en: '1000', fr: '1000', es: '1000' },

      // BOTONES DE ENVÍO
      'Enviar': { en: 'Submit', fr: 'Soumettre', es: 'Enviar' },
      'Enviar encuesta': { en: 'Submit survey', fr: 'Envoyer l\'enquête', es: 'Enviar encuesta' },
      'Solicitar presupuesto': { en: 'Request quote', fr: 'Demander un devis', es: 'Solicitar presupuesto' },
      'Confirmar registro': { en: 'Confirm registration', fr: 'Confirmer l\'inscription', es: 'Confirmar registro' },
      'Confirmar Pedido': { en: 'Confirm Order', fr: 'Confirmer la Commande', es: 'Confirmar Pedido' },
      'Enviar evaluación': { en: 'Submit evaluation', fr: 'Envoyer l\'évaluation', es: 'Enviar evaluación' },
      'Enviar solicitud': { en: 'Submit application', fr: 'Envoyer la candidature', es: 'Enviar solicitud' },
      'Suscribirse': { en: 'Subscribe', fr: 'S\'abonner', es: 'Suscribirse' },
      'Enviar opinión': { en: 'Submit opinion', fr: 'Envoyer l\'avis', es: 'Enviar opinión' },

      // OPCIONES DE EVENTOS ESPECÍFICOS
      'Conferencia anual 2025': { en: 'Annual Conference 2025', fr: 'Conférence annuelle 2025', es: 'Conferencia anual 2025' },
      'Taller práctico - Mayo': { en: 'Practical Workshop - May', fr: 'Atelier pratique - Mai', es: 'Taller práctico - Mayo' },
      'Webinar técnico - Junio': { en: 'Technical Webinar - June', fr: 'Webinaire technique - Juin', es: 'Webinar técnico - Junio' },

      // CAMPOS ADICIONALES CRÍTICOS
      'Unirme a la lista de espera': { en: 'Join waitlist', fr: 'Rejoindre la liste d\'attente', es: 'Unirme a la lista de espera' },
      'Gracias por tu envío': { en: 'Thank you for your submission', fr: 'Merci pour votre soumission', es: 'Gracias por tu envío' },
      'Votre nom': { en: 'Your name', fr: 'Votre nom', es: 'Tu nombre' },
      'vous@email.com': { en: 'you@email.com', fr: 'vous@email.com', es: 'tu@email.com' },
      'Prénom': { en: 'First name', fr: 'Prénom', es: 'Nombre' },

      // CAMPOS ESPECÍFICOS DE LISTA DE ESPERA
      'Liste d\'Attente Webinar Premium': { en: 'Premium Webinar Waitlist', fr: 'Liste d\'Attente Webinar Premium', es: 'Lista de Espera Webinar Premium' },
      'Votre email': { en: 'Your email', fr: 'Votre email', es: 'Tu email' },
      'Name': { en: 'Name', fr: 'Nom', es: 'Nombre' },

      // MENSAJES DE ÉXITO
      '¡Gracias por tu feedback!': { en: 'Thank you for your feedback!', fr: 'Merci pour vos commentaires!', es: '¡Gracias por tu feedback!' },
      '¡Hemos recibido tu solicitud! Te contactaremos en breve.': { en: 'We have received your request! We will contact you shortly.', fr: 'Nous avons reçu votre demande! Nous vous contacterons bientôt.', es: '¡Hemos recibido tu solicitud! Te contactaremos en breve.' },
      '¡Registro completado! Recibirás un email de confirmación.': { en: 'Registration completed! You will receive a confirmation email.', fr: 'Inscription terminée! Vous recevrez un email de confirmation.', es: '¡Registro completado! Recibirás un email de confirmación.' },
      '¡Pedido recibido! Recibirás un email de confirmación con los detalles.': { en: 'Order received! You will receive a confirmation email with the details.', fr: 'Commande reçue! Vous recevrez un email de confirmation avec les détails.', es: '¡Pedido recibido! Recibirás un email de confirmación con los detalles.' },
      '¡Gracias por tu evaluación! Tu feedback nos ayuda a mejorar.': { en: 'Thank you for your evaluation! Your feedback helps us improve.', fr: 'Merci pour votre évaluation! Vos commentaires nous aident à nous améliorer.', es: '¡Gracias por tu evaluación! Tu feedback nos ayuda a mejorar.' },
      '¡Hemos recibido tu solicitud! Revisaremos tu perfil y te contactaremos en caso de avanzar en el proceso.': { en: 'We have received your application! We will review your profile and contact you if we move forward in the process.', fr: 'Nous avons reçu votre candidature! Nous examinerons votre profil et vous contacterons si nous avançons dans le processus.', es: '¡Hemos recibido tu solicitud! Revisaremos tu perfil y te contactaremos en caso de avanzar en el proceso.' },
      '¡Bienvenido/a a nuestro newsletter!': { en: 'Welcome to our newsletter!', fr: 'Bienvenue dans notre newsletter!', es: '¡Bienvenido/a a nuestro newsletter!' },
      '¡Gracias por compartir tu opinión!': { en: 'Thank you for sharing your opinion!', fr: 'Merci de partager votre avis!', es: '¡Gracias por compartir tu opinión!' }
    };

    const translateText = (text: string, targetLanguage: string): string => {
      if (!text) return text;
      const translation = fieldTranslations[text];
      if (translation && translation[targetLanguage]) {
        console.log(`Traduciendo campo "${text}" a ${targetLanguage}: "${translation[targetLanguage]}"`);
        return translation[targetLanguage];
      }
      return text;
    };

    if (structure && structure.fields) {
      structure.fields = structure.fields.map((field: any) => {
        // Traducir la etiqueta del campo
        const translatedLabel = translateText(field.label, language);

        // Traducir el placeholder si existe
        const translatedPlaceholder = field.placeholder ? translateText(field.placeholder, language) : field.placeholder;

        // Traducir las opciones si es un campo select, radio, etc.
        let translatedOptions = field.options;
        if (field.options && Array.isArray(field.options)) {
          translatedOptions = field.options.map((option: string) => translateText(option, language));
        }

        return {
          ...field,
          label: translatedLabel,
          placeholder: translatedPlaceholder,
          options: translatedOptions
        };
      });

      // Traducir el texto del botón de envío
      if (structure.submitButtonText) {
        structure.submitButtonText = translateText(structure.submitButtonText, language);
      }
    }

    return structure;
  };

  app.post("/api/forms", verifyToken, requireBudgetCheck('forms'), async (req, res) => {
    try {
      const userId = req.userId;
      const { templateId, language = 'es', ...formData } = req.body;

      // Si se proporciona templateId, crear formulario basado en plantilla
      if (templateId) {
        // Obtener la plantilla
        const template = await storage.getFormTemplate(templateId);

        if (!template) {
          return res.status(404).json({ error: "Template not found" });
        }

        // Traducir el título y descripción de la plantilla
        const templateTranslations: Record<string, Record<string, string>> = {
          'Formulario de Contacto': { en: 'Contact Form', fr: 'Formulaire de Contact', es: 'Formulario de Contacto' },
          'Lista de Espera': { en: 'Waitlist', fr: 'Liste d\'Attente', es: 'Lista de Espera' },
          'Encuesta de Satisfacción': { en: 'Satisfaction Survey', fr: 'Enquête de Satisfaction', es: 'Encuesta de Satisfacción' },
          'Solicitud de Presupuesto': { en: 'Quote Request', fr: 'Demande de Devis', es: 'Solicitud de Presupuesto' },
          'Registro para Webinar': { en: 'Webinar Registration', fr: 'Inscription au Webinaire', es: 'Registro para Webinar' },
          'Formulario de Pedido': { en: 'Order Form', fr: 'Formulaire de Commande', es: 'Formulario de Pedido' },

          'Plantilla estándar para formularios de contacto': { en: 'Standard template for contact forms', fr: 'Modèle standard pour formulaires de contact', es: 'Plantilla estándar para formularios de contacto' },
          'Plantilla para capturar usuarios en lista de espera': { en: 'Template to capture users for waitlist', fr: 'Modèle pour capturer des utilisateurs en liste d\'attente', es: 'Plantilla para capturar usuarios en lista de espera' },
          'Encuesta para medir la satisfacción del cliente': { en: 'Survey to measure customer satisfaction', fr: 'Enquête pour mesurer la satisfaction client', es: 'Encuesta para medir la satisfacción del cliente' },
          'Formulario para solicitar presupuestos personalizados para tus clientes': { en: 'Form to request personalized quotes for your clients', fr: 'Formulaire pour demander des devis personnalisés pour vos clients', es: 'Formulario para solicitar presupuestos personalizados para tus clientes' },
          'Formulario optimizado para registrar asistentes a eventos virtuales': { en: 'Optimized form to register attendees for virtual events', fr: 'Formulaire optimisé pour inscrire des participants à des événements virtuels', es: 'Formulario optimizado para registrar asistentes a eventos virtuales' },
          'Perfecto para tomar pedidos online de manera organizada.': { en: 'Perfect for taking online orders in an organized way.', fr: 'Parfait pour prendre des commandes en ligne de manière organisée.', es: 'Perfecto para tomar pedidos online de manera organizada.' },

          // Plantillas adicionales
          'Evaluación de Evento': { en: 'Event Evaluation', fr: 'Évaluation d\'Événement', es: 'Evaluación de Evento' },
          'Solicitud de Empleo': { en: 'Job Application', fr: 'Demande d\'Emploi', es: 'Solicitud de Empleo' },
          'Registro a Newsletter': { en: 'Newsletter Registration', fr: 'Inscription à la Newsletter', es: 'Registro a Newsletter' },
          'Encuesta de Opinión': { en: 'Opinion Survey', fr: 'Enquête d\'Opinion', es: 'Encuesta de Opinión' },

          // Descripciones adicionales
          'Recopila feedback detallado sobre tus eventos y conferencias.': { en: 'Collect detailed feedback about your events and conferences.', fr: 'Recueillez des commentaires détaillés sur vos événements et conférences.', es: 'Recopila feedback detallado sobre tus eventos y conferencias.' },
          'Optimizado para reclutar candidatos y revisar solicitudes de empleo.': { en: 'Optimized to recruit candidates and review job applications.', fr: 'Optimisé pour recruter des candidats et examiner les demandes d\'emploi.', es: 'Optimizado para reclutar candidatos y revisar solicitudes de empleo.' },
          'Forma sencilla para capturar suscriptores a tu boletín informativo.': { en: 'Simple form to capture subscribers to your newsletter.', fr: 'Formulaire simple pour capturer les abonnés à votre newsletter.', es: 'Forma sencilla para capturar suscriptores a tu boletín informativo.' },
          'Recopila opiniones y valoraciones sobre productos o servicios.': { en: 'Collect opinions and ratings about products or services.', fr: 'Recueillez des opinions et des évaluations sur les produits ou services.', es: 'Recopila opiniones y valoraciones sobre productos o servicios.' }
        };

        const translateTemplateText = (text: string, targetLanguage: string): string => {
          const translation = templateTranslations[text];
          if (translation && translation[targetLanguage]) {
            console.log(`Traduciendo título/descripción "${text}" a ${targetLanguage}: "${translation[targetLanguage]}"`);
            return translation[targetLanguage];
          }
          return text;
        };

        // Traducir título y descripción
        const translatedName = translateTemplateText(template.name, language);
        const translatedDescription = translateTemplateText(template.description, language);

        // Crear un título para el formulario basado en la plantilla traducida
        const title = `${translatedName} ${new Date().toLocaleDateString('es-ES')}`;

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

        // Traducir la estructura de campos según el idioma seleccionado
        const translatedStructure = translateTemplateFields(JSON.parse(JSON.stringify(template.structure)), language);

        console.log(`Creando formulario con idioma ${language}:`, {
          title,
          description: translatedDescription,
          structure: translatedStructure
        });

        // Crear el nuevo formulario con datos de la plantilla traducidos
        const newForm = await storage.createForm({
          title,
          slug: finalSlug,
          description: translatedDescription,
          type: template.type,
          published: false,
          language: language, // Guardar el idioma del formulario
          structure: translatedStructure,
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

      console.log("Usuario autenticado");

      // Verificar que el formulario existe
      const existingForm = await storage.getForm(formId);

      if (!existingForm) {
        return res.status(404).json({ error: "Form not found" });
      }

      // Verificar que el usuario es propietario del formulario
      if (existingForm.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized access to this form" });
      }

      const updatedForm = await storage.updateForm(formId, formData);
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
      if (existingForm.userId !== req.userId) {
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

      // Detectar idioma del formulario basado en los campos
      let detectedLanguage = 'fr'; // Por defecto francés
      if (form.structure?.fields) {
        const sampleText = form.structure.fields[0]?.label || form.title || '';
        if (sampleText.match(/\b(nombre|email|selecciona|enviar|gracias)\b/i)) {
          detectedLanguage = 'es';
        } else if (sampleText.match(/\b(name|email|select|submit|thank)\b/i)) {
          detectedLanguage = 'en';
        } else if (sampleText.match(/\b(nom|email|sélectionnez|envoyer|merci)\b/i)) {
          detectedLanguage = 'fr';
        }
      }

      // Textos por defecto según el idioma detectado
      const defaultTexts = {
        'fr': {
          submitButtonText: 'Envoyer',
          successMessage: 'Merci ! Votre information a été envoyée avec succès.'
        },
        'es': {
          submitButtonText: 'Enviar',
          successMessage: '¡Gracias! Tu información ha sido enviada correctamente.'
        },
        'en': {
          submitButtonText: 'Submit',
          successMessage: 'Thank you! Your information has been sent successfully.'
        }
      };

      const defaults = defaultTexts[detectedLanguage] || defaultTexts['fr'];

      // Devolver solo la información pública necesaria para renderizar el formulario
      // Excluimos información sensible
      const publicFormData = {
        id: form.id,
        slug: form.slug,
        title: form.title,
        description: form.description,
        language: detectedLanguage,
        buttonColor: form.structure?.buttonColor || form.settings?.buttonColor || '#2563EB',
        submitButtonText: form.structure?.submitButtonText || form.settings?.submitButtonText || defaults.submitButtonText,
        successMessage: form.structure?.successMessage || form.settings?.successMessage || defaults.successMessage,
        successUrl: form.settings?.successRedirectUrl,
        structure: form.structure,
        settings: form.settings
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

      // Verificar que el formulario está activo (publicado es suficiente)
      if (!form.published) {
        return res.status(403).json({ error: "This form is not published" });
      }

      // Los datos pueden venir directamente en responseData o en responseData.data
      const formData = responseData.data || responseData;

      // Validar los datos de la respuesta según la estructura del formulario
      const requiredFields = form.structure.fields
        .filter(field => field.required)
        .map(field => field.id);

      for (const field of requiredFields) {
        if (!formData[field]) {
          return res.status(400).json({ 
            error: "Missing required fields", 
            missingFields: requiredFields.filter(f => !formData[f])
          });
        }
      }

      // Crear la respuesta
      const newResponse = await storage.createFormResponse({
        formId: form.id,
        data: formData,
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

                // Función auxiliar para escapar HTML
                function escapeHtml(text: string): string {
                if (!text) return '';
                const map: Record<string, string> = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
                };
                return text.replace(/[&<>"']/g, function(m) { return map[m]; });
                }

                // Función para obtener traducciones del formulario
                function getFormTranslations(language: string) {
                const translations = {
                es: {
                completeInfo: 'Por favor complete la información solicitada para comenzar.',
                selectOption: 'Selecciona una opción',
                submit: 'Enviar',
                sending: 'Enviando...',
                successTitle: '¡Formulario enviado correctamente!',
                successMessage: 'Gracias por tu información. Te contactaremos pronto.',
                errorMessage: 'Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo.',
                // Traducciones específicas de campos comunes
                name: 'Nombre',
                fullName: 'Nombre completo',
                email: 'Email',
                phone: 'Teléfono',
                message: 'Mensaje',
                company: 'Empresa',
                acceptTerms: 'Acepto los términos y condiciones',
                // Frases problemáticas específicas
                pleaseComplete: 'Por favor complete la información solicitada para comenzar.',
                iAcceptTerms: 'Acepto los términos y condiciones'
                },
                en: {
                completeInfo: 'Please complete the requested information to get started.',
                selectOption: 'Select an option',
                submit: 'Submit',
                sending: 'Sending...',
                successTitle: 'Form submitted successfully!',
                successMessage: 'Thank you for your information. We will contact you soon.',
                errorMessage: 'An error occurred while submitting the form. Please try again.',
                // Traducciones específicas de campos comunes
                name: 'Name',
                fullName: 'Full name',
                email: 'Email', 
                phone: 'Phone',
                message: 'Message',
                company: 'Company',
                acceptTerms: 'I accept the terms and conditions',
                // Frases problemáticas específicas
                pleaseComplete: 'Please complete the requested information to get started.',
                iAcceptTerms: 'I accept the terms and conditions'
                },
                fr: {
                completeInfo: 'Veuillez compléter les informations demandées pour commencer.',
                selectOption: 'Sélectionnez une option',
                submit: 'Envoyer',
                sending: 'Envoi en cours...',
                successTitle: 'Formulaire envoyé avec succès!',
                successMessage: 'Merci pour vos informations. Nous vous contacterons bientôt.',
                errorMessage: 'Une erreur s\'est produite lors de l\'envoi du formulaire. Veuillez réessayer.',
                // Traducciones específicas de campos comunes
                name: 'Nom',
                fullName: 'Nom complet',
                email: 'Email',
                phone: 'Téléphone', 
                message: 'Message',
                company: 'Entreprise',
                acceptTerms: 'J\'accepte les termes et conditions',
                // Frases problemáticas específicas
                pleaseComplete: 'Veuillez compléter les informations demandées pour commencer.',
                iAcceptTerms: 'J&apos;accepte les termes et conditions'
                }
                };

                return translations[language as keyof typeof translations] || translations.es;
                }

                // Función de traducción inteligente universal
                function smartTranslate(text: string, language: string): string {
                if (!text) return text;

                const t = getFormTranslations(language);

                // Si ya está en el idioma correcto, no traducir
                if (language === 'es') return text;

                // Diccionario completo de traducciones exactas con debug
                const exactTranslations: Record<string, string> = {
                // Frases problemáticas específicas
                'Por favor complete la información solicitada para comenzar.': t.pleaseComplete,
                'Acepto los términos y condiciones': t.iAcceptTerms,
                'Complete la información solicitada para comenzar.': t.pleaseComplete,

                // Campos comunes - coincidencias exactas
                'Nombre': t.name,
                'Nombre completo': t.fullName,
                'Nom complet': t.fullName,
                'Nom': t.name,
                'Email': t.email,
                'Teléfono': t.phone,
                'Mensaje': t.message,
                'Empresa': t.company,
                'Entreprise': t.company,

                // Botones y acciones
                'Enviar': t.submit,
                'Enviando...': t.sending,
                'Selecciona una opción': t.selectOption,
                'Sélectionnez une option': t.selectOption
                };

                // Buscar traducción exacta primero
                if (exactTranslations[text]) {
                return exactTranslations[text];
                }

                // Traducción por patrones para casos especiales
                const textLower = text.toLowerCase();
                if (textLower.includes('acepto') && textLower.includes('términos')) {
                return t.iAcceptTerms;
                }

                if (textLower.includes('complete') && textLower.includes('información')) {
                return t.pleaseComplete;
                }

                return text;
                }

                // Función para traducir etiquetas de campo automáticamente
                function translateFieldLabel(label: string, language: string): string {
                return smartTranslate(label, language);
                }

                // Ruta para la vista embebida de formularios con diseño moderno de dos columnas
                app.get("/forms/:id/embed", async (req, res) => {
                try {
                const formId = parseInt(req.params.id);

                // Obtener el formulario
                const form = await storage.getForm(formId);

                if (!form) {
                return res.status(404).send('Formulario no encontrado');
                }

                // Detectar idioma de múltiples fuentes
                const acceptLanguage = req.headers['accept-language'] || '';
                const formTitle = form.title || '';
                const formDescription = form.description || '';

                let detectedLanguage = 'es'; // Default español

                // 1. Detectar por contenido del formulario
                const frenchWords = ['liste', 'attente', 'utilisateurs', 'modèle', 'rejoindre', 'français'];
                const englishWords = ['list', 'wait', 'users', 'template', 'join', 'english', 'name', 'email'];
                const spanishWords = ['lista', 'espera', 'usuarios', 'plantilla', 'unirse', 'español', 'nombre', 'correo'];

                const textToAnalyze = (formTitle + ' ' + formDescription).toLowerCase();

                let frenchScore = 0;
                let englishScore = 0;
                let spanishScore = 0;

                frenchWords.forEach(word => {
                if (textToAnalyze.includes(word)) frenchScore++;
                });

                englishWords.forEach(word => {
                if (textToAnalyze.includes(word)) englishScore++;
                });

                spanishWords.forEach(word => {
                if (textToAnalyze.includes(word)) spanishScore++;
                });

                // 2. Determinar idioma por puntuación del contenido
                if (frenchScore > englishScore && frenchScore > spanishScore) {
                detectedLanguage = 'fr';
                } else if (englishScore > frenchScore && englishScore > spanishScore) {
                detectedLanguage = 'en';
                } else {
                // 3. Fallback a Accept-Language header
                if (acceptLanguage.includes('fr')) {
                detectedLanguage = 'fr';
                } else if (acceptLanguage.includes('en')) {
                detectedLanguage = 'en';
                }
                }


                const t = getFormTranslations(detectedLanguage);



                // Generar HTML con diseño moderno de dos columnas
                const html = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${form.title || 'Formulario AIPI'}</title>
                <style>
                * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                }

                body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                line-height: 1.6;
                background: #f8fafc;
                margin: 0;
                padding: 1rem;
                }

                .modern-form-wrapper {
                max-width: 900px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                overflow: hidden;
                display: grid;
                grid-template-columns: 1fr 1fr;
                min-height: 600px;
                }

                .form-hero {
                background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0f172a 100%);
                padding: 3rem 2.5rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
                position: relative;
                overflow: hidden;
                }

                .form-hero::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
                opacity: 0.7;
                }

                .form-hero-content {
                position: relative;
                z-index: 1;
                }

                .form-hero h1 {
                color: white;
                font-size: 2.25rem;
                font-weight: 700;
                line-height: 1.2;
                margin: 0 0 1.5rem 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .form-hero p {
                color: rgba(255, 255, 255, 0.9);
                font-size: 1.125rem;
                line-height: 1.7;
                margin: 0;
                font-weight: 400;
                }

                .form-content {
                padding: 3rem 2.5rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
                background: white;
                }

                .form-header {
                margin-bottom: 2rem;
                }

                .form-subtitle {
                font-size: 1.125rem;
                color: #6b7280;
                margin: 0;
                font-weight: 400;
                line-height: 1.6;
                }

                .form-field {
                margin-bottom: 1.5rem;
                }

                .form-label {
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                color: #374151;
                margin-bottom: 0.5rem;
                letter-spacing: 0.025em;
                }

                .form-input, .form-select, .form-textarea {
                width: 100%;
                padding: 0.75rem 0;
                font-size: 1rem;
                color: #111827;
                background: transparent;
                border: none;
                border-bottom: 2px solid #e5e7eb;
                outline: none;
                transition: all 0.3s ease;
                font-family: inherit;
                box-sizing: border-box;
                }

                .form-input:focus, .form-select:focus, .form-textarea:focus {
                border-bottom-color: #3b82f6;
                background: rgba(59, 130, 246, 0.02);
                }

                .form-input::placeholder, .form-textarea::placeholder {
                color: #9ca3af;
                opacity: 1;
                }

                .form-select {
                cursor: pointer;
                appearance: none;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                background-position: right 0.5rem center;
                background-repeat: no-repeat;
                background-size: 1.5em 1.5em;
                padding-right: 2.5rem;
                }

                .form-textarea {
                resize: vertical;
                min-height: 100px;
                }

                .checkbox-field {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                margin: 1.5rem 0;
                }

                .checkbox {
                width: 1.25rem;
                height: 1.25rem;
                margin-top: 0.125rem;
                accent-color: #3b82f6;
                cursor: pointer;
                }

                .checkbox-label {
                font-size: 0.875rem;
                color: #6b7280;
                cursor: pointer;
                flex: 1;
                }

                .submit-button {
                width: 100%;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border: none;
                padding: 0.875rem 1.5rem;
                font-size: 1rem;
                font-weight: 600;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 1rem;
                letter-spacing: 0.025em;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .submit-button:hover {
                background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                transform: translateY(-1px);
                box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.15);
                }

                .submit-button:active {
                transform: translateY(0);
                }

                .submit-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
                }

                .required:after {
                content: " *";
                color: #ef4444;
                font-weight: 500;
                }

                .success-message {
                text-align: center;
                padding: 2rem;
                color: #059669;
                }

                .success-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
                }

                .success-title {
                margin: 0 0 1rem 0;
                color: #047857;
                font-size: 1.5rem;
                font-weight: 600;
                }

                .success-text {
                margin: 0;
                color: #6b7280;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                body {
                padding: 0.5rem;
                }

                .modern-form-wrapper {
                grid-template-columns: 1fr;
                border-radius: 12px;
                }

                .form-hero {
                padding: 2rem 1.5rem;
                min-height: 200px;
                }

                .form-hero h1 {
                font-size: 1.875rem;
                }

                .form-content {
                padding: 2rem 1.5rem;
                }
                }

                @media (max-width: 480px) {
                .form-hero, .form-content {
                padding: 1.5rem 1rem;
                }
                }
                </style>
                </head>
                <body>
                <div class="modern-form-wrapper">
                <div class="form-hero">
                <div class="form-hero-content">
                <h1>${escapeHtml(form.title) || 'Formulario'}</h1>
                <p>${escapeHtml(smartTranslate(form.description || 'Por favor complete la información solicitada para comenzar.', detectedLanguage))}</p>
                </div>
                </div>

                <div class="form-content">
                <div class="form-header">
                <p class="form-subtitle">${detectedLanguage === 'fr' ? 'Veuillez compléter les informations demandées pour commencer.' : detectedLanguage === 'en' ? 'Please complete the requested information to get started.' : t.completeInfo}</p>
                </div>

                <form id="modern-form" method="POST">
                ${(form.structure as any)?.fields?.map((field: any) => {
                  const fieldId = `field_${field.name}`;
                  let fieldHTML = `<div class="form-field">`;

                  // Traducir la etiqueta del campo automáticamente
                  const translatedLabel = translateFieldLabel(field.label, detectedLanguage);

                  switch (field.type) {
                    case 'text':
                    case 'email':
                    case 'tel':
                    case 'url':
                    case 'number':
                      fieldHTML += `
                        <label for="${fieldId}" class="form-label ${field.required ? 'required' : ''}">
                          ${escapeHtml(translatedLabel)}
                        </label>
                        <input
                          type="${field.type}"
                          id="${fieldId}"
                          name="${field.name}"
                          class="form-input"
                          placeholder="${escapeHtml(field.placeholder || '')}"
                          ${field.required ? 'required' : ''}
                        >
                      `;
                      break;

                    case 'textarea':
                      fieldHTML += `
                        <label for="${fieldId}" class="form-label ${field.required ? 'required' : ''}">
                          ${escapeHtml(translatedLabel)}
                        </label>
                        <textarea
                          id="${fieldId}"
                          name="${field.name}"
                          class="form-textarea"
                          placeholder="${escapeHtml(field.placeholder || '')}"
                          ${field.required ? 'required' : ''}
                        ></textarea>
                      `;
                      break;

                    case 'select':
                      fieldHTML += `
                        <label for="${fieldId}" class="form-label ${field.required ? 'required' : ''}">
                          ${escapeHtml(translatedLabel)}
                        </label>
                        <select id="${fieldId}" name="${field.name}" class="form-select" ${field.required ? 'required' : ''}>
                          <option value="">${t.selectOption}</option>
                      `;

                      if (field.options && Array.isArray(field.options)) {
                        field.options.forEach(option => {
                          const optionValue = typeof option === 'string' ? option : option.value || option.label;
                          const optionLabel = typeof option === 'string' ? option : option.label;
                          fieldHTML += `<option value="${optionValue}">${optionLabel}</option>`;
                        });
                      }

                      fieldHTML += `</select>`;
                      break;

                    case 'checkbox':
                      fieldHTML += `
                        <div class="checkbox-field">
                          <input
                            type="checkbox"
                            id="${fieldId}"
                            name="${field.name}"
                            class="checkbox"
                            value="1"
                            ${field.required ? 'required' : ''}
                          >
                          <label for="${fieldId}" class="checkbox-label">
                            ${escapeHtml(detectedLanguage === 'fr' && field.label.toLowerCase().includes('acepto') ? 'J&apos;accepte les termes et conditions' : detectedLanguage === 'en' && field.label.toLowerCase().includes('acepto') ? 'I accept the terms and conditions' : translatedLabel)}
                          </label>
                        </div>
                      `;
                      break;

                    default:
                      fieldHTML += `
                        <label for="${fieldId}" class="form-label ${field.required ? 'required' : ''}">
                          ${field.label}
                        </label>
                        <input
                          type="text"
                          id="${fieldId}"
                          name="${field.name}"
                          class="form-input"
                          placeholder="${field.placeholder || ''}"
                          ${field.required ? 'required' : ''}
                        >
                      `;
                  }

                  fieldHTML += `</div>`;
                  return fieldHTML;
                }).join('')}

                <button type="submit" class="submit-button">
                  ${(form.structure as any)?.submitButtonText || t.submit}
                </button>
                </form>
                </div>
                </div>

                <script>
                // Variables de traducción
                const translations = {
                sending: '${t.sending}',
                successTitle: '${t.successTitle}',
                successMessage: '${t.successMessage}',
                errorMessage: '${t.errorMessage}',
                submitText: '${(form.structure as any)?.submitButtonText || t.submit}'
                };

                document.getElementById('modern-form').addEventListener('submit', async function(e) {
                e.preventDefault();

                const submitButton = this.querySelector('.submit-button');
                submitButton.disabled = true;
                submitButton.textContent = translations.sending;

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
                  this.innerHTML = \`
                    <div class="success-message">
                      <div class="success-icon">✓</div>
                      <h3 class="success-title">\${translations.successTitle}</h3>
                      <p class="success-text">\${translations.successMessage}</p>
                    </div>
                  \`;

                  // Si hay URL de redirección configurada, redirigir después de un breve retraso
                  ${(form.settings as any)?.redirectUrl ? `
                    setTimeout(() => {
                      window.top.location.href = "${(form.settings as any).redirectUrl}";
                    }, 3000);
                  ` : ''}
                } else {
                  throw new Error('Error en el servidor');
                }
                } catch (error) {
                console.error('Error al enviar el formulario:', error);

                // Restaurar el botón
                submitButton.disabled = false;
                submitButton.textContent = translations.submitText;

                alert(translations.errorMessage);
                }
                });
                </script>
                </body>
                </html>
                `;

                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
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

                if (!conversation.integrationId) {
                return res.status(404).json({ message: "Conversation has no associated integration" });
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

                // API para mensajes de bienvenida rotativos con soporte multiidioma
                app.get("/api/welcome-messages", async (req, res) => {
                try {
                // Obtener idioma del query parameter, por defecto español
                const language = req.query.lang || 'es';

                // Usar la misma conexión que otras rutas
                const result = await db.select().from(welcomeMessages)
                .where(and(
                eq(welcomeMessages.isActive, true),
                gt(welcomeMessages.expiresAt, new Date())
                ))
                .orderBy(welcomeMessages.orderIndex);

                if (result.length === 0) {
                // Si no hay mensajes válidos, devolver mensajes por defecto según idioma
                const getDefaultMessages = (lang: string) => {
                switch (lang) {
                case 'fr':
                return [
                {
                  message_text: "Bienvenue dans AIPPS - La plateforme conversationnelle alimentée par l'IA pour une communication intelligente sur votre site web",
                  message_type: "welcome",
                  order_index: 1
                },
                {
                  message_text: "Automatisez votre service client avec une IA avancée - Réponses intelligentes 24/7 sans intervention manuelle",
                  message_type: "automation",
                  order_index: 2
                }
                ];
                case 'en':
                return [
                {
                  message_text: "Welcome to AIPPS - The AI-powered conversational platform for intelligent communication on your website",
                  message_type: "welcome",
                  order_index: 1
                },
                {
                  message_text: "Automate your customer service with advanced AI - Intelligent 24/7 responses without manual intervention",
                  message_type: "automation",
                  order_index: 2
                }
                ];
                default: // español
                return [
                {
                  message_text: "Bienvenido a AIPPS - La plataforma conversacional con IA para una comunicación inteligente en tu sitio web",
                  message_type: "welcome",
                  order_index: 1
                },
                {
                  message_text: "Automatiza tu atención al cliente con IA avanzada - Respuestas inteligentes 24/7 sin intervención manual",
                  message_type: "automation",
                  order_index: 2
                }
                ];
                }
                };

                return res.json(getDefaultMessages(language as string));
                }

                // Mapear mensajes según el idioma solicitado
                const messages = result.map(msg => {
                let messageText = msg.messageText; // Por defecto español

                if (language === 'fr' && msg.messageTextFr) {
                messageText = msg.messageTextFr;
                } else if (language === 'en' && msg.messageTextEn) {
                messageText = msg.messageTextEn;
                }

                return {
                message_text: messageText,
                message_type: msg.messageType,
                order_index: msg.orderIndex
                };
                });

                res.json(messages);
                } catch (error) {
                console.error("Error al obtener mensajes de bienvenida:", error);
                res.status(500).json({ message: "Error al obtener mensajes de bienvenida" });
                }
                });
                setupAuth(app);
                return httpServer;
                }
