/**
 * Despliegue simplificado para AIPI
 * Este script ejecuta exactamente la misma configuración que tienes en Replit
 * Versión 1.0 - Optimizada para despliegue en producción
 */
const express = require('express');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

// Puerto para el despliegue
const PORT = process.env.PORT || 3000;
const TARGET_PORT = 5000;

// Contador de reintentos
let retryCount = 0;
const MAX_RETRIES = 5;

console.log('🚀 Iniciando despliegue de AIPI...');
console.log(`📅 Fecha y hora: ${new Date().toLocaleString()}`);

// Verificar enlaces simbólicos necesarios
try {
  if (!fs.existsSync('./src') && fs.existsSync('./client/src')) {
    try {
      fs.symlinkSync('./client/src', './src', 'dir');
      console.log('✅ Enlace simbólico creado: ./client/src -> ./src');
    } catch (e) {
      console.log('⚠️ No se pudo crear enlace simbólico automáticamente');
      // Intento alternativo con comando shell
      try {
        execSync('ln -sf ./client/src ./src');
        console.log('✅ Enlace creado vía shell command');
      } catch (shellError) {
        console.error('❌ No se pudo crear enlace vía shell:', shellError.message);
      }
    }
  } else {
    console.log('ℹ️ Enlace simbólico src ya existe o no se puede crear');
  }
} catch (error) {
  console.error('❌ Error verificando enlaces simbólicos:', error.message);
}

// Función para verificar si el servidor target está funcionando
function checkTargetServer() {
  return new Promise((resolve) => {
    const req = http.request({
      method: 'HEAD',
      hostname: 'localhost',
      port: TARGET_PORT,
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

// Función para mostrar información del sistema
async function showSystemInfo() {
  try {
    console.log('💻 Información del sistema:');
    
    // Verificar procesos que usan el puerto objetivo
    try {
      console.log(`- Verificando procesos en puerto ${TARGET_PORT}...`);
      execSync(`lsof -i :${TARGET_PORT} || echo "No hay procesos usando el puerto ${TARGET_PORT}"`);
    } catch (e) {
      console.log(`- No se pudo verificar procesos en puerto ${TARGET_PORT}`);
    }
    
    // Verificar estado del servidor objetivo
    const targetRunning = await checkTargetServer();
    console.log(`- Servidor en puerto ${TARGET_PORT}: ${targetRunning ? '✅ Funcionando' : '❌ No disponible'}`);
    
    return targetRunning;
  } catch (error) {
    console.error('❌ Error al obtener información del sistema:', error.message);
    return false;
  }
}

// Página de espera cuando el servidor no está disponible
const waitingPage = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIPI - Iniciando Aplicación</title>
  <style>
    :root {
      --primary: #4a6cf7;
      --background: #f8fafc;
      --foreground: #1e293b;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: var(--foreground);
      background-color: var(--background);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1rem;
    }
    
    .container {
      width: 100%;
      max-width: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
      padding: 2.5rem 2rem;
      text-align: center;
    }
    
    .logo {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: var(--primary);
      background: linear-gradient(90deg, #4a6cf7, #0096ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    
    p {
      margin-bottom: 1.5rem;
      color: #64748b;
    }
    
    .loader {
      display: inline-block;
      width: 60px;
      height: 60px;
      border: 4px solid rgba(74, 108, 247, 0.2);
      border-radius: 50%;
      border-top-color: var(--primary);
      animation: spin 1s ease-in-out infinite;
      margin: 2rem 0;
    }
    
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: var(--primary);
      color: white;
      border-radius: 6px;
      font-weight: 500;
      text-decoration: none;
      transition: opacity 0.2s;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }
    
    .btn:hover {
      opacity: 0.9;
    }
    
    .timer {
      font-size: 0.875rem;
      color: #94a3b8;
      margin-top: 1rem;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">AIPI</div>
    
    <h1>Iniciando Aplicación</h1>
    
    <p>Estamos preparando todo para ti. Este proceso puede tomar unos momentos.</p>
    
    <div class="loader"></div>
    
    <p>Si la página no carga automáticamente después de unos segundos, puedes intentar recargar.</p>
    
    <div class="timer" id="timer">Recargando en 15 segundos</div>
    
    <a href="/" class="btn">Recargar Ahora</a>
  </div>
  
  <script>
    // Temporizador de recarga automática
    let secondsLeft = 15;
    const timerElement = document.getElementById('timer');
    
    const interval = setInterval(() => {
      secondsLeft--;
      timerElement.textContent = \`Recargando en \${secondsLeft} segundos\`;
      
      if (secondsLeft <= 0) {
        clearInterval(interval);
        window.location.reload();
      }
    }, 1000);
  </script>
</body>
</html>
`;

// Función para iniciar el proxy
async function startProxy() {
  // Verificar estado del servidor objetivo primero
  const targetAvailable = await showSystemInfo();
  
  const app = express();
  
  // Middleware para registrar solicitudes
  app.use((req, res, next) => {
    console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    next();
  });
  
  // Endpoint para verificar estado del despliegue
  app.get('/deployment-status', (req, res) => {
    res.json({
      status: 'running',
      timestamp: new Date().toISOString(),
      port: PORT,
      targetPort: TARGET_PORT,
      targetAvailable
    });
  });
  
  // Configurar el proxy
  const proxyMiddleware = createProxyMiddleware({
    target: `http://localhost:${TARGET_PORT}`,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      '^/api/': '/api/', // Mantener rutas de API intactas
    },
    onProxyReq: (proxyReq, req, res) => {
      // Personalizar solicitudes si es necesario
    },
    onError: async (err, req, res) => {
      console.error(`Error de proxy: ${err.message}`);
      
      // Intentar verificar el servidor de nuevo
      const isServerUp = await checkTargetServer();
      
      if (!isServerUp && !res.headersSent) {
        res.writeHead(503, {
          'Content-Type': 'text/html',
          'Retry-After': '15'
        });
        res.end(waitingPage);
      }
    }
  });
  
  // Aplicar el proxy a todas las rutas
  app.use('/', proxyMiddleware);
  
  // Manejar errores de la aplicación
  app.use((err, req, res, next) => {
    console.error('Error en aplicación Express:', err.message);
    
    if (!res.headersSent) {
      res.status(500).send('Error interno del servidor');
    }
  });
  
  // Iniciar el servidor proxy
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌍 Servidor proxy iniciado en puerto ${PORT}`);
    console.log(`📡 Redirigiendo solicitudes a http://localhost:${TARGET_PORT}`);
  });
  
  // Manejar errores de servidor
  server.on('error', (err) => {
    console.error(`❌ Error en servidor proxy: ${err.message}`);
    
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Puerto ${PORT} ya está en uso. Intentando con otro puerto...`);
      setTimeout(() => {
        server.close();
        app.listen(PORT + 1, '0.0.0.0', () => {
          console.log(`🌍 Servidor proxy reiniciado en puerto ${PORT + 1}`);
        });
      }, 1000);
    }
  });
}

// Función principal
async function main() {
  try {
    await startProxy();
  } catch (error) {
    console.error('❌ Error crítico:', error.message);
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`🔄 Reintentando (${retryCount}/${MAX_RETRIES}) en 5 segundos...`);
      setTimeout(main, 5000);
    } else {
      console.error('❌ Número máximo de reintentos alcanzado. Por favor verifica los logs.');
    }
  }
}

// Iniciar la aplicación
main();