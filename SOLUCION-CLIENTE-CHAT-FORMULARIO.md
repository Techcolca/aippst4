# Solución: Botón de Chat aparece con Formulario

## 🚨 Problema Identificado

Tu sitio web está usando el script `chatgpt-embed.js` que es una versión antigua que no incluye la detección automática de formularios.

## ✅ Solución Inmediata

### Opción 1: Actualizar el Script (Recomendada)

Reemplaza esta línea en tu WordPress:
```html
<!-- ANTIGUO - REMOVER -->
<script src="https://tu-dominio.com/static/chatgpt-embed.js?key=TU_CLAVE"></script>

<!-- NUEVO - USAR ESTE -->
<script src="https://tu-dominio.com/static/form-embed.js?id=TU_FORMULARIO"></script>
```

### Opción 2: Desactivar Chat en Páginas con Formulario

Si prefieres mantener ambos scripts, agrega esta condición en WordPress:

```php
<?php if (!is_page('tu-pagina-formulario')): ?>
<!-- Chat solo en páginas sin formulario -->
<script src="https://tu-dominio.com/static/chatgpt-embed.js?key=TU_CLAVE"></script>
<?php endif; ?>

<?php if (is_page('tu-pagina-formulario')): ?>
<!-- Formulario solo en páginas específicas -->
<script src="https://tu-dominio.com/static/form-embed.js?id=TU_FORMULARIO"></script>
<div id="aipps-form-container"></div>
<?php endif; ?>
```

### Opción 3: Usar Script Moderno (Más Avanzada)

Si tienes acceso técnico, reemplaza con el script principal:
```html
<script src="https://tu-dominio.com/embed.js?key=TU_CLAVE"></script>
```

## 🔧 Dónde Hacer los Cambios

### En WordPress:

1. **Dashboard de WordPress** → **Apariencia** → **Editor de Temas**
2. Busca en estos archivos:
   - `functions.php`
   - `header.php`
   - `footer.php`

3. **O en Plugins:**
   - Dashboard → **Plugins** → busca "AIPPS" o "Chat"
   - Desactiva el plugin del chat en las páginas de formulario

4. **O en Páginas/Entradas:**
   - Edita la página del formulario
   - Busca en "HTML personalizado" o "Código"
   - Elimina la línea del `chatgpt-embed.js`

## ✅ Verificación

Después de hacer los cambios:

1. **Limpia la caché** del sitio web
2. **Refresca la página** del formulario
3. **Verifica** que solo aparezca el formulario sin el botón de chat

### Consola del Navegador

Presiona F12 y verifica que aparezcan estos mensajes:
```
✅ AIPPS Form: Marcando formulario como activo
✅ AIPI Widget: No se iniciará el widget porque hay un formulario activo
```

## 📞 Si Necesitas Ayuda

Si no puedes hacer estos cambios:

1. **Contacta a tu desarrollador web**
2. **O envía capturas de pantalla** de dónde tienes los scripts
3. **O comparte el enlace** de la página con problemas

## 🎯 Resultado Final

- ✅ Páginas con formulario: Solo formulario visible
- ✅ Páginas sin formulario: Solo chat visible  
- ✅ No más conflictos entre ambos elementos