/**
 * Script de despliegue exacto para AIPI
 * 
 * Este script replica el entorno de desarrollo exactamente en producción:
 * - Construye el frontend con `vite build`
 * - Empaqueta el backend con `esbuild`
 * - Lanza el servidor usando `tsx server/index.ts`
 * - Mantiene todos los archivos estáticos y configuraciones
 */

const express = require('express');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');

// Configuración - Usar puerto dinámico asignado por Replit
const PORT = process.env.PORT || 3000;
const INTERNAL_PORT = 5017; // Puerto interno para la aplicación
let SERVER_PROCESS = null;

console.log('🚀 AIPI - Despliegue exacto (preservando entorno de desarrollo)');
console.log(`⏱️ Inicio: ${new Date().toISOString()}`);

// Verificar entorno Node.js
console.log(`📊 Información del entorno:`);
console.log(`- Node.js: ${process.version}`);
console.log(`- Plataforma: ${process.platform}`);
console.log(`- Directorio: ${process.cwd()}`);

// Función para verificar si un puerto está en uso
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

// Función para compilar el frontend y backend exactamente como en desarrollo
async function buildApplication() {
  console.log('\n🏗️ Paso 1: Compilando aplicación...');
  
  try {
    // Compilar frontend con vite
    console.log('📦 Compilando frontend con vite build...');
    execSync('vite build', { stdio: 'inherit' });
    console.log('✅ Frontend compilado correctamente');
    
    // Empaquetar backend con esbuild
    console.log('📦 Empaquetando backend con esbuild...');
    execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', 
      { stdio: 'inherit' });
    console.log('✅ Backend empaquetado correctamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error durante la compilación:', error);
    return false;
  }
}

// Función para iniciar la aplicación exactamente como en desarrollo
async function startExactApplication() {
  console.log('\n🚀 Paso 2: Iniciando aplicación AIPI...');
  
  // Verificar si el puerto ya está en uso
  const portInUse = await isPortInUse(INTERNAL_PORT);
  if (portInUse) {
    console.log(`⚠️ El puerto ${INTERNAL_PORT} ya está en uso. Intentando liberar...`);
    try {
      // En Linux/Mac podemos intentar matar el proceso
      if (process.platform !== 'win32') {
        execSync(`kill $(lsof -t -i:${INTERNAL_PORT})`);
      }
    } catch (e) {
      // Ignorar errores, continuaremos de todos modos
    }
  }
  
  try {
    // Usar tsx exactamente como en desarrollo
    console.log('🔄 Iniciando servidor con tsx server/index.ts...');
    
    // Configurar variables de entorno - Asegurarnos de usar el puerto interno 
    // y dejar el puerto principal para el proxy
    const env = {
      ...process.env,
      PORT: INTERNAL_PORT.toString(), // Usar puerto interno para la aplicación
      NODE_ENV: 'development', // Mantener modo desarrollo para compatibilidad
      FORCE_COLOR: '1'
    };
    
    // Iniciar el servidor exactamente como en desarrollo
    SERVER_PROCESS = spawn('npx', ['tsx', 'server/index.ts'], {
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
      if (code !== 0) {
        console.log('🔄 Reintentando iniciar aplicación en 5 segundos...');
        setTimeout(startExactApplication, 5000);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    return false;
  }
}

// Función para configurar el servidor proxy
function setupProxyServer() {
  console.log('\n🔄 Paso 3: Configurando servidor proxy...');
  
  const app = express();
  
  // Configurar health checks
  app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
  });
  
  // Servir archivos estáticos desde múltiples ubicaciones, exactamente como especificaste
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
}

// Ejecución principal
async function main() {
  try {
    // Verificar si estamos en un despliegue
    const isDeployment = !!process.env.REPL_SLUG;
    console.log(`🔍 Entorno de despliegue: ${isDeployment ? 'Sí' : 'No'}`);
    
    // Si estamos en un despliegue, compilar la aplicación
    if (isDeployment) {
      await buildApplication();
    }
    
    // Iniciar la aplicación
    await startExactApplication();
    
    // Configurar el servidor proxy
    setupProxyServer();
    
    console.log('\n✨ Despliegue exacto completado. Aplicación AIPI en ejecución.');
  } catch (error) {
    console.error('❌ Error crítico durante el despliegue:', error);
    process.exit(1);
  }
}

// Iniciar el proceso
main();