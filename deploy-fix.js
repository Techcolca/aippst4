/**
 * Este script ayuda a solucionar problemas de despliegue en Replit
 * Crea los directorios necesarios y configura las redirecciones adecuadas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurarse de que el directorio dist existe
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
  console.log('✅ Directorio dist creado');
}

// Crear un archivo index.js en dist que simplemente importe y ejecute el servidor
const indexContent = `
// Este archivo es generado automáticamente para solucionar problemas de despliegue
import '../server/index.js';
`;

fs.writeFileSync(path.join('dist', 'index.js'), indexContent);
console.log('✅ Archivo index.js creado en dist');

// Crear una versión de respaldo del servidor
// Nos aseguramos de que existe el directorio server
if (!fs.existsSync('server')) {
  fs.mkdirSync('server');
  console.log('✅ Directorio server creado');
}

// Verificar si existe el archivo original
const originalServerPath = path.join('server', 'index.ts');
const backupServerPath = path.join('server', 'index.js');

if (fs.existsSync(originalServerPath) && !fs.existsSync(backupServerPath)) {
  // Leer el contenido del archivo original
  const originalContent = fs.readFileSync(originalServerPath, 'utf8');
  
  // Convertir a JavaScript básico (solo reemplazos básicos)
  let jsContent = originalContent
    .replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g, 'import $2')
    .replace(/export\s+/g, '')
    .replace(/:[\s]*[a-zA-Z<>\[\]]+/g, '')  // Eliminar anotaciones de tipo
    .replace(/<[^>]+>/g, '');  // Eliminar genéricos
  
  // Agregar código de arranque al principio
  jsContent = `
// Este archivo es generado automáticamente para solucionar problemas de despliegue
// Es una versión simplificada de index.ts convertida a JavaScript

import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Servir archivos estáticos
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.static(path.join(process.cwd(), 'dist/client')));

// Una ruta básica de API para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'El servidor está funcionando correctamente' });
});

// Catch-all route para SPA
app.get('*', (req, res) => {
  // Evitar rutas de API
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(process.cwd(), 'dist/client/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(\`🚀 Servidor desplegado funcionando en puerto \${PORT}\`);
});
` + jsContent;
  
  fs.writeFileSync(backupServerPath, jsContent);
  console.log('✅ Archivo de respaldo index.js creado en server');
}

console.log('✅ Reparación completada. Ahora ejecuta:');
console.log('1. npm run build');
console.log('2. Despliega de nuevo con: npm run start');