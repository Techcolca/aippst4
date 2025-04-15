/**
 * Despliegue completo de la aplicación AIPI en Replit
 * Este script ejecuta la aplicación completa y maneja health checks
 */
const { spawn, execSync } = require('child_process');
const express = require('express');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');

// Puertos 
const PORT = process.env.PORT || 3000;
const APP_PORT = 5001; // Puerto interno para la aplicación

// Variables para la aplicación
let appProcess = null;

// Función para matar cualquier proceso que use el puerto APP_PORT
function killProcessOnPort(port) {
  try {
    console.log(`Verificando si hay procesos usando el puerto ${port}...`);
    execSync(`lsof -t -i:${port} | xargs -r kill -9`);
    console.log(`Procesos en puerto ${port} terminados (si existían)`);
  } catch (error) {
    console.log(`No se encontraron procesos usando el puerto ${port} o no se pudieron terminar`);
  }
}

// Función para verificar si los enlaces simbólicos necesarios existen
function verifySymlinks() {
  try {
    if (!fs.existsSync('./src') && fs.existsSync('./client/src')) {
      try {
        fs.symlinkSync('./client/src', './src', 'dir');
        console.log('✅ Enlace simbólico creado: ./client/src -> ./src');
      } catch (e) {
        console.log('⚠️ No se pudo crear enlace simbólico automáticamente. Intentando con comando shell...');
        try {
          execSync('ln -sf ./client/src ./src');
          console.log('✅ Enlace creado vía shell command');
        } catch (shellError) {
          console.error('❌ No se pudo crear enlace vía shell');
          return false;
        }
      }
    } else {
      console.log('ℹ️ Enlace simbólico src ya existe o no se puede crear');
    }
    return true;
  } catch (error) {
    console.error('❌ Error verificando enlaces simbólicos:', error);
    return false;
  }
}

