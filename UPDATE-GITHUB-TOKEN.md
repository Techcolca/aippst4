# 🔑 Actualizar GitHub con Nuevo Token

## Comando con Token Actualizado

Ejecuta este comando en la **Terminal Shell de Replit**:

```bash
rm -f .git/*.lock && git remote set-url origin https://ghp_wKafm9RkRPCSnvMbRtg@github.com/Techcolca/aipps-v2.git && git add . && git commit -m "Deploy ready - Sistema personalización completo" && git push origin main
```

## Si sigue pidiendo password:

Usa este comando alternativo:

```bash
git push https://ghp_wKafm9RkRPCSnvMbRtg@github.com/Techcolca/aipps-v2.git main
```

## Verificar después del push:

```bash
git status
git log --oneline -3
```

Una vez que el push sea exitoso, procederemos inmediatamente con Railway.