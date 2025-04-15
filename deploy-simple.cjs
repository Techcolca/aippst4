/**
 * Despliegue simplificado para AIPI
 * Este script ejecuta exactamente la misma configuración que tienes en Replit
 */
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Puerto para el despliegue
const PORT = process.env.PORT || 3000;

console.log('🚀 Iniciando despliegue de AIPI...');

// Verificar enlaces simbólicos necesarios
if (!fs.existsSync('./src') && fs.existsSync('./client/src')) {
  try {
    fs.symlinkSync('./client/src', './src', 'dir');
    console.log('✅ Enlace simbólico creado: ./client/src -> ./src');
  } catch (e) {
    console.log('⚠️ No se pudo crear enlace simbólico automáticamente');
  }
}

// Función para iniciar la aplicación exactamente como en desarrollo
function startApp() {
  const app = express();
  
  // Configurar proxy para redirigir todo al servidor de desarrollo
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    ws: true,
    onProxyReq: (proxyReq, req, res) => {
      // Puedes agregar encabezados personalizados si es necesario
    },
    onError: (err, req, res) => {
      console.error('Error al conectar con servidor:', err.message);
      
      if (!res.headersSent) {
        res.status(502).send(`
          <html>
            <head>
              <title>AIPI - Iniciando Aplicación</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
                .container { background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 2rem; margin-top: 3rem; }
                .loader { display: inline-block; width: 50px; height: 50px; border: 4px solid rgba(74, 108, 247, 0.2); 
                          border-radius: 50%; border-top-color: #4a6cf7; animation: spin 1s linear infinite; margin: 2rem 0; }
                .btn { display: inline-block; padding: 10px 20px; background: #4a6cf7; color: white; border-radius: 4px; 
                       text-decoration: none; margin: 1rem 0; }
                @keyframes spin { to { transform: rotate(360deg); } }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>AIPI</h1>
                <p>La aplicación se está iniciando. Por favor espera unos momentos...</p>
                <div class="loader"></div>
                <p>Si la página no carga automáticamente después de unos segundos, intenta recargar.</p>
                <a href="/" class="btn">Recargar Página</a>
              </div>
              <script>
                // Recargar automáticamente después de 10 segundos
                setTimeout(() => { window.location.reload(); }, 10000);
              </script>
            </body>
          </html>
        `);
      }
    }
  }));
  
  // Iniciar el servidor proxy
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌍 Servidor proxy iniciado en puerto ${PORT}`);
    console.log(`📡 Redirigiendo solicitudes a http://localhost:5000`);
  });
}

// Iniciar la aplicación
startApp();