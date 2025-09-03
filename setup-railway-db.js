// Archivo para crear todas las tablas necesarias en la base de datos durante el despliegue en Railway
import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema.ts';
import bcrypt from 'bcrypt';

const { users, integrations, pricingPlans, welcomeMessages } = schema;

async function setupDatabase() {
  console.log('🏗️  Configurando base de datos inicial para Railway...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está configurado. No se puede inicializar la base de datos.');
    process.exit(1);
  }
  
  try {
    console.log('🔌 Conectando a la base de datos Railway PostgreSQL...');
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    const db = drizzle(pool, { schema });
    
    console.log('✅ Conexión a base de datos establecida');

    // Crear usuario administrador por defecto si no existe
    const adminEmail = 'admin@aipi.com';
    try {
      const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

      if (existingAdmin.length === 0) {
        console.log('👤 Creando usuario administrador por defecto...');
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const apiKey = 'aipi_admin_' + Math.random().toString(36).substring(2, 15);

        await db.insert(users).values({
          username: 'admin',
          email: adminEmail,
          password: hashedPassword,
          fullName: 'Administrador AIPI',
          apiKey: apiKey
        });
        
        console.log('✅ Usuario administrador creado');
      } else {
        console.log('👤 Usuario administrador ya existe');
      }

      // Crear usuario Pablo si no existe
      const pabloEmail = 'techcolca@gmail.com';
      const existingPablo = await db.select().from(users).where(eq(users.email, pabloEmail)).limit(1);

      if (existingPablo.length === 0) {
        console.log('👤 Creando usuario Pablo...');
        
        const hashedPasswordPablo = await bcrypt.hash('pablo123', 10);
        const apiKeyPablo = 'aipi_pablo_' + Math.random().toString(36).substring(2, 15);

        const [pablo] = await db.insert(users).values({
          username: 'Pablo',
          email: pabloEmail,
          password: hashedPasswordPablo,
          fullName: 'Pablo Techcolca',
          apiKey: apiKeyPablo
        }).returning();
        
        console.log('✅ Usuario Pablo creado con ID:', pablo.id);

        // Crear integración básica para Pablo
        console.log('🔗 Creando integración para Pablo...');
        await db.insert(integrations).values({
          userId: pablo.id,
          name: 'Sitio Principal',
          url: 'https://mi-sitio.com',
          apiKey: 'int_pablo_' + Math.random().toString(36).substring(2, 15),
          themeColor: '#3b82f6',
          position: 'bottom-right',
          active: true,
          widgetType: 'bubble',
          language: 'es',
          description: 'Integración principal de Pablo',
          botBehavior: 'Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web.'
        });
        console.log('✅ Integración de Pablo creada');
        
      } else {
        console.log('👤 Usuario Pablo ya existe');
      }

    } catch (error) {
      console.log('⚠️  No se pudo crear usuarios (tabla puede no existir aún):', error.message);
    }

    // Crear planes de precios por defecto si no existen
    console.log('💰 Verificando planes de precios...');
    try {
      const existingPlans = await db.select().from(pricingPlans).limit(1);

      if (existingPlans.length === 0) {
        console.log('📋 Creando planes de precios por defecto...');
        
        const defaultPlans = [
          {
            planId: 'free',
            name: 'Free',
            description: 'Plan gratuito con funciones básicas',
            price: 0,
            priceDisplay: '$0/mes',
            currency: 'cad',
            interval: 'month',
            features: ['100 mensajes/mes', '1 integración', 'Soporte básico'],
            tier: 'free',
            interactionsLimit: 100,
            isAnnual: false,
            discount: null,
            popular: false,
            available: true,
            stripeProductId: null,
            stripePriceId: null
          },
          {
            planId: 'pro',
            name: 'Pro',
            description: 'Plan profesional para empresas',
            price: 2900,
            priceDisplay: '$29/mes',
            currency: 'cad',
            interval: 'month',
            features: ['5,000 mensajes/mes', '10 integraciones', 'Soporte prioritario', 'Analytics avanzados'],
            tier: 'pro',
            interactionsLimit: 5000,
            isAnnual: false,
            discount: null,
            popular: true,
            available: true,
            stripeProductId: null,
            stripePriceId: null
          },
          {
            planId: 'enterprise',
            name: 'Enterprise',
            description: 'Plan empresarial con funciones avanzadas',
            price: 9900,
            priceDisplay: '$99/mes',
            currency: 'cad',
            interval: 'month',
            features: ['Mensajes ilimitados', 'Integraciones ilimitadas', 'Soporte 24/7', 'API completa', 'White-label'],
            tier: 'enterprise',
            interactionsLimit: -1,
            isAnnual: false,
            discount: null,
            popular: false,
            available: true,
            stripeProductId: null,
            stripePriceId: null
          }
        ];

        await db.insert(pricingPlans).values(defaultPlans);
        console.log('✅ Planes de precios creados');
      } else {
        console.log('💰 Planes de precios ya existen');
      }
    } catch (error) {
      console.log('⚠️  No se pudieron crear planes de precios (tabla puede no existir aún):', error.message);
    }

    // Crear mensajes de bienvenida por defecto si no existen
    console.log('💬 Verificando mensajes de bienvenida...');
    try {
      const existingMessages = await db.select().from(welcomeMessages).limit(1);

      if (existingMessages.length === 0) {
        console.log('📝 Creando mensajes de bienvenida por defecto...');
        
        const defaultMessages = [
          {
            messageText: '🚀 ¡Transforma tu sitio web con AI conversacional inteligente!',
            messageTextFr: '🚀 Transformez votre site web avec une IA conversationnelle intelligente!',
            messageTextEn: '🚀 Transform your website with intelligent conversational AI!',
            messageType: 'commercial',
            isActive: true,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            orderIndex: 1
          },
          {
            messageText: '💬 Crea experiencias únicas para tus visitantes con AIPI',
            messageTextFr: '💬 Créez des expériences uniques pour vos visiteurs avec AIPI',
            messageTextEn: '💬 Create unique experiences for your visitors with AIPI',
            messageType: 'commercial',
            isActive: true,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            orderIndex: 2
          },
          {
            messageText: '🎯 Automatiza atención al cliente 24/7 con inteligencia artificial',
            messageTextFr: '🎯 Automatisez le service client 24/7 avec intelligence artificielle',
            messageTextEn: '🎯 Automate 24/7 customer service with artificial intelligence',
            messageType: 'automation',
            isActive: true,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            orderIndex: 3
          }
        ];

        await db.insert(welcomeMessages).values(defaultMessages);
        console.log('✅ Mensajes de bienvenida creados');
      } else {
        console.log('💬 Mensajes de bienvenida ya existen');
      }
    } catch (error) {
      console.log('⚠️  No se pudieron crear mensajes de bienvenida (tabla puede no existir aún):', error.message);
    }
    
    console.log('🎉 Configuración de base de datos completada exitosamente!');
    console.log('📊 Base de datos Railway lista para producción');
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('💥 Error configurando la base de datos:', error.message);
    console.error('🔍 Detalles del error:', error);
    return false;
  }
}

// Ejecutar la configuración
setupDatabase()
  .then(success => {
    if (success) {
      console.log('La base de datos está lista para usar.');
      process.exit(0);
    } else {
      console.error('No se pudo configurar la base de datos.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });
