/**
 * Script para actualizar la configuración del puerto en server/index.ts
 */
const fs = require('fs');
const path = require('path');

// Puerto principal a usar para la aplicación en todas partes
const TARGET_PORT = 3000;
console.log(`🔧 Configurando aplicación en server/index.ts para usar puerto ${TARGET_PORT}...`);

// Ruta al archivo server/index.ts
const filePath = path.resolve('server/index.ts');

try {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Archivo no encontrado: server/index.ts`);
    process.exit(1);
  }
  
  // Leer el contenido actual
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Buscar la línea que define el puerto
  const portPattern = /const port = \d+;/;
  if (portPattern.test(content)) {
    // Reemplazar la definición del puerto
    content = content.replace(portPattern, `const port = ${TARGET_PORT};`);
    
    // Buscar el comentario sobre el puerto y actualizarlo también
    const commentPattern = /\/\/ Serving the app on port \d+ for deployment compatibility/;
    if (commentPattern.test(content)) {
      content = content.replace(
        commentPattern, 
        `// Serving the app on port ${TARGET_PORT} for deployment compatibility`
      );
    }
    
    // Guardar los cambios
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Actualizado: server/index.ts`);
    console.log(`🔄 Para aplicar los cambios, reinicia la aplicación`);
  } else {
    console.log(`⚠️ No se encontró la definición del puerto en server/index.ts`);
  }
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
}