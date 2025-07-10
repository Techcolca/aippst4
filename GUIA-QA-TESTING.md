# Guía de Testing para AIPPS - AI-Powered Conversational Platform

## Introducción para el Experto en QA

AIPPS es una plataforma conversacional de IA que permite a las empresas integrar capacidades de chat inteligente en sus sitios web. La aplicación maneja diferentes tipos de usuarios con planes de suscripción que tienen limitaciones específicas.

## Configuración del Entorno de Testing

### URL de la Aplicación
- **Desarrollo**: El enlace se proporcionará durante la sesión de testing
- **Interfaz**: Aplicación web responsive que funciona en desktop, tablet y móvil

### Usuarios de Prueba Disponibles

| Usuario | Plan | Contraseña | Limitaciones |
|---------|------|------------|--------------|
| `usuario_basico` | Básico | `Test123!` | 1 integración, 3 formularios |
| `usuario_startup` | Startup | `Test123!` | 3 integraciones, 10 formularios |
| `usuario_profesional` | Profesional | `Test123!` | 10 integraciones, formularios ilimitados |

### Funcionalidades Principales a Testear

1. **Sistema de Autenticación**
2. **Gestión de Planes y Permisos**
3. **Creación de Integraciones**
4. **Gestión de Formularios**
5. **Chat Widget**
6. **Sistema Multiidioma**
7. **Dashboard Analytics**

## Casos de Prueba en Formato Gherkin

### 1. Autenticación y Acceso

```gherkin
Feature: Autenticación de usuarios
  Como usuario de AIPPS
  Quiero autenticarme en la plataforma
  Para acceder a mis funcionalidades según mi plan

  Scenario: Login exitoso con credenciales válidas
    Given que estoy en la página de login
    When ingreso el usuario "usuario_basico" y contraseña "Test123!"
    And hago clic en "Iniciar Sesión"
    Then debería ver el dashboard principal
    And debería ver mi plan "Básico" en la interfaz

  Scenario: Login fallido con credenciales incorrectas
    Given que estoy en la página de login
    When ingreso el usuario "usuario_incorrecto" y contraseña "password123"
    And hago clic en "Iniciar Sesión"
    Then debería ver un mensaje de error "Credenciales incorrectas"
    And debería permanecer en la página de login

  Scenario: Logout exitoso
    Given que estoy autenticado como "usuario_basico"
    When hago clic en el botón de logout
    Then debería ser redirigido a la página de login
    And no debería tener acceso a páginas protegidas
```

### 2. Gestión de Permisos por Plan

```gherkin
Feature: Limitaciones por plan de suscripción
  Como sistema de permisos
  Quiero limitar las funcionalidades según el plan del usuario
  Para mantener la estructura de precios

  Scenario: Usuario básico intenta crear segunda integración
    Given que estoy autenticado como "usuario_basico"
    And ya tengo 1 integración creada
    When intento crear una nueva integración
    Then debería ver un popup de upgrade
    And el popup debería mostrar "Necesitas actualizar tu plan"
    And debería ver un botón para "Actualizar Plan"

  Scenario: Usuario startup puede crear hasta 3 integraciones
    Given que estoy autenticado como "usuario_startup"
    And tengo 2 integraciones creadas
    When creo una nueva integración
    Then la integración debería crearse exitosamente
    And debería ver 3 integraciones en mi lista

  Scenario: Usuario profesional sin límite de formularios
    Given que estoy autenticado como "usuario_profesional"
    And tengo 15 formularios creados
    When intento crear un nuevo formulario
    Then el formulario debería crearse sin restricciones
    And no debería ver mensajes de límite
```

### 3. Creación de Integraciones

```gherkin
Feature: Gestión de integraciones de chat
  Como usuario autenticado
  Quiero crear integraciones de chat
  Para añadir funcionalidad de AI a mi sitio web

  Scenario: Crear integración básica exitosamente
    Given que estoy autenticado como "usuario_profesional"
    And estoy en la página de integraciones
    When hago clic en "Crear Nueva Integración"
    And completo el formulario:
      | Campo | Valor |
      | Nombre | "Chat Soporte" |
      | Descripción | "Chat para atención al cliente" |
      | URL del sitio | "https://ejemplo.com" |
    And hago clic en "Crear Integración"
    Then debería ver la integración en mi lista
    And debería poder ver el código de integración generado

  Scenario: Validación de campos obligatorios
    Given que estoy en el formulario de nueva integración
    When intento enviar el formulario sin completar campos obligatorios
    Then debería ver mensajes de error específicos:
      | Campo | Mensaje |
      | Nombre | "El nombre es obligatorio" |
      | URL | "La URL es obligatoria" |
    And el formulario no debería enviarse
```

### 4. Sistema Multiidioma

```gherkin
Feature: Soporte multiidioma
  Como usuario internacional
  Quiero usar la aplicación en mi idioma
  Para una mejor experiencia de usuario

  Scenario: Cambiar idioma a francés
    Given que estoy en la página principal
    When cambio el idioma a "Français"
    Then todos los textos de la interfaz deberían estar en francés
    And los mensajes promocionales deberían estar en francés
    And el chat de bienvenida debería saludar en francés

  Scenario: Persistencia del idioma seleccionado
    Given que he cambiado el idioma a "English"
    When recargo la página
    Then la aplicación debería mantener el idioma inglés
    And no debería volver al idioma por defecto
```

### 5. Widget de Chat

