/**
 * Script principal de despliegue para AIPI
 * Este script inicia el servidor final de despliegue
 */

console.log('🚀 Iniciando despliegue de AIPI...');
console.log(`📅 Fecha y hora: ${new Date().toLocaleString()}`);

// Importar y ejecutar el script final de despliegue
require('./final-deploy.cjs');