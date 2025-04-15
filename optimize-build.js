/**
 * Script para optimizar el build antes del despliegue
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Optimizando build para despliegue...');

try {
  // Asegurarse de que existe el directorio dist
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
    console.log('✅ Directorio dist creado');
  }

  // Copiar archivos estáticos importantes
  console.log('📋 Copiando archivos estáticos y de configuración...');
  
  // Lista de archivos importantes para el despliegue
  const filesToCopy = [
    'production-server.js',
    'production-server.cjs',
    'server.js',
    'server.mjs'
  ];
  
  // Copiar cada archivo si existe
  filesToCopy.forEach(file => {
    try {
      if (fs.existsSync(path.join(__dirname, file))) {
        fs.copyFileSync(
          path.join(__dirname, file),
          path.join(__dirname, 'dist', file)
        );
        console.log(`✅ Copiado: ${file}`);
      }
    } catch (err) {
      console.error(`❌ Error al copiar ${file}:`, err);
    }
  });

  // Crear un archivo index.js compatible en dist para respaldo
  const indexContent = `// Archivo generado automáticamente para despliegue
process.env.NODE_ENV = 'production';

// Intentar importar el servidor de producción
try {
  import('./production-server.js')
    .catch(() => {
      console.log('⚠️ No se pudo importar production-server.js, intentando alternativas...');
      require('./production-server.cjs');
    });
} catch (error) {
  console.log('⚠️ Error importando servidores ESM, intentando CommonJS...');
  try {
    require('./production-server.cjs');
  } catch (err) {
    console.error('❌ Error crítico al iniciar servidor:', err);
    process.exit(1);
  }
}
`;

  fs.writeFileSync(
    path.join(__dirname, 'dist', 'index.js'),
    indexContent
  );

  console.log('✅ Archivo index.js creado en dist/');

  // Verificar archivos estáticos del cliente
  const clientDistPath = path.join(__dirname, 'dist', 'client');
  if (!fs.existsSync(clientDistPath)) {
    console.log('⚠️ No se encontró el directorio dist/client, será creado automáticamente');
    fs.mkdirSync(clientDistPath, { recursive: true });
    
    // Crear un HTML mínimo para respaldo con la página de carga
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIPI - Iniciando servicio</title>
  <meta http-equiv="refresh" content="5"> <!-- Recargar cada 5 segundos -->
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; background-color: #f9fafe; }
    .container { background-color: white; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); padding: 2.5rem; margin-top: 4rem; }
    .spinner { display: inline-block; width: 60px; height: 60px; border: 6px solid rgba(74, 108, 247, 0.3); border-radius: 50%; border-top-color: #4a6cf7; animation: spin 1s ease-in-out infinite; margin-bottom: 1.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .title { font-size: 2rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1rem; }
    .text { font-size: 1.1rem; color: #4a5568; line-height: 1.6; }
    .status { display: inline-block; background-color: #f7f7f7; padding: 0.5rem 1rem; border-radius: 9999px; font-weight: 500; margin: 1rem 0; }
    .gradient-text { background: linear-gradient(to right, #4a6cf7, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .reload-text { font-size: 0.9rem; color: #718096; margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1 class="title">AIPI <span class="gradient-text">está iniciando</span></h1>
    <p class="text">El servicio se está preparando, por favor espere un momento.</p>
    <div class="status">Iniciando servicios...</div>
    <p class="text">La página se actualizará automáticamente cuando el sistema esté listo.</p>
    <p class="reload-text">Si esta página persiste por más de 3 minutos, contacte al administrador del sistema.</p>
  </div>
</body>
</html>`;

    fs.writeFileSync(
      path.join(clientDistPath, 'index.html'),
      htmlContent
    );
    
    console.log('✅ Archivo index.html de respaldo creado en dist/client/');
  }

  // Verificar si hay archivos públicos para copiar
  const publicPath = path.join(__dirname, 'public');
  const distPublicPath = path.join(__dirname, 'dist', 'public');
  
  if (fs.existsSync(publicPath)) {
    // Crear directorio público en dist si no existe
    if (!fs.existsSync(distPublicPath)) {
      fs.mkdirSync(distPublicPath, { recursive: true });
    }
    
    // Copiar archivos importantes como embed.js, form-button.js, etc.
    const publicFiles = [
      'embed.js', 
      'form-button.js', 
      'simple-embed.js', 
      'fullscreen-embed.js'
    ];
    
    publicFiles.forEach(file => {
      const srcPath = path.join(publicPath, file);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(
          srcPath, 
          path.join(distPublicPath, file)
        );
        console.log(`✅ Archivo público copiado: ${file}`);
      }
    });
  }

  console.log('✅ Build optimizado correctamente');
} catch (error) {
  console.error('❌ Error durante la optimización:', error);
}