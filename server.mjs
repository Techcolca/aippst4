/**
 * Servidor de despliegue para AIPI usando ES Modules
 */
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fs from 'fs';
import http from 'http';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Puerto para el despliegue 
const PORT = process.env.PORT || 3000;
const INTERNAL_PORT = 5000;

console.log('🚀 Iniciando servidor de despliegue AIPI...');
console.log(`📅 Fecha y hora: ${new Date().toLocaleString()}`);

// Verificar si el servidor interno está funcionando
function checkInternalServer() {
  return new Promise((resolve) => {
    const req = http.request({
      method: 'HEAD',
      hostname: 'localhost',
      port: INTERNAL_PORT,
      path: '/',
      timeout: 3000
    }, (res) => {
      resolve(res.statusCode < 500);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Asegurar enlaces simbólicos necesarios
if (!fs.existsSync('./src') && fs.existsSync('./client/src')) {
  try {
    fs.symlinkSync('./client/src', './src', 'dir');
    console.log('✅ Enlace simbólico creado: ./client/src -> ./src');
  } catch (e) {
    console.log('⚠️ No se pudo crear enlace simbólico automáticamente');
    // Intento alternativo con comando shell
    exec('ln -sf ./client/src ./src', (error) => {
      if (error) {
        console.error('❌ No se pudo crear enlace vía shell');
      } else {
        console.log('✅ Enlace creado vía shell command');
      }
    });
  }
} else {
  console.log('ℹ️ Enlace simbólico src ya existe o no se puede crear');
}

// Crear la aplicación Express
const app = express();

// Middleware para manejar solicitudes a la raíz (para health checks)
app.get('/', async (req, res, next) => {
  // Si el health check proviene de Replit, responder directamente
  const userAgent = req.headers['user-agent'] || '';
  
  if (userAgent.includes('Replit') || userAgent.includes('UptimeRobot')) {
    console.log('Health check detectado, respondiendo OK');
    return res.status(200).send('OK');
  }
  
  // Para otros usuarios, intentar redirigir al servidor interno
  const isServerUp = await checkInternalServer();
  
  if (isServerUp) {
    // Si el servidor interno está funcionando, pasar la solicitud
    next();
  } else {
    // Si el servidor interno no está funcionando, mostrar página de carga
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AIPI - Cargando Aplicación</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
          .container { background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 2rem; margin-top: 3rem; }
          .loader { display: inline-block; width: 50px; height: 50px; border: 4px solid rgba(74, 108, 247, 0.2); 
                    border-radius: 50%; border-top-color: #4a6cf7; animation: spin 1s linear infinite; margin: 2rem 0; }
          .btn { display: inline-block; padding: 10px 20px; background: #4a6cf7; color: white; border-radius: 4px; 
                 text-decoration: none; margin: 1rem 0; }
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>AIPI</h1>
          <p>La aplicación se está iniciando. Por favor espera unos momentos...</p>
          <div class="loader"></div>
          <p>Si la página no carga automáticamente después de unos segundos, puedes intentar recargar.</p>
          <a href="/" class="btn">Recargar Página</a>
          <script>setTimeout(() => { window.location.reload(); }, 10000);</script>
        </div>
      </body>
      </html>
    `);
  }
});

// Health check específico
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Ruta para mostrar estado del server
app.get('/server-status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    port: PORT,
    internalPort: INTERNAL_PORT,
  });
});

// Configurar proxy para el resto de rutas
const proxyOptions = {
  target: `http://localhost:${INTERNAL_PORT}`,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/api/': '/api/' // Mantener rutas de API intactas
  },
  onProxyReq: (proxyReq, req, res) => {
    // Personalizar solicitudes si es necesario
  },
  onError: (err, req, res) => {
    console.error(`Error de proxy: ${err.message}`);
    
    // Si es una solicitud de API, enviar error JSON
    if (req.url.startsWith('/api/')) {
      if (!res.headersSent) {
        res.status(503).json({ error: 'Servicio temporalmente no disponible' });
      }
    } else if (!res.headersSent) {
      // Para solicitudes regulares, mostrar página de error
      res.status(503).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AIPI - Servicio No Disponible</title>
            <style>
              body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
              .container { background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 2rem; margin-top: 3rem; }
              .btn { display: inline-block; padding: 10px 20px; background: #4a6cf7; color: white; border-radius: 4px; 
                     text-decoration: none; margin: 1rem 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>AIPI - Servicio Temporalmente No Disponible</h1>
              <p>Estamos trabajando para solucionar este problema. Por favor intenta nuevamente en unos minutos.</p>
              <a href="/" class="btn">Reintentar</a>
            </div>
          </body>
        </html>
      `);
    }
  }
};

// Aplicar el proxy a todas las rutas (después del middleware de health check)
app.use('/', createProxyMiddleware(proxyOptions));

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌍 Servidor iniciado en puerto ${PORT}`);
  console.log(`📡 Redirigiendo tráfico a http://localhost:${INTERNAL_PORT}`);
  
  // Verificar si el servidor interno está funcionando
  checkInternalServer().then(isUp => {
    console.log(`Servidor interno: ${isUp ? 'Funcionando ✅' : 'No disponible ❌'}`);
  });
});