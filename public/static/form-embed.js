/**
 * AIPI Form Embed Script
 * Este script permite incrustar formularios de AIPI en cualquier sitio web.
 */

(function() {
  // Configuración
  const containerId = "aipi-form-container";
  
  // Obtener el ID del formulario desde la URL del script
  function getFormId() {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const url = new URL(currentScript.src);
    return url.searchParams.get('id');
  }
  
  // Construir la URL del API
  function getApiUrl(formId) {
    // Usar la misma base URL que el script
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const scriptUrl = new URL(currentScript.src);
    const baseUrl = `${scriptUrl.protocol}//${scriptUrl.host}`;
    return `${baseUrl}/api/forms/public/${formId}`;
  }
  
  // Cargar el formulario
  async function loadForm() {
    const formId = getFormId();
    
    if (!formId) {
      console.error('AIPI Form: No se especificó ID de formulario');
      return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`AIPI Form: No se encontró el contenedor con ID '${containerId}'`);
      return;
    }
    
    try {
      // Mostrar indicador de carga
      container.innerHTML = '<div style="text-align: center; padding: 20px;">Cargando formulario...</div>';
      
      // Obtener datos del formulario
      const response = await fetch(getApiUrl(formId));
      
      if (!response.ok) {
        throw new Error(`Error al cargar el formulario (${response.status}): ${response.statusText}`);
      }
      
      const formData = await response.json();
      
      // Crear el formulario HTML
      renderForm(container, formData);
      
    } catch (error) {
      console.error('AIPI Form:', error);
      container.innerHTML = `
        <div style="border: 1px solid #ff5555; background-color: #ffeeee; color: #cc0000; padding: 15px; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold;">Error al cargar el formulario</p>
          <p style="margin: 5px 0 0;">Por favor, verifica el ID del formulario y tu conexión a internet.</p>
        </div>
      `;
    }
  }
  
  // Renderizar el formulario en el contenedor
  function renderForm(container, formData) {
    // Estilos base para el formulario con diseño moderno de dos columnas
    const styles = `
      .aipi-form-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        background: linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
      }
      .aipi-form-card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        max-width: 900px;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-height: 600px;
      }
      .aipi-form-hero {
        background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
        padding: 60px 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }
      .aipi-form-hero::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2300f5a0;stop-opacity:0.1" /><stop offset="100%" style="stop-color:%2300d9f5;stop-opacity:0.2" /></linearGradient></defs><polygon fill="url(%23grad)" points="0,0 100,0 80,100 0,100"/></svg>') no-repeat center;
        background-size: cover;
        opacity: 0.3;
      }
      .aipi-form-hero-content {
        position: relative;
        z-index: 1;
      }
      .aipi-form-hero h2 {
        color: white;
        font-size: 2.5rem;
        font-weight: 700;
        line-height: 1.2;
        margin: 0 0 20px 0;
      }
      .aipi-form-hero p {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.1rem;
        line-height: 1.6;
        margin: 0;
      }
      .aipi-form-content {
        padding: 60px 40px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .aipi-form-header {
        margin-bottom: 30px;
      }
      .aipi-form-subtitle {
        font-size: 1.1rem;
        color: #374151;
        margin: 0;
        font-weight: 400;
      }
      .aipi-form-field {
        margin-bottom: 24px;
      }
      .aipi-form-field-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 24px;
      }
      .aipi-form-input,
      .aipi-form-textarea,
      .aipi-form-select {
        width: 100%;
        padding: 16px 0 8px 0;
        border: none;
        border-bottom: 2px solid #e5e7eb;
        font-size: 16px;
        background: transparent;
        color: #111827;
        outline: none;
        transition: border-color 0.3s ease;
        box-sizing: border-box;
      }
      .aipi-form-input:focus,
      .aipi-form-textarea:focus,
      .aipi-form-select:focus {
        border-bottom-color: #00d9f5;
      }
      .aipi-form-input::placeholder,
      .aipi-form-textarea::placeholder {
        color: #9ca3af;
        font-size: 16px;
      }
      .aipi-form-select {
        cursor: pointer;
        appearance: none;
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%239ca3af"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>');
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
        padding-right: 32px;
      }
      .aipi-form-submit {
        background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
        color: white;
        font-size: 16px;
        font-weight: 600;
        padding: 16px 32px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        margin-top: 20px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .aipi-form-submit:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(30, 58, 138, 0.3);
      }
      .aipi-form-submit:active {
        transform: translateY(0);
      }
      .aipi-form-checkbox-field {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 20px 0;
      }
      .aipi-form-checkbox {
        width: 20px;
        height: 20px;
        accent-color: #00d9f5;
      }
      .aipi-form-checkbox-label {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.4;
      }
      .aipi-form-error {
        color: #ef4444;
        font-size: 14px;
        margin-top: 8px;
      }
      .aipi-form-success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 24px;
        border-radius: 12px;
        text-align: center;
        font-weight: 500;
      }
      
      @media (max-width: 768px) {
        .aipi-form-container {
          padding: 10px;
          min-height: 100vh;
        }
        .aipi-form-card {
          grid-template-columns: 1fr;
          min-height: auto;
        }
        .aipi-form-hero {
          padding: 40px 30px;
          min-height: 200px;
        }
        .aipi-form-hero h2 {
          font-size: 2rem;
        }
        .aipi-form-content {
          padding: 40px 30px;
        }
        .aipi-form-field-group {
          grid-template-columns: 1fr;
        }
      }
    `;
    
    // Crear la estructura HTML del formulario con diseño moderno
    let html = `
      <style>${styles}</style>
      <div class="aipi-form-container">
        <div class="aipi-form-card">
          <div class="aipi-form-hero">
            <div class="aipi-form-hero-content">
              <h2>${escapeHTML(formData.title)}</h2>
              <p>${formData.description ? escapeHTML(formData.description) : 'Complete este formulario para continuar'}</p>
            </div>
          </div>
          <div class="aipi-form-content">
            <div class="aipi-form-header">
              <p class="aipi-form-subtitle">Por favor complete la información solicitada para comenzar.</p>
            </div>
            <form id="aipi-form-${formData.id}" class="aipi-form-inner">
    `;
    
    // Si no hay campos definidos, usar campos de ejemplo modernos
    if (!formData.fields || formData.fields.length === 0) {
      html += `
        <div class="aipi-form-field-group">
          <div class="aipi-form-field">
            <input type="text" name="nombre" class="aipi-form-input" placeholder="Nombre *" required>
          </div>
          <div class="aipi-form-field">
            <input type="text" name="apellido" class="aipi-form-input" placeholder="Apellido *" required>
          </div>
        </div>
        <div class="aipi-form-field">
          <input type="email" name="email" class="aipi-form-input" placeholder="Correo Electrónico *" required>
        </div>
        <div class="aipi-form-checkbox-field">
          <input type="checkbox" id="terms-default" class="aipi-form-checkbox" required>
          <label for="terms-default" class="aipi-form-checkbox-label">
            Acepto los términos y condiciones
          </label>
        </div>
      `;
    } else {
      // Renderizar campos con layout inteligente como en la vista previa
      let currentGroup = [];
      
      for (let i = 0; i < formData.fields.length; i++) {
      const field = formData.fields[i];
      
      // Los campos de texto cortos se agrupan en dos columnas
      if ((field.type === 'text' || field.type === 'email') && currentGroup.length < 2) {
        currentGroup.push(field);
        
        // Si completamos el grupo o es el último campo
        if (currentGroup.length === 2 || i === formData.fields.length - 1) {
          if (currentGroup.length === 2) {
            html += `<div class="aipi-form-field-group">`;
            currentGroup.forEach(f => {
              html += `<div class="aipi-form-field">`;
              html += renderField(f);
              html += `</div>`;
            });
            html += `</div>`;
          } else {
            // Campo único
            html += `<div class="aipi-form-field">`;
            html += renderField(currentGroup[0]);
            html += `</div>`;
          }
          currentGroup = [];
        }
      } else {
        // Campos que ocupan toda la fila (textarea, select, checkbox)
        if (currentGroup.length > 0) {
          // Primero renderizar cualquier campo pendiente
          html += `<div class="aipi-form-field">`;
          html += renderField(currentGroup[0]);
          html += `</div>`;
          currentGroup = [];
        }
        
        html += `<div class="aipi-form-field">`;
        html += renderField(field);
        html += `</div>`;
      }
    }
    
    // Función auxiliar para renderizar un campo individual
    function renderField(field) {
      let fieldHtml = '';
      
      // Campo de entrada según el tipo
      switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
        case 'number':
          fieldHtml = `<input 
            type="${field.type === 'phone' ? 'tel' : field.type}" 
            id="aipi-field-${field.id}" 
            name="${field.id}" 
            class="aipi-form-input" 
            placeholder="${escapeHTML(field.label)}${field.required ? ' *' : ''}"
            ${field.required ? 'required' : ''}
          >`;
          break;
          
        case 'textarea':
          fieldHtml = `<textarea 
            id="aipi-field-${field.id}" 
            name="${field.id}" 
            class="aipi-form-textarea" 
            rows="4"
            placeholder="${escapeHTML(field.label)}${field.required ? ' *' : ''}"
            ${field.required ? 'required' : ''}
          ></textarea>`;
          break;
          
        case 'select':
          fieldHtml = `<select 
            id="aipi-field-${field.id}" 
            name="${field.id}" 
            class="aipi-form-select"
            ${field.required ? 'required' : ''}
          >`;
          
          // Opción vacía predeterminada
          fieldHtml += `<option value="">${field.placeholder || field.label || 'Seleccionar...'}</option>`;
          
          // Opciones del select
          if (field.options && Array.isArray(field.options)) {
            field.options.forEach(option => {
              fieldHtml += `<option value="${escapeHTML(option.value || option)}">${escapeHTML(option.label || option)}</option>`;
            });
          }
          
          fieldHtml += `</select>`;
          break;
          
        case 'checkbox':
          fieldHtml = `<div class="aipi-form-checkbox-field">
            <input 
              type="checkbox" 
              id="aipi-field-${field.id}" 
              name="${field.id}" 
              class="aipi-form-checkbox"
              ${field.required ? 'required' : ''}
            >
            <label for="aipi-field-${field.id}" class="aipi-form-checkbox-label">${escapeHTML(field.label)}</label>
          </div>`;
          break;
      }
      
      return fieldHtml;
    }
    
    // Solo agregar términos y condiciones si no hay un campo checkbox específico
    const hasCheckboxField = formData.fields.some(field => field.type === 'checkbox');
    if (!hasCheckboxField && formData.fields.length > 0) {
      html += `
        <div class="aipi-form-checkbox-field">
          <input type="checkbox" id="terms-checkbox" class="aipi-form-checkbox" required>
          <label for="terms-checkbox" class="aipi-form-checkbox-label">
            Acepto los términos y condiciones
          </label>
        </div>
      `;
    }
    
    // Botón de envío
    html += `
              <button type="submit" class="aipi-form-submit">${formData.submitButtonText || 'ENVIAR'}</button>
              <div id="aipi-form-response"></div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Agregar evento de envío del formulario
    const form = document.getElementById(`aipi-form-${formData.id}`);
    if (form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        submitForm(form, formData);
      });
    }
  }
  
  // Ajustar color (aclarar u oscurecer)
  function adjustColor(color, amount) {
    return color;  // Implementación simple - en una versión real habría que hacerlo correctamente
  }
  
  // Enviar el formulario
  async function submitForm(form, formData) {
    // Validar formulario
    if (!validateForm(form, formData)) {
      return;
    }
    
    // Recolectar datos del formulario
    const formElements = form.elements;
    const submission = {};
    
    formData.fields.forEach(field => {
      const element = document.getElementById(`aipi-field-${field.id}`);
      if (element) {
        switch (field.type) {
          case 'checkbox':
            submission[field.id] = element.checked;
            break;
          default:
            submission[field.id] = element.value;
        }
      }
      }
    });
    
    // Preparar el envío
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;
    
    const responseContainer = document.getElementById('aipi-form-response');
    responseContainer.className = 'aipi-form-response';
    responseContainer.textContent = '';
    
    try {
      // Enviar la data al servidor
      const response = await fetch(`${getApiUrl(formData.id)}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: submission })
      });
      
      // Manejar respuesta
      if (response.ok) {
        // Mostrar mensaje de éxito
        form.reset();
        responseContainer.className = 'aipi-form-success';
        responseContainer.textContent = formData.successMessage || '¡Gracias! Hemos recibido tu formulario.';
        
        // Redireccionar si se especifica una URL de éxito
        if (formData.successUrl) {
          setTimeout(() => {
            window.location.href = formData.successUrl;
          }, 1500);
        }
      } else {
        // Mostrar error de envío
        const errorData = await response.json();
        responseContainer.className = 'aipi-form-error';
        responseContainer.textContent = errorData.message || 'Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.';
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      responseContainer.className = 'aipi-form-error';
      responseContainer.textContent = 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
    } finally {
      // Restaurar botón
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  }
  
  // Validar el formulario
  function validateForm(form, formData) {
    let isValid = true;
    
    // Limpiar errores previos
    const errorElements = form.querySelectorAll('.aipi-form-error');
    errorElements.forEach(el => {
      el.textContent = '';
    });
    
    // Validar cada campo
    formData.fields.forEach(field => {
      const element = document.getElementById(`aipi-field-${field.id}`);
      const errorElement = document.getElementById(`aipi-error-${field.id}`);
      
      if (!element || !errorElement) return;
      
      let fieldValid = true;
      const value = element.type === 'checkbox' ? element.checked : element.value;
      
      // Validar campo requerido
      if (field.required && !value) {
        errorElement.textContent = 'Este campo es obligatorio.';
        fieldValid = false;
      }
      
      // Validaciones específicas por tipo
      if (value && fieldValid) {
        switch (field.type) {
          case 'email':
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
              errorElement.textContent = 'Por favor, ingresa un correo electrónico válido.';
              fieldValid = false;
            }
            break;
            
          case 'phone':
            const phonePattern = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
            if (!phonePattern.test(value)) {
              errorElement.textContent = 'Por favor, ingresa un número de teléfono válido.';
              fieldValid = false;
            }
            break;
            
          case 'number':
            if (isNaN(value)) {
              errorElement.textContent = 'Por favor, ingresa un número válido.';
              fieldValid = false;
            }
            break;
        }
      }
      
      if (!fieldValid) {
        isValid = false;
        element.focus();
      }
    });
    
    return isValid;
  }
  
  // Escapar HTML para prevenir XSS
  function escapeHTML(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  // Inicializar cuando el DOM esté listo
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadForm);
    } else {
      loadForm();
    }
  }
  
  // Comenzar
  init();
})();