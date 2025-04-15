/**
 * Servidor proxy para despliegue - Conecta con la aplicación real
 * Este servidor reenvía todas las solicitudes a tu aplicación de desarrollo
 */
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;
const DEV_PORT = 5000; // Puerto donde se ejecuta el servidor de desarrollo

// Estado del servidor de desarrollo
let devServerRunning = false;
let devServerProcess = null;
let startupTime = Date.now();

// Iniciar el servidor de desarrollo en un proceso separado
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
    shell: true,
    env: { ...process.env, PORT: DEV_PORT.toString() }
  });
  
  // Capturar salida del servidor de desarrollo
  devServerProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[DEV] ${output}`);
    
    // Marcar como en ejecución cuando detectemos que está listo
    if (output.includes('serving on port')) {
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

// Página de carga mientras el servidor de desarrollo arranca
const loadingPage = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIPI - Inicializando aplicación</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f7fa;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .container {
      max-width: 600px;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
      text-align: center;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      background: linear-gradient(90deg, #4a6cf7, #0096ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .spinner {
      margin: 2rem auto;
      width: 50px;
      height: 50px;
      border: 5px solid rgba(74, 108, 247, 0.2);
      border-radius: 50%;
      border-top-color: #4a6cf7;
      animation: spin 1s ease-in-out infinite;
    }
    .status {
      margin-bottom: 1rem;
      padding: 1rem;
      background-color: #e6f7ff;
      border-radius: 4px;
      border-left: 4px solid #1890ff;
    }
    .timer {
      font-size: 0.875rem;
      color: #666;
      margin-top: 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>AIPI - Plataforma de IA Conversacional</h1>
    
    <div class="status">
      <p><strong>Estado:</strong> Iniciando aplicación</p>
      <p>Por favor espera mientras se carga la aplicación. Este proceso puede tomar hasta 30 segundos.</p>
    </div>
    
    <div class="spinner"></div>
    
    <p>La aplicación AIPI se está iniciando. Se requiere un poco de paciencia para el primer inicio.</p>
    
    <div class="timer" id="timer">Tiempo transcurrido: 0 segundos</div>
  </div>

  <script>
    // Mostrar temporizador
    let startTime = Date.now();
    setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      document.getElementById('timer').textContent = \`Tiempo transcurrido: \${elapsed} segundos\`;
    }, 1000);
    
    // Comprobar si el servidor está listo periodicamente
    function checkServerStatus() {
      fetch('/api/health')
        .then(response => response.json())
        .then(data => {
          if (data.devServerRunning) {
            window.location.reload();
          } else {
            setTimeout(checkServerStatus, 2000);
          }
        })
        .catch(() => {
          setTimeout(checkServerStatus, 2000);
        });
    }
    
    // Iniciar comprobación después de 5 segundos
    setTimeout(checkServerStatus, 5000);
  </script>
</body>
</html>`;

// Middleware para verificar si el servidor de desarrollo está funcionando
app.use((req, res, next) => {
  // Si es una solicitud a la API de salud, permitir continuar
  if (req.path === '/api/health') {
    return next();
  }
  
  // Si el servidor no está funcionando, mostrar página de carga
  if (!devServerRunning) {
    return res.send(loadingPage);
  }
  
  // Sino, continuar con el proxy
  next();
});

// Ruta de salud para verificar el estado
app.get('/api/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startupTime) / 1000);
  res.json({
    status: 'ok',
    devServerRunning,
    uptime: uptimeSeconds,
    startTime: new Date(startupTime).toISOString(),
    currentTime: new Date().toISOString()
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

// Configurar el proxy que redirige todas las solicitudes al servidor de desarrollo
app.use('/', createProxyMiddleware({
  target: `http://localhost:${DEV_PORT}`,
  changeOrigin: true,
  ws: true, // permitir websockets
  onProxyReq: (proxyReq, req, res) => {
    // Modificar la solicitud antes de enviarla al servidor objetivo
    proxyReq.setHeader('X-Forwarded-Proto', 'https');
  },
  onError: (err, req, res) => {
    // Manejar errores de proxy
    console.error('Error de proxy:', err);
    
    if (!res.headersSent) {
      res.status(502).send(`
        <html>
          <head>
            <title>Error de conexión</title>
            <style>
              body {
                font-family: -apple-system, system-ui, sans-serif;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
              }
              .error-container {
                padding: 20px;
                background-color: #fff5f5;
                border-left: 4px solid #ff4d4f;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <h1>Error de conexión</h1>
            <div class="error-container">
              <p>No se pudo conectar con el servidor de aplicación.</p>
              <p>Mensaje: ${err.message}</p>
            </div>
            <p>La aplicación puede estar iniciándose. Intenta recargar la página en unos segundos.</p>
            <button onclick="window.location.reload()">Recargar página</button>
            <a href="/api/restart-dev">Reiniciar servidor</a>
          </body>
        </html>
      `);
    }
  }
}));

// Iniciar el servidor proxy
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor proxy de despliegue iniciado en http://0.0.0.0:${PORT}`);
  console.log(`Redirigiendo solicitudes a http://localhost:${DEV_PORT}`);
  
  // Iniciar el servidor de desarrollo
  startDevServer();
});