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
  let currentTextIndex = 0;
  let textRotationInterval = null;

  // Initialize widget
  function init() {
    // Verificar si el widget ya existe para evitar duplicados
    if (document.getElementById('aipi-widget-container') || window.AIPPS_WIDGET_INITIALIZED) {
      console.log('AIPPS Widget: Ya inicializado, evitando duplicación');
      return;
    }
    window.AIPPS_WIDGET_INITIALIZED = true;

    // Extract the API key from script tag using a more reliable method
    let scriptSrc = '';
    let foundApiKey = '';

    // Find the embed.js script specifically
    const scripts = document.querySelectorAll('script');
    for (let script of scripts) {
      if (script.src && script.src.includes('embed.js')) {
        scriptSrc = script.src;
        break;
      }
    }

    // If not found by embed.js, try to find by key parameter
    if (!scriptSrc) {
      for (let script of scripts) {
        if (script.src && script.src.includes('key=')) {
          scriptSrc = script.src;
          break;
        }
      }
    }

    // Extract API key from the found script
    if (scriptSrc) {
      // Try multiple methods to extract the key
      const keyMatch = scriptSrc.match(/[?&]key=([^&]+)/);
      if (keyMatch && keyMatch[1]) {
        foundApiKey = keyMatch[1];
      }
    }

    config.apiKey = foundApiKey;

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

    // Debug: Log what we found
    console.log('AIPPS Widget Debug:', {
      scriptSrc: scriptSrc,
      apiKey: config.apiKey,
      serverUrl: config.serverUrl
    });

    // Load widget configuration from server
    loadWidgetConfig().then(() => {
      // Load fonts
      loadFont();

      // Create widget DOM elements AFTER loading config
      createWidgetDOM();

      // Update button text with integration name
      updateButtonText();

      // Attach event listeners
      attachEventListeners();

      // Auto-open widget if configured
      if (config.autoOpen) {
        setTimeout(() => {
          openWidget();
        }, config.autoOpenDelay);
      }

      // Start periodic config refresh to detect changes
      startConfigRefresh();
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
        config.integrationName = data.integration.name || config.assistantName; // Nombre específico de la integración
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

  // Function to periodically check for config updates
  function startConfigRefresh() {
    setInterval(async () => {
      try {
        const response = await fetch(`${config.serverUrl}/api/widget/${config.apiKey}`);
        if (response.ok) {
          const data = await response.json();
          
          // Check if position has changed
          const newPosition = data.integration?.position || 'bottom-right';
          const newThemeColor = data.integration?.themeColor || config.themeColor;
          
          console.log('AIPPS Widget: Checking position - Current:', config.position, 'New:', newPosition);
          
          if (newPosition !== config.position) {
            console.log('AIPPS Widget: Position changed from', config.position, 'to', newPosition);
            config.position = newPosition;
            
            // Update widget position
            if (widgetInstance) {
              setWidgetPosition();
              console.log('AIPPS Widget: Position updated to', newPosition);
            }
          } else {
            console.log('AIPPS Widget: No position change detected');
          }
          
          if (newThemeColor !== config.themeColor) {
            console.log('AIPPS Widget: Theme color changed from', config.themeColor, 'to', newThemeColor);
            config.themeColor = newThemeColor;
            
            // Update theme color if changed
            if (widgetInstance) {
              const toggleButton = widgetInstance.querySelector('#aipi-toggle-button');
              if (toggleButton) {
                toggleButton.style.backgroundColor = config.themeColor;
              }
              
              // Update other elements with theme color
              const chatContainer = widgetInstance.querySelector('#aipi-chat-container');
              if (chatContainer) {
                const header = chatContainer.querySelector('#aipi-header');
                if (header) {
                  header.style.backgroundColor = config.themeColor;
                }
              }
            }
          }
        }
      } catch (error) {
        console.debug('Config refresh failed:', error);
      }
    }, 5000); // Check every 5 seconds (reduced frequency)
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
    // Create an isolated root container that bypasses all CSS inheritance
    const isolatedRoot = document.createElement('div');
    isolatedRoot.style.cssText = `
      all: initial !important;
      position: fixed !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      width: 0 !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      background: none !important;
      overflow: visible !important;
      clip: auto !important;
      clip-path: none !important;
      contain: none !important;
      isolation: isolate !important;
    `;
    
    // Main container with position based on config
    widgetInstance = document.createElement('div');
    widgetInstance.id = 'aipi-widget-container';
    widgetInstance.style.cssText = `
      all: initial !important;
      position: fixed !important;
      z-index: 2147483647 !important;
      font-family: ${getFontFamily()} !important;
      pointer-events: none !important;
      overflow: visible !important;
      width: auto !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      background: none !important;
      clip: auto !important;
      clip-path: none !important;
    `;

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

        #aipi-widget-container {
          max-height: calc(100vh - 40px);
          max-width: calc(100vw - 40px);
        }

      /* Ensure parent containers allow scroll */
      html, body {
        overflow: auto !important;
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
        height: 300px !important;
        overflow-y: scroll !important;
        overflow-x: hidden !important;
        padding: 16px;
        background-color: #f9fafb;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      
      #aipi-messages-container::-webkit-scrollbar {
        width: 8px;
      }
      
      #aipi-messages-container::-webkit-scrollbar-track {
        background: #f0f0f0;
        border-radius: 4px;
      }
      
      #aipi-messages-container::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      
      #aipi-messages-container::-webkit-scrollbar-thumb:hover {
        background: #555;
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
        margin-bottom: 12px;
        display: block;
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
        all: initial !important;
        min-width: 160px !important;
        width: auto !important;
        height: 36px !important;
        border-radius: 18px !important;
        background-color: #ff7b2a !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        border: none !important;
        outline: none !important;
        color: white !important;
        z-index: 2147483647 !important;
        position: fixed !important;
        padding: 0 16px !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        white-space: nowrap !important;
        overflow: visible !important;
        margin: 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        box-sizing: border-box !important;
        isolation: isolate !important;
        contain: none !important;
        clip: auto !important;
        clip-path: none !important;
        transform: none !important;
        right: 20px !important;
        bottom: 20px !important;
        left: auto !important;
        top: auto !important;
        max-width: calc(100vw - 40px) !important;
      }

      #aipi-toggle-button:hover {
        transform: translateY(-3px) scale(1.05) !important;
        background-color: ${adjustColor(config.themeColor, -20)} !important;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25) !important;
        animation: none !important;
      }

      @keyframes aipi-pulse {
        0%, 100% {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        50% {
          box-shadow: 0 4px 20px ${config.themeColor}40, 0 0 0 8px ${config.themeColor}20;
        }
      }

      @keyframes aipi-bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-5px);
        }
      }

      .aipi-button-text {
        margin-left: 8px !important;
        opacity: 1 !important;
        max-width: none !important;
        color: white !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        display: inline !important;
        overflow: visible !important;
        white-space: nowrap !important;
      }

      .aipi-notification-dot {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 12px;
        height: 12px;
        background-color: #ef4444;
        border-radius: 50%;
        border: 2px solid white;
        animation: aipi-bounce 1s infinite;
      }

      /* Additional overrides for WordPress and other CMS compatibility */
      #aipi-widget-container {
        position: fixed !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        font-family: ${getFontFamily()} !important;
        overflow: visible !important;
        width: auto !important;
        height: auto !important;
        top: auto !important;
        left: auto !important;
        right: auto !important;
        bottom: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        background: none !important;
        clip: auto !important;
        clip-path: none !important;
      }
      
      #aipi-widget-container * {
        pointer-events: auto !important;
        box-sizing: border-box !important;
      }
      
      #aipi-toggle-button {
        isolation: isolate !important;
        will-change: transform !important;
        backface-visibility: hidden !important;
        -webkit-backface-visibility: hidden !important;
        transform-style: preserve-3d !important;
        -webkit-transform-style: preserve-3d !important;
        contain: layout style !important;
        clip: auto !important;
        clip-path: none !important;
        overflow: visible !important;
      }
      
      /* Force all parent elements to not clip the widget */
      html, body {
        overflow-x: visible !important;
        overflow-y: visible !important;
      }
      
      /* Ensure no parent containers clip the button */
      #aipi-widget-container,
      #aipi-widget-container *,
      body *:has(#aipi-widget-container),
      body *:has(#aipi-toggle-button) {
        overflow: visible !important;
        clip: auto !important;
        clip-path: none !important;
      }
      
      /* Additional positioning safeguards with more spacing */
      @media screen and (max-width: 768px) {
        #aipi-toggle-button {
          max-width: calc(100vw - 40px) !important;
          right: 20px !important;
          bottom: 20px !important;
        }
      }
      
      @media screen and (min-width: 769px) {
        #aipi-toggle-button {
          max-width: calc(100vw - 60px) !important;
          right: 30px !important;
          bottom: 30px !important;
        }
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
        right: 16px;
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
        max-width: calc(100vw - 32px);
        overflow: visible;
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
              <span id="aipi-assistant-name">${escapeHTML(config.integrationName || config.assistantName)}</span>
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
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
        <span class="aipi-button-text">AIPI Assistant</span>
      </button>
    `;

    // Add widget to isolated root, then isolated root to body
    isolatedRoot.appendChild(widgetInstance);
    document.body.appendChild(isolatedRoot);
    
    // Ensure the button is properly configured after DOM insertion
    setTimeout(() => {
      const toggleButton = document.getElementById('aipi-toggle-button');
      if (toggleButton) {
        console.log('AIPPS Widget: Botón encontrado después de inserción DOM');
        // Force pointer events and positioning
        toggleButton.style.pointerEvents = 'auto';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.zIndex = '2147483647';
        toggleButton.style.position = 'fixed';
      } else {
        console.error('AIPPS Widget: Botón NO encontrado después de inserción DOM');
      }
    }, 100);
  }

  // Set widget position based on config
  function setWidgetPosition() {
    console.log('AIPPS Widget: Setting position to', config.position, 'for widget:', widgetInstance);
    
    if (!widgetInstance) {
      console.error('AIPPS Widget: Widget instance not found when trying to set position');
      return;
    }
    
    // CRITICAL FIX: Find the toggle button specifically and move it
    const toggleButton = widgetInstance.querySelector('#aipi-toggle-button');
    if (!toggleButton) {
      console.error('AIPPS Widget: Toggle button not found in widget instance');
      return;
    }
    
    console.log('AIPPS Widget: Found toggle button, applying position changes');
    
    // STEP 1: Clear ALL positioning styles from toggle button
    toggleButton.removeAttribute('style');
    
    // STEP 2: Calculate responsive offsets
    const isMobile = window.innerWidth < 768;
    const bottomOffset = isMobile ? '16px' : '20px';
    const sideOffset = isMobile ? '16px' : '20px';
    
    // STEP 3: Build complete new style attribute
    let newStyles = `
      all: initial !important;
      min-width: 160px !important;
      width: auto !important;
      height: 36px !important;
      border-radius: 18px !important;
      background-color: ${config.themeColor} !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: all 0.3s ease !important;
      border: none !important;
      outline: none !important;
      color: white !important;
      z-index: 2147483647 !important;
      position: fixed !important;
      padding: 0 16px !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      white-space: nowrap !important;
      overflow: visible !important;
      margin: 0 !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      box-sizing: border-box !important;
      isolation: isolate !important;
    `;
    
    // STEP 4: Add position-specific styles
    switch (config.position) {
      case 'bottom-left':
        newStyles += ` bottom: ${bottomOffset} !important; left: ${sideOffset} !important; right: auto !important; top: auto !important;`;
        console.log('AIPPS Widget: Applied bottom-left positioning to toggle button');
        break;
      case 'bottom-center':
        newStyles += ` bottom: ${bottomOffset} !important; left: 50% !important; right: auto !important; top: auto !important; transform: translateX(-50%) !important;`;
        console.log('AIPPS Widget: Applied bottom-center positioning to toggle button');
        break;
      case 'top-right':
        newStyles += ` top: 20px !important; right: ${sideOffset} !important; left: auto !important; bottom: auto !important;`;
        console.log('AIPPS Widget: Applied top-right positioning to toggle button');
        break;
      case 'top-left':
        newStyles += ` top: 20px !important; left: ${sideOffset} !important; right: auto !important; bottom: auto !important;`;
        console.log('AIPPS Widget: Applied top-left positioning to toggle button');
        break;
      case 'bottom-right':
      default:
        newStyles += ` bottom: ${bottomOffset} !important; right: ${sideOffset} !important; left: auto !important; top: auto !important;`;
        console.log('AIPPS Widget: Applied bottom-right positioning to toggle button');
        break;
    }
    
    // STEP 5: Apply the complete new styles
    toggleButton.setAttribute('style', newStyles);
    
    // STEP 6: Force repaint
    toggleButton.offsetHeight;
    
    console.log('AIPPS Widget: Toggle button repositioned successfully. Final styles:', {
      position: config.position,
      computedTop: window.getComputedStyle(toggleButton).top,
      computedBottom: window.getComputedStyle(toggleButton).bottom,
      computedLeft: window.getComputedStyle(toggleButton).left,
      computedRight: window.getComputedStyle(toggleButton).right,
      buttonElement: toggleButton
    });

    // Agregar listener para cambios de tamaño de ventana
    window.addEventListener('resize', () => {
      if (widgetInstance) {
        setWidgetPosition();
      }
    });
  }

  // Textos dinámicos para el botón
  const dynamicTexts = [
    "¡Hablemos!",
    "¿Necesitas ayuda?",
    "¡Pregúntame!",
    "Estoy aquí 👋",
    "¡Chatea conmigo!",
    "¿Alguna duda?",
    "¡Te ayudo!"
  ];

  // Función para rotar textos del botón
  function startTextRotation() {
    const buttonText = document.querySelector('.aipi-button-text');
    if (!buttonText) return;

    textRotationInterval = setInterval(() => {
      if (!isOpen) { // Solo rotar si el widget está cerrado
        currentTextIndex = (currentTextIndex + 1) % dynamicTexts.length;
        buttonText.textContent = dynamicTexts[currentTextIndex];

        // Agregar una pequeña animación al cambiar el texto
        buttonText.style.transform = 'scale(0.9)';
        setTimeout(() => {
          buttonText.style.transform = 'scale(1)';
        }, 150);
      }
    }, 3000); // Cambiar texto cada 3 segundos
  }

  // Attach event listeners
  function attachEventListeners() {
    // Wait for DOM to be ready, then find elements
    setTimeout(() => {
      const toggleButton = document.getElementById('aipi-toggle-button');
      const minimizeButton = document.getElementById('aipi-minimize-button');
      const closeButton = document.getElementById('aipi-close-button');
      const chatInput = document.getElementById('aipi-input');
      const sendButton = document.getElementById('aipi-send-button');
      const minimizedContainer = document.getElementById('aipi-minimized-container');

      console.log('AIPPS Widget: Adjuntando eventos...', {
        toggleButton: !!toggleButton,
        minimizeButton: !!minimizeButton,
        closeButton: !!closeButton,
        chatInput: !!chatInput,
        sendButton: !!sendButton
      });

      // Toggle widget open/close
      if (toggleButton) {
        // Función para manejar el toggle
        function handleToggle(e) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          }
          console.log('AIPPS Widget: Toggle ejecutado');
          if (isOpen) {
            closeWidget();
          } else {
            openWidget();
          }
        }

        // Limpiar cualquier event listener previo
        toggleButton.onclick = null;
        
        // Remover todos los event listeners existentes clonando el elemento
        const newToggleButton = toggleButton.cloneNode(true);
        toggleButton.parentNode.replaceChild(newToggleButton, toggleButton);
        
        // Referenciar el nuevo botón
        const cleanButton = document.getElementById('aipi-toggle-button');
        
        // Usar solo onclick para evitar conflictos
        cleanButton.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          console.log('AIPPS Widget: Click detectado, estado actual isOpen:', isOpen);
          
          if (isOpen) {
            console.log('AIPPS Widget: Cerrando widget');
            closeWidget();
          } else {
            console.log('AIPPS Widget: Abriendo widget');
            openWidget();
          }
          
          return false;
        };

        // Forzar propiedades críticas directamente en el elemento limpio
        cleanButton.style.zIndex = '2147483647';
        cleanButton.style.pointerEvents = 'auto';
        cleanButton.style.position = 'fixed';
        cleanButton.style.cursor = 'pointer';
        cleanButton.style.userSelect = 'none';
        cleanButton.style.webkitUserSelect = 'none';

        console.log('AIPPS Widget: Eventos configurados correctamente para el botón');

        // Iniciar rotación de textos después de un breve delay (solo para modo no compacto)
        setTimeout(() => {
          // No iniciar rotación porque ahora usamos texto fijo "AIPI Assistant"
          console.log('AIPPS Widget: Widget listo para usar');
        }, 1000);
      } else {
        console.error('AIPPS Widget: No se encontró el botón principal - reintentando...');
        // Reintentar una vez más después de un delay
        setTimeout(() => {
          attachEventListeners();
        }, 500);
        return;
      }

      // Close widget
      if (closeButton) {
        closeButton.addEventListener('click', closeWidget);
      }

      // Minimize widget
      if (minimizeButton) {
        minimizeButton.addEventListener('click', minimizeWidget);
      }

      // Maximize from minimized state
      if (minimizedContainer) {
        minimizedContainer.addEventListener('click', maximizeWidget);
      }

      // Handle input changes
      if (chatInput && sendButton) {
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
      
    }, 100); // Wait 100ms for DOM to be ready
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
    console.log('AIPPS Widget: Intentando abrir widget...');
    
    const chatPanel = document.getElementById('aipi-chat-panel');
    const toggleButton = document.getElementById('aipi-toggle-button');
    const fullscreenButton = document.getElementById('aipi-fullscreen-button');

    console.log('AIPPS Widget: Elementos encontrados:', {
      chatPanel: !!chatPanel,
      toggleButton: !!toggleButton,
      fullscreenButton: !!fullscreenButton,
      widgetType: config.widgetType
    });

    if (!chatPanel) {
      console.error('AIPPS Widget: No se encontró el panel de chat');
      return;
    }

    // Para widgets tipo fullscreen, abrir siempre directamente
    if (config.widgetType === 'fullscreen') {
      console.log('AIPPS Widget: Abriendo widget fullscreen');
      
      // Ocultar botón flotante cuando el chat está abierto
      if (fullscreenButton) {
        fullscreenButton.style.display = 'none';
      }

      // Forzar propiedades de visualización
      chatPanel.style.cssText = `
        display: flex !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 2147483647 !important;
        background: white !important;
        flex-direction: column !important;
      `;
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
    console.log('AIPPS Widget: Abriendo widget bubble');

    // Detener rotación de textos cuando está abierto
    if (textRotationInterval) {
      clearInterval(textRotationInterval);
    }

    if (isMinimized) {
      maximizeWidget();
      return;
    }

    // Forzar propiedades de visualización para bubble
    chatPanel.style.cssText = `
      display: flex !important;
      position: fixed !important;
      bottom: 80px !important;
      right: 20px !important;
      width: 350px !important;
      height: 500px !important;
      max-height: 80vh !important;
      z-index: 2147483647 !important;
      background: white !important;
      border-radius: 10px !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
      flex-direction: column !important;
      overflow: visible !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
    `;
    isOpen = true;
    
    console.log('AIPPS Widget: Panel de chat configurado como visible');
    
    // Proteger el panel para que no se cierre inesperadamente
    setTimeout(() => {
      if (chatPanel && isOpen) {
        // Forzar que se mantenga visible
        chatPanel.style.display = 'flex';
        chatPanel.style.visibility = 'visible';
        chatPanel.style.opacity = '1';
        console.log('AIPPS Widget: Protección de visibilidad aplicada');
      }
    }, 50);
    
    // Verificar cada 100ms durante 2 segundos que el panel siga visible
    let protectionCount = 0;
    const protectionInterval = setInterval(() => {
      if (chatPanel && isOpen && protectionCount < 20) {
        if (chatPanel.style.display === 'none' || chatPanel.style.visibility === 'hidden') {
          console.log('AIPPS Widget: Panel cerrado inesperadamente, restaurando...');
          chatPanel.style.display = 'flex';
          chatPanel.style.visibility = 'visible';
          chatPanel.style.opacity = '1';
        }
        protectionCount++;
      } else {
        clearInterval(protectionInterval);
      }
    }, 100);

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
    // Update toggle button icon and restart text rotation
    toggleButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="aipi-button-text">${dynamicTexts[currentTextIndex]}</span>
      <div class="aipi-notification-dot"></div>
    `;

    // Reiniciar rotación de textos cuando se cierra
    setTimeout(() => {
      startTextRotation();
    }, 1000);

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
          // NO enviar language - dejar que el servidor detecte automáticamente
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
    // Buscar específicamente dentro del widget
    const chatPanel = document.getElementById('aipi-chat-panel');
    let messagesContainer = chatPanel ? chatPanel.querySelector('#aipi-messages-container') : null;
    
    if (!messagesContainer || !chatPanel) {
      console.error('AIPPS Debug: No se encontró messagesContainer o chatPanel');
      return;
    }

    // Forzar que este contenedor tenga los estilos correctos
    messagesContainer.style.cssText = `
      height: 300px !important;
      overflow-y: scroll !important;
      overflow-x: hidden !important;
      padding: 16px;
      background-color: #f9fafb;
      border: none;
      flex: 1;
      display: flex;
      flex-direction: column;
    `;

    const messageElement = document.createElement('div');
    messageElement.className = `aipi-message ${role === 'user' ? 'aipi-user-message' : 'aipi-assistant-message'}`;
    
    if (role === 'assistant') {
      // Formatear respuestas del asistente para mejor legibilidad
      messageElement.innerHTML = formatAssistantMessage(content);
    } else {
      messageElement.textContent = content;
    }

    messagesContainer.appendChild(messageElement);
    console.log('AIPPS Debug: Mensaje agregado con estilos forzados');

    // Store message
    messages.push({ role, content });

    // Force scroll to bottom with delay
    setTimeout(() => {
      scrollToBottom();
    }, 200);
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

  // Format assistant messages for better readability
  function formatAssistantMessage(content) {
    // Escapar HTML para seguridad
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    let formatted = escapeHtml(content);

    // Convertir saltos de línea dobles en párrafos
    formatted = formatted.split('\n\n').map(paragraph => {
      if (paragraph.trim()) {
        return `<p style="margin: 0 0 12px 0; line-height: 1.5;">${paragraph.trim()}</p>`;
      }
      return '';
    }).join('');

    // Convertir saltos de línea simples en <br>
    formatted = formatted.replace(/\n/g, '<br>');

    // Formatear versículos bíblicos (formato: "texto" — Libro capítulo:versículo)
    formatted = formatted.replace(/"([^"]+)"\s*—\s*([^.]+\d+:\d+)/g, 
      '<div style="background: #f0f9ff; padding: 8px 12px; margin: 8px 0; border-left: 3px solid #0ea5e9; border-radius: 4px;"><em>"$1"</em><br><strong style="color: #0284c7;">— $2</strong></div>');

    // Formatear listas con viñetas (líneas que empiezan con -, •, o *)
    formatted = formatted.replace(/(?:^|\n)[-•*]\s*([^\n]+)/g, 
      '<li style="margin: 4px 0; line-height: 1.4;">$1</li>');
    
    // Envolver listas en <ul>
    if (formatted.includes('<li')) {
      formatted = formatted.replace(/(<li[^>]*>.*?<\/li>(?:\s*<li[^>]*>.*?<\/li>)*)/gs, 
        '<ul style="margin: 8px 0; padding-left: 20px;">$1</ul>');
    }

    // Formatear números de lista (1., 2., etc.)
    formatted = formatted.replace(/(?:^|\n)(\d+)\.\s*([^\n]+)/g, 
      '<li style="margin: 4px 0; line-height: 1.4;">$2</li>');
    
    // Envolver listas numeradas en <ol>
    if (formatted.includes('<li') && /\d+\.\s/.test(content)) {
      formatted = formatted.replace(/(<li[^>]*>.*?<\/li>(?:\s*<li[^>]*>.*?<\/li>)*)/gs, 
        '<ol style="margin: 8px 0; padding-left: 20px;">$1</ol>');
    }

    // Formatear texto en negritas (**texto**)
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, 
      '<strong style="color: #1f2937;">$1</strong>');

    return formatted;
  }

  // Scroll to bottom of messages container
  function scrollToBottom() {
    const messagesContainer = document.getElementById('aipi-messages-container');
    if (messagesContainer) {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        // Forzar scroll adicional en caso de problemas de timing
        setTimeout(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
      }, 150);
    }
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

  // Update button text with integration name
  function updateButtonText() {
    const buttonName = config.integrationName || config.assistantName;
    
    // Update bubble widget button text
    const buttonTextElement = document.querySelector('.aipi-button-text');
    if (buttonTextElement) {
      buttonTextElement.textContent = buttonName;
    }
    
    // Update fullscreen widget button text
    const fullscreenButtonText = document.querySelector('.aipi-fullscreen-button-text');
    if (fullscreenButtonText) {
      fullscreenButtonText.textContent = buttonName;
    }
  }

  // Initialize the widget when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();