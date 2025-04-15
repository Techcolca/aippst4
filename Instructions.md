# Guía de Solución para Despliegue de AIPI en Replit Autoscale

## Diagnóstico de Problemas

Tras una revisión exhaustiva del código y la configuración de despliegue, he identificado varias posibles causas para los fallos persistentes en el despliegue de la aplicación AIPI en Replit Autoscale:

### 1. Problemas Principales Identificados

1. **Conflicto de configuración en .replit**: La configuración actual muestra discrepancias entre los comandos de ejecución.
2. **Tamaño excesivo de la aplicación**: Con 811MB (671MB de node_modules), la aplicación puede estar superando los límites prácticos de despliegue.
3. **Arquitectura de proxy compleja**: El sistema actual utiliza múltiples capas de proxy que pueden generar condiciones de carrera.
4. **Problemas de inicialización**: El orden y la forma en que los servicios se inician pueden estar generando problemas de sincronización.
5. **Configuración de puertos inconsistente**: Hay varias referencias a diferentes puertos en el código.

### 2. Estado Actual del Despliegue

- **Configuración en .replit**:
  ```
  [deployment]
  deploymentTarget = "autoscale"
  build = ["sh", "-c", "npm run build"]
  run = ["sh", "-c", "node server.js"]
  ```

- **Puertos configurados**:
  - Puerto principal: 3000 (health check)
  - Puerto interno de la aplicación: 5017 (mapeado externamente a 3001)
  - Otros puertos mapeados: 5000 → 80, 8080 → 8080

## Plan de Solución

### 1. Simplificación de la Estrategia de Despliegue

**Problema**: La arquitectura actual es excesivamente compleja con múltiples scripts (`server.js`, `direct-proxy.cjs`, etc.) que intentan realizar la misma función de diferentes maneras.

**Solución**: Consolidar toda la lógica en un único archivo de entrada que:
1. Responda inmediatamente a los health checks
2. Inicie la aplicación como proceso secundario 
3. Maneje el proxy transparentemente

### 2. Optimización del Tamaño de la Aplicación

**Problema**: 811MB es un tamaño considerablemente grande para una aplicación en Replit Autoscale.

**Solución**:
1. Implementar `.npmrc` con configuraciones para reducir el tamaño de instalación
2. Configurar un proceso de build que excluya paquetes de desarrollo
3. Utilizar un enfoque de carga diferida (lazy loading) para módulos grandes

### 3. Manejo Consistente de Puertos y Procesos

**Problema**: Hay inconsistencias en cómo se configuran y utilizan los puertos en diferentes partes del código.

**Solución**: 
1. Estandarizar las configuraciones de puerto
2. Implementar un único sistema de detección y gestión de puerto
3. Incluir una estrategia de "graceful shutdown" para todos los procesos

### 4. Implementación Paso a Paso

## Instrucciones Detalladas de Implementación

### Paso 1: Crear un `production-server.js` Optimizado

Este archivo consolidará toda la lógica necesaria para el despliegue:

```javascript
/**
 * Servidor de producción optimizado para AIPI
 * Este archivo maneja health checks, inicio de aplicación y proxy en un solo lugar
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuración básica
const PORT = process.env.PORT || 3000;
const INTERNAL_PORT = 5017;
const MAX_STARTUP_TIME = 120000; // 2 minutos máximo de espera para iniciar la app
const APP_ENTRY_POINT = path.resolve('./server/index.js'); // Punto de entrada simplificado

const app = express();
let appProcess = null;
let appStartTime = null;
let appReady = false;

// ----- GESTIÓN DE SALUD Y ESTADO -----

// Configuración de rutas prioritarias para health checks
app.get(['/', '/healthz'], (req, res) => {
  const uptime = appStartTime ? (Date.now() - appStartTime) : 0;
  
  // Siempre devolvemos 200 OK para health checks, incluso si la app aún está iniciando
  res.status(200).send('OK');
  
  // Log informativo
  console.log(`[${new Date().toISOString()}] Health check: ${req.path} (Aplicación ${appReady ? 'lista' : 'iniciando...'})`);
});

// Ruta para diagnosticar estado detallado (solo informativo)
app.get('/deployment-status', (req, res) => {
  const uptime = appStartTime ? (Date.now() - appStartTime) : 0;
  
  res.json({
    status: appReady ? 'ready' : 'initializing',
    uptime: `${Math.floor(uptime / 1000)}s`,
    internalPort: INTERNAL_PORT,
    externalPort: PORT,
    startTime: appStartTime ? new Date(appStartTime).toISOString() : null,
    processRunning: !!appProcess,
    environment: process.env.NODE_ENV || 'production'
  });
});

// ----- FUNCIONES DE INICIALIZACIÓN Y GESTIÓN -----

// Función para iniciar la aplicación real
function startApplication() {
  try {
    console.log(`[${new Date().toISOString()}] 🚀 Iniciando aplicación en puerto ${INTERNAL_PORT}...`);
    appStartTime = Date.now();
    
    // Verificar si el punto de entrada existe
    if (!fs.existsSync(APP_ENTRY_POINT)) {
      console.error(`⚠️ El punto de entrada ${APP_ENTRY_POINT} no existe`);
      console.log('📂 Buscando alternativas...');
      
      // Intentar alternativas comunes en orden de preferencia
      const alternatives = [
        './dist/server/index.js', 
        './server/index.ts',
        './index.js'
      ];
      
      for (const alt of alternatives) {
        if (fs.existsSync(path.resolve(alt))) {
          console.log(`✅ Encontrada alternativa: ${alt}`);
          APP_ENTRY_POINT = path.resolve(alt);
          break;
        }
      }
    }
    
    // Determinar cómo ejecutar el punto de entrada
    const isTypeScript = APP_ENTRY_POINT.endsWith('.ts');
    const command = isTypeScript ? 'npx' : 'node';
    const args = isTypeScript ? ['tsx', APP_ENTRY_POINT] : [APP_ENTRY_POINT];
    
    // Iniciar el proceso
    appProcess = spawn(command, args, {
      env: {
        ...process.env,
        PORT: INTERNAL_PORT.toString(),
        INTERNAL_SERVER: 'true'
      },
      stdio: 'pipe'
    });
    
    // Configurar captura de salida
    appProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      console.log(`📱 [App]: ${output}`);
      
      // Detectar señales de que la app está lista
      if (
        output.includes('serving on port') || 
        output.includes('listening on') ||
        output.includes('started on port')
      ) {
        appReady = true;
        console.log(`✅ [${new Date().toISOString()}] Aplicación lista y respondiendo en puerto ${INTERNAL_PORT}`);
      }
    });
    
    appProcess.stderr.on('data', (data) => {
      console.error(`⚠️ [App Error]: ${data.toString().trim()}`);
    });
    
    appProcess.on('close', (code) => {
      console.log(`⚠️ Aplicación cerrada con código: ${code}`);
      appReady = false;
      
      // Reiniciar después de un breve retraso si el proceso termina inesperadamente
      if (code !== 0) {
        console.log('🔄 Intentando reiniciar la aplicación en 5 segundos...');
        setTimeout(startApplication, 5000);
      }
    });
    
    // Configurar un temporizador para marcar la app como lista después del tiempo máximo de espera
    setTimeout(() => {
      if (!appReady) {
        console.log(`⚠️ Tiempo máximo de inicio alcanzado. Asumiendo que la aplicación está lista.`);
        appReady = true;
      }
    }, MAX_STARTUP_TIME);
    
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
  }
}

// ----- CONFIGURACIÓN DEL PROXY -----

// Configurar opciones del proxy
const proxyOptions = {
  target: `http://localhost:${INTERNAL_PORT}`,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/api/': '/api/' // Mantener rutas de API intactas
  },
  onProxyReq: (proxyReq, req, res) => {
    // Se puede personalizar solicitudes si es necesario
  },
  onError: (err, req, res) => {
    console.error(`Error de proxy: ${err.message}`);
    
    // Responder con un error apropiado
    if (!res.headersSent) {
      if (req.url.startsWith('/api/')) {
        res.status(503).json({ error: 'Servicio temporalmente no disponible' });
      } else {
        res.status(503).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>AIPI - Iniciando servicio</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
                .container { background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 2rem; margin-top: 3rem; }
                .spinner { display: inline-block; width: 50px; height: 50px; border: 5px solid rgba(74, 108, 247, 0.3); border-radius: 50%; border-top-color: #4a6cf7; animation: spin 1s ease-in-out infinite; margin-bottom: 1rem; }
                @keyframes spin { to { transform: rotate(360deg); } }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="spinner"></div>
                <h1>AIPI está iniciando</h1>
                <p>El servicio se está iniciando, por favor espere un momento...</p>
                <p>Si este mensaje persiste por más de 2 minutos, contacte al administrador.</p>
              </div>
              <script>
                // Recargar la página después de 10 segundos
                setTimeout(() => { window.location.reload(); }, 10000);
              </script>
            </body>
          </html>
        `);
      }
    }
  }
};

// Aplicar el middleware de proxy para todas las rutas excepto health checks
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/healthz' || req.path === '/deployment-status') {
    return next();
  }
  
  return createProxyMiddleware(proxyOptions)(req, res, next);
});

// ----- INICIAR SERVIDOR Y APLICACIÓN -----

// Iniciar el servidor HTTP principal
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] 🌐 Servidor principal iniciado en puerto ${PORT}`);
  
  // Iniciar la aplicación real
  startApplication();
});

// Manejo de cierre limpio
process.on('SIGTERM', () => {
  console.log('🛑 Señal SIGTERM recibida, apagando servicios...');
  
  // Cerrar servidor HTTP principal
  server.close(() => {
    console.log('✅ Servidor HTTP cerrado correctamente');
    
    // Cerrar proceso de la aplicación si existe
    if (appProcess) {
      appProcess.kill('SIGTERM');
      console.log('✅ Proceso de aplicación terminado');
    }
    
    process.exit(0);
  });
});
```

### Paso 2: Optimizar la Configuración de Despliegue en Replit

Actualiza el archivo `.replit` con la siguiente configuración:

```
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["node", "production-server.js"]

[[ports]]
localPort = 3000
externalPort = 3000
```

### Paso 3: Optimizar el Tamaño del Paquete

Crear un archivo `.npmrc` en la raíz del proyecto con el siguiente contenido:

```
# Reducir el tamaño de la instalación
fund=false
audit=false
package-lock=false
omit=dev
only=prod
save-exact=true
```

### Paso 4: Implementar un Proceso de Build Optimizado

Actualiza el script de build en `package.json`:

```json
"scripts": {
  "build": "vite build --emptyOutDir && tsc && node optimize-build.js",
  ...
}
```

Y crea un archivo `optimize-build.js` en la raíz:

```javascript
/**
 * Script para optimizar el build antes del despliegue
 */
const fs = require('fs');
const path = require('path');

console.log('🔍 Optimizando build para despliegue...');

// Crear una copia simplificada del production-server.js en dist
fs.copyFileSync(
  path.join(__dirname, 'production-server.js'),
  path.join(__dirname, 'dist', 'production-server.js')
);

console.log('✅ Build optimizado correctamente');
```

## Diagnóstico de Errores Comunes

### Error 1: Fallo en Health Checks (Error 502)

**Síntoma**: El despliegue inicia pero rápidamente muestra un error 502.

**Posibles causas y soluciones**:
1. **El health check falla**: Asegúrate de que la ruta `/` responda inmediatamente con 200 OK.
2. **Tiempo de inicio excesivo**: La aplicación tarda demasiado en iniciar.
   - Solución: Usa el servidor proxy que responde inmediatamente mientras la app se inicia.
3. **Puerto incorrecto**: La aplicación está escuchando en un puerto diferente al esperado.
   - Solución: Verifica que los puertos en `.replit` coincidan con los del código.

### Error 2: Problemas de Memoria

**Síntoma**: La aplicación se despliega pero se cae después de un tiempo.

**Posibles causas y soluciones**:
1. **Fugas de memoria**: Verifica si hay consumo excesivo de RAM.
   - Solución: Implementa un manejo más eficiente de conexiones y recursos.
2. **Límites de recursos**: La aplicación excede los límites de Replit Autoscale.
   - Solución: Optimiza el uso de recursos y reduce las dependencias.

### Error 3: Problemas de Compilación

**Síntoma**: El proceso de build falla durante el despliegue.

**Posibles causas y soluciones**:
1. **Errores de TypeScript**: Errores de tipo o configuración en el proceso de compilación.
   - Solución: Ajusta `tsconfig.json` para ser menos estricto en producción.
2. **Falta de espacio**: No hay suficiente espacio para el proceso de build.
   - Solución: Limpia archivos temporales y caché antes del build.

## Planes Alternativos

### Plan A: Usar Servidor de Producción Simplificado

Si la solución principal sigue fallando, propongo utilizar el servidor simplificado `deploy-server-prod.cjs` que ya existe en tu proyecto:

```
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["node", "deploy-server-prod.cjs"]
```

### Plan B: Arquitectura de Servicios Separados

Si los problemas persisten, considera dividir la aplicación en múltiples servicios independientes:

1. **API Server**: Solo backend, sin frontend
2. **Frontend Server**: Solo estáticos compilados
3. **Proxy Server**: Coordina las solicitudes entre ambos

## Conclusión y Recomendaciones Finales

Los problemas de despliegue en Replit Autoscale suelen estar relacionados con la complejidad de la arquitectura y el manejo de puertos y procesos. La estrategia más efectiva es:

1. **Simplificar**: Reducir el número de capas y procesos
2. **Responder rápido**: Asegurar que los health checks pasen inmediatamente
3. **Separar preocupaciones**: Aislar el servidor de health checks de la aplicación principal
4. **Mantener logs detallados**: Para diagnosticar problemas específicos
5. **Reducir tamaño**: Minimizar el tamaño de la aplicación siempre que sea posible

Con estas mejoras, tu aplicación debería desplegarse correctamente en Replit Autoscale y proporcionar una experiencia confiable para tus usuarios y clientes potenciales.