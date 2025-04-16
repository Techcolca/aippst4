/**
 * Script simple para despliegue en producción
 * Este archivo maneja la iniciación y mantenimiento del servidor en producción
 */
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Usar puerto dinámico asignado por Replit
const PORT = process.env.PORT || 8080;
const INTERNAL_PORT = 5173;
let SERVER_PROCESS = null;

console.log('🚀 AIPI - Iniciando servidor de producción');
console.log(`⏱️ Inicio: ${new Date().toISOString()}`);

// Configurar el servidor proxy
const app = express();

// Configurar health checks
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Servir archivos estáticos desde múltiples ubicaciones
const staticPaths = [
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'dist/client'),
  path.join(process.cwd(), 'client/dist')
];

// Servir archivos estáticos
staticPaths.forEach(staticPath => {
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    console.log(`📄 Sirviendo archivos estáticos desde: ${staticPath}`);
  }
});

// Iniciar el servidor de aplicación
function startAppServer() {
  // Usar el script start de package.json
  const env = {
    ...process.env,
    PORT: INTERNAL_PORT.toString(),
    NODE_ENV: 'production'
  };
  
  SERVER_PROCESS = spawn('node', ['dist/index.js'], {
    env,
    stdio: 'pipe'
  });
  
  // Capturar salida
  SERVER_PROCESS.stdout.on('data', (data) => {
    console.log(`📱 [AIPI]: ${data.toString().trim()}`);
  });
  
  SERVER_PROCESS.stderr.on('data', (data) => {
    console.error(`⚠️ [AIPI Error]: ${data.toString().trim()}`);
  });
  
  SERVER_PROCESS.on('close', (code) => {
    console.log(`⚠️ La aplicación AIPI se cerró con código: ${code}`);
    
    // Reintentar automáticamente si falla
    if (code !== 0 && code !== null) {
      console.log('🔄 Reintentando iniciar aplicación en 5 segundos...');
      setTimeout(startAppServer, 5000);
    }
  });
}

// Configurar proxy
const proxyOptions = {
  target: `http://localhost:${INTERNAL_PORT}`,
  changeOrigin: true,
  ws: true,
  logLevel: 'silent',
  onError: (err, req, res) => {
    console.error(`Error de proxy: ${err.message}`);
    
    if (!res.headersSent) {
      if (req.path.startsWith('/api/')) {
        res.status(503).json({
          error: 'Servicio temporalmente no disponible',
          message: 'La aplicación está iniciando. Por favor intente nuevamente en unos momentos.'
        });
      } else {
        res.status(503).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>AIPI - Iniciando servicio</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="refresh" content="5">
              <style>
                body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; background-color: #f9fafe; }
                .container { background-color: white; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); padding: 2.5rem; margin-top: 4rem; }
                .spinner { display: inline-block; width: 60px; height: 60px; border: 6px solid rgba(74, 108, 247, 0.3); border-radius: 50%; border-top-color: #4a6cf7; animation: spin 1s ease-in-out infinite; margin-bottom: 1.5rem; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .title { font-size: 2rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; }
                .text { font-size: 1.1rem; color: #4a5568; line-height: 1.6; }
                .gradient-text { background: linear-gradient(to right, #4a6cf7, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="spinner"></div>
                <h1 class="title">AIPI <span class="gradient-text">está iniciando</span></h1>
                <p class="text">El servicio se está preparando, por favor espere un momento.</p>
                <p class="text">La página se actualizará automáticamente.</p>
              </div>
            </body>
          </html>
        `);
      }
    }
  }
};

// Usar proxy para todas las rutas excepto los health checks
app.use((req, res, next) => {
  if (req.path === '/healthz') {
    return next();
  }
  return createProxyMiddleware(proxyOptions)(req, res, next);
});

// Iniciar el servidor proxy
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor proxy iniciado en puerto ${PORT}`);
  console.log(`🔄 Redirigiendo solicitudes a puerto ${INTERNAL_PORT}`);
  
  // Iniciar el servidor de aplicación
  startAppServer();
});

// Manejar señales de cierre
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidores...');
  
  server.close(() => {
    console.log('✅ Servidor proxy cerrado correctamente');
    
    if (SERVER_PROCESS) {
      SERVER_PROCESS.kill('SIGTERM');
      console.log('✅ Proceso de aplicación AIPI terminado');
    }
    
    process.exit(0);
  });
});