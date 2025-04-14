# Guía de Despliegue de AIPI

Esta guía explica cómo desplegar correctamente la aplicación AIPI en Replit.

## Solución al Error 502

Si encuentras el error 502 (Bad Gateway) durante el despliegue, sigue estos pasos:

### Opción 1: Despliegue con servidor simplificado

1. **Usar el servidor de respaldo**:
   ```
   Comando de inicio: node server-prod.js
   ```

   Este servidor simplificado proporcionará una página de espera mientras se completa el build.

2. **Completar el build**:
   Mientras la aplicación está desplegada con el servidor de respaldo, ejecuta manualmente:
   ```bash
   npm run build
   ```
   
   Este proceso puede tardar varios minutos debido al tamaño de la aplicación.

3. **Actualizar el despliegue**:
   Una vez completado el build, actualiza la configuración de despliegue:
   ```
   Comando de inicio: npm run start
   ```

### Opción 2: Build en dos pasos

1. **Configuración de despliegue inicial**:
   ```
   Build Command: npm run build
   Start Command: node server-prod.js
   ```

2. **Después del primer despliegue exitoso**:
   Cambia a:
   ```
   Build Command: npm run build
   Start Command: npm run start
   ```

## Configuración de Dominio Personalizado

Una vez que la aplicación esté desplegada correctamente:

1. Ve al panel de control de despliegue
2. Selecciona "Domains" en la barra lateral
3. Haz clic en "Add Custom Domain"
4. Ingresa tu dominio personalizado y sigue las instrucciones

## Variables de Entorno

Asegúrate de que todas estas variables de entorno estén configuradas en el entorno de despliegue:

- `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL
- `OPENAI_API_KEY`: Clave de API de OpenAI
- `JWT_SECRET`: Secreto para firmar tokens JWT
- `VITE_STRIPE_PUBLIC_KEY`: Clave pública de Stripe (si se usa)
- `STRIPE_SECRET_KEY`: Clave secreta de Stripe (si se usa)
- `GOOGLE_CLIENT_ID`: ID de cliente de Google OAuth (para Google Calendar)
- `GOOGLE_CLIENT_SECRET`: Secreto de cliente de Google OAuth

## Solución de Problemas

### Error al compilar

Si el proceso de build falla:

1. Intenta ejecutar `npm run build` localmente antes de desplegar
2. Verifica que todas las dependencias estén correctamente instaladas

### Error de conexión a la base de datos

1. Comprueba que la variable `DATABASE_URL` es correcta
2. Verifica que la base de datos está en funcionamiento

### Problemas con el flujo OAuth

1. Asegúrate de que las URLs de redirección en la consola de Google coincidan exactamente 
   con la URL de tu aplicación desplegada

## Recursos Adicionales

- [Panel de despliegue de Replit](https://replit.com/deployments)
- [Documentación de Replit sobre despliegues](https://docs.replit.com/hosting/deployments/introduction-to-deployments)