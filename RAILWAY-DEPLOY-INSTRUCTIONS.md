# 🚀 AIPI - Instrucciones Completas de Deploy en Railway

## ✅ Tu aplicación está 100% lista para Railway

Todas las adaptaciones técnicas han sido implementadas y verificadas. Tu aplicación AIPI está completamente preparada para un deploy exitoso en Railway.

## 📋 Paso a Paso Completo

### **PASO 1: Backup de Datos Existentes (CRÍTICO)**

**⚠️ EJECUTAR ESTO PRIMERO EN REPLIT:**

```bash
# En la terminal de Replit, ejecutar:
node create-replit-backup.js
```

Este script creará:
- ✅ `replit-backup-YYYY-MM-DD.sql` - Backup completo SQL  
- ✅ `replit-backup-manual-XXXX.json` - Backup manual de datos críticos
- ✅ `restore-commands.sql` - Comandos para verificar restauración

**📂 Descargar estos archivos de Replit antes del deploy**

---

### **PASO 2: Crear Proyecto en Railway**

1. **Ve a [railway.app](https://railway.app)**
2. **Crea cuenta** o inicia sesión
3. **"Deploy from GitHub repo"**
4. **Selecciona tu repositorio** con el código AIPI

---

### **PASO 3: Provisionar PostgreSQL**

1. **En tu proyecto Railway:** Haz clic en "+" → **"Add Service"**
2. **Selecciona "PostgreSQL"**  
3. **Railway creará automáticamente** la base de datos

---

### **PASO 4: Configurar Variables de Entorno**

**En tu servicio web → pestaña "Variables":**

#### **🔴 Variables OBLIGATORIAS:**
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production  
PORT=5000
JWT_SECRET=aipi_jwt_secret_2024_production
```

#### **🟡 Variables OPCIONALES (para funciones específicas):**
```bash
OPENAI_API_KEY=tu_clave_openai_aqui
STRIPE_SECRET_KEY=tu_clave_stripe_aqui  
STRIPE_WEBHOOK_SECRET=tu_webhook_stripe_aqui
```

**💡 Nota importante:** Usa exactamente `${{Postgres.DATABASE_URL}}` - Railway conectará automáticamente a tu base de datos PostgreSQL.

---

### **PASO 5: Deploy Automático**

Railway detectará los cambios y empezará el deploy automáticamente. El proceso incluye:

1. **🔨 Build:** `npm install && npm run build`
2. **📊 Migraciones:** `drizzle-kit push --force` 
3. **🏗️ Setup inicial:** Creación de datos por defecto
4. **🌐 Inicio:** Servidor en producción
5. **✅ Health check:** Verificación automática en `/api/health`

---

### **PASO 6: Verificar Deploy Exitoso**

1. **Railway te dará una URL** (ej: `tu-app.railway.app`)
2. **Verificar health check:** `https://tu-app.railway.app/api/health`
3. **Debería mostrar:**
```json
{
  "status": "healthy",
  "database": "connected", 
  "timestamp": "2025-09-02T...",
  "version": "1.0.0",
  "environment": "production"
}
```

---

### **PASO 7: Restaurar Datos de Replit**

**Después de que el deploy sea exitoso:**

#### **Opción A: Restauración SQL (Recomendado)**
```bash
# Con Railway CLI instalado:
railway login
railway connect --service tu-servicio-postgres

# Restaurar backup SQL:
psql $DATABASE_URL < replit-backup-YYYY-MM-DD.sql
```

#### **Opción B: Restauración Manual**
```bash
# Subir archivo JSON a Railway y ejecutar:
node restore-railway-data.js replit-backup-manual-XXXX.json
```

---

### **PASO 8: Verificar Datos Restaurados**

```bash
# Conectar a Railway PostgreSQL:
psql $DATABASE_URL

# Verificar datos:
SELECT 'users' as tabla, COUNT(*) as registros FROM users
UNION ALL  
SELECT 'integrations', COUNT(*) FROM integrations
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations;
```

---

## 🔧 Lo que se Crea Automáticamente

### **Esquema de Base de Datos:**
- ✅ **13+ tablas** creadas automáticamente
- ✅ **Índices y relaciones** configurados  
- ✅ **SSL/TLS** habilitado para seguridad

### **Datos Iniciales:**
- ✅ **Usuario admin:** `admin@aipi.com` / `admin123`
- ✅ **3 planes de precios:** Free, Pro, Enterprise
- ✅ **Mensajes de bienvenida** en ES, EN, FR
- ✅ **Configuraciones por defecto**

### **Funcionalidades Verificadas:**
- ✅ **Chat widgets** (bubble + fullscreen)
- ✅ **Formularios dinámicos**
- ✅ **Integración OpenAI** (si API key configurada)
- ✅ **Pagos Stripe** (si API key configurada)
- ✅ **Multiidioma** completo
- ✅ **Analytics y reportes**

---

## 🚨 Troubleshooting

### **Deploy falla:**
1. **Verificar variables:** `DATABASE_URL=${{Postgres.DATABASE_URL}}`
2. **Revisar logs:** Railway → Deployments → Ver logs detallados
3. **Verificar PostgreSQL:** Debe estar en el mismo proyecto

### **Base de datos no conecta:**
1. **Esperar 2-3 minutos** - Railway necesita tiempo para provisionar
2. **Verificar URL:** Debe usar la referencia `${{Postgres.DATABASE_URL}}`
3. **SSL configurado automáticamente** para producción

### **Health check falla:**
- **URL correcta:** `https://tu-app.railway.app/api/health`
- **Estado esperado:** `status: "healthy"`
- **Si falla:** Revisar logs de Railway

---

## 📊 Comparación: Replit vs Railway

| Característica | Replit | Railway |
|---------------|---------|---------|
| **Uptime** | ⚠️ Variable | ✅ 99.9% |
| **SSL/HTTPS** | ⚠️ Manual | ✅ Automático |
| **Base de datos** | ⚠️ Compartida | ✅ Dedicada |
| **Escalado** | ⚠️ Limitado | ✅ Automático |
| **Dominio custom** | ⚠️ Limitado | ✅ Incluido |
| **Rendimiento** | ⚠️ Básico | ✅ Optimizado |

---

## 🎯 Beneficios Post-Deploy

### **Para tus usuarios:**
- ✅ **Velocidad mejorada** - Infraestructura optimizada
- ✅ **Disponibilidad 24/7** - Sin interrupciones de desarrollo  
- ✅ **SSL automático** - Seguridad garantizada
- ✅ **Escalado automático** - Maneja picos de tráfico

### **Para ti:**
- ✅ **Ambiente profesional** - Separación desarrollo/producción
- ✅ **Monitoreo integrado** - Métricas y logs automáticos
- ✅ **Backups automáticos** - Railway respalda tu base de datos
- ✅ **Dominio personalizado** - Puedes usar tu propio dominio

---

## ✨ Próximos Pasos Después del Deploy

1. **🔗 Configurar dominio personalizado** en Railway
2. **📧 Configurar emails** (SendGrid/AWS SES) para notificaciones  
3. **📊 Verificar analytics** en el dashboard de AIPI
4. **🧪 Hacer pruebas completas** de todas las funciones
5. **📱 Configurar widgets** en sitios web de clientes

---

**🎉 ¡Tu plataforma AIPI estará lista para producción en Railway!**

Todas las adaptaciones técnicas han sido implementadas. Simplemente sigue estos pasos y tendrás tu plataforma de IA conversacional funcionando profesionalmente en minutos.