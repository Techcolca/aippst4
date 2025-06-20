// Sistema de traducción unificado para formularios
export interface FormTranslations {
  defaultDescription: string;
  placeholders: {
    name: string;
    email: string;
    phone: string;
    message: string;
    comments: string;
    feedback: string;
  };
  labels: {
    name: string;
    email: string;
    phone: string;
    message: string;
    comments: string;
    feedback: string;
    satisfaction: string;
    recommendation: string;
    howCanWeImprove: string;
    hearAboutUs: string;
    acceptTerms: string;
  };
  options: {
    satisfaction: string[];
    hearAboutUs: string[];
    yesNo: string[];
  };
  buttons: {
    submit: string;
    submitSurvey: string;
    joinWaitlist: string;
    sendMessage: string;
    subscribe: string;
  };
  messages: {
    success: string;
    error: string;
    required: string;
    invalidEmail: string;
    invalidPhone: string;
  };
  validation: {
    requiredField: string;
    invalidEmailFormat: string;
    invalidPhoneFormat: string;
    minLength: string;
    maxLength: string;
  };
}

export const translations: Record<string, FormTranslations> = {
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
      required: "Este campo es obligatorio",
      invalidEmail: "Email inválido",
      invalidPhone: "Teléfono inválido"
    },
    validation: {
      requiredField: "Este campo es obligatorio",
      invalidEmailFormat: "Formato de email inválido",
      invalidPhoneFormat: "Formato de teléfono inválido",
      minLength: "Mínimo {min} caracteres",
      maxLength: "Máximo {max} caracteres"
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
      required: "This field is required",
      invalidEmail: "Invalid email",
      invalidPhone: "Invalid phone"
    },
    validation: {
      requiredField: "This field is required",
      invalidEmailFormat: "Invalid email format",
      invalidPhoneFormat: "Invalid phone format",
      minLength: "Minimum {min} characters",
      maxLength: "Maximum {max} characters"
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
      required: "Ce champ est obligatoire",
      invalidEmail: "Email invalide",
      invalidPhone: "Téléphone invalide"
    },
    validation: {
      requiredField: "Ce champ est obligatoire",
      invalidEmailFormat: "Format d'email invalide",
      invalidPhoneFormat: "Format de téléphone invalide",
      minLength: "Minimum {min} caractères",
      maxLength: "Maximum {max} caractères"
    }
  }
};

// Función para obtener traducción
export function getTranslation(language: string, key: string): string {
  const lang = translations[language] || translations['en'];
  const keys = key.split('.');
  let value: any = lang;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

// Función para obtener todas las traducciones de un idioma
export function getLanguageTranslations(language: string): FormTranslations {
  return translations[language] || translations['en'];
}

// Función para traducir opciones de un campo específico
export function translateFieldOptions(language: string, fieldType: string): string[] {
  const lang = getLanguageTranslations(language);
  
  switch (fieldType) {
    case 'satisfaction':
      return lang.options.satisfaction;
    case 'hearAboutUs':
      return lang.options.hearAboutUs;
    case 'yesNo':
      return lang.options.yesNo;
    default:
      return [];
  }
}