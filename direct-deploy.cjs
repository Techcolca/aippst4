/**
 * Despliegue directo de la aplicación AIPI
 * Este script ejecuta la aplicación exactamente como está,
 * modificando solamente el puerto para evitar conflictos
 */
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');

// Puerto personalizado para evitar conflictos
const PORT = process.env.PORT || 3000;
const INTERNAL_PORT = 3001;

console.log('🚀 Iniciando despliegue directo de la aplicación AIPI...');

// Verificar el entorno actual
try {
  // Verificar si estamos en un entorno de despliegue o de desarrollo
  const isDeployment = process.env.REPL_SLUG && process.env.REPL_OWNER;
  
  if (isDeployment) {
    console.log('Detectado entorno de despliegue Replit');
  } else {
    console.log('Detectado entorno de desarrollo local');
  }
  
  // Verificar que los directorios principales existan
  const directories = ['client', 'server', 'shared'];
  for (const dir of directories) {
    if (!fs.existsSync(`./${dir}`)) {
      console.error(`❌ Error crítico: No se encontró el directorio ${dir}`);
      process.exit(1);
    }
  }
  
  console.log('✅ Verificación de directorios exitosa');
} catch (error) {
  console.error('❌ Error en verificación inicial:', error);
}

// Crear enlaces simbólicos necesarios (si no existen)
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
    }
  } else {
    console.log('ℹ️ Enlace simbólico src ya existe');
  }
} catch (error) {
  console.error('❌ Error creando enlaces simbólicos:', error);
}

// Función para iniciar un proxy simple
function startProxy() {
  const app = express();
  
  console.log(`🔄 Iniciando proxy en puerto ${PORT} -> ${INTERNAL_PORT}`);
  
  // Ruta para verificar estado
  app.get('/deployment-status', (req, res) => {
    res.json({ 
      status: 'running',
      message: 'Servidor de despliegue funcionando correctamente',
      port: PORT,
      internalPort: INTERNAL_PORT,
      timestamp: new Date().toISOString()
    });
  });
  
  // Todo lo demás se envía al servidor interno
  app.use((req, res) => {
    const options = {
      hostname: 'localhost',
      port: INTERNAL_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    
    proxyReq.on('error', (err) => {
      console.error('Error en proxy:', err.message);
      
      if (!res.headersSent) {
        res.status(502).send('Error de conexión con la aplicación interna.');
      }
    });
    
    if (req.body) {
      proxyReq.write(JSON.stringify(req.body));
    }
    
    req.pipe(proxyReq, { end: true });
  });
  
  // Iniciar servidor proxy
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Proxy iniciado en puerto ${PORT}`);
  });
}

// Función principal para ejecutar la aplicación con puerto personalizado
function startApp() {
  console.log('🚀 Ejecutando aplicación AIPI original...');
  
  // Verificar si existe el archivo npm en PATH
  try {
    execSync('which npm');
    console.log('✅ npm encontrado en PATH');
  } catch (error) {
    console.error('❌ npm no encontrado en PATH, intentando usar el de Replit');
  }
  
  // Modificar el entorno para usar puerto personalizado
  const env = {
    ...process.env,
    PORT: INTERNAL_PORT.toString()
  };
  
  // Comando para iniciar aplicación
  const startCommand = 'npm run dev';
  console.log(`📋 Ejecutando: ${startCommand} (puerto: ${INTERNAL_PORT})`);
  
  // Ejecutar la aplicación
  const appProcess = spawn(startCommand, {
    shell: true,
    stdio: 'inherit',
    env
  });
  
  appProcess.on('error', (error) => {
    console.error(`❌ Error al iniciar la aplicación: ${error.message}`);
  });
  
  appProcess.on('close', (code) => {
    console.log(`⚠️ La aplicación se cerró con código: ${code}`);
    
    if (code !== 0) {
      console.log('🔄 Reiniciando la aplicación en 5 segundos...');
      setTimeout(startApp, 5000);
    }
  });
}

// Iniciar la aplicación y el proxy
startProxy(); // Primero iniciamos el proxy
setTimeout(() => {
  startApp(); // Después iniciamos la aplicación en el puerto interno
}, 1000);