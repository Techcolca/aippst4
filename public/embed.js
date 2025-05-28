(function() {
  // AIPI Widget Configuration
  const config = {
    apiKey: "",
    position: "bottom-right",
    themeColor: "#3B82F6",
    assistantName: "AIPPS Assistant",
    greetingMessage: "👋 Hi there! I'm AIPPS, your AI assistant. How can I help you today?",
    showAvailability: true,
    userBubbleColor: "#3B82F6",
    assistantBubbleColor: "#E5E7EB",
    font: "inter",
    autoOpen: false,
    autoOpenDelay: 5000, // in milliseconds
    visitorId: "",
    conversationId: null,
    widgetType: "bubble", // "bubble" or "fullscreen"
    ignoredSections: [], // Secciones del sitio web a ignorar
    serverUrl: "https://api.aipi.example.com", // Will be overridden by script URL source
    fontURL: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
  };
  
  // State variables
  let widgetInstance = null;
  let isOpen = false;
  let isMinimized = false;
  let messages = [];
  let isTyping = false;
  let conversationStarted = false;
  let fontLoaded = false;
  let siteContentScanned = false;
  let currentPageContent = "";
  let pageTitle = "";
  
  // Initialize widget
  function init() {
    // Extract the API key from script tag
    const scriptTags = document.getElementsByTagName('script');
    const currentScript = scriptTags[scriptTags.length - 1];
    const scriptSrc = currentScript.src;
    
    // Extract API key from script src with better error handling
    try {
      const urlParts = scriptSrc.split('?');
      if (urlParts.length > 1) {
        const urlParams = new URLSearchParams(urlParts[1]);
        config.apiKey = urlParams.get('key');
      }
      
      // Additional fallback: try to extract key from the URL directly
      if (!config.apiKey) {
        const keyMatch = scriptSrc.match(/[?&]key=([^&]+)/);
        if (keyMatch) {
          config.apiKey = keyMatch[1];
        }
      }
    } catch (error) {
      console.warn("Error extracting API key:", error);
    }
    
    // Extract server URL from script src safely
    try {
      const scriptUrl = new URL(scriptSrc);
      config.serverUrl = `${scriptUrl.protocol}//${scriptUrl.hostname}${scriptUrl.port ? ':' + scriptUrl.port : ''}`;
    } catch (error) {
      console.warn("Error parsing script URL, falling back to default");
      // Extract domain from script src using regex as fallback
      const domainMatch = scriptSrc.match(/https?:\/\/([^\/]+)/);
      if (domainMatch && domainMatch[0]) {
        config.serverUrl = domainMatch[0];
      } else {
        // Hard fallback to the known Replit URL
        config.serverUrl = "https://a82260a7-e706-4639-8a5c-db88f2f26167-00-2a8uzldw0vxo4.picard.replit.dev";
      }
    }
    
    // Generate visitor ID if not exists
    if (!localStorage.getItem('aipi_visitor_id')) {
      localStorage.setItem('aipi_visitor_id', 'visitor_' + Math.random().toString(36).substring(2, 15));
    }
    config.visitorId = localStorage.getItem('aipi_visitor_id');
    
    // Load widget configuration from server
    loadWidgetConfig().then(() => {
      // Load fonts
      loadFont();
      
      // Create widget DOM elements
      createWidgetDOM();
      
      // Attach event listeners
      attachEventListeners();
      
      // Auto-open widget if configured
      if (config.autoOpen) {
        setTimeout(() => {
          openWidget();
        }, config.autoOpenDelay);
      }
    }).catch(error => {
      console.error('AIPI Widget Error:', error);
    });
  }
  
  // Load widget configuration from server
  async function loadWidgetConfig() {
    if (!config.apiKey) {
      throw new Error('AIPI API key is required. Add it to your script tag: ?key=YOUR_API_KEY');
    }
    
    try {
      const response = await fetch(`${config.serverUrl}/api/widget/${config.apiKey}`);
      if (!response.ok) {
        throw new Error('Failed to load widget configuration');
      }
      
      const data = await response.json();
      
      // Update config with server settings
      if (data.integration) {
        config.position = data.integration.position || config.position;
        config.themeColor = data.integration.themeColor || config.themeColor;
        config.widgetType = data.integration.widgetType || config.widgetType;
        config.ignoredSections = data.integration.ignoredSections || [];
      }
      
      if (data.settings) {
        config.assistantName = data.settings.assistantName || config.assistantName;
        config.greetingMessage = data.settings.defaultGreeting || config.greetingMessage;
        config.showAvailability = data.settings.showAvailability;
        config.userBubbleColor = data.settings.userBubbleColor || config.userBubbleColor;
        config.assistantBubbleColor = data.settings.assistantBubbleColor || config.assistantBubbleColor;
        config.font = data.settings.font || config.font;
      }
      
      // Extraer el contenido de la página actual para mejorar las respuestas
      scanCurrentPageContent();
      
    } catch (error) {
      console.error('Error loading AIPI widget configuration:', error);
      // Continue with default settings
    }
  }
  
  // Función para extraer el contenido del sitio
  function scanCurrentPageContent() {
    try {
      // Extraer título de la página
      pageTitle = document.title || '';
      
      // Extraer metadescription si existe
      let metaDescription = '';
      const metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (metaDescriptionTag) {
        metaDescription = metaDescriptionTag.getAttribute('content') || '';
      }
      
      // Extraer encabezados H1 y H2 para entender la estructura
      const headings = [];
      document.querySelectorAll('h1, h2').forEach(heading => {
        const text = heading.textContent.trim();
        if (text) {
          // Verificar si este encabezado corresponde a una sección ignorada
          const shouldIgnore = config.ignoredSections && config.ignoredSections.some(section => 
            text.toLowerCase().includes(section.toLowerCase())
          );
          
          if (!shouldIgnore) {
            headings.push(`${heading.tagName}: ${text}`);
          }
        }
      });
      
      // Extraer contenido principal
      let mainContent = '';
      
      // Lista de selectores para contenido principal, ordenados por especificidad
      const mainSelectors = [
        // Selectores comunes de contenido principal
        'main', 'article', '[role="main"]', '.main-content', '#main-content', 
        // Selectores específicos de gestores de contenido
        '.post-content', '.entry-content', '.article-content', '.page-content',
        // Selectores más generales
        '.content', '#content'
      ];
      
      // Intentar obtener el contenido principal con selectores comunes
      for (const selector of mainSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          // Si hay múltiples elementos, concatenarlos (pero evitar duplicados)
          const contents = [];
          elements.forEach(el => {
            // Hacer una copia para no modificar el DOM real
            const clone = el.cloneNode(true);
            
            // Eliminar elementos no deseados dentro del contenido principal
            const unwanted = clone.querySelectorAll('script, style, iframe, nav, aside, .comment, .comments, .sidebar, .widget, .ad, .ads, .advertisement');
            unwanted.forEach(unwantedEl => unwantedEl.remove());
            
            // Eliminar secciones ignoradas
            if (config.ignoredSections && config.ignoredSections.length > 0) {
              config.ignoredSections.forEach(section => {
                if (section && section.trim()) {
                  // Buscar secciones por encabezados que contienen el texto
                  clone.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
                    if (heading.textContent.toLowerCase().includes(section.toLowerCase())) {
                      // Encontrar el contenedor de la sección (hermanos hasta el siguiente encabezado del mismo nivel o superior)
                      let currentElement = heading;
                      const headingLevel = parseInt(heading.tagName.substring(1));
                      
                      // Eliminar el encabezado mismo
                      heading.parentNode?.removeChild(heading);
                      
                      // Eliminar elementos hasta el siguiente encabezado del mismo nivel o superior
                      while (currentElement.nextElementSibling) {
                        const nextElement = currentElement.nextElementSibling;
                        const tagName = nextElement.tagName.toLowerCase();
                        
                        // Si encontramos un encabezado del mismo nivel o superior, detenemos la eliminación
                        if (tagName.startsWith('h') && parseInt(tagName.substring(1)) <= headingLevel) {
                          break;
                        }
                        
                        nextElement.parentNode?.removeChild(nextElement);
                      }
                    }
                  });
                  
                  // También buscar por contenedores que pueden tener un ID o clase que coincida con la sección
                  clone.querySelectorAll(`[id*="${section}"], [class*="${section}"], section, div, article`).forEach(element => {
                    // Verificar si el elemento o alguno de sus padres contiene el texto de la sección
                    const elementText = element.textContent.toLowerCase();
                    if (elementText.includes(section.toLowerCase())) {
                      element.parentNode?.removeChild(element);
                    }
                  });
                }
              });
            }
            
            contents.push(clone.textContent.trim());
          });
          
          // Unir contenidos y eliminar duplicados
          mainContent = Array.from(new Set(contents)).join('\n\n');
          break;
        }
      }
      
      // Si no se encontró contenido con selectores comunes, extraer del body de forma selectiva
      if (!mainContent) {
        // Crear una copia del body para manipular
        const bodyClone = document.body.cloneNode(true);
        
        // Eliminar todos los elementos no deseados
        const elementsToRemove = bodyClone.querySelectorAll(
          'script, style, link, meta, noscript, iframe, ' + 
          'nav, footer, header, aside, ' + 
          '[role="banner"], [role="navigation"], [role="complementary"], [role="contentinfo"], ' +
          '.sidebar, #sidebar, .footer, #footer, .header, #header, ' + 
          '.navigation, #navigation, .menu, #menu, ' +
          '.comment, .comments, #comments, ' +
          '.widget, .widgets, ' +
          '.ad, .ads, .advertisement, [class*="cookie"], [id*="cookie"], ' +
          '.social, .share, .newsletter'
        );
        
        elementsToRemove.forEach(el => el.remove());
        
        // Eliminar secciones ignoradas del body
        if (config.ignoredSections && config.ignoredSections.length > 0) {
          config.ignoredSections.forEach(section => {
            if (section && section.trim()) {
              // Buscar todas las secciones que contienen el texto en encabezados
              bodyClone.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
                if (heading.textContent.toLowerCase().includes(section.toLowerCase())) {
                  heading.parentNode?.removeChild(heading);
                }
              });
              
              // Buscar contenedores que puedan contener la sección
              bodyClone.querySelectorAll(`[id*="${section}"], [class*="${section}"], section, div, article`).forEach(element => {
                const elementText = element.textContent.toLowerCase();
                if (elementText.includes(section.toLowerCase())) {
                  element.parentNode?.removeChild(element);
                }
              });
            }
          });
        }
        
        // Obtener párrafos significativos (con suficiente texto)
        const paragraphs = [];
        bodyClone.querySelectorAll('p').forEach(p => {
          const text = p.textContent.trim();
          
          // Verificar que este párrafo no pertenezca a una sección ignorada
          const shouldIgnore = config.ignoredSections && config.ignoredSections.some(section => 
            text.toLowerCase().includes(section.toLowerCase())
          );
          
          // Solo incluir párrafos con al menos 100 caracteres y que no estén en secciones ignoradas
          if (text.length > 100 && !shouldIgnore) {
            paragraphs.push(text);
          }
        });
        
        if (paragraphs.length > 0) {
          // Si hay párrafos significativos, usarlos como contenido
          mainContent = paragraphs.join('\n\n');
        } else {
          // En último caso, usar todo el texto del body limpio
          mainContent = bodyClone.textContent.trim();
        }
      }
      
      // Limpiar el texto (eliminar espacios extras, líneas vacías, etc.)
      mainContent = mainContent
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
      
      // Limitar el tamaño para evitar problemas con peticiones demasiado grandes
      // (limitar a ~8000 caracteres)
      if (mainContent.length > 8000) {
        mainContent = mainContent.substring(0, 8000) + '... [contenido truncado]';
      }
      
      // Guardar el contenido estructurado
      currentPageContent = `
Título: ${pageTitle}
URL: ${window.location.href}
${metaDescription ? `Descripción: ${metaDescription}\n` : ''}
${headings.length > 0 ? `Estructura de la página:\n${headings.join('\n')}\n\n` : ''}
Contenido principal:
${mainContent}
      `.trim();
      
      siteContentScanned = true;
      console.log('AIPI: Contenido de la página escaneado con éxito');
      // Para depuración, descomentar la siguiente línea:
      // console.log('Contenido escaneado:', currentPageContent);
    } catch (error) {
      console.error('Error escaneando contenido de la página:', error);
      
      // En caso de error, intentar una versión simplificada
      try {
        pageTitle = document.title || '';
        currentPageContent = `
Título: ${pageTitle}
URL: ${window.location.href}
Contenido: [Error al extraer contenido detallado]
        `.trim();
        siteContentScanned = true;
      } catch (fallbackError) {
        console.error('Error completo al escanear contenido:', fallbackError);
        siteContentScanned = false;
      }
    }
  }
  
  // Load custom font
  function loadFont() {
    if (document.getElementById('aipi-font')) {
      fontLoaded = true;
      return;
    }
    
    const fontLink = document.createElement('link');
    fontLink.id = 'aipi-font';
    fontLink.rel = 'stylesheet';
    fontLink.href = config.fontURL;
    fontLink.onload = () => {
      fontLoaded = true;
    };
    
    document.head.appendChild(fontLink);
  }
  
  // Create widget DOM structure
  function createWidgetDOM() {
    // Main container with position based on config
    widgetInstance = document.createElement('div');
    widgetInstance.id = 'aipi-widget-container';
    widgetInstance.style.position = 'fixed';
    widgetInstance.style.zIndex = '999999';
    widgetInstance.style.fontFamily = getFontFamily();
    
    // Agregar clase según el tipo de widget
    if (config.widgetType === 'fullscreen') {
      widgetInstance.classList.add('aipi-fullscreen-widget');
      
      // Crear botón de acceso flotante para modo pantalla completa y añadirlo directamente al body
      const fullscreenButton = document.createElement('div');
      fullscreenButton.id = 'aipi-fullscreen-button';
      fullscreenButton.innerHTML = `
        <div class="aipi-fullscreen-button-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        </div>
        <div class="aipi-fullscreen-button-text">AIPI Assistant</div>
      `;
      
      // No añadir el botón dentro del widget, sino directamente al body para que sea independiente
      document.body.appendChild(fullscreenButton);
      
      // Usar onclick en lugar de addEventListener
      fullscreenButton.onclick = function() {
        try {
          console.log('AIPI Debug: Botón fullscreen clickeado');
          
          // Obtener el panel de chat directamente
          const chatPanel = document.getElementById('aipi-chat-panel');
          console.log('AIPI Debug: Panel de chat encontrado?', !!chatPanel);
          
          if (chatPanel) {
            // Ocultar el botón flotante
            this.style.display = 'none';
            console.log('AIPI Debug: Botón flotante ocultado');
            
            // Mostrar el panel de chat
            chatPanel.style.display = 'flex';
            console.log('AIPI Debug: Panel de chat mostrado');
            isOpen = true;
            
            // Iniciar conversación si no se ha iniciado
            if (!conversationStarted) {
              console.log('AIPI Debug: Iniciando conversación');
              startConversation();
            }
            
            // Enfocar el campo de entrada
            setTimeout(() => {
              const input = document.getElementById('aipi-input');
              console.log('AIPI Debug: Input encontrado?', !!input);
              if (input) {
                input.focus();
              }
            }, 300);
            
            // Desplazar al final de los mensajes
            scrollToBottom();
          } else {
            console.error('Error AIPI: No se encontró el panel de chat. ID widget:', widgetInstance?.id);
            alert('Error al abrir el chat: No se encontró el panel en el DOM');
          }
        } catch (error) {
          console.error('Error AIPI al abrir el widget:', error);
          alert('Error al abrir el chat: ' + error.message);
        }
      };
    } else {
      widgetInstance.classList.add('aipi-bubble-widget');
    }
    
    // Set position based on config
    setWidgetPosition();
    
    // Create CSS for widget
    const widgetStyles = document.createElement('style');
    widgetStyles.textContent = `
      #aipi-widget-container * {
        box-sizing: border-box;
      }
      
      #aipi-chat-panel {
        width: 350px;
        height: 500px;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        margin-bottom: 16px;
        transition: all 0.3s ease;
        font-family: ${getFontFamily()};
      }

      .aipi-fullscreen-widget #aipi-chat-panel {
        width: 100%;
        height: 100%;
        margin-bottom: 0;
        border-radius: 0;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }

      .aipi-fullscreen-widget #aipi-toggle-button {
        display: none;
      }
      
      #aipi-chat-header {
        background-color: ${config.themeColor};
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      #aipi-header-info {
        display: flex;
        align-items: center;
      }
      
      #aipi-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
      }
      
      #aipi-avatar svg {
        width: 20px;
        height: 20px;
        color: ${config.themeColor};
      }
      
      #aipi-header-text {
        display: flex;
        flex-direction: column;
      }
      
      #aipi-assistant-name {
        font-weight: 600;
        font-size: 16px;
      }
      
      #aipi-status {
        font-size: 12px;
        opacity: 0.8;
      }
      
      #aipi-header-actions {
        display: flex;
      }
      
      .aipi-header-button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        margin-left: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s;
      }
      
      .aipi-header-button:hover {
        opacity: 1;
      }
      
      #aipi-messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background-color: #f9fafb;
      }
      
      @media (prefers-color-scheme: dark) {
        #aipi-chat-panel {
          background-color: #1f2937;
          border: 1px solid #374151;
        }
        
        #aipi-messages-container {
          background-color: #111827;
        }
      }
      
      .aipi-message {
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
      }
      
      .aipi-user-message {
        background-color: ${config.userBubbleColor};
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }
      
      .aipi-assistant-message {
        background-color: ${config.assistantBubbleColor};
        color: #1f2937;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      
      @media (prefers-color-scheme: dark) {
        .aipi-assistant-message {
          background-color: #374151;
          color: #e5e7eb;
        }
      }
      
      .aipi-typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 10px 14px;
        background-color: ${config.assistantBubbleColor};
        border-radius: 18px;
        border-bottom-left-radius: 4px;
        align-self: flex-start;
        max-width: 80px;
      }
      
      @media (prefers-color-scheme: dark) {
        .aipi-typing-indicator {
          background-color: #374151;
        }
      }
      
      .aipi-typing-dot {
        width: 8px;
        height: 8px;
        background-color: #6b7280;
        border-radius: 50%;
        animation: aipi-typing-animation 1.4s infinite ease-in-out;
      }
      
      .aipi-typing-dot:nth-child(1) {
        animation-delay: 0s;
      }
      
      .aipi-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .aipi-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes aipi-typing-animation {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }
      
      #aipi-input-container {
        display: flex;
        padding: 12px;
        border-top: 1px solid #e5e7eb;
        background-color: #fff;
      }
      
      @media (prefers-color-scheme: dark) {
        #aipi-input-container {
          background-color: #1f2937;
          border-top: 1px solid #374151;
        }
      }
      
      #aipi-input {
        flex: 1;
        border: 1px solid #d1d5db;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        outline: none;
        background-color: #fff;
        color: #1f2937;
      }
      
      @media (prefers-color-scheme: dark) {
        #aipi-input {
          background-color: #374151;
          border-color: #4b5563;
          color: #e5e7eb;
        }
      }
      
      #aipi-input:focus {
        border-color: ${config.themeColor};
        box-shadow: 0 0 0 1px ${config.themeColor}20;
      }
      
      #aipi-send-button {
        background-color: ${config.themeColor};
        border: none;
        border-radius: 50%;
        color: white;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-left: 8px;
        transition: background-color 0.2s;
      }
      
      #aipi-send-button:hover {
        background-color: ${adjustColor(config.themeColor, -20)};
      }
      
      #aipi-send-button:disabled {
        background-color: #9ca3af;
        cursor: not-allowed;
      }
      
      #aipi-minimized-container {
        background-color: ${config.themeColor};
        padding: 12px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        color: white;
        cursor: pointer;
        transition: transform 0.2s;
      }
      
      #aipi-minimized-container:hover {
        transform: translateY(-2px);
      }
      
      #aipi-minimized-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
      }
      
      #aipi-minimized-avatar svg {
        width: 20px;
        height: 20px;
        color: ${config.themeColor};
      }
      
      #aipi-toggle-button {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background-color: ${config.themeColor};
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.3s, background-color 0.3s;
        border: none;
        color: white;
      }
      
      #aipi-toggle-button:hover {
        transform: scale(1.05);
        background-color: ${adjustColor(config.themeColor, -20)};
      }
      
      /* Estilos para el botón de acceso en modo pantalla completa */
      #aipi-fullscreen-button {
        display: flex;
        align-items: center;
        padding: 10px 16px;
        background-color: ${config.themeColor};
        color: white;
        border-radius: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        font-family: ${getFontFamily()};
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      #aipi-fullscreen-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      
      .aipi-fullscreen-button-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
      }
      
      .aipi-fullscreen-button-icon svg {
        width: 20px;
        height: 20px;
        color: white;
      }
      
      .aipi-fullscreen-button-text {
        font-weight: 600;
        font-size: 14px;
      }
      
      /* Estilos para el botón flotante del modo pantalla completa */
      #aipi-fullscreen-button {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background-color: ${config.themeColor};
        color: white;
        display: flex;
        align-items: center;
        padding: 12px 20px;
        border-radius: 50px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        z-index: 999999;
        transition: all 0.3s ease;
      }
      
      #aipi-fullscreen-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
      }
      
      .aipi-fullscreen-button-icon {
        margin-right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
    document.head.appendChild(widgetStyles);
    
    // Create markup
    widgetInstance.innerHTML = `
      <div id="aipi-chat-panel" style="display: none;">
        <div id="aipi-chat-header">
          <div id="aipi-header-info">
            <div id="aipi-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <div id="aipi-header-text">
              <span id="aipi-assistant-name">${escapeHTML(config.assistantName)}</span>
              ${config.showAvailability ? '<span id="aipi-status">Online</span>' : ''}
            </div>
          </div>
          <div id="aipi-header-actions">
            <button class="aipi-header-button" id="aipi-minimize-button" aria-label="Minimize">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button class="aipi-header-button" id="aipi-close-button" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div id="aipi-messages-container"></div>
        <div id="aipi-input-container">
          <input type="text" id="aipi-input" placeholder="Type your message...">
          <button id="aipi-send-button" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
      
      <div id="aipi-minimized-container" style="display: none;">
        <div id="aipi-minimized-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <span>${escapeHTML(config.assistantName)}</span>
      </div>
      
      <button id="aipi-toggle-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    `;
    
    document.body.appendChild(widgetInstance);
  }
  
  // Set widget position based on config
  function setWidgetPosition() {
    // Para widgets tipo fullscreen, el posicionamiento es diferente
    if (config.widgetType === 'fullscreen') {
      widgetInstance.style.left = '0';
      widgetInstance.style.top = '0';
      widgetInstance.style.right = '0';
      widgetInstance.style.bottom = '0';
      widgetInstance.style.width = '100%';
      widgetInstance.style.height = '100%';
      widgetInstance.style.maxWidth = 'none';
      return;
    }
    
    // Para widgets tipo bubble (tipo original)
    switch (config.position) {
      case 'bottom-left':
        widgetInstance.style.bottom = '24px';
        widgetInstance.style.left = '24px';
        widgetInstance.style.right = 'auto';
        widgetInstance.style.top = 'auto';
        break;
      case 'top-right':
        widgetInstance.style.top = '24px';
        widgetInstance.style.right = '24px';
        widgetInstance.style.left = 'auto';
        widgetInstance.style.bottom = 'auto';
        break;
      case 'top-left':
        widgetInstance.style.top = '24px';
        widgetInstance.style.left = '24px';
        widgetInstance.style.right = 'auto';
        widgetInstance.style.bottom = 'auto';
        break;
      case 'bottom-right':
      default:
        widgetInstance.style.bottom = '24px';
        widgetInstance.style.right = '24px';
        widgetInstance.style.left = 'auto';
        widgetInstance.style.top = 'auto';
        break;
    }
  }
  
  // Attach event listeners
  function attachEventListeners() {
    const toggleButton = document.getElementById('aipi-toggle-button');
    const minimizeButton = document.getElementById('aipi-minimize-button');
    const closeButton = document.getElementById('aipi-close-button');
    const chatInput = document.getElementById('aipi-input');
    const sendButton = document.getElementById('aipi-send-button');
    const minimizedContainer = document.getElementById('aipi-minimized-container');
    
    // Toggle widget open/close
    toggleButton.addEventListener('click', () => {
      if (isOpen) {
        closeWidget();
      } else {
        openWidget();
      }
    });
    
    // Close widget
    closeButton.addEventListener('click', closeWidget);
    
    // Minimize widget
    minimizeButton.addEventListener('click', minimizeWidget);
    
    // Maximize from minimized state
    minimizedContainer.addEventListener('click', maximizeWidget);
    
    // Handle input changes
    chatInput.addEventListener('input', () => {
      sendButton.disabled = !chatInput.value.trim();
    });
    
    // Send message on Enter key
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && chatInput.value.trim()) {
        sendMessage();
      }
    });
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
  }
  
  // Start or continue conversation with AIPI
  async function startConversation() {
    if (!conversationStarted) {
      // Create a new conversation
      try {
        const response = await fetch(`${config.serverUrl}/api/widget/${config.apiKey}/conversation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visitorId: config.visitorId
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create conversation');
        }
        
        const data = await response.json();
        config.conversationId = data.id;
        conversationStarted = true;
        
        // Add initial greeting
        addMessage(config.greetingMessage, 'assistant');
      } catch (error) {
        console.error('Error starting conversation:', error);
        addMessage('Sorry, I encountered an error. Please try again later.', 'assistant');
      }
    }
  }
  
  // Open the widget
  function openWidget() {
    const chatPanel = document.getElementById('aipi-chat-panel');
    const toggleButton = document.getElementById('aipi-toggle-button');
    const fullscreenButton = document.getElementById('aipi-fullscreen-button');
    
    // Para widgets tipo fullscreen, abrir siempre directamente
    if (config.widgetType === 'fullscreen') {
      // Ocultar botón flotante cuando el chat está abierto
      if (fullscreenButton) {
        fullscreenButton.style.display = 'none';
      }
      
      chatPanel.style.display = 'flex';
      isOpen = true;
      
      // Start conversation if not already started
      if (!conversationStarted) {
        startConversation();
      }
      
      // Focus input
      setTimeout(() => {
        document.getElementById('aipi-input').focus();
      }, 300);
      
      // Scroll to bottom of messages
      scrollToBottom();
      return;
    }
    
    // Para widgets tipo bubble (comportamiento original)
    // Update toggle button icon
    toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    
    if (isMinimized) {
      maximizeWidget();
      return;
    }
    
    chatPanel.style.display = 'flex';
    isOpen = true;
    
    // Focus input
    setTimeout(() => {
      document.getElementById('aipi-input').focus();
    }, 300);
    
    // Start conversation if not already started
    if (!conversationStarted) {
      startConversation();
    }
    
    // Scroll to bottom of messages
    scrollToBottom();
  }
  
  // Close the widget
  function closeWidget() {
    const chatPanel = document.getElementById('aipi-chat-panel');
    const minimizedContainer = document.getElementById('aipi-minimized-container');
    const toggleButton = document.getElementById('aipi-toggle-button');
    const fullscreenButton = document.getElementById('aipi-fullscreen-button');
    
    // Para widgets tipo fullscreen, no permitir cerrar completamente
    if (config.widgetType === 'fullscreen') {
      // Mostrar el botón flotante nuevamente
      if (fullscreenButton) {
        fullscreenButton.style.display = 'flex';
      }
      
      chatPanel.style.display = 'none';
      isOpen = false;
      return;
    }
    
    // Para widgets tipo bubble (comportamiento original)
    // Update toggle button icon
    toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    `;
    
    chatPanel.style.display = 'none';
    minimizedContainer.style.display = 'none';
    isOpen = false;
    isMinimized = false;
  }
  
  // Minimize the widget
  function minimizeWidget() {
    const chatPanel = document.getElementById('aipi-chat-panel');
    const minimizedContainer = document.getElementById('aipi-minimized-container');
    
    // Para el widget tipo fullscreen, minimizar significa hacerlo más pequeño pero no ocultarlo
    if (config.widgetType === 'fullscreen') {
      // Si es fullscreen, cambiamos el estilo a bubble temporalmente
      chatPanel.style.width = '350px';
      chatPanel.style.height = '500px';
      chatPanel.style.position = 'fixed';
      chatPanel.style.bottom = '24px';
      chatPanel.style.right = '24px';
      chatPanel.style.left = 'auto';
      chatPanel.style.top = 'auto';
      chatPanel.style.borderRadius = '10px';
      isMinimized = true;
      return;
    }
    
    // Para widgets tipo bubble (comportamiento original)
    chatPanel.style.display = 'none';
    minimizedContainer.style.display = 'flex';
    isMinimized = true;
  }
  
  // Maximize the widget from minimized state
  function maximizeWidget() {
    const chatPanel = document.getElementById('aipi-chat-panel');
    const minimizedContainer = document.getElementById('aipi-minimized-container');
    
    // Para el widget tipo fullscreen, maximizar significa restaurar su tamaño completo
    if (config.widgetType === 'fullscreen') {
      // Restaurar el estilo fullscreen
      chatPanel.style.width = '100%';
      chatPanel.style.height = '100%';
      chatPanel.style.position = 'fixed';
      chatPanel.style.top = '0';
      chatPanel.style.left = '0';
      chatPanel.style.right = '0';
      chatPanel.style.bottom = '0';
      chatPanel.style.borderRadius = '0';
      isMinimized = false;
      
      // Focus input
      setTimeout(() => {
        document.getElementById('aipi-input').focus();
      }, 300);
      
      // Scroll to bottom of messages
      scrollToBottom();
      return;
    }
    
    // Para widgets tipo bubble (comportamiento original)
    minimizedContainer.style.display = 'none';
    chatPanel.style.display = 'flex';
    isMinimized = false;
    
    // Focus input
    setTimeout(() => {
      document.getElementById('aipi-input').focus();
    }, 300);
    
    // Scroll to bottom of messages
    scrollToBottom();
  }
  
  // Send a message
  async function sendMessage() {
    const chatInput = document.getElementById('aipi-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Clear input
    chatInput.value = '';
    document.getElementById('aipi-send-button').disabled = true;
    
    // Start conversation if not already started
    if (!conversationStarted) {
      await startConversation();
    }
    
    // Add user message to UI
    addMessage(message, 'user');
    
    // Show typing indicator
    showTypingIndicator(true);
    
    // Asegurarnos de que tenemos el contenido de la página si no lo hemos escaneado aún
    if (!siteContentScanned) {
      scanCurrentPageContent();
    }
    
    try {
      // Mensaje de debug para verificar el envío de información contextual
      console.log("Enviando mensaje con contexto de página:", {
        url: window.location.href,
        title: pageTitle,
        contentLength: currentPageContent ? currentPageContent.length : 0
      });
      
      // Send message to server
      const response = await fetch(`${config.serverUrl}/api/widget/${config.apiKey}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: config.conversationId,
          content: message,
          role: 'user',
          language: navigator.language.split('-')[0], // Enviar código de idioma (fr, en, es, etc.)
          pageContext: {
            title: pageTitle || document.title,
            url: window.location.href,
            content: currentPageContent
          }
        }),
      });
      
      // Hide typing indicator
      showTypingIndicator(false);
      
      if (!response.ok) {
        // Show friendly error message in chat based on browser language
        const userLang = navigator.language.split('-')[0];
        
        if (response.status === 500) {
          // Error messages based on language
          if (userLang === 'fr') {
            addMessage("Désolé, il y a un problème temporaire avec le service. Veuillez réessayer plus tard ou contacter le support si le problème persiste.", 'assistant');
          } else if (userLang === 'en') {
            addMessage("Sorry, there is a temporary problem with the service. Please try again later or contact support if the problem persists.", 'assistant');
          } else {
            // Default to Spanish
            addMessage("Lo siento, hay un problema temporal con el servicio. Por favor, intenta de nuevo más tarde o contacta con soporte si el problema persiste.", 'assistant');
          }
        } else {
          // General error messages
          if (userLang === 'fr') {
            addMessage("Désolé, je n'ai pas pu traiter votre message. Veuillez réessayer.", 'assistant');
          } else if (userLang === 'en') {
            addMessage("Sorry, I couldn't process your message. Please try again.", 'assistant');
          } else {
            // Default to Spanish
            addMessage("Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo.", 'assistant');
          }
        }
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add AI response to UI
      if (data.aiMessage) {
        addMessage(data.aiMessage.content, 'assistant');
      } else {
        // Show message based on user language
        const userLang = navigator.language.split('-')[0];
        
        if (userLang === 'fr') {
          addMessage("J'ai reçu votre message, mais je n'ai pas pu générer une réponse pour le moment.", 'assistant');
        } else if (userLang === 'en') {
          addMessage("I received your message, but I couldn't generate a response at this time.", 'assistant');
        } else {
          // Default to Spanish
          addMessage("Recibí tu mensaje, pero no pude generar una respuesta en este momento.", 'assistant');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Hide typing indicator if still showing
      showTypingIndicator(false);
      
      // Only add error message if one hasn't been added already
      if (!document.querySelector('.aipi-assistant-message:last-child')) {
        // Add connection error message based on language
        const userLang = navigator.language.split('-')[0];
        
        if (userLang === 'fr') {
          addMessage("Désolé, il y a un problème de connexion. Veuillez vérifier votre connexion Internet et réessayer.", 'assistant');
        } else if (userLang === 'en') {
          addMessage("Sorry, there is a connection problem. Please check your internet connection and try again.", 'assistant');
        } else {
          // Default to Spanish
          addMessage("Lo siento, hay un problema de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.", 'assistant');
        }
      }
    }
  }
  
  // Add message to UI
  function addMessage(content, role) {
    const messagesContainer = document.getElementById('aipi-messages-container');
    const messageElement = document.createElement('div');
    
    messageElement.className = `aipi-message ${role === 'user' ? 'aipi-user-message' : 'aipi-assistant-message'}`;
    messageElement.textContent = content;
    
    messagesContainer.appendChild(messageElement);
    
    // Store message
    messages.push({ role, content });
    
    // Scroll to bottom
    scrollToBottom();
  }
  
  // Show or hide typing indicator
  function showTypingIndicator(show) {
    const messagesContainer = document.getElementById('aipi-messages-container');
    const existingIndicator = document.querySelector('.aipi-typing-indicator');
    
    // Remove existing indicator if any
    if (existingIndicator) {
      messagesContainer.removeChild(existingIndicator);
    }
    
    if (show) {
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'aipi-typing-indicator';
      typingIndicator.innerHTML = `
        <div class="aipi-typing-dot"></div>
        <div class="aipi-typing-dot"></div>
        <div class="aipi-typing-dot"></div>
      `;
      
      messagesContainer.appendChild(typingIndicator);
      scrollToBottom();
    }
  }
  
  // Scroll to bottom of messages container
  function scrollToBottom() {
    const messagesContainer = document.getElementById('aipi-messages-container');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Helper function to get font family based on config
  function getFontFamily() {
    switch (config.font) {
      case 'roboto':
        return "'Roboto', sans-serif";
      case 'opensans':
        return "'Open Sans', sans-serif";
      case 'lato':
        return "'Lato', sans-serif";
      case 'poppins':
        return "'Poppins', sans-serif";
      case 'inter':
      default:
        return "'Inter', sans-serif";
    }
  }
  
  // Helper function to adjust color brightness
  function adjustColor(color, amount) {
    // Convert hex to RGB
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    
    // Adjust brightness
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  // Helper function to escape HTML
  function escapeHTML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  // Initialize the widget when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
