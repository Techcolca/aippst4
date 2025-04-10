/**
 * AIPI Form Button - Botón flotante para formularios AIPI
 * Este script crea un botón flotante que permite acceder a los formularios AIPI desde cualquier página web.
 */
(function() {
  // Configuración por defecto
  const DEFAULT_CONFIG = {
    formId: '',
    text: 'Abrir formulario',
    position: 'bottom-right',
    color: '#4a90e2',
    type: 'modal',
    icon: 'form',
    size: 'medium',
    radius: '4px',
  };
  
  // Obtener configuración del script tag
  const scriptTag = document.getElementById('aipi-form-button');
  if (!scriptTag) {
    console.error('No se pudo encontrar la etiqueta script con ID "aipi-form-button"');
    return;
  }
  
  // Mezclar la configuración predeterminada con los atributos data- del script
  const config = {
    ...DEFAULT_CONFIG,
    formId: scriptTag.getAttribute('data-form-id') || DEFAULT_CONFIG.formId,
    text: scriptTag.getAttribute('data-text') || DEFAULT_CONFIG.text,
    position: scriptTag.getAttribute('data-position') || DEFAULT_CONFIG.position,
    color: scriptTag.getAttribute('data-color') || DEFAULT_CONFIG.color,
    type: scriptTag.getAttribute('data-type') || DEFAULT_CONFIG.type,
    icon: scriptTag.getAttribute('data-icon') || DEFAULT_CONFIG.icon,
    size: scriptTag.getAttribute('data-size') || DEFAULT_CONFIG.size,
    radius: scriptTag.getAttribute('data-radius') || DEFAULT_CONFIG.radius,
  };
  
  // Si no se proporcionó un ID de formulario, mostrar un error
  if (!config.formId) {
    console.error('Se requiere un ID de formulario (data-form-id)');
    return;
  }
  
  // Inicializar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', initialize);
  
  /**
   * Inicializar el botón flotante
   */
  function initialize() {
    addStyles();
    createFloatingButton();
  }
  
  /**
   * Agrega los estilos CSS necesarios para el botón flotante
   */
  function addStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Estilos para el botón flotante AIPI */
      .aipi-form-button {
        position: fixed;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      
      .aipi-form-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
      }
      
      .aipi-form-button svg {
        margin-right: 8px;
      }
      
      /* Tamaños */
      .aipi-form-button.small {
        padding: 6px 12px;
        font-size: 14px;
      }
      
      .aipi-form-button.medium {
        padding: 8px 16px;
        font-size: 16px;
      }
      
      .aipi-form-button.large {
        padding: 12px 24px;
        font-size: 18px;
      }
      
      /* Posiciones */
      .aipi-form-button.bottom-right {
        bottom: 20px;
        right: 20px;
      }
      
      .aipi-form-button.bottom-left {
        bottom: 20px;
        left: 20px;
      }
      
      .aipi-form-button.top-right {
        top: 20px;
        right: 20px;
      }
      
      .aipi-form-button.top-left {
        top: 20px;
        left: 20px;
      }
      
      /* Modal */
      .aipi-form-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        background-color: rgba(0, 0, 0, 0.5);
        align-items: center;
        justify-content: center;
      }
      
      .aipi-form-modal-content {
        background-color: white;
        border-radius: 8px;
        width: 400px; /* Ancho fijo exacto como en la imagen de ejemplo */
        max-width: 400px; /* Limitado para asegurar tamaño consistente */
        height: auto;
        min-height: 300px; /* Reducida para mostrar solo dos campos */
        max-height: 350px; /* Limitada para evitar espacio en blanco */
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        position: relative;
        overflow: hidden; /* Sin scroll para evitar controles adicionales */
        display: flex;
        flex-direction: column;
      }
      
      /* Removido el botón de cierre flotante ya que ahora usamos uno en el header */
      
      /* Panel deslizante */
      .aipi-form-slidein {
        display: none;
        position: fixed;
        top: 0;
        right: 0;
        width: 100%;
        max-width: 400px;
        height: 100%;
        z-index: 10000;
        box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
      }
      
      .aipi-form-slidein.active {
        transform: translateX(0);
      }
      
      .aipi-form-slidein-content {
        background-color: white;
        width: 100%;
        height: 100%;
        overflow: auto;
        position: relative;
      }
      
      .aipi-form-slidein-close {
        position: fixed;
        top: 10px;
        right: 10px;
        width: 32px;
        height: 32px;
        background: rgba(0, 0, 0, 0.15);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10001;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }
      
      .aipi-form-slidein-close:hover {
        background: rgba(0, 0, 0, 0.25);
      }
      
      .aipi-form-slidein-header {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        padding: 10px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 1;
      }
      
      .aipi-form-slidein-title {
        font-weight: bold;
        font-size: 16px;
        margin: 0;
      }
      
      /* Iframe */
      .aipi-form-iframe {
        width: 100%;
        height: 100%;
        min-height: 350px; /* Altura ajustada para el modal */
        flex: 1; /* Toma el espacio disponible restante */
        border: none;
        display: block;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  /**
   * Crea y agrega el botón flotante al DOM
   */
  function createFloatingButton() {
    const button = document.createElement('button');
    button.className = `aipi-form-button ${config.position} ${config.size}`;
    button.style.backgroundColor = config.color;
    button.style.color = scriptTag.getAttribute('data-text-color') || '#FFFFFF';
    button.style.borderRadius = config.radius;
    
    // Agregar ícono si se especificó
    if (config.icon && config.icon !== 'none') {
      button.innerHTML = getIconSvg(config.icon) + config.text;
    } else {
      button.textContent = config.text;
    }
    
    // Agregar evento de clic
    button.addEventListener('click', showForm);
    
    // Agregar al DOM
    document.body.appendChild(button);
  }
  
  /**
   * Obtiene el SVG para el ícono especificado
   */
  function getIconSvg(icon) {
    const icons = {
      form: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="13" y2="17"></line></svg>',
      contact: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
      order: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
      survey: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polygon points="10 9 9 9 8 9 9 9"></polygon></svg>',
    };
    
    return icons[icon] || '';
  }
  
  /**
   * Muestra el formulario según el tipo de visualización configurado
   */
  function showForm() {
    switch (config.type) {
      case 'modal':
        showModalForm();
        break;
      case 'slidein':
        showSlideInForm();
        break;
      case 'redirect':
        // Comprobar si es posible abrir en una nueva pestaña
        if (window.confirm('Se abrirá el formulario en una nueva ventana. ¿Continuar?')) {
          // Intentar abrir en nueva pestaña primero (puede ser bloqueado por el navegador)
          const newWindow = window.open(getFormUrl(), '_blank');
          
          // Si fue bloqueado o falló, redirigir en la misma ventana
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            window.location.href = getFormUrl();
          }
        }
        break;
      default:
        showModalForm();
    }
  }
  
  /**
   * Obtiene la URL del formulario
   */
  function getFormUrl() {
    // Obtener el origen del script para construir la URL completa
    const scriptSrc = scriptTag.src;
    const origin = new URL(scriptSrc).origin;
    return `${origin}/forms/${config.formId}/view`;
  }
  
  /**
   * Muestra el formulario en una ventana modal
   */
  function showModalForm() {
    // Crear el contenedor modal si no existe
    let modal = document.querySelector('.aipi-form-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'aipi-form-modal';
      modal.style.display = 'none';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.zIndex = '10000';
      modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      
      const modalContent = document.createElement('div');
      modalContent.style.backgroundColor = 'white';
      modalContent.style.borderRadius = '8px';
      modalContent.style.width = '500px'; // Mayor ancho para acomodar todos los campos
      modalContent.style.maxWidth = '96%'; // Respuesta en dispositivos pequeños
      modalContent.style.minHeight = '600px'; // Altura considerable para mostrar todos los campos
      modalContent.style.maxHeight = '90vh'; // Limitar altura para pantallas pequeñas
      modalContent.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
      modalContent.style.display = 'flex';
      modalContent.style.flexDirection = 'column';
      modalContent.style.overflow = 'visible'; // Permitir que se vea todo el contenido
      
      // Header para mejor experiencia visual
      const modalHeader = document.createElement('div');
      modalHeader.style.padding = '15px';
      modalHeader.style.display = 'flex';
      modalHeader.style.justifyContent = 'space-between'; // Título a la izquierda, botón a la derecha
      modalHeader.style.alignItems = 'center';
      modalHeader.style.borderBottom = '1px solid #e9ecef';
      modalHeader.style.backgroundColor = '#f8f9fa';
      modalHeader.style.borderTopLeftRadius = '8px';
      modalHeader.style.borderTopRightRadius = '8px';
      
      const modalTitle = document.createElement('h3');
      modalTitle.style.margin = '0';
      modalTitle.style.fontSize = '16px';
      modalTitle.style.fontWeight = 'bold';
      modalTitle.textContent = config.text || 'Formulario';
      
      const headerCloseButton = document.createElement('button');
      headerCloseButton.style.background = 'none';
      headerCloseButton.style.border = 'none';
      headerCloseButton.style.cursor = 'pointer';
      headerCloseButton.style.padding = '5px';
      headerCloseButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      headerCloseButton.addEventListener('click', closeModal);
      
      modalHeader.appendChild(modalTitle);
      modalHeader.appendChild(headerCloseButton);
      
      // Container para el iframe con dimensiones mayores
      const iframeContainer = document.createElement('div');
      iframeContainer.style.flex = '1';
      iframeContainer.style.overflow = 'auto'; // Scroll si es necesario
      
      const iframe = document.createElement('iframe');
      iframe.src = getFormUrl();
      iframe.style.width = '100%';
      iframe.style.height = '550px'; // Altura mayor para mostrar todos los campos
      iframe.style.border = 'none';
      iframe.style.display = 'block';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowtransparency', 'true');
      
      iframeContainer.appendChild(iframe);
      
      modalContent.appendChild(modalHeader);
      modalContent.appendChild(iframeContainer);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      
      // Cerrar modal al hacer clic fuera
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          closeModal();
        }
      });
    }
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }
  
  /**
   * Muestra el formulario en un panel deslizante
   */
  function showSlideInForm() {
    // Crear el panel deslizante si no existe
    let slideIn = document.querySelector('.aipi-form-slidein');
    if (!slideIn) {
      slideIn = document.createElement('div');
      slideIn.className = 'aipi-form-slidein';
      
      const slideInContent = document.createElement('div');
      slideInContent.className = 'aipi-form-slidein-content';
      
      // Agregar header para mejor experiencia visual
      const slideInHeader = document.createElement('div');
      slideInHeader.className = 'aipi-form-slidein-header';
      
      const slideInTitle = document.createElement('h3');
      slideInTitle.className = 'aipi-form-slidein-title';
      slideInTitle.textContent = config.text || 'Formulario';
      
      const headerCloseButton = document.createElement('button');
      headerCloseButton.style.background = 'none';
      headerCloseButton.style.border = 'none';
      headerCloseButton.style.cursor = 'pointer';
      headerCloseButton.style.padding = '5px';
      headerCloseButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      headerCloseButton.addEventListener('click', closeSlideIn);
      
      slideInHeader.appendChild(slideInTitle);
      slideInHeader.appendChild(headerCloseButton);
      
      // Botón de cierre adicional (más visible)
      const closeButton = document.createElement('div');
      closeButton.className = 'aipi-form-slidein-close';
      closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      closeButton.addEventListener('click', closeSlideIn);
      
      const iframe = document.createElement('iframe');
      iframe.className = 'aipi-form-iframe';
      iframe.src = getFormUrl();
      iframe.style.height = '100%';
      iframe.style.width = '100%';
      iframe.style.minHeight = '600px'; /* Mantenemos esta altura para el panel deslizante */
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowtransparency', 'true');
      
      slideInContent.appendChild(slideInHeader);
      slideInContent.appendChild(iframe);
      slideIn.appendChild(slideInContent);
      slideIn.appendChild(closeButton); // Botón flotante fuera del contenido
      document.body.appendChild(slideIn);
    }
    
    // Mostrar panel deslizante
    slideIn.style.display = 'block';
    setTimeout(() => {
      slideIn.classList.add('active');
    }, 10);
    
    function closeSlideIn() {
      slideIn.classList.remove('active');
      setTimeout(() => {
        slideIn.style.display = 'none';
      }, 300);
    }
  }
})();