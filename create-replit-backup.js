#!/usr/bin/env node

/**
 * Script para crear backup de datos existentes en Replit antes de migrar a Railway
 * Este script debe ejecutarse EN REPLIT antes del deploy a Railway ok
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { pool, db } from './server/db.js';
import * as schema from './shared/schema.js';

const { users, integrations, conversations, messages, pricingPlans, welcomeMessages, forms } = schema;

console.log('🔄 Iniciando backup de datos de Replit...');

async function createBackup() {
  try {
    // Verificar conexión a la base de datos
    if (!process.env.DATABASE_URL) {
      console.error('❌ ERROR: DATABASE_URL no está definido en Replit');
      console.error('💡 Asegúrate de ejecutar este script en el entorno de Replit');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL encontrado, creando backup...');

    // 1. Crear backup SQL usando pg_dump (recomendado para migración completa)
    console.log('📊 Creando backup SQL completo...');
    try {
      execSync(`pg_dump "${process.env.DATABASE_URL}" > replit-backup-$(date +%Y%m%d-%H%M%S).sql`, {
        stdio: 'inherit'
      });
      console.log('✅ Backup SQL creado exitosamente');
    } catch (error) {
      console.warn('⚠️ No se pudo crear backup SQL (pg_dump no disponible), continuando con backup manual...');
    }

    // 2. Crear backup manual de datos críticos (como fallback)
    console.log('📋 Creando backup manual de datos críticos...');
    
    const backupData = {
      timestamp: new Date().toISOString(),
      source: 'replit',
      target: 'railway',
      data: {}
    };

    // Backup de usuarios
    try {
      const usersData = await db.select().from(users);
      backupData.data.users = usersData;
      console.log(`👤 ${usersData.length} usuarios respaldados`);
    } catch (error) {
      console.warn('⚠️ Error backing up users:', error.message);
      backupData.data.users = [];
    }

    // Backup de integraciones
    try {
      const integrationsData = await db.select().from(integrations);
      backupData.data.integrations = integrationsData;
      console.log(`🔗 ${integrationsData.length} integraciones respaldadas`);
    } catch (error) {
      console.warn('⚠️ Error backing up integrations:', error.message);
      backupData.data.integrations = [];
    }

    // Backup de conversaciones
    try {
      const conversationsData = await db.select().from(conversations);
      backupData.data.conversations = conversationsData;
      console.log(`💬 ${conversationsData.length} conversaciones respaldadas`);
    } catch (error) {
      console.warn('⚠️ Error backing up conversations:', error.message);
      backupData.data.conversations = [];
    }

    // Backup de mensajes (últimos 1000 para evitar archivos muy grandes)
    try {
      const messagesData = await db.select().from(messages).limit(1000).orderBy(messages.id, 'desc');
      backupData.data.messages = messagesData;
      console.log(`📨 ${messagesData.length} mensajes respaldados (últimos 1000)`);
    } catch (error) {
      console.warn('⚠️ Error backing up messages:', error.message);
      backupData.data.messages = [];
    }

    // Backup de planes de precios
    try {
      const plansData = await db.select().from(pricingPlans);
      backupData.data.pricingPlans = plansData;
      console.log(`💰 ${plansData.length} planes de precios respaldados`);
    } catch (error) {
      console.warn('⚠️ Error backing up pricing plans:', error.message);
      backupData.data.pricingPlans = [];
    }

    // Backup de mensajes de bienvenida
    try {
      const welcomeData = await db.select().from(welcomeMessages);
      backupData.data.welcomeMessages = welcomeData;
      console.log(`🎉 ${welcomeData.length} mensajes de bienvenida respaldados`);
    } catch (error) {
      console.warn('⚠️ Error backing up welcome messages:', error.message);
      backupData.data.welcomeMessages = [];
    }

    // Backup de formularios
    try {
      const formsData = await db.select().from(forms);
      backupData.data.forms = formsData;
      console.log(`📝 ${formsData.length} formularios respaldados`);
    } catch (error) {
      console.warn('⚠️ Error backing up forms:', error.message);
      backupData.data.forms = [];
    }

    // Guardar backup manual en archivo JSON
    const filename = `replit-backup-manual-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(filename, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup manual guardado en: ${filename}`);

    // Generar resumen
    const totalRecords = Object.values(backupData.data).reduce((total, table) => total + table.length, 0);
    console.log('\n📊 RESUMEN DEL BACKUP:');
    console.log(`📅 Fecha: ${backupData.timestamp}`);
    console.log(`📈 Total registros: ${totalRecords}`);
    console.log(`👤 Usuarios: ${backupData.data.users.length}`);
    console.log(`🔗 Integraciones: ${backupData.data.integrations.length}`);
    console.log(`💬 Conversaciones: ${backupData.data.conversations.length}`);
    console.log(`📨 Mensajes: ${backupData.data.messages.length}`);
    console.log(`💰 Planes: ${backupData.data.pricingPlans.length}`);
    console.log(`🎉 Mensajes bienvenida: ${backupData.data.welcomeMessages.length}`);
    console.log(`📝 Formularios: ${backupData.data.forms.length}`);

    // Generar script de restauración
    const restoreScript = `
-- Script de restauración para Railway PostgreSQL
-- Ejecutar DESPUÉS de que las tablas estén creadas con drizzle-kit push

-- Para restaurar desde el backup SQL:
-- psql $DATABASE_URL < replit-backup-YYYYMMDD-HHMMSS.sql

-- Para verificar datos restaurados:
SELECT 'users' as table_name, COUNT(*) as records FROM users
UNION ALL
SELECT 'integrations', COUNT(*) FROM integrations  
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'pricing_plans', COUNT(*) FROM pricing_plans
UNION ALL
SELECT 'welcome_messages', COUNT(*) FROM welcome_messages
UNION ALL
SELECT 'forms', COUNT(*) FROM forms;
`;

    writeFileSync('restore-commands.sql', restoreScript);
    console.log('✅ Script de restauración creado: restore-commands.sql');

    console.log('\n🎯 SIGUIENTE PASOS:');
    console.log('1. ⬇️ Descargar archivos de backup de Replit');
    console.log('2. 🚀 Hacer deploy a Railway');
    console.log('3. 📊 Ejecutar migraciones en Railway');
    console.log('4. 🔄 Restaurar datos usando los archivos backup');
    console.log('\n✅ Backup completado exitosamente!');

  } catch (error) {
    console.error('💥 Error durante el backup:', error);
    console.error('🔍 Detalles del error:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Ejecutar backup
createBackup().catch(console.error);
