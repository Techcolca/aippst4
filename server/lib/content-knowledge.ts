// Sistema de conocimiento para el chatbot
export function buildKnowledgeBase(integration: any, documents: any[], siteContent: any[]): string {
  let knowledgeBase = integration.botBehavior || "Eres un asistente útil para este sitio web.";
  
  // Información específica sobre AIPPS
  knowledgeBase += `

INFORMACIÓN SOBRE AIPPS Y TECHCOLCA:

AIPPS es una plataforma de inteligencia artificial desarrollada por Techcolca que permite:
- Crear chatbots inteligentes para sitios web
- Generar formularios interactivos personalizados
- Automatizar procesos de atención al cliente
- Integrar fácilmente con WordPress y otros CMS
- Analizar conversaciones y generar reportes

CARACTERÍSTICAS PRINCIPALES:
- Widget de chat flotante personalizable
- Formularios con campos dinámicos
- Soporte multiidioma (Español, Inglés, Francés)
- Integración con sistemas de email
- Dashboard completo de gestión
- API REST para integraciones avanzadas

PLANES DISPONIBLES:
- Plan Gratuito: Hasta 100 conversaciones/mes
- Plan Profesional: Conversaciones ilimitadas + funciones avanzadas
- Plan Empresarial: Soluciones personalizadas

IMPLEMENTACIÓN:
1. Registro en la plataforma AIPPS
2. Creación de integración para el sitio web
3. Inserción de código JavaScript en el sitio
4. Configuración del comportamiento del bot
5. Personalización visual y mensajes

SOPORTE TÉCNICO:
- Documentación completa disponible
- Soporte por email y chat
- Guías de integración paso a paso
- Ejemplos de código y mejores prácticas
`;

  // Agregar documentos de la base de datos
  if (documents && documents.length > 0) {
    knowledgeBase += "\n\nDOCUMENTOS TÉCNICOS DISPONIBLES:\n";
    documents.forEach(doc => {
      if (doc.content) {
        knowledgeBase += `\n--- ${doc.original_name} ---\n${doc.content.substring(0, 2000)}...\n`;
      }
    });
  }
  
  // Agregar contenido del sitio web
  if (siteContent && siteContent.length > 0) {
    knowledgeBase += "\n\nCONTENIDO ACTUALIZADO DEL SITIO WEB:\n";
    siteContent.forEach(content => {
      if (content.content) {
        knowledgeBase += `\n--- ${content.title} (${content.url}) ---\n${content.content.substring(0, 1500)}...\n`;
      }
    });
  }

  knowledgeBase += `

INSTRUCCIONES PARA EL ASISTENTE:
- Responde siempre en el idioma en que te hablen
- Proporciona información precisa sobre AIPPS y Techcolca
- Si no tienes información específica, di que contacten al soporte
- Ayuda con problemas de integración y configuración
- Explica las funcionalidades de manera clara y técnica
- Ofrece ejemplos de código cuando sea relevante
- Mantén un tono profesional y servicial
`;

  return knowledgeBase;
}

export function extractRelevantInfo(userMessage: string, knowledgeBase: string): string {
  // Palabras clave para identificar temas específicos
  const keywords = {
    integration: ['integración', 'integrar', 'instalar', 'implementar', 'código'],
    forms: ['formulario', 'form', 'campo', 'envío'],
    chat: ['chat', 'chatbot', 'widget', 'conversación'],
    api: ['api', 'endpoint', 'webhook', 'developer'],
    pricing: ['precio', 'plan', 'costo', 'pago', 'suscripción'],
    technical: ['error', 'problema', 'no funciona', 'ayuda técnica']
  };
  
  const message = userMessage.toLowerCase();
  let relevantSections = [];
  
  // Identificar secciones relevantes basado en palabras clave
  for (const [topic, words] of Object.entries(keywords)) {
    if (words.some(word => message.includes(word))) {
      relevantSections.push(topic);
    }
  }
  
  // Extraer secciones relevantes del knowledge base
  if (relevantSections.length > 0) {
    const lines = knowledgeBase.split('\n');
    let relevantInfo = '';
    let capturing = false;
    
    for (const line of lines) {
      if (line.includes('CARACTERÍSTICAS PRINCIPALES') || 
          line.includes('IMPLEMENTACIÓN') || 
          line.includes('PLANES DISPONIBLES') ||
          line.includes('SOPORTE TÉCNICO')) {
        capturing = true;
        relevantInfo += line + '\n';
      } else if (capturing && line.trim() === '') {
        capturing = false;
      } else if (capturing) {
        relevantInfo += line + '\n';
      }
    }
    
    return relevantInfo || knowledgeBase.substring(0, 3000);
  }
  
  return knowledgeBase.substring(0, 3000);
}