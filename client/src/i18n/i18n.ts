import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Definir recursos manualmente para solucionar problemas de importación de Vite

// Crear recursos manualmente para evitar problemas de Vite
const resources = {
  fr: {
    translation: {
      menu: "Menu",
      common: {
        error: "Erreur",
        yes: "Oui", 
        no: "Non",
        cancel: "Annuler",
        spanish: "Espagnol",
        english: "Anglais",
        french: "Français"
      },
      language: {
        select: "Sélectionner la langue",
        fr: "Français",
        es: "Espagnol", 
        en: "Anglais"
      },
      refresh: "Actualiser",
      edit: "Modifier",
      conversations: "Conversations",
      analytics: "Analyses",
      delete: "Supprimer",
      active: "Actif",
      inactive: "Inactif",
      testing: "Test",
      visitors_helped: "Visiteurs aidés",
      installed: "Installé",
      confirm_delete_title: "Êtes-vous sûr?",
      confirm_delete_description: "Cette action supprimera définitivement l'intégration \"{{name}}\" et ne peut pas être annulée. Le widget cessera de fonctionner sur votre site web.",
      welcome: "Bienvenue chez AIPI",
      getStarted: "Commencer",
      learnMore: "En savoir plus",
      features: {
        title: "Caractéristiques Principales",
        subtitle: "Découvrez les fonctionnalités qui font d'AIPI le meilleur choix pour votre site web",
        conversationalAI: {
          title: "IA Conversationnelle",
          description: "Interactions intelligentes et naturelles avec vos visiteurs"
        },
        taskAutomation: {
          title: "Automatisation des Tâches",
          description: "Automatisez les réponses et processus pour améliorer l'efficacité"
        },
        easyIntegration: {
          title: "Intégration Facile",
          description: "Implémentez en minutes avec une simple ligne de code"
        },
        analytics: {
          title: "Analyses Avancées",
          description: "Obtenez des insights précieux sur les interactions de vos utilisateurs"
        }
      },
      cta: {
        title: "Prêt à transformer votre site web ?",
        subtitle: "Rejoignez des milliers d'entreprises qui utilisent déjà AIPI pour améliorer l'expérience de leurs utilisateurs",
        getStartedFree: "Commencer Gratuitement",
        scheduleDemo: "Planifier une Démo"
      },
      footer: {
        company_description: "AIPI - Plateforme avancée d'IA conversationnelle pour sites web.",
        product: "Produit",
        features: "Fonctionnalités",
        pricing: "Tarifs",
        documentation: "Documentation",
        get_started: "Commencer",
        company: "Entreprise",
        about_us: "À propos",
        contact: "Contact",
        privacy_policy: "Politique de confidentialité",
        terms_of_service: "Conditions d'utilisation",
        support: "Support",
        help_center: "Centre d'aide",
        all_rights_reserved: "Tous droits réservés."
      },
      pricing: {
        plans: "Plans",
        title: "Choisissez Votre Plan Parfait",
        subtitle: "Sélectionnez le plan qui correspond le mieux à vos besoins et développez votre entreprise avec l'IA conversationnelle.",
        monthly_billing: "Facturation Mensuelle",
        annual_billing: "Facturation Annuelle",
        toggle_billing: "Basculer le type de facturation",
        save_percentage: "Économisez 20%",
        recommended: "Recommandé",
        free: "Gratuit",
        from: "À partir de",
        month: "mois",
        year: "année",
        contact_us: "Nous Contacter",
        take_offer: "Profiter de l'Offre",
        take_annual_offer: "Profiter de l'Offre Annuelle",
        start_free: "Commencer Gratuitement",
        subscribe: "S'abonner",
        processing: "Traitement...",
        spots_remaining: "Il ne reste que {{remaining}} places sur {{total}}",
        discount_duration: "{{discount}}% de réduction pendant {{months}} mois",
        promotional_price_duration: "Prix promotionnel pendant {{months}} mois",
        limited_launch_offer: "Offre de Lancement Limitée",
        spots_left_of_total: "Il ne reste que {{remaining}} places sur {{total}} dans cette promotion spéciale.",
        take_advantage_unique_prices: "Profitez de ces prix uniques avant qu'ils ne reviennent aux prix réguliers.",
        pricing_note: "Tous les plans incluent un support complet et des mises à jour gratuites."
      },
      getStartedPage: {
        title: "Commencer",
        subtitle: "Intégrez AIPPS dans votre site web en quelques minutes",
        tabs: {
          widget: "Widget",
          fullscreen: "Plein écran",
          form: "Formulaire"
        },
        widget: {
          step1: {
            title: "Étape 1: Ajoutez ce code à votre site web",
            description: "Copiez et collez ce code dans le HTML de votre site web, juste avant la balise de fermeture </body>:",
            copied: "✓ Code copié dans le presse-papiers",
            wordpress_note: "Si vous utilisez WordPress: Vous pouvez l'ajouter dans le thème dans footer.php ou installer un plugin qui permet d'insérer du code HTML."
          },
          step2: {
            title: "Étape 2: Personnalisez votre widget (optionnel)",
            description: "Vous pouvez personnaliser le comportement et l'apparence du widget en ajoutant des paramètres supplémentaires:",
            customization_title: "Options de personnalisation:",
            position: "Position du widget sur la page",
            theme_color: "Couleur principale du widget",
            assistant_name: "Nom de l'assistant",
            welcome_message: "Message de bienvenue personnalisé",
            example_title: "Exemple de configuration personnalisée:",
            configure_dashboard: "Configurez ces options depuis le panneau d'administration:",
            dashboard_steps: {
              "0": "Accédez à la section \"Intégrations\" du panneau",
              "1": "Sélectionnez l'intégration que vous souhaitez configurer",
              "2": "Personnalisez les couleurs, position et messages",
              "3": "Les changements seront appliqués automatiquement"
            }
          },
          step3: {
            title: "Étape 3: Entraînez votre assistant (optionnel)",
            description: "Pour que votre assistant fournisse des réponses utiles et pertinentes, vous pouvez l'entraîner avec:",
            training_options: [
              "Documents PDF avec des informations sur vos produits ou services",
              "Fichiers DOCX avec des questions fréquemment posées et leurs réponses",
              "Fichiers Excel avec des données structurées",
              "Instructions spécifiques sur le ton et le style des réponses"
            ],
            step4_title: "Étape 4: Configurez les Formulaires (Optionnel)",
            step4_description: "Alimentez votre widget avec des formulaires personnalisés pour capturer des leads et des informations spécifiques:",
            form_options: [
              "Formulaires de contact et capture de leads",
              "Enquêtes de satisfaction et feedback",
              "Formulaires d'inscription à des événements",
              "Intégration automatique avec votre CRM"
            ]
          }
        },
        fullscreen: {
          step1: {
            title: "Étape 1: Ajoutez ce code à votre site web",
            description: "Copiez et collez ce code dans le HTML de votre site web, juste avant la balise de fermeture </body>:",
            copied: "✓ Code copié dans le presse-papiers",
            wordpress_note: "Si vous utilisez WordPress: Vous pouvez l'ajouter dans le thème dans footer.php ou installer un plugin qui permet d'insérer du code HTML."
          },
          step2: {
            title: "Étape 2: Personnalisez votre expérience (optionnel)",
            description: "Le mode plein écran crée une expérience immersive similaire à ChatGPT. Vous pouvez le personnaliser avec:",
            customization_title: "Options de personnalisation:",
            position: "Position du bouton d'activation",
            theme_color: "Couleurs et thème du chat",
            assistant_name: "Nom de l'assistant",
            welcome_message: "Message de bienvenue personnalisé",
            example_title: "Exemple de configuration personnalisée:",
            configure_dashboard: "Configurez ces options depuis le panneau d'administration:",
            dashboard_steps: {
              "0": "Accédez à la section \"Intégrations\" du panneau",
              "1": "Sélectionnez l'intégration que vous souhaitez configurer",
              "2": "Personnalisez les couleurs, position et messages",
              "3": "Les changements seront appliqués automatiquement"
            }
          }
        },
        form: {
          step1: {
            title: "Étape 1: Ajoutez ce code à votre site web",
            description: "Copiez et collez ce code dans le HTML de votre site web où vous voulez que le formulaire apparaisse:",
            copied: "✓ Code copié dans le presse-papiers"
          },
          step2: {
            title: "Étape 2: Personnalisez votre formulaire (optionnel)",
            description: "Vous pouvez personnaliser le comportement et l'apparence du formulaire en ajoutant des paramètres supplémentaires:",
            customization_title: "Options de personnalisation:",
            display_type: "Type d'affichage (modal, intégré, etc.)",
            position: "Position du bouton ou formulaire",
            theme_color: "Couleur principale du formulaire",
            button_text: "Texte du bouton",
            example_title: "Exemple de configuration personnalisée:"
          },
          step3: {
            title: "Étape 3: Gérez depuis le Tableau de Bord",
            description: "Une fois le formulaire intégré, vous pouvez le gérer complètement depuis votre panneau d'administration:",
            dashboard_steps: [
              "Accédez à la section \"Formulaires\" du panneau",
              "Sélectionnez le formulaire que vous souhaitez configurer",
              "Personnalisez les champs, validations et réponses automatiques",
              "Consultez les réponses et statistiques en temps réel"
            ]
          }
        },
        buttons: {
          go_to_integrations: "Aller aux intégrations",
          login_to_manage: "Se connecter pour gérer",
          manage_content: "Gérer le contenu",
          create_account: "Créer un compte",
          create_forms: "Créer des formulaires",
          create_account_forms: "Créer un compte pour les formulaires",
          configure_auth: "Configurer l'authentification",
          login: "Se connecter",
          configure_sections: "Configurer les sections",
          configure_assistant: "Configurer l'assistant",
          configure_advanced_forms: "Configurer les formulaires avancés",
          create_account_advanced: "Créer un compte avancé",
          go_to_forms: "Aller aux formulaires",
          login_to_manage_forms: "Se connecter pour gérer les formulaires",
          forms_guide: "Guide des formulaires",
          view_docs: "Voir la documentation",
          contact_support: "Contacter le support"
        },
        cta: {
          forms_title: "Prêt à créer vos formulaires ?",
          forms_description: "Commencez à capturer des leads avec nos formulaires personnalisés dès aujourd'hui."
        }
      }
    }
  },
  es: {
    translation: {
      menu: "Menú",
      common: {
        error: "Error",
        yes: "Sí",
        no: "No", 
        cancel: "Cancelar",
        spanish: "Español",
        english: "Inglés",
        french: "Francés"
      },
      language: {
        select: "Seleccionar idioma",
        fr: "Francés",
        es: "Español",
        en: "Inglés"
      },
      refresh: "Actualizar",
      edit: "Editar",
      conversations: "Conversaciones",
      analytics: "Análisis",
      delete: "Eliminar",
      active: "Activo",
      inactive: "Inactivo",
      testing: "Pruebas",
      visitors_helped: "Visitantes ayudados",
      installed: "Instalado",
      confirm_delete_title: "¿Estás seguro?",
      confirm_delete_description: "Esta acción eliminará permanentemente la integración \"{{name}}\" y no se puede deshacer. El widget dejará de funcionar en tu sitio web.",
      welcome: "Bienvenido a AIPI",
      getStarted: "Comenzar",
      learnMore: "Saber más",
      features: {
        title: "Características Principales",
        subtitle: "Descubre las características que hacen de AIPI la mejor opción para tu sitio web",
        conversationalAI: {
          title: "IA Conversacional",
          description: "Interacciones inteligentes y naturales con tus visitantes"
        },
        taskAutomation: {
          title: "Automatización de Tareas",
          description: "Automatiza respuestas y procesos para mejorar la eficiencia"
        },
        easyIntegration: {
          title: "Integración Fácil",
          description: "Implementa en minutos con una simple línea de código"
        },
        analytics: {
          title: "Análisis Avanzado",
          description: "Obtén insights valiosos sobre las interacciones de tus usuarios"
        }
      },
      cta: {
        title: "¿Listo para transformar tu sitio web?",
        subtitle: "Únete a miles de empresas que ya están usando AIPI para mejorar la experiencia de sus usuarios",
        getStartedFree: "Comenzar Gratis",
        scheduleDemo: "Agendar Demo"
      },
      footer: {
        company_description: "AIPI - Plataforma avanzada de IA conversacional para sitios web.",
        product: "Producto",
        features: "Características",
        pricing: "Precios",
        documentation: "Documentación",
        get_started: "Comenzar",
        company: "Empresa",
        about_us: "Sobre nosotros",
        contact: "Contacto",
        privacy_policy: "Política de privacidad",
        terms_of_service: "Términos de servicio",
        support: "Soporte",
        help_center: "Centro de ayuda",
        all_rights_reserved: "Todos los derechos reservados."
      },
      pricing: {
        plans: "Planes",
        title: "Elige tu Plan Perfecto",
        subtitle: "Selecciona el plan que mejor se adapte a tus necesidades y escala tu negocio con IA conversacional.",
        monthly_billing: "Facturación Mensual",
        annual_billing: "Facturación Anual",
        toggle_billing: "Alternar tipo de facturación",
        save_percentage: "Ahorra 20%",
        recommended: "Recomendado",
        free: "Gratis",
        from: "Desde",
        month: "mes",
        year: "año",
        contact_us: "Habla con Nosotros",
        take_offer: "Aprovechar Oferta",
        take_annual_offer: "Aprovechar Oferta Anual",
        start_free: "Comenzar Gratis",
        subscribe: "Suscribirse",
        processing: "Procesando...",
        spots_remaining: "Solo quedan {{remaining}} lugares de {{total}}",
        discount_duration: "{{discount}}% de descuento por {{months}} meses",
        promotional_price_duration: "Precio promocional por {{months}} meses",
        limited_launch_offer: "Oferta de Lanzamiento Limitada",
        spots_left_of_total: "Solo quedan {{remaining}} lugares de {{total}} en esta promoción especial.",
        take_advantage_unique_prices: "Aprovecha estos precios únicos antes de que vuelvan a los precios regulares.",
        pricing_note: "Todos los planes incluyen soporte completo y actualizaciones gratuitas."
      },
      getStartedPage: {
        title: "Comienza Ahora",
        subtitle: "Integra AIPPS en tu sitio web en minutos",
        tabs: {
          widget: "Widget",
          fullscreen: "Pantalla",
          form: "Formulario"
        },
        widget: {
          step1: {
            title: "Paso 1: Agrega este código a tu sitio web",
            description: "Copia y pega este código en el HTML de tu sitio web, justo antes de la etiqueta de cierre </body>:",
            copied: "✓ Código copiado al portapapeles",
            wordpress_note: "Si usas WordPress: Puedes agregarlo en el tema en footer.php o instalar un plugin que permita insertar código HTML."
          },
          step2: {
            title: "Paso 2: Personaliza tu widget (opcional)",
            description: "Puedes personalizar el comportamiento y apariencia del widget agregando parámetros adicionales:",
            customization_title: "Opciones de personalización:",
            position: "Posición del widget en la página",
            theme_color: "Color principal del widget",
            assistant_name: "Nombre del asistente",
            welcome_message: "Mensaje de bienvenida personalizado",
            example_title: "Ejemplo de configuración personalizada:",
            configure_dashboard: "Configura estas opciones desde el panel de administración:",
            dashboard_steps: {
              "0": "Accede a la sección \"Integraciones\" del panel",
              "1": "Selecciona la integración que deseas configurar",
              "2": "Personaliza colores, posición y mensajes",
              "3": "Los cambios se aplicarán automáticamente"
            }
          },
          step3: {
            title: "Paso 3: Entrena tu asistente (opcional)",
            description: "Para que tu asistente proporcione respuestas útiles y relevantes, puedes entrenarlo con:",
            training_options: [
              "Documentos PDF con información sobre tus productos o servicios",
              "Archivos DOCX con preguntas frecuentes y sus respuestas",
              "Archivos Excel con datos estructurados",
              "Instrucciones específicas sobre el tono y estilo de las respuestas"
            ],
            step4_title: "Paso 4: Configura Formularios (Opcional)",
            step4_description: "Potencia tu widget con formularios personalizados para capturar leads y información específica:",
            form_options: [
              "Formularios de contacto y captura de leads",
              "Encuestas de satisfacción y feedback",
              "Formularios de registro para eventos",
              "Integración automática con tu CRM"
            ]
          }
        },
        fullscreen: {
          step1: {
            title: "Paso 1: Agrega este código a tu sitio web",
            description: "Copia y pega este código en el HTML de tu sitio web, justo antes de la etiqueta de cierre </body>:",
            copied: "✓ Código copiado al portapapeles",
            wordpress_note: "Si usas WordPress: Puedes agregarlo en el tema en footer.php o instalar un plugin que permita insertar código HTML."
          },
          step2: {
            title: "Paso 2: Personaliza tu experiencia (opcional)",
            description: "El modo pantalla completa crea una experiencia inmersiva similar a ChatGPT. Puedes personalizarlo con:",
            customization_title: "Opciones de personalización:",
            position: "Posición del botón de activación",
            theme_color: "Colores y tema del chat",
            assistant_name: "Nombre del asistente",
            welcome_message: "Mensaje de bienvenida personalizado",
            example_title: "Ejemplo de configuración personalizada:",
            configure_dashboard: "Configura estas opciones desde el panel de administración:",
            dashboard_steps: {
              "0": "Accede a la sección \"Integraciones\" del panel",
              "1": "Selecciona la integración que deseas configurar",
              "2": "Personaliza colores, posición y mensajes",
              "3": "Los cambios se aplicarán automáticamente"
            }
          }
        },
        form: {
          step1: {
            title: "Paso 1: Agrega este código a tu sitio web",
            description: "Copia y pega este código en el HTML de tu sitio web donde quieras que aparezca el formulario:",
            copied: "✓ Código copiado al portapapeles"
          },
          step2: {
            title: "Paso 2: Personaliza tu formulario (opcional)",
            description: "Puedes personalizar el comportamiento y apariencia del formulario agregando parámetros adicionales:",
            customization_title: "Opciones de personalización:",
            display_type: "Tipo de visualización (modal, embebido, etc.)",
            position: "Posición del botón o formulario",
            theme_color: "Color principal del formulario",
            button_text: "Texto del botón",
            example_title: "Ejemplo de configuración personalizada:"
          },
          step3: {
            title: "Paso 3: Gestiona desde el Dashboard",
            description: "Una vez integrado el formulario, puedes gestionarlo completamente desde tu panel de administración:",
            dashboard_steps: [
              "Accede a la sección \"Formularios\" del panel",
              "Selecciona el formulario que deseas configurar",
              "Personaliza campos, validaciones y respuestas automáticas",
              "Revisa las respuestas y estadísticas en tiempo real"
            ]
          }
        },
        buttons: {
          go_to_integrations: "Ir a integraciones",
          login_to_manage: "Iniciar sesión para gestionar",
          manage_content: "Gestionar contenido",
          create_account: "Crear cuenta",
          create_forms: "Crear formularios",
          create_account_forms: "Crear cuenta para formularios",
          configure_auth: "Configurar autenticación",
          login: "Iniciar sesión",
          configure_sections: "Configurar secciones",
          configure_assistant: "Configurar asistente",
          configure_advanced_forms: "Configurar formularios avanzados",
          create_account_advanced: "Crear cuenta avanzada",
          go_to_forms: "Ir a formularios",
          login_to_manage_forms: "Iniciar sesión para gestionar formularios",
          forms_guide: "Guía de formularios",
          view_docs: "Ver documentación",
          contact_support: "Contactar soporte"
        },
        cta: {
          forms_title: "¿Listo para crear tus formularios?",
          forms_description: "Comienza a capturar leads con nuestros formularios personalizados hoy mismo."
        }
      }
    }
  },
  en: {
    translation: {
      menu: "Menu",
      common: {
        error: "Error",
        yes: "Yes",
        no: "No",
        cancel: "Cancel",
        spanish: "Spanish",
        english: "English", 
        french: "French"
      },
      language: {
        select: "Select language",
        fr: "French",
        es: "Spanish",
        en: "English"
      },
      refresh: "Refresh",
      edit: "Edit",
      conversations: "Conversations",
      analytics: "Analytics",
      delete: "Delete",
      active: "Active",
      inactive: "Inactive",
      testing: "Testing",
      visitors_helped: "Visitors helped",
      installed: "Installed",
      confirm_delete_title: "Are you sure?",
      confirm_delete_description: "This action will permanently delete the integration \"{{name}}\" and cannot be undone. The widget will stop working on your website.",
      welcome: "Welcome to AIPI",
      getStarted: "Get Started",
      learnMore: "Learn More",
      features: {
        title: "Main Features",
        subtitle: "Discover the features that make AIPI the best choice for your website",
        conversationalAI: {
          title: "Conversational AI",
          description: "Smart and natural interactions with your visitors"
        },
        taskAutomation: {
          title: "Task Automation",
          description: "Automate responses and processes to improve efficiency"
        },
        easyIntegration: {
          title: "Easy Integration",
          description: "Implement in minutes with a simple line of code"
        },
        analytics: {
          title: "Advanced Analytics",
          description: "Get valuable insights about your users' interactions"
        }
      },
      cta: {
        title: "Ready to transform your website?",
        subtitle: "Join thousands of companies already using AIPI to improve their users' experience",
        getStartedFree: "Get Started Free",
        scheduleDemo: "Schedule Demo"
      },
      footer: {
        company_description: "AIPI - Advanced conversational AI platform for websites.",
        product: "Product",
        features: "Features",
        pricing: "Pricing",
        documentation: "Documentation",
        get_started: "Get Started",
        company: "Company",
        about_us: "About us",
        contact: "Contact",
        privacy_policy: "Privacy policy",
        terms_of_service: "Terms of service",
        support: "Support",
        help_center: "Help center",
        all_rights_reserved: "All rights reserved."
      },
      pricing: {
        plans: "Plans",
        title: "Choose Your Perfect Plan",
        subtitle: "Select the plan that best fits your needs and scale your business with conversational AI.",
        monthly_billing: "Monthly Billing",
        annual_billing: "Annual Billing",
        toggle_billing: "Toggle billing type",
        save_percentage: "Save 20%",
        recommended: "Recommended",
        free: "Free",
        from: "From",
        month: "month",
        year: "year",
        contact_us: "Contact Us",
        take_offer: "Take Offer",
        take_annual_offer: "Take Annual Offer",
        start_free: "Start Free",
        subscribe: "Subscribe",
        processing: "Processing...",
        spots_remaining: "Only {{remaining}} spots left out of {{total}}",
        discount_duration: "{{discount}}% discount for {{months}} months",
        promotional_price_duration: "Promotional price for {{months}} months",
        limited_launch_offer: "Limited Launch Offer",
        spots_left_of_total: "Only {{remaining}} spots left out of {{total}} in this special promotion.",
        take_advantage_unique_prices: "Take advantage of these unique prices before they return to regular prices.",
        pricing_note: "All plans include full support and free updates."
      },
      getStartedPage: {
        title: "Get Started",
        subtitle: "Integrate AIPPS into your website in minutes",
        tabs: {
          widget: "Widget",
          fullscreen: "Fullscreen",
          form: "Form"
        },
        widget: {
          step1: {
            title: "Step 1: Add this code to your website",
            description: "Copy and paste this code into your website's HTML, just before the closing </body> tag:",
            copied: "✓ Code copied to clipboard",
            wordpress_note: "If you use WordPress: You can add it in the theme in footer.php or install a plugin that allows inserting HTML code."
          },
          step2: {
            title: "Step 2: Customize your widget (optional)",
            description: "You can customize the widget's behavior and appearance by adding additional parameters:",
            customization_title: "Customization options:",
            position: "Widget position on the page",
            theme_color: "Widget primary color",
            assistant_name: "Assistant name",
            welcome_message: "Custom welcome message",
            example_title: "Custom configuration example:",
            configure_dashboard: "Configure these options from the admin panel:",
            dashboard_steps: {
              "0": "Access the \"Integrations\" section of the panel",
              "1": "Select the integration you want to configure",
              "2": "Customize colors, position and messages",
              "3": "Changes will be applied automatically"
            }
          },
          step3: {
            title: "Step 3: Train your assistant (optional)",
            description: "For your assistant to provide useful and relevant responses, you can train it with:",
            training_options: [
              "PDF documents with information about your products or services",
              "DOCX files with frequently asked questions and their answers",
              "Excel files with structured data",
              "Specific instructions about response tone and style"
            ],
            step4_title: "Step 4: Configure Forms (Optional)",
            step4_description: "Power your widget with custom forms to capture leads and specific information:",
            form_options: [
              "Contact forms and lead capture",
              "Satisfaction surveys and feedback",
              "Event registration forms",
              "Automatic CRM integration"
            ]
          }
        },
        fullscreen: {
          step1: {
            title: "Step 1: Add this code to your website",
            description: "Copy and paste this code into your website's HTML, just before the closing </body> tag:",
            copied: "✓ Code copied to clipboard",
            wordpress_note: "If you use WordPress: You can add it in the theme in footer.php or install a plugin that allows inserting HTML code."
          },
          step2: {
            title: "Step 2: Customize your experience (optional)",
            description: "Fullscreen mode creates an immersive experience similar to ChatGPT. You can customize it with:",
            customization_title: "Customization options:",
            position: "Activation button position",
            theme_color: "Chat colors and theme",
            assistant_name: "Assistant name",
            welcome_message: "Custom welcome message",
            example_title: "Custom configuration example:",
            configure_dashboard: "Configure these options from the admin panel:",
            dashboard_steps: {
              "0": "Access the \"Integrations\" section of the panel",
              "1": "Select the integration you want to configure",
              "2": "Customize colors, position and messages",
              "3": "Changes will be applied automatically"
            }
          }
        },
        form: {
          step1: {
            title: "Step 1: Add this code to your website",
            description: "Copy and paste this code into your website's HTML where you want the form to appear:",
            copied: "✓ Code copied to clipboard"
          },
          step2: {
            title: "Step 2: Customize your form (optional)",
            description: "You can customize the form's behavior and appearance by adding additional parameters:",
            customization_title: "Customization options:",
            display_type: "Display type (modal, embedded, etc.)",
            position: "Button or form position",
            theme_color: "Form primary color",
            button_text: "Button text",
            example_title: "Custom configuration example:"
          },
          step3: {
            title: "Step 3: Manage from Dashboard",
            description: "Once the form is integrated, you can manage it completely from your admin panel:",
            dashboard_steps: [
              "Access the \"Forms\" section of the panel",
              "Select the form you want to configure",
              "Customize fields, validations and automatic responses",
              "Review responses and statistics in real time"
            ]
          }
        },
        buttons: {
          go_to_integrations: "Go to integrations",
          login_to_manage: "Log in to manage",
          manage_content: "Manage content",
          create_account: "Create account",
          create_forms: "Create forms",
          create_account_forms: "Create account for forms",
          configure_auth: "Configure authentication",
          login: "Log in",
          configure_sections: "Configure sections",
          configure_assistant: "Configure assistant",
          configure_advanced_forms: "Configure advanced forms",
          create_account_advanced: "Create advanced account",
          go_to_forms: "Go to forms",
          login_to_manage_forms: "Log in to manage forms",
          forms_guide: "Forms guide",
          view_docs: "View documentation",
          contact_support: "Contact support"
        },
        cta: {
          forms_title: "Ready to create your forms?",
          forms_description: "Start capturing leads with our custom forms today."
        }
      }
    }
  }
};

// Debug de los recursos cargados
console.log('🔍 I18N DEBUG - Manual resources loaded:', {
  fr: {
    pricing: Object.keys(resources.fr.translation.pricing),
    language: Object.keys(resources.fr.translation.language),
    getStartedPage: Object.keys(resources.fr.translation.getStartedPage)
  },
  es: {
    pricing: Object.keys(resources.es.translation.pricing),
    language: Object.keys(resources.es.translation.language),
    getStartedPage: Object.keys(resources.es.translation.getStartedPage)
  },
  en: {
    pricing: Object.keys(resources.en.translation.pricing),
    language: Object.keys(resources.en.translation.language),
    getStartedPage: Object.keys(resources.en.translation.getStartedPage)
  }
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'es',
    fallbackLng: 'en',
    debug: false, // Reducir debug para limpiar consola
    returnObjects: false,
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
    
    react: {
      useSuspense: false,
    }
  });

export default i18n;