/**
 * Script principal de despliegue para AIPI
 * Este script inicia el servidor de despliegue directo (sin auto-detección)
 */

console.log('🚀 Iniciando despliegue de AIPI...');
console.log(`📅 Fecha y hora: ${new Date().toLocaleString()}`);

// Importar y ejecutar el script de proxy directo
require('./direct-proxy.cjs');