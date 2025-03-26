import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyToken } from "./middleware/auth";
import { generateApiKey } from "./lib/utils";
import { generateChatCompletion, analyzeSentiment, summarizeText } from "./lib/openai";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { insertUserSchema, insertIntegrationSchema, insertMessageSchema } from "@shared/schema";
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
      
      // Si apiKey se proporciona en el cuerpo de la solicitud, lo usamos
      // en lugar de generar uno nuevo
      const apiKey = req.body.apiKey || generateApiKey();
      
      const validatedData = insertIntegrationSchema.parse({
        ...req.body,
        userId: req.userId,
      });
      
      console.log("Validated data for integration:", validatedData);
      
      const integration = await storage.createIntegration({
        ...validatedData,
        apiKey,
      });
      
      console.log("Integration created successfully:", integration);
      
      res.status(201).json(integration);
    } catch (error) {
      console.error("Create integration error:", error);
      // Proporcionar más detalles sobre el error para depuración
      if (error instanceof Error) {
        res.status(400).json({ message: "Invalid integration data", error: error.message });
      } else {
        res.status(400).json({ message: "Invalid integration data" });
      }
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
      const { conversationId, content, role } = req.body;
      
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
        
        // Generate AI response
        const completion = await generateChatCompletion(
          messages.map(msg => ({ role: msg.role, content: msg.content }))
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
  
  // Serve the embed script
  app.get("/embed.js", (req, res) => {
    const embedScriptPath = path.join(__dirname, "../public/embed.js");
    
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
