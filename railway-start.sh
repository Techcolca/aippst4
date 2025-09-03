#!/bin/bash

# Imprimir mensaje de inicio
echo "🚀 ===== Iniciando despliegue AIPI en Railway ======"

# Verificar variables críticas
echo "🔍 Verificando variables de entorno..."
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL no está definido"
  echo "💡 Asegúrate de configurar DATABASE_URL=\${{Postgres.DATABASE_URL}} en Railway"
  exit 1
fi

if [ -z "$NODE_ENV" ]; then
  echo "⚠️ WARNING: NODE_ENV no definido, configurando a production"
  export NODE_ENV=production
fi

if [ -z "$PORT" ]; then
  echo "⚠️ WARNING: PORT no definido, usando puerto 5000"
  export PORT=5000
fi

echo "✅ Variables verificadas: NODE_ENV=$NODE_ENV, PORT=$PORT"

# Paso 1: Verificar conexión a base de datos
echo "🔌 Verificando conexión a PostgreSQL..."
node -e "
const pg = require('pg');
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.query('SELECT 1 as test')
  .then(() => {
    console.log('✅ Conexión a base de datos exitosa');
    return pool.end();
  })
  .catch(err => {
    console.error('❌ Error conectando a base de datos:', err.message);
    process.exit(1);
  });
"

# Paso 2: Ejecutar migraciones de base de datos
echo "📊 Ejecutando migraciones de schema con drizzle-kit..."
npx drizzle-kit push --force

if [ $? -ne 0 ]; then
  echo "❌ ERROR: Migración de schema falló"
  exit 1
fi

echo "✅ Migraciones de schema completadas"

# Paso 3: Configurar datos iniciales
echo "🏗️  Configurando datos iniciales de AIPI..."
npx tsx setup-railway-db.js

# Paso 4: Verificar datos críticos (ya creados en setup-railway-db.js)
if [ "$RAILWAY_ENVIRONMENT" ]; then
  echo "✅ Datos críticos ya configurados en Railway"
  echo "✅ Usuario Pablo y admin creados en setup-railway-db.js"
else
  # Migrar datos críticos de Replit (Pablo y sus integraciones) - SOLO EN REPLIT
  echo "🔄 Migrando datos críticos de Replit..."
  node -e "
const { db } = require('./dist/server/db.js');
const bcrypt = require('bcrypt');

async function migratePabloData() {
  try {
    const { users, integrations } = require('./dist/shared/schema.js');
    
    // Crear usuario Pablo si no existe
    const pabloData = {
      username: 'Pablo',
      email: 'techcolca@gmail.com',
      password: await bcrypt.hash('pablo123', 10),
      fullName: 'Pablo Tech',
      apiKey: 'pablo-' + Math.random().toString(36).substr(2, 16)
    };
    
    console.log('👤 Creando usuario Pablo...');
    await db.insert(users).values(pabloData).onConflictDoNothing();
    
    // Obtener ID de Pablo
    const pabloUser = await db.select().from(users).where(eq(users.email, 'techcolca@gmail.com')).limit(1);
    
    if (pabloUser.length > 0) {
      console.log('🔗 Creando integración básica para Pablo...');
      await db.insert(integrations).values({
        userId: pabloUser[0].id,
        name: 'Sitio Principal',
        url: 'https://mi-sitio.com',
        apiKey: 'int-' + Math.random().toString(36).substr(2, 16),
        themeColor: '#3b82f6',
        position: 'bottom-right',
        active: true,
        widgetType: 'bubble'
      }).onConflictDoNothing();
      
      console.log('✅ Datos de Pablo migrados exitosamente');
    }
  } catch (error) {
    console.warn('⚠️ Error migrando datos de Pablo:', error.message);
  }
}

migratePabloData();
"
fi

echo "✅ Migración de datos completada"
    
    console.log('👤 Creando usuario Pablo...');
    await db.insert(users).values(pabloData).onConflictDoNothing();
    
    // Obtener ID de Pablo
    const pabloUser = await db.select().from(users).where(eq(users.email, 'techcolca@gmail.com')).limit(1);
    
    if (pabloUser.length > 0) {
      console.log('🔗 Creando integración básica para Pablo...');
      await db.insert(integrations).values({
        userId: pabloUser[0].id,
        name: 'Sitio Principal',
        url: 'https://mi-sitio.com',
        apiKey: 'int-' + Math.random().toString(36).substr(2, 16),
        themeColor: '#3b82f6',
        position: 'bottom-right',
        active: true,
        widgetType: 'bubble'
      }).onConflictDoNothing();
      
      console.log('✅ Datos de Pablo migrados exitosamente');
    }
  } catch (error) {
    console.warn('⚠️ Error migrando datos de Pablo:', error.message);
  }
}

migratePabloData();
"

echo "✅ Migración de datos completada"


# Paso 4: Iniciar la aplicación
echo "🌐 Iniciando servidor AIPI en producción..."
echo "📡 Puerto: $PORT"
echo "🗄️ Base de datos: Conectado"
echo "🚀 Estado: Producción"

NODE_ENV=production PORT=${PORT:-5000} node dist/index.js --host 0.0.0.0
