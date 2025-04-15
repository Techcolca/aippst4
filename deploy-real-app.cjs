/**
 * Servidor de despliegue optimizado para la app real
 * Resuelve problemas de puertos y sirve la aplicación correctamente
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;
const DEV_PORT = 8000; // Puerto diferente para evitar conflictos

// Configuraciones
let devServerRunning = false;
let devServerPid = null;
let startTime = Date.now();
let serverLogs = [];
let maxLogs = 100;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Función para registrar logs
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, message, type };
  console.log(`[${timestamp}] [${type}] ${message}`);
  serverLogs.unshift(logEntry);
  if (serverLogs.length > maxLogs) {
    serverLogs.pop();
  }
}

// Función para iniciar el servidor de desarrollo
function startDevServer() {
  // Verificar si hay algún proceso usando el puerto 5000 y matarlo
  try {
    log('Verificando si hay procesos usando el puerto 5000...');
    const findProcess = require('find-process');
    findProcess('port', 5000)
      .then((list) => {
        if (list.length > 0) {
          log(`Encontrado proceso ${list[0].pid} usando el puerto 5000, intentando terminarlo...`);
          process.kill(list[0].pid);
          log('Proceso terminado');
        }
      })
      .catch((err) => {
        log(`Error al buscar procesos: ${err.message}`, 'error');
      });
  } catch (e) {
    log('Error al buscar procesos de puerto: ' + e.message, 'error');
  }

  // Asegurarse de que src exista como symlink
  try {
    if (!fs.existsSync('./src')) {
      if (fs.existsSync('./client/src')) {
        fs.symlinkSync('./client/src', './src', 'dir');
        log('Enlace simbólico creado: ./client/src -> ./src');
      } else {
        log('No se encontró el directorio client/src', 'error');
      }
    }
  } catch (error) {
    log(`Error creando enlaces simbólicos: ${error.message}`, 'error');
  }

  log('Iniciando servidor de desarrollo en puerto personalizado...');
  
  // Iniciar el servidor de desarrollo con un puerto personalizado
  const customEnv = { ...process.env, PORT: DEV_PORT.toString() };
  const devServer = spawn('node', ['--require=tsx', 'server/index.ts'], {
    env: customEnv,
    shell: true
  });
  
  devServerPid = devServer.pid;
  log(`Servidor de desarrollo iniciado con PID: ${devServerPid}`);
  
  devServer.stdout.on('data', (data) => {
    const output = data.toString().trim();
    log(`[DEV] ${output}`);
    
    if (output.includes('serving on port')) {
      devServerRunning = true;
      log('Servidor de desarrollo listo para recibir solicitudes');
    }
  });
  
  devServer.stderr.on('data', (data) => {
    const error = data.toString().trim();
    log(`[DEV ERROR] ${error}`, 'error');
  });
  
  devServer.on('close', (code) => {
    log(`Servidor de desarrollo cerrado con código: ${code}`, code === 0 ? 'info' : 'error');
    devServerRunning = false;
    
    // Reinicio automático después de un retraso
    setTimeout(() => {
      log('Reiniciando servidor de desarrollo...');
      startDevServer();
    }, 5000);
  });
}

// Página de carga mientras se inicia el servidor
const loadingHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIPI - Iniciando...</title>
  <style>
    :root {
      --primary: #4a6cf7;
      --background: #f8f9fc;
      --foreground: #24292f;
      --border: #e5e7eb;
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
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
    }
    
    .container {
      width: 100%;
      max-width: 600px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      text-align: center;
    }
    
    .logo {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: var(--primary);
      background: linear-gradient(90deg, #4a6cf7, #0096ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .alert {
      margin: 1.5rem 0;
      padding: 1rem;
      border-radius: 6px;
      background-color: #e6f7ff;
      border-left: 4px solid #1890ff;
      text-align: left;
    }
    
    .alert-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .spinner {
      display: inline-block;
      width: 50px;
      height: 50px;
      border: 3px solid rgba(74, 108, 247, 0.2);
      border-radius: 50%;
      border-top-color: var(--primary);
      animation: spin 1s linear infinite;
      margin: 2rem 0;
    }
    
    .timer {
      margin-top: 1rem;
      font-size: 0.875rem;
      color: #666;
    }
    
    .refresh-button {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.75rem 1.5rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
      text-decoration: none;
    }
    
    .refresh-button:hover {
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
    
    <div class="alert">
      <div class="alert-title">Estado: Inicializando</div>
      <p>La aplicación AIPI está siendo iniciada. Este proceso puede tomar hasta 60 segundos.</p>
    </div>
    
    <div class="spinner"></div>
    
    <p>Por favor espera mientras configuramos todo para ti.</p>
    <p>Si la página no carga automáticamente, puedes hacer clic en el botón de actualizar.</p>
    
    <div class="timer" id="timer">Tiempo transcurrido: 0 segundos</div>
    
    <a href="/" class="refresh-button">Actualizar Página</a>
  </div>
  
  <script>
    // Actualizar temporizador
    const startTime = Date.now();
    setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      document.getElementById('timer').textContent = \`Tiempo transcurrido: \${elapsed} segundos\`;
      
      // Auto-recarga después de 40 segundos
      if (elapsed >= 40) {
        window.location.reload();
      }
    }, 1000);
    
    // Comprobar estado del servidor cada 5 segundos
    function checkServerStatus() {
      fetch('/api/deployment/status')
        .then(res => res.json())
        .then(data => {
          if (data.devServerRunning) {
            window.location.reload();
          } else {
            setTimeout(checkServerStatus, 5000);
          }
        })
        .catch(err => {
          setTimeout(checkServerStatus, 5000);
        });
    }
    
    // Iniciar verificación
    setTimeout(checkServerStatus, 5000);
  </script>
</body>
</html>`;

// Middleware para verificar servidor
app.use((req, res, next) => {
  // Permitir rutas API
  if (req.path.startsWith('/api/deployment')) {
    return next();
  }
  
  // Si el servidor no está listo, mostrar página de carga
  if (!devServerRunning) {
    return res.send(loadingHtml);
  }
  
  // Proxy a la aplicación real
  next();
});

// Endpoints API para el estado del servidor
app.get('/api/deployment/status', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'ok',
    devServerRunning,
    uptime,
    pid: devServerPid,
    startTime: new Date(startTime).toISOString()
  });
});

app.get('/api/deployment/logs', (req, res) => {
  res.json(serverLogs);
});

app.get('/api/deployment/restart', (req, res) => {
  log('Reinicio solicitado desde API');
  
  if (devServerPid) {
    try {
      process.kill(devServerPid);
      log(`Proceso con PID ${devServerPid} terminado`);
    } catch (e) {
      log(`Error al terminar proceso: ${e.message}`, 'error');
    }
  }
  
  devServerRunning = false;
  setTimeout(() => {
    startDevServer();
    res.json({ status: 'restarting' });
  }, 1000);
});

// Proxy a la aplicación de desarrollo
app.use((req, res) => {
  const options = {
    hostname: 'localhost',
    port: DEV_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  proxyReq.on('error', (err) => {
    log(`Error en proxy: ${err.message}`, 'error');
    
    if (!res.headersSent) {
      res.status(502).send(`
        <html>
          <head>
            <title>Error de Conexión</title>
            <style>
              body { font-family: -apple-system, system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .error { background: #fff2f0; border-left: 4px solid #ff4d4f; padding: 16px; margin: 16px 0; }
              .btn { display: inline-block; padding: 8px 16px; background: #4a6cf7; color: white; border-radius: 4px; 
                     text-decoration: none; margin-right: 10px; }
            </style>
          </head>
          <body>
            <h1>Error de Conexión</h1>
            <div class="error">
              <p><strong>No se pudo conectar con la aplicación.</strong></p>
              <p>Error: ${err.message}</p>
            </div>
            <p>La aplicación puede estar iniciándose o experimentando un problema temporal.</p>
            <a href="/" class="btn">Volver al inicio</a>
            <a href="/api/deployment/restart" class="btn">Reiniciar Servidor</a>
            <a href="/api/deployment/logs" class="btn">Ver Logs</a>
          </body>
        </html>
      `);
    }
  });
  
  if (req.body) {
    proxyReq.write(JSON.stringify(req.body));
  }
  
  req.pipe(proxyReq, { end: true });
});

// Iniciar servidor
try {
  // Instalar find-process si no está instalado
  if (!fs.existsSync('./node_modules/find-process')) {
    log('Instalando dependencia find-process...');
    require('child_process').execSync('npm install find-process', { stdio: 'inherit' });
    log('Dependencia find-process instalada');
  }

  // Iniciar servidor
  const server = app.listen(PORT, '0.0.0.0', () => {
    log(`Servidor de despliegue iniciado en puerto ${PORT}`);
    startDevServer();
  });
  
  // Manejar señales de terminación
  process.on('SIGTERM', () => {
    log('Recibida señal SIGTERM, cerrando servidor...');
    server.close(() => {
      log('Servidor HTTP cerrado');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    log('Recibida señal SIGINT, cerrando servidor...');
    server.close(() => {
      log('Servidor HTTP cerrado');
      process.exit(0);
    });
  });
} catch (error) {
  log(`Error al iniciar servidor: ${error.message}`, 'error');
}