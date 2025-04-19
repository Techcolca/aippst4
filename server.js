import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import fs from 'fs';

// Configuración básica
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración para servir archivos estáticos desde client/dist si existe
const clientDistPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Verificar conexión a la base de datos
async function checkDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL no está configurado");
    return false;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✅ Conexión a la base de datos establecida correctamente!`);
    console.log(`🕒 Hora del servidor de base de datos: ${result.rows[0].now}`);
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error(`❌ Error conectando con la base de datos: ${error.message}`);
    return false;
  }
}

// Rutas para la API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    serverVersion: '1.0.0',
    serverType: 'Express Fallback Server'
  });
});

// Ruta de fallback para SPA (Single Page Application)
app.get('*', (req, res) => {
  // Verificar si estamos sirviendo una SPA
  if (fs.existsSync(path.join(clientDistPath, 'index.html'))) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  } else {
    res.send(`
      <html>
        <head>
          <title>AIPI Platform</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              background-color: #f4f7f9;
            }
            h1 { color: #3B82F6; }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .status { 
              display: inline-block;
              background-color: #10B981;
              color: white;
              padding: 5px 10px;
              border-radius: 20px;
              font-size: 14px;
            }
            code {
              background-color: #f1f1f1;
              padding: 2px 5px;
              border-radius: 4px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>AIPI Platform</h1>
            <p class="status">Servidor en ejecución</p>
            <p>El servidor simplificado está funcionando correctamente.</p>
            <p>Versión: 1.0.0</p>
            <p>Para ver el estado del servidor: <code>/api/status</code></p>
          </div>
        </body>
      </html>
    `);
  }
});

// Iniciar servidor
console.log("🚀 Iniciando servidor AIPI...");

// Verificar conexión a la base de datos antes de iniciar el servidor
checkDatabaseConnection().then(dbConnected => {
  // Iniciar el servidor independientemente del resultado de la conexión a la base de datos
  app.listen(port, '0.0.0.0', () => {
    console.log(`🌍 Servidor AIPI iniciado en puerto ${port}`);
  });
});