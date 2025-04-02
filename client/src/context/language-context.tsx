import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Definir el tipo para el contexto de idioma
type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => void;
};

// Crear el contexto de idioma
const LanguageContext = createContext<LanguageContextType>({
  language: "fr", // Idioma predeterminado: francés
  changeLanguage: () => {},
});

// Traducciones
const resources = {
  fr: {
    translation: {
      "home": "Accueil",
      "features": "Fonctionnalités",
      "pricing": "Tarifs",
      "documentation": "Documentation",
      "login": "Connexion",
      "signup": "S'inscrire",
      "logout": "Déconnexion",
      "dashboard": "Tableau de bord",
      "integrations": "Intégrations",
      "analytics": "Analytique",
      "settings": "Paramètres",
      "admin": "Administration",
      "profile": "Profil",
      "language": {
        "select": "Langue",
        "fr": "Français",
        "es": "Espagnol",
        "en": "Anglais"
      },
      "forms": {
        "create": "Créer un formulaire",
        "edit": "Modifier le formulaire",
        "preview": "Aperçu du formulaire",
        "responses": "Réponses du formulaire",
        "templates": "Modèles de formulaire",
        "selectTemplate": "Sélectionner un modèle",
        "contact": "Contact",
        "waitlist": "Liste d'attente",
        "survey": "Sondage",
        "feedback": "Avis",
        "registration": "Inscription",
        "application": "Candidature"
      }
    }
  },
  es: {
    translation: {
      "home": "Inicio",
      "features": "Características",
      "pricing": "Precios",
      "documentation": "Documentación",
      "login": "Iniciar sesión",
      "signup": "Registrarse",
      "logout": "Cerrar sesión",
      "dashboard": "Panel",
      "integrations": "Integraciones",
      "analytics": "Analítica",
      "settings": "Configuración",
      "admin": "Administración",
      "profile": "Perfil",
      "language": {
        "select": "Idioma",
        "fr": "Francés",
        "es": "Español",
        "en": "Inglés"
      },
      "forms": {
        "create": "Crear formulario",
        "edit": "Editar formulario",
        "preview": "Vista previa del formulario",
        "responses": "Respuestas del formulario",
        "templates": "Plantillas de formulario",
        "selectTemplate": "Seleccionar plantilla",
        "contact": "Contacto",
        "waitlist": "Lista de espera",
        "survey": "Encuesta",
        "feedback": "Comentarios",
        "registration": "Registro",
        "application": "Solicitud"
      }
    }
  },
  en: {
    translation: {
      "home": "Home",
      "features": "Features",
      "pricing": "Pricing",
      "documentation": "Documentation",
      "login": "Log in",
      "signup": "Sign up",
      "logout": "Logout",
      "dashboard": "Dashboard",
      "integrations": "Integrations",
      "analytics": "Analytics",
      "settings": "Settings",
      "admin": "Admin Panel",
      "profile": "Profile",
      "language": {
        "select": "Language",
        "fr": "French",
        "es": "Spanish",
        "en": "English"
      },
      "forms": {
        "create": "Create Form",
        "edit": "Edit Form",
        "preview": "Form Preview",
        "responses": "Form Responses",
        "templates": "Form Templates",
        "selectTemplate": "Select Template",
        "contact": "Contact",
        "waitlist": "Waitlist",
        "survey": "Survey",
        "feedback": "Feedback",
        "registration": "Registration",
        "application": "Application"
      }
    }
  }
};

// Inicializar i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "fr", // Idioma de respaldo
    interpolation: {
      escapeValue: false, // No es necesario para React
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

// Proveedor del contexto de idioma
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(i18n.language || "fr");

  // Cambiar el idioma
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  // Efecto para actualizar el estado cuando cambia el idioma
  useEffect(() => {
    const handleLanguageChanged = () => {
      setLanguage(i18n.language);
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook personalizado para usar el contexto de idioma
export const useLanguage = () => useContext(LanguageContext);