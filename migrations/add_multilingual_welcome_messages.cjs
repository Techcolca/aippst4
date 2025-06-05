const { Pool } = require('@neondatabase/serverless');

/**
 * Migración para añadir soporte multiidioma a los mensajes de bienvenida
 */
async function addMultilingualWelcomeMessages() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('Iniciando migración: Añadiendo soporte multiidioma a welcome_messages...');

    // Agregar columnas para francés e inglés
    await pool.query(`
      ALTER TABLE welcome_messages 
      ADD COLUMN IF NOT EXISTS message_text_fr TEXT,
      ADD COLUMN IF NOT EXISTS message_text_en TEXT;
    `);

    console.log('Columnas multiidioma añadidas correctamente.');

    // Actualizar mensajes existentes con traducciones
    const updateQueries = [
      {
        id: 1,
        es: "Bienvenido a AIPPS - La plataforma conversacional con IA para una comunicación inteligente en tu sitio web",
        fr: "Bienvenue dans AIPPS - La plateforme conversationnelle alimentée par l'IA pour une communication intelligente sur votre site web",
        en: "Welcome to AIPPS - The AI-powered conversational platform for intelligent communication on your website"
      },
      {
        id: 2,
        es: "Automatiza tu atención al cliente con IA avanzada - Respuestas inteligentes 24/7 sin intervención manual",
        fr: "Automatisez votre service client avec une IA avancée - Réponses intelligentes 24/7 sans intervention manuelle",
        en: "Automate your customer service with advanced AI - Intelligent 24/7 responses without manual intervention"
      },
      {
        id: 3,
        es: "Integra chatbots personalizados en minutos - Diseña, configura y despliega sin conocimientos técnicos",
        fr: "Intégrez des chatbots personnalisés en quelques minutes - Concevez, configurez et déployez sans connaissances techniques",
        en: "Integrate custom chatbots in minutes - Design, configure and deploy without technical knowledge"
      },
      {
        id: 4,
        es: "Captura leads mientras duermes - Convierte visitantes en clientes con conversaciones inteligentes",
        fr: "Capturez des prospects pendant que vous dormez - Convertissez les visiteurs en clients avec des conversations intelligentes",
        en: "Capture leads while you sleep - Convert visitors into customers with intelligent conversations"
      },
      {
        id: 5,
        es: "Agenda citas automáticamente - Conecta con Google Calendar y gestiona reservas sin esfuerzo",
        fr: "Planifiez automatiquement les rendez-vous - Connectez-vous à Google Calendar et gérez les réservations sans effort",
        en: "Schedule appointments automatically - Connect with Google Calendar and manage bookings effortlessly"
      },
      {
        id: 6,
        es: "Análisis en tiempo real - Optimiza tu estrategia con métricas detalladas de conversaciones",
        fr: "Analyse en temps réel - Optimisez votre stratégie avec des métriques détaillées des conversations",
        en: "Real-time analytics - Optimize your strategy with detailed conversation metrics"
      },
      {
        id: 7,
        es: "Multiplataforma y escalable - Funciona en cualquier sitio web y crece con tu negocio",
        fr: "Multiplateforme et évolutif - Fonctionne sur n'importe quel site web et grandit avec votre entreprise",
        en: "Multi-platform and scalable - Works on any website and grows with your business"
      }
    ];

    for (const msg of updateQueries) {
      await pool.query(`
        UPDATE welcome_messages 
        SET 
          message_text_fr = $1,
          message_text_en = $2
        WHERE order_index = $3;
      `, [msg.fr, msg.en, msg.id]);
    }

    console.log('Traducciones añadidas correctamente a todos los mensajes.');
    console.log('Migración completada exitosamente.');

  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addMultilingualWelcomeMessages()
    .then(() => {
      console.log('✅ Migración multiidioma completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la migración:', error);
      process.exit(1);
    });
}

module.exports = { addMultilingualWelcomeMessages };