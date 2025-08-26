# 📤 Upload a GitHub - Instrucciones Detalladas

## 🎯 Método A: GitHub Web Interface (Más Fácil)

### Paso 1: Preparar Archivos
- Abrir la carpeta descomprimida del proyecto
- Verificar que tenga estos archivos principales:
  - `package.json`
  - `railway.json` 
  - `Procfile`
  - Carpetas: `server/`, `client/`, `shared/`, `public/`

### Paso 2: Upload Web
1. **Ir a:** https://github.com/Techcolca/aipps-v2-updated
2. **Clic en:** "uploading an existing file" (enlace en la descripción)
3. **Arrastrar toda la carpeta** del proyecto a la zona de upload
4. **Esperar** que todos los archivos se suban (puede tomar 2-3 minutos)
5. **Mensaje de commit:** "Sistema completo actualizado - Listo para Railway deploy"
6. **Clic:** "Commit changes"

## 🖥️ Método B: Git Local (Alternativo)

### Si tienes git instalado localmente:
```bash
cd ruta/a/aipps-v2-updated
git init
git remote add origin https://github.com/Techcolca/aipps-v2-updated.git
git add .
git commit -m "Sistema completo actualizado - Listo para Railway"
git branch -M main
git push -u origin main
```

## ⚠️ Archivos a EXCLUIR si están presentes:
- `node_modules/` (carpeta muy pesada)
- `.env` (secretos)
- `.git/` (si existe)
- `dist/` (se genera automáticamente)

## ✅ Verificar Upload Exitoso
Una vez completado, deberías ver en GitHub:
- Todos los archivos del proyecto
- Commit reciente con tu mensaje
- Badge verde "✓" indicando commit exitoso

## 🚂 Inmediatamente Después
Una vez confirmado el upload:
1. **Railway.app** → New Project
2. **Deploy from GitHub repo**
3. **Seleccionar:** `Techcolca/aipps-v2-updated`
4. **Deploy automático**

**¿Cuál método prefieres usar?**