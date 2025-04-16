#!/usr/bin/env node
/**
 * Script optimizado de despliegue para producción en Replit
 * Este script asegura que la aplicación se ejecute correctamente en producción
 * evitando conflictos de puertos y otras problemáticas.
 */
const express = require('express');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');
const find = require('find-process');

// Configuración de puertos - usando valores altos para evitar conflictos
const PORT = process.env.PORT || 8080;            // Puerto principal asignado por Replit
const INTERNAL_PORT = process.env.INTERNAL_PORT || 9173;  // Puerto interno alto para evitar conflictos
let SERVER_PROCESS = null;

console.log('🚀 AIPI - Despliegue optimizado para producción');
console.log(`⏱️ Inicio: ${new Date().toISOString()}`);
console.log(`📊 Información del entorno:`);
console.log(`- Node.js: ${process.version}`);
console.log(`- Plataforma: ${process.platform}`);
console.log(`- Directorio: ${process.cwd()}`);
console.log(`- Puerto asignado: ${PORT}`);
console.log(`- Puerto interno: ${INTERNAL_PORT}`);

/**
 * Verifica si un puerto está en uso
 */
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

/**
 * Intenta liberar un puerto específico terminando los procesos que lo usan
 */
async function freePort(port) {
  console.log(`🔍 Intentando liberar puerto ${port}...`);
  
  try {
    // Encontrar procesos usando el puerto
    const processes = await find('port', port);
    
    if (processes.length === 0) {
      console.log(`✅ No se encontraron procesos usando el puerto ${port}`);
      return true;
    }
    
    console.log(`⚠️ Encontrados ${processes.length} procesos usando el puerto ${port}`);
    
    // Intentar terminar los procesos
    for (const proc of processes) {
      console.log(`🔄 Terminando proceso: PID ${proc.pid} (${proc.name})`);
      try {
        process.kill(proc.pid);
        console.log(`✅ Proceso ${proc.pid} terminado`);
      } catch (e) {
        console.log(`⚠️ No se pudo terminar el proceso ${proc.pid}: ${e.message}`);
        if (process.platform !== 'win32') {
          try {
            execSync(`kill -9 ${proc.pid}`);
            console.log(`✅ Proceso ${proc.pid} terminado forzosamente`);
          } catch (e2) {
            console.log(`❌ No se pudo terminar forzosamente el proceso ${proc.pid}`);
          }
        }
      }
    }
    
    // Verificar nuevamente
    const stillInUse = await isPortInUse(port);
    if (stillInUse) {
      console.log(`⚠️ El puerto ${port} sigue ocupado después de intentar liberarlo`);
      return false;
    } else {
      console.log(`✅ Puerto ${port} liberado correctamente`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error al intentar liberar el puerto ${port}:`, error);
    return false;
  }
}

/**
 * Encuentra un puerto disponible en un rango específico
 */
async function findAvailablePort(start, end) {
  console.log(`🔍 Buscando puerto disponible entre ${start} y ${end}...`);
  
  for (let port = start; port <= end; port++) {
    const inUse = await isPortInUse(port);
    if (!inUse) {
      console.log(`✅ Puerto ${port} disponible`);
      return port;
    }
  }
  
  console.log(`❌ No se encontró ningún puerto disponible entre ${start} y ${end}`);
  return null;
}

/**
 * Compila la aplicación para producción
 */
async function buildApplication() {
  console.log('\n🏗️ Paso 1: Compilando aplicación para producción...');
  
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

/**
 * Inicia la aplicación con el puerto adecuado
 */
async function startApplication() {
  console.log('\n🚀 Paso 2: Iniciando aplicación AIPI...');
  
  // Verificar puertos críticos y liberar si es necesario
  const criticalPorts = [3000, 5000, 5173, 8000, INTERNAL_PORT];
  for (const port of criticalPorts) {
    const inUse = await isPortInUse(port);
    if (inUse) {
      await freePort(port);
    }
  }
  
  // Si el puerto interno está ocupado, encontrar otro disponible
  if (await isPortInUse(INTERNAL_PORT)) {
    const newPort = await findAvailablePort(9000, 9999);
    if (newPort) {
      console.log(`⚠️ Cambiando puerto interno de ${INTERNAL_PORT} a ${newPort}`);
      INTERNAL_PORT = newPort;
    } else {
      console.error('❌ No se pudo encontrar un puerto disponible. Usando puerto original.');
    }
  }
  
  try {
    // Usar tsx para iniciar el servidor
    console.log(`🔄 Iniciando servidor en puerto ${INTERNAL_PORT}...`);
    
    // Configurar variables de entorno
    const env = {
      ...process.env,
      PORT: INTERNAL_PORT.toString(),
      FORCE_COLOR: '1',
      NODE_ENV: 'production'
    };
    
    // Iniciar el servidor con tsx
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
      if (code !== 0 && code !== null) {
        console.log('🔄 Reintentando iniciar aplicación en 5 segundos...');
        setTimeout(() => startApplication(), 5000);
      }
    });
    
    // Esperar a que el servidor esté listo
    return await waitForServerReady();
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    return false;
  }
}

/**
 * Espera a que el servidor esté listo verificando el puerto
 */
function waitForServerReady() {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 20;
    const checkInterval = 1000;
    
    console.log(`🕒 Esperando a que el servidor esté listo en el puerto ${INTERNAL_PORT}...`);
    
    const checkServer = async () => {
      attempts++;
      
      try {
        // Verificar si el puerto está en uso (lo que indicaría que el servidor está funcionando)
        const serverRunning = await isPortInUse(INTERNAL_PORT);
        
        if (serverRunning) {
          console.log(`✅ Servidor detectado funcionando en el puerto ${INTERNAL_PORT} después de ${attempts} intentos`);
          resolve(true);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.log(`⚠️ El servidor no respondió después de ${maxAttempts} intentos`);
          resolve(false);
          return;
        }
        
        setTimeout(checkServer, checkInterval);
      } catch (error) {
        console.error('❌ Error al verificar el servidor:', error);
        if (attempts >= maxAttempts) {
          resolve(false);
        } else {
          setTimeout(checkServer, checkInterval);
        }
      }
    };
    
    checkServer();
  });
}

/**
 * Configura el servidor proxy para manejar las solicitudes
 */
function setupProxyServer() {
  console.log('\n🔄 Paso 3: Configurando servidor proxy...');
  
  const app = express();
  
  // Configurar health checks para deployment
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

/**
 * Función principal de ejecución
 */
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
    await startApplication();
    
    // Configurar el servidor proxy
    setupProxyServer();
    
    console.log('\n✨ Despliegue optimizado completado. Aplicación AIPI en ejecución.');
  } catch (error) {
    console.error('❌ Error crítico durante el despliegue:', error);
    process.exit(1);
  }
}

// Iniciar el proceso
main();