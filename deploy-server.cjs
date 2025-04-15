/**
 * Servidor de producción para la aplicación completa
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Variables para el seguimiento de errores
let startTime = Date.now();
let serverErrors = [];

// Middleware para logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware para CORS y headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    return res.status(200).json({});
  }
  next();
});

// Middleware para JSON y urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.use(express.static(path.join(__dirname, 'dist', 'client')));

// Rutas de diagnóstico
app.get('/api/health', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'ok',
    version: '1.0.0',
    uptime: `${uptime} segundos`,
    serverTime: new Date().toISOString(),
    errors: serverErrors.slice(-10) // Últimos 10 errores
  });
});

app.get('/api/debug', (req, res) => {
  // Información de depuración
  const dirs = {
    cwd: process.cwd(),
    dirname: __dirname,
    exists: {
      'client/dist/index.html': fs.existsSync(path.join(__dirname, 'client', 'dist', 'index.html')),
      'dist/client/index.html': fs.existsSync(path.join(__dirname, 'dist', 'client', 'index.html')),
      'client/src': fs.existsSync(path.join(__dirname, 'client', 'src')),
      'src': fs.existsSync(path.join(__dirname, 'src')),
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT
    }
  };
  
  res.json(dirs);
});

// Endpoint de redirección para la SPA
app.get('/login', (req, res) => {
  res.redirect('/');
});

app.get('/dashboard*', (req, res) => {
  res.redirect('/');
});

// Ruta catch-all para SPA
app.get('*', (req, res) => {
  // Evitar rutas de API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Buscar el archivo index.html en varias ubicaciones posibles
  const possiblePaths = [
    path.join(__dirname, 'client', 'dist', 'index.html'),
    path.join(__dirname, 'dist', 'client', 'index.html'),
    path.join(__dirname, 'public', 'index.html')
  ];
  
  // Usar el primer archivo que exista
  for (const indexPath of possiblePaths) {
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // Si no se encuentra ningún archivo, servir un HTML básico
  const fallbackHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIPI - Plataforma de IA Conversacional</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #4a6cf7; }
    .banner { background-color: #e6f7ff; border-left: 4px solid #1890ff; padding: 15px; margin: 20px 0; }
    .btn { display: inline-block; background: linear-gradient(90deg, #4a6cf7, #0096ff); color: white; padding: 10px 20px; 
           border-radius: 5px; text-decoration: none; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>AIPI - Plataforma de IA Conversacional</h1>
  
  <div class="banner">
    <p><strong>Estado:</strong> Configurando aplicación</p>
    <p>Estamos preparando tu aplicación. Por favor recarga la página en unos segundos.</p>
  </div>
  
  <p>La aplicación AIPI está siendo inicializada. Si continúas viendo esta página después de varios intentos,
  verifica la configuración del despliegue.</p>
  
  <a href="/" class="btn">Recargar Aplicación</a>
</body>
</html>`;
  
  res.send(fallbackHtml);
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error en servidor:', err);
  serverErrors.push({
    time: new Date().toISOString(),
    message: err.message,
    stack: err.stack
  });
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de producción iniciado en http://0.0.0.0:${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log('Directorios disponibles:', fs.readdirSync('.').join(', '));
  
  // Intentar hacer build si es necesario
  try {
    if (!fs.existsSync('./client/dist') && !fs.existsSync('./dist/client')) {
      console.log('No se encontró el directorio de build, generando...');
      execSync('cd client && npm run build');
      console.log('Build completado exitosamente');
    }
  } catch (error) {
    console.error('Error al generar build:', error.message);
    serverErrors.push({
      time: new Date().toISOString(),
      message: 'Error al generar build',
      details: error.message
    });
  }
});
