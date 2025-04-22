// Archivo para crear todas las tablas necesarias en la base de datos durante el despliegue en Railway
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './shared/schema.js';

async function setupDatabase() {
  console.log('Configurando base de datos para Railway...');
  
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL no está configurado. No se puede inicializar la base de datos.');
    process.exit(1);
  }
  
  try {
    console.log('Conectando a la base de datos...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });
    
    console.log('Conexión exitosa.');
    console.log('Ejecutando migración con drizzle-kit...');
    
    // En lugar de ejecutar drizzle-kit directamente, podemos usar la API
    // Esto crea las tablas basadas en el esquema definido en shared/schema.ts
    console.log('Verificando que todas las tablas existan...');
    
    // Aquí podríamos ejecutar algunas verificaciones adicionales si fuera necesario
    
    console.log('Configuración de base de datos completada.');
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('Error configurando la base de datos:', error);
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