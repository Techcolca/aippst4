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
    // Estilos base para el formulario
    const styles = `
      .aipi-form {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        max-width: 600px;
        margin: 0 auto;
      }
      .aipi-form-title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #111827;
      }
      .aipi-form-description {
        font-size: 16px;
        margin-bottom: 24px;
        color: #4B5563;
      }
      .aipi-form-field {
        margin-bottom: 20px;
      }
      .aipi-form-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 8px;
        color: #374151;
      }
      .aipi-form-input,
      .aipi-form-textarea,
      .aipi-form-select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #D1D5DB;
        border-radius: 6px;
        font-size: 16px;
        transition: border-color 0.15s ease;
      }
      .aipi-form-input:focus,
      .aipi-form-textarea:focus,
      .aipi-form-select:focus {
        outline: none;
        border-color: #2563EB;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
      .aipi-form-submit {
        background-color: ${formData.buttonColor || '#2563EB'};
        color: white;
        font-size: 16px;
        font-weight: 500;
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.15s ease;
      }
      .aipi-form-submit:hover {
        background-color: ${adjustColor(formData.buttonColor || '#2563EB', -15)};
      }
      .aipi-form-required {
        color: #DC2626;
        margin-left: 4px;
      }
      .aipi-form-error {
        color: #DC2626;
        font-size: 14px;
        margin-top: 4px;
      }
      .aipi-form-success {
        background-color: #ECFDF5;
        color: #065F46;
        padding: 16px;
        border-radius: 6px;
        margin-top: 20px;
        text-align: center;
      }
    `;
    
    // Crear la estructura HTML del formulario
    let html = `
      <style>${styles}</style>
      <div class="aipi-form">
        <h2 class="aipi-form-title">${escapeHTML(formData.title)}</h2>
        ${formData.description ? `<p class="aipi-form-description">${escapeHTML(formData.description)}</p>` : ''}
        <form id="aipi-form-${formData.id}" class="aipi-form-inner">
    `;
    
    // Agregar campos del formulario
    formData.fields.forEach(field => {
      html += `<div class="aipi-form-field">`;
      
      // Etiqueta del campo
      html += `<label class="aipi-form-label" for="aipi-field-${field.id}">
        ${escapeHTML(field.label)}
        ${field.required ? '<span class="aipi-form-required">*</span>' : ''}
      </label>`;
      
      // Campo de entrada según el tipo
      switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
        case 'number':
          html += `<input 
            type="${field.type === 'phone' ? 'tel' : field.type}" 
            id="aipi-field-${field.id}" 
            name="${field.name || field.id}" 
            class="aipi-form-input" 
            ${field.placeholder ? `placeholder="${escapeHTML(field.placeholder)}"` : ''} 
            ${field.required ? 'required' : ''}
          >`;
          break;
          
        case 'textarea':
          html += `<textarea 
            id="aipi-field-${field.id}" 
            name="${field.name || field.id}" 
            class="aipi-form-textarea" 
            rows="4"
            ${field.placeholder ? `placeholder="${escapeHTML(field.placeholder)}"` : ''} 
            ${field.required ? 'required' : ''}
          ></textarea>`;
          break;
          
        case 'select':
          html += `<select 
            id="aipi-field-${field.id}" 
            name="${field.name || field.id}" 
            class="aipi-form-select"
            ${field.required ? 'required' : ''}
          >`;
          
          // Opción vacía predeterminada
          html += `<option value="">${field.placeholder || 'Seleccionar...'}</option>`;
          
          // Opciones del select
          if (field.options && Array.isArray(field.options)) {
            field.options.forEach(option => {
              html += `<option value="${escapeHTML(option.value || option)}">${escapeHTML(option.label || option)}</option>`;
            });
          }
          
          html += `</select>`;
          break;
          
        case 'checkbox':
          html += `<div class="aipi-form-checkbox">
            <input 
              type="checkbox" 
              id="aipi-field-${field.id}" 
              name="${field.name || field.id}" 
              ${field.required ? 'required' : ''}
            >
            <label for="aipi-field-${field.id}">${escapeHTML(field.label)}</label>
          </div>`;
          break;
      }
      
      // Contenedor para mensajes de error
      html += `<div id="aipi-error-${field.id}" class="aipi-form-error"></div>`;
      
      html += `</div>`;
    });
    
    // Botón de envío
    html += `
        <button type="submit" class="aipi-form-submit">${formData.submitButtonText || 'Enviar'}</button>
        <div id="aipi-form-response" class="aipi-form-response"></div>
      </form>
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
            submission[field.name || field.id] = element.checked;
            break;
          default:
            submission[field.name || field.id] = element.value;
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