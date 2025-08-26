# 📋 Archivos Importantes para Verificar en la Descarga

## ✅ Archivos Críticos para Railway (VERIFICAR)

### Configuración Principal:
- `package.json` - Scripts build/start
- `railway.json` - Config Railway
- `Procfile` - Comando inicio  
- `railway-start.sh` - Script migraciones
- `drizzle.config.ts` - Config base datos

### Código Aplicación:
- `server/` - Backend completo
- `client/` - Frontend React
- `shared/` - Esquemas compartidos
- `public/` - Widgets embebibles

### Variables Entorno:
- `.env.example` - Template variables
- NO incluir `.env` (secretos)

## ⚠️ Archivos a EXCLUIR de la Descarga

### Automáticamente Excluidos:
- `node_modules/` - Se instalan en Railway
- `.git/` - No necesario para nuevo repo
- `dist/` - Se genera en build
- `.cache/` - Temporal

### Verificar que NO Estén:
- `.env` - Contiene secretos
- `*.log` - Archivos log
- Archivos temporales

## 🎯 Funcionalidades Incluidas

### Sistema Personalización:
- Saludo con nombre usuario
- Control manual color texto
- Contraste dinámico adaptativo

### Widgets:
- Bubble chat optimizado
- Fullscreen chat mejorado
- Sistema embebible completo

### Configuraciones:
- PostgreSQL configurado
- Migraciones automáticas
- Scripts producción listos

**Una vez descargado, verificar que estos archivos estén incluidos antes del upload a GitHub.**