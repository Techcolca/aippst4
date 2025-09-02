#!/bin/bash

# Imprimir mensaje de inicio
echo "🚀 ===== Iniciando despliegue AIPI en Railway ===== "

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
node setup-railway-db.js

if [ $? -ne 0 ]; then
  echo "❌ ERROR: Configuración de datos iniciales falló"
  echo "🔍 Revisa logs arriba para detalles del error"
  exit 1
fi

echo "✅ Configuración de base de datos completada exitosamente"

# Paso 4: Iniciar la aplicación
echo "🌐 Iniciando servidor AIPI en producción..."
echo "📡 Puerto: $PORT"
echo "🗄️ Base de datos: Conectado"
echo "🚀 Estado: Producción"

NODE_ENV=production PORT=${PORT:-5000} node dist/index.js --host 0.0.0.0
