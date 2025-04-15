/**
 * Servidor final de producción optimizado para despliegue en Replit
 * Este servidor no requiere build previo y usa directamente el servidor de desarrollo
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Estado del servidor de desarrollo interno
let devServerRunning = false;
let devServerProcess = null;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    return res.status(200).json({});
  }
  next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar servidor de desarrollo en un proceso separado
function startDevServer() {
  if (devServerRunning) return;
  
  console.log('🚀 Iniciando servidor de desarrollo interno...');
  
  // Crear enlaces simbólicos necesarios si no existen
  try {
    if (!fs.existsSync('./src') && fs.existsSync('./client/src')) {
      fs.symlinkSync('./client/src', './src', 'dir');
      console.log('✅ Enlace simbólico creado: ./client/src -> ./src');
    }
  } catch (error) {
    console.error('❌ Error creando enlaces simbólicos:', error.message);
  }
  
  // Iniciar el servidor de desarrollo
  devServerProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });
  
  // Capturar salida del servidor de desarrollo
  devServerProcess.stdout.on('data', (data) => {
    console.log(`[DEV] ${data.toString().trim()}`);
    // Marcar como en ejecución cuando detectemos que está listo
    if (data.toString().includes('serving on port')) {
      devServerRunning = true;
      console.log('✅ Servidor de desarrollo interno iniciado correctamente');
    }
  });
  
  devServerProcess.stderr.on('data', (data) => {
    console.error(`[DEV ERROR] ${data.toString().trim()}`);
  });
  
  devServerProcess.on('close', (code) => {
    console.log(`❌ Servidor de desarrollo interno cerrado con código ${code}`);
    devServerRunning = false;
    
    // Reiniciar automáticamente después de un retraso
    setTimeout(() => {
      console.log('🔄 Reiniciando servidor de desarrollo interno...');
      startDevServer();
    }, 5000);
  });
}

// Ruta de salud para verificar el estado
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    devServerRunning,
    mode: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// Ruta para reiniciar el servidor de desarrollo
app.get('/api/restart-dev', (req, res) => {
  if (devServerProcess) {
    devServerProcess.kill();
    devServerRunning = false;
    console.log('🔄 Reiniciando servidor de desarrollo por solicitud...');
  }
  
  setTimeout(() => {
    startDevServer();
    res.json({ status: 'restarting' });
  }, 1000);
});

// Proxy para las solicitudes a la API
app.all('/api/*', (req, res) => {
  if (!devServerRunning) {
    return res.status(503).json({
      error: 'Servidor de desarrollo no disponible',
      message: 'Intenta recargar la página en unos segundos'
    });
  }
  
  // Proxy simple a la API del servidor de desarrollo en el puerto 5000
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:5000'
    }
  };
  
  const http = require('http');
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  req.pipe(proxy, { end: true });
  
  proxy.on('error', (err) => {
    console.error('Error en proxy:', err);
    res.status(500).json({ error: 'Error interno al procesar la solicitud' });
  });
});

// Para páginas de la SPA, servir la página principal de Vite (en desarrollo)
app.get('*', (req, res) => {
  if (!devServerRunning) {
    // Página de espera mientras el servidor de desarrollo arranca
    return res.send(`<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AIPI - Inicializando...</title>
      <style>
        body { font-family: -apple-system, system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #4a6cf7; }
        .banner { background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 15px; margin: 20px 0; }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #4a6cf7; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px 0; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <h1>AIPI - Plataforma de IA Conversacional</h1>
      
      <div class="banner">
        <p><strong>Estado:</strong> Inicializando aplicación</p>
        <p>Por favor espera mientras la aplicación se inicia. Esta página se actualizará automáticamente.</p>
      </div>
      
      <div class="loader"></div>
      
      <p>La aplicación AIPI está siendo inicializada. Esto puede tomar hasta 30 segundos la primera vez.</p>
      
      <script>
        // Comprobar estado del servidor cada 3 segundos
        function checkStatus() {
          fetch('/api/health')
            .then(res => res.json())
            .then(data => {
              if (data.devServerRunning) {
                window.location.reload();
              }
            })
            .catch(err => console.error('Error al verificar estado:', err));
        }
        
        // Comprobar inicialmente después de 5 segundos y luego cada 3 segundos
        setTimeout(() => {
          checkStatus();
          setInterval(checkStatus, 3000);
        }, 5000);
      </script>
    </body>
    </html>`);
  }
  
  // Proxy a Vite en desarrollo (puerto 5173)
  const options = {
    hostname: 'localhost',
    port: 5173,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: 'localhost:5173'
    }
  };
  
  const http = require('http');
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  proxy.on('error', (err) => {
    console.error('Error en proxy Vite:', err);
    res.status(500).send(`
      <html>
        <head><title>Error de conexión</title></head>
        <body>
          <h1>Error de conexión al servidor de desarrollo</h1>
          <p>No se pudo conectar al servidor de desarrollo en el puerto 5173.</p>
          <p>Error: ${err.message}</p>
          <a href="/">Intentar nuevamente</a>
        </body>
      </html>
    `);
  });
  
  req.pipe(proxy, { end: true });
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de despliegue iniciado en http://0.0.0.0:${PORT}`);
  
  // Iniciar el servidor de desarrollo
  startDevServer();
});