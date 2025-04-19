#!/bin/bash

echo "🚀 Iniciando AIPI Platform..."
echo "🔄 Verificando base de datos y ejecutando servidor alternativo..."

# Desactivar el comando original y ejecutar nuestro script personalizado
# Esto sucede porque el workflow ejecuta npm run dev, que a su vez ejecuta tsx
# Pero tsx no está instalado correctamente, así que usamos nuestro script
node start-app.js