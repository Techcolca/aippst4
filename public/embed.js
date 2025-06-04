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
  
  // Fullscreen auth variables
  let isAuthenticated = false;
  let currentUser = null;
  let userConversations = [];
  let currentConversationId = null;

  // Setup postMessage communication for dashboard
  function setupDashboardCommunication() {
    // Listen for messages from dashboard
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'AIPPS_DASHBOARD_CONFIG') {
        console.log('AIPPS Debug: Recibido configuración de dashboard:', event.data);
        
        if (event.data.authToken) {
          dashboardConfig.authToken = event.data.authToken;
          localStorage.setItem('aipi_auth_token', event.data.authToken);
          console.log('AIPPS Debug: Token sincronizado desde dashboard');
        }
        
        if (event.data.apiBaseUrl) {
          dashboardConfig.apiBaseUrl = event.data.apiBaseUrl;
          dashboardConfig.isDashboard = true;
          console.log('AIPPS Debug: URL base configurada desde dashboard');
        }
      }
    });
    
    // Request configuration from dashboard if we're in iframe
    if (window.parent && window.parent !== window) {
      setTimeout(() => {
        window.parent.postMessage({
          type: 'AIPPS_REQUEST_CONFIG',
          source: 'widget'
        }, '*');
        console.log('AIPPS Debug: Solicitando configuración al dashboard');
      }, 100);
    }
  }

  // Initialize widget
  function init() {
    // Verificar si el widget ya existe para evitar duplicados
    if (document.getElementById('aipi-widget-container') || window.AIPPS_WIDGET_INITIALIZED) {
      console.log('AIPPS Widget: Ya inicializado, evitando duplicación');
      return;
    }
    window.AIPPS_WIDGET_INITIALIZED = true;
    
    // Setup dashboard communication first
    setupDashboardCommunication();
    
    // Detect dashboard context
    detectDashboardContext();

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

    // FORCE dashboard API URL override
    if (window.location.href.includes('replit.dev') || window.location.hostname.includes('replit.dev')) {
      config.serverUrl = window.location.origin;
      dashboardConfig.isDashboard = true;
      dashboardConfig.apiBaseUrl = window.location.origin;
      
      // Force get auth token from dashboard context immediately
      try {
        const dashboardToken = localStorage.getItem('auth_token');
        if (dashboardToken) {
          dashboardConfig.authToken = dashboardToken;
          console.log('AIPPS Debug: TOKEN FORZADO desde localStorage dashboard');
        }
      } catch (e) {
        console.log('AIPPS Debug: Error accediendo localStorage:', e);
      }
      
      console.log('AIPPS Debug: FORZANDO URL de dashboard:', config.serverUrl);
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
        
        console.log('AIPPS Debug: Configuración cargada:', {
          assistantName: config.assistantName,
          greetingMessage: config.greetingMessage,
          conversationStyle: data.settings.conversationStyle
        });
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

      // Crear botón de acceso flotante para modo pantalla completa - MISMA estructura que bubble
      const fullscreenButton = document.createElement('button');
      fullscreenButton.id = 'aipi-fullscreen-button';
      fullscreenButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
        <span class="aipi-button-text">${escapeHTML(config.integrationName || config.assistantName || 'AIPI Assistant')}</span>
      `;

      // No añadir el botón dentro del widget, sino directamente al body para que sea independiente
      document.body.appendChild(fullscreenButton);

      // Usar onclick en lugar de addEventListener
      fullscreenButton.onclick = function() {
        try {
          console.log('AIPI Debug: Botón fullscreen clickeado');
          
          // Check authentication for fullscreen mode
          if (!isAuthenticated) {
            showAuthForm();
            return;
          }

          // Obtener el panel de chat directamente
          const chatPanel = document.getElementById('aipi-chat-panel');
          console.log('AIPI Debug: Panel de chat encontrado?', !!chatPanel);

          if (chatPanel) {
            // Ocultar el botón flotante
            this.style.display = 'none';
            console.log('AIPI Debug: Botón flotante ocultado');

            // Load user conversations and show chat
            loadUserConversations().then(() => {
              showFullscreenChat();
            });
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

    // Create markup - Only include toggle button for bubble widgets, not fullscreen
    let toggleButtonHTML = '';
    if (config.widgetType !== 'fullscreen') {
      toggleButtonHTML = `
        <button id="aipi-toggle-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          <span class="aipi-button-text">AIPI Assistant</span>
        </button>
      `;
    }

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

      ${toggleButtonHTML}
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
    
    // CRITICAL FIX: Find the appropriate button based on widget type
    let targetButton;
    if (config.widgetType === 'fullscreen') {
      targetButton = document.getElementById('aipi-fullscreen-button');
    } else {
      targetButton = widgetInstance.querySelector('#aipi-toggle-button');
    }
    
    if (!targetButton) {
      console.error('AIPPS Widget: Target button not found for widget type:', config.widgetType);
      return;
    }
    
    console.log('AIPPS Widget: Found target button, applying position changes');
    
    // STEP 1: Clear ALL positioning styles from target button
    targetButton.removeAttribute('style');
    
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
    targetButton.setAttribute('style', newStyles);
    
    // STEP 6: Force repaint
    targetButton.offsetHeight;
    
    console.log('AIPPS Widget: Target button repositioned successfully. Final styles:', {
      position: config.position,
      computedTop: window.getComputedStyle(targetButton).top,
      computedBottom: window.getComputedStyle(targetButton).bottom,
      computedLeft: window.getComputedStyle(targetButton).left,
      computedRight: window.getComputedStyle(targetButton).right,
      buttonElement: targetButton
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
        // Incrementar contador de reintentos
        if (typeof window.aippsRetryCount === 'undefined') {
          window.aippsRetryCount = 0;
        }
        
        if (window.aippsRetryCount < 3) {
          window.aippsRetryCount++;
          console.log(`AIPPS Widget: No se encontró el botón principal - reintento ${window.aippsRetryCount}/3`);
          setTimeout(() => {
            attachEventListeners();
          }, 500);
          return;
        } else {
          console.error('AIPPS Widget: Máximo de reintentos alcanzado. Widget no completamente inicializado.');
          return;
        }
      }

      // Close widget - Enhanced for fullscreen mode
      if (closeButton) {
        // Remove any existing listeners
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
        
        // Attach click handler to the new button
        const cleanCloseButton = document.getElementById('aipi-close-button');
        if (cleanCloseButton) {
          cleanCloseButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('AIPPS Debug: Close button clicked');
            
            try {
              if (config.widgetType === 'fullscreen' || isAuthenticated) {
                // For fullscreen/authenticated mode, hide chat and show the floating button again
                const chatPanel = document.getElementById('aipi-chat-panel');
                const fullscreenButton = document.getElementById('aipi-fullscreen-button');
                
                if (chatPanel) {
                  chatPanel.style.display = 'none';
                  console.log('AIPPS Debug: Chat panel hidden');
                }
                if (fullscreenButton) {
                  fullscreenButton.style.display = 'flex';
                  console.log('AIPPS Debug: Fullscreen button shown');
                }
                isOpen = false;
                isAuthenticated = false;
                currentUser = null;
                currentConversationId = null;
              } else {
                window.aipiCloseWidget();
              }
            } catch (error) {
              console.error('AIPPS Debug: Error in close button handler:', error);
            }
            return false;
          };
        }
      }

      // Minimize widget - Only for bubble mode
      if (minimizeButton) {
        minimizeButton.addEventListener('click', () => {
          if (config.widgetType !== 'fullscreen') {
            minimizeWidget();
          }
        });
      }

      // Maximize from minimized state
      if (minimizedContainer) {
        minimizedContainer.addEventListener('click', maximizeWidget);
      }

      // Handle input changes and send button
      if (chatInput && sendButton) {
        // Remove existing listeners by cloning elements
        const newChatInput = chatInput.cloneNode(true);
        const newSendButton = sendButton.cloneNode(true);
        
        chatInput.parentNode.replaceChild(newChatInput, chatInput);
        sendButton.parentNode.replaceChild(newSendButton, sendButton);
        
        // Get references to the new clean elements
        const cleanInput = document.getElementById('aipi-input');
        const cleanSendButton = document.getElementById('aipi-send-button');
        
        if (cleanInput && cleanSendButton) {
          // Handle input changes
          cleanInput.oninput = function() {
            cleanSendButton.disabled = !cleanInput.value.trim();
          };

          // Send message on Enter key
          cleanInput.onkeydown = function(e) {
            if (e.key === 'Enter' && cleanInput.value.trim()) {
              e.preventDefault();
              console.log('AIPPS Debug: Enter key pressed, sending message');
              try {
                window.aipiSendMessage();
              } catch (error) {
                console.error('AIPPS Debug: Error in Enter key handler:', error);
              }
            }
          };

          // Send message on button click
          cleanSendButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('AIPPS Debug: Send button clicked');
            try {
              if (cleanInput.value.trim()) {
                window.aipiSendMessage();
              }
            } catch (error) {
              console.error('AIPPS Debug: Error in send button handler:', error);
            }
            return false;
          };
          
          // Enable send button based on current input value
          cleanSendButton.disabled = !cleanInput.value.trim();
          
          console.log('AIPPS Debug: Input and send button events configured');
        }
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

    // Calculate responsive offsets and position for chat panel
    const isMobile = window.innerWidth < 768;
    const bottomOffset = isMobile ? '16px' : '20px';
    const sideOffset = isMobile ? '16px' : '20px';
    const panelHeight = isMobile ? '400px' : '500px';
    const panelWidth = isMobile ? '300px' : '350px';
    
    // Calculate chat panel position based on button position
    let panelPositionStyles = '';
    switch (config.position) {
      case 'bottom-left':
        panelPositionStyles = `bottom: calc(${bottomOffset} + 50px) !important; left: ${sideOffset} !important; right: auto !important; top: auto !important;`;
        break;
      case 'bottom-center':
        panelPositionStyles = `bottom: calc(${bottomOffset} + 50px) !important; left: 50% !important; right: auto !important; top: auto !important; transform: translateX(-50%) !important;`;
        break;
      case 'top-right':
        panelPositionStyles = `top: calc(20px + 50px) !important; right: ${sideOffset} !important; left: auto !important; bottom: auto !important;`;
        break;
      case 'top-left':
        panelPositionStyles = `top: calc(20px + 50px) !important; left: ${sideOffset} !important; right: auto !important; bottom: auto !important;`;
        break;
      case 'bottom-right':
      default:
        panelPositionStyles = `bottom: calc(${bottomOffset} + 50px) !important; right: ${sideOffset} !important; left: auto !important; top: auto !important;`;
        break;
    }
    
    // Apply complete styles to chat panel with calculated position
    chatPanel.style.cssText = `
      display: flex !important;
      position: fixed !important;
      ${panelPositionStyles}
      width: ${panelWidth} !important;
      height: ${panelHeight} !important;
      max-height: 80vh !important;
      max-width: calc(100vw - 40px) !important;
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
    
    console.log('AIPPS Widget: Chat panel positioned for', config.position, 'with styles:', panelPositionStyles);
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
        contentLength: currentPageContent ? currentPageContent.length : 0,
        authenticated: isAuthenticated,
        conversationId: currentConversationId || config.conversationId
      });

      let response;
      
      // Use different endpoints based on authentication status
      if (isAuthenticated && currentConversationId) {
        // Authenticated fullscreen mode
        response = await fetch(`${config.serverUrl}/api/conversations/${currentConversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({
            content: message,
            role: 'user'
          }),
        });
      } else {
        // Anonymous bubble mode
        response = await fetch(`${config.serverUrl}/api/widget/${config.apiKey}/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId: config.conversationId,
            content: message,
            role: 'user',
            pageContext: {
              title: pageTitle || document.title,
              url: window.location.href,
              content: currentPageContent
            }
          }),
        });
      }

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

      // Handle response based on authentication mode
      if (isAuthenticated && currentConversationId) {
        // Authenticated fullscreen mode response
        if (data.aiResponse && data.aiResponse.content) {
          addMessage(data.aiResponse.content, 'assistant');
        } else if (data.error) {
          addMessage("Lo siento, hubo un error procesando tu mensaje.", 'assistant');
        } else {
          addMessage("Recibí tu mensaje, pero no pude generar una respuesta en este momento.", 'assistant');
        }
      } else {
        // Anonymous bubble mode response
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

  // Authentication functions for fullscreen mode
  function showAuthForm() {
    const authContainer = document.createElement('div');
    authContainer.id = 'aipi-auth-container';
    authContainer.innerHTML = `
      <div class="aipi-auth-overlay">
        <div class="aipi-auth-modal">
          <div class="aipi-auth-header">
            <h2>Iniciar Sesión</h2>
            <button class="aipi-auth-close" onclick="closeAuthForm()">×</button>
          </div>
          <div class="aipi-auth-content">
            <div class="aipi-auth-tabs">
              <button class="aipi-auth-tab active" onclick="showLoginTab()">Iniciar Sesión</button>
              <button class="aipi-auth-tab" onclick="showRegisterTab()">Registrarse</button>
            </div>
            
            <div id="aipi-login-form" class="aipi-auth-form">
              <input type="text" id="login-username" placeholder="Nombre de usuario" required>
              <input type="password" id="login-password" placeholder="Contraseña" required>
              <button onclick="handleLogin()" class="aipi-auth-submit">Iniciar Sesión</button>
            </div>
            
            <div id="aipi-register-form" class="aipi-auth-form" style="display: none;">
              <input type="text" id="register-username" placeholder="Nombre de usuario" required>
              <input type="email" id="register-email" placeholder="Correo electrónico" required>
              <input type="password" id="register-password" placeholder="Contraseña" required>
              <button onclick="handleRegister()" class="aipi-auth-submit">Registrarse</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add auth styles
    const authStyles = document.createElement('style');
    authStyles.textContent = `
      .aipi-auth-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2147483647;
      }
      
      .aipi-auth-modal {
        background: white;
        border-radius: 12px;
        padding: 0;
        width: 400px;
        max-width: 90vw;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      
      .aipi-auth-header {
        background: ${config.themeColor};
        color: white;
        padding: 20px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .aipi-auth-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      
      .aipi-auth-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .aipi-auth-content {
        padding: 20px;
      }
      
      .aipi-auth-tabs {
        display: flex;
        margin-bottom: 20px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .aipi-auth-tab {
        flex: 1;
        padding: 10px;
        border: none;
        background: none;
        cursor: pointer;
        font-weight: 500;
        color: #6b7280;
        border-bottom: 2px solid transparent;
      }
      
      .aipi-auth-tab.active {
        color: ${config.themeColor};
        border-bottom-color: ${config.themeColor};
      }
      
      .aipi-auth-form input {
        width: 100%;
        padding: 12px;
        margin-bottom: 15px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        box-sizing: border-box;
      }
      
      .aipi-auth-form input:focus {
        outline: none;
        border-color: ${config.themeColor};
        box-shadow: 0 0 0 3px ${config.themeColor}20;
      }
      
      .aipi-auth-submit {
        width: 100%;
        padding: 12px;
        background: ${config.themeColor};
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
      }
      
      .aipi-auth-submit:hover {
        background: ${adjustColor(config.themeColor, -20)};
      }
    `;
    
    document.head.appendChild(authStyles);
    document.body.appendChild(authContainer);
  }

  window.showLoginTab = function() {
    document.getElementById('aipi-login-form').style.display = 'block';
    document.getElementById('aipi-register-form').style.display = 'none';
    document.querySelectorAll('.aipi-auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.aipi-auth-tab')[0].classList.add('active');
  }

  window.showRegisterTab = function() {
    document.getElementById('aipi-login-form').style.display = 'none';
    document.getElementById('aipi-register-form').style.display = 'block';
    document.querySelectorAll('.aipi-auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.aipi-auth-tab')[1].classList.add('active');
  }

  window.closeAuthForm = function() {
    const authContainer = document.getElementById('aipi-auth-container');
    if (authContainer) {
      authContainer.remove();
    }
  }

  window.handleLogin = async function() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    try {
      const response = await fetch(`${config.serverUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        currentUser = userData;
        isAuthenticated = true;
        closeAuthForm();
        
        await loadUserConversations();
        showFullscreenChat();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    }
  }

  window.handleRegister = async function() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    if (!username || !email || !password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    try {
      const response = await fetch(`${config.serverUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        currentUser = userData;
        isAuthenticated = true;
        closeAuthForm();
        
        await loadUserConversations();
        showFullscreenChat();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al registrarse');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    }
  }

  async function loadUserConversations() {
    try {
      const token = localStorage.getItem('aipi_auth_token');
      const response = await fetch(`${getApiBaseUrl()}/api/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        userConversations = await response.json();
        console.log('AIPPS Debug: Conversaciones cargadas:', userConversations.length);
      } else {
        console.error('Error loading conversations:', response.status);
        userConversations = [];
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      userConversations = [];
    }
  }

  async function loadUserConversationsFromDashboard() {
    try {
      console.log('AIPPS Debug: Cargando conversaciones usando sistema bubble exitoso...');
      
      // Use bubble system: no auth needed, just apiKey + visitorId
      const visitorId = localStorage.getItem('aipi_visitor_id') || 
        localStorage.getItem('aipi_auth_user_id') || 
        `visitor_${Math.random().toString(36).substring(2, 15)}`;
      
      if (!localStorage.getItem('aipi_visitor_id')) {
        localStorage.setItem('aipi_visitor_id', visitorId);
      }
      
      const response = await fetch(`${getApiBaseUrl()}/api/widget/${config.apiKey}`, {
        headers: {
          'Content-Type': 'application/json'
        },
      });

      console.log('AIPPS Debug: Widget response status:', response.status);
      
      if (response.ok) {
        const widgetData = await response.json();
        
        // Now get conversations for this visitor using new endpoint
        const conversationsResponse = await fetch(`${getApiBaseUrl()}/api/widget/${config.apiKey}/conversations/${visitorId}`, {
          headers: {
            'Content-Type': 'application/json'
          },
        });
        
        if (conversationsResponse.ok) {
          userConversations = await conversationsResponse.json();
        } else {
          userConversations = [];
        }
        
        console.log('AIPPS Debug: Conversaciones cargadas con sistema bubble:', userConversations.length);
      } else {
        console.error('Error loading conversations from dashboard:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        userConversations = [];
      }
    } catch (error) {
      console.error('Error loading conversations from dashboard:', error);
      userConversations = [];
    }
  }

  function showFullscreenChat() {
    const chatPanel = document.getElementById('aipi-chat-panel');
    if (!chatPanel) return;

    chatPanel.innerHTML = `
      <div class="aipi-fullscreen-layout">
        <div class="aipi-conversations-sidebar">
          <div class="aipi-sidebar-header">
            <h3>Conversaciones</h3>
            <button onclick="createNewConversation()" class="aipi-new-chat-btn">+ Nueva</button>
          </div>
          <div class="aipi-conversations-list" id="aipi-conversations-list">
            ${renderConversationsList()}
          </div>
        </div>
        
        <div class="aipi-chat-main">
          <div id="aipi-chat-header">
            <div id="aipi-header-info">
              <div id="aipi-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <div id="aipi-header-text">
                <span id="aipi-assistant-name">${escapeHTML(config.integrationName || config.assistantName)}</span>
                <span id="aipi-status">Online</span>
              </div>
            </div>
            <div id="aipi-header-actions">
              <button class="aipi-header-button" onclick="window.aipiCloseFullscreen()" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <div id="aipi-messages-container"></div>
          <div id="aipi-input-container">
            <input type="text" id="aipi-fullscreen-input" placeholder="Escribe tu mensaje..." onkeydown="if(event.key==='Enter') window.aipiSendFullscreenMessage()">
            <button onclick="window.aipiSendFullscreenMessage()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    const fullscreenStyles = document.createElement('style');
    fullscreenStyles.textContent = `
      .aipi-fullscreen-layout {
        display: flex;
        height: 100vh;
        font-family: ${getFontFamily()};
      }
      
      .aipi-conversations-sidebar {
        width: 300px;
        background: #f8f9fa;
        border-right: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
      }
      
      .aipi-sidebar-header {
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .aipi-sidebar-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .aipi-new-chat-btn {
        background: ${config.themeColor};
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .aipi-conversations-list {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
      }
      
      .aipi-conversation-item {
        padding: 12px;
        margin-bottom: 8px;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        border: 1px solid #e5e7eb;
        transition: all 0.2s;
      }
      
      .aipi-conversation-item:hover {
        background: #f3f4f6;
      }
      
      .aipi-conversation-item.active {
        background: ${config.themeColor}10;
        border-color: ${config.themeColor};
      }
      
      .aipi-conversation-title {
        font-weight: 500;
        font-size: 14px;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .aipi-conversation-preview {
        font-size: 12px;
        color: #6b7280;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .aipi-chat-main {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      
      #aipi-input-container {
        padding: 20px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 10px;
        align-items: center;
        background: white;
      }
      
      #aipi-fullscreen-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #e5e7eb;
        border-radius: 24px;
        font-size: 14px;
        outline: none;
        font-family: ${getFontFamily()};
        width: 100%;
      }
      
      #aipi-fullscreen-input:focus {
        border-color: ${config.themeColor};
        box-shadow: 0 0 0 2px ${config.themeColor}20;
      }
      
      #aipi-input-container button {
        padding: 12px;
        background: ${config.themeColor};
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        width: 44px;
        height: 44px;
      }
      
      #aipi-input-container button:hover {
        background: ${adjustColor(config.themeColor, -20)};
        transform: scale(1.05);
      }
      
      #aipi-messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #f8f9fa;
      }
    `;
    
    document.head.appendChild(fullscreenStyles);
    
    chatPanel.style.display = 'flex';
    isOpen = true;

    // Initialize fullscreen chat with bubble system (no authentication needed)
    setTimeout(async () => {
      console.log('AIPPS Debug: Inicializando chat fullscreen con sistema bubble');
      
      // NO TOKEN NEEDED - using bubble system directly
      console.log('AIPPS Debug: Sistema bubble sin autenticación iniciado');
      
      // Load user conversations using bubble system endpoints
      await loadUserConversationsFromDashboard();
      updateConversationsList();
      
      // Always show welcome message when opening fullscreen
      if (config.greetingMessage) {
        console.log('AIPPS Debug: Mostrando mensaje de bienvenida:', config.greetingMessage);
        addMessage(config.greetingMessage, 'assistant');
        
        // Add some spacing after welcome message
        setTimeout(() => {
          const messagesContainer = document.getElementById('aipi-messages-container');
          if (messagesContainer) {
            messagesContainer.innerHTML += '<div style="height: 10px;"></div>';
          }
        }, 100);
      }
      
      // Then load existing conversation if any (but don't overwrite welcome message)
      if (userConversations.length > 0) {
        console.log('AIPPS Debug: Cargando conversación existente después del mensaje de bienvenida');
        // Don't call loadConversation as it clears the messages
        // Instead, just set the current conversation ID
        currentConversationId = userConversations[0].id;
      }
    }, 100);
  }

  function renderConversationsList() {
    if (userConversations.length === 0) {
      return '<div style="text-align: center; color: #6b7280; padding: 20px;">No hay conversaciones</div>';
    }

    return userConversations.map(conv => `
      <div class="aipi-conversation-item ${conv.id === currentConversationId ? 'active' : ''}" 
           onclick="loadConversation(${conv.id})">
        <div class="aipi-conversation-content">
          <div class="aipi-conversation-title">${conv.title || 'Nueva conversación'}</div>
          <div class="aipi-conversation-preview">${conv.preview || 'Iniciada hace poco'}</div>
        </div>
        <button class="aipi-delete-conversation-btn" 
                onclick="event.stopPropagation(); showDeleteConfirmation(${conv.id})"
                title="Eliminar conversación">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `).join('');
  }

  window.createNewConversation = async function() {
    return await createNewConversationForDashboard();
  }

  async function createNewConversationForDashboard() {
    try {
      const token = getAuthToken();
      console.log('AIPPS Debug: Creando nueva conversación con token:', token ? 'Encontrado' : 'No encontrado');
      
      // Use the correct base URL for API calls
      const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? `${window.location.protocol}//${window.location.host}` 
        : config.baseUrl || `${window.location.protocol}//${window.location.host}`;
      
      const response = await fetch(`${getApiBaseUrl()}/api/widget/${config.apiKey}/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          visitorId: localStorage.getItem('aipi_visitor_id') || `visitor_${Date.now()}`
        }),
      });

      console.log('AIPPS Debug: Create conversation response status:', response.status);

      if (response.ok) {
        const newConversation = await response.json();
        console.log('AIPPS Debug: Nueva conversación creada:', newConversation.id);
        userConversations.unshift(newConversation);
        currentConversationId = newConversation.id;
        updateConversationsList();
        return newConversation;
      } else {
        const errorText = await response.text();
        console.error('Error creating conversation:', response.status, errorText);
        return null;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  window.loadConversation = async function(conversationId) {
    try {
      currentConversationId = conversationId;
      console.log('AIPPS Debug: Cargando conversación:', conversationId);
      
      // Clear current messages
      const messagesContainer = document.getElementById('aipi-messages-container');
      if (messagesContainer) {
        messagesContainer.innerHTML = '';
      }
      
      // Load messages for this conversation using dashboard token
      const token = getAuthToken();
      
      // Use the correct base URL for API calls
      const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? `${window.location.protocol}//${window.location.host}` 
        : config.baseUrl || `${window.location.protocol}//${window.location.host}`;
      
      const response = await fetch(`${getApiBaseUrl()}/api/widget/${config.apiKey}/conversation/${conversationId}/messages`, {
        headers: {
          'Content-Type': 'application/json'
        },
      });

      console.log('AIPPS Debug: Load messages response status:', response.status);

      if (response.ok) {
        const messages = await response.json();
        console.log('AIPPS Debug: Mensajes cargados:', messages.length);
        
        // Display messages
        messages.forEach(message => {
          addMessage(message.content, message.role === 'user' ? 'user' : 'assistant');
        });
        
        // Update active conversation in sidebar
        updateConversationsList();
      } else {
        const errorText = await response.text();
        console.error('Error loading messages:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }

  async function displayMessages(conversationId) {
    const messagesContainer = document.getElementById('aipi-messages-container');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = '';
    
    try {
      // Get messages using bubble system endpoint
      const response = await fetch(`${getApiBaseUrl()}/api/widget/${config.apiKey}/conversation/${conversationId}/messages`, {
        headers: {
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        const messages = await response.json();
        console.log('AIPPS Debug: Mensajes cargados para conversación:', conversationId, messages.length);
        
        // Add conversation messages to the display
        messages.forEach(msg => {
          addMessage(msg.content, msg.role);
        });
        
        scrollToBottom();
      } else {
        console.error('Error loading conversation messages:', response.status);
      }
    } catch (error) {
      console.error('Error in displayMessages:', error);
    }
  }

  function updateConversationsList() {
    const listContainer = document.getElementById('aipi-conversations-list');
    if (listContainer) {
      listContainer.innerHTML = renderConversationsList();
    }
  }

  // Delete conversation functions
  function showDeleteConfirmation(conversationId) {
    const conversation = userConversations.find(conv => conv.id === conversationId);
    const title = conversation ? (conversation.title || 'Nueva conversación') : 'esta conversación';
    
    if (confirm(`¿Estás seguro de eliminar "${title}"? Esta acción no se puede deshacer.`)) {
      deleteConversation(conversationId);
    }
  }

  async function deleteConversation(conversationId) {
    try {
      console.log(`AIPPS Debug: Eliminando conversación ${conversationId}`);
      
      const response = await fetch(`${getApiBaseUrl()}/api/widget/${config.apiKey}/conversation/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        console.log(`AIPPS Debug: Conversación ${conversationId} eliminada exitosamente`);
        
        // Remover de la lista local
        userConversations = userConversations.filter(conv => conv.id !== conversationId);
        
        // Actualizar la interfaz
        updateConversationsList();
        
        // Si eliminamos la conversación actual, cargar otra o crear nueva
        if (currentConversationId === conversationId) {
          if (userConversations.length > 0) {
            // Cargar la conversación más reciente
            await loadConversation(userConversations[0].id);
          } else {
            // No hay más conversaciones, crear una nueva
            await createNewConversationForDashboard();
          }
        }
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Conversación eliminada exitosamente');
        
      } else {
        console.error('Error eliminando conversación:', response.status);
        showErrorMessage('Error al eliminar la conversación. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error in deleteConversation:', error);
      showErrorMessage('Error al eliminar la conversación. Inténtalo de nuevo.');
    }
  }

  function showSuccessMessage(message) {
    // Crear o mostrar mensaje de éxito temporal
    let messageDiv = document.getElementById('aipi-success-message');
    if (!messageDiv) {
      messageDiv = document.createElement('div');
      messageDiv.id = 'aipi-success-message';
      messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(messageDiv);
    }
    
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
  }

  function showErrorMessage(message) {
    // Crear o mostrar mensaje de error temporal
    let messageDiv = document.getElementById('aipi-error-message');
    if (!messageDiv) {
      messageDiv = document.createElement('div');
      messageDiv.id = 'aipi-error-message';
      messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(messageDiv);
    }
    
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
  }

  // Dashboard context detection and configuration
  let dashboardConfig = {
    isDashboard: false,
    apiBaseUrl: null,
    authToken: null
  };

  // Detect if running in dashboard context
  function detectDashboardContext() {
    try {
      // Check if we're in an iframe and parent is dashboard
      if (window.parent && window.parent !== window) {
        const parentUrl = window.parent.location.href;
        if (parentUrl.includes('replit.dev') && parentUrl.includes('/dashboard')) {
          dashboardConfig.isDashboard = true;
          dashboardConfig.apiBaseUrl = `${window.parent.location.protocol}//${window.parent.location.host}`;
          console.log('AIPPS Debug: Detectado contexto de dashboard Replit');
          return true;
        }
      }
    } catch (e) {
      // Cross-origin access blocked, try other methods
    }
    
    // Check for dashboard indicator in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dashboard') === 'true' || window.location.href.includes('replit.dev')) {
      dashboardConfig.isDashboard = true;
      dashboardConfig.apiBaseUrl = window.location.href.includes('replit.dev') 
        ? `${window.location.protocol}//${window.location.host}`
        : null;
      console.log('AIPPS Debug: Detectado contexto de dashboard por URL');
      return true;
    }
    
    return false;
  }

  // Helper function to get the correct API base URL
  function getApiBaseUrl() {
    // ULTIMATE FIX: Hard-code the Replit server URL
    const replitServerUrl = 'https://a82260a7-e706-4639-8a5c-db88f2f26167-00-2a8uzldw0vxo4.picard.replit.dev';
    console.log('AIPPS Debug: ULTIMATE FIX - Usando URL del servidor Replit:', replitServerUrl);
    return replitServerUrl;
  }

  // Helper function to get authentication token
  function getAuthToken() {
    // 1. If we have a dashboard token, use it first
    if (dashboardConfig.authToken) {
      console.log('AIPPS Debug: Token encontrado en configuración de dashboard');
      return dashboardConfig.authToken;
    }
    
    // 2. Try to get token from parent window (dashboard context)
    if (dashboardConfig.isDashboard) {
      try {
        if (window.parent && window.parent !== window) {
          const parentToken = window.parent.localStorage.getItem('auth_token');
          if (parentToken) {
            console.log('AIPPS Debug: Token encontrado en parent window dashboard');
            dashboardConfig.authToken = parentToken; // Cache it
            return parentToken;
          }
        }
      } catch (e) {
        console.log('AIPPS Debug: No se pudo acceder al parent window, intentando postMessage');
      }
    }
    
    // 3. Try localStorage
    let token = localStorage.getItem('auth_token');
    if (token) {
      console.log('AIPPS Debug: Token encontrado en localStorage');
      return token;
    }
    
    // 4. Try getting from cookies
    const value = `; ${document.cookie}`;
    const parts = value.split(`; auth_token=`);
    if (parts.length === 2) {
      token = parts.pop().split(';').shift();
      if (token) {
        console.log('AIPPS Debug: Token encontrado en cookies');
        return token;
      }
    }
    
    // 5. Try sessionStorage
    token = sessionStorage.getItem('auth_token');
    if (token) {
      console.log('AIPPS Debug: Token encontrado en sessionStorage');
      return token;
    }
    
    console.log('AIPPS Debug: No se encontró token en ninguna fuente');
    return null;
  }

  // Global event handlers for fullscreen mode
  window.aipiCloseFullscreen = function() {
    console.log('AIPPS Debug: Close fullscreen triggered');
    const chatPanel = document.getElementById('aipi-chat-panel');
    const fullscreenButton = document.getElementById('aipi-fullscreen-button');
    
    if (chatPanel) {
      chatPanel.style.display = 'none';
    }
    if (fullscreenButton) {
      fullscreenButton.style.display = 'flex';
    }
    isOpen = false;
    isAuthenticated = false;
    currentUser = null;
    currentConversationId = null;
  };

  window.aipiSendFullscreenMessage = function() {
    console.log('AIPPS Debug: Send fullscreen message triggered');
    const input = document.getElementById('aipi-fullscreen-input');
    if (input && input.value.trim()) {
      const message = input.value.trim();
      input.value = '';
      
      // Add user message to chat
      addMessage(message, 'user');
      
      // Send message using the existing sendMessage function
      sendFullscreenMessage(message);
    }
  };

  // Helper function to send fullscreen messages using bubble system
  async function sendFullscreenMessage(message) {
    showTypingIndicator(true);
    
    try {
      console.log('AIPPS Debug: Enviando mensaje con sistema bubble exitoso...');
      console.log('AIPPS Debug: Mensaje:', message);
      
      // Use same system as working bubble widget
      const visitorId = localStorage.getItem('aipi_visitor_id') || 
        `visitor_${Math.random().toString(36).substring(2, 15)}`;
      
      if (!localStorage.getItem('aipi_visitor_id')) {
        localStorage.setItem('aipi_visitor_id', visitorId);
      }
      
      const response = await fetch(`${getApiBaseUrl()}/api/widget/${config.apiKey}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          visitorId: visitorId,
          currentUrl: window.location.href,
          pageTitle: document.title
        })
      });

      console.log('AIPPS Debug: Bubble system response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('AIPPS Debug: Bubble response data:', data);
        
        // Update conversation ID from response
        if (data.conversationId) {
          currentConversationId = data.conversationId;
        }
        
        addMessage(data.response || data.message || 'Respuesta recibida', 'assistant');
        
        // Update conversations list
        await loadUserConversationsFromDashboard();
        updateConversationsList();
      } else {
        const errorData = await response.text();
        console.error('Error response:', response.status, errorData);
        addMessage('Lo siento, no pude procesar tu mensaje. Inténtalo de nuevo.', 'assistant');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Error de conexión. Por favor, verifica tu conexión a internet.', 'assistant');
    } finally {
      showTypingIndicator(false);
    }
  }

  // Expose other functions to global scope
  window.aipiSendMessage = sendMessage;
  window.aipiCloseWidget = closeWidget;
  window.aipiOpenWidget = openWidget;
  window.aipiMinimizeWidget = minimizeWidget;
  window.aipiMaximizeWidget = maximizeWidget;

  // Initialize the widget when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();