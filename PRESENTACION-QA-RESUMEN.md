# Presentación para Experto QA - AIPPS Platform

## Resumen Ejecutivo

**AIPPS** es una plataforma conversacional de IA que permite a empresas integrar chatbots inteligentes en sus sitios web con un sistema de suscripciones por niveles.

## ¿Qué vas a testear?

### 🔐 Sistema de Permisos (CRÍTICO)
- **4 tipos de planes**: Básico, Startup, Profesional, Administrador
- **Limitaciones específicas**: Cada plan tiene límites diferentes de integraciones y formularios
- **Validación estricta**: El sistema debe bloquear acciones no permitidas

### 🤖 Funcionalidad de IA
- **Chat inteligente** que responde preguntas
- **Widget embebible** para sitios externos
- **Respuestas contextuales** basadas en el contenido del sitio

### 🌍 Soporte Multiidioma
- **3 idiomas**: Español, Francés, Inglés
- **Cambio dinámico** sin recargar página
- **Persistencia** del idioma seleccionado

## Credenciales de Testing

| Usuario | Plan | Contraseña | Límites |
|---------|------|------------|---------|
| `usuario_basico` | Básico | `Test123!` | 1 integración, 3 formularios |
| `usuario_startup` | Startup | `Test123!` | 3 integraciones, 10 formularios |
| `usuario_profesional` | Profesional | `Test123!` | 10 integraciones, ∞ formularios |

## Casos de Prueba Prioritarios

### 🎯 Caso Crítico #1: Validación de Límites
```gherkin
DADO que soy "usuario_basico" con 1 integración
CUANDO intento crear una segunda integración  
ENTONCES debo ver popup de "Actualizar Plan"
Y NO debe crearse la integración
```

### 🎯 Caso Crítico #2: Funcionalidad de Chat
```gherkin
DADO que tengo el widget abierto
CUANDO escribo "¿Cómo funciona el servicio?"
ENTONCES debo recibir respuesta en < 10 segundos
Y la respuesta debe ser coherente
```

### 🎯 Caso Crítico #3: Cambio de Idioma
```gherkin
DADO que estoy en la página principal
CUANDO cambio idioma a "Français"
ENTONCES toda la interfaz debe cambiar a francés
Y debe persistir al recargar la página
```

## Áreas de Alto Riesgo

### ⚠️ Seguridad
- **Bypass de permisos**: ¿Puede un usuario básico crear más recursos?
- **Acceso no autorizado**: ¿Se puede acceder sin login?
- **Escalación de privilegios**: ¿Puede acceder a funciones de plan superior?

### ⚠️ Performance
- **Tiempo de respuesta IA**: Debe ser < 10 segundos
- **Carga de página**: Debe ser < 3 segundos
- **Widget externo**: Debe cargar sin afectar sitio host

### ⚠️ UX/UI
- **Responsive design**: Debe funcionar en móvil/tablet/desktop
- **Mensajes de error**: Deben ser claros y accionables
- **Estados de carga**: Debe mostrar loading mientras procesa

## Formato de Reporte de Bugs

### Estructura Requerida:
```
ID: BUG-XXX
TÍTULO: [Resumen en una línea]
SEVERIDAD: Crítica/Alta/Media/Baja
USUARIO AFECTADO: [usuario_basico/startup/profesional]

PASOS:
1. Login como [usuario]
2. Ir a [sección]
3. Hacer [acción]

ESPERADO: [Lo que debe pasar]
ACTUAL: [Lo que realmente pasa]
EVIDENCIA: [Screenshot/video]
```

### Ejemplos de Severidad:

**🔴 CRÍTICA**: 
- Sistema permite bypass de límites de plan
- Aplicación no carga/crashea
- Datos se pierden o corrompen

**🟠 ALTA**: 
- Funcionalidad principal no funciona
- Error de permisos ocasional
- Performance muy lenta (>15 segundos)

**🟡 MEDIA**: 
- UI/UX confusa pero funcional
- Textos mal traducidos
- Performance lenta (5-10 segundos)

**🟢 BAJA**: 
- Errores de texto/gramática
- Mejoras de diseño
- Optimizaciones menores

## Herramientas Recomendadas

- **Browser DevTools**: Debug y network
- **Postman**: Testing de APIs
- **Screenshots**: Evidencia visual
- **Video recording**: Para bugs complejos

## Entregables Esperados

1. **Lista de bugs** con formato especificado
2. **Reporte de cobertura** de casos de prueba
3. **Recomendaciones de mejora** de UX/Performance
4. **Evaluación de seguridad** del sistema de permisos

## Tiempo Estimado de Testing

- **Setup y familiarización**: 30 min
- **Testing funcional completo**: 3-4 horas
- **Testing de seguridad**: 1-2 horas  
- **Testing de performance**: 1 hora
- **Documentación de bugs**: 1 hora

**Total estimado**: 6-8 horas para testing completo

## Preguntas Frecuentes

**P: ¿Qué hago si no puedo reproducir un bug?**
R: Documenta los pasos intentados y marca como "No reproducible" con tu entorno específico.

**P: ¿Puedo probar con mis propios datos?**
R: Sí, pero usar los usuarios de prueba garantiza consistencia en los resultados.

**P: ¿Qué browsers debo probar?**
R: Mínimo Chrome y Firefox. Safari y Edge si hay tiempo.

**P: ¿Cómo reporto bugs de performance?**
R: Incluye tiempos específicos y usa DevTools para medir velocidades de red.

---

## 📋 Checklist Rápido Pre-Testing

- [ ] Acceso a la aplicación confirmado
- [ ] Usuarios de prueba funcionando
- [ ] Herramientas de captura listas
- [ ] Formato de reporte entendido
- [ ] Casos críticos identificados

¡Listo para comenzar el testing!