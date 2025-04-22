# Guía Paso a Paso para Desplegar en Railway.app

## Requisitos Previos

1. Tener una cuenta en [Railway.app](https://railway.app/)
2. Tener el código de la aplicación en un repositorio Git (GitHub, GitLab, etc.)

## Paso 1: Preparar el Repositorio

Asegúrate de tener los siguientes archivos en tu repositorio:

- `railway.json` (ya creado)
- `.env.example` (ya creado)
- `Procfile` (ya creado)
- `.npmrc` (ya creado)
- `.gitignore` (ya creado)

## Paso 2: Configurar Railway.app

### Desde la Interfaz Web

1. Inicia sesión en [Railway.app](https://railway.app/)
2. Haz clic en "New Project" → "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Railway detectará automáticamente el proyecto Node.js

### Configuración Manual del Proyecto

Si Railway no detecta automáticamente la configuración:

1. Selecciona "Deploy from GitHub repo"
2. Elige tu repositorio
3. Configura el "Start Command" como `npm start`
4. Configura el "Build Command" como `npm run build`

## Paso 3: Configurar Variables de Entorno

En la sección "Variables", configura las siguientes:

```
NODE_ENV=production
PORT=3000 (Railway establecerá esto automáticamente, pero puedes definirlo)
DATABASE_URL=<El valor lo generará Railway si agregas un servicio de PostgreSQL>
JWT_SECRET=<Genera un valor aleatorio seguro>
APP_URL=<La URL de tu aplicación en Railway>
```

## Paso 4: Configurar la Base de Datos

1. Haz clic en "New" → "Database" → "PostgreSQL"
2. Railway conectará automáticamente la base de datos a tu proyecto y configurará la variable `DATABASE_URL`
3. Para ejecutar migraciones, ve a la pestaña "Settings" → "Shell" y ejecuta:
   ```
   npm run db:push
   ```

## Paso 5: Dominios y HTTPS

1. Ve a la pestaña "Settings" → "Domains"
2. Railway proporciona un dominio gratuito para tu aplicación (ej. tu-app.up.railway.app)
3. También puedes configurar un dominio personalizado

## Paso 6: Monitoreo

1. Railway proporciona logs en tiempo real en la pestaña "Deployments"
2. También puedes ver el uso de recursos en la pestaña "Metrics"

## Solución de Problemas Comunes

### La Aplicación No Inicia

1. Revisa los logs en la pestaña "Deployments"
2. Asegúrate de que todas las variables de entorno estén configuradas
3. Verifica que el comando `npm start` funcione correctamente

### Errores de Base de Datos

1. Verifica que la conexión a la base de datos funcione
2. Asegúrate de haber ejecutado las migraciones
3. Verifica que la variable `DATABASE_URL` esté correctamente configurada

### Problemas de Rendimiento

1. Ajusta los recursos de tu proyecto en la sección "Settings" → "Resources"
2. Considera agregar más instancias para manejar más tráfico

## Buenas Prácticas

1. Habilita despliegues automáticos desde tu repositorio Git
2. Usa branches de desarrollo para probar cambios antes de desplegar a producción
3. Monitorea regularmente los logs y el rendimiento
4. Configura notificaciones para eventos importantes del proyecto

## Comprobar que la Aplicación Funciona

Después del despliegue, visita la URL proporcionada por Railway para verificar que tu aplicación funciona correctamente. Asegúrate de probar todas las funcionalidades críticas.

## Recursos Adicionales

- [Documentación oficial de Railway](https://docs.railway.app/)
- [Guía de precios de Railway](https://railway.app/pricing)
- [Comunidad de Railway en Discord](https://discord.com/invite/railway)