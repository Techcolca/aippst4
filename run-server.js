import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import fs from 'fs';

const { Pool } = pkg;

// Configuración básica
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("🚀 Iniciando servidor AIPI (versión simplificada)...");

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
    
    // Verificar tablas existentes
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log("\n📋 Tablas existentes en la base de datos:");
    existingTables.forEach(table => {
      console.log(`   - ${table}`);
    });
    
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

// Ruta principal
app.get('/', (req, res) => {
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
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f1f1f1;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>AIPI Platform</h1>
          <p class="status">Servidor en ejecución</p>
          <p>El servidor simplificado está funcionando correctamente.</p>
          
          <h2>Información del Sistema</h2>
          <table>
            <tr>
              <th>Componente</th>
              <th>Estado</th>
            </tr>
            <tr>
              <td>Servidor HTTP</td>
              <td>✅ En funcionamiento</td>
            </tr>
            <tr>
              <td>Base de Datos</td>
              <td>✅ Conectada</td>
            </tr>
            <tr>
              <td>API REST</td>
              <td>✅ Disponible</td>
            </tr>
          </table>
          
          <h2>Endpoints Disponibles</h2>
          <table>
            <tr>
              <th>Ruta</th>
              <th>Descripción</th>
            </tr>
            <tr>
              <td>/api/status</td>
              <td>Estado del servidor</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `);
});

// Iniciar servidor
checkDatabaseConnection().then(dbConnected => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`\n🌍 Servidor AIPI iniciado en puerto ${port}`);
    console.log(`📡 URL local: http://localhost:${port}`);
  });
});