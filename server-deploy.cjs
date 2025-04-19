/**
 * Servidor simplificado para despliegue en Replit
 * Este script evita usar TSX y se basa en la versión compilada
 * para evitar problemas de compatibilidad.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configuración
const PORT = process.env.PORT || 8080;
let server = null;

console.log('🚀 AIPI - Servidor de despliegue simplificado');
console.log(`⏱️ Iniciado: ${new Date().toISOString()}`);
console.log(`📊 Puerto asignado: ${PORT}`);

// Crear la aplicación Express
const app = express();

// Configurar health checks
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

// Página de carga para cuando la API no está disponible
app.get('/api/*', (req, res) => {
  res.status(503).json({
    error: 'Servicio temporalmente no disponible',
    message: 'El servidor está iniciando. Por favor, inténtelo de nuevo en unos momentos.'
  });
});

// Servir el frontend para todas las demás rutas
app.get('*', (req, res) => {
  // Buscar el archivo index.html
  let indexPath = null;
  for (const staticPath of staticPaths) {
    const possibleIndexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(possibleIndexPath)) {
      indexPath = possibleIndexPath;
      break;
    }
  }

  if (indexPath) {
    res.sendFile(indexPath);
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
});

// Iniciar el servidor
server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor iniciado en puerto ${PORT}`);
});

// Manejar señales de cierre
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  
  if (server) {
    server.close(() => {
      console.log('✅ Servidor cerrado correctamente');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});