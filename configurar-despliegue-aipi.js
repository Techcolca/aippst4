/**
 * Script de configuración para despliegue de AIPI en Replit
 * Este script genera los archivos necesarios para el despliegue.
 */

// Este archivo debe ejecutarse manualmente con:
// node configurar-despliegue-aipi.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Configurando despliegue de AIPI en Replit...');

// Crear archivos necesarios para el despliegue
try {
  // 1. Crear script de inicialización para el despliegue
  const deployScriptContent = `// Archivo generado automáticamente para despliegue
// Este archivo se usa como punto de entrada para el despliegue en Replit

// Forzar modo desarrollo para asegurar compatibilidad
process.env.NODE_ENV = 'development';

// Importar el servidor real de la aplicación
import './server/index.js';
`;

  console.log('📝 Creando archivo de punto de entrada para despliegue...');
  fs.writeFileSync(path.join(__dirname, 'deploy-entry.js'), deployScriptContent);
  console.log('✅ Archivo de punto de entrada creado correctamente');

  // 2. Crear archivo de configuración alternativo para despliegue
  const deployNixContent = `{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
  ];
}`;

  console.log('📝 Creando archivo de configuración alternativo para despliegue...');
  fs.writeFileSync(path.join(__dirname, 'replit.deploy.nix'), deployNixContent);
  console.log('✅ Archivo de configuración alternativo creado correctamente');

  // 3. Crear script para comprobar despliegue
  const deployJsContent = `// Script para verificar el despliegue
const https = require('https');

function checkDeployment() {
  console.log('🔍 Verificando estado del despliegue...');
  
  // URL de la aplicación desplegada (reemplazar con la URL real del despliegue)
  const deployUrl = process.env.REPL_SLUG ? 
    \`https://\${process.env.REPL_SLUG}.\${process.env.REPL_OWNER}.repl.co\` : 
    'https://ai-interactive-techcolca.replit.app/';
  
  console.log(\`📡 Comprobando URL: \${deployUrl}\`);
  
  // Realizar una solicitud a la URL de despliegue
  https.get(deployUrl, (res) => {
    console.log(\`🔄 Estado de respuesta: \${res.statusCode}\`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (data.includes('AIPI') || data.includes('IA Conversacional')) {
        console.log('✅ Despliegue verificado correctamente. La aplicación AIPI está funcionando.');
      } else {
        console.log('⚠️ El despliegue responde, pero no se detecta la aplicación AIPI.');
        console.log('   Puede ser necesario revisar la configuración del despliegue.');
      }
    });
  }).on('error', (err) => {
    console.error(\`❌ Error al verificar el despliegue: \${err.message}\`);
  });
}

// Ejecutar la verificación
checkDeployment();
`;

  console.log('📝 Creando script de verificación de despliegue...');
  fs.writeFileSync(path.join(__dirname, 'replit.deploy.js'), deployJsContent);
  console.log('✅ Script de verificación creado correctamente');

  console.log('\n✨ Configuración de despliegue completada con éxito');
  console.log('📋 Instrucciones para el despliegue:');
  console.log('1. Ve a la pestaña "Deployments" en Replit');
  console.log('2. Haz clic en "Deploy"');
  console.log('3. Si es necesario, configura manualmente:');
  console.log('   - Build command: npm run build && node direct-deploy-aipi.cjs');
  console.log('   - Run command: node direct-deploy-aipi.cjs');
  console.log('4. Después del despliegue, verifica con: node replit.deploy.js');

} catch (error) {
  console.error('❌ Error al configurar el despliegue:', error);
}