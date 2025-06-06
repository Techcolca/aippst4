/*
 * AIPI Fullscreen Chat Widget (ChatGPT Style)
 * 
 * Versión que emula la interfaz de ChatGPT para una experiencia más familiar.
 * Este script crea un botón flotante que al hacer clic abre un chat en pantalla completa.
 */
(function() {
  // Configuración inicial y datos de estado
  let config = {
    apiKey: '',
    serverUrl: window.location.origin,
    mainColor: '#19c37d', // Color verde típico de ChatGPT
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
  
  // Generar sugerencias específicas para cada integración
  function generateSuggestedTopics() {
    const topicsContainer = document.getElementById('aipi-suggested-topics');
    if (!topicsContainer) return;
    
    let topics = [];
    
    // Sugerencias específicas según la integración
    if (config.integrationName === 'Dios Fiel') {
      topics = [
        { query: "¿Cuáles son los principios bíblicos fundamentales?", text: "Principios bíblicos" },
        { query: "¿Cómo puedo fortalecer mi fe cristiana?", text: "Fortalecer la fe" },
        { query: "¿Qué dice la Biblia sobre la oración?", text: "Sobre la oración" },
        { query: "¿Cómo encontrar propósito en Dios?", text: "Encontrar propósito" },
        { query: "¿Qué enseña la Biblia sobre el perdón?", text: "Sobre el perdón" }
      ];
    } else if (config.integrationName === 'Techcolca') {
      topics = [
        { query: "¿Qué servicios de tecnología ofrecen?", text: "Servicios tecnológicos" },
        { query: "¿Cómo pueden ayudar con mi proyecto web?", text: "Proyectos web" },
        { query: "¿Ofrecen soporte técnico especializado?", text: "Soporte técnico" },
        { query: "¿Cuáles son sus precios y planes?", text: "Precios y planes" },
        { query: "¿Tienen experiencia en desarrollo de aplicaciones?", text: "Desarrollo de apps" }
      ];
    } else {
      // Sugerencias genéricas para otras integraciones
      topics = [
        { query: "¿Qué servicios ofrecen?", text: "Nuestros servicios" },
        { query: "¿Cómo pueden ayudarme?", text: "¿Cómo ayudamos?" },
        { query: "¿Cuáles son sus horarios de atención?", text: "Horarios de atención" },
        { query: "¿Tienen experiencia en mi sector?", text: "Experiencia sectorial" },
        { query: "¿Cuáles son sus precios?", text: "Información de precios" }
      ];
    }
    
    // Limpiar contenedor
    topicsContainer.innerHTML = '';
    
    // Generar elementos HTML para cada sugerencia
    topics.forEach(topic => {
      const topicElement = document.createElement('div');
      topicElement.className = 'aipi-topic';
      topicElement.setAttribute('data-query', topic.query);
      topicElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>${topic.text}</span>
      `;
      // Agregar evento de click
      topicElement.addEventListener('click', function() {
        const query = this.getAttribute('data-query');
        if (query) {
          const inputField = document.getElementById('aipi-chat-input');
          if (inputField) {
            inputField.value = query;
            // Disparar el evento input para activar el botón
            const event = new Event('input', { bubbles: true });
            inputField.dispatchEvent(event);
            // Enfocar el campo
            inputField.focus();
          }
        }
      });
      
      topicsContainer.appendChild(topicElement);
    });
    
    console.log(`AIPI Widget: Sugerencias generadas para ${config.integrationName}`);
  }
  
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
        if (src.includes('chatgpt-embed.js')) {
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
      
      // Obtener URL del servidor si se proporciona
      const serverUrl = scriptElement.getAttribute('data-server-url');
      if (serverUrl) {
        config.serverUrl = serverUrl;
        console.log('AIPI Widget: URL del servidor personalizada - ' + config.serverUrl);
      } else {
        // Extraer el dominio del script como URL del servidor
        try {
          const scriptUrl = new URL(scriptSrc);
          config.serverUrl = scriptUrl.origin;
          console.log('AIPI Widget: URL del servidor desde script - ' + config.serverUrl);
        } catch (error) {
          console.log('AIPI Widget: Error al extraer dominio, usando predeterminado');
        }
      }
      
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
      
      // Verificación de integración cargada
      console.log(`AIPI Widget: Integración "${data.integration?.name}" cargada correctamente`);
      
      // Sobrescribir configuración con datos del servidor
      if (data.integration) {
        if (data.integration.themeColor) {
          config.mainColor = data.integration.themeColor;
        }
        
        if (data.integration.position) {
          config.position = data.integration.position;
        }
        
        // Almacenar nombre de la integración para verificación
        config.integrationName = data.integration.name;
        config.integrationId = data.integration.id;
        
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
      
      // Crear panel de chat con barra lateral
      const chatPanel = document.createElement('div');
      chatPanel.id = 'aipi-chat-panel';
      chatPanel.innerHTML = `
        <div id="aipi-chat-header">
          <div id="aipi-chat-header-title">
            <div id="aipi-chat-avatar" style="background-color: ${config.mainColor};">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            ${config.title}
          </div>
          <button id="aipi-chat-close">×</button>
        </div>
        
        <div id="aipi-chat-body">
          <!-- Barra lateral con sugerencias -->
          <div id="aipi-chat-sidebar">
            <div id="aipi-sidebar-header">
              <h3>Conversaciones sugeridas</h3>
            </div>
            <div id="aipi-suggested-topics">
              <!-- Las sugerencias se generarán dinámicamente según la integración -->
            </div>
            <div id="aipi-new-chat">
              <button id="aipi-new-chat-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Nueva conversación
              </button>
            </div>
          </div>
          
          <!-- Panel principal de chat -->
          <div id="aipi-chat-main">
            <div id="aipi-chat-messages">
              <!-- Los mensajes se añadirán aquí -->
            </div>
            <div id="aipi-chat-input-area">
              <textarea id="aipi-chat-input" placeholder="Escribe tu mensaje..." rows="1"></textarea>
              <button id="aipi-chat-send" disabled style="background-color: ${config.mainColor};">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
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
        // Auto-expandir textarea
        inputField.addEventListener('input', function() {
          // Restablecer altura
          this.style.height = 'auto';
          // Establecer nueva altura según el contenido
          this.style.height = (this.scrollHeight) + 'px';
          // Habilitar/deshabilitar botón según contenido
          sendButton.disabled = !this.value.trim();
        });
        
        // Enviar mensaje al presionar Enter (sin Shift)
        inputField.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' && !e.shiftKey && this.value.trim()) {
            e.preventDefault(); // Evitar salto de línea
            sendMessage();
          }
        });
        
        // Enviar mensaje al hacer clic en el botón
        sendButton.onclick = sendMessage;
      }
      
      // Los eventos para temas sugeridos se configurarán en generateSuggestedTopics()
      
      // Evento para nueva conversación
      const newChatButton = document.getElementById('aipi-new-chat-button');
      if (newChatButton) {
        newChatButton.addEventListener('click', function() {
          // Limpiar mensajes existentes
          const messagesContainer = document.getElementById('aipi-chat-messages');
          if (messagesContainer) {
            messagesContainer.innerHTML = '';
          }
          
          // Reiniciar conversación
          conversationId = null;
          startConversation();
        });
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
      console.log('AIPI Widget: Creando conversación en el servidor...');
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
        const errorText = await response.text();
        console.error('AIPI Widget Error al crear conversación:', errorText);
        throw new Error(`Error al crear conversación: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('AIPI Widget: Conversación creada', data);
      conversationId = data.id;
      
      // Añadir mensaje de saludo
      addMessage(config.greetingMessage, 'assistant');
      
      console.log('AIPI Widget: Conversación iniciada con ID', conversationId);
    } catch (error) {
      console.error('AIPI Widget Error:', error);
      addMessage(`Lo siento, hubo un problema al iniciar la conversación: ${error.message}. Comprueba que la URL del servidor sea correcta. Puedes añadir el atributo 'data-server-url' al script con la URL completa de tu servidor.`, 'assistant');
    }
  }
  
  // Enviar mensaje
  async function sendMessage() {
    const inputField = document.getElementById('aipi-chat-input');
    const message = inputField.value.trim();
    
    if (!message) return;
    
    // Limpiar campo de entrada
    inputField.value = '';
    inputField.style.height = 'auto'; // Restablecer altura del textarea
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
      console.log('AIPI Widget: Enviando mensaje...', { conversationId, message });
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
        const errorText = await response.text();
        console.error('AIPI Widget Error:', errorText);
        if (response.status === 500) {
          addMessage('Lo siento, hay un problema temporal con el servicio. Por favor, intenta de nuevo más tarde.', 'assistant');
        } else {
          addMessage(`Lo siento, no pude procesar tu mensaje (Error ${response.status}). Verifica que la URL del servidor sea correcta usando el atributo 'data-server-url' en el script.`, 'assistant');
        }
        throw new Error(`Error al enviar mensaje: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('AIPI Widget: Respuesta recibida', data);
      
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
    messageEl.className = `aipi-message aipi-${role}`;
    
    // Contenedor interior para estilos específicos
    const messageInner = document.createElement('div');
    messageInner.className = 'aipi-message-content';
    
    // Formatear el contenido con saltos de línea y enlaces
    messageInner.innerHTML = formatMessage(content);
    
    // Añadir avatar para mensajes del asistente
    if (role === 'assistant') {
      const avatar = document.createElement('div');
      avatar.className = 'aipi-message-avatar';
      avatar.style.backgroundColor = config.mainColor;
      avatar.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      `;
      messageEl.appendChild(avatar);
    }
    
    // Añadir el contenido del mensaje
    messageEl.appendChild(messageInner);
    
    messagesContainer.appendChild(messageEl);
    
    // Desplazar al fondo
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Formatear mensaje para mostrar enlaces y saltos de línea
  function formatMessage(text) {
    if (!text) return '';
    
    // Escapar HTML para seguridad
    let safeText = escapeHTML(text);
    
    // Convertir URLs en enlaces clicables
    safeText = safeText.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // Convertir saltos de línea en etiquetas <br>
    safeText = safeText.replace(/\n/g, '<br>');
    
    return safeText;
  }
  
  // Mostrar/ocultar indicador de escritura
  function showTypingIndicator(show) {
    const messagesContainer = document.getElementById('aipi-chat-messages');
    if (!messagesContainer) return;
    
    // Eliminar indicador existente si lo hay
    const existingIndicator = document.getElementById('aipi-typing-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    if (show) {
      const indicator = document.createElement('div');
      indicator.id = 'aipi-typing-indicator';
      indicator.className = 'aipi-message aipi-assistant';
      
      const avatar = document.createElement('div');
      avatar.className = 'aipi-message-avatar';
      avatar.style.backgroundColor = config.mainColor;
      avatar.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      `;
      
      const content = document.createElement('div');
      content.className = 'aipi-message-content';
      content.innerHTML = `
        <div class="aipi-typing-animation">
          <span></span>
          <span></span>
          <span></span>
        </div>
      `;
      
      indicator.appendChild(avatar);
      indicator.appendChild(content);
      
      messagesContainer.appendChild(indicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
  
  // Escapar HTML para prevenir XSS
  function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
  
  // Obtener estilos CSS como string
  function getStylesCSS() {
    return `
      /* ChatGPT-like Styles for AIPI Chat Widget */
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
        width: 20px;
        height: 20px;
        margin-right: 8px;
      }
      
      /* Panel de chat en pantalla completa estilo ChatGPT */
      #aipi-chat-panel {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #ffffff;
        flex-direction: column;
        z-index: 9999;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      
      /* Cabecera del chat */
      #aipi-chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 20px;
        background-color: #f9f9f9;
        border-bottom: 1px solid #e5e5e5;
        height: 60px;
      }
      
      #aipi-chat-header-title {
        display: flex;
        align-items: center;
        font-size: 1.1rem;
        font-weight: 600;
        color: #333;
      }
      
      #aipi-chat-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
      }
      
      #aipi-chat-avatar svg {
        width: 18px;
        height: 18px;
        color: white;
      }
      
      #aipi-chat-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
      }
      
      #aipi-chat-close:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
      
      /* Layout del cuerpo principal con sidebar (estilo ChatGPT) */
      #aipi-chat-body {
        display: flex;
        flex: 1;
        overflow: hidden;
        position: relative;
        height: calc(100% - 60px);
      }
      
      /* Sidebar con sugerencias */
      #aipi-chat-sidebar {
        width: 260px;
        background-color: #f9fafb;
        border-right: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
      }
      
      #aipi-sidebar-header {
        padding: 16px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      #aipi-sidebar-header h3 {
        font-size: 14px;
        font-weight: 600;
        color: #4b5563;
        margin: 0;
      }
      
      #aipi-suggested-topics {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
      }
      
      .aipi-topic {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        margin-bottom: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
        background-color: #fff;
        border: 1px solid #e5e7eb;
      }
      
      .aipi-topic:hover {
        background-color: #f3f4f6;
      }
      
      .aipi-topic svg {
        color: #6b7280;
        margin-right: 10px;
        flex-shrink: 0;
      }
      
      .aipi-topic span {
        font-size: 13px;
        line-height: 1.4;
        color: #374151;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      #aipi-new-chat {
        padding: 12px;
        border-top: 1px solid #e5e7eb;
      }
      
      #aipi-new-chat-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 8px 12px;
        background-color: #fff;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 13px;
        color: #374151;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      #aipi-new-chat-button:hover {
        background-color: #f3f4f6;
      }
      
      #aipi-new-chat-button svg {
        margin-right: 8px;
      }
      
      /* Área principal de chat */
      #aipi-chat-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }
      
      /* Área de mensajes */
      #aipi-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px 0;
        background-color: #ffffff;
      }
      
      /* Estilo de mensajes tipo ChatGPT */
      .aipi-message {
        display: flex;
        padding: 14px 60px; /* Padding amplio como ChatGPT */
        position: relative;
        margin: 1px 0; /* Margen mínimo entre mensajes */
      }
      
      .aipi-message.aipi-user {
        background-color: #f9f9f9; /* Fondo claro para mensajes del usuario */
      }
      
      .aipi-message.aipi-assistant {
        background-color: #ffffff; /* Fondo blanco para mensajes del asistente */
      }
      
      .aipi-message-avatar {
        width: 28px;
        height: 28px;
        border-radius: 4px; /* Avatar cuadrado con bordes redondeados como en ChatGPT */
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        flex-shrink: 0;
      }
      
      .aipi-message-avatar svg {
        width: 16px;
        height: 16px;
        color: white;
      }
      
      .aipi-message-content {
        font-size: 16px;
        line-height: 1.6;
        color: #111827;
        word-wrap: break-word;
        overflow-wrap: break-word;
        max-width: 90%;
      }
      
      .aipi-message.aipi-user .aipi-message-content {
        margin-left: 44px; /* Espacio para alinear con mensajes del asistente */
      }
      
      /* Enlaces en mensajes */
      .aipi-message-content a {
        color: #2563eb;
        text-decoration: underline;
      }
      
      .aipi-message-content a:hover {
        text-decoration: none;
      }
      
      /* Área de entrada */
      #aipi-chat-input-area {
        display: flex;
        align-items: center;
        padding: 14px 60px 20px; /* Más padding abajo para dar espacio */
        background-color: #ffffff;
        border-top: 1px solid #e5e5e5;
      }
      
      #aipi-chat-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #e5e5e5;
        border-radius: 8px;
        font-size: 16px;
        line-height: 1.5;
        resize: none;
        min-height: 24px;
        max-height: 200px;
        outline: none;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      
      #aipi-chat-input:focus {
        border-color: #bfdbfe;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }
      
      #aipi-chat-send {
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        width: 40px;
        height: 40px;
        margin-left: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.2s;
      }
      
      #aipi-chat-send:hover:not(:disabled) {
        background-color: #2563eb;
        transform: translateY(-2px);
      }
      
      #aipi-chat-send:disabled {
        background-color: #cbd5e1;
        cursor: not-allowed;
      }
      
      #aipi-chat-send svg {
        width: 18px;
        height: 18px;
      }
      
      /* Animación de "Escribiendo..." */
      .aipi-typing-animation {
        display: flex;
        align-items: center;
      }
      
      .aipi-typing-animation span {
        height: 8px;
        width: 8px;
        margin: 0 2px;
        background-color: #9ca3af;
        border-radius: 50%;
        display: inline-block;
        opacity: 0.7;
      }
      
      .aipi-typing-animation span:nth-child(1) {
        animation: aipiPulse 1s infinite;
      }
      
      .aipi-typing-animation span:nth-child(2) {
        animation: aipiPulse 1s infinite 0.2s;
      }
      
      .aipi-typing-animation span:nth-child(3) {
        animation: aipiPulse 1s infinite 0.4s;
      }
      
      @keyframes aipiPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.7;
        }
        50% {
          transform: scale(1.2);
          opacity: 1;
        }
      }
      
      /* Estilo para dispositivos móviles */
      @media (max-width: 768px) {
        #aipi-chat-sidebar {
          display: none; /* Ocultar sidebar en móviles */
        }
        
        .aipi-message {
          padding: 12px 16px;
        }
        
        #aipi-chat-input-area {
          padding: 12px 16px 16px;
        }
        
        .aipi-message-content {
          font-size: 15px;
        }
      }
    `;
  }
})();