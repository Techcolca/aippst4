import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyToken } from "./middleware/auth";
import { generateApiKey } from "./lib/utils";
import { generateChatCompletion, analyzeSentiment, summarizeText } from "./lib/openai";
import { webscraper } from "./lib/webscraper";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { insertUserSchema, insertIntegrationSchema, insertMessageSchema, insertSitesContentSchema } from "@shared/schema";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";

export async function registerRoutes(app: Express): Promise<Server> {
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
  
  app.post("/api/integrations", verifyToken, async (req, res) => {
    try {
      console.log("Create integration request body:", req.body);
      console.log("User ID from token:", req.userId);
      
      // Obtenemos la API key del cuerpo de la solicitud
      const apiKey = req.body.apiKey || generateApiKey();
      
      // Extraemos solo los campos necesarios para la base de datos
      const integrationData = {
        name: req.body.name,
        url: req.body.url,
        themeColor: req.body.themeColor || "#3B82F6",
        position: req.body.position || "bottom-right",
        userId: req.userId,
      };
      
      console.log("Cleaned integration data:", integrationData);
      
      // Creamos la integración
      const integration = await storage.createIntegration({
        ...integrationData,
        apiKey: apiKey,
      });
      
      console.log("Integration created successfully:", integration);
      
      res.status(201).json(integration);
    } catch (error) {
      console.error("Create integration error:", error);
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
        active: req.body.active
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
  
  // ================ Widget Routes ================
  app.get("/api/widget/:apiKey", async (req, res) => {
    try {
      const { apiKey } = req.params;
      
      // Validate API key and get integration
      const integration = await storage.getIntegrationByApiKey(apiKey);
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }
      
      // Get user settings
      const settings = await storage.getSettings(integration.userId);
      
      // Update visitor count
      await storage.incrementVisitorCount(integration.id);
      
      // Return widget configuration
      res.json({
        integration,
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
        
        console.log(`Generando respuesta con ${context ? 'contexto del sitio web' : 'sin contexto del sitio'}`);
        
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
  
  const httpServer = createServer(app);
  
  return httpServer;
}
