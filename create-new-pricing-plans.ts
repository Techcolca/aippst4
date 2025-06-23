import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pricingPlans } from "./shared/schema";

// Configuración de la base de datos
const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
const db = drizzle(sql);

/**
 * Nuevos planes de precios para AIPPS
 * Plan 1: Básico ($7 USD) - Sin pantalla completa, 1 formulario, 2 plantillas
 * Plan 2: Estándar ($19 USD) - Con pantalla completa, formularios limitados
 * Plan 3: Profesional ($49 USD) - Más funcionalidades y límites
 * Plan 4: Empresarial (Contactar) - Solo aquí se incluyen automatizaciones
 */

const NEW_PRICING_PLANS = [
  {
    planId: "basico",
    name: "Plan Básico",
    description: "Perfecto para pequeños sitios web y emprendedores",
    price: 700, // $7 USD en centavos
    priceDisplay: "$7",
    currency: "usd",
    interval: "month",
    tier: "basic",
    interactionsLimit: 500,
    isAnnual: false,
    discount: null,
    popular: false,
    available: true,
    features: [
      "500 conversaciones mensuales",
      "Widget de chat burbuja únicamente",
      "1 formulario personalizable",
      "2 plantillas de formulario disponibles",
      "Integración básica en sitios web",
      "Captura básica de leads",
      "Soporte por email",
      "Analíticas básicas",
      "Sin pantalla completa",
      "Entrenamientos con hasta 3 documentos"
    ]
  },
  {
    planId: "estandar",
    name: "Plan Estándar",
    description: "Ideal para pequeñas empresas en crecimiento",
    price: 1900, // $19 USD en centavos
    priceDisplay: "$19",
    currency: "usd",
    interval: "month",
    tier: "standard",
    interactionsLimit: 1500,
    isAnnual: false,
    discount: null,
    popular: true,
    available: true,
    features: [
      "1,500 conversaciones mensuales",
      "Widget burbuja + Pantalla completa",
      "Hasta 3 formularios personalizables",
      "Acceso a todas las plantillas de formulario",
      "Múltiples integraciones de sitios web",
      "Captura avanzada de leads",
      "Personalización de colores y estilos",
      "Analíticas detalladas y reportes",
      "Soporte prioritario",
      "Entrenamientos con hasta 10 documentos",
      "Notificaciones por email en tiempo real"
    ]
  },
  {
    planId: "profesional",
    name: "Plan Profesional",
    description: "Para empresas medianas con necesidades avanzadas",
    price: 4900, // $49 USD en centavos
    priceDisplay: "$49",
    currency: "usd",
    interval: "month",
    tier: "professional",
    interactionsLimit: 5000,
    isAnnual: false,
    discount: null,
    popular: false,
    available: true,
    features: [
      "5,000 conversaciones mensuales",
      "Todas las funcionalidades del Plan Estándar",
      "Formularios ilimitados",
      "Personalización avanzada de branding",
      "Integración con CRM y herramientas externas",
      "Analíticas avanzadas con métricas personalizadas",
      "API de acceso para desarrolladores",
      "Soporte telefónico y chat en vivo",
      "Entrenamientos con documentos ilimitados",
      "Exportación de datos en múltiples formatos",
      "Respaldos automáticos de conversaciones",
      "Gestión de equipos y usuarios múltiples"
    ]
  },
  {
    planId: "empresarial",
    name: "Plan Empresarial",
    description: "Para grandes organizaciones - Contactar para precios",
    price: 0, // Precio personalizado
    priceDisplay: "Contactar",
    currency: "usd",
    interval: "month",
    tier: "enterprise",
    interactionsLimit: -1, // Ilimitado
    isAnnual: false,
    discount: null,
    popular: false,
    available: true,
    features: [
      "Conversaciones ilimitadas",
      "Todas las funcionalidades del Plan Profesional",
      "AUTOMATIZACIONES AVANZADAS - Exclusivo de este plan",
      "Flujos de trabajo automatizados personalizados",
      "Integración completa con sistemas empresariales",
      "Automatización de seguimiento de leads",
      "Programación automática de citas y reuniones",
      "Respuestas automáticas basadas en contexto",
      "Escalamiento automático a agentes humanos",
      "Automatización de tareas repetitivas",
      "Gerente de cuenta dedicado",
      "Soporte 24/7 con SLA garantizado",
      "Implementación y configuración personalizada",
      "Capacitación del equipo incluida",
      "Servidores dedicados opcionales",
      "Cumplimiento de seguridad empresarial"
    ]
  }
];

/**
 * Análisis detallado de características, limitaciones, costos y ganancias por plan
 */
