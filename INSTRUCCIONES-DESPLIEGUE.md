# Instrucciones para el Despliegue de AIPI en Replit

Este documento proporciona instrucciones paso a paso para desplegar correctamente la aplicación AIPI en Replit, asegurando que se despliegue exactamente la misma aplicación que se ejecuta en desarrollo.

## Problema Identificado

Se ha detectado que al desplegar la aplicación AIPI en Replit, la versión desplegada no coincide con la versión de desarrollo:

- **Versión de desarrollo (correcta)**: AIPI - Plataforma de IA Conversacional, con interfaz para widget, formularios, calendario y analítica.
- **Versión desplegada (incorrecta)**: Una interfaz diferente llamada "AI Interactive".

## Solución

Hemos creado scripts específicos para asegurar que se despliegue la versión correcta de AIPI.

## Instrucciones de Despliegue

### Opción 1: Despliegue Manual desde la Interfaz de Replit

1. Ve a la pestaña "Deployments" en Replit
2. Haz clic en el botón "Deploy"
3. En la sección de configuración (si aparece), establece:
   - **Build command**: `npm run build && node direct-deploy-aipi.cjs`
   - **Run command**: `node direct-deploy-aipi.cjs`

### Opción 2: Despliegue utilizando el Script Automatizado

1. Ejecuta el script de configuración:
   ```bash
   node configurar-despliegue-aipi.js
   ```

2. Ve a la pestaña "Deployments" en Replit
3. Haz clic en el botón "Deploy"
4. Espera a que se complete el despliegue

### Opción 3: Despliegue con Configuración Avanzada

Si las opciones anteriores no funcionan, puedes utilizar esta configuración más avanzada:

1. Ejecuta:
   ```bash
   node deploy-aipi.cjs
   ```

2. En la pestaña "Deployments", haz clic en "..." y selecciona "Settings"
3. Establece:
   - **Build command**: `npm run build && node deploy-aipi.cjs`
   - **Run command**: `node deploy-entry.cjs`

## Verificación del Despliegue

Para verificar que el despliegue se ha realizado correctamente, puedes:

1. Ejecutar:
   ```bash
   node replit.deploy.js
   ```

2. Visitar manualmente la URL del despliegue y verificar que muestra:
   - El título "AIPI - Plataforma de IA Conversacional"
   - Las secciones de Widget, Formularios, Calendario y Analítica
   - Soporte para múltiples idiomas

## Solución de Problemas

Si después del despliegue sigues viendo la interfaz incorrecta:

1. Intenta limpiar la caché del navegador o usar una ventana de incógnito
2. Verifica que no haya ningún problema con la compilación:
   ```bash
   npm run build
   ```
3. Prueba con otro de los scripts de despliegue proporcionados

## Configuración Adicional

Si necesitas personalizar más el despliegue, puedes editar los scripts:

- `direct-deploy-aipi.cjs`: Script principal para despliegue directo
- `deploy-aipi.cjs`: Script para preparación del entorno de despliegue
- `configurar-despliegue-aipi.js`: Script para generar archivos de configuración

---

Esta solución mantiene todas las funcionalidades y el diseño de tu aplicación AIPI mientras garantiza que el despliegue muestre exactamente la misma interfaz que ves en el entorno de desarrollo.