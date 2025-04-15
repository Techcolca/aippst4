/**
 * Script para actualizar la configuración del puerto en varios archivos
 */
const fs = require('fs');
const path = require('path');

// Puerto principal a usar para la aplicación en todas partes
const TARGET_PORT = 3000;
console.log(`🔧 Configurando aplicación para usar puerto ${TARGET_PORT}...`);

// Lista de archivos donde necesitamos actualizar la configuración del puerto
const filesToUpdate = [
  {
    path: 'deploy.cjs',
    pattern: /const APP_PORTS = \[\d+, \d+, \d+, \d+, \d+\];/,
    replacement: `const APP_PORTS = [${TARGET_PORT}, 5017, 5000, 8080, 8000];`
  },
  {
    path: 'final-deploy.cjs',
    pattern: /const APP_PORTS = \[\d+, \d+, \d+, \d+, \d+\];/,
    replacement: `const APP_PORTS = [${TARGET_PORT}, 5017, 5000, 8080, 8000];`
  },
  {
    path: 'server.js',
    pattern: /const PORT = \d+;/,
    replacement: `const PORT = ${TARGET_PORT};`
  }
];

// Contar archivos actualizados para mostrar un resumen
let filesUpdated = 0;

// Procesar cada archivo
filesToUpdate.forEach(file => {
  const filePath = path.resolve(file.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Archivo no encontrado: ${file.path}`);
    return;
  }
  
  try {
    // Leer el contenido actual del archivo
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si el patrón coincide y aplicar el reemplazo
    if (file.pattern.test(content)) {
      content = content.replace(file.pattern, file.replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Actualizado: ${file.path}`);
      filesUpdated++;
    } else {
      console.log(`ℹ️ No se encontró el patrón en: ${file.path}`);
    }
  } catch (error) {
    console.error(`❌ Error procesando ${file.path}: ${error.message}`);
  }
});

console.log(`\n📊 Resumen: ${filesUpdated} archivo(s) actualizado(s)`);
console.log(`🔄 Para aplicar los cambios, reinicia la aplicación y el servidor de despliegue`);