const PLAN_ANALYSIS = {
  basico: {
    targetMarket: "Emprendedores, freelancers, sitios web pequeños",
    costEstimate: "$2.50 USD", // Costos de infraestructura y operación
    profitMargin: "64%", // $4.50 USD de ganancia
    monthlyProfit: "$4.50 USD",
    limitations: [
      "Sin modo pantalla completa",
      "Solo 1 formulario activo",
      "Limitado a 2 plantillas básicas",
      "Sin automatizaciones",
      "Soporte básico por email únicamente",
      "Sin integraciones CRM",
      "Analíticas limitadas"
    ],
    keyFeatures: [
      "Widget de chat burbuja funcional",
      "Captura básica de información",
      "Respuestas inteligentes con IA",
      "Integración sencilla via JavaScript"
    ],
    estimatedUsers: "500-1000 usuarios/mes",
    revenueProjection: "$3,500-7,000 USD/mes"
  },
  estandar: {
    targetMarket: "Pequeñas empresas, tiendas online, consultores",
    costEstimate: "$5.00 USD",
    profitMargin: "74%",
    monthlyProfit: "$14.00 USD",
    limitations: [
      "Limitado a 3 formularios simultáneos",
      "Sin automatizaciones avanzadas",
      "Sin API de desarrollador",
      "Soporte limitado a horario comercial"
    ],
    keyFeatures: [
      "Modo pantalla completa incluido",
      "Personalización visual avanzada",
      "Múltiples formularios",
      "Analíticas detalladas",
      "Notificaciones en tiempo real"
    ],
    estimatedUsers: "300-600 usuarios/mes",
    revenueProjection: "$5,700-11,400 USD/mes"
  },
  profesional: {
    targetMarket: "Empresas medianas, agencias, e-commerce establecido",
    costEstimate: "$12.00 USD",
    profitMargin: "76%",
    monthlyProfit: "$37.00 USD",
    limitations: [
      "Sin automatizaciones (disponibles solo en Empresarial)",
      "Sin gerente de cuenta dedicado",
      "Sin servidores dedicados"
    ],
    keyFeatures: [
      "Formularios ilimitados",
      "API completa para desarrolladores",
      "Integraciones CRM avanzadas",
      "Analíticas personalizadas",
      "Gestión de equipos",
      "Soporte prioritario"
    ],
    estimatedUsers: "100-200 usuarios/mes",
    revenueProjection: "$4,900-9,800 USD/mes"
  },
  empresarial: {
    targetMarket: "Grandes corporaciones, instituciones, empresas Fortune 500",
    costEstimate: "Variable ($50-200 USD según implementación)",
    profitMargin: "70-85%",
    monthlyProfit: "Variable ($350-2000+ USD)",
    limitations: [
      "Requiere proceso de venta consultiva",
      "Implementación personalizada necesaria",
      "Contratos mínimos de 12 meses"
    ],
    keyFeatures: [
      "AUTOMATIZACIONES COMPLETAS - Única diferencia clave",
      "Flujos de trabajo personalizados",
      "Integración empresarial completa",
      "Soporte dedicado 24/7",
      "Implementación personalizada"
    ],
    estimatedUsers: "10-30 usuarios/mes",
    revenueProjection: "$5,000-60,000+ USD/mes (precios personalizados)"
  }
};

async function createNewPricingPlans() {
  console.log('🚀 Creando nuevos planes de precios para AIPPS...');
  
  try {
    // Limpiar planes existentes
    console.log('🗑️ Eliminando planes existentes...');
    await db.delete(pricingPlans);
    
    // Crear nuevos planes
    for (const plan of NEW_PRICING_PLANS) {
      await db.insert(pricingPlans).values(plan);
      console.log(`✅ Plan creado: ${plan.name} - ${plan.priceDisplay}/mes`);
    }
    
    console.log('\n📊 RESUMEN DE PLANES CREADOS:');
    console.log('=====================================');
    
    NEW_PRICING_PLANS.forEach((plan, index) => {
      const analysis = PLAN_ANALYSIS[plan.planId as keyof typeof PLAN_ANALYSIS];
      console.log(`\n${index + 1}. ${plan.name} (${plan.priceDisplay}/mes)`);
      console.log(`   💰 Ganancia estimada: ${analysis.monthlyProfit}`);
      console.log(`   📈 Margen: ${analysis.profitMargin}`);
      console.log(`   🎯 Mercado objetivo: ${analysis.targetMarket}`);
      console.log(`   📊 Proyección de ingresos: ${analysis.revenueProjection}`);
    });
    
    console.log('\n🎉 Todos los planes se han creado exitosamente!');
    console.log('\n📋 CARACTERÍSTICAS CLAVE POR PLAN:');
    console.log('=====================================');
    console.log('Plan Básico ($7): Widget burbuja, 1 formulario, 2 plantillas, SIN pantalla completa');
    console.log('Plan Estándar ($19): + Pantalla completa, 3 formularios, todas las plantillas');
    console.log('Plan Profesional ($49): + Formularios ilimitados, API, integraciones CRM');
    console.log('Plan Empresarial (Contactar): + AUTOMATIZACIONES (exclusivo), soporte 24/7');
    
  } catch (error) {
    console.error('❌ Error al crear planes de precios:', error);
    throw error;
  }
}

// Ejecutar automáticamente
createNewPricingPlans()
  .then(() => {
    console.log('✅ Proceso completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  });

export { createNewPricingPlans, NEW_PRICING_PLANS, PLAN_ANALYSIS };