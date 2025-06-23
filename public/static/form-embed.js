/**
 * AIPI Form Embed Script - Modern Two-Column Design
 * This script allows embedding AIPI forms with modern design on any website.
 * Version: 2.1.0 - Dynamic Translation System
 */

(function() {
  // Configuration
  const containerId = "aipi-form-container";
  
  // Translation system
  const translations = {
    es: {
      defaultDescription: "Por favor complete la información solicitada para comenzar.",
      placeholders: {
        name: "Su nombre",
        email: "su@email.com", 
        phone: "Su número de teléfono",
        message: "Escriba su mensaje aquí...",
        comments: "Sus comentarios nos ayudan a mejorar",
        feedback: "Comparta sus comentarios aquí..."
      },
      labels: {
        name: "Nombre",
        email: "Email",
        phone: "Teléfono", 
        message: "Mensaje",
        comments: "Comentarios",
        feedback: "Comentarios",
        satisfaction: "¿Cómo calificaría su experiencia con nosotros?",
        recommendation: "Del 1 al 10, ¿qué tan probable es que nos recomiende?",
        howCanWeImprove: "¿Cómo podríamos mejorar?",
        hearAboutUs: "¿Cómo se enteró de nosotros?",
        acceptTerms: "Acepto los términos y condiciones"
      },
      options: {
        satisfaction: ["Excelente", "Buena", "Regular", "Mala", "Muy mala"],
        hearAboutUs: ["Redes sociales", "Búsqueda Google", "Recomendación", "Otro"],
        yesNo: ["Sí", "No"]
      },
      buttons: {
        submit: "Enviar",
        submitSurvey: "Enviar encuesta", 
        joinWaitlist: "Unirse a la lista de espera",
        sendMessage: "Enviar mensaje",
        subscribe: "Suscribirse"
      },
      messages: {
        success: "¡Gracias por su envío!",
        error: "Error al enviar el formulario",
        required: "Este campo es obligatorio"
      }
    },
    en: {
      defaultDescription: "Please complete the requested information to get started.",
      placeholders: {
        name: "Your name",
        email: "you@email.com",
        phone: "Your phone number", 
        message: "Write your message here...",
        comments: "Your comments help us improve",
        feedback: "Share your feedback here..."
      },
      labels: {
        name: "Name",
        email: "Email", 
        phone: "Phone",
        message: "Message",
        comments: "Comments",
        feedback: "Feedback",
        satisfaction: "How would you rate your experience with us?",
        recommendation: "From 1 to 10, how likely are you to recommend us?",
        howCanWeImprove: "How could we improve?",
        hearAboutUs: "How did you hear about us?",
        acceptTerms: "I accept the terms and conditions"
      },
      options: {
        satisfaction: ["Excellent", "Good", "Fair", "Poor", "Very poor"],
        hearAboutUs: ["Social media", "Google search", "Recommendation", "Other"],
        yesNo: ["Yes", "No"]
      },
      buttons: {
        submit: "Submit",
        submitSurvey: "Submit survey",
        joinWaitlist: "Join waitlist", 
        sendMessage: "Send message",
        subscribe: "Subscribe"
      },
      messages: {
        success: "Thank you for your submission!",
        error: "Error submitting form",
        required: "This field is required"
      }
    },
    fr: {
      defaultDescription: "Veuillez compléter les informations demandées pour commencer.",
      placeholders: {
        name: "Votre nom",
        email: "vous@email.com",
        phone: "Votre numéro de téléphone",
        message: "Écrivez votre message ici...",
        comments: "Vos commentaires nous aident à améliorer",
        feedback: "Partagez vos commentaires ici..."
      },
      labels: {
        name: "Nom",
        email: "Email",
        phone: "Téléphone",
        message: "Message", 
        comments: "Commentaires",
        feedback: "Commentaires",
        satisfaction: "Comment évalueriez-vous votre expérience avec nous?",
        recommendation: "De 1 à 10, quelle est la probabilité que vous nous recommandiez?",
        howCanWeImprove: "Comment pourrions-nous améliorer?",
        hearAboutUs: "Comment avez-vous entendu parler de nous?",
        acceptTerms: "J'accepte les termes et conditions"
      },
      options: {
        satisfaction: ["Excellent", "Bon", "Passable", "Mauvais", "Très mauvais"],
        hearAboutUs: ["Réseaux sociaux", "Recherche Google", "Recommandation", "Autre"],
        yesNo: ["Oui", "Non"]
      },
      buttons: {
        submit: "Soumettre",
        submitSurvey: "Soumettre l'enquête",
        joinWaitlist: "Rejoindre la liste d'attente",
        sendMessage: "Envoyer le message", 
        subscribe: "S'abonner"
      },
      messages: {
        success: "Merci pour votre envoi!",
        error: "Erreur lors de l'envoi du formulaire",
        required: "Ce champ est obligatoire"
      }
    }
  };
  
  // Get translations for a specific language
  function getTranslations(language) {
    return translations[language] || translations['en'];
  }
  
  // Get translation by key path
  function getTranslation(language, keyPath) {
    const t = getTranslations(language);
    const keys = keyPath.split('.');
    let value = t;
    for (const key of keys) {
      value = value?.[key];
    }
    return value || keyPath;
  }
  
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
  
  // Marcar que hay un formulario AIPPS activo
  function markFormAsActive() {
    // Añadir atributo al documento para que el widget de chat lo detecte
    document.documentElement.setAttribute('data-aipps-form-active', 'true');
    console.log('AIPPS Form: Marcando formulario como activo para evitar conflictos con chat');
  }

  // Cargar el formulario
  async function loadForm() {
    // Marcar formulario como activo inmediatamente
    markFormAsActive();
    
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
    
    // Create modern form HTML with dynamic translations
    const language = formData.language || 'en';
    const t = getTranslations(language);
    const defaultDescription = formData.description || t.defaultDescription;
    
    let formHTML = styles + `
      <div class="aipi-modern-form-wrapper">
        <div class="aipi-form-hero">
          <div class="aipi-form-hero-content">
            <h2>${escapeHtml(formData.title)}</h2>
            <p>${escapeHtml(defaultDescription)}</p>
          </div>
        </div>
        
        <div class="aipi-form-content">
          <div class="aipi-form-header">
            <p class="aipi-form-subtitle">${escapeHtml(defaultDescription)}</p>
          </div>
          
          <form id="aipi-form" method="POST">
    `;
    
    // Procesar los campos del formulario
    console.log('AIPI Form: Datos del formulario:', formData);
    const fields = formData.structure?.fields || formData.fields || [];
    console.log('AIPI Form: Campos encontrados:', fields);
    
    if (fields && Array.isArray(fields)) {
      fields.forEach(field => {
        formHTML += generateFieldHTML(field, language);
      });
    } else {
      console.warn('AIPI Form: No valid fields found in form');
    }
    
    // Add terms checkbox if configured
    if (formData.settings?.requireTerms) {
      formHTML += `
        <div class="aipi-checkbox-field">
          <input type="checkbox" id="terms" name="terms" class="aipi-checkbox" required>
          <label for="terms" class="aipi-checkbox-label">
            ${t.labels.acceptTerms}
          </label>
        </div>
      `;
    }
    
    // Submit button using form text or translated fallback
    const submitText = formData.submitButtonText || formData.settings?.submitText || t.buttons.submit;
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
  
  // Generate HTML for each field with dynamic translations
  function generateFieldHTML(field, language = 'en') {
    const required = field.required ? 'required' : '';
    const fieldId = `field_${field.id}`;
    const t = getTranslations(language);
    
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
            <option value="">${getSelectPlaceholder(language)}</option>
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
      
      // Disable submit button with dynamic text
      const language = formData.language || 'en';
      const t = getTranslations(language);
      submitButton.disabled = true;
      submitButton.textContent = getTranslation(language, 'buttons.submit') + '...';
      
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
          // Show success message with dynamic translation
          const successMessage = formData.successMessage || formData.settings?.successMessage || t.messages.success;
          form.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #059669;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">✓</div>
              <h3 style="margin: 0 0 1rem 0; color: #047857;">${escapeHtml(successMessage)}</h3>
              <p style="margin: 0; color: #6b7280;">${escapeHtml(t.messages.success)}</p>
            </div>
          `;
          
          // Redirect if configured
          if (formData.settings?.redirectUrl) {
            setTimeout(() => {
              window.location.href = formData.settings.redirectUrl;
            }, 3000);
          }
        } else {
          throw new Error(t.messages.error);
        }
        
      } catch (error) {
        console.error('Form submission error:', error);
        
        // Restore button with dynamic text
        submitButton.disabled = false;
        submitButton.textContent = formData.submitButtonText || formData.settings?.submitText || t.buttons.submit;
        
        // Show error message with dynamic translation
        alert(t.messages.error);
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

  // Function to get select placeholder based on language
  function getSelectPlaceholder(language) {
    const t = getTranslations(language);
    const placeholders = {
      'fr': 'Sélectionnez une option',
      'es': 'Selecciona una opción', 
      'en': 'Select an option'
    };
    return placeholders[language] || placeholders['en'];
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