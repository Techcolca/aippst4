import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Iniciando migración de base de datos para Railway...');

// Verificar que DATABASE_URL existe
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está definido. No se puede migrar la base de datos.');
  console.error('💡 Asegúrate de haber provisionado PostgreSQL en Railway y configurado DATABASE_URL');
  process.exit(1);
}

console.log('✅ DATABASE_URL encontrado, iniciando migración...');

try {
  // Ejecutar la migración con sintaxis moderna
  console.log('📊 Ejecutando drizzle-kit push...');
  execSync('npx drizzle-kit push', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('✨ Migración completada con éxito!');
  console.log('📋 Base de datos Railway configurada y lista para usar');
} catch (error) {
  console.error('💥 Error durante la migración:', error.message);
  console.error('🔍 Verifica que DATABASE_URL sea válido y la base de datos esté accesible');
  process.exit(1);
}