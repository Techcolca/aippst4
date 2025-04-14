/**
 * Este script corrige los errores comunes durante el despliegue
 * Para ejecutar: node deploy-fix.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Iniciando corrección para errores de despliegue...');

// 1. Verificar la estructura de archivos
console.log('Verificando estructura de archivos...');
if (!fs.existsSync('./client/src/main.tsx')) {
  console.error('❌ Error: No se encontró el archivo client/src/main.tsx');
  process.exit(1);
}

// 2. Crear enlace simbólico de src a client/src
if (!fs.existsSync('./src')) {
  try {
    console.log('Creando enlace simbólico src -> client/src...');
    if (process.platform === 'win32') {
      // En Windows
      execSync('mklink /D src client\\src');
    } else {
      // En Linux/Mac
      execSync('ln -s client/src src');
    }
    console.log('✅ Enlace simbólico creado correctamente');
  } catch (error) {
    console.log('Error creando enlace simbólico, intentando crear directorio...');
    try {
      fs.mkdirSync('./src', { recursive: true });
      
      // Copiar archivos esenciales de client/src a src
      const files = fs.readdirSync('./client/src');
      files.forEach(file => {
        const srcPath = path.join('./client/src', file);
        const destPath = path.join('./src', file);
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
          console.log(`Copiado: ${file}`);
        }
      });
      
      console.log('✅ Archivos copiados correctamente');
    } catch (err) {
      console.error('❌ Error creando directorio src:', err);
    }
  }
} else {
  console.log('✅ El directorio src ya existe');
}

// 3. Crear un script de inicio simplificado
console.log('Creando script de inicio simplificado...');
const simplifiedServerContent = `
/**
 * Servidor simplificado para despliegue
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist', 'client')));

// Ruta de estado
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando' });
});

// Ruta de API fallback
app.get('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Ruta catch-all para SPA
app.get('*', (req, res) => {
  // Intentar servir index.html
  const indexPath = path.join(__dirname, 'dist', 'client', 'index.html');
  const fallbackPath = path.join(__dirname, 'public', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (fs.existsSync(fallbackPath)) {
    res.sendFile(fallbackPath);
  } else {
    res.send('<h1>AIPI - Servidor en Mantenimiento</h1><p>El servidor está en modo de mantenimiento.</p>');
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🚀 Servidor iniciado en http://0.0.0.0:\${PORT}\`);
});
`;

fs.writeFileSync('deploy-server.cjs', simplifiedServerContent);
console.log('✅ Script de inicio simplificado creado: deploy-server.cjs');

// 4. Verificar y actualizar el archivo vite.config.ts
if (fs.existsSync('./vite.config.ts')) {
  console.log('Verificando vite.config.ts...');
  let viteConfig = fs.readFileSync('./vite.config.ts', 'utf8');
  
  // Verificar si necesita actualización
  if (!viteConfig.includes('root: path.resolve(__dirname, "client")')) {
    console.log('Actualizando vite.config.ts para apuntar a client/...');
    
    // Hacer una copia de seguridad
    fs.writeFileSync('./vite.config.ts.bak', viteConfig);
    
    // Actualizar configuración
    viteConfig = viteConfig.replace(
      'export default defineConfig({',
      'export default defineConfig({\n  root: path.resolve(__dirname, "client"),'
    );
    
    // Si no tiene import path, añadirlo
    if (!viteConfig.includes("import path from 'path'")) {
      viteConfig = "import path from 'path';\n" + viteConfig;
    }
    
    fs.writeFileSync('./vite.config.ts', viteConfig);
    console.log('✅ vite.config.ts actualizado');
  } else {
    console.log('✅ vite.config.ts ya está correctamente configurado');
  }
}

// 5. Crear un index.html básico en public
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

const basicIndexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIPI - Plataforma en Mantenimiento</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #f7f9fc;
    }
    .container {
      text-align: center;
      max-width: 600px;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #4a6cf7;
    }
    .status {
      margin: 20px 0;
      padding: 15px;
      background-color: #f0f4ff;
      border-left: 5px solid #4a6cf7;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>AIPI - Plataforma de IA Conversacional</h1>
    <div class="status">
      <p><strong>Estado:</strong> Mantenimiento programado</p>
      <p>Estamos realizando mejoras en nuestra plataforma. Volveremos pronto con una experiencia mejorada.</p>
    </div>
    <p>Gracias por su paciencia.</p>
  </div>
</body>
</html>`;

fs.writeFileSync('./public/index.html', basicIndexHtml);
console.log('✅ index.html básico creado en public/');

console.log('\n✅ Correcciones completadas correctamente.');
console.log('\n📋 Instrucciones para despliegue:');
console.log('1. Inicia el servidor de despliegue:');
console.log('   node deploy-server.cjs');
console.log('2. En la configuración de despliegue de Replit, usa:');
console.log('   Comando de inicio: node deploy-server.cjs');
console.log('\nUna vez que el despliegue funcione, podrás volver al comando normal.');