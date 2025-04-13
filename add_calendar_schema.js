import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;
dotenv.config();

async function updateSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Conectado a la base de datos PostgreSQL');

    // Comprobar si la columna email_notification_address ya existe en settings
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings' 
      AND column_name = 'email_notification_address';
    `;
    
    const columnResult = await client.query(checkColumnQuery);
    
    if (columnResult.rows.length === 0) {
      console.log('Añadiendo columna email_notification_address a la tabla settings...');
      await client.query(`
        ALTER TABLE settings 
        ADD COLUMN email_notification_address TEXT;
      `);
      console.log('Columna añadida correctamente');
    } else {
      console.log('La columna email_notification_address ya existe en settings');
    }

    // Comprobar si la tabla calendar_tokens existe
    const checkTableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'calendar_tokens';
    `;
    
    const tableResult = await client.query(checkTableQuery);
    
    if (tableResult.rows.length === 0) {
      console.log('Creando tabla calendar_tokens...');
      await client.query(`
        CREATE TABLE calendar_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          provider TEXT NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('Tabla calendar_tokens creada correctamente');
    } else {
      console.log('La tabla calendar_tokens ya existe');
    }

    console.log('Actualizaciones completadas con éxito');
  } catch (error) {
    console.error('Error al actualizar el esquema:', error);
  } finally {
    await client.end();
    console.log('Conexión cerrada');
  }
}

updateSchema();