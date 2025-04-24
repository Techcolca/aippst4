import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';

// Configuración de conexión a la base de datos
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL debe estar definida como variable de entorno');
  process.exit(1);
}

// Configurar Neon para WebSockets
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

// Crear pool de conexiones
const pool = new Pool({ connectionString });
const db = drizzle(pool);

/**
 * Migración para añadir los campos relacionados con el scraping al chatbot de bienvenida
 */
async function addWelcomeChatScrapingFields() {
  try {
    console.log('Añadiendo campos de scraping a la tabla de configuración...');
    
    // Verificar si los campos ya existen
    const columnsResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings' 
      AND (column_name = 'welcome_page_chat_scraping_enabled' 
           OR column_name = 'welcome_page_chat_scraping_depth'
           OR column_name = 'welcome_page_chat_scraping_data')
    `);
    
    const existingColumns = columnsResult.rows.map(row => row.column_name);
    
    // Añadir los campos que no existan
    if (!existingColumns.includes('welcome_page_chat_scraping_enabled')) {
      await db.execute(sql`
        ALTER TABLE settings 
        ADD COLUMN welcome_page_chat_scraping_enabled BOOLEAN DEFAULT false
      `);
      console.log('Campo welcome_page_chat_scraping_enabled añadido');
    }
    
    if (!existingColumns.includes('welcome_page_chat_scraping_depth')) {
      await db.execute(sql`
        ALTER TABLE settings 
        ADD COLUMN welcome_page_chat_scraping_depth INTEGER DEFAULT 5
      `);
      console.log('Campo welcome_page_chat_scraping_depth añadido');
    }
    
    if (!existingColumns.includes('welcome_page_chat_scraping_data')) {
      await db.execute(sql`
        ALTER TABLE settings 
        ADD COLUMN welcome_page_chat_scraping_data TEXT
      `);
      console.log('Campo welcome_page_chat_scraping_data añadido');
    }
    
    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar la migración
addWelcomeChatScrapingFields()
  .then(() => {
    console.log('Migración completada con éxito');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error ejecutando la migración:', error);
    process.exit(1);
  });