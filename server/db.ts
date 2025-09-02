import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Declarar variables para exportar
let pool: Pool | null = null;
let db: any = null;

// Verificamos si DATABASE_URL está definido
if (!process.env.DATABASE_URL) {
  console.warn("⚠️ WARNING: DATABASE_URL no está definido. Algunas funciones pueden no estar disponibles.");
  console.warn("Para solucionar este problema, asegúrate de provisionar una base de datos en Railway");
  console.warn("y verificar que DATABASE_URL esté correctamente configurado en las variables de entorno.");
  
  // En lugar de lanzar un error, creamos objetos dummy para permitir que la aplicación inicie
  // pero las operaciones de base de datos fallarán
  db = {
    select: () => {
      console.error("Error: Intentando usar la base de datos sin una conexión válida");
      return { from: () => ({ where: () => [] }) };
    },
    insert: () => {
      console.error("Error: Intentando usar la base de datos sin una conexión válida");
      return { values: () => ({ returning: () => [] }) };
    },
    update: () => {
      console.error("Error: Intentando usar la base de datos sin una conexión válida");
      return { set: () => ({ where: () => [] }) };
    },
    delete: () => {
      console.error("Error: Intentando usar la base de datos sin una conexión válida");
      return { where: () => [] };
    }
  };
} else {
  // Si DATABASE_URL está definido, configuramos la conexión normalmente para Railway PostgreSQL
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  db = drizzle(pool, { schema });
}

export { pool, db };
