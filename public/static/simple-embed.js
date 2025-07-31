/*
 * AIPI Fullscreen Chat Widget (Simple Version)
 * 
 * Una versión simplificada y robusta del widget de chat en pantalla completa.
 * Este script crea un botón flotante que al hacer clic abre un chat en pantalla completa.
 */
(function() {
  // Función para obtener traducciones según el idioma del navegador
  function getTranslations() {
    const lang = navigator.language.substring(0, 2);
    const translations = {
      es: {
        placeholder: "Escribe tu mensaje...",
        newConversación: "Nueva conversación"
      },
      en: {
        placeholder: "Type your message...",
        newConversation: "New conversation"
      },
      fr: {
        placeholder: "Tapez votre message...",
        newConversation: "Nouvelle conversation"
      }
    };
    return translations[lang] || translations.en;
  }
  
  const t = getTranslations();

  // Configuración inicial y datos de estado
  let config = {
    apiKey: '',
    serverUrl: window.location.origin,
    mainColor: '#4f46e5',
    title: 'AIPI Assistant',
    greetingMessage: '¡Hola! Soy un asistente virtual. ¿En qué puedo ayudarte hoy?',
    position: 'bottom-right'
  };
  
  let conversationId = null;
  let visitorId = localStorage.getItem('aipi_visitor_id') || 
    'visitor_' + Math.random().toString(36).substring(2, 15);
  
  // Guardar ID de visitante
  localStorage.setItem('aipi_visitor_id', visitorId);
  
  // Inicializar widget
  document.addEventListener('DOMContentLoaded', initialize);
  
  // Función principal de inicialización
  function initialize() {
    console.log('AIPI Widget: Inicializando...');
    
    try {
      // Cargar configuración
      loadConfig();
      
      // Crear elementos del DOM
      createWidgetElements();
      
      // Adjuntar eventos
      attachEvents();
      
      console.log('AIPI Widget: Inicializado correctamente');
    } catch (error) {
      console.error('AIPI Widget Error:', error);
      alert('Error al inicializar el widget AIPI: ' + error.message);
    }
  }
  
  // Cargar configuración desde el script
  async function loadConfig() {
    try {
      // Obtener elemento de script
      const scripts = document.getElementsByTagName('script');
      let scriptElement = null;
      
      // Buscar el script correcto que contiene la clave API
      for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src || '';
        if (src.includes('simple-embed.js')) {
          scriptElement = scripts[i];
          break;
        }
      }
      
      if (!scriptElement) {
        throw new Error('No se pudo encontrar el script del widget');
      }
      
      // Obtener clave API del src o atributo data
      const scriptSrc = scriptElement.src;
      const urlParams = new URLSearchParams(scriptSrc.split('?')[1] || '');
      config.apiKey = urlParams.get('key') || scriptElement.getAttribute('data-api-key');
      
      if (!config.apiKey) {
        throw new Error('Se requiere una clave API');
      }
      
      console.log('AIPI Widget: Clave API cargada - ' + config.apiKey);
      
      // Obtener color del tema
      const themeColor = scriptElement.getAttribute('data-theme-color');
      if (themeColor) config.mainColor = themeColor;
      
      // Obtener posición
      const position = scriptElement.getAttribute('data-position');
      if (position) config.position = position;
      
      // Obtener título
      const title = scriptElement.getAttribute('data-title');
      if (title) config.title = title;
      
      // Obtener mensaje de saludo
      const greeting = scriptElement.getAttribute('data-greeting');
      if (greeting) config.greetingMessage = greeting;
      
      // Cargar datos de integración desde el servidor
      const response = await fetch(`${config.serverUrl}/api/widget/${config.apiKey}`);
      if (!response.ok) {
        throw new Error(`Error al cargar datos de integración: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Sobrescribir configuración con datos del servidor
      if (data.integration) {
        if (data.integration.themeColor) {
          config.mainColor = data.integration.themeColor;
        }
        
        if (data.integration.position) {
          config.position = data.integration.position;
        }
        
        // El botBehavior no debe usarse como mensaje de bienvenida
        // Solo usamos defaultGreeting o welcomeMessage para mostrar al usuario
      }
      
      console.log('AIPI Widget: Configuración cargada correctamente');
    } catch (error) {
      console.error('AIPI Widget Error:', error);
      throw new Error('Error al cargar la configuración: ' + error.message);
    }
  }
  
  // Crear elementos del widget
  function createWidgetElements() {
    try {
      // Crear estilos
      const styleEl = document.createElement('style');
      styleEl.textContent = getStylesCSS();
      document.head.appendChild(styleEl);
      
      // Crear contenedor del botón
      const buttonContainer = document.createElement('div');
      buttonContainer.id = 'aipi-chat-button-container';
      
      // Calcular posición del botón
      const positionStyle = getPositionStyle(config.position);
      buttonContainer.style.position = 'fixed';
      buttonContainer.style.zIndex = '9998';
      buttonContainer.style.bottom = positionStyle.bottom;
      buttonContainer.style.right = positionStyle.right;
      buttonContainer.style.left = positionStyle.left;
      buttonContainer.style.top = positionStyle.top;
      
      // Crear botón
      const button = document.createElement('button');
      button.id = 'aipi-chat-button';
      button.style.backgroundColor = config.mainColor;
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Chat</span>
      `;
      
      buttonContainer.appendChild(button);
      document.body.appendChild(buttonContainer);
      
      // Crear panel de chat
      const chatPanel = document.createElement('div');
      chatPanel.id = 'aipi-chat-panel';
      chatPanel.innerHTML = `
        <div id="aipi-chat-header" style="background-color: ${config.mainColor};">
          <div id="aipi-chat-header-title">
            <div id="aipi-chat-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            ${config.title}
          </div>
          <button id="aipi-chat-close">×</button>
        </div>
        <div id="aipi-chat-messages">
          <!-- Los mensajes se añadirán aquí -->
        </div>
        <div id="aipi-chat-input-area">
          <input type="text" id="aipi-chat-input" placeholder="${t.placeholder}">
          <button id="aipi-chat-send" disabled style="background-color: ${config.mainColor};">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      `;
      
      document.body.appendChild(chatPanel);
      
      console.log('AIPI Widget: Elementos creados correctamente');
    } catch (error) {
      console.error('AIPI Widget Error:', error);
      throw new Error('Error al crear los elementos del widget: ' + error.message);
    }
  }
  
  // Adjuntar eventos a los elementos
  function attachEvents() {
    try {
      // Evento del botón para abrir el chat
      const chatButton = document.getElementById('aipi-chat-button');
      if (chatButton) {
        chatButton.onclick = openChat;
        console.log('AIPI Widget: Evento de clic adjuntado al botón de chat');
      }
      
      // Evento del botón para cerrar el chat
      const closeButton = document.getElementById('aipi-chat-close');
      if (closeButton) {
        closeButton.onclick = closeChat;
      }
      
      // Eventos del campo de entrada
      const inputField = document.getElementById('aipi-chat-input');
      const sendButton = document.getElementById('aipi-chat-send');
      
      if (inputField && sendButton) {
        // Habilitar/deshabilitar botón de envío según el contenido
        inputField.oninput = function() {
          sendButton.disabled = !inputField.value.trim();
        };
        
        // Enviar mensaje al presionar Enter
        inputField.onkeydown = function(e) {
          if (e.key === 'Enter' && inputField.value.trim()) {
            sendMessage();
          }
        };
        
        // Enviar mensaje al hacer clic en el botón
        sendButton.onclick = sendMessage;
      }
      
      console.log('AIPI Widget: Todos los eventos adjuntados correctamente');
    } catch (error) {
      console.error('AIPI Widget Error:', error);
      alert('Error al configurar los eventos del widget: ' + error.message);
    }
  }
  
  // Abrir el chat
  function openChat() {
    console.log('AIPI Widget: Abriendo chat...');
    try {
      // Ocultar botón
      const buttonContainer = document.getElementById('aipi-chat-button-container');
      if (buttonContainer) {
        buttonContainer.style.display = 'none';
      }
      
      // Mostrar panel de chat
      const chatPanel = document.getElementById('aipi-chat-panel');
      if (chatPanel) {
        chatPanel.style.display = 'flex';
      }
      
      // Iniciar conversación si es necesario
      if (!conversationId) {
        startConversation();
      }
      
      // Enfocar campo de entrada
      setTimeout(function() {
        const input = document.getElementById('aipi-chat-input');
        if (input) input.focus();
      }, 300);
      
      console.log('AIPI Widget: Chat abierto');
    } catch (error) {
      console.error('AIPI Widget Error:', error);
      alert('Error al abrir el chat: ' + error.message);
    }
  }
  
  // Cerrar el chat
  function closeChat() {
    console.log('AIPI Widget: Cerrando chat...');
    try {
      // Ocultar panel de chat
      const chatPanel = document.getElementById('aipi-chat-panel');
      if (chatPanel) {
        chatPanel.style.display = 'none';
      }
      
      // Mostrar botón
      const buttonContainer = document.getElementById('aipi-chat-button-container');
      if (buttonContainer) {
        buttonContainer.style.display = 'block';
      }
      
      console.log('AIPI Widget: Chat cerrado');
    } catch (error) {
      console.error('AIPI Widget Error:', error);
      alert('Error al cerrar el chat: ' + error.message);
    }
  }
  
  // Iniciar conversación
  async function startConversation() {
    console.log('AIPI Widget: Iniciando conversación...');
    try {
      // Extraer contenido de la página
      const pageTitle = document.title;
      const pageContent = document.body.innerText.substring(0, 10000); // Limitar a 10k caracteres
      
      // Crear conversación en el servidor
      const response = await fetch(`${config.serverUrl}/api/widget/${config.apiKey}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: visitorId,
          pageContext: {
            title: pageTitle,
            url: window.location.href,
            content: pageContent
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear conversación: ${response.status}`);
      }
      
      const data = await response.json();
      conversationId = data.id;
      
      // Añadir mensaje de saludo
      addMessage(config.greetingMessage, 'assistant');
      
      console.log('AIPI Widget: Conversación iniciada con ID', conversationId);
    } catch (error) {
      console.error('AIPI Widget Error:', error);
      addMessage('Lo siento, hubo un problema al iniciar la conversación. Por favor, intenta de nuevo más tarde.', 'assistant');
    }
  }
  
  // Enviar mensaje
  async function sendMessage() {
    const inputField = document.getElementById('aipi-chat-input');
    const message = inputField.value.trim();
    
    if (!message) return;
    
    // Limpiar campo de entrada
    inputField.value = '';
    document.getElementById('aipi-chat-send').disabled = true;
    
    // Añadir mensaje del usuario a la interfaz
    addMessage(message, 'user');
    
    // Mostrar indicador de escritura
    showTypingIndicator(true);
    
    try {
      // Iniciar conversación si es necesario
      if (!conversationId) {
        await startConversation();
      }
      
      // Enviar mensaje al servidor
      const response = await fetch(`${config.serverUrl}/api/widget/${config.apiKey}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationId,
          content: message,
          role: 'user'
        })
      });
      
      // Ocultar indicador de escritura
      showTypingIndicator(false);
      
      if (!response.ok) {
        if (response.status === 500) {
          addMessage('Lo siento, hay un problema temporal con el servicio. Por favor, intenta de nuevo más tarde.', 'assistant');
        } else {
          addMessage('Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo.', 'assistant');
        }
        throw new Error(`Error al enviar mensaje: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Añadir respuesta de la IA
      if (data.aiMessage && data.aiMessage.content) {
        addMessage(data.aiMessage.content, 'assistant');
      } else {
        addMessage('Recibí tu mensaje, pero no pude generar una respuesta en este momento.', 'assistant');
      }
    } catch (error) {
      console.error('AIPI Widget Error:', error);
      
      // Asegurar que el indicador de escritura se oculta
      showTypingIndicator(false);
    }
  }
  
  // Añadir mensaje a la interfaz
  function addMessage(content, role) {
    const messagesContainer = document.getElementById('aipi-chat-messages');
    if (!messagesContainer) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;
    
    // Formatear el contenido según el rol del mensaje
    if (role === 'assistant') {
      messageEl.innerHTML = formatBotResponse(content);
    } else {
      messageEl.textContent = content;
    }
    
    messagesContainer.appendChild(messageEl);
    
    // Desplazar al fondo
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Mostrar/ocultar indicador de escritura
  function showTypingIndicator(show) {
    const messagesContainer = document.getElementById('aipi-chat-messages');
    if (!messagesContainer) return;
    
    // Eliminar indicador existente si lo hay
    const existingIndicator = document.getElementById('typing-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    if (show) {
      const indicator = document.createElement('div');
      indicator.id = 'typing-indicator';
      indicator.className = 'message assistant';
      indicator.textContent = 'Escribiendo...';
      
      messagesContainer.appendChild(indicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Crear tonos pasteles mezclando con blanco
    const pastelLight = `rgb(${Math.round(r + (255 - r) * 0.7)}, ${Math.round(g + (255 - g) * 0.7)}, ${Math.round(b + (255 - b) * 0.7)})`;
    const pastelMedium = `rgb(${Math.round(r + (255 - r) * 0.5)}, ${Math.round(g + (255 - g) * 0.5)}, ${Math.round(b + (255 - b) * 0.5)})`;
    const pastelDark = `rgb(${Math.round(r + (255 - r) * 0.3)}, ${Math.round(g + (255 - g) * 0.3)}, ${Math.round(b + (255 - b) * 0.3)})`;
    
    return {
      light: pastelLight,
      medium: pastelMedium,
      dark: pastelDark,
      accent: baseColor
    };
  }

  // Función para formatear respuestas del chatbot con estilo enriquecido
  function formatBotResponse(text) {
    if (!text) return '';
    
    const palette = generatePastelPalette(config.mainColor);
    const isDarkTheme = isColorDark(config.mainColor);
    
    // Colores de texto basados en el tema
    const titleColor = isDarkTheme ? '#f9fafb' : '#1f2937';
    const bodyColor = isDarkTheme ? '#e5e7eb' : '#374151';
    const accentColor = config.mainColor;
    
    // Escape HTML para prevenir XSS
    let safeText = escapeHTML(text);
    
    // Formatear títulos principales (líneas que empiezan con #)
    safeText = safeText.replace(/^# (.+)$/gm, 
      `<h1 style="font-size: 18px; font-weight: 700; color: ${titleColor}; margin: 16px 0 12px 0; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">$1</h1>`
    );
    
    // Formatear subtítulos (líneas que empiezan con ##)
    safeText = safeText.replace(/^## (.+)$/gm, 
      `<h2 style="font-size: 16px; font-weight: 600; color: ${titleColor}; margin: 14px 0 10px 0; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">$1</h2>`
    );
    
    // Formatear texto en negrita (**texto**)
    safeText = safeText.replace(/\*\*(.+?)\*\*/g, 
      `<strong style="font-weight: 600; color: ${titleColor};">$1</strong>`
    );
    
    // Formatear texto destacado (*texto*)
    safeText = safeText.replace(/\*(.+?)\*/g, 
      `<em style="font-style: italic; color: ${accentColor}; font-weight: 500;">$1</em>`
    );
    
    // Formatear listas numeradas (1. texto)
    safeText = safeText.replace(/^\d+\.\s(.+)$/gm, 
      `<div style="margin: 8px 0; padding: 8px 12px; background: ${palette.light}; border-left: 3px solid ${palette.accent}; border-radius: 4px;"><span style="font-weight: 500; color: ${titleColor};">$1</span></div>`
    );
    
    // Formatear listas con viñetas (- texto)
    safeText = safeText.replace(/^-\s(.+)$/gm, 
      `<div style="margin: 6px 0; padding: 6px 12px; background: ${palette.light}; border-radius: 4px; border-left: 2px solid ${palette.medium};"><span style="color: ${bodyColor};">• $1</span></div>`
    );
    
    // Formatear enlaces
    safeText = safeText.replace(/(https?:\/\/[^\s]+)/g, 
      `<a href="$1" target="_blank" style="color: ${accentColor}; text-decoration: underline; font-weight: 500;">$1</a>`
    );
    
    // Formatear párrafos (líneas que no son títulos ni listas)
    const lines = safeText.split('\n');
    const formattedLines = lines.map(line => {
      line = line.trim();
      if (!line) return '<br>';
      
      // Si no es título, lista o ya tiene formato HTML, envolver en párrafo
      if (!line.match(/^<(h1|h2|div|a)/)) {
        return `<p style="margin: 8px 0; line-height: 1.6; color: ${bodyColor}; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${line}</p>`;
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

  // Obtener estilos CSS como string
  function getStylesCSS() {
    const isDarkTheme = isColorDark(config.mainColor);
    
    // Colores dinámicos basados en el tema
    const chatBgColor = isDarkTheme ? '#1f2937' : '#f5f7fb';
    const assistantBgColor = isDarkTheme ? '#374151' : '#e5e7eb';
    const assistantTextColor = isDarkTheme ? '#f9fafb' : '#1f2937';
    const inputBorderColor = isDarkTheme ? '#4b5563' : '#e5e7eb';
    const inputBgColor = isDarkTheme ? '#374151' : '#ffffff';
    const inputTextColor = isDarkTheme ? '#f9fafb' : '#000000';
    
    return `
      /* Estilos para el botón flotante */
      #aipi-chat-button-container {
        display: block;
        z-index: 9998;
      }
      
      #aipi-chat-button {
        width: auto;
        height: auto;
        border-radius: 50px;
        color: white;
        display: flex;
        align-items: center;
        cursor: pointer !important;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        padding: 12px 20px;
        border: none;
        outline: none;
      }
      
      #aipi-chat-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      }
      
      #aipi-chat-button svg {
        margin-right: 8px;
      }
      
      #aipi-chat-button span {
        font-family: Arial, sans-serif;
        font-size: 14px;
      }
      
      /* Estilos para el panel de chat */
      #aipi-chat-panel {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: white;
        display: none;
        flex-direction: column;
        z-index: 9999;
      }
      
      #aipi-chat-header {
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      #aipi-chat-header-title {
        display: flex;
        align-items: center;
        font-weight: bold;
        font-family: Arial, sans-serif;
      }
      
      #aipi-chat-avatar {
        width: 30px;
        height: 30px;
        background-color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
      }
      
      #aipi-chat-avatar svg {
        width: 20px;
        height: 20px;
        color: inherit;
      }
      
      #aipi-chat-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
      }
      
      #aipi-chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 15px;
        background-color: ${chatBgColor};
      }
      
      .message {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 18px;
        word-break: break-word;
        font-family: Arial, sans-serif;
      }
      
      .message.assistant {
        align-self: flex-start;
        background-color: ${assistantBgColor};
        color: ${assistantTextColor};
        border-bottom-left-radius: 4px;
      }
      
      .message.user {
        align-self: flex-end;
        background-color: #3b82f6;
        color: white;
        border-bottom-right-radius: 4px;
      }
      
      #aipi-chat-input-area {
        padding: 15px;
        display: flex;
        border-top: 1px solid ${inputBorderColor};
        background-color: ${chatBgColor};
      }
      
      #aipi-chat-input {
        flex: 1;
        padding: 12px;
        border: 1px solid ${inputBorderColor};
        border-radius: 24px;
        outline: none;
        font-size: 14px;
        font-family: Arial, sans-serif;
        background-color: ${inputBgColor};
        color: ${inputTextColor};
      }
      
      #aipi-chat-send {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        color: white;
        border: none;
        margin-left: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      #aipi-chat-send svg {
        width: 18px;
        height: 18px;
      }
      
      #aipi-chat-send:disabled {
        background-color: #d1d5db !important;
        cursor: not-allowed;
      }
      
      #typing-indicator {
        font-style: italic;
      }
    `;
  }
  
  // Calcular posición del botón según la configuración
  function getPositionStyle(position) {
    const style = {
      bottom: 'auto',
      right: 'auto',
      top: 'auto',
      left: 'auto'
    };
    
    switch (position) {
      case 'bottom-right':
        style.bottom = '20px';
        style.right = '20px';
        break;
      case 'bottom-left':
        style.bottom = '20px';
        style.left = '20px';
        break;
      case 'top-right':
        style.top = '20px';
        style.right = '20px';
        break;
      case 'top-left':
        style.top = '20px';
        style.left = '20px';
        break;
      default:
        style.bottom = '20px';
        style.right = '20px';
    }
    
    return style;
  }
})();