/**
 * AIPI Form Embed Script - Diseño Moderno de Dos Columnas
 * Este script permite incrustar formularios de AIPI con diseño moderno en cualquier sitio web.
 * Versión: 2.0.0 - ${new Date().toISOString()}
 */

(function() {
  // Configuración
  const containerId = "aipi-form-container";
  
  // Variables globales para guardar la información del script
  let currentScriptSrc = null;
  
  // Obtener el script actual inmediatamente cuando se ejecuta
  (function() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.includes('form-embed.js')) {
        currentScriptSrc = scripts[i].src;
        break;
      }
    }
  })();
  
  // Obtener el ID del formulario desde la URL del script
  function getFormId() {
    if (!currentScriptSrc) {
      console.error('AIPI Form: No se pudo encontrar el script form-embed.js');
      return null;
    }
    const url = new URL(currentScriptSrc);
    const formId = url.searchParams.get('id');
    console.log('AIPI Form: ID extraído:', formId, 'de URL:', currentScriptSrc);
    return formId;
  }
  
  // Construir la URL del API
  function getApiUrl(formId) {
    if (!currentScriptSrc) {
      console.error('AIPI Form: No se pudo encontrar el script form-embed.js');
      return null;
    }
    const scriptUrl = new URL(currentScriptSrc);
    const baseUrl = `${scriptUrl.protocol}//${scriptUrl.host}`;
    const apiUrl = `${baseUrl}/api/forms/public/${formId}`;
    console.log('AIPI Form: URL del API construida:', apiUrl);
    return apiUrl;
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
      container.innerHTML = '<div style="text-align: center; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">Cargando formulario...</div>';
      
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
        <div style="border: 1px solid #ff5555; background-color: #ffeeee; color: #cc0000; padding: 15px; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <p style="margin: 0; font-weight: bold;">Error al cargar el formulario</p>
          <p style="margin: 5px 0 0;">Por favor, verifica el ID del formulario y tu conexión a internet.</p>
        </div>
      `;
    }
  }
  
  // Renderizar el formulario en el contenedor
  function renderForm(container, formData) {
    // Estilos modernos de dos columnas
    const styles = `
      <style>
        .aipi-modern-form-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 600px;
          line-height: 1.6;
        }
        
        .aipi-form-hero {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #0f172a 100%);
          padding: 3rem 2.5rem;
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
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
          opacity: 0.7;
        }
        
        .aipi-form-hero-content {
          position: relative;
          z-index: 1;
        }
        
        .aipi-form-hero h2 {
          color: white;
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 0 0 1.5rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .aipi-form-hero p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.125rem;
          line-height: 1.7;
          margin: 0;
          font-weight: 400;
        }
        
        .aipi-form-content {
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: white;
        }
        
        .aipi-form-header {
          margin-bottom: 2rem;
        }
        
        .aipi-form-subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 0;
          font-weight: 400;
          line-height: 1.6;
        }
        
        .aipi-form-field {
          margin-bottom: 1.5rem;
        }
        
        .aipi-form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          letter-spacing: 0.025em;
        }
        
        .aipi-form-input, .aipi-form-select, .aipi-form-textarea {
          width: 100%;
          padding: 0.75rem 0;
          font-size: 1rem;
          color: #111827;
          background: transparent;
          border: none;
          border-bottom: 2px solid #e5e7eb;
          outline: none;
          transition: all 0.3s ease;
          font-family: inherit;
          box-sizing: border-box;
        }
        
        .aipi-form-input:focus, .aipi-form-select:focus, .aipi-form-textarea:focus {
          border-bottom-color: #3b82f6;
          background: rgba(59, 130, 246, 0.02);
        }
        
        .aipi-form-input::placeholder, .aipi-form-textarea::placeholder {
          color: #9ca3af;
          opacity: 1;
        }
        
        .aipi-form-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
        
        .aipi-form-textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .aipi-checkbox-field {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin: 1.5rem 0;
        }
        
        .aipi-checkbox {
          width: 1.25rem;
          height: 1.25rem;
          margin-top: 0.125rem;
          accent-color: #3b82f6;
          cursor: pointer;
        }
        
        .aipi-checkbox-label {
          font-size: 0.875rem;
          color: #6b7280;
          cursor: pointer;
          flex: 1;
        }
        
        .aipi-submit-button {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 0.875rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
          letter-spacing: 0.025em;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .aipi-submit-button:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.15);
        }
        
        .aipi-submit-button:active {
          transform: translateY(0);
        }
        
        .aipi-submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .aipi-modern-form-wrapper {
            grid-template-columns: 1fr;
            margin: 1rem;
            border-radius: 12px;
          }
          
          .aipi-form-hero {
            padding: 2rem 1.5rem;
            min-height: 200px;
          }
          
          .aipi-form-hero h2 {
            font-size: 1.875rem;
          }
          
          .aipi-form-content {
            padding: 2rem 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .aipi-form-hero, .aipi-form-content {
            padding: 1.5rem 1rem;
          }
        }
      </style>
    `;
    
    // Crear el HTML del formulario con diseño moderno
    let formHTML = styles + `
      <div class="aipi-modern-form-wrapper">
        <div class="aipi-form-hero">
          <div class="aipi-form-hero-content">
            <h2>${escapeHtml(formData.title)}</h2>
            <p>${escapeHtml(formData.description || 'Complete la información solicitada para comenzar.')}</p>
          </div>
        </div>
        
        <div class="aipi-form-content">
          <div class="aipi-form-header">
            <p class="aipi-form-subtitle">Por favor complete la información solicitada para comenzar.</p>
          </div>
          
          <form id="aipi-form" method="POST">
    `;
    
    // Procesar los campos del formulario
    console.log('AIPI Form: Datos del formulario:', formData);
    const fields = formData.structure?.fields || formData.fields || [];
    console.log('AIPI Form: Campos encontrados:', fields);
    
    if (fields && Array.isArray(fields)) {
      fields.forEach(field => {
        formHTML += generateFieldHTML(field);
      });
    } else {
      console.warn('AIPI Form: No se encontraron campos válidos en el formulario');
    }
    
    // Agregar checkbox de términos si está configurado
    if (formData.settings?.requireTerms) {
      formHTML += `
        <div class="aipi-checkbox-field">
          <input type="checkbox" id="terms" name="terms" class="aipi-checkbox" required>
          <label for="terms" class="aipi-checkbox-label">
            Acepto los términos y condiciones
          </label>
        </div>
      `;
    }
    
    // Botón de envío
    const submitText = formData.settings?.submitText || 'Enviar';
    formHTML += `
            <button type="submit" class="aipi-submit-button">
              ${escapeHtml(submitText)}
            </button>
          </form>
        </div>
      </div>
    `;
    
    // Insertar el HTML en el contenedor
    container.innerHTML = formHTML;
    
    // Configurar el evento de envío
    setupFormSubmission(formData);
  }
  
  // Generar HTML para cada campo
  function generateFieldHTML(field) {
    const required = field.required ? 'required' : '';
    const fieldId = `field_${field.id}`;
    
    let fieldHTML = `<div class="aipi-form-field">`;
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
        fieldHTML += `
          <label for="${fieldId}" class="aipi-form-label">
            ${escapeHtml(field.label)} ${field.required ? '*' : ''}
          </label>
          <input
            type="${field.type}"
            id="${fieldId}"
            name="${field.id}"
            class="aipi-form-input"
            placeholder="${escapeHtml(field.placeholder || '')}"
            ${required}
          >
        `;
        break;
        
      case 'textarea':
        fieldHTML += `
          <label for="${fieldId}" class="aipi-form-label">
            ${escapeHtml(field.label)} ${field.required ? '*' : ''}
          </label>
          <textarea
            id="${fieldId}"
            name="${field.id}"
            class="aipi-form-textarea"
            placeholder="${escapeHtml(field.placeholder || '')}"
            ${required}
          ></textarea>
        `;
        break;
        
      case 'select':
        fieldHTML += `
          <label for="${fieldId}" class="aipi-form-label">
            ${escapeHtml(field.label)} ${field.required ? '*' : ''}
          </label>
          <select id="${fieldId}" name="${field.id}" class="aipi-form-select" ${required}>
            <option value="">${getSelectPlaceholder(formData.language || 'fr')}</option>
        `;
        
        if (field.options && Array.isArray(field.options)) {
          field.options.forEach(option => {
            // Si la opción es un string simple, usar como valor y etiqueta
            if (typeof option === 'string') {
              fieldHTML += `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`;
            } else {
              // Si es un objeto con value y label
              fieldHTML += `<option value="${escapeHtml(option.value || option)}">${escapeHtml(option.label || option)}</option>`;
            }
          });
        }
        
        fieldHTML += `</select>`;
        break;
        
      case 'radio':
        fieldHTML += `
          <fieldset>
            <legend class="aipi-form-label">
              ${escapeHtml(field.label)} ${field.required ? '*' : ''}
            </legend>
        `;
        
        if (field.options && Array.isArray(field.options)) {
          field.options.forEach((option, index) => {
            const optionId = `${fieldId}_${index}`;
            fieldHTML += `
              <div style="margin-bottom: 0.5rem;">
                <input
                  type="radio"
                  id="${optionId}"
                  name="${field.name}"
                  value="${escapeHtml(option.value)}"
                  ${required}
                  style="margin-right: 0.5rem;"
                >
                <label for="${optionId}" style="font-size: 0.875rem; color: #374151;">
                  ${escapeHtml(option.label)}
                </label>
              </div>
            `;
          });
        }
        
        fieldHTML += `</fieldset>`;
        break;
        
      case 'checkbox':
        fieldHTML += `
          <div class="aipi-checkbox-field">
            <input
              type="checkbox"
              id="${fieldId}"
              name="${field.name}"
              class="aipi-checkbox"
              value="1"
              ${required}
            >
            <label for="${fieldId}" class="aipi-checkbox-label">
              ${escapeHtml(field.label)}
            </label>
          </div>
        `;
        break;
    }
    
    fieldHTML += `</div>`;
    return fieldHTML;
  }
  
  // Configurar el envío del formulario
  function setupFormSubmission(formData) {
    const form = document.getElementById('aipi-form');
    const submitButton = form.querySelector('.aipi-submit-button');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Deshabilitar el botón de envío
      const validationTexts = getValidationTexts(formData.language || 'fr');
      submitButton.disabled = true;
      submitButton.textContent = validationTexts.submitting;
      
      try {
        // Recopilar datos del formulario
        const formDataToSend = new FormData(form);
        const data = {};
        
        for (let [key, value] of formDataToSend.entries()) {
          data[key] = value;
        }
        
        // Construir URL de envío usando el script actual guardado
        if (!currentScriptSrc) {
          throw new Error('No se pudo determinar la URL del servidor');
        }
        
        const scriptUrl = new URL(currentScriptSrc);
        const baseUrl = `${scriptUrl.protocol}//${scriptUrl.host}`;
        const formSlug = formData.slug || getFormId();
        const submitUrl = `${baseUrl}/api/public/form/${formSlug}/submit`;
        
        console.log('AIPI Form: URL de envío:', submitUrl);
        
        // Enviar los datos
        const response = await fetch(submitUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          // Mostrar mensaje de éxito
          form.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #059669;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">✓</div>
              <h3 style="margin: 0 0 1rem 0; color: #047857;">${validationTexts.success}</h3>
              <p style="margin: 0; color: #6b7280;">${validationTexts.successDescription}</p>
            </div>
          `;
          
          // Redirección si está configurada
          if (formData.settings?.redirectUrl) {
            setTimeout(() => {
              window.location.href = formData.settings.redirectUrl;
            }, 3000);
          }
        } else {
          throw new Error('Error al enviar el formulario');
        }
        
      } catch (error) {
        console.error('Error al enviar el formulario:', error);
        
        // Restaurar el botón
        submitButton.disabled = false;
        submitButton.textContent = formData.submitButtonText || 'Enviar';
        
        // Mostrar mensaje de error
        alert(validationTexts.error);
      }
    });
  }
  
  // Función para escapar HTML
  function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Función para obtener el placeholder del select según el idioma
  function getSelectPlaceholder(language) {
    const placeholders = {
      'fr': 'Sélectionnez une option',
      'es': 'Selecciona una opción',
      'en': 'Select an option'
    };
    return placeholders[language] || placeholders['fr'];
  }

  // Función para obtener textos de validación según el idioma
  function getValidationTexts(language) {
    const texts = {
      'fr': {
        required: 'Ce champ est obligatoire',
        email: 'Veuillez entrer une adresse email valide',
        submitting: 'Envoi en cours...',
        success: 'Merci pour votre envoi!',
        error: 'Une erreur est survenue lors de l\'envoi du formulaire. Veuillez réessayer.',
        successDescription: 'Merci pour votre information. Nous vous contacterons bientôt.'
      },
      'es': {
        required: 'Este campo es obligatorio',
        email: 'Por favor ingresa un email válido',
        submitting: 'Enviando...',
        success: 'Gracias por tu envío!',
        error: 'Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo.',
        successDescription: 'Gracias por tu información. Te contactaremos pronto.'
      },
      'en': {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        submitting: 'Submitting...',
        success: 'Thank you for your submission!',
        error: 'An error occurred while submitting the form. Please try again.',
        successDescription: 'Thank you for your information. We will contact you soon.'
      }
    };
    return texts[language] || texts['fr'];
  }
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadForm);
  } else {
    loadForm();
  }
  
})();