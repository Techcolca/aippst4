# 🚀 Guía Completa de Deploy en Railway con Dominio Cloudflare

Esta guía te llevará paso a paso para desplegar tu aplicación AIPI en Railway conectándola con tu dominio de Cloudflare.

## 📋 Requisitos Previos

✅ **Antes de comenzar necesitas:**
- Cuenta en [Railway.app](https://railway.app/)
- Proyecto en GitHub (público o privado)
- Cuenta en Cloudflare con tu dominio configurado
- Claves de API: OpenAI, Stripe (opcional)

---

## 🌟 FASE 1: Preparación del Proyecto en GitHub

### 1. Verificar que tu proyecto esté en GitHub
```bash
# Si no está en GitHub, súbelo:
git add .
git commit -m "Preparación para deploy en Railway"
git push origin main
```

### 2. Asegurar que tienes estos archivos (ya están listos):
- ✅ `package.json` con scripts de build y start
- ✅ `railway.json` configurado
- ✅ `Procfile` configurado
- ✅ `railway-start.sh` script de inicio

---

## 🚂 FASE 2: Deploy en Railway

### 1. Crear Cuenta y Proyecto en Railway

1. **Ir a Railway**: [https://railway.app/](https://railway.app/)
2. **Iniciar sesión** con GitHub (recomendado)
3. **Hacer clic en "New Project"**
4. **Seleccionar "Deploy from GitHub repo"**
5. **Conectar tu cuenta GitHub** si es necesario
6. **Buscar y seleccionar** tu repositorio AIPI

### 2. Configurar Base de Datos PostgreSQL

**Railway detectará automáticamente que necesitas PostgreSQL:**

1. **Haz clic en "Add PostgreSQL"** cuando aparezca la opción
2. **Railway creará automáticamente:**
   - Una instancia de PostgreSQL
   - La variable `DATABASE_URL`
   - Conexión automática entre tu app y la DB

### 3. Configurar Variables de Entorno

**Ve a la pestaña "Variables" y añade:**

**🔑 Variables Obligatorias:**
```
NODE_ENV=production
```

**🔑 Variables para AI (Obligatorio):**
```
OPENAI_API_KEY=sk-tu-clave-de-openai-aqui
```

**🔑 Variables para Pagos (Opcional - Stripe):**
```
STRIPE_SECRET_KEY=sk_live_tu-clave-secreta-stripe
VITE_STRIPE_PUBLIC_KEY=pk_live_tu-clave-publica-stripe
STRIPE_WEBHOOK_SECRET=whsec_tu-webhook-secret
```

**🔑 Variables para Email (Opcional):**
```
SENDGRID_API_KEY=SG.tu-clave-sendgrid
```

**⚠️ Importante:** La variable `DATABASE_URL` ya está configurada automáticamente por Railway.

### 4. Deploy Inicial

1. **Railway iniciará el deploy automáticamente**
2. **Espera** entre 3-5 minutos para el primer deploy
3. **Monitorea los logs** en la pestaña "Deployments"
4. **Verifica que aparezca** "Build completed" y "Deploy live"

---

## 🌍 FASE 3: Configuración de Dominio con Cloudflare

### 1. Obtener URL de Railway

1. **En tu proyecto Railway**, ve a "Settings"
2. **Copia la URL** (algo como: `https://tu-proyecto-production.railway.app`)
3. **Prueba la URL** para verificar que funciona

### 2. Configurar DNS en Cloudflare

**Opción A: Subdominio (Recomendado)**

1. **Entra a Cloudflare Dashboard**
2. **Selecciona tu dominio**
3. **Ve a DNS > Records**
4. **Añade un registro CNAME:**
   ```
   Type: CNAME
   Name: app (o el subdominio que prefieras)
   Target: tu-proyecto-production.railway.app
   Proxy Status: Proxied (naranja)
   TTL: Auto
   ```

**Opción B: Dominio Principal**

1. **En DNS > Records**
2. **Añade un registro CNAME:**
   ```
   Type: CNAME  
   Name: @ (para dominio principal)
   Target: tu-proyecto-production.railway.app
   Proxy Status: Proxied (naranja)
   TTL: Auto
   ```

### 3. Configurar Dominio Personalizado en Railway

1. **En Railway**, ve a tu proyecto
2. **Settings > Networking > Custom Domain**
3. **Añade tu dominio:**
   - Para subdominio: `app.tudominio.com`
   - Para dominio principal: `tudominio.com`
4. **Railway verificará automáticamente** la configuración DNS

### 4. Configurar SSL/HTTPS en Cloudflare

1. **Ve a SSL/TLS > Overview**
2. **Selecciona "Full (strict)"** como modo de cifrado
3. **Ve a SSL/TLS > Edge Certificates**
4. **Verifica que esté activado:**
   - ✅ Always Use HTTPS
   - ✅ HTTP Strict Transport Security (HSTS)
   - ✅ Automatic HTTPS Rewrites

---

## 🔧 FASE 4: Configuración Avanzada (Opcional)

### 1. Configurar Page Rules en Cloudflare

**Para optimizar rendimiento:**

1. **Ve a Rules > Page Rules**
2. **Crear regla para API:**
   ```
   URL pattern: tudominio.com/api/*
   Settings:
   - Cache Level: Bypass
   - Security Level: Medium
   ```

3. **Crear regla para assets estáticos:**
   ```
   URL pattern: tudominio.com/assets/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   ```

### 2. Configurar Firewall (Recomendado)

1. **Ve a Security > WAF**
2. **Activar "Security Level: Medium"**
3. **Considera añadir reglas** para países específicos si aplica

---

## ✅ FASE 5: Verificación y Testing

### 1. Verificar Deploy Completo

**Chequea que todo funcione:**

1. **✅ Sitio web principal:** `https://tudominio.com`
2. **✅ API funcionando:** `https://tudominio.com/api/health`
3. **✅ Dashboard:** `https://tudominio.com/dashboard`
4. **✅ Widgets:** Prueba los embeds en sitios de prueba

### 2. Testing de Funcionalidades

**Prueba estas funciones:**
- ✅ Registro e inicio de sesión
- ✅ Creación de integraciones
- ✅ Widgets de chat (bubble y fullscreen)
- ✅ Sistema de pagos (si configuraste Stripe)
- ✅ Notificaciones por email

### 3. Monitoreo de Logs

**En Railway > Deployments:**
- ✅ No hay errores críticos en logs
- ✅ Base de datos conecta correctamente
- ✅ API responde a todas las rutas

---

## 🚨 Solución de Problemas Comunes

### ❌ Error: "Database connection failed"
**Solución:**
1. Verifica que PostgreSQL esté corriendo en Railway
2. Comprueba la variable `DATABASE_URL`
3. Revisa los logs para errores específicos

### ❌ Error: "OpenAI API failed"
**Solución:**
1. Verifica tu clave `OPENAI_API_KEY`
2. Comprueba que tengas créditos en OpenAI
3. Prueba la clave en una herramienta como Postman

### ❌ Error: "Domain not pointing correctly"
**Solución:**
1. Verifica la configuración DNS en Cloudflare
2. Espera hasta 24 horas para propagación completa
3. Usa herramientas como `nslookup` para verificar DNS

### ❌ Error: "SSL Certificate issues"
**Solución:**
1. Asegúrate de usar "Full (strict)" en Cloudflare
2. Verifica que Railway genere certificado automáticamente
3. Espera unos minutos para provisión de certificados

---

## 🔄 Actualizaciones Futuras

### Deploy Automático
**Railway se actualiza automáticamente** cuando haces push a GitHub:

```bash
git add .
git commit -m "Nueva funcionalidad"
git push origin main
# Railway detecta el cambio y redeploya automáticamente
```

### Variables de Entorno
**Para añadir nuevas variables:**
1. Ve a Railway > Variables
2. Añade la nueva variable
3. Railway reiniciará automáticamente

---

## 📞 Soporte y Ayuda

### Recursos Útiles
- **Railway Docs:** [https://docs.railway.app/](https://docs.railway.app/)
- **Cloudflare Docs:** [https://developers.cloudflare.com/](https://developers.cloudflare.com/)
- **Status Pages:**
  - Railway: [https://status.railway.app/](https://status.railway.app/)
  - Cloudflare: [https://www.cloudflarestatus.com/](https://www.cloudflarestatus.com/)

### Comandos de Debug
```bash
# Verificar DNS
nslookup tudominio.com

# Verificar certificado SSL
openssl s_client -connect tudominio.com:443

# Verificar respuesta de API
curl https://tudominio.com/api/health
```

---

**🎉 ¡Felicitaciones! Tu aplicación AIPI ya está en producción con Railway y Cloudflare.**

**Para cualquier problema específico, puedes revisar los logs detallados en Railway o contactar soporte.**