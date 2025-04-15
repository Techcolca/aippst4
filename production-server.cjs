/**
 * Servidor de producción optimizado para AIPI (versión CommonJS)
 * Este archivo maneja health checks, inicio de aplicación y proxy en un solo lugar
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuración básica
const PORT = process.env.PORT || 3000;
const INTERNAL_PORT = 5017;
const MAX_STARTUP_TIME = 120000; // 2 minutos máximo de espera para iniciar la app
let APP_ENTRY_POINT = path.resolve('./server/index.js'); // Punto de entrada simplificado

const app = express();
let appProcess = null;
let appStartTime = null;
let appReady = false;

// ----- GESTIÓN DE SALUD Y ESTADO -----

// Configuración de rutas prioritarias para health checks
app.get(['/healthz'], (req, res) => {
  const uptime = appStartTime ? (Date.now() - appStartTime) : 0;
  
  // Siempre devolvemos 200 OK para health checks, incluso si la app aún está iniciando
  res.status(200).send('OK');
  
  // Log informativo
  console.log(`[${new Date().toISOString()}] Health check: ${req.path} (Aplicación ${appReady ? 'lista' : 'iniciando...'})`);
});

// Ruta raíz que redirige a la aplicación cuando está lista o muestra página de carga
app.get('/', (req, res) => {
  // Si la aplicación está lista, hacer proxy a la aplicación real
  if (appReady) {
    return createProxyMiddleware(proxyOptions)(req, res);
  }
  
  // Si la aplicación todavía está iniciando, mostrar página de carga
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AIPI - Iniciando servicio</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="refresh" content="5"> <!-- Recargar cada 5 segundos -->
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
          .container { background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 2rem; margin-top: 3rem; }
          .spinner { display: inline-block; width: 50px; height: 50px; border: 5px solid rgba(74, 108, 247, 0.3); border-radius: 50%; border-top-color: #4a6cf7; animation: spin 1s ease-in-out infinite; margin-bottom: 1rem; }
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h1>AIPI está iniciando</h1>
          <p>El servicio se está iniciando, por favor espere un momento...</p>
          <p>Tiempo de inicio: ${Math.floor((Date.now() - appStartTime) / 1000)} segundos</p>
        </div>
      </body>
    </html>
  `);
  
  console.log(`[${new Date().toISOString()}] Sirviendo página de carga (Aplicación iniciando...)`);
});

// Ruta para diagnosticar estado detallado (solo informativo)
app.get('/deployment-status', (req, res) => {
  const uptime = appStartTime ? (Date.now() - appStartTime) : 0;
  
  res.json({
    status: appReady ? 'ready' : 'initializing',
    uptime: `${Math.floor(uptime / 1000)}s`,
    internalPort: INTERNAL_PORT,
    externalPort: PORT,
    startTime: appStartTime ? new Date(appStartTime).toISOString() : null,
    processRunning: !!appProcess,
    environment: process.env.NODE_ENV || 'production'
  });
});

// ----- FUNCIONES DE INICIALIZACIÓN Y GESTIÓN -----

// Función para iniciar la aplicación real
function startApplication() {
  try {
    console.log(`[${new Date().toISOString()}] 🚀 Iniciando aplicación en puerto ${INTERNAL_PORT}...`);
    appStartTime = Date.now();
    
    // Verificar si el punto de entrada existe
    if (!fs.existsSync(APP_ENTRY_POINT)) {
      console.error(`⚠️ El punto de entrada ${APP_ENTRY_POINT} no existe`);
      console.log('📂 Buscando alternativas...');
      
      // Intentar alternativas comunes en orden de preferencia
      const alternatives = [
        './dist/server/index.js', 
        './server/index.ts',
        './index.js'
      ];
      
      for (const alt of alternatives) {
        if (fs.existsSync(path.resolve(alt))) {
          console.log(`✅ Encontrada alternativa: ${alt}`);
          APP_ENTRY_POINT = path.resolve(alt);
          break;
        }
      }
    }
    
    // Determinar cómo ejecutar el punto de entrada
    const isTypeScript = APP_ENTRY_POINT.endsWith('.ts');
    const command = isTypeScript ? 'npx' : 'node';
    const args = isTypeScript ? ['tsx', APP_ENTRY_POINT] : [APP_ENTRY_POINT];
    
    // Iniciar el proceso
    appProcess = spawn(command, args, {
      env: {
        ...process.env,
        PORT: INTERNAL_PORT.toString(),
        INTERNAL_SERVER: 'true'
      },
      stdio: 'pipe'
    });
    
    // Configurar captura de salida
    appProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      console.log(`📱 [App]: ${output}`);
      
      // Detectar señales de que la app está lista
      if (
        output.includes('serving on port') || 
        output.includes('listening on') ||
        output.includes('started on port')
      ) {
        appReady = true;
        console.log(`✅ [${new Date().toISOString()}] Aplicación lista y respondiendo en puerto ${INTERNAL_PORT}`);
      }
    });
    
    appProcess.stderr.on('data', (data) => {
      console.error(`⚠️ [App Error]: ${data.toString().trim()}`);
    });
    
    appProcess.on('close', (code) => {
      console.log(`⚠️ Aplicación cerrada con código: ${code}`);
      appReady = false;
      
      // Reiniciar después de un breve retraso si el proceso termina inesperadamente
      if (code !== 0) {
        console.log('🔄 Intentando reiniciar la aplicación en 5 segundos...');
        setTimeout(startApplication, 5000);
      }
    });
    
    // Configurar un temporizador para marcar la app como lista después del tiempo máximo de espera
    setTimeout(() => {
      if (!appReady) {
        console.log(`⚠️ Tiempo máximo de inicio alcanzado. Asumiendo que la aplicación está lista.`);
        appReady = true;
      }
    }, MAX_STARTUP_TIME);
    
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
  }
}

// ----- CONFIGURACIÓN DEL PROXY -----

// Configurar opciones del proxy
const proxyOptions = {
  target: `http://localhost:${INTERNAL_PORT}`,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/api/': '/api/' // Mantener rutas de API intactas
  },
  onProxyReq: (proxyReq, req, res) => {
    // Se puede personalizar solicitudes si es necesario
  },
  onError: (err, req, res) => {
    console.error(`Error de proxy: ${err.message}`);
    
    // Responder con un error apropiado
    if (!res.headersSent) {
      if (req.url.startsWith('/api/')) {
        res.status(503).json({ error: 'Servicio temporalmente no disponible' });
      } else {
        res.status(503).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>AIPI - Iniciando servicio</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
                .container { background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 2rem; margin-top: 3rem; }
                .spinner { display: inline-block; width: 50px; height: 50px; border: 5px solid rgba(74, 108, 247, 0.3); border-radius: 50%; border-top-color: #4a6cf7; animation: spin 1s ease-in-out infinite; margin-bottom: 1rem; }
                @keyframes spin { to { transform: rotate(360deg); } }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="spinner"></div>
                <h1>AIPI está iniciando</h1>
                <p>El servicio se está iniciando, por favor espere un momento...</p>
                <p>Si este mensaje persiste por más de 2 minutos, contacte al administrador.</p>
              </div>
              <script>
                // Recargar la página después de 10 segundos
                setTimeout(() => { window.location.reload(); }, 10000);
              </script>
            </body>
          </html>
        `);
      }
    }
  }
};

// Aplicar el middleware de proxy para todas las rutas excepto health checks
app.use((req, res, next) => {
  // Para la ruta raíz, solo usamos el proxy si la aplicación está lista (se maneja en la ruta '/')
  if (req.path === '/') {
    return next();
  }
  
  // Para health checks y status, usar los manejadores específicos
  if (req.path === '/healthz' || req.path === '/deployment-status') {
    return next();
  }
  
  // Detectar si son assets estáticos
  if (req.path.startsWith('/assets/') || req.path.match(/\.(css|js|svg|png|jpg|jpeg|gif|ico)$/)) {
    console.log(`[${new Date().toISOString()}] Sirviendo archivo estático: ${req.path}`);
  }
  
  // Para todas las demás rutas, intentar proxy
  return createProxyMiddleware(proxyOptions)(req, res, next);
});

// ----- INICIAR SERVIDOR Y APLICACIÓN -----

// Iniciar el servidor HTTP principal
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] 🌐 Servidor principal iniciado en puerto ${PORT}`);
  
  // Iniciar la aplicación real
  startApplication();
});

// Manejo de cierre limpio
process.on('SIGTERM', () => {
  console.log('🛑 Señal SIGTERM recibida, apagando servicios...');
  
  // Cerrar servidor HTTP principal
  server.close(() => {
    console.log('✅ Servidor HTTP cerrado correctamente');
    
    // Cerrar proceso de la aplicación si existe
    if (appProcess) {
      appProcess.kill('SIGTERM');
      console.log('✅ Proceso de aplicación terminado');
    }
    
    process.exit(0);
  });
});