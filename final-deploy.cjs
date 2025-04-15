/**
 * Configuración de despliegue final para AIPI
 * Modifica directamente los archivos necesarios para el despliegue correcto
 */
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Puertos para evitar conflictos
const PORT = process.env.PORT || 3000;
const DEV_PORT = 3001;

console.log('🚀 Iniciando configuración final para AIPI...');

// Función para modificar temporalmente el código del servidor
function patchServerFile() {
  try {
    const serverPath = path.join(process.cwd(), 'server', 'index.ts');
    
    if (!fs.existsSync(serverPath)) {
      console.error('❌ No se encontró el archivo del servidor');
      return false;
    }
    
    console.log('📝 Modificando temporalmente archivo del servidor...');
    
    // Leer el contenido actual
    let serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Buscar la línea que configura el puerto
    const portRegex = /const PORT\s*=\s*(?:process\.env\.PORT\s*\|\|\s*)?(\d+)/;
    const listenRegex = /app\.listen\(\s*(?:PORT|process\.env\.PORT\s*\|\|\s*\d+)/;
    
    if (portRegex.test(serverContent)) {
      // Reemplazar la definición del puerto
      serverContent = serverContent.replace(portRegex, `const PORT = ${DEV_PORT}`);
      console.log(`✓ Puerto modificado a ${DEV_PORT}`);
    } else {
      console.log('⚠️ No se encontró la definición de puerto. Intentando modificar el listen directamente.');
    }
    
    if (listenRegex.test(serverContent)) {
      // Reemplazar la llamada a listen
      serverContent = serverContent.replace(listenRegex, `app.listen(${DEV_PORT}`);
      console.log('✓ Llamada a listen modificada');
    } else {
      console.log('⚠️ No se encontró la llamada a listen para modificar');
    }
    
    // Guardar el archivo modificado
    fs.writeFileSync(serverPath, serverContent);
    
    return true;
  } catch (error) {
    console.error('❌ Error al modificar el archivo del servidor:', error);
    return false;
  }
}

// Función para modificar múltiples archivos si el método principal falla
function patchAdditionalFiles() {
  try {
    // Buscar archivos que puedan tener configuración de puerto
    const files = [
      path.join(process.cwd(), 'server', 'index.ts'),
      path.join(process.cwd(), 'server', 'index.js'),
      path.join(process.cwd(), 'server', 'server.ts'),
      path.join(process.cwd(), 'server', 'server.js'),
      path.join(process.cwd(), 'server', 'app.ts'),
      path.join(process.cwd(), 'server', 'app.js')
    ];
    
    let modifiedAny = false;
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        console.log(`Verificando archivo: ${file}`);
        
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;
        
        // Patrones comunes para definición de puerto
        const patterns = [
          { regex: /const PORT\s*=\s*(?:process\.env\.PORT\s*\|\|\s*)?(\d+)/, replacement: `const PORT = ${DEV_PORT}` },
          { regex: /app\.listen\(\s*(?:PORT|process\.env\.PORT\s*\|\|\s*\d+)/, replacement: `app.listen(${DEV_PORT}` },
          { regex: /listen\(\s*(?:PORT|process\.env\.PORT\s*\|\|\s*\d+)/, replacement: `listen(${DEV_PORT}` },
          { regex: /port:\s*(?:PORT|process\.env\.PORT\s*\|\|\s*\d+)/, replacement: `port: ${DEV_PORT}` }
        ];
        
        for (const pattern of patterns) {
          if (pattern.regex.test(content)) {
            content = content.replace(pattern.regex, pattern.replacement);
            modified = true;
          }
        }
        
        if (modified) {
          fs.writeFileSync(file, content);
          console.log(`✅ Archivo modificado: ${file}`);
          modifiedAny = true;
        }
      }
    }
    
    return modifiedAny;
  } catch (error) {
    console.error('❌ Error al modificar archivos adicionales:', error);
    return false;
  }
}

// Función para crear el archivo proxy auxiliar
function createAuxiliaryScript() {
  try {
    const proxyPath = path.join(process.cwd(), 'proxy-patch.cjs');
    const content = `
    /**
     * Script de parcheo para proxy AIPI
     * Este archivo se crea automáticamente durante el despliegue
     */
    process.env.PORT = "${DEV_PORT}";
    require('./server/index.ts');
    `;
    
    fs.writeFileSync(proxyPath, content);
    console.log('✅ Script auxiliar de proxy creado');
    return true;
  } catch (error) {
    console.error('❌ Error al crear script auxiliar:', error);
    return false;
  }
}

// Función para crear enlaces simbólicos necesarios
function createSymlinks() {
  try {
    // Enlace src -> client/src (crucial para el funcionamiento correcto)
    if (!fs.existsSync('./src')) {
      if (fs.existsSync('./client/src')) {
        try {
          fs.symlinkSync('./client/src', './src', 'dir');
          console.log('✅ Enlace simbólico creado: ./client/src -> ./src');
        } catch (e) {
          console.log('⚠️ No se pudo crear enlace simbólico. Intentando aproximación alternativa.');
          // Si falló el symlink, intentar ejecutar comando en shell
          execSync('ln -sf ./client/src ./src');
          console.log('✅ Enlace creado vía shell command');
        }
      } else {
        console.error('❌ No se puede crear enlace: ./client/src no existe');
        return false;
      }
    } else {
      console.log('ℹ️ Enlace simbólico src ya existe');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error creando enlaces simbólicos:', error);
    return false;
  }
}

// Servidor proxy para redirigir solicitudes al puerto interno
function startProxyServer() {
  const app = express();
  
  // Log middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
  
  // Endpoint de estado (para verificación)
  app.get('/deployment-status', (req, res) => {
    res.json({
      status: 'running',
      timestamp: new Date().toISOString(),
      port: PORT,
      internalPort: DEV_PORT
    });
  });
  
  // Configurar proxy para redirigir todo lo demás
  app.use('/', createProxyMiddleware({
    target: `http://localhost:${DEV_PORT}`,
    changeOrigin: true,
    ws: true,
    onProxyReq: (proxyReq, req, res) => {
      // Agregar encabezados personalizados si es necesario
    },
    onError: (err, req, res) => {
      console.error('Error de proxy:', err);
      
      if (!res.headersSent) {
        res.status(502).send(`
          <html>
            <head>
              <title>Error de Conexión</title>
              <style>
                body { font-family: -apple-system, system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .error { background: #fff2f0; border-left: 4px solid #ff4d4f; padding: 16px; margin: 16px 0; }
                .btn { display: inline-block; padding: 8px 16px; background: #4a6cf7; color: white; 
                      border-radius: 4px; text-decoration: none; margin-right: 10px; }
              </style>
            </head>
            <body>
              <h1>Error de Conexión</h1>
              <div class="error">
                <p><strong>No se pudo conectar con la aplicación AIPI.</strong></p>
                <p>La aplicación puede estar iniciándose o experimentando un problema temporal.</p>
              </div>
              <p>Por favor, intenta recargar la página en unos momentos.</p>
              <a href="/" class="btn">Volver al inicio</a>
            </body>
          </html>
        `);
      }
    }
  }));
  
  // Iniciar servidor proxy
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌍 Servidor proxy AIPI iniciado en puerto ${PORT} -> ${DEV_PORT}`);
  });
  
  // Manejar errores
  server.on('error', (err) => {
    console.error('Error en servidor proxy:', err);
  });
}

// Función principal para iniciar la aplicación
function startApp() {
  console.log('🚀 Ejecutando aplicación AIPI en puerto interno...');
  
  // Iniciar aplicación usando el proxy auxiliar
  const appProcess = spawn('tsx', ['proxy-patch.cjs'], {
    stdio: 'inherit'
  });
  
  appProcess.on('error', (error) => {
    console.error(`❌ Error al iniciar la aplicación: ${error.message}`);
    
    // Intentar alternativa con node
    console.log('⚠️ Intentando método alternativo...');
    const altProcess = spawn('node', ['-r', 'tsx/cjs', 'proxy-patch.cjs'], {
      stdio: 'inherit'
    });
    
    altProcess.on('error', (err) => {
      console.error(`❌ Error en método alternativo: ${err.message}`);
    });
  });
  
  appProcess.on('close', (code) => {
    console.log(`⚠️ Aplicación cerrada con código: ${code}`);
    
    if (code !== 0) {
      console.log('🔄 Reiniciando en 5 segundos...');
      setTimeout(startApp, 5000);
    }
  });
}

// Función principal para despliegue
async function deploy() {
  // 1. Crear enlaces simbólicos
  createSymlinks();
  
  // 2. Intentar modificar el servidor
  let success = patchServerFile();
  
  if (!success) {
    console.log('⚠️ Fallo en modificación principal, intentando métodos alternativos...');
    success = patchAdditionalFiles();
  }
  
  // 3. Crear script auxiliar como respaldo
  createAuxiliaryScript();
  
  // 4. Iniciar proxy
  startProxyServer();
  
  // 5. Iniciar aplicación con retraso para que el proxy esté listo
  setTimeout(() => {
    startApp();
  }, 1000);
}

// Ejecutar función principal
deploy();