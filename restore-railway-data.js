#!/usr/bin/env node

/**
 * Script para restaurar datos desde backup de Replit a Railway PostgreSQL
 * Ejecutar DESPUÉS de que Railway esté desplegado y las tablas creadas
 */

import { readFileSync, existsSync } from 'fs';
import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema.js';
import bcrypt from 'bcrypt';

const { users, integrations, conversations, messages, pricingPlans, welcomeMessages, forms } = schema;

console.log('🔄 Iniciando restauración de datos en Railway PostgreSQL...');

async function restoreData() {
  const backupFile = process.argv[2];
  
  if (!backupFile) {
    console.error('❌ ERROR: Especifica el archivo de backup');
    console.error('💡 Uso: node restore-railway-data.js replit-backup-manual-XXXX.json');
    process.exit(1);
  }

  if (!existsSync(backupFile)) {
    console.error(`❌ ERROR: Archivo de backup no encontrado: ${backupFile}`);
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está definido en Railway');
    console.error('💡 Asegúrate de ejecutar este script con las variables de entorno de Railway');
    process.exit(1);
  }

  try {
    console.log(`📂 Leyendo backup desde: ${backupFile}`);
    const backupData = JSON.parse(readFileSync(backupFile, 'utf8'));
    
    console.log(`📅 Backup creado: ${backupData.timestamp}`);
    console.log(`📊 Fuente: ${backupData.source} → Destino: Railway PostgreSQL`);

    // Conectar a Railway PostgreSQL
    console.log('🔌 Conectando a Railway PostgreSQL...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    const db = drizzle(pool, { schema });
    console.log('✅ Conexión establecida');

    // Estadísticas de restauración
    let restored = {
      users: 0,
      integrations: 0,
      conversations: 0,
      messages: 0,
      pricingPlans: 0,
      welcomeMessages: 0,
      forms: 0
    };

    // Restaurar usuarios
    if (backupData.data.users && backupData.data.users.length > 0) {
      console.log(`👤 Restaurando ${backupData.data.users.length} usuarios...`);
      for (const user of backupData.data.users) {
        try {
          // Verificar si el usuario ya existe
          const existing = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
          
          if (existing.length === 0) {
            await db.insert(users).values({
              username: user.username,
              password: user.password, // Ya está hasheado
              email: user.email,
              fullName: user.fullName,
              apiKey: user.apiKey,
              stripeCustomerId: user.stripeCustomerId,
              stripeSubscriptionId: user.stripeSubscriptionId
            });
            restored.users++;
          } else {
            console.log(`⚠️ Usuario ya existe: ${user.email}`);
          }
        } catch (error) {
          console.warn(`⚠️ Error restaurando usuario ${user.email}:`, error.message);
        }
      }
      console.log(`✅ ${restored.users} usuarios restaurados`);
    }

    // Restaurar integraciones
    if (backupData.data.integrations && backupData.data.integrations.length > 0) {
      console.log(`🔗 Restaurando ${backupData.data.integrations.length} integraciones...`);
      for (const integration of backupData.data.integrations) {
        try {
          // Verificar si la integración ya existe
          const existing = await db.select().from(integrations).where(eq(integrations.apiKey, integration.apiKey)).limit(1);
          
          if (existing.length === 0) {
            await db.insert(integrations).values({
              userId: integration.userId,
              name: integration.name,
              url: integration.url,
              apiKey: integration.apiKey,
              themeColor: integration.themeColor,
              position: integration.position,
              active: integration.active,
              visitorCount: integration.visitorCount,
              botBehavior: integration.botBehavior,
              documentsData: integration.documentsData,
              widgetType: integration.widgetType,
              ignoredSections: integration.ignoredSections,
              description: integration.description,
              ignoredSectionsText: integration.ignoredSectionsText,
              customization: integration.customization,
              language: integration.language,
              textColor: integration.textColor
            });
            restored.integrations++;
          } else {
            console.log(`⚠️ Integración ya existe: ${integration.name}`);
          }
        } catch (error) {
          console.warn(`⚠️ Error restaurando integración ${integration.name}:`, error.message);
        }
      }
      console.log(`✅ ${restored.integrations} integraciones restauradas`);
    }

    // Restaurar conversaciones
    if (backupData.data.conversations && backupData.data.conversations.length > 0) {
      console.log(`💬 Restaurando ${backupData.data.conversations.length} conversaciones...`);
      for (const conversation of backupData.data.conversations) {
        try {
          await db.insert(conversations).values({
            integrationId: conversation.integrationId,
            userId: conversation.userId,
            visitorId: conversation.visitorId,
            startedAt: conversation.startedAt,
            endedAt: conversation.endedAt,
            status: conversation.status,
            rating: conversation.rating,
            feedback: conversation.feedback,
            isActive: conversation.isActive
          });
          restored.conversations++;
        } catch (error) {
          console.warn(`⚠️ Error restaurando conversación ${conversation.id}:`, error.message);
        }
      }
      console.log(`✅ ${restored.conversations} conversaciones restauradas`);
    }

    // Restaurar mensajes (últimos 1000)
    if (backupData.data.messages && backupData.data.messages.length > 0) {
      console.log(`📨 Restaurando ${backupData.data.messages.length} mensajes...`);
      for (const message of backupData.data.messages) {
        try {
          await db.insert(messages).values({
            conversationId: message.conversationId,
            content: message.content,
            isFromUser: message.isFromUser,
            timestamp: message.timestamp,
            sentiment: message.sentiment,
            confidence: message.confidence
          });
          restored.messages++;
        } catch (error) {
          console.warn(`⚠️ Error restaurando mensaje ${message.id}:`, error.message);
        }
      }
      console.log(`✅ ${restored.messages} mensajes restaurados`);
    }

    // Los planes de precios y mensajes de bienvenida ya se crean en setup-railway-db.js
    // Solo restaurar si no existen

    console.log('\n🎉 RESTAURACIÓN COMPLETADA');
    console.log('📊 Resumen de datos restaurados:');
    console.log(`👤 Usuarios: ${restored.users}`);
    console.log(`🔗 Integraciones: ${restored.integrations}`);
    console.log(`💬 Conversaciones: ${restored.conversations}`);
    console.log(`📨 Mensajes: ${restored.messages}`);
    
    // Verificar datos restaurados
    console.log('\n🔍 Verificando datos en Railway...');
    const finalCounts = await Promise.all([
      db.select().from(users).then(r => r.length),
      db.select().from(integrations).then(r => r.length),
      db.select().from(conversations).then(r => r.length),
      db.select().from(messages).then(r => r.length)
    ]);

    console.log('📈 Total final en Railway:');
    console.log(`👤 Usuarios: ${finalCounts[0]}`);
    console.log(`🔗 Integraciones: ${finalCounts[1]}`);
    console.log(`💬 Conversaciones: ${finalCounts[2]}`);
    console.log(`📨 Mensajes: ${finalCounts[3]}`);

    console.log('\n✅ ¡Datos migrados exitosamente de Replit a Railway!');

  } catch (error) {
    console.error('💥 Error durante la restauración:', error);
    console.error('🔍 Detalles del error:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Mostrar ayuda si no hay argumentos
if (process.argv.length < 3) {
  console.log('🔄 Script de Restauración de Datos - Replit → Railway');
  console.log('');
  console.log('📋 Uso:');
  console.log('  node restore-railway-data.js <archivo-backup.json>');
  console.log('');
  console.log('📂 Ejemplo:');
  console.log('  node restore-railway-data.js replit-backup-manual-2025-09-02T12-00-00-000Z.json');
  console.log('');
  console.log('⚠️  Requisitos:');
  console.log('  - Archivo de backup creado con create-replit-backup.js');
  console.log('  - Variable DATABASE_URL configurada (Railway PostgreSQL)');
  console.log('  - Tablas ya creadas con drizzle-kit push');
  process.exit(0);
}

// Ejecutar restauración
restoreData().catch(console.error);