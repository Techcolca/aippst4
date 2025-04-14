/**
 * Servidor ultra simple para resolver el error 502
 * Este archivo usa CommonJS para máxima compatibilidad
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
console.log('Iniciando servidor ultra-simple para resolver error 502');
app.use(express.static('public'));

// Ruta de estado para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor AIPI (modo simple) funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta para raíz
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>AIPI - Servidor de Emergencia</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #4a6cf7; }
        .container { border: 1px solid #ddd; padding: 20px; border-radius: 5px; margin-top: 20px; }
        .status { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4a6cf7; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>AIPI - Servidor de Emergencia</h1>
      
      <div class="status">
        <p><strong>Estado:</strong> Servidor básico funcionando correctamente</p>
        <p>Este es un servidor temporal para solucionar el error 502.</p>
      </div>
      
      <div class="container">
        <h2>Instrucciones para completar el despliegue:</h2>
        <ol>
          <li>Este servidor simple demuestra que la aplicación puede ejecutarse sin errores 502</li>
          <li>Para completar el despliegue, cambia la configuración:</li>
          <ul>
            <li>Comando de inicio: <code>node server-simple.cjs</code></li>
          </ul>
          <li>Una vez que este servidor funcione correctamente, puedes volver al comando normal</li>
        </ol>
      </div>
      
      <p>Timestamp: ${new Date().toISOString()}</p>
    </body>
    </html>
  `);
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de emergencia iniciado en http://0.0.0.0:${PORT}`);
});