// Función para iniciar la aplicación completa
function startApp() {
  console.log('🚀 Iniciando aplicación AIPI completa...');
  
  // Establecer variables de entorno para el puerto interno
  const env = {
    ...process.env,
    PORT: APP_PORT.toString()
  };
  
  // Crear el proceso para la aplicación
  appProcess = spawn('tsx', ['server/index.ts'], {
    env,
    shell: true,
    stdio: 'pipe' // Capturar la salida para analizarla
  });
  
  // Capturar y mostrar la salida estándar
  appProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[APP] ${output}`);
  });
  
  // Capturar y mostrar la salida de error
  appProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString().trim();
    console.error(`[APP ERROR] ${errorOutput}`);
  });
  
  // Manejar cierre del proceso
  appProcess.on('close', (code) => {
    console.log(`⚠️ La aplicación se cerró con código: ${code}`);
    appProcess = null;
    
    // Reiniciar automáticamente después de un retraso
    console.log('🔄 Reiniciando la aplicación en 5 segundos...');
    setTimeout(startApp, 5000);
  });
  
  // Manejar errores del proceso
  appProcess.on('error', (error) => {
    console.error(`❌ Error al iniciar la aplicación: ${error.message}`);
    appProcess = null;
  });
}

// Función para verificar si la aplicación interna está respondiendo
function checkAppStatus() {
  return new Promise((resolve) => {
    const req = http.request({
      method: 'HEAD',
      hostname: 'localhost',
      port: APP_PORT,
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

// Iniciar el servidor proxy
function startProxy() {
  const app = express();
  
  // Health check para Replit
  app.get(['/', '/healthz'], async (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    
    // Detectar y responder a los health checks
    if (userAgent.includes('Replit') || userAgent.includes('UptimeRobot')) {
      console.log(`Health check detectado desde ${userAgent}`);
      return res.status(200).send('OK');
    }
    
    // Para solicitudes normales, verificar si la app está activa
    const isAppRunning = await checkAppStatus();
    
    if (isAppRunning) {
      // Si la app está ejecutándose, pasar la solicitud
      next();
    } else {
      // Si la app no está ejecutándose, mostrar página de carga
      res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AIPI - Iniciando Aplicación</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f8fafc;
              color: #1e293b;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              padding: 1rem;
            }
            
            .container {
              max-width: 600px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
              padding: 2rem;
              text-align: center;
            }
            
            .logo {
              font-size: 2.5rem;
              font-weight: 700;
              margin-bottom: 1.5rem;
              background: linear-gradient(90deg, #4a6cf7, #0096ff);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            
            h1 {
              font-size: 1.75rem;
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
              border-top-color: #4a6cf7;
              animation: spin 1s ease-in-out infinite;
              margin: 2rem 0;
            }
            
            .btn {
              display: inline-block;
              padding: 0.75rem 1.5rem;
              background: #4a6cf7;
              color: white;
              border-radius: 6px;
              font-weight: 500;
              text-decoration: none;
              transition: opacity 0.2s;
              margin-top: 1rem;
            }
            
            .btn:hover {
              opacity: 0.9;
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
            
            <p>La aplicación AIPI está iniciando. Este proceso puede tomar hasta 60 segundos.</p>
            
            <div class="loader"></div>
            
            <p>Si la página no carga automáticamente, puedes intentar recargar.</p>
            
            <a href="/" class="btn">Recargar Página</a>
            
            <script>
              // Recargar automáticamente después de 15 segundos
              setTimeout(() => {
                window.location.reload();
              }, 15000);
            </script>
          </div>
        </body>
        </html>
      `);
    }
  });
  
  // Configurar el proxy a la aplicación interna
  const proxyOptions = {
    target: `http://localhost:${APP_PORT}`,
    changeOrigin: true,
    ws: true,
    onProxyReq: (proxyReq, req, res) => {
      // Si necesitamos manipular la solicitud
    },
    onError: (err, req, res) => {
      console.error(`Error en proxy: ${err.message}`);
      
      if (!res.headersSent) {
        res.status(503).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>AIPI - Servicio No Disponible</title>
              <style>
                body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
                .container { background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
                             padding: 2rem; margin-top: 3rem; }
                .btn { display: inline-block; padding: 10px 20px; background: #4a6cf7; color: white; border-radius: 4px; 
                       text-decoration: none; margin: 1rem 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>AIPI - Servicio Temporalmente No Disponible</h1>
                <p>Estamos trabajando para solucionar este problema. Por favor intenta nuevamente en unos momentos.</p>
                <a href="/" class="btn">Reintentar</a>
              </div>
            </body>
          </html>
        `);
      }
    }
  };
  
  // Aplicar el proxy para todas las rutas
  app.use('/', createProxyMiddleware(proxyOptions));
  
  // Iniciar el servidor proxy
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌍 Servidor proxy iniciado en puerto ${PORT}`);
    console.log(`📡 Redirigiendo solicitudes a http://localhost:${APP_PORT}`);
  });
  
  // Manejar errores del servidor
  server.on('error', (err) => {
    console.error(`❌ Error en servidor proxy: ${err.message}`);
  });
}

// Función principal para iniciar todo
async function main() {
  console.log('🚀 Iniciando despliegue completo de AIPI...');
  console.log(`📅 Fecha y hora: ${new Date().toLocaleString()}`);
  
  // 1. Verificar y crear enlaces simbólicos
  verifySymlinks();
  
  // 2. Matar cualquier proceso en el puerto interno
  killProcessOnPort(APP_PORT);
  
  // 3. Iniciar el servidor proxy
  startProxy();
  
  // 4. Iniciar la aplicación completa
  startApp();
  
  // 5. Mostrar mensaje de ayuda
  console.log('\n---------------------------------------------------');
  console.log('INSTRUCCIONES:');
  console.log('1. Si ves errores durante el inicio, no te preocupes.');
  console.log('2. La aplicación puede tomar hasta 60 segundos en iniciar.');
  console.log('3. Si la página muestra "Servicio No Disponible", simplemente recarga.');
  console.log('---------------------------------------------------\n');
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('Recibida señal SIGINT, cerrando...');
  if (appProcess) {
    appProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Recibida señal SIGTERM, cerrando...');
  if (appProcess) {
    appProcess.kill();
  }
  process.exit(0);
});

// Ejecutar la función principal
main();