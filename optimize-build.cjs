/**
 * Script para optimizar el build antes del despliegue (versión CommonJS)
 */
const fs = require('fs');
const path = require('path');

console.log('🔍 Optimizando build para despliegue...');

// Asegurarse de que existe el directorio dist
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  console.log('✅ Directorio dist creado');
}

// Crear una copia simplificada del production-server.cjs en dist
fs.copyFileSync(
  path.join(__dirname, 'production-server.cjs'),
  path.join(__dirname, 'dist', 'production-server.cjs')
);

console.log('✅ Servidor de producción copiado a dist/');

// Crear un archivo index.js compatible en dist para respaldo
const indexContent = `// Archivo generado automáticamente para despliegue
process.env.NODE_ENV = 'production';
require('../production-server.cjs');
`;

fs.writeFileSync(
  path.join(__dirname, 'dist', 'index.cjs'),
  indexContent
);

console.log('✅ Archivo index.cjs creado en dist/');

// Verificar archivos estáticos
const clientDistPath = path.join(__dirname, 'dist', 'client');
if (!fs.existsSync(clientDistPath)) {
  console.log('⚠️ No se encontró el directorio dist/client, será creado automáticamente');
  fs.mkdirSync(clientDistPath, { recursive: true });
  
  // Crear un HTML mínimo para respaldo
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIPI - Plataforma de IA</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
    .container { background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 2rem; margin-top: 3rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>AIPI</h1>
    <p>Plataforma avanzada de inteligencia artificial.</p>
    <p>El frontend no se generó correctamente. Por favor, ejecute "npm run build" para generar los archivos estáticos.</p>
  </div>
</body>
</html>`;

  fs.writeFileSync(
    path.join(clientDistPath, 'index.html'),
    htmlContent
  );
  
  console.log('✅ Archivo index.html de respaldo creado en dist/client/');
}

console.log('✅ Build optimizado correctamente');