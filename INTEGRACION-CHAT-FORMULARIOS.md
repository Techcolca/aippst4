# Integración de Chat y Formularios AIPPS

Esta guía explica cómo usar tanto el widget de chat como los formularios AIPPS en el mismo sitio web sin conflictos.

## ✅ Solución Implementada

Hemos desarrollado un **sistema de detección inteligente** que evita automáticamente que aparezca el botón de chat cuando hay un formulario activo en la página.

### Cómo Funciona

1. **Detección Automática**: El widget de chat detecta si hay formularios AIPPS en la página
2. **Prevención de Conflictos**: Si encuentra un formulario, no se inicia el widget de chat
3. **Marcadores Inteligentes**: Los formularios marcan automáticamente su presencia

## 📋 Instrucciones para el Cliente

### Opción 1: Instalación Global (Recomendada)

Instala ambos scripts en tu sitio WordPress:

```html
<!-- Widget de Chat - En el header o footer global -->
<script src="https://tu-dominio.com/embed.js?key=TU_API_KEY"></script>

<!-- Formulario - Solo en páginas específicas -->
<script src="https://tu-dominio.com/static/form-embed.js?id=ID_DEL_FORMULARIO"></script>
<div id="aipps-form-container"></div>
```

### Opción 2: Control Manual por Página

Si prefieres control granular, puedes usar condiciones:

```php
<?php if (!is_page('formulario-contacto')): ?>
<!-- Chat solo en páginas que NO sean de formulario -->
<script src="https://tu-dominio.com/embed.js?key=TU_API_KEY"></script>
<?php endif; ?>

<?php if (is_page('formulario-contacto')): ?>
<!-- Formulario solo en páginas específicas -->
<script src="https://tu-dominio.com/static/form-embed.js?id=ID_DEL_FORMULARIO"></script>
<div id="aipps-form-container"></div>
<?php endif; ?>
```

### Opción 3: Configuración con Atributos

Puedes usar atributos para mayor control:

```html
<!-- Chat con configuración específica -->
<script 
  src="https://tu-dominio.com/embed.js?key=TU_API_KEY"
  data-hide-on-forms="true"
  data-position="bottom-left">
</script>
```

## 🔍 Verificación de Funcionamiento

### Qué Esperar

1. **En páginas con formulario**: Solo aparece el formulario, sin botón de chat
2. **En páginas sin formulario**: Solo aparece el botón de chat
3. **En el console del navegador**: Mensajes de depuración que confirman la detección

### Mensajes de Console

```
✅ AIPPS Form: Marcando formulario como activo para evitar conflictos con chat
✅ AIPPS Widget: Formulario AIPPS activo detectado por atributo
✅ AIPPS Widget: No se iniciará el widget porque hay un formulario activo
```

## 🛠️ Configuración Avanzada

### Múltiples Formularios

Puedes tener múltiples formularios en el mismo sitio:

```html
<!-- Formulario de Lista de Espera -->
<script src="https://tu-dominio.com/static/form-embed.js?id=lista-espera"></script>
<div id="aipps-form-container"></div>

<!-- Formulario de Contacto en otra página -->
<script src="https://tu-dominio.com/static/form-embed.js?id=contacto"></script>
<div id="aipps-form-container"></div>
```

### Chat en Páginas Específicas

Si quieres el chat solo en ciertas páginas:

```javascript
// Cargar chat condicionalmente
if (window.location.pathname.includes('/blog/') || 
    window.location.pathname === '/') {
  const script = document.createElement('script');
  script.src = 'https://tu-dominio.com/embed.js?key=TU_API_KEY';
  document.head.appendChild(script);
}
```

## 🎯 Casos de Uso Comunes

### E-commerce
- **Páginas de producto**: Chat activo para consultas
- **Página de contacto**: Formulario de contacto
- **Landing pages**: Formularios de registro

### Servicios Profesionales
- **Home y servicios**: Chat para consultas inmediatas
- **Página de cotización**: Formulario específico
- **Blog**: Chat para engagement

### SaaS/Software
- **Marketing pages**: Chat para ventas
- **Página de registro**: Formulario de signup
- **Soporte**: Ambos según la necesidad

## 🔧 Resolución de Problemas

### Si aparecen ambos elementos:

1. **Verifica el console**: Busca mensajes de AIPPS
2. **Revisa los scripts**: Asegúrate de que ambos scripts estén actualizados
3. **Limpia la cache**: Del navegador y del sitio web
4. **Contacta soporte**: Si el problema persiste

### Scripts desactualizados:

Si tienes scripts antiguos, actualízalos a las versiones más recientes que incluyen la detección automática.

## 📞 Soporte

Si necesitas ayuda con la implementación:

1. Revisa los mensajes del console del navegador
2. Verifica que los scripts se cargan correctamente
3. Contacta al equipo de AIPPS con los detalles específicos

---

**Versión**: 2.1.0 - Sistema de Detección Inteligente
**Última actualización**: Enero 2025