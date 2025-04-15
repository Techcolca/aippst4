/**
 * Script para el despliegue directo de AIPI en Replit (versión CommonJS)
 * Este script configura el entorno para asegurar que se despliegue la aplicación correcta
 */

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

console.log('🚀 Iniciando configuración para despliegue de AIPI...');

// Configuración básica
const isProduction = process.env.NODE_ENV === 'production';
const isDeploy = !!process.env.REPL_SLUG;

// Detectar el tipo de entorno
console.log(`📊 Información del entorno:`);
console.log(`- Producción: ${isProduction ? 'Sí' : 'No'}`);
console.log(`- Despliegue: ${isDeploy ? 'Sí' : 'No'}`);
console.log(`- Directorio actual: ${process.cwd()}`);

// Lista de archivos importantes para verificar
const filesToCheck = [
  './server/index.ts',
  './server/index.js',
  './client/index.html',
  './public/embed.js',
  './dist/client/index.html',
  './dist/server/index.js'
];

// Verificar archivos
console.log('\n📂 Verificando archivos importantes:');
filesToCheck.forEach(file => {
  const exists = fs.existsSync(path.resolve(file));
  console.log(`- ${file}: ${exists ? '✅ Existe' : '❌ No existe'}`);
});

// Función principal para iniciar el despliegue
function prepareDeployment() {
  console.log('\n🔧 Preparando entorno para despliegue...');

  // Asegurarnos que el modo es desarrollo para compatibilidad
  if (isDeploy) {
    process.env.NODE_ENV = 'development';
    console.log('✅ Modo de desarrollo activado para compatibilidad');
  }

  // Crear archivo de punto de entrada específico para el despliegue
  try {
    const deployEntryContent = `// Punto de entrada para despliegue de AIPI
console.log('Iniciando AIPI desde punto de entrada de despliegue...');

// Forzar modo desarrollo para compatibilidad
process.env.NODE_ENV = 'development';

// Cargar el servidor real
try {
  require('./server/index.js');
  console.log('✅ Servidor cargado correctamente desde ./server/index.js');
} catch (error) {
  console.error('❌ Error al cargar el servidor:', error);
  
  // Intentar alternativas
  try {
    require('./dist/server/index.js');
    console.log('✅ Servidor cargado correctamente desde ./dist/server/index.js');
  } catch (err) {
    console.error('❌ Error crítico, no se puede iniciar el servidor:', err);
  }
}`;

    // Escribir el archivo
    fs.writeFileSync(path.resolve('deploy-entry.cjs'), deployEntryContent);
    console.log('✅ Archivo de punto de entrada creado: deploy-entry.cjs');
  } catch (error) {
    console.error('❌ Error al crear archivo de punto de entrada:', error);
  }

  // Si estamos en despliegue y el directorio dist no existe o está vacío, construir la aplicación
  const distPath = path.resolve('./dist');
  if (isDeploy && (!fs.existsSync(distPath) || !fs.readdirSync(distPath).length)) {
    console.log('\n🏗️ Construyendo la aplicación para despliegue...');
    
    try {
      // Ejecutar el comando de construcción
      const buildResult = child_process.execSync('npm run build', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('✅ Aplicación construida correctamente');
    } catch (error) {
      console.error('❌ Error al construir la aplicación:', error);
    }
  }

  console.log('\n✨ Configuración de despliegue completada');
  console.log('📋 Para iniciar la aplicación, ejecutar: node deploy-entry.cjs');
}

// Ejecutar la preparación del despliegue
prepareDeployment();