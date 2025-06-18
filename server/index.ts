import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for widget integration
app.use((req, res, next) => {
  // Allow requests from any origin
  res.header("Access-Control-Allow-Origin", "*");
  
  // Allow specific headers
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-api-key, Authorization");
  
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
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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

// Obtener el equivalente a __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos desde la carpeta public/static con CORS
const staticPath = path.join(__dirname, '../public/static');
console.log(`Sirviendo archivos estáticos desde: ${staticPath}`);

app.use('/static', (req, res, next) => {
  // Asegurar headers CORS específicos para archivos estáticos
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  
  // Establecer tipo de contenido correcto para archivos JS
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  }
  
  next();
}, express.static(staticPath, {
  // Configuraciones adicionales para servir archivos estáticos
  setHeaders: (res, path, stat) => {
    // Asegurar que los archivos JS se sirvan con el tipo correcto
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
    }
    // Headers de cache para mejorar rendimiento
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

// Servir archivo de prueba del widget
app.get('/test-widget.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/test-widget.html'));
});

// Servir archivo de prueba de integración externa
app.get('/test-external-integration.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/test-external-integration.html'));
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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

  // Usar el puerto proporcionado por Railway o por defecto 5000
  // this serves both the API and the client.
  const port = process.env.PORT || 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`Server running at http://0.0.0.0:${port}`);
  });
})();
