# Instrucciones de Despliegue para AIPI

## Pasos para un despliegue exitoso

### 1. Configuración Inicial (Resuelve el error 502)
```
Start Command: node deploy-server-prod.cjs
```

### 2. Verificación
- Verifica que la aplicación esté funcionando correctamente en tu dominio
- Deberías ver la página principal de AIPI

### 3. Configuración de Dominio Personalizado (Opcional)
- En el panel de despliegue, ve a la sección "Domains"
- Añade tu dominio personalizado y sigue las instrucciones

### 4. Solución de Problemas Comunes

#### Error 502 (Bad Gateway)
Si sigues viendo este error:
1. Asegúrate de usar exactamente el comando: `node deploy-server-prod.cjs`
2. Verifica que el archivo existe en la raíz del proyecto

#### Error de Autenticación
Para probar el inicio de sesión, usa:
- Usuario: admin
- Contraseña: admin1726

## Variables de Entorno Requeridas
Asegúrate de que estas variables estén configuradas en el entorno de despliegue:
- `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL
- `JWT_SECRET`: Secreto para firmar tokens JWT
- `OPENAI_API_KEY`: Clave de API de OpenAI

## Notas Adicionales
- El servidor de producción incluye endpoints básicos simulados
- Para un despliegue completo, considera ejecutar el build completo una vez que este servidor intermedio esté funcionando
