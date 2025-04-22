#!/bin/bash

# Imprimir mensaje de inicio
echo "===== Iniciando despliegue en Railway ====="

# Paso 1: Ejecutar las migraciones de la base de datos
echo "Ejecutando migraciones de base de datos..."
node railway-migrate.js

# Paso 2: Verificar resultado de las migraciones
if [ $? -ne 0 ]; then
  echo "ERROR: Las migraciones fallaron. Abortando despliegue."
  exit 1
fi

# Paso 3: Iniciar la aplicación
echo "Migraciones completadas. Iniciando la aplicación..."
NODE_ENV=production node dist/index.js