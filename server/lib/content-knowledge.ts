// Sistema de conocimiento personalizado para cada chatbot
export function buildKnowledgeBase(integration: any, documents: any[], siteContent: any[]): string {
  let knowledgeBase = integration.botBehavior || "Eres un asistente útil para este sitio web.";
  
  console.log(`buildKnowledgeBase Debug: Building knowledge for ${integration.name}`);
  console.log(`buildKnowledgeBase Debug: Documents count: ${documents.length}`);
  console.log(`buildKnowledgeBase Debug: Site content count: ${siteContent.length}`);
  
  // Agregar información específica del sitio web basada en la integración
  knowledgeBase += `

INFORMACIÓN ESPECÍFICA DEL SITIO WEB:
Nombre del sitio: ${integration.name}
URL: ${integration.url}
Descripción: ${integration.description || 'No hay descripción disponible'}

`;

  // Agregar documentos específicos subidos por el usuario
  if (documents && documents.length > 0) {
    knowledgeBase += "\n\nDOCUMENTOS Y ARCHIVOS SUBIDOS POR EL USUARIO:\n";
    documents.forEach(doc => {
      if (doc.content) {
        knowledgeBase += `\n--- DOCUMENTO: ${doc.original_name || doc.filename} ---\n`;
        knowledgeBase += `${doc.content}\n\n`;
      }
    });
  }
  
  // Agregar contenido específico del sitio web extraído por scraping
  if (siteContent && siteContent.length > 0) {
    knowledgeBase += "\n\nCONTENIDO EXTRAÍDO DEL SITIO WEB:\n";
    siteContent.forEach(content => {
      if (content.content && content.title) {
        knowledgeBase += `\n--- PÁGINA: ${content.title} ---\n`;
        knowledgeBase += `URL: ${content.url}\n`;
        knowledgeBase += `Contenido: ${content.content}\n\n`;
      }
    });
  }
  
  // Solo agregar información de AIPPS si es la integración específica de AIPPS
  if (integration.apiKey === 'aipps_web_internal' || integration.name.toLowerCase().includes('aipps')) {
    knowledgeBase += `\n\nINFORMACIÓN SOBRE AIPPS (solo para consultas sobre la plataforma):
AIPPS es una plataforma de inteligencia artificial que permite crear chatbots y formularios interactivos.
- Características: Widget personalizable, soporte multiidioma, integración WordPress
- Planes: Gratuito (100 conversaciones/mes), Profesional, Empresarial
- Implementación: Registro → Crear integración → Insertar código → Configurar
`;
  }

  knowledgeBase += `

INSTRUCCIONES ESPECÍFICAS PARA ESTE CHATBOT:
- Eres el asistente virtual de ${integration.name} (${integration.url})
- Responde ÚNICAMENTE basándote en la información de ESTE sitio web específico y los documentos proporcionados
- Si hay documentos subidos, úsalos como fuente principal de información
- Si te preguntan sobre otros sitios web o servicios no relacionados, explica que solo puedes ayudar con información de ${integration.name}
- Responde siempre en el idioma en que te hablen
- Si no tienes información específica, di que puedes ayudar con consultas relacionadas con ${integration.name}
- Mantén un tono profesional y servicial
- Identifícate como el asistente de ${integration.name} cuando sea apropiado
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