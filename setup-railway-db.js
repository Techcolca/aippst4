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
          botBehavior: 'friendly'
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
            name: 'Free',
            price: 0,
            currency: 'USD',
            description: 'Plan gratuito con funciones básicas',
            features: JSON.stringify(['100 mensajes/mes', '1 integración', 'Soporte básico']),
            monthlyInteractionLimit: 100,
            maxIntegrations: 1,
            isActive: true,
            stripeProductId: null,
            stripePriceId: null
          },
          {
            name: 'Pro',
            price: 29,
            currency: 'USD',
            description: 'Plan profesional para empresas',
            features: JSON.stringify(['5,000 mensajes/mes', '10 integraciones', 'Soporte prioritario', 'Analytics avanzados']),
            monthlyInteractionLimit: 5000,
            maxIntegrations: 10,
            isActive: true,
            stripeProductId: null,
            stripePriceId: null
          },
          {
            name: 'Enterprise',
            price: 99,
            currency: 'USD',
            description: 'Plan empresarial con funciones avanzadas',
            features: JSON.stringify(['Mensajes ilimitados', 'Integraciones ilimitadas', 'Soporte 24/7', 'API completa', 'White-label']),
            monthlyInteractionLimit: -1,
            maxIntegrations: -1,
            isActive: true,
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
            messageText: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
            language: 'es',
            messageType: 'welcome',
            isActive: true,
            orderIndex: 1
          },
          {
            messageText: 'Hello! I\'m your virtual assistant. How can I help you today?',
            language: 'en',
            messageType: 'welcome',
            isActive: true,
            orderIndex: 1
          },
          {
            messageText: 'Bonjour! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui?',
            language: 'fr',
            messageType: 'welcome',
            isActive: true,
            orderIndex: 1
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
