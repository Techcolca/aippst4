# 🚀 Railway Deploy Inmediato - Información de Base de Datos

## 📋 Archivos clave para Railway encontrar y crear las tablas automáticamente:

### 1. **Schema Principal** (`shared/schema.ts`)
- **Contiene todas las tablas:** users, integrations, conversations, messages, automations, settings, pricing_plans, promotional_messages, forms, form_submissions, transactions, calendar_events, welcome_chat_settings
- **Relaciones definidas:** Foreign keys y referencias entre tablas
- **Tipos de datos:** PostgreSQL con Drizzle ORM

### 2. **Configuración Drizzle** (`drizzle.config.ts`)
- Apunta al schema: `"./shared/schema.ts"`
- Dialect: `"postgresql"`
- Conexión: usa `DATABASE_URL` de Railway

### 3. **Script de Migración** (`railway-migrate.js`)
- Ejecuta: `npx drizzle-kit push` 
- Crea todas las tablas automáticamente
- Verifica `DATABASE_URL`

### 4. **Scripts en package.json**
- `"db:push": "drizzle-kit push"` - Comando para crear tablas

## 🎯 Pasos Railway Deploy:

### Paso 1: Subir a GitHub
```bash
cd carpeta-proyecto-descomprimido
git init
git add .
git commit -m "Sistema completo - Railway ready"
git remote add origin https://github.com/Techcolca/aipps-v2-updated.git
git branch -M main
git push -u origin main
```

### Paso 2: Railway Deploy
1. **railway.app** → Login GitHub
2. **New Project** → Deploy from GitHub
3. **Seleccionar:** `aipps-v2-updated`
4. **Add PostgreSQL database**
5. **Variables de entorno:** (Railway las detecta automáticamente)
6. **Deploy** → Las tablas se crean automáticamente

## ✅ Railway creará estas tablas automáticamente:
- users (472 usuarios y datos)
- integrations (configuraciones widget) 
- conversations (historiales chat)
- messages (mensajes completos)
- automations (automatizaciones)
- settings (configuraciones)
- pricing_plans (planes de precios)
- promotional_messages (mensajes promocionales)
- forms (formularios dinámicos)
- form_submissions (envíos formularios)
- transactions (transacciones Stripe)
- calendar_events (eventos calendario)
- welcome_chat_settings (configuración chat bienvenida)

**¿Listo para hacer el git push y luego Railway deploy?**