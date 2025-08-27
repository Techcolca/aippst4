# 🔧 Variables de Entorno para Railway - Configuración Exacta

## ✅ Variables que Railway detectó automáticamente:

### 1. **DATABASE_URL** 
- **NO cambiar el valor sugerido** - Railway lo genera automáticamente
- **Valor:** `postgresql://usuario:contraseña@localhost:5432/nombre_base` (Railway lo completa)
- **Descripción:** Conexión a PostgreSQL que Railway provisiona automáticamente

### 2. **NODE_ENV**
- **Valor correcto:** `production`
- **Descripción:** Modo producción para optimizaciones

### 3. **PORT**
- **Valor correcto:** `5000` 
- **Descripción:** Puerto donde correrá la aplicación

### 4. **JWT_SECRET**
- **Valor sugerido:** `tu_jwt_secreto_super_seguro_aqui`
- **Descripción:** Clave secreta para tokens de autenticación
- **Recomendación:** Cambia por una clave más fuerte si quieres

## 🔍 Variables adicionales que PODRÍAS necesitar (opcionales):

### **OPENAI_API_KEY** (Opcional para chat IA)
- **Valor:** Tu clave de OpenAI si quieres activar el chat inteligente
- **Descripción:** Para funciones de chatbot con IA

### **STRIPE_SECRET_KEY** (Opcional para pagos)
- **Valor:** Tu clave secreta de Stripe
- **Descripción:** Para procesar pagos y suscripciones

### **STRIPE_WEBHOOK_SECRET** (Opcional para webhooks Stripe)
- **Valor:** Clave webhook de Stripe
- **Descripción:** Para validar webhooks de pagos

## 🎯 Acción inmediata:

1. **Haz clic en "Add All"** para agregar las 4 variables sugeridas
2. **DATABASE_URL:** Deja el valor que Railway sugiere (automático)
3. **NODE_ENV:** Cambia a `production`
4. **PORT:** Deja `5000`
5. **JWT_SECRET:** Puedes usar `aipi_jwt_secret_2024_production` o generar uno más seguro

Después Railway desplegará automáticamente y creará todas las tablas.

**¿Procedes con "Add All" y estos valores?**