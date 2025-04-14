/**
 * Servidor de producción simplificado para despliegue
 * Este archivo es un respaldo que se usa cuando el despliegue falla con error 502
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
console.log('Iniciando servidor en modo producción');
app.use(express.static('public'));

// Middleware para todas las solicitudes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Ruta de estado para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor AIPI funcionando correctamente',
    environment: process.env.NODE_ENV || 'development',
    deploymentType: 'backup-server' 
  });
});

// Ruta para la página de inicio
app.get('/', (req, res) => {
  // Intentar servir el index.html
  const indexPath = path.join(__dirname, 'public', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Si no hay index.html, servir una página generada dinámicamente
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AIPI - Servidor de respaldo</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
            background-color: #f5f7fa;
            color: #333;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 30px;
            max-width: 600px;
            width: 100%;
          }
          h1 {
            font-size: 28px;
            margin-bottom: 20px;
            color: #2d3748;
          }
          p {
            margin-bottom: 20px;
            font-size: 16px;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: 500;
            transition: background-color 0.2s;
            margin: 5px;
          }
          .button:hover {
            background-color: #2980b9;
          }
          .status {
            padding: 10px;
            background-color: #e6fffa;
            border-left: 4px solid #4fd1c5;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>AIPI - Plataforma de IA Conversacional</h1>
          
          <div class="status">
            <p>El servidor de respaldo está funcionando correctamente. El sitio principal está en construcción.</p>
          </div>
          
          <p>Este es un servidor de respaldo para el despliegue de AIPI. Estamos completando la compilación de la aplicación principal.</p>
          
          <div>
            <a href="/api/health" class="button">Verificar estado del servidor</a>
            <a href="/" class="button">Refrescar página</a>
          </div>
        </div>
        
        <script>
          // Recargar la página cada 30 segundos para verificar si el sitio principal ya está disponible
          setTimeout(() => {
            window.location.reload();
          }, 30000);
        </script>
      </body>
      </html>
    `);
  }
});

// Catch-all route para cualquier otra ruta
app.get('*', (req, res) => {
  // Para solicitudes API que no existen
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Para cualquier otra ruta, enviar a la ruta principal
  res.redirect('/');
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de respaldo iniciado en http://0.0.0.0:${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
});