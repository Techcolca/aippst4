/**
 * Script simplificado para iniciar la aplicación
 */
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando aplicación AIPI en modo simplificado...');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos si existen las carpetas

if (fs.existsSync(path.join(__dirname, 'public'))) {
  app.use(express.static(path.join(__dirname, 'public')));
}

if (fs.existsSync(path.join(__dirname, 'dist', 'client'))) {
  app.use(express.static(path.join(__dirname, 'dist', 'client')));
}

// Ruta de API básica
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'El servidor está funcionando en modo simplificado' });
});

// Punto de entrada de la aplicación
app.get('*', (req, res) => {
  if (fs.existsSync(path.join(__dirname, 'dist', 'client', 'index.html'))) {
    res.sendFile(path.join(__dirname, 'dist', 'client', 'index.html'));
  } else {
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AIPI - Servidor Simplificado</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
          .container { background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 2rem; margin-top: 3rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>AIPI - Servidor en modo simplificado</h1>
          <p>El servidor está funcionando en modo básico.</p>
          <p>API de health check disponible en: <code>/api/health</code></p>
        </div>
      </body>
      </html>
    `);
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌍 Servidor simplificado iniciado en puerto ${PORT}`);
});