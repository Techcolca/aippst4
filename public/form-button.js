/**
 * AIPI Form Button - Botón flotante para formularios AIPI
 * Este script crea un botón flotante que permite acceder a los formularios AIPI desde cualquier página web.
 */
(function() {
  // Obtener referencias al script
  const scripts = document.querySelectorAll('script[id^="aipi-form-button"]');
  if (!scripts.length) return;
  
  // Usamos el primer script encontrado
  const script = scripts[0];
  
  // Obtener los atributos de configuración
  const formId = script.getAttribute('data-form-id');
  if (!formId) {
    console.error('AIPI Form Button: No se ha especificado un ID de formulario (data-form-id)');
    return;
  }
  
  // Opciones de configuración con valores predeterminados
  const buttonText = script.getAttribute('data-text') || 'Abrir formulario';
  const position = script.getAttribute('data-position') || 'bottom-right';
  const color = script.getAttribute('data-color') || '#4a90e2';
  const displayType = script.getAttribute('data-type') || 'modal';
  const icon = script.getAttribute('data-icon') || 'form';
  const size = script.getAttribute('data-size') || 'medium';
  const borderRadius = script.getAttribute('data-radius') || '4px';
  
  // Obtener la URL base del script para construir las URLs correctamente
  const scriptUrl = script.src;
  const baseUrl = scriptUrl.substring(0, scriptUrl.lastIndexOf('/'));
  const domain = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
  
  // Agregar estilos CSS
  addStyles();
  
  // Crear y agregar el botón flotante al DOM
  createFloatingButton();
  
  /**
   * Agrega los estilos CSS necesarios para el botón flotante
   */
  function addStyles() {
    const css = `
      .aipi-form-button {
        position: fixed;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: ${size === 'small' ? '8px 16px' : size === 'large' ? '12px 24px' : '10px 20px'};
        background-color: ${color};
        color: white;
        border: none;
        border-radius: ${borderRadius};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: ${size === 'small' ? '14px' : size === 'large' ? '18px' : '16px'};
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        text-decoration: none;
        outline: none;
      }
      
      .aipi-form-button:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        filter: brightness(1.05);
      }
      
      .aipi-form-button-icon {
        margin-right: 8px;
        width: ${size === 'small' ? '14px' : size === 'large' ? '20px' : '16px'};
        height: ${size === 'small' ? '14px' : size === 'large' ? '20px' : '16px'};
      }
      
      .aipi-form-button.top-left {
        top: 20px;
        left: 20px;
      }
      
      .aipi-form-button.top-right {
        top: 20px;
        right: 20px;
      }
      
      .aipi-form-button.bottom-left {
        bottom: 20px;
        left: 20px;
      }
      
      .aipi-form-button.bottom-right {
        bottom: 20px;
        right: 20px;
      }
      
      .aipi-form-modal {
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.5);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .aipi-form-modal.active {
        display: block;
        opacity: 1;
      }
      
      .aipi-form-modal-content {
        background-color: #fff;
        margin: 50px auto;
        padding: 0;
        width: 90%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        position: relative;
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.3s ease;
      }
      
      .aipi-form-modal.active .aipi-form-modal-content {
        transform: translateY(0);
        opacity: 1;
      }
      
      .aipi-form-modal-close {
        position: absolute;
        right: 15px;
        top: 15px;
        color: #aaa;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1;
        line-height: 1;
      }
      
      .aipi-form-modal-close:hover {
        color: #555;
      }
      
      .aipi-form-modal-iframe {
        width: 100%;
        height: calc(100vh - 100px);
        max-height: 90vh;
        border: none;
        display: block;
      }
      
      .aipi-form-slidein {
        position: fixed;
        z-index: 10000;
        width: 400px;
        max-width: 90%;
        height: 100%;
        top: 0;
        background-color: #fff;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        transition: transform 0.4s ease;
        overflow-y: auto;
      }
      
      .aipi-form-slidein.right {
        right: 0;
        transform: translateX(100%);
      }
      
      .aipi-form-slidein.left {
        left: 0;
        transform: translateX(-100%);
      }
      
      .aipi-form-slidein.active {
        transform: translateX(0);
      }
      
      .aipi-form-slidein-close {
        position: absolute;
        right: 15px;
        top: 15px;
        color: #aaa;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1;
      }
      
      .aipi-form-slidein-close:hover {
        color: #555;
      }
      
      .aipi-form-slidein-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
      
      .aipi-form-overlay {
        display: none;
        position: fixed;
        z-index: 9999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .aipi-form-overlay.active {
        display: block;
        opacity: 1;
      }
      
      @media (max-width: 768px) {
        .aipi-form-modal-content {
          width: 95%;
          margin: 30px auto;
        }
        
        .aipi-form-slidein {
          width: 320px;
        }
      }
    `;
    
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }
  
  /**
   * Crea y agrega el botón flotante al DOM
   */
  function createFloatingButton() {
    const button = document.createElement('button');
    button.className = `aipi-form-button ${position}`;
    button.setAttribute('aria-label', buttonText);
    
    // Agregar ícono si está especificado
    if (icon && icon !== 'none') {
      const iconSvg = getIconSvg(icon);
      if (iconSvg) {
        const iconElement = document.createElement('span');
        iconElement.className = 'aipi-form-button-icon';
        iconElement.innerHTML = iconSvg;
        button.appendChild(iconElement);
      }
    }
    
    // Agregar texto del botón
    const textNode = document.createTextNode(buttonText);
    button.appendChild(textNode);
    
    // Manejar el clic en el botón
    button.addEventListener('click', function(event) {
      event.preventDefault();
      showForm();
    });
    
    // Agregar botón al DOM
    document.body.appendChild(button);
  }
  
  /**
   * Obtiene el SVG para el ícono especificado
   */
  function getIconSvg(icon) {
    const icons = {
      form: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="13" y2="17"></line></svg>',
      contact: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
      order: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
      survey: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13h6"></path><path d="M9 17h6"></path><path d="M11 9h1"></path></svg>'
    };
    
    return icons[icon] || null;
  }
  
  /**
   * Muestra el formulario según el tipo de visualización configurado
   */
  function showForm() {
    switch(displayType) {
      case 'modal':
        showModalForm();
        break;
      case 'slidein':
        showSlideInForm();
        break;
      case 'redirect':
      default:
        // Redirigir a la URL del formulario
        window.location.href = `${domain}/forms/${formId}/view`;
        break;
    }
  }
  
  /**
   * Muestra el formulario en una ventana modal
   */
  function showModalForm() {
    // Crear el contenedor modal si no existe
    let modal = document.getElementById('aipi-form-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'aipi-form-modal';
      modal.className = 'aipi-form-modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'aipi-form-modal-content';
      
      const closeButton = document.createElement('span');
      closeButton.className = 'aipi-form-modal-close';
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', closeModal);
      
      const iframe = document.createElement('iframe');
      iframe.className = 'aipi-form-modal-iframe';
      iframe.src = `${domain}/forms/${formId}/embed`;
      iframe.title = buttonText;
      iframe.setAttribute('allowfullscreen', 'true');
      
      modalContent.appendChild(closeButton);
      modalContent.appendChild(iframe);
      modal.appendChild(modalContent);
      
      // Cerrar modal al hacer clic fuera del contenido
      modal.addEventListener('click', function(event) {
        if (event.target === modal) {
          closeModal();
        }
      });
      
      document.body.appendChild(modal);
    }
    
    // Mostrar el modal con animación
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    function closeModal() {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    }
  }
  
  /**
   * Muestra el formulario en un panel deslizante
   */
  function showSlideInForm() {
    // Determinar el lado desde donde se desliza
    const slideDirection = position.includes('right') ? 'left' : 'right';
    
    // Crear el panel deslizante si no existe
    let slidein = document.getElementById('aipi-form-slidein');
    let overlay = document.getElementById('aipi-form-overlay');
    
    if (!slidein) {
      // Crear overlay
      overlay = document.createElement('div');
      overlay.id = 'aipi-form-overlay';
      overlay.className = 'aipi-form-overlay';
      overlay.addEventListener('click', closeSlideIn);
      document.body.appendChild(overlay);
      
      // Crear panel deslizante
      slidein = document.createElement('div');
      slidein.id = 'aipi-form-slidein';
      slidein.className = `aipi-form-slidein ${slideDirection}`;
      
      const closeButton = document.createElement('span');
      closeButton.className = 'aipi-form-slidein-close';
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', closeSlideIn);
      
      const iframe = document.createElement('iframe');
      iframe.className = 'aipi-form-slidein-iframe';
      iframe.src = `${domain}/forms/${formId}/embed`;
      iframe.title = buttonText;
      iframe.setAttribute('allowfullscreen', 'true');
      
      slidein.appendChild(closeButton);
      slidein.appendChild(iframe);
      document.body.appendChild(slidein);
    }
    
    // Mostrar el panel deslizante con animación
    overlay.style.display = 'block';
    setTimeout(() => {
      overlay.classList.add('active');
      slidein.classList.add('active');
    }, 10);
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    function closeSlideIn() {
      slidein.classList.remove('active');
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    }
  }
})();