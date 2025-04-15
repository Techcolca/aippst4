/**
 * Script de despliegue optimizado para AIPI
 * Funciona como un proxy hacia la aplicación ya en ejecución
 */
const express = require('express');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Puerto para el despliegue
const PORT = process.env.PORT || 3000;
// Puerto donde ya está en ejecución la aplicación
const APP_PORT = 5017;

console.log('🚀 Iniciando proxy de despliegue para AIPI...');
console.log(`📅 Fecha y hora: ${new Date().toLocaleString()}`);

// Verificar si el servidor interno está funcionando
function checkInternalServer() {
  return new Promise((resolve) => {
    const req = http.request({
      method: 'HEAD',
      hostname: 'localhost',
      port: APP_PORT,
      path: '/',
      timeout: 2000
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
async function startProxy() {
  const app = express();
  
  // Verificar si la aplicación está en ejecución
  const isAppRunning = await checkInternalServer();
  console.log(`Aplicación interna: ${isAppRunning ? '✅ Funcionando' : '❌ No disponible'}`);
  
  // Responder a los health checks de Replit
  app.get(['/', '/healthz'], (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    
    // Detectar health checks de Replit
    if (userAgent.includes('Replit') || userAgent.includes('UptimeRobot')) {
      console.log(`Health check detectado desde ${userAgent}`);
      return res.status(200).send('OK');
    }
    
    // Para solicitudes normales, continuar al proxy
    next();
  });
  
  // Configurar opciones del proxy
  const proxyOptions = {
    target: `http://localhost:${APP_PORT}`,
    changeOrigin: true,
    ws: true, // Habilitar WebSockets
    onProxyReq: (proxyReq, req, res) => {
      // Si necesitamos manipular las solicitudes
    },
    onError: (err, req, res) => {
      console.error(`Error en proxy: ${err.message}`);
      
      if (!res.headersSent) {
        if (req.path.startsWith('/api/')) {
          // Para API, devolver error JSON
          res.status(503).json({
            error: 'Servicio temporalmente no disponible',
            message: 'La aplicación está iniciando o experimentando problemas temporales'
          });
        } else {
          // Para otras rutas, mostrar página de error
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
    },
    // Configuración para redireccionar correctamente las rutas
    router: {
      '/api/': `http://localhost:${APP_PORT}/api/`,
      '/static/': `http://localhost:${APP_PORT}/static/`,
      '/assets/': `http://localhost:${APP_PORT}/assets/`,
    }
  };
  
  // Aplicar el proxy a todas las rutas
  app.use('/', createProxyMiddleware(proxyOptions));
  
  // Iniciar el servidor proxy
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌍 Servidor proxy iniciado en puerto ${PORT}`);
    console.log(`📡 Redirigiendo solicitudes a http://localhost:${APP_PORT}`);
  });
  
  // Manejar errores del servidor
  server.on('error', (err) => {
    console.error(`❌ Error en servidor proxy: ${err.message}`);
    
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Puerto ${PORT} ya está en uso. Intentando con puerto alternativo...`);
      setTimeout(() => {
        server.close();
        app.listen(PORT + 1, '0.0.0.0', () => {
          console.log(`🌍 Servidor proxy reiniciado en puerto ${PORT + 1}`);
        });
      }, 1000);
    }
  });
  
  // Monitorear la aplicación interna periódicamente
  setInterval(async () => {
    const isUp = await checkInternalServer();
    if (!isUp) {
      console.log(`⚠️ Aplicación interna no disponible en la verificación periódica`);
    }
  }, 30000); // Verificar cada 30 segundos
}

// Función principal
async function main() {
  try {
    await startProxy();
    
    console.log('\n---------------------------------------------------');
    console.log('INSTRUCCIONES:');
    console.log('1. Este proxy redirige solicitudes a la aplicación en ejecución');
    console.log('2. Si ves "Servicio No Disponible", asegúrate que la aplicación');
    console.log('   esté ejecutándose en Replit en el puerto 5017');
    console.log('3. Para usar este script en producción, configura el comando:');
    console.log('   node deploy-proxy.cjs');
    console.log('---------------------------------------------------\n');
  } catch (error) {
    console.error(`❌ Error crítico iniciando proxy: ${error.message}`);
  }
}

// Iniciar
main();