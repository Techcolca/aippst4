import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Iniciando migración de base de datos para Railway...');

// Verificar que DATABASE_URL existe
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL no está definido. No se puede migrar la base de datos.');
  process.exit(1);
}

try {
  // Ejecutar la migración
  console.log('Ejecutando drizzle-kit push...');
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  
  console.log('Migración completada con éxito!');
} catch (error) {
  console.error('Error durante la migración:', error);
  process.exit(1);
}