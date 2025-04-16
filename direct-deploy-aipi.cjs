/**
 * Script mejorado para desplegar AIPI (versión directa)
 * Este script inicia directamente la aplicación AIPI en modo desarrollo
 * para garantizar que el despliegue muestre la aplicación correcta
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');

console.log('⭐ AIPI - Sistema de despliegue directo (Versión Mejorada)');
console.log(`Fecha: ${new Date().toISOString()}`);

// Configuración básica
const PORT = process.env.PORT || 3000;
const INTERNAL_PORT = 5017; // Puerto interno para la aplicación
let SERVER_PROCESS = null;

// Forzar modo desarrollo para compatibilidad
process.env.NODE_ENV = 'development';

// Crear servidor Express
const app = express();

// Paso 1: Identificar archivos y rutas importantes
const rootDir = process.cwd();
console.log(`📂 Directorio raíz: ${rootDir}`);

// Lista de posibles ubicaciones del servidor principal
const serverLocations = [
  { path: path.join(rootDir, 'server/index.ts'), runner: 'tsx' },
  { path: path.join(rootDir, 'server/index.js'), runner: 'node' },
  { path: path.join(rootDir, 'dist/server/index.js'), runner: 'node' }
];

// Lista de posibles ubicaciones de los archivos estáticos
const staticLocations = [
  path.join(rootDir, 'public'),
  path.join(rootDir, 'dist/client'),
  path.join(rootDir, 'client/dist')
];

// Paso 2: Verificar que podemos encontrar los archivos importantes
let serverConfig = null;
for (const config of serverLocations) {
  if (fs.existsSync(config.path)) {
    serverConfig = config;
    console.log(`✅ Encontrado archivo del servidor: ${config.path} (${config.runner})`);
    break;
  }
}

// Verificar directorios estáticos
let staticPaths = [];
for (const location of staticLocations) {
  if (fs.existsSync(location)) {
    staticPaths.push(location);
    console.log(`✅ Encontrado directorio estático: ${location}`);
  }
}

// Paso 3: Configurar health checks y rutas básicas
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Ruta para estado del despliegue
app.get('/deployment-status', (req, res) => {
  res.json({
    status: SERVER_PROCESS ? 'running' : 'initializing',
    serverFile: serverConfig?.path || 'not found',
    staticFiles: staticPaths,
    environment: process.env.NODE_ENV,
    port: PORT,
    internalPort: INTERNAL_PORT
  });
});

// Paso 4: Iniciar la aplicación real como un proceso independiente
function startApplication() {
  if (!serverConfig) {
    console.error('❌ No se encontró el archivo del servidor AIPI');
    return false;
  }

  try {
    console.log(`🚀 Iniciando aplicación AIPI desde: ${serverConfig.path}`);
    console.log(`🔧 Usando intérprete: ${serverConfig.runner}`);

    let command = serverConfig.runner;
    let args = [serverConfig.path];
    
    // Si es tsx, necesitamos verificar que existe
    if (command === 'tsx') {
      try {
        // Verificar si tsx está disponible
        require.resolve('tsx');
      } catch (e) {
        console.log('⚠️ tsx no está disponible, usando node con esbuild-register como alternativa');
        command = 'node';
        args = ['-r', 'esbuild-register', serverConfig.path];
        
        try {
          require.resolve('esbuild-register');
        } catch (err) {
          console.log('⚠️ esbuild-register no está disponible, usando node directamente');
          command = 'node';
          args = [serverConfig.path];
        }
      }
    }
    
    // Configurar variables de entorno para el proceso
    const env = {
      ...process.env,
      PORT: INTERNAL_PORT.toString(),
      NODE_ENV: 'development', // Forzar modo desarrollo para compatibilidad
      FORCE_COLOR: '1'
    };
    
    console.log(`🔄 Ejecutando comando: ${command} ${args.join(' ')}`);
    
    // Iniciar el proceso
    SERVER_PROCESS = spawn(command, args, {
      env,
      stdio: 'pipe'
    });
    
    // Capturar la salida
    SERVER_PROCESS.stdout.on('data', (data) => {
      console.log(`📱 [AIPI]: ${data.toString().trim()}`);
    });
    
    SERVER_PROCESS.stderr.on('data', (data) => {
      console.error(`⚠️ [AIPI Error]: ${data.toString().trim()}`);
    });
    
    SERVER_PROCESS.on('close', (code) => {
      console.log(`⚠️ La aplicación AIPI se cerró con código: ${code}`);
      
      // Reintentar después de un breve retraso
      if (code !== 0) {
        console.log('🔄 Reintentando iniciar aplicación en 5 segundos...');
        setTimeout(startApplication, 5000);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    return false;
  }
}

// Paso 5: Configurar proxy para redirigir a la aplicación real
const proxyOptions = {
  target: `http://localhost:${INTERNAL_PORT}`,
  changeOrigin: true,
  ws: true, // Importante para WebSockets
  pathRewrite: {
    '^/api': '/api' // Mantener rutas API intactas
  },
  logLevel: 'silent',
  onError: (err, req, res) => {
    console.error(`Error de proxy: ${err.message}`);
    if (!res.headersSent) {
      // Si es API, devolver JSON de error
      if (req.path.startsWith('/api/')) {
        res.status(503).json({
          error: 'Servicio temporalmente no disponible',
          message: 'La aplicación está iniciando. Por favor intente nuevamente en unos momentos.'
        });
      } else {
        // Si no es API, mostrar página de carga
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

// Paso 6: Servir archivos estáticos y configurar proxy
staticPaths.forEach(staticPath => {
  app.use(express.static(staticPath));
  console.log(`📄 Sirviendo archivos estáticos desde: ${staticPath}`);
});

// Usar proxy para todas las rutas excepto health checks
app.use((req, res, next) => {
  if (req.path === '/healthz' || req.path === '/deployment-status') {
    return next();
  }
  return createProxyMiddleware(proxyOptions)(req, res, next);
});

// Paso 7: Iniciar el servidor HTTP y la aplicación
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor proxy iniciado en puerto ${PORT}`);
  console.log(`🔄 Redirigiendo solicitudes a la aplicación AIPI en puerto ${INTERNAL_PORT}`);
  
  // Iniciar la aplicación real
  startApplication();
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