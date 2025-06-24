import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Script para actualizar los planes de precios según el documento específico
 * PLAN 1: BÁSICO - $7 USD/mes
 * PLAN 2: STARTUP - $29 USD/mes  
 * PLAN 3: PROFESIONAL - $89 USD/mes
 * PLAN 4: EMPRESARIAL - $299 USD/mes
 */
async function updatePricingPlansFromDocument() {
  console.log('Actualizando planes de precios según documento específico...');
  
  try {
    // Primero eliminar planes existentes para evitar conflictos
    await pool.query('DELETE FROM pricing_plans');
    console.log('Planes existentes eliminados.');

    // Definir los nuevos planes según el documento
    const newPlans = [
      {
        planId: 'basic',
        name: 'Básico',
        description: 'Plan básico para sitios web pequeños',
        price: 700, // $7 USD en centavos
        priceDisplay: '$7 USD',
        currency: 'usd',
        interval: 'month',
        features: [
          '500 conversaciones/mes',
          '1 formulario personalizable (2 plantillas disponibles)',
          'Widget de chat tipo burbuja únicamente',
          'Integración en 1 sitio web',
          'Procesamiento de documentos básico (PDF, DOCX)',
          'Captura básica de leads',
          'Análisis básicos de conversaciones',
          'Soporte por email',
          'Personalización limitada de branding'
        ],
        tier: 'basic',
        interactionsLimit: 500,
        isAnnual: false,
        discount: null,
        popular: false,
        available: true
      },
      {
        planId: 'startup',
        name: 'Startup',
        description: 'Perfecto para negocios en crecimiento',
        price: 2900, // $29 USD en centavos
        priceDisplay: '$29 USD',
        currency: 'usd',
        interval: 'month',
        features: [
          '2,000 conversaciones/mes',
          '5 formularios personalizables (todas las plantillas)',
          'Widget chat + modo pantalla completa tipo ChatGPT',
          'Integración en hasta 3 sitios web',
          'Procesamiento avanzado de documentos',
          'Base de conocimiento personalizada',
          'Captura y seguimiento de leads',
          'Análisis avanzados con métricas',
          'Personalización completa de branding',
          'Soporte prioritario por email y chat',
          'Exportación de datos básica'
        ],
        tier: 'startup',
        interactionsLimit: 2000,
        isAnnual: false,
        discount: null,
        popular: true,
        available: true
      },
      {
        planId: 'professional',
        name: 'Profesional',
        description: 'Para empresas profesionales',
        price: 8900, // $89 USD en centavos
        priceDisplay: '$89 USD',
        currency: 'usd',
        interval: 'month',
        features: [
          '10,000 conversaciones/mes',
          'Formularios ilimitados',
          'Todas las funciones del plan Profesional',
          'Integración en sitios web ilimitados',
          'Automatizaciones básicas (respuestas automáticas)',
          'Integración con CRM (Salesforce, HubSpot)',
          'API de acceso para desarrolladores',
          'Análisis avanzados con reportes personalizados',
          'Exportación de datos en múltiples formatos',
          'Respaldos automáticos',
          'Gestión de equipos (hasta 5 usuarios)',
          'Soporte por email, chat y telefónico',
          'Onboarding personalizado'
        ],
        tier: 'professional',
        interactionsLimit: 10000,
        isAnnual: false,
        discount: null,
        popular: false,
        available: true
      },
      {
        planId: 'enterprise',
        name: 'Empresarial',
        description: 'Plan completo con IA automatizada',
        price: 29900, // $299 USD en centavos
        priceDisplay: '$299 USD',
        currency: 'usd',
        interval: 'month',
        features: [
          'Conversaciones ilimitadas',
          'Formularios ilimitados',
          'Todas las funciones disponibles',
          'Integración en sitios web ilimitados',
          'Automatizaciones completas con IA',
          'IA local o IA normal',
          'Integración con todos los CRM',
          'API completa para desarrolladores',
          'Análisis empresariales avanzados',
          'Exportación de datos ilimitada',
          'Respaldos automáticos diarios',
          'Gestión de equipos ilimitada',
          'Soporte 24/7 dedicado',
          'Gerente de cuenta dedicado',
          'SLA garantizado'
        ],
        tier: 'enterprise',
        interactionsLimit: 999999,
        isAnnual: false,
        discount: null,
        popular: false,
        available: true
      }
    ];

    // Insertar los nuevos planes
    for (const plan of newPlans) {
      await pool.query(`
        INSERT INTO pricing_plans 
        (plan_id, name, description, price, price_display, currency, interval, features, tier, interactions_limit, is_annual, discount, popular, available)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        plan.planId,
        plan.name,
        plan.description,
        plan.price,
        plan.priceDisplay,
        plan.currency,
        plan.interval,
        JSON.stringify(plan.features),
        plan.tier,
        plan.interactionsLimit,
        plan.isAnnual,
        plan.discount,
        plan.popular,
        plan.available
      ]);
      
      console.log(`✓ Plan creado: ${plan.name} (${plan.planId}) - ${plan.priceDisplay}`);
    }
    
    console.log('Todos los planes de precios han sido actualizados correctamente según el documento.');
  } catch (error) {
    console.error('Error al actualizar planes de precios:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  updatePricingPlansFromDocument();
}

export { updatePricingPlansFromDocument };