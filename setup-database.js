import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ Error: DATABASE_URL no está configurado");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🔄 Conectando a la base de datos...");
    
    // Probar la conexión
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✅ Conexión establecida. Hora del servidor: ${result.rows[0].now}`);
    
    // Verificar si las tablas ya existen
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log("\n📋 Tablas existentes en la base de datos:");
    
    if (existingTables.length === 0) {
      console.log("   (No hay tablas)");
    } else {
      existingTables.forEach(table => {
        console.log(`   - ${table}`);
      });
    }
    
    // Verificar si las tablas básicas del sistema existen
    const requiredTables = ['users', 'integrations', 'conversations', 'messages'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`\n⚠️ Faltan las siguientes tablas: ${missingTables.join(', ')}`);
      console.log("   Puedes crear las tablas usando: npm run db:push");
    } else if (requiredTables.every(table => existingTables.includes(table))) {
      console.log("\n✅ Todas las tablas básicas existen en la base de datos");
    }
    
    client.release();
    
    return true;
  } catch (error) {
    console.error("❌ Error al configurar la base de datos:", error.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Ejecutar la función principal
setupDatabase()
  .then(success => {
    if (success) {
      console.log("\n🎉 Base de datos verificada correctamente");
    } else {
      console.error("\n❌ Hubo un problema al verificar la base de datos");
      process.exit(1);
    }
  })
  .catch(error => {
    console.error("\n❌ Error fatal:", error);
    process.exit(1);
  });