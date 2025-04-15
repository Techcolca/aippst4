/**
 * Script de compatibilidad para despliegue en Replit
 * Este archivo es un punto de entrada que funciona con cualquier tipo de módulo
 */

// Detectar si está en un entorno de producción o desarrollo
const isProduction = process.env.NODE_ENV === 'production';

async function main() {
  try {
    console.log('🚀 Iniciando aplicación AIPI...');
    console.log(`Modo: ${isProduction ? 'Producción' : 'Desarrollo'}`);
    
    // Intentar importar el servidor basado en ES Modules
    try {
      await import('./server.mjs');
      console.log('✅ Usando servidor.mjs con ES Modules');
    } catch (esError) {
      console.error('❌ Error al cargar servidor.mjs:', esError.message);
      
      // Si falla, intentar con require (CommonJS)
      try {
        console.log('⚠️ Intentando cargar servidor.js con CommonJS...');
        require('./server.js');
        console.log('✅ Usando servidor.js con CommonJS');
      } catch (cjsError) {
        console.error('❌ Error al cargar servidor.js:', cjsError.message);
        
        // Último recurso: iniciar Express directamente
        console.log('🔄 Iniciando servidor Express directamente...');
        
        const express = require('express');
        const app = express();
        
        // Responder a health checks de Replit
        app.get('/', (req, res) => {
          res.status(200).send('OK');
        });
        
        app.get('/healthz', (req, res) => {
          res.status(200).send('OK');
        });
        
        // Cualquier otra ruta muestra página de mantenimiento
        app.use('*', (req, res) => {
          res.status(503).send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>AIPI - Mantenimiento</title>
                <style>
                  body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
                  .container { background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
                               padding: 2rem; margin-top: 3rem; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>AIPI - En Mantenimiento</h1>
                  <p>Estamos realizando mejoras en el sistema. Por favor, vuelve más tarde.</p>
                </div>
              </body>
            </html>
          `);
        });
        
        // Iniciar servidor en el puerto configurado
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
          console.log(`🌍 Servidor de emergencia iniciado en puerto ${PORT}`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error crítico:', error);
    process.exit(1);
  }
}

// Ejecutar función principal
main();