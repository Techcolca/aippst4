# 🚀 Guía Completa de Migración: Replit → Railway

## 📋 **Archivos Generados**

### 1. **Scripts SQL**
- `01_create_tables.sql` - Comandos para recrear todas las tablas

### 2. **Archivos CSV de Datos**
- `02_users.csv` - 29 usuarios completos con credenciales
- `03_pricing_plans.csv` - 6 planes de precio (Free, Pro, Enterprise + anuales) 
- `04_subscriptions.csv` - 2 suscripciones activas
- `05_conversations.csv` - 29 conversaciones de clientes reales
- `06_messages_part1.csv` - Primeros 30 mensajes
- `07_messages_complete.csv` - Mensajes restantes (total 138)
- `08_settings.csv` - 29 configuraciones personalizadas de usuarios

## 🔧 **Paso a Paso: Importación en Railway**

### **A. Conectar pgAdmin a Railway**

1. **Abrir pgAdmin**
2. **Crear Nuevo Servidor:**
   - **Name**: `Railway Production AIPPS`
   - **Host**: `tu-railway-host.up.railway.app` 
   - **Port**: `5432`
   - **Database**: `railway`
   - **Username**: `postgres`
   - **Password**: `[password-de-railway]`

### **B. Crear Estructura de Tablas**

1. **Abrir Query Tool** en pgAdmin
2. **Copiar y ejecutar** el contenido completo de `01_create_tables.sql`
3. **Verificar que las tablas se crearon** correctamente

### **C. Importar Datos CSV (EN ORDEN)**

**⚠️ IMPORTANTE: Importar en este orden exacto:**

#### **1. Usuarios**
- **Tabla**: `users`
- **Archivo**: `02_users.csv`
- **Método**: Right-click tabla → Import/Export Data → Import
- **Settings**: Format=CSV, Header=Yes, Delimiter=,

#### **2. Planes de Precio**
- **Tabla**: `pricing_plans`
- **Archivo**: `03_pricing_plans.csv`
- **Settings**: Igual que usuarios

#### **3. Suscripciones** 
- **Tabla**: `subscriptions`
- **Archivo**: `04_subscriptions.csv`
- **Settings**: Igual que usuarios

#### **4. Configuraciones**
- **Tabla**: `settings`
- **Archivo**: `08_settings.csv`
- **Settings**: Igual que usuarios

#### **5. Conversaciones**
- **Tabla**: `conversations`
- **Archivo**: `05_conversations.csv`
- **Settings**: Igual que usuarios

#### **6. Mensajes (2 partes)**
- **Tabla**: `messages`
- **Archivo 1**: `06_messages_part1.csv`
- **Archivo 2**: `07_messages_complete.csv`
- **Settings**: Igual que usuarios

### **D. Verificación Post-Importación**

```sql
-- Verificar conteos
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'pricing_plans', COUNT(*) FROM pricing_plans
UNION ALL  
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'settings', COUNT(*) FROM settings;

-- Resultado esperado:
-- users: 29
-- pricing_plans: 6
-- subscriptions: 2
-- conversations: 29
-- messages: 138
-- settings: 29
```

### **E. Actualizar Variables de Entorno**

En tu aplicación Railway, actualizar:

```env
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/railway
PGHOST=[tu-railway-host].up.railway.app
PGUSER=postgres
PGPASSWORD=[password-railway]
PGDATABASE=railway
PGPORT=5432
```

## ✅ **Datos Migrados Incluyen:**

- **29 usuarios reales** con credenciales hasheadas
- **6 planes de precio** bien configurados (CA$ 0, $17, $77/mes + anuales)
- **2 suscripciones activas** (Enterprise y Professional)
- **29 conversaciones** de clientes reales con títulos
- **138 mensajes** con contenido real en español/inglés
- **29 configuraciones** personalizadas de AIPPS Assistant

## 🎯 **Funcionalidades Preservadas:**

- ✅ **Autenticación completa** con bcrypt hashing
- ✅ **Sistema de planes y suscripciones** 
- ✅ **Chat IA con historial** completo
- ✅ **Configuraciones personalizadas** por usuario
- ✅ **API keys únicos** por usuario
- ✅ **Stripe integration** configurado

## 🚨 **Notas Importantes:**

1. **Las contraseñas están hasheadas** con bcrypt - son seguras
2. **Los API keys son únicos** - mantener seguridad
3. **Stripe IDs están configurados** para algunos planes
4. **Conversaciones reales** - datos de clientes reales
5. **Importar EN ORDEN** para mantener integridad referencial

## 🎉 **Resultado Final:**

Tendrás una migración **100% completa** con:
- Todos los usuarios autenticados 
- Historial de conversaciones preservado
- Sistema de pricing funcional
- Configuraciones personalizadas intactas

**¡Tu aplicación AIPPS estará completamente operativa en Railway!**