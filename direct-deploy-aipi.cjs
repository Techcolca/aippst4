/**
 * Script para desplegar AIPI (versión directa)
 * Este script intenta lanzar directamente la aplicación AIPI 
 * para garantizar que el despliegue muestre la aplicación correcta
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('⭐ AIPI - Sistema de despliegue directo');
console.log(`Fecha: ${new Date().toISOString()}`);

// Configuración básica
const PORT = process.env.PORT || 3000;
let SERVER_PROCESS = null;

// Crear servidor Express
const app = express();

// Paso 1: Identificar archivos y rutas importantes
const rootDir = process.cwd();
console.log(`📂 Directorio raíz: ${rootDir}`);

// Lista de posibles ubicaciones del servidor principal
const serverLocations = [
  path.join(rootDir, 'server/index.js'),
  path.join(rootDir, 'server/index.ts'),
  path.join(rootDir, 'dist/server/index.js')
];

// Lista de posibles ubicaciones de los archivos estáticos
const staticLocations = [
  path.join(rootDir, 'dist/client'),
  path.join(rootDir, 'client/dist'),
  path.join(rootDir, 'public')
];

// Paso 2: Verificar que podemos encontrar los archivos importantes
let foundServerFile = null;
for (const location of serverLocations) {
  if (fs.existsSync(location)) {
    foundServerFile = location;
    console.log(`✅ Encontrado archivo del servidor: ${location}`);
    break;
  }
}

let foundStaticDir = null;
for (const location of staticLocations) {
  if (fs.existsSync(location)) {
    foundStaticDir = location;
    console.log(`✅ Encontrado directorio estático: ${location}`);
    break;
  }
}

// Paso 3: Servir archivos estáticos si los encontramos
if (foundStaticDir) {
  app.use(express.static(foundStaticDir));
  console.log(`📄 Sirviendo archivos estáticos desde: ${foundStaticDir}`);
}

// Paso 4: Iniciar servidor HTTP principal
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor HTTP iniciado en puerto ${PORT}`);
  
  // Si estamos en un despliegue, preparar la configuración para desarrollo
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    process.env.NODE_ENV = 'development';
    console.log('🔧 Modo de desarrollo activado para compatibilidad con despliegue');
  }
  
  // Intentar iniciar el servidor de la aplicación
  try {
    if (foundServerFile) {
      console.log(`🔄 Iniciando aplicación AIPI desde: ${foundServerFile}`);
      
      // Cargar directamente el módulo del servidor
      require(foundServerFile);
    } else {
      console.log(`⚠️ No se encontró el archivo del servidor. Sirviendo solo archivos estáticos.`);
      
      // Crear una página básica HTML para mostrar si no encontramos la aplicación
      app.get('*', (req, res) => {
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>AIPI - Plataforma de IA Conversacional</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; background-color: #f9fafe; }
                .container { background-color: white; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); padding: 2.5rem; margin-top: 4rem; }
                h1 { font-size: 2rem; font-weight: 700; color: #1a1a1a; }
                .gradient-text { background: linear-gradient(to right, #4a6cf7, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>AIPI <span class="gradient-text">Plataforma de IA Conversacional</span></h1>
                <p>Error al cargar la aplicación. Por favor contacte al administrador.</p>
              </div>
            </body>
          </html>
        `);
      });
    }
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
  }
});

// Manejar señales de cierre
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  if (SERVER_PROCESS) {
    SERVER_PROCESS.kill('SIGTERM');
  }
  process.exit(0);
});