```gherkin
Feature: Funcionalidad del widget de chat
  Como visitante del sitio web
  Quiero interactuar con el chat de IA
  Para obtener información y soporte

  Scenario: Abrir y cerrar chat widget
    Given que estoy en una página con el widget integrado
    When hago clic en el botón del chat
    Then el widget debería expandirse
    And debería ver el mensaje de bienvenida
    When hago clic en minimizar
    Then el widget debería contraerse pero permanecer visible

  Scenario: Enviar mensaje y recibir respuesta
    Given que tengo el widget de chat abierto
    When escribo "Hola, ¿cómo funciona el servicio?"
    And presiono Enter
    Then debería ver mi mensaje en el chat
    And debería ver una respuesta de la IA en un tiempo razonable (< 10 segundos)
```

## Áreas Críticas de Testing

### 1. Seguridad
- **Autenticación**: Verificar que no se pueda acceder sin login
- **Autorización**: Confirmar que cada plan solo accede a sus funciones
- **Tokens JWT**: Validar expiración y renovación
- **CORS**: Verificar políticas de origen cruzado

### 2. Performance
- **Tiempo de carga**: Páginas < 3 segundos
- **Respuesta de chat**: IA responde < 10 segundos
- **Carga de imágenes**: Assets cargan correctamente
- **Escalabilidad**: Múltiples usuarios concurrentes

### 3. Usabilidad
- **Responsive Design**: Funciona en móvil, tablet, desktop
- **Navegación**: Flujos intuitivos y claros
- **Mensajes de error**: Claros y accionables
- **Feedback visual**: Loading states, confirmaciones

### 4. Integración
- **Widgets externos**: Se integran correctamente en sitios terceros
- **APIs**: Endpoints responden correctamente
- **Base de datos**: Datos se persisten adecuadamente

## Guía para Reportar Bugs

### Formato de Reporte de Bug

```markdown
**ID del Bug**: [Número único]
**Título**: [Resumen breve y descriptivo]
**Severidad**: [Crítica/Alta/Media/Baja]
**Prioridad**: [Alta/Media/Baja]

**Descripción**:
[Descripción detallada del problema]

**Pasos para Reproducir**:
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado Esperado**:
[Lo que debería suceder]

**Resultado Actual**:
[Lo que realmente sucede]

**Evidencia**:
- Screenshots: [Adjuntar capturas]
- Videos: [Si aplica]
- Logs: [Copiar errores de consola]

**Entorno**:
- Browser: [Chrome 120, Firefox 118, etc.]
- OS: [Windows 11, macOS 14, etc.]
- Dispositivo: [Desktop/Mobile/Tablet]
- Usuario de prueba: [usuario_basico/startup/profesional]

**Información Adicional**:
[Cualquier detalle relevante adicional]
```

### Ejemplos de Bugs Comunes

#### Bug Crítico
```markdown
**ID**: BUG-001
**Título**: Usuario básico puede crear integraciones ilimitadas
**Severidad**: Crítica
**Prioridad**: Alta

**Descripción**: 
El sistema no está respetando el límite de 1 integración para usuarios básicos

**Pasos para Reproducir**:
1. Login como usuario_basico
2. Ir a Integraciones
3. Crear una integración
4. Intentar crear una segunda integración
5. El sistema permite la creación sin mostrar popup de upgrade

**Resultado Esperado**: 
Debería mostrar popup de upgrade al intentar crear la segunda integración

**Resultado Actual**: 
Permite crear múltiples integraciones sin restricción
```

#### Bug de UI
```markdown
**ID**: BUG-002
**Título**: Botón "Crear Formulario" no visible en móvil
**Severidad**: Media
**Prioridad**: Media

**Descripción**: 
En dispositivos móviles, el botón para crear formularios se corta por el margen derecho

**Pasos para Reproducir**:
1. Abrir la app en dispositivo móvil (iPhone 12)
2. Login como cualquier usuario
3. Ir a sección Formularios
4. Observar botón "Crear Formulario"

**Resultado Esperado**: 
Botón completamente visible y funcional

**Resultado Actual**: 
Botón cortado, solo se ve "Crear For..."
```

## Checklist de Testing

### Pre-Testing
- [ ] Confirmar acceso a usuarios de prueba
- [ ] Verificar que la aplicación está funcionando
- [ ] Preparar herramientas de captura (screenshots, videos)
- [ ] Revisar documentación de funcionalidades

### Testing Funcional
- [ ] Autenticación (login/logout)
- [ ] Permisos por plan de suscripción
- [ ] Creación de integraciones
- [ ] Gestión de formularios
- [ ] Chat widget y respuestas de IA
- [ ] Cambio de idiomas
- [ ] Dashboard y analytics

### Testing No-Funcional
- [ ] Performance (tiempos de respuesta)
- [ ] Usabilidad en diferentes dispositivos
- [ ] Seguridad (accesos no autorizados)
- [ ] Compatibilidad de browsers

### Post-Testing
- [ ] Documentar todos los bugs encontrados
- [ ] Priorizar issues por severidad
- [ ] Crear reporte ejecutivo
- [ ] Recomendar mejoras de UX

## Herramientas Recomendadas

- **Browser DevTools**: Para debug y network analysis
- **Postman**: Para testing de APIs
- **LightHouse**: Para performance testing
- **BrowserStack**: Para testing cross-browser
- **Jira/Trello**: Para tracking de bugs

## Contacto y Soporte

Durante el testing, cualquier duda o problema técnico puede ser reportado inmediatamente para resolución rápida.