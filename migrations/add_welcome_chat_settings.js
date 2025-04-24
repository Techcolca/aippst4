import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addWelcomeChatSettings() {
  try {
    console.log('Iniciando migración para agregar configuración del chatbot de bienvenida...');
    
    // Verificar si las columnas ya existen
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings' 
      AND column_name = 'welcome_page_chat_greeting';
    `;
    
    const checkResult = await pool.query(checkColumnsQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('Las columnas para la configuración del chatbot de bienvenida ya existen.');
      return;
    }
    
    // Añadir nuevas columnas a la tabla settings
    const addColumnsQuery = `
      ALTER TABLE settings
      ADD COLUMN IF NOT EXISTS welcome_page_chat_enabled BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS welcome_page_chat_greeting TEXT DEFAULT '👋 ¡Hola! Soy AIPPS, tu asistente de IA. ¿En qué puedo ayudarte hoy?',
      ADD COLUMN IF NOT EXISTS welcome_page_chat_bubble_color TEXT DEFAULT '#111827',
      ADD COLUMN IF NOT EXISTS welcome_page_chat_text_color TEXT DEFAULT '#FFFFFF',
      ADD COLUMN IF NOT EXISTS welcome_page_chat_behavior TEXT DEFAULT 'Sé amable, informativo y conciso al responder preguntas sobre AIPPS y sus características.';
    `;
    
    await pool.query(addColumnsQuery);
    
    console.log('Migración completada exitosamente.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    pool.end();
  }
}

// Ejecutar la migración
addWelcomeChatSettings();