import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('trust proxy', 1);

// Configurar CORS para widgets embebidos de AIPPS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Para widgets embebidos: permitir CUALQUIER origen con credenciales
  // Esto es seguro porque usamos API keys para autenticación del widget
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  } else {
    // Para requests sin origen (misma aplicación, Postman, etc.)
    res.header("Access-Control-Allow-Origin", "*");
  }
  
  // Headers necesarios para widgets y autenticación
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-api-key, Authorization, Cookie");
  
  // Métodos permitidos
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS, PUT");
  
  // Manejo de preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).send();
  }
  
  next();
});

// Middleware de protección contra ataques (AÑADIR AQUÍ)
// Rate limiting - máximo 100 requests por 15 minutos por IP

// Rate limiting para producción - más permisivo
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 1000 : 100, // 1000 en producción, 100 en desarrollo
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { 
    error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' 
  },
  // Solo aplicar a rutas API específicas
  skip: (req) => !req.path.startsWith('/api') || req.path === '/api/health'
});

// Rate limiting para autenticación - más permisivo en producción
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 50 : 5, // 50 en producción, 5 en desarrollo
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { 
    error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' 
  }
});

// Middleware de seguridad contra bots
const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const url = req.url.toLowerCase();
  const userAgent = req.get('User-Agent') || '';

  // Patrones de ataque comunes
  const maliciousPatterns = [
    '/wp-admin',
    '/wp-login.php',
    '/xmlrpc.php',
    '/wp-config.php',
    '/wp-includes',
    '/wp-content',
    '/.git/',
    '/phpmyadmin',
    '/admin.php',
    '/administrator',
    '/.env',
    '/config',
    '.php'
  ];

  // Bots maliciosos
  const botSignatures = [
    'masscan',
    'nmap',
    'sqlmap',
    'nikto',
    'wordpress',
    'wp_is_mobile',
    'scanner'
  ];

  // Bloquear patrones maliciosos
  if (maliciousPatterns.some(pattern => url.includes(pattern))) {
    console.log(`🚨 Blocked attack attempt from ${req.ip}: ${req.url}`);
    return res.status(404).end();
  }

  // Bloquear bots conocidos
  if (botSignatures.some(sig => userAgent.toLowerCase().includes(sig))) {
    console.log(`🚨 Blocked bot from ${req.ip}: ${userAgent}`);
    return res.status(403).end();
  }

  next();
};

// Aplicar middlewares de seguridad
app.use(limiter);
app.use('/api/auth', authLimiter);
app.use(securityMiddleware);

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
  const origin = req.headers.origin;
  
  // Permitir widgets embebidos desde cualquier dominio
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }
  
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  // Establecer tipo de contenido correcto para archivos JS
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
    // No cache para archivos JS durante desarrollo
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }

  next();
}, express.static(staticPath, {
  // Configuraciones adicionales para servir archivos estáticos
  setHeaders: (res, path, stat) => {
    // Asegurar que los archivos JS se sirvan con el tipo correcto
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    } else {
      // Headers de cache para otros archivos
      res.set('Cache-Control', 'public, max-age=3600');
    }
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

// Servir página de demostración completa
app.get('/demo-integration.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/demo-integration.html'));
});

// Servir página de debug de contraste
app.get('/debug-contrast.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/debug-contrast.html'));
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Error en la aplicación:', err);
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  // En Replit, siempre usamos la configuración de desarrollo
  // para evitar problemas de acceso a la aplicación
  const isReplit = process.env.REPL_ID !== undefined;
  const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME !== undefined;

  if (app.get("env") === "development" || isReplit) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Usar el puerto proporcionado por Railway o por defecto 5000
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Server running at http://0.0.0.0:${port}`);
  });
})();
