(function() {
  // AIPI Widget Configuration
  let config = {
    apiKey: "",
    themeColor: "#3B82F6",
    assistantName: "AIPI Assistant",
    greetingMessage: "👋 Hi there! I'm AIPI, your AI assistant. How can I help you today?",
    showAvailability: true,
    userBubbleColor: "#3B82F6",
    assistantBubbleColor: "#E5E7EB",
    font: "inter",
    visitorId: "",
    conversationId: null,
    serverUrl: window.location.origin, // Will be overridden by script URL source
  };
  
  // State variables
  let chatPanel = null;
  let widgetButton = null;
  let isOpen = false;
  let conversationStarted = false;
  let messages = [];

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Initialize the widget
  function init() {
    console.log('AIPI Fullscreen Widget: Initializing...');
    try {
      // Extract the API key from script tag
      const scriptTags = document.getElementsByTagName('script');
      let apiKey = null;
      
      for (let i = 0; i < scriptTags.length; i++) {
        const scriptTag = scriptTags[i];
        const src = scriptTag.src || '';
        
        if (src.includes('fullscreen-embed.js')) {
          try {
            const url = new URL(src);
            apiKey = url.searchParams.get('key');
            config.serverUrl = url.origin;
            console.log('AIPI: Found API key and server URL', apiKey, config.serverUrl);
            break;
          } catch (err) {
            console.error('AIPI: Error parsing script URL', err);
          }
        }
      }
      
      if (!apiKey) {
        throw new Error('AIPI API key is required. Add it to your script tag: ?key=YOUR_API_KEY');
      }
      
      config.apiKey = apiKey;
      // config.serverUrl ya se establece en línea 47, no necesitamos reasignarlo aquí
      
      // Generate visitor ID if not existing
      config.visitorId = localStorage.getItem('aipi_visitor_id') || 
        'visitor_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('aipi_visitor_id', config.visitorId);
      
      // Load widget configuration
      loadWidgetConfig();
    } catch (error) {
      console.error('AIPI Fullscreen Widget Error:', error);
    }
  }
  
  // Load widget configuration from server
  async function loadWidgetConfig() {
    try {
      console.log('AIPI Fullscreen Widget: Loading configuration...');
      const response = await fetch(`${config.serverUrl}/api/widget/${config.apiKey}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load widget configuration: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update config with server response
      if (data.integration) {
        config.themeColor = data.integration.themeColor || config.themeColor;
      }
      
      if (data.settings) {
        config.assistantName = data.settings.assistantName || config.assistantName;
        config.greetingMessage = data.settings.defaultGreeting || config.greetingMessage;
        config.showAvailability = data.settings.showAvailability !== false;
        config.userBubbleColor = data.settings.userBubbleColor || config.userBubbleColor;
        config.assistantBubbleColor = data.settings.assistantBubbleColor || config.assistantBubbleColor;
        config.font = data.settings.font || config.font;
      }
      
      // Create widget DOM elements
      createWidget();
      
    } catch (error) {
      console.error('AIPI Fullscreen Widget Error:', error);
    }
  }
  
  // Create widget DOM elements
  function createWidget() {
    console.log('AIPI Fullscreen Widget: Creating widget...');
    try {
      // Create widget button
      widgetButton = document.createElement('div');
      widgetButton.id = 'aipi-fs-button';
      widgetButton.innerHTML = `
        <div class="aipi-fs-button-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        </div>
        <div class="aipi-fs-button-text">AIPI Assistant</div>
      `;
      
      // Create chat panel
      chatPanel = document.createElement('div');
      chatPanel.id = 'aipi-fs-chat-panel';
      chatPanel.style.display = 'none';
      chatPanel.innerHTML = `
        <div id="aipi-fs-chat-header">
          <div id="aipi-fs-header-info">
            <div id="aipi-fs-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <div id="aipi-fs-header-text">
              <span id="aipi-fs-assistant-name">${escapeHTML(config.assistantName)}</span>
              ${config.showAvailability ? '<span id="aipi-fs-status">Online</span>' : ''}
            </div>
          </div>
          <div id="aipi-fs-header-actions">
            <button class="aipi-fs-header-button" id="aipi-fs-close-button" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div id="aipi-fs-messages-container"></div>
        <div id="aipi-fs-input-container">
          <input type="text" id="aipi-fs-input" placeholder="Type your message...">
          <button id="aipi-fs-send-button" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      `;
      
      // Create CSS
      const style = document.createElement('style');
      style.textContent = `
        #aipi-fs-button {
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
          cursor: pointer !important;
          z-index: 999999;
          font-family: Arial, sans-serif;
          transition: all 0.3s ease;
          pointer-events: auto !important;
        }
        
        #aipi-fs-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        }
        
        .aipi-fs-button-icon {
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .aipi-fs-button-text {
          font-weight: 600;
          font-size: 14px;
        }
        
        #aipi-fs-chat-panel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: white;
          z-index: 1000000;
          display: flex;
          flex-direction: column;
        }
        
        #aipi-fs-chat-header {
          background-color: ${config.themeColor};
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        #aipi-fs-header-info {
          display: flex;
          align-items: center;
        }
        
        #aipi-fs-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }
        
        #aipi-fs-avatar svg {
          width: 20px;
          height: 20px;
          color: ${config.themeColor};
        }
        
        #aipi-fs-header-text {
          display: flex;
          flex-direction: column;
        }
        
        #aipi-fs-assistant-name {
          font-weight: 600;
          font-size: 16px;
        }
        
        #aipi-fs-status {
          font-size: 12px;
          opacity: 0.8;
        }
        
        #aipi-fs-header-actions {
          display: flex;
        }
        
        .aipi-fs-header-button {
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
        
        .aipi-fs-header-button:hover {
          opacity: 1;
        }
        
        #aipi-fs-messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background-color: #f9fafb;
        }
        
        #aipi-fs-input-container {
          display: flex;
          padding: 12px;
          border-top: 1px solid #e5e7eb;
          background-color: #fff;
        }
        
        #aipi-fs-input {
          flex: 1;
          border: 1px solid #d1d5db;
          border-radius: 20px;
          padding: 10px 16px;
          font-size: 14px;
          outline: none;
          background-color: #fff;
          color: #1f2937;
        }
        
        #aipi-fs-input:focus {
          border-color: ${config.themeColor};
          box-shadow: 0 0 0 1px ${config.themeColor}20;
        }
        
        #aipi-fs-send-button {
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
        
        #aipi-fs-send-button:hover {
          background-color: ${adjustColor(config.themeColor, -20)};
        }
        
        #aipi-fs-send-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
        
        .aipi-fs-message {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
        }
        
        .aipi-fs-user-message {
          background-color: ${config.userBubbleColor};
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        
        .aipi-fs-assistant-message {
          background-color: ${config.assistantBubbleColor};
          color: #1f2937;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        
        .aipi-fs-typing-indicator {
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
        
        .aipi-fs-typing-dot {
          width: 8px;
          height: 8px;
          background-color: #6b7280;
          border-radius: 50%;
          animation: aipi-fs-typing-animation 1.4s infinite ease-in-out;
        }
        
        .aipi-fs-typing-dot:nth-child(1) {
          animation-delay: 0s;
        }
        
        .aipi-fs-typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .aipi-fs-typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes aipi-fs-typing-animation {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `;
      
      // Append to document
      document.head.appendChild(style);
      
      // Crear un contenedor para el botón que asegure que los eventos funcionen
      const widgetContainer = document.createElement('div');
      widgetContainer.id = 'aipi-fs-container';
      widgetContainer.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 999998;';
      
      // Append elements to DOM
      document.body.appendChild(widgetContainer);
      widgetContainer.appendChild(widgetButton);
      document.body.appendChild(chatPanel);
      
      // Add event listeners with multiple event types para asegurar que se capturen
      widgetButton.onclick = function(e) {
        console.log('AIPI Fullscreen Widget: Button clicked (onclick)');
        e.preventDefault();
        e.stopPropagation();
        openChat();
        return false;
      };
      
      widgetButton.addEventListener('click', function(e) {
        console.log('AIPI Fullscreen Widget: Button clicked (addEventListener)');
        e.preventDefault();
        e.stopPropagation();
        openChat();
      }, true);
      
      document.getElementById('aipi-fs-close-button').addEventListener('click', function() {
        console.log('AIPI Fullscreen Widget: Close button clicked');
        closeChat();
      });
      
      const inputField = document.getElementById('aipi-fs-input');
      const sendButton = document.getElementById('aipi-fs-send-button');
      
      inputField.addEventListener('input', function() {
        sendButton.disabled = !inputField.value.trim();
      });
      
      inputField.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && inputField.value.trim()) {
          sendMessage();
        }
      });
      
      sendButton.addEventListener('click', sendMessage);
      
      console.log('AIPI Fullscreen Widget: Widget created successfully');
    } catch (error) {
      console.error('AIPI Fullscreen Widget Error:', error);
    }
  }
  
  // Open chat
  function openChat() {
    console.log('AIPI Fullscreen Widget: Opening chat...');
    try {
      // Ocultar el botón
      if (widgetButton) {
        widgetButton.style.display = 'none';
        
        // También ocultar el contenedor
        const container = document.getElementById('aipi-fs-container');
        if (container) {
          container.style.display = 'none';
        }
      }
      
      // Mostrar el panel de chat
      if (chatPanel) {
        chatPanel.style.display = 'flex';
      }
      
      isOpen = true;
      
      // Start conversation if not already started
      if (!conversationStarted) {
        startConversation();
      }
      
      // Focus input
      setTimeout(function() {
        const inputField = document.getElementById('aipi-fs-input');
        if (inputField) {
          inputField.focus();
        }
      }, 300);
      
      console.log('AIPI Fullscreen Widget: Chat opened successfully');
    } catch (error) {
      console.error('AIPI Fullscreen Widget Error:', error);
      alert('Error al abrir el chat: ' + error.message);
    }
  }
  
  // Close chat
  function closeChat() {
    console.log('AIPI Fullscreen Widget: Closing chat...');
    try {
      // Asegurar que el panel se oculta correctamente
      if (chatPanel) {
        chatPanel.style.display = 'none';
      }
      
      // Asegurar que el botón se muestra correctamente
      if (widgetButton) {
        widgetButton.style.display = 'flex';
        
        // También asegurar que el contenedor esté visible
        const container = document.getElementById('aipi-fs-container');
        if (container) {
          container.style.display = 'block';
        }
      }
      
      isOpen = false;
      console.log('AIPI Fullscreen Widget: Chat closed successfully');
    } catch (error) {
      console.error('AIPI Fullscreen Widget Error:', error);
      alert('Error al cerrar el chat: ' + error.message);
    }
  }
  
  // Start conversation
  async function startConversation() {
    console.log('AIPI Fullscreen Widget: Starting conversation...');
    try {
      if (!conversationStarted) {
        // Scan page content
        const pageTitle = document.title;
        const pageContent = document.body.innerText.substring(0, 10000); // Limit to 10k chars
        
        // Create a new conversation
        const response = await fetch(`${config.serverUrl}/api/widget/${config.apiKey}/conversation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visitorId: config.visitorId,
            pageContext: {
              title: pageTitle,
              url: window.location.href,
              content: pageContent
            }
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
        console.log('AIPI Fullscreen Widget: Conversation started successfully');
      }
    } catch (error) {
      console.error('AIPI Fullscreen Widget Error:', error);
      addMessage('Sorry, I encountered an error. Please try again later.', 'assistant');
    }
  }
  
  // Send message
  async function sendMessage() {
    const inputField = document.getElementById('aipi-fs-input');
    const message = inputField.value.trim();
    
    if (!message) return;
    
    // Clear input
    inputField.value = '';
    document.getElementById('aipi-fs-send-button').disabled = true;
    
    // Start conversation if not already started
    if (!conversationStarted) {
      await startConversation();
    }
    
    // Add user message to UI
    addMessage(message, 'user');
    
    // Show typing indicator
    showTypingIndicator(true);
    
    try {
      // Send message to server
      const response = await fetch(`${config.serverUrl}/api/widget/${config.apiKey}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: config.conversationId,
          content: message,
          role: 'user'
        }),
      });
      
      // Hide typing indicator
      showTypingIndicator(false);
      
      if (!response.ok) {
        // Show friendly error message in chat
        if (response.status === 500) {
          addMessage("Lo siento, hay un problema temporal con el servicio. Por favor, intenta de nuevo más tarde o contacta con soporte si el problema persiste.", 'assistant');
        } else {
          addMessage("Lo siento, no pude procesar tu mensaje. Por favor, intenta de nuevo.", 'assistant');
        }
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add AI response to UI
      if (data.aiMessage) {
        addMessage(data.aiMessage.content, 'assistant');
      } else {
        addMessage("Recibí tu mensaje, pero no pude generar una respuesta en este momento.", 'assistant');
      }
    } catch (error) {
      console.error('AIPI Fullscreen Widget Error:', error);
      
      // Hide typing indicator if still showing
      showTypingIndicator(false);
    }
  }
  
  // Add message to UI
  function addMessage(content, role) {
    const messagesContainer = document.getElementById('aipi-fs-messages-container');
    const messageElement = document.createElement('div');
    
    messageElement.className = `aipi-fs-message aipi-fs-${role}-message`;
    messageElement.innerHTML = formatMessage(content);
    
    messagesContainer.appendChild(messageElement);
    
    // Store message
    messages.push({ role, content });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Show typing indicator
  function showTypingIndicator(show) {
    const messagesContainer = document.getElementById('aipi-fs-messages-container');
    let typingIndicator = document.querySelector('.aipi-fs-typing-indicator');
    
    if (show) {
      if (!typingIndicator) {
        typingIndicator = document.createElement('div');
        typingIndicator.className = 'aipi-fs-typing-indicator';
        typingIndicator.innerHTML = `
          <div class="aipi-fs-typing-dot"></div>
          <div class="aipi-fs-typing-dot"></div>
          <div class="aipi-fs-typing-dot"></div>
        `;
        messagesContainer.appendChild(typingIndicator);
      }
    } else {
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Format message with links and line breaks
  function formatMessage(text) {
    if (!text) return '';
    
    // Replace URLs with links
    let formattedText = text.replace(/https?:\/\/[^\s]+/g, function(url) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
    
    // Replace line breaks with <br>
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    return formattedText;
  }
  
  // Helper function to escape HTML
  function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Adjust color shade
  function adjustColor(color, amount) {
    // Convert hex to RGB
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Parse components
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    // Adjust each component
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Convert back to hex
    return '#' + 
      r.toString(16).padStart(2, '0') + 
      g.toString(16).padStart(2, '0') + 
      b.toString(16).padStart(2, '0');
  }
})();