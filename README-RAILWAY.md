# Instrucciones para Desplegar en Railway.app

## Preparación

1. Crea una cuenta en [Railway.app](https://railway.app/) si aún no tienes una
2. Instala el CLI de Railway:
   ```
   npm i -g @railway/cli
   ```
3. Inicia sesión con el CLI:
   ```
   railway login
   ```

## Despliegue

### Opción 1: Despliegue desde la interfaz web

1. Conecta tu repositorio de GitHub a Railway
2. Railway detectará automáticamente la configuración del proyecto
3. Configura las variables de entorno necesarias (ver más abajo)
4. Railway construirá y desplegará automáticamente la aplicación

### Opción 2: Despliegue desde el CLI

1. Crea un nuevo proyecto en Railway:
   ```
   railway init
   ```
2. Despliega tu código:
   ```
   railway up
   ```
3. Configura las variables de entorno:
   ```
   railway vars set DATABASE_URL=tu_url_de_postgres JWT_SECRET=tu_jwt_secret
   ```

## Variables de Entorno Requeridas

Asegúrate de configurar estas variables en Railway:

- `DATABASE_URL`: URL de conexión a PostgreSQL (Railway puede crear esto automáticamente si agregas un servicio de PostgreSQL)
- `NODE_ENV`: Establécelo como "production"
- `JWT_SECRET`: Una cadena aleatoria y segura para firmar tokens JWT
- Otras variables específicas de tu aplicación (API keys, etc.)

## Base de Datos

1. En Railway, agrega un servicio de PostgreSQL
2. Railway generará automáticamente la variable `DATABASE_URL`
3. Ejecuta las migraciones:
   ```
   railway run npm run db:push
   ```

## Mantenimiento

- Para ver los logs:
  ```
  railway logs
  ```
- Para actualizar la aplicación después de cambios:
  ```
  railway up
  ```

## Dominio Personalizado

1. En la interfaz web de Railway, ve a Settings > Domains
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar los registros DNS

## Solución de Problemas Comunes

- **Error de conexión a la base de datos**: Verifica que `DATABASE_URL` esté correctamente configurado
- **Error en el build**: Asegúrate de que todos los archivos necesarios estén incluidos en el repositorio
- **Error en el tiempo de ejecución**: Revisa los logs con `railway logs`