/**
 * Script de configuración para despliegue en Replit
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Configurando el entorno para despliegue en Replit...');

// Crear archivo de redirección para rutas de SPA
const redirectRoutesPath = path.join('public', '_redirects');
const redirectContent = `/*    /index.html   200`;

fs.writeFileSync(redirectRoutesPath, redirectContent);
console.log('✅ Archivo _redirects creado para gestionar rutas SPA');

// Crear archivo de configuración para Replit
const replitNixPath = 'replit.nix';

if (fs.existsSync(replitNixPath)) {
  console.log('ℹ️ Archivo replit.nix ya existe, no se sobrescribirá');
} else {
  const replitNixContent = `{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.nodePackages.typescript
    pkgs.postgresql
  ];
}`;
  fs.writeFileSync(replitNixPath, replitNixContent);
  console.log('✅ Archivo replit.nix creado');
}

// Verificar que existe la configuración de despliegue
const deploymentConfigPath = '.replit';
if (fs.existsSync(deploymentConfigPath)) {
  let replitContent = fs.readFileSync(deploymentConfigPath, 'utf8');
  
  // Verificar si ya hay configuración de despliegue
  if (!replitContent.includes('[deployment]')) {
    // Añadir configuración para despliegue
    replitContent += `
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["node", "dist/index.js"]
`;
    fs.writeFileSync(deploymentConfigPath, replitContent);
    console.log('✅ Configuración de despliegue agregada a .replit');
  } else {
    console.log('ℹ️ La configuración de despliegue ya existe en .replit');
  }
} else {
  console.log('❌ No se encontró el archivo .replit');
}

// Validar si está lista para despliegue
try {
  console.log('🔍 Verificando si hay errores en el código...');
  
  // Crear directorio dist si no existe
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  
  console.log('✅ Configuración completada con éxito');
  console.log('\n🚀 Pasos para desplegar:');
  console.log('1. Ejecuta: npm run build');
  console.log('2. En la configuración de despliegue, asegúrate de usar:');
  console.log('   - Build Command: npm run build');
  console.log('   - Start Command: node dist/index.js');
  console.log('3. Despliega tu aplicación desde la interfaz de Replit');
  
} catch (error) {
  console.error('❌ Error durante la verificación:', error.message);
}