#!/bin/bash

# Imprimir mensaje de inicio
echo "🚀 ===== Iniciando despliegue en Railway ====="

# Paso 1: Ejecutar drizzle-kit push para migrar la base de datos
echo "📊 Ejecutando migraciones de base de datos con drizzle-kit..."
npx drizzle-kit push

# Paso 2: Configurar tablas y datos iniciales
echo "🏗️  Configurando base de datos inicial..."
node setup-railway-db.js

# Paso 3: Verificar resultado de la configuración
if [ $? -ne 0 ]; then
  echo "❌ ERROR: La configuración de la base de datos falló. Abortando despliegue."
  exit 1
fi

# Paso 4: Iniciar la aplicación
echo "✅ Configuración de base de datos completada. Iniciando la aplicación..."
echo "🌐 Iniciando servidor AIPI en producción..."
NODE_ENV=production PORT=${PORT:-5000} node dist/index.js