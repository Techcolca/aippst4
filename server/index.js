
// Este archivo es generado automáticamente para solucionar problemas de despliegue
// Es una versión simplificada de index.ts convertida a JavaScript

import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Servir archivos estáticos
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.static(path.join(process.cwd(), 'dist/client')));

// Una ruta básica de API para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'El servidor está funcionando correctamente' });
});

// Catch-all route para SPA
app.get('*', (req, res) => {
  // Evitar rutas de API
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(process.cwd(), 'dist/client/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor desplegado funcionando en puerto ${PORT}`);
});
import express, { type Request, Response, NextFunction } from "express";
import ./routes;
import ./vite;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended }));

// Add CORS headers for widget integration
app.use((req, res, next) => {
  // Allow requests from any origin
  res.header("Access-Control-Allow-Origin", "*");
  
  // Allow specific headers
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-api-key");
  
  // Allow specific methods
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  // En Replit, siempre usamos la configuración de desarrollo
  // para evitar problemas de acceso a la aplicación
  const isReplit = process.env.REPL_ID !== undefined;
  if (app.get("env") === "development" || isReplit) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
