# Guía de Despliegue en Railway (Español)

Esta guía te ayudará a desplegar tu aplicación AIPI en Railway de manera rápida y sencilla.

## Requisitos Previos

1. Una cuenta en [Railway](https://railway.app/)
2. Tu proyecto AIPI listo para desplegar desde GitHub
3. Claves de API necesarias (Stripe, etc.)

## Pasos para el Despliegue

### 1. Iniciar Sesión en Railway

- Ve a [Railway](https://railway.app/)
- Inicia sesión con tu cuenta o crea una nueva

### 2. Crear un Nuevo Proyecto

- Haz clic en "New Project"
- Selecciona "Deploy from GitHub repo"
- Conecta tu cuenta de GitHub si aún no lo has hecho
- Busca y selecciona tu repositorio AIPI

### 3. Configurar la Base de Datos PostgreSQL

- Después de crear el proyecto, haz clic en "New"
- Selecciona "Database" y luego "PostgreSQL"
- Railway creará automáticamente una instancia de PostgreSQL
- La variable de entorno `DATABASE_URL` se añadirá automáticamente a tu proyecto

### 4. Configurar Variables de Entorno

En la sección "Variables" de tu proyecto, añade las siguientes variables de entorno:

- `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe
- `VITE_STRIPE_PUBLIC_KEY`: Tu clave pública de Stripe
- `NODE_ENV`: Establece como "production"

Nota: Railway ya habrá añadido automáticamente `DATABASE_URL`.

### 5. Configurar la Implementación

Railway detectará automáticamente:
- El comando de construcción desde tu package.json
- El Procfile para iniciar tu aplicación

No necesitas configurar nada más, ya que hemos preparado los scripts necesarios para:
- Construir la aplicación
- Migrar la base de datos
- Iniciar el servidor

### 6. Desplegar

- Haz clic en "Deploy" 
- Railway comenzará a construir e implementar tu aplicación

### 7. Configurar Dominio (Opcional)

- Ve a la sección "Settings" de tu proyecto
- Haz clic en "Domains"
- Puedes usar un subdominio gratuito de Railway o configurar tu propio dominio personalizado

## Solución de Problemas

### Error en las Migraciones de Base de Datos

Si las migraciones de la base de datos fallan durante el despliegue:

1. Ve a la pestaña "Deployments" para ver los registros
2. Verifica que la variable `DATABASE_URL` esté correctamente configurada
3. Consulta los errores específicos en los registros

### Error de Stripe

Si tienes problemas con Stripe:

1. Verifica que las claves de API de Stripe estén correctamente configuradas
2. La aplicación seguirá funcionando incluso sin las claves de Stripe, aunque las funciones de pago no estarán disponibles

## Mantenimiento y Actualizaciones

Para actualizaciones futuras:

1. Haz cambios en tu repositorio de GitHub
2. Railway detectará los cambios y volverá a implementar automáticamente
3. Las migraciones de base de datos se ejecutarán automáticamente durante cada despliegue

---

Si necesitas ayuda adicional, consulta la [documentación oficial de Railway](https://docs.railway.app/) o contacta al soporte.