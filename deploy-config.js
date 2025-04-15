/**
 * Configuración específica para el despliegue de AIPI
 * Este archivo asegura que la aplicación desplegada sea la misma que la versión de desarrollo
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando despliegue de AIPI...');

// Verificar que estamos utilizando el punto de entrada correcto
try {
  // Asegurarse de que se está usando el servidor correcto
  if (fs.existsSync('./dist/index.js')) {
    const indexContent = fs.readFileSync('./dist/index.js', 'utf-8');
    
    // Si el contenido no corresponde a nuestra aplicación AIPI, corregirlo
    if (!indexContent.includes('server/index.ts') && !indexContent.includes('setupVite')) {
      console.log('⚠️ Corrigiendo punto de entrada para AIPI...');
      
      // Crear un index.js que use específicamente nuestra aplicación
      const correctIndexContent = `// Punto de entrada correcto para AIPI
import { createServer } from 'http';
import express from 'express';
import fs from 'fs';
import path from 'path';

// Configuración básica
const app = express();
const PORT = process.env.PORT || 3000;

// Primero intentar cargar la aplicación desde su ubicación normal de compilación
let appModule;
try {
  appModule = await import('./server/index.js');
  console.log('✅ Aplicación AIPI cargada correctamente desde ./server/index.js');
} catch (e) {
  console.error('⚠️ Error al cargar ./server/index.js:', e);
  
  // Intentar cargar desde posibles ubicaciones alternativas
  try {
    appModule = await import('../server/index.js');
    console.log('✅ Aplicación AIPI cargada desde ../server/index.js');
  } catch (err) {
    console.error('⚠️ Error al cargar alternativas. Iniciando servidor mínimo de respaldo.');
    
    // Servir al menos los archivos estáticos si están disponibles
    if (fs.existsSync(path.join(process.cwd(), 'dist', 'client'))) {
      app.use(express.static(path.join(process.cwd(), 'dist', 'client')));
    }
    
    if (fs.existsSync(path.join(process.cwd(), 'public'))) {
      app.use(express.static(path.join(process.cwd(), 'public')));
    }
    
    // Redireccionar a la página de error
    app.get('*', (req, res) => {
      res.status(500).send(\`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AIPI - Error de Inicio</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
              .error-container { background-color: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 2rem; margin-top: 3rem; }
              h1 { color: #e63946; }
              .actions { margin-top: 2rem; }
              .button { display: inline-block; background: #457b9d; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; margin: 5px; }
            </style>
          </head>
          <body>
            <div class="error-container">
              <h1>Error al iniciar AIPI</h1>
              <p>No se pudo cargar la aplicación correctamente. Por favor contacte al administrador del sistema.</p>
              <div class="actions">
                <a href="/" class="button">Intentar nuevamente</a>
              </div>
            </div>
          </body>
        </html>
      \`);
    });
    
    // Iniciar servidor de respaldo
    const httpServer = createServer(app);
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(\`🔄 Servidor de respaldo iniciado en puerto \${PORT}\`);
    });
  }
}`;
      
      fs.writeFileSync('./dist/index.js', correctIndexContent);
      console.log('✅ Punto de entrada corregido correctamente');
    }
  }
  
  // Verificar los archivos estáticos
  if (!fs.existsSync('./dist/client') && fs.existsSync('./client/dist')) {
    console.log('⚠️ Corrigiendo ubicación de archivos estáticos...');
    // Copiar archivos estáticos a la ubicación correcta
    fs.cpSync('./client/dist', './dist/client', { recursive: true });
    console.log('✅ Archivos estáticos copiados correctamente');
  }
  
  console.log('✅ Configuración de despliegue completada con éxito');
} catch (error) {
  console.error('❌ Error en la configuración de despliegue:', error);
}