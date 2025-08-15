// AIPI Widget para el sitio web principal
(function() {
  let widget;
  let messageContainer;
  let messageInput;
  let conversationId = null;
  let widgetConfig = {};
  const API_KEY = "aipi_web_internal";
  const SERVER_URL = window.location.origin;
  
  // Detectar si hay formularios AIPPS activos en la página
  function detectActiveAippsForm() {
    // Verificar atributo marcador del formulario
    if (document.documentElement.hasAttribute('data-aipps-form-active')) {
      console.log('AIPI Widget: Formulario AIPPS activo detectado por atributo');
      return true;
    }

    // Buscar contenedores de formularios AIPPS
    const formContainers = document.querySelectorAll('[id*="aipps-form"], [class*="aipps-form"], [data-aipps-form]');
    if (formContainers.length > 0) {
      console.log('AIPI Widget: Contenedor de formulario detectado');
      return true;
    }

    // Buscar scripts de formulario activos
    const formScripts = document.querySelectorAll('script[src*="form-embed.js"]');
    if (formScripts.length > 0) {
      console.log('AIPI Widget: Script de formulario detectado');
      return true;
    }

    // Buscar elementos del wrapper del formulario moderno
    const modernFormWrappers = document.querySelectorAll('.aipi-modern-form-wrapper');
    if (modernFormWrappers.length > 0) {
      console.log('AIPI Widget: Wrapper de formulario moderno detectado');
      return true;
    }

    return false;
  }

  function init() {
    console.log("AIPI Widget para sitio web principal: Inicializando...");
    
    // Verificar si hay formularios activos antes de continuar
    if (detectActiveAippsForm()) {
      console.log('AIPI Widget: No se iniciará el widget porque hay un formulario activo');
      return;
    }
    
    loadWidgetConfig()
      .then(() => {
        createWidgetDOM();
        attachEventListeners();
        console.log("AIPI Widget para sitio web principal: Inicializado correctamente");
      })
      .catch(error => {
        console.error("Error inicializando AIPI Widget:", error);
      });
  }
  
  async function loadWidgetConfig() {
    try {
      // Intentar cargar la configuración desde el servidor
      const response = await fetch(`${SERVER_URL}/api/widget/${API_KEY}`);
      
      if (!response.ok) {
        throw new Error(`Error cargando configuración: ${response.status}`);
      }
      
      widgetConfig = await response.json();
      console.log("Configuración del widget cargada:", widgetConfig);
      
      // Escanear el contenido de la página
      const pageContent = scanCurrentPageContent();
      widgetConfig.pageContext = {
        url: window.location.href,
        title: document.title,
        content: pageContent
      };
      
      return widgetConfig;
    } catch (error) {
      console.error("Error cargando configuración del widget:", error);
      // Si falla, usar configuración por defecto
      widgetConfig = {
        name: "AIPI Web",
        themeColor: "#6366f1",
        position: "bottom-right",
      };
      return widgetConfig;
    }
  }
  
  function scanCurrentPageContent() {
    try {
      // Obtener contenido principal excluyendo scripts, estilos y elementos de navegación
      const contentElements = document.querySelectorAll('main, article, .content, #content, [role="main"]');
      
      let textContent = '';
      
      if (contentElements.length > 0) {
        // Si encontramos elementos específicos de contenido, extraer de esos
        contentElements.forEach(el => {
          textContent += el.textContent + ' ';
        });
      } else {
        // Si no, extraer de body excluyendo scripts, styles, etc.
        const body = document.body;
        const clonedBody = body.cloneNode(true);
        
        // Remover elementos que no contienen contenido útil
        const elementsToRemove = clonedBody.querySelectorAll('script, style, nav, header, footer, iframe, svg, noscript, .navigation, #navigation');
        elementsToRemove.forEach(el => el.remove());
        
        textContent = clonedBody.textContent || '';
      }
      
      // Limpieza básica del texto
      textContent = textContent.replace(/\s+/g, ' ').trim();
      
      // Limitar la longitud del contenido para evitar problemas con la API
      const maxLength = 5000;
      if (textContent.length > maxLength) {
        textContent = textContent.substring(0, maxLength) + '...';
      }
      
      return textContent;
    } catch (error) {
      console.error("Error escaneando contenido de la página:", error);
      return "";
    }
  }
  
  function createWidgetDOM() {
    // Crear el contenedor principal del widget
    widget = document.createElement('div');
    widget.className = 'aipi-widget';
    widget.style.position = 'fixed';
    widget.style.zIndex = '9999';
    widget.style.backgroundColor = '#1E293B';
    widget.style.borderRadius = '8px';
    widget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
    widget.style.overflow = 'hidden';
    widget.style.transition = 'all 0.3s ease';
    widget.style.width = '400px';
    widget.style.height = '500px';
    widget.style.display = 'flex';
    widget.style.flexDirection = 'column';
    
    // Posicionar el widget según la configuración
    const position = widgetConfig.position || 'bottom-right';
    if (position === 'bottom-right') {
      widget.style.right = '20px';
      widget.style.bottom = '20px';
    } else if (position === 'bottom-left') {
      widget.style.left = '20px';
      widget.style.bottom = '20px';
    } else if (position === 'top-right') {
      widget.style.right = '20px';
      widget.style.top = '20px';
    } else if (position === 'top-left') {
      widget.style.left = '20px';
      widget.style.top = '20px';
    }
    
    // Crear el encabezado del widget
    const header = document.createElement('div');
    header.className = 'aipi-widget-header';
    header.style.backgroundColor = widgetConfig.themeColor || '#6366f1';
    header.style.color = '#ffffff';
    header.style.padding = '12px 16px';
    header.style.fontWeight = 'bold';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.fontFamily = 'Arial, sans-serif';
    
    // Título del widget
    const title = document.createElement('div');
    title.textContent = widgetConfig.name || 'AIPI Chat';
    
    // Botones del encabezado
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '8px';
    
    // Botón de minimizar
    const minimizeButton = document.createElement('button');
    minimizeButton.innerHTML = '&minus;';
    minimizeButton.className = 'aipi-widget-minimize';
    minimizeButton.style.background = 'none';
    minimizeButton.style.border = 'none';
    minimizeButton.style.color = '#ffffff';
    minimizeButton.style.fontSize = '16px';
    minimizeButton.style.cursor = 'pointer';
    minimizeButton.setAttribute('aria-label', 'Minimize');
    
    // Botón de cerrar
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'aipi-widget-close';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#ffffff';
    closeButton.style.fontSize = '18px';
    closeButton.style.cursor = 'pointer';
    closeButton.setAttribute('aria-label', 'Close');
    
    buttons.appendChild(minimizeButton);
    buttons.appendChild(closeButton);
    header.appendChild(title);
    header.appendChild(buttons);
    
    // Contenedor de mensajes
    messageContainer = document.createElement('div');
    messageContainer.className = 'aipi-widget-messages';
    messageContainer.style.flex = '1';
    messageContainer.style.overflowY = 'auto';
    messageContainer.style.padding = '16px';
    messageContainer.style.backgroundColor = '#0F172A';
    messageContainer.style.fontFamily = 'Arial, sans-serif';
    
    // Área de entrada de mensajes
    const inputArea = document.createElement('div');
    inputArea.className = 'aipi-widget-input-area';
    inputArea.style.display = 'flex';
    inputArea.style.padding = '12px';
    inputArea.style.backgroundColor = '#1E293B';
    inputArea.style.borderTop = '1px solid #2D3748';
    
    messageInput = document.createElement('input');
    messageInput.className = 'aipi-widget-input';
    messageInput.type = 'text';
    messageInput.placeholder = 'Type your message...';
    messageInput.style.flex = '1';
    messageInput.style.padding = '8px 12px';
    messageInput.style.border = '1px solid #2D3748';
    messageInput.style.borderRadius = '4px';
    messageInput.style.backgroundColor = '#1E293B';
    messageInput.style.color = '#E2E8F0';
    messageInput.style.fontFamily = 'Arial, sans-serif';
    messageInput.style.fontSize = '14px';
    
    const sendButton = document.createElement('button');
    sendButton.className = 'aipi-widget-send';
    sendButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;
    sendButton.style.marginLeft = '8px';
    sendButton.style.padding = '8px';
    sendButton.style.background = widgetConfig.themeColor || '#6366f1';
    sendButton.style.border = 'none';
    sendButton.style.borderRadius = '4px';
    sendButton.style.color = '#ffffff';
    sendButton.style.cursor = 'pointer';
    sendButton.style.display = 'flex';
    sendButton.style.alignItems = 'center';
    sendButton.style.justifyContent = 'center';
    
    inputArea.appendChild(messageInput);
    inputArea.appendChild(sendButton);
    
    // Ensamblar el widget
    widget.appendChild(header);
    widget.appendChild(messageContainer);
    widget.appendChild(inputArea);
    
    // Añadir widget al DOM
    document.body.appendChild(widget);
    
    // Iniciar conversación
    startConversation();
  }
  
  function attachEventListeners() {
    // Manejar envío mediante botón
    const sendButton = document.querySelector('.aipi-widget-send');
    if (sendButton) {
      sendButton.addEventListener('click', sendMessage);
    }
    
    // Manejar envío mediante Enter
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    // Manejar minimizar
    const minimizeButton = document.querySelector('.aipi-widget-minimize');
    if (minimizeButton) {
      minimizeButton.addEventListener('click', () => {
        widget.style.height = '45px';
        messageContainer.style.display = 'none';
        document.querySelector('.aipi-widget-input-area').style.display = 'none';
        
        // Cambiar el botón de minimizar a maximizar
        minimizeButton.innerHTML = '&#43;'; // Símbolo "+"
        minimizeButton.classList.replace('aipi-widget-minimize', 'aipi-widget-maximize');
        
        // Añadir nuevo manejador de eventos para maximizar
        minimizeButton.removeEventListener('click', arguments.callee);
        minimizeButton.addEventListener('click', () => {
          widget.style.height = '500px';
          messageContainer.style.display = 'block';
          document.querySelector('.aipi-widget-input-area').style.display = 'flex';
          
          // Cambiar de nuevo a botón de minimizar
          minimizeButton.innerHTML = '&minus;';
          minimizeButton.classList.replace('aipi-widget-maximize', 'aipi-widget-minimize');
          
          // Scroll al fondo
          scrollToBottom();
        });
      });
    }
    
    // Manejar cerrar
    const closeButton = document.querySelector('.aipi-widget-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        widget.style.display = 'none';
      });
    }
  }
  
  async function startConversation() {
    try {
      showTypingIndicator(true);
      
      // Crear nueva conversación
      const response = await fetch(`${SERVER_URL}/api/widget/${API_KEY}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          pageContext: widgetConfig.pageContext
        })
      });
      
      if (!response.ok) {
        throw new Error('Error creating conversation');
      }
      
      const data = await response.json();
      conversationId = data.id;
      
      // Mostrar mensaje de bienvenida personalizado
      addMessage(data.welcomeMessage || "👋 Hi there! I'm AIPI, your AI assistant. How can I help you today?", 'assistant');
      
      showTypingIndicator(false);
    } catch (error) {
      console.error('Error starting conversation:', error);
      addMessage("Lo siento, hubo un problema al iniciar la conversación. Por favor, intenta de nuevo.", 'assistant');
      showTypingIndicator(false);
    }
  }
  
  async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message || !conversationId) return;
    
    // Limpia el input
    messageInput.value = '';
    
    // Añadir mensaje del usuario al chat
    addMessage(message, 'user');
    
    // Mostrar indicador de escritura
    showTypingIndicator(true);
    
    try {
      // Enviar mensaje al servidor
      const response = await fetch(`${SERVER_URL}/api/widget/${API_KEY}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          content: message,
          role: 'user',
          pageContext: widgetConfig.pageContext
        })
      });
      
      if (!response.ok) {
        throw new Error('Error sending message');
      }
      
      // Esperar respuesta
      const data = await response.json();
      
      // Ocultar indicador de escritura
      showTypingIndicator(false);
      
      // Mostrar respuesta del asistente
      addMessage(data.content, 'assistant');
      
      // Hacer scroll hacia abajo
      scrollToBottom();
      
    } catch (error) {
      console.error('Error en la conversación:', error);
      showTypingIndicator(false);
      addMessage("Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo.", 'assistant');
    }
  }
  
  // Función para detectar si un color es oscuro
  function isColorDark(color) {
    // Convertir color hex a RGB
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calcular luminancia
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Si la luminancia es menor a 0.5, es un color oscuro
    return luminance < 0.5;
  }

  // Función para generar paleta de colores pasteles basada en el color principal
  function generatePastelPalette(baseColor) {
    let hex = baseColor;
    if (!hex || typeof hex !== 'string') {
      hex = '#6366f1'; // Color por defecto si no hay color
    }
    
    hex = hex.replace('#', '');
    if (hex.length !== 6) {
      hex = '6366f1'; // Fallback si el formato es incorrecto
    }
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Crear tonos pasteles más visibles
    const pastelLight = `rgba(${Math.round(r + (255 - r) * 0.8)}, ${Math.round(g + (255 - g) * 0.8)}, ${Math.round(b + (255 - b) * 0.8)}, 0.7)`;
    const pastelMedium = `rgba(${Math.round(r + (255 - r) * 0.6)}, ${Math.round(g + (255 - g) * 0.6)}, ${Math.round(b + (255 - b) * 0.6)}, 0.8)`;
    const pastelDark = `rgba(${Math.round(r + (255 - r) * 0.4)}, ${Math.round(g + (255 - g) * 0.4)}, ${Math.round(b + (255 - b) * 0.4)}, 0.9)`;
    
    return {
      light: pastelLight,
      medium: pastelMedium,
      dark: pastelDark,
      accent: '#' + hex
    };
  }

  // Función para formatear respuestas del chatbot con estilo enriquecido
  function formatBotResponse(text) {
    if (!text) return '';
    
    const palette = generatePastelPalette(widgetConfig.themeColor || '#6366f1');
    const themeColor = widgetConfig.themeColor || '#6366f1';
    const isDarkBubble = isColorDark(themeColor);
    
    // Colores de texto basados en el contraste de la burbuja
    // Para burbujas oscuras (fondo claro): texto oscuro
    // Para burbujas claras (fondo oscuro): texto claro
    const titleColor = isDarkBubble ? '#1f2937' : '#f9fafb';
    const bodyColor = isDarkBubble ? '#374151' : '#e5e7eb';
    const accentColor = isDarkBubble ? themeColor : '#60a5fa';
    
    // Escape HTML para prevenir XSS
    let safeText = escapeHTML(text);
    
    // Formatear títulos principales (líneas que empiezan con #) - SIN fondos pasteles para widget interno
    safeText = safeText.replace(/^# (.+)$/gm, 
      `<h1 style="font-size: 19px; font-weight: 700; color: ${titleColor}; margin: 16px 0 12px 0; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 2px solid ${accentColor}; padding-bottom: 6px;">$1</h1>`
    );
    
    // Formatear subtítulos (líneas que empiezan con ##)
    safeText = safeText.replace(/^## (.+)$/gm, 
      `<h2 style="font-size: 17px; font-weight: 600; color: ${titleColor}; margin: 14px 0 10px 0; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">$1</h2>`
    );
    
    // Formatear subtítulos de tercer nivel (líneas que empiezan con ###) - SIN fondos pasteles para widget interno
    safeText = safeText.replace(/^### (.+)$/gm, 
      `<h3 style="font-size: 15px; font-weight: 600; color: ${titleColor}; margin: 12px 0 8px 0; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-left: 3px solid ${accentColor}; padding: 8px 12px; border-radius: 5px;">$1</h3>`
    );
    
    // Formatear texto en negrita (**texto**) - SIN fondos pasteles para widget interno
    safeText = safeText.replace(/\*\*(.+?)\*\*/g, 
      `<strong style="font-weight: 600; color: ${titleColor};">$1</strong>`
    );
    
    // Formatear texto destacado (*texto*) - SIN fondos pasteles para widget interno
    safeText = safeText.replace(/\*(.+?)\*/g, 
      `<em style="font-style: italic; color: ${accentColor}; font-weight: 500;">$1</em>`
    );
    
    // Formatear listas numeradas (1. texto) - SIN fondos pasteles para widget interno
    safeText = safeText.replace(/^\d+\.\s(.+)$/gm, 
      `<div style="margin: 8px 0; padding: 10px 12px; border-left: 3px solid ${accentColor}; border-radius: 5px;"><span style="font-weight: 500; color: ${titleColor}; font-size: 14px;">$1</span></div>`
    );
    
    // Formatear listas con viñetas (- texto) - SIN fondos pasteles para widget interno
    safeText = safeText.replace(/^-\s(.+)$/gm, 
      `<div style="margin: 6px 0; padding: 8px 10px; border-left: 2px solid ${accentColor}; border-radius: 4px;"><span style="color: ${bodyColor}; font-size: 14px;">• $1</span></div>`
    );
    
    // Formatear enlaces - SIN fondos pasteles para widget interno
    safeText = safeText.replace(/(https?:\/\/[^\s]+)/g, 
      `<a href="$1" target="_blank" style="color: ${accentColor}; text-decoration: underline; font-weight: 500; transition: all 0.2s;">$1</a>`
    );
    
    // Formatear párrafos (líneas que no son títulos ni listas)
    const lines = safeText.split('\n');
    const formattedLines = lines.map(line => {
      line = line.trim();
      if (!line) return '<br style="margin: 6px 0;">';
      
      // Si no es título, lista o ya tiene formato HTML, envolver en párrafo
      if (!line.match(/^<(h1|h2|div|a)/)) {
        return `<p style="margin: 8px 0; line-height: 1.6; color: ${bodyColor}; font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${line}</p>`;
      }
      
      return line;
    });
    
    return formattedLines.join('');
  }

  // Función auxiliar para escapar HTML
  function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function addMessage(content, role) {
    const messageElement = document.createElement('div');
    messageElement.className = `aipi-message aipi-message-${role}`;
    messageElement.style.marginBottom = '12px';
    messageElement.style.maxWidth = '80%';
    messageElement.style.padding = '10px 14px';
    messageElement.style.borderRadius = '18px';
    messageElement.style.fontSize = '14px';
    messageElement.style.lineHeight = '1.5';
    messageElement.style.wordBreak = 'break-word';
    
    if (role === 'user') {
      messageElement.style.backgroundColor = '#3B82F6';
      messageElement.style.color = '#FFFFFF';
      messageElement.style.marginLeft = 'auto';
      messageElement.style.borderBottomRightRadius = '4px';
    } else {
      // Colores dinámicos basados en el tema principal con contraste adecuado
      const themeColor = widgetConfig.themeColor || '#6366f1';
      const isDarkBubble = isColorDark(themeColor);
      
      // Para burbujas oscuras: usar fondo claro con texto oscuro para mejor contraste
      // Para burbujas claras: usar fondo oscuro con texto claro
      const assistantBgColor = isDarkBubble ? '#f3f4f6' : themeColor;
      const assistantTextColor = isDarkBubble ? '#1f2937' : '#ffffff';
      
      messageElement.style.backgroundColor = assistantBgColor;
      messageElement.style.color = assistantTextColor;
      messageElement.style.marginRight = 'auto';
      messageElement.style.borderBottomLeftRadius = '4px';
    }
    
    // Formatear el contenido según el rol del mensaje
    if (role === 'assistant') {
      messageElement.innerHTML = formatBotResponse(content);
    } else {
      messageElement.innerHTML = formatMessage(content);
    }
    
    messageContainer.appendChild(messageElement);
    scrollToBottom();
  }
  
  function showTypingIndicator(show) {
    // Remover indicador existente si hay uno
    const existingIndicator = document.querySelector('.aipi-typing-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    if (show) {
      const indicator = document.createElement('div');
      indicator.className = 'aipi-typing-indicator';
      indicator.style.display = 'flex';
      indicator.style.padding = '10px 14px';
      
      // Aplicar colores dinámicos también al indicador de escritura
      const themeColor = widgetConfig.themeColor || '#6366f1';
      const isDarkBubble = isColorDark(themeColor);
      const assistantBgColor = isDarkBubble ? '#f3f4f6' : themeColor;
      
      indicator.style.backgroundColor = assistantBgColor;
      indicator.style.borderRadius = '18px';
      indicator.style.marginBottom = '12px';
      indicator.style.maxWidth = '80%';
      indicator.style.marginRight = 'auto';
      indicator.style.borderBottomLeftRadius = '4px';
      
      const dots = document.createElement('div');
      dots.style.display = 'flex';
      dots.style.alignItems = 'center';
      dots.innerHTML = `
        <span style="width: 8px; height: 8px; margin-right: 4px; background-color: #A0AEC0; border-radius: 50%; display: inline-block; animation: aipi-typing 1s infinite; animation-delay: 0s;"></span>
        <span style="width: 8px; height: 8px; margin-right: 4px; background-color: #A0AEC0; border-radius: 50%; display: inline-block; animation: aipi-typing 1s infinite; animation-delay: 0.2s;"></span>
        <span style="width: 8px; height: 8px; background-color: #A0AEC0; border-radius: 50%; display: inline-block; animation: aipi-typing 1s infinite; animation-delay: 0.4s;"></span>
      `;
      
      // Añadir animación CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes aipi-typing {
          0% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.3; transform: scale(0.8); }
        }
      `;
      document.head.appendChild(style);
      
      indicator.appendChild(dots);
      messageContainer.appendChild(indicator);
      scrollToBottom();
    }
  }
  
  function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
  
  function formatMessage(text) {
    if (!text) return '';
    
    // Escape HTML para prevenir XSS
    let safeText = escapeHTML(text);
    
    // Convertir URLs en enlaces
    safeText = safeText.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" style="color: #63B3ED; text-decoration: underline;">$1</a>'
    );
    
    // Convertir saltos de línea en <br>
    safeText = safeText.replace(/\n/g, '<br>');
    
    return safeText;
  }
  
  function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();