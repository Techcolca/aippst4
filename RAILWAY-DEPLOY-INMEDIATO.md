# 🚀 Deploy Inmediato en Railway - Proyecto Actualizado

## ✅ GitHub Actualizado - 472 Commits Listos

Tu repositorio ahora tiene:
- Sistema de personalización con nombre de usuario
- Control manual de color de texto 
- Contraste dinámico adaptativo
- Configuraciones Railway optimizadas
- 2 meses completos de desarrollo

## 🚂 PROCEDER CON RAILWAY AHORA

### PASO 1: Acceder a Railway
1. Ve a [railway.app](https://railway.app)
2. Haz clic en "Login"
3. Selecciona "Login with GitHub"

### PASO 2: Crear Proyecto
1. Haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Busca: `Techcolca/aipps-v2`
4. Seleccionar el repositorio

### PASO 3: Configurar Base de Datos
Railway detectará automáticamente que necesitas PostgreSQL:
1. Haz clic en "Add PostgreSQL" cuando aparezca
2. Railway creará automáticamente la base de datos
3. Variable `DATABASE_URL` se añadirá automáticamente

### PASO 4: Variables de Entorno Obligatorias
En la sección "Variables" añadir:

```
NODE_ENV=production
OPENAI_API_KEY=sk-tu-clave-openai-aqui
```

Variables opcionales:
```
STRIPE_SECRET_KEY=sk_live_tu-clave-stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_tu-clave-publica-stripe
SENDGRID_API_KEY=SG.tu-clave-sendgrid
```

### PASO 5: Deploy Automático
1. Railway iniciará el build automáticamente
2. Ejecutará `npm run build`
3. Correrá las migraciones de base de datos  
4. Iniciará con `npm run start`

### PASO 6: Obtener URL para Cloudflare
1. Una vez deployed, copiar la URL Railway
2. En Cloudflare DNS añadir registro CNAME:
   - Name: `app` (o lo que prefieras)
   - Target: `tu-proyecto-production.railway.app`
   - Proxy: Proxied (naranja)

## ⏱️ Tiempo Estimado: 5-7 minutos

- Build: 2-3 minutos
- Migraciones DB: 1-2 minutos  
- Inicio aplicación: 1-2 minutos

## 🎯 Una Vez Completado

Tendrás:
- ✅ Aplicación en producción
- ✅ Base de datos PostgreSQL
- ✅ Sistema personalización funcionando
- ✅ Widgets embebibles operativos
- ✅ SSL automático

**¡Listo para comenzar el deploy en Railway!**