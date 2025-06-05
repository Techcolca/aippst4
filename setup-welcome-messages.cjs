const { Pool } = require('pg');

async function setupWelcomeMessages() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Crear la tabla welcome_messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS welcome_messages (
        id SERIAL PRIMARY KEY,
        message_text TEXT NOT NULL,
        message_type TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        order_index INTEGER NOT NULL
      );
    `);

    // Limpiar datos existentes
    await pool.query('DELETE FROM welcome_messages');

    // Calcular fecha de expiración (7 días desde ahora)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Insertar los 7 mensajes iniciales
    const initialMessages = [
      {
        text: "Bienvenido a AIPPS - La plataforma conversacional con IA para una comunicación inteligente en tu sitio web",
        type: "welcome",
        order: 1
      },
      {
        text: "Automatiza tu atención al cliente con IA avanzada - Respuestas inteligentes 24/7 sin intervención manual",
        type: "automation",
        order: 2
      },
      {
        text: "Integra chatbots personalizados en minutos - Diseña, configura y despliega sin conocimientos técnicos",
        type: "commercial",
        order: 3
      },
      {
        text: "Captura leads mientras duermes - Convierte visitantes en clientes con conversaciones inteligentes",
        type: "commercial",
        order: 4
      },
      {
        text: "Agenda citas automáticamente - Conecta con Google Calendar y gestiona reservas sin esfuerzo",
        type: "commercial",
        order: 5
      },
      {
        text: "Análisis en tiempo real - Optimiza tu estrategia con métricas detalladas de conversaciones",
        type: "commercial",
        order: 6
      },
      {
        text: "Multiplataforma y escalable - Desde startups hasta empresas, potencia tu comunicación digital",
        type: "commercial",
        order: 7
      }
    ];

    for (const message of initialMessages) {
      await pool.query(`
        INSERT INTO welcome_messages (message_text, message_type, order_index, expires_at)
        VALUES ($1, $2, $3, $4)
      `, [message.text, message.type, message.order, expiresAt]);
    }

    console.log('Tabla welcome_messages configurada exitosamente con mensajes iniciales');
    console.log(`Mensajes expiran el: ${expiresAt.toISOString()}`);

  } catch (error) {
    console.error('Error configurando welcome_messages:', error);
  } finally {
    await pool.end();
  }
}

setupWelcomeMessages();