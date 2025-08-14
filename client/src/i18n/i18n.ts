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
      task_automation: "Automatisation des Tâches",
      task_automation_description: "Configurez des tâches et flux de travail automatisés alimentés par l'IA.",
      create_automation: "Créer une Automatisation",
      conversations_for: "Conversations pour",
      view_all_conversations_for_integration: "Voir toutes les conversations pour cette intégration",
      search_conversations: "Rechercher dans les conversations...",
      edit_integration: "Modifier l'intégration",
      view_analytics: "Voir les analyses",
      visitor: "Visiteur",
      anonymous: "Anonyme",
      resolved: "Résolu",
      unresolved: "Non résolu",
      messages: "messages",
      loading: "Chargement...",
      back: "Retour",
      no_conversations_found: "Aucune conversation trouvée",
      details: "Détails",
      settings: "Paramètres",
      settings_description: "Configurez les paramètres de votre assistant AIPPS.",
      ai_assistant_settings: "Paramètres de l'Assistant IA",
      assistant_name: "Nom de l'Assistant",
      default_greeting: "Salutation par Défaut",
      conversation_style: "Style de Conversation",
      show_availability: "Afficher la Disponibilité",
      appearance: "Apparence",
      chat_font: "Police du Chat",
      user_message_color: "Couleur du Message Utilisateur",
      assistant_message_color: "Couleur du Message Assistant",
      welcome_chat: "Chat de Bienvenue",
      status: "État",
      welcome_message: "Message de Bienvenue",
      bubble_color: "Couleur de Bulle",
      text_color: "Couleur du Texte",
      enabled: "Activé",
      disabled: "Désactivé",
      system_default: "Par Défaut du Système",
      professional: "Professionnel",
      edit_settings: "Modifier les Paramètres",
      no_settings_found: "Aucun paramètre trouvé",
      no_settings_description: "Créez les paramètres de votre assistant pour personnaliser votre expérience AIPPS",
      configure_settings: "Configurer les Paramètres",
      integrations: "Intégrations",
      integrations_description: "Créez et gérez les intégrations de sites web pour AIPPS.",
      create_integration: "Créer une Intégration",
      no_integrations: "Pas encore d'intégrations",
      add_new_integration_desc: "Ajoutez une nouvelle intégration de site web pour connecter AIPPS à votre site",
      forms: "Formulaires",
      forms_description: "Créez et gérez vos formulaires.",
      create_form: "Créer un Formulaire",
      conversations_description: "Examinez et gérez les conversations avec vos visiteurs.",
      new: "Nouveau",
      no_conversations_matching_search: "Aucune conversation trouvée correspondant à votre recherche",
      no_conversations_for_integration: "Pas encore de conversations pour cette intégration",
      recent_conversations: "Conversations Récentes",
      total_conversations: "Total des Conversations",
      resolution_rate: "Taux de Résolution",
      average_response_time: "Temps de Réponse Moyen",
      minutes: "minutes",
      yes: "Oui",
      no: "Non",
      completed: "Terminé",
      view: "Voir",
      last_message: "Dernier message",
      no_conversations: "Pas encore de conversations",
      conversations_empty_message: "Lorsque les visiteurs interagissent avec votre widget de chat, les conversations apparaîtront ici",
      success: "Succès",
      error: "Erreur",
      form_deleted_successfully: "Formulaire supprimé avec succès",
      error_deleting_form: "Erreur lors de la suppression du formulaire",
      no_description: "Aucune description",
      responses: "réponses",
      no_forms: "Pas encore de formulaires",
      forms_empty_message: "Créez votre premier formulaire pour commencer à capturer des données de visiteurs",
      dashboard_title: "Tableau de Bord",
      manage_assistant: "Gérez votre assistant IA et configurez les intégrations",
      avg_response_time: "Temps de Réponse Moyen",
      confirm_delete: "Confirmer la Suppression",
      delete_form_confirmation: "Êtes-vous sûr de vouloir supprimer ce formulaire ? Cette action ne peut pas être annulée et supprimera également toutes les réponses.",
      cancel: "Annuler",
      deleting: "Suppression...",
      no_automations: "Pas encore d'automatisations",
      automations_empty_message: "Créez votre première automatisation pour rationaliser les tâches répétitives avec l'IA",
      view_logs: "Voir les Journaux",
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
        pricing_note: "Tous les plans incluent un support complet et des mises à jour gratuites.",
        login_required: "Connexion requise",
        login_description: "Vous devez vous connecter pour vous abonner à un plan",
        success: "Succès !",
        error: "Erreur",
        free_plan_activated: "Plan gratuit activé avec succès",
        process_error: "Erreur lors du traitement de la demande",
        faq: {
          title: "Questions Fréquentes",
          q1: "Puis-je changer de plan à tout moment ?",
          a1: "Oui, vous pouvez mettre à niveau ou réduire votre plan à tout moment depuis votre tableau de bord."
        },
        support: {
          title: "Support",
          q1: "Quel type de support est inclus ?",
          a1: "Tous les plans incluent un support par email. Les plans Pro et Enterprise incluent un support prioritaire."
        },
        refund: {
          title: "Politique de Remboursement",
          q1: "Offrez-vous une garantie de remboursement ?",
          a1: "Nous offrons une garantie de remboursement de 30 jours pour tous les plans payants."
        }
      },
      help: {
        title: "Centre d'Aide",
        subtitle: "Trouvez des réponses à vos questions et apprenez à utiliser AIPPS",
        search_placeholder: "Rechercher des articles d'aide...",
        popular: {
          title: "Articles Populaires",
          badge: "Populaire",
          article1: "Comment intégrer le widget sur votre site web",
          article2: "Personnaliser l'assistant conversationnel",
          article3: "Configurer les formulaires de capture de leads",
          article4: "Analyser les métriques et conversations",
          article5: "Entraîner votre assistant avec des documents"
        },
        categories: {
          title: "Catégories d'Aide",
          getting_started: {
            title: "Premiers Pas",
            description: "Tout ce dont vous avez besoin pour commencer avec AIPPS",
            article1: "Créer votre premier compte AIPPS",
            article2: "Configuration initiale du tableau de bord",
            article3: "Guide de démarrage rapide pour les widgets",
            article4: "Bases de l'IA conversationnelle"
          },
          configuration: {
            title: "Configuration",
            description: "Personnalisez AIPPS selon vos besoins",
            article1: "Personnaliser les couleurs et le thème du widget",
            article2: "Configurer les messages de bienvenue",
            article3: "Définir les heures de disponibilité",
            article4: "Gestion des langues et traductions"
          },
          integration: {
            title: "Intégration",
            description: "Connectez AIPPS avec votre site web et vos outils",
            article1: "Intégrer le widget dans WordPress",
            article2: "Implémentation Shopify",
            article3: "Code d'intégration personnalisé",
            article4: "Intégration CRM et outils"
          },
          billing: {
            title: "Facturation",
            description: "Gérez votre abonnement et vos paiements",
            article1: "Changer de plan d'abonnement",
            article2: "Informations de facturation et paiement",
            article3: "Politique de remboursement",
            article4: "Questions fréquemment posées sur les prix"
          },
          troubleshooting: {
            title: "Dépannage",
            description: "Résolvez les problèmes techniques courants",
            article1: "Le widget n'apparaît pas sur mon site",
            article2: "Problèmes de connexion du chat",
            article3: "L'assistant ne répond pas correctement",
            article4: "Problèmes avec les formulaires"
          },
          account: {
            title: "Compte",
            description: "Gérez votre profil et les paramètres de compte",
            article1: "Changer le mot de passe et les données de profil",
            article2: "Paramètres de notification",
            article3: "Gérer les utilisateurs et permissions",
            article4: "Supprimer ou fermer le compte"
          }
        },
        contact_support: {
          title: "Besoin d'Aide Supplémentaire ?",
          description: "Si vous ne trouvez pas ce que vous cherchez, notre équipe est là pour vous aider",
          contact_button: "Contacter le Support",
          email_button: "Envoyer un Email"
        }
      },
      about: {
        title: "À Propos d'AIPPS",
        subtitle: "Découvrez notre mission de transformer la communication web avec l'intelligence artificielle",
        mission: {
          title: "Notre Mission",
          description: "Démocratiser l'accès à l'IA conversationnelle pour tous les sites web du monde"
        },
        vision: {
          title: "Notre Vision",
          description: "Créer un avenir où chaque interaction web est intelligente et personnalisée"
        },
        global: {
          title: "Portée Mondiale",
          description: "Nous servons des entreprises de toutes tailles dans plus de 50 pays"
        },
        innovation: {
          title: "Innovation",
          description: "Pionniers de la technologie d'IA conversationnelle avec plus de 5 ans d'expérience"
        }
      },
      contact: {
        title: "Contactez-Nous",
        subtitle: "Nous sommes là pour vous aider. Contactez notre équipe",
        info: {
          title: "Informations de Contact",
          email: "support@aipps.ca",
          phone: "+1 (555) 123-4567",
          address: "123 Innovation Street, Tech City, TC 12345",
          hours: "Lundi au Vendredi : 9h00 - 18h00 (EST)"
        },
        form: {
          title: "Envoyez-nous un Message",
          name_label: "Nom",
          name_placeholder: "Votre nom",
          email_label: "Email",
          email_placeholder: "votre@email.com",
          subject_label: "Sujet",
          subject_placeholder: "Comment pouvons-nous vous aider ?",
          message_label: "Message",
          message_placeholder: "Décrivez votre demande...",
          send_button: "Envoyer le Message",
          sending_button: "Envoi en cours...",
          success_title: "Message Envoyé",
          success_message: "Merci de nous avoir contactés. Nous vous répondrons bientôt."
        }
      },
      privacy: {
        title: "Politique de Confidentialité",
        subtitle: "Comment nous collectons, utilisons et protégeons vos informations",
        data_collection: {
          title: "Collecte de Données",
          description: "Nous collectons des informations pour fournir et améliorer nos services :",
          item1: "Informations de compte (nom, email, détails de contact)",
          item2: "Données d'utilisation et d'analyse du widget",
          item3: "Informations techniques (IP, navigateur, appareil)",
          item4: "Contenu des conversations pour l'entraînement de l'IA"
        },
        data_usage: {
          title: "Utilisation des Données",
          description: "Nous utilisons vos données aux fins suivantes :",
          item1: "Fournir et maintenir nos services",
          item2: "Améliorer l'expérience utilisateur",
          item3: "Analyse et statistiques de performance",
          item4: "Communications de support et mises à jour"
        },
        data_sharing: {
          title: "Partage de Données",
          description: "Nous ne vendons ni ne louons vos informations personnelles. Nous ne les partageons que dans ces cas :",
          item1: "Avec des fournisseurs de services nécessaires au fonctionnement",
          item2: "Lorsque requis par la loi",
          item3: "Avec votre consentement explicite"
        },
        security: {
          title: "Sécurité",
          description: "Nous mettons en place des mesures de sécurité pour protéger vos informations",
          item1: "Chiffrement des données en transit et au repos",
          item2: "Authentification à deux facteurs disponible",
          item3: "Audits de sécurité réguliers",
          item4: "Conformité aux normes de sécurité internationales"
        },
        user_rights: {
          title: "Vos Droits",
          description: "Vous avez le droit d'accéder, corriger ou supprimer vos informations personnelles",
          item1: "Accéder à vos données personnelles stockées",
          item2: "Demander la correction d'informations incorrectes",
          item3: "Supprimer votre compte et les données associées",
          item4: "Exporter vos données dans un format portable"
        },
        contact: {
          title: "Contact",
          description: "Pour les questions de confidentialité, contactez-nous à privacy@aipps.ca"
        }
      },
      terms: {
        title: "Conditions d'Utilisation",
        subtitle: "Termes et conditions d'utilisation d'AIPPS",
        acceptance: {
          title: "Acceptation des Conditions",
          description: "En utilisant AIPPS, vous acceptez ces termes et conditions"
        },
        services: {
          title: "Description du Service",
          description: "AIPPS fournit des outils d'IA conversationnelle pour sites web :",
          item1: "Widgets de chat intelligents",
          item2: "Formulaires de capture de leads",
          item3: "Analyses et métriques",
          item4: "Intégration de sites web"
        },
        user_obligations: {
          title: "Obligations de l'Utilisateur",
          description: "En tant qu'utilisateur, vous vous engagez à :",
          item1: "Utiliser le service de manière légale et éthique",
          item2: "Ne pas interférer avec le fonctionnement du système",
          item3: "Maintenir la sécurité de votre compte",
          item4: "Respecter les droits de propriété intellectuelle"
        },
        payment: {
          title: "Conditions de Paiement",
          description: "Les conditions de paiement incluent :",
          item1: "Facturation mensuelle ou annuelle selon le plan choisi",
          item2: "Les paiements ne sont pas remboursables sauf exceptions",
          item3: "Les prix peuvent changer avec préavis",
          item4: "La suspension pour non-paiement est immédiate"
        },
        intellectual_property: {
          title: "Propriété Intellectuelle",
          description: "Tous les droits de propriété intellectuelle d'AIPPS nous appartiennent :",
          item1: "Logiciel et technologie AIPPS",
          item2: "Marques commerciales et logos",
          item3: "Contenu et documentation"
        },
        limitation: {
          title: "Limitation de Responsabilité",
          description: "AIPPS n'est pas responsable des dommages indirects ou de la perte de données"
        },
        termination: {
          title: "Résiliation",
          description: "Toute partie peut résilier l'accord :",
          item1: "L'utilisateur peut annuler à tout moment",
          item2: "AIPPS peut suspendre les comptes pour violation des conditions",
          item3: "Les données seront supprimées selon la politique de rétention"
        }
      },
      documentation: {
        title: "Documentation AIPPS",
        subtitle: "Guide complet pour implémenter et utiliser AIPPS sur votre site web",
        overview: "Aperçu",
        features: "Fonctionnalités",
        implementation: "Implémentation",
        api_reference: "Référence API",
        support: "Support",
        widget_integration: "Intégration de Widget",
        contextual_understanding: "Compréhension Contextuelle",
        document_training: "Entraînement avec Documents",
        lead_capture: "Capture de Leads",
        analytics: "Analytiques",
        task_automation: "Automatisation des Tâches",
        form_creation: "Création de Formulaires",
        overview_content: "AIPPS est une plateforme d'IA conversationnelle avancée qui permet aux sites web d'offrir des expériences de chat intelligentes et personnalisées.",
        generated_on: "Généré le",
        language: "Langue",
        table_of_contents: "Table des Matières"
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
          },
          step4: {
            title: "Étape 4: Configurer l'Authentification (Optionnel)",
            description: "Activez les fonctionnalités avancées avec le système d'utilisateurs:",
            feature_1: "Historique personnel des conversations",
            feature_2: "Personnalisation des préférences",
            feature_3: "Suivi des progrès utilisateur",
            feature_4: "Analyses détaillées par utilisateur"
          },
          step5: {
            title: "Étape 5: Configuration Avancée de l'Assistant",
            description: "Optimisez l'expérience de l'assistant:",
            feature_1: "Personnalité et ton des réponses",
            feature_2: "Base de connaissances spécialisée",
            feature_3: "Flux de conversation prédéfinis",
            feature_4: "Intégration d'outils externes"
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
            example_title: "Exemple de configuration personnalisée:",
            basic_attributes: "Attributs de Base:",
            attributes: {
              form_id: "ID unique du formulaire",
              display_type: "Type d'affichage (modal, inline, popup)",
              position: "Position sur la page",
              button_text: "Texte du bouton d'activation"
            },
            customization_attributes: "Attributs de Personnalisation:",
            icon: "Icône personnalisée",
            button_size: "Taille du bouton",
            auto_show: "Afficher automatiquement"
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
        fullscreen_features: {
          title: "Fonctionnalités du Mode Plein Écran",
          register_login: "Inscription et connexion utilisateur",
          personal_history: "Historique personnel des conversations",
          auto_titles: "Titres automatiques des conversations",
          conversation_management: "Gestion complète des conversations",
          user_info: "Informations utilisateur intégrées",
          jwt_security: "Sécurité JWT intégrée",
          visual_customization: "Personnalisation visuelle avancée",
          brand_colors: "Couleurs de marque personnalisables",
          welcome_messages: "Messages de bienvenue configurables",
          registration_config: "Configuration d'inscription flexible",
          privacy_settings: "Paramètres de confidentialité granulaires"
        },
        ignored_sections: {
          step3_title: "Étape 3: Configurer les Sections Ignorées (Optionnel)",
          title: "Sections Ignorées",
          description: "Définissez quelles parties de votre site web l'assistant doit ignorer lors de l'analyse du contenu:",
          benefit_1: "Éviter la confusion avec des éléments non pertinents comme les menus ou la publicité",
          benefit_2: "Améliorer la précision des réponses de l'assistant",
          benefit_3: "Réduire le bruit dans l'entraînement automatique",
          benefit_4: "Concentrer l'analyse sur le contenu pertinent",
          config_example: "aipi('init', {\n  apiKey: 'VOTRE_CLE_API',\n  // Autres configurations...\n  ignoredSections: ['Menu principal', 'Pied de page', 'Barre latérale', 'Publicité'],\n});",
          config_description: "Configurez depuis le panneau d'administration:",
          step_1: "Accédez à \"Paramètres\" → \"Analyse de Contenu\"",
          step_2: "Ajoutez des sélecteurs CSS ou noms de sections à ignorer",
          step_3: "Sauvegardez les modifications pour les appliquer immédiatement",
          step_4: "L'assistant mettra à jour sa compréhension automatiquement"
        },
        support: {
          title: "Support et Ressources",
          description: "Obtenez de l'aide et des ressources pour maximiser votre expérience AIPPS"
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
      task_automation: "Automatización de tareas",
      task_automation_description: "Configura tareas y flujos de trabajo automatizados impulsados por IA.",
      create_automation: "Crear Automatización",
      conversations_for: "Conversaciones de",
      view_all_conversations_for_integration: "Ver todas las conversaciones para esta integración",
      search_conversations: "Buscar conversaciones...",
      edit_integration: "Editar integración",
      view_analytics: "Ver analíticas",
      visitor: "Visitante",
      anonymous: "Anónimo",
      resolved: "Resuelto",
      unresolved: "Sin resolver",
      messages: "mensajes",
      loading: "Cargando...",
      back: "Volver",
      no_conversations_found: "No se encontraron conversaciones",
      details: "Detalles",
      settings: "Configuración",
      settings_description: "Configura los ajustes de tu asistente AIPPS.",
      ai_assistant_settings: "Configuración del Asistente IA",
      assistant_name: "Nombre del Asistente",
      default_greeting: "Saludo Predeterminado",
      conversation_style: "Estilo de Conversación",
      show_availability: "Mostrar Disponibilidad",
      appearance: "Apariencia",
      chat_font: "Fuente del Chat",
      user_message_color: "Color del Mensaje del Usuario",
      assistant_message_color: "Color del Mensaje del Asistente",
      welcome_chat: "Chat de Bienvenida",
      status: "Estado",
      welcome_message: "Mensaje de Bienvenida",
      bubble_color: "Color de Burbuja",
      text_color: "Color de Texto",
      enabled: "Activado",
      disabled: "Desactivado",
      system_default: "Predeterminado del Sistema",
      professional: "Profesional",
      edit_settings: "Editar Configuración",
      no_settings_found: "No se encontraron configuraciones",
      no_settings_description: "Crea la configuración de tu asistente para personalizar tu experiencia AIPPS",
      configure_settings: "Configurar Configuración",
      integrations: "Integraciones",
      integrations_description: "Crea y gestiona integraciones de sitios web para AIPPS.",
      create_integration: "Crear Integración",
      no_integrations: "Sin integraciones aún",
      add_new_integration_desc: "Agrega una nueva integración de sitio web para conectar AIPPS con tu sitio",
      forms: "Formularios",
      forms_description: "Crea y gestiona formularios para capturar leads y datos de visitantes.",
      create_form: "Crear formulario",
      conversations_description: "Revisa y gestiona las conversaciones con tus visitantes.",
      new: "Nuevo",
      no_conversations_matching_search: "No se encontraron conversaciones que coincidan con tu búsqueda",
      no_conversations_for_integration: "No hay conversaciones para esta integración aún",
      recent_conversations: "Conversaciones Recientes",
      total_conversations: "Total de Conversaciones",
      resolution_rate: "Tasa de Resolución",
      average_response_time: "Tiempo Promedio de Respuesta",
      minutes: "minutos",
      yes: "Sí",
      no: "No",
      completed: "Completado",
      view: "Ver",
      last_message: "Último mensaje",
      no_conversations: "Aún no hay conversaciones",
      conversations_empty_message: "Cuando los visitantes interactúen con tu widget de chat, las conversaciones aparecerán aquí",
      success: "Éxito",
      error: "Error",
      form_deleted_successfully: "Formulario eliminado exitosamente",
      error_deleting_form: "Error al eliminar formulario",
      no_description: "Sin descripción",
      responses: "respuestas",
      no_forms: "Aún no hay formularios",
      forms_empty_message: "Crea tu primer formulario para comenzar a capturar datos de visitantes",
      dashboard_title: "Panel de Control",
      manage_assistant: "Gestiona tu asistente de IA y configura integraciones",
      avg_response_time: "Tiempo Promedio de Respuesta",
      confirm_delete: "Confirmar Eliminación",
      delete_form_confirmation: "¿Estás seguro de que quieres eliminar este formulario? Esta acción no se puede deshacer y también eliminará todas las respuestas.",
      cancel: "Cancelar",
      deleting: "Eliminando...",
      no_automations: "Aún no hay automatizaciones",
      automations_empty_message: "Crea tu primera automatización para agilizar tareas repetitivas con IA",
      view_logs: "Ver Registros",
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
        pricing_note: "Todos los planes incluyen soporte completo y actualizaciones gratuitas.",
        login_required: "Inicio de sesión requerido",
        login_description: "Necesitas iniciar sesión para suscribirte a un plan",
        success: "¡Éxito!",
        error: "Error",
        free_plan_activated: "Plan gratuito activado correctamente",
        process_error: "Error al procesar la solicitud",
        faq: {
          title: "Preguntas Frecuentes",
          q1: "¿Puedo cambiar de plan en cualquier momento?",
          a1: "Sí, puedes actualizar o reducir tu plan en cualquier momento desde tu panel de control."
        },
        support: {
          title: "Soporte",
          q1: "¿Qué tipo de soporte está incluido?",
          a1: "Todos los planes incluyen soporte por email. Los planes Pro y Enterprise incluyen soporte prioritario."
        },
        refund: {
          title: "Política de Reembolso",
          q1: "¿Ofrecen garantía de devolución de dinero?",
          a1: "Ofrecemos una garantía de devolución de dinero de 30 días para todos los planes de pago."
        }
      },
      help: {
        title: "Centro de Ayuda",
        subtitle: "Encuentra respuestas a tus preguntas y aprende a usar AIPPS",
        search_placeholder: "Buscar artículos de ayuda...",
        popular: {
          title: "Artículos Populares",
          badge: "Popular",
          article1: "Cómo integrar el widget en tu sitio web",
          article2: "Personalizar el asistente conversacional",
          article3: "Configurar formularios de captura de leads",
          article4: "Analizar métricas y conversaciones",
          article5: "Entrenar tu asistente con documentos"
        },
        categories: {
          title: "Categorías de Ayuda",
          getting_started: {
            title: "Primeros Pasos",
            description: "Todo lo que necesitas para comenzar con AIPPS",
            article1: "Crear tu primera cuenta en AIPPS",
            article2: "Configuración inicial del panel de control",
            article3: "Guía de inicio rápido para widgets",
            article4: "Conceptos básicos de IA conversacional"
          },
          configuration: {
            title: "Configuración",
            description: "Personaliza AIPPS según tus necesidades",
            article1: "Personalizar colores y tema del widget",
            article2: "Configurar mensajes de bienvenida",
            article3: "Establecer horarios de disponibilidad",
            article4: "Gestión de idiomas y traducciones"
          },
          integration: {
            title: "Integración",
            description: "Conecta AIPPS con tu sitio web y herramientas",
            article1: "Integrar widget en WordPress",
            article2: "Implementación en Shopify",
            article3: "Código de integración personalizado",
            article4: "Integración con CRM y herramientas"
          },
          billing: {
            title: "Facturación",
            description: "Gestiona tu suscripción y pagos",
            article1: "Cambiar de plan de suscripción",
            article2: "Información de facturación y pagos",
            article3: "Política de reembolsos",
            article4: "Preguntas frecuentes sobre precios"
          },
          troubleshooting: {
            title: "Solución de Problemas",
            description: "Resuelve problemas técnicos comunes",
            article1: "El widget no aparece en mi sitio",
            article2: "Problemas de conexión del chat",
            article3: "El asistente no responde correctamente",
            article4: "Problemas con formularios"
          },
          account: {
            title: "Cuenta",
            description: "Gestiona tu perfil y configuración de cuenta",
            article1: "Cambiar contraseña y datos de perfil",
            article2: "Configuración de notificaciones",
            article3: "Gestionar usuarios y permisos",
            article4: "Eliminar o cerrar cuenta"
          }
        },
        contact_support: {
          title: "¿Necesitas más ayuda?",
          description: "Si no encuentras lo que buscas, nuestro equipo está aquí para ayudarte",
          contact_button: "Contactar Soporte",
          email_button: "Enviar Email"
        }
      },
      about: {
        title: "Acerca de AIPPS",
        subtitle: "Conoce nuestra misión de transformar la comunicación web con inteligencia artificial",
        mission: {
          title: "Nuestra Misión",
          description: "Democratizar el acceso a la IA conversacional para todos los sitios web del mundo"
        },
        vision: {
          title: "Nuestra Visión",
          description: "Crear un futuro donde cada interacción web sea inteligente y personalizada"
        },
        global: {
          title: "Alcance Global",
          description: "Servimos a empresas de todos los tamaños en más de 50 países"
        },
        innovation: {
          title: "Innovación",
          description: "Pioneros en tecnología de IA conversacional con más de 5 años de experiencia"
        }
      },
      contact: {
        title: "Contáctanos",
        subtitle: "Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo",
        info: {
          title: "Información de Contacto",
          email: "support@aipps.ca",
          phone: "+1 (555) 123-4567",
          address: "123 Innovation Street, Tech City, TC 12345",
          hours: "Lunes a Viernes: 9:00 AM - 6:00 PM (EST)"
        },
        form: {
          title: "Envíanos un Mensaje",
          name_label: "Nombre",
          name_placeholder: "Tu nombre",
          email_label: "Email",
          email_placeholder: "tu@email.com",
          subject_label: "Asunto",
          subject_placeholder: "¿En qué podemos ayudarte?",
          message_label: "Mensaje",
          message_placeholder: "Describe tu consulta...",
          send_button: "Enviar Mensaje",
          sending_button: "Enviando...",
          success_title: "Mensaje Enviado",
          success_message: "Gracias por contactarnos. Te responderemos pronto."
        }
      },
      privacy: {
        title: "Política de Privacidad",
        subtitle: "Cómo recopilamos, usamos y protegemos tu información",
        data_collection: {
          title: "Recopilación de Datos",
          description: "Recopilamos información para brindar y mejorar nuestros servicios:",
          item1: "Información de cuenta (nombre, email, datos de contacto)",
          item2: "Datos de uso y análisis del widget",
          item3: "Información técnica (IP, navegador, dispositivo)",
          item4: "Contenido de conversaciones para entrenamiento de IA"
        },
        data_usage: {
          title: "Uso de Datos",
          description: "Utilizamos tus datos para los siguientes propósitos:",
          item1: "Proporcionar y mantener nuestros servicios",
          item2: "Mejorar la experiencia del usuario",
          item3: "Análisis y estadísticas de rendimiento",
          item4: "Comunicaciones de soporte y actualizaciones"
        },
        data_sharing: {
          title: "Compartir Datos",
          description: "No vendemos ni alquilamos tu información personal. Solo la compartimos en estos casos:",
          item1: "Con proveedores de servicios necesarios para el funcionamiento",
          item2: "Cuando sea requerido por ley",
          item3: "Con tu consentimiento explícito"
        },
        security: {
          title: "Seguridad",
          description: "Implementamos medidas de seguridad para proteger tu información",
          item1: "Cifrado de datos en tránsito y reposo",
          item2: "Autenticación de dos factores disponible",
          item3: "Auditorías de seguridad regulares",
          item4: "Cumplimiento con estándares internacionales de seguridad"
        },
        user_rights: {
          title: "Tus Derechos",
          description: "Tienes derecho a acceder, corregir o eliminar tu información personal",
          item1: "Acceder a tus datos personales almacenados",
          item2: "Solicitar corrección de información incorrecta",
          item3: "Eliminar tu cuenta y datos asociados",
          item4: "Exportar tus datos en formato portable"
        },
        contact: {
          title: "Contacto",
          description: "Para preguntas sobre privacidad, contáctanos en privacy@aipps.ca"
        }
      },
      terms: {
        title: "Términos de Servicio",
        subtitle: "Términos y condiciones de uso de AIPPS",
        acceptance: {
          title: "Aceptación de Términos",
          description: "Al usar AIPPS, aceptas estos términos y condiciones"
        },
        services: {
          title: "Descripción del Servicio",
          description: "AIPPS proporciona herramientas de IA conversacional para sitios web:",
          item1: "Widgets de chat inteligentes",
          item2: "Formularios de captura de leads",
          item3: "Análisis y métricas",
          item4: "Integración con sitios web"
        },
        user_obligations: {
          title: "Obligaciones del Usuario",
          description: "Como usuario, te comprometes a:",
          item1: "Usar el servicio de manera legal y ética",
          item2: "No interferir con el funcionamiento del sistema",
          item3: "Mantener la seguridad de tu cuenta",
          item4: "Respetar los derechos de propiedad intelectual"
        },
        payment: {
          title: "Términos de Pago",
          description: "Los términos de pago incluyen:",
          item1: "Facturación mensual o anual según el plan elegido",
          item2: "Los pagos son no reembolsables salvo excepciones",
          item3: "Los precios pueden cambiar con aviso previo",
          item4: "La suspensión por falta de pago es inmediata"
        },
        intellectual_property: {
          title: "Propiedad Intelectual",
          description: "Todos los derechos de propiedad intelectual de AIPPS nos pertenecen:",
          item1: "Software y tecnología de AIPPS",
          item2: "Marcas comerciales y logotipos",
          item3: "Contenido y documentación"
        },
        limitation: {
          title: "Limitación de Responsabilidad",
          description: "AIPPS no se hace responsable por daños indirectos o pérdidas de datos"
        },
        termination: {
          title: "Terminación",
          description: "Cualquier parte puede terminar el acuerdo:",
          item1: "El usuario puede cancelar en cualquier momento",
          item2: "AIPPS puede suspender cuentas por violación de términos",
          item3: "Los datos se eliminarán según la política de retención"
        }
      },
      documentation: {
        title: "Documentación AIPPS",
        subtitle: "Guía completa para implementar y usar AIPPS en tu sitio web",
        overview: "Visión General",
        features: "Características",
        implementation: "Implementación",
        api_reference: "Referencia API",
        support: "Soporte",
        widget_integration: "Integración de Widget",
        contextual_understanding: "Comprensión Contextual",
        document_training: "Entrenamiento con Documentos",
        lead_capture: "Captura de Leads",
        analytics: "Análisis",
        task_automation: "Automatización de Tareas",
        form_creation: "Creación de Formularios",
        overview_content: "AIPPS es una plataforma avanzada de IA conversacional que permite a los sitios web ofrecer experiencias de chat inteligentes y personalizadas.",
        generated_on: "Generado el",
        language: "Idioma",
        table_of_contents: "Índice de Contenidos"
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
          },
          step4: {
            title: "Paso 4: Configurar Autenticación (Opcional)",
            description: "Habilita funciones avanzadas con sistema de usuarios:",
            feature_1: "Historial personal de conversaciones",
            feature_2: "Personalización de preferencias",
            feature_3: "Seguimiento de progreso usuario",
            feature_4: "Análisis detallados por usuario"
          },
          step5: {
            title: "Paso 5: Configuración Avanzada del Asistente",
            description: "Optimiza la experiencia del asistente:",
            feature_1: "Personalidad y tono de respuestas",
            feature_2: "Base de conocimiento especializada",
            feature_3: "Flujos de conversación predefinidos",
            feature_4: "Integración con herramientas externas"
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
            example_title: "Ejemplo de configuración personalizada:",
            basic_attributes: "Atributos Básicos:",
            attributes: {
              form_id: "ID único del formulario",
              display_type: "Tipo de visualización (modal, inline, popup)",
              position: "Posición en la página",
              button_text: "Texto del botón de activación"
            },
            customization_attributes: "Atributos de Personalización:",
            icon: "Icono personalizado",
            button_size: "Tamaño del botón",
            auto_show: "Mostrar automáticamente"
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
        fullscreen_features: {
          title: "Características del Modo Pantalla Completa",
          register_login: "Registro e inicio de sesión de usuarios",
          personal_history: "Historial personal de conversaciones",
          auto_titles: "Títulos automáticos para conversaciones",
          conversation_management: "Gestión completa de conversaciones",
          user_info: "Información de usuario integrada",
          jwt_security: "Seguridad JWT incorporada",
          visual_customization: "Personalización visual avanzada",
          brand_colors: "Colores de marca personalizables",
          welcome_messages: "Mensajes de bienvenida configurables",
          registration_config: "Configuración de registro flexible",
          privacy_settings: "Configuración de privacidad granular"
        },
        ignored_sections: {
          step3_title: "Paso 3: Configura Secciones Ignoradas (Opcional)",
          title: "Secciones Ignoradas",
          description: "Define qué partes de tu sitio web debe ignorar el asistente al analizar contenido:",
          benefit_1: "Evita confusión con elementos irrelevantes como menús o publicidad",
          benefit_2: "Mejora la precisión de las respuestas del asistente",
          benefit_3: "Reduce el ruido en el entrenamiento automático",
          benefit_4: "Enfoca el análisis en contenido relevante",
          config_example: "aipi('init', {\n  apiKey: 'TU_API_KEY',\n  // Otras configuraciones...\n  ignoredSections: ['Menú principal', 'Footer', 'Sidebar', 'Publicidad'],\n});",
          config_description: "Configura desde el panel de administración:",
          step_1: "Accede a \"Configuración\" → \"Análisis de Contenido\"",
          step_2: "Agrega selectores CSS o nombres de secciones a ignorar",
          step_3: "Guarda cambios para aplicar inmediatamente",
          step_4: "El asistente actualizará su comprensión automáticamente"
        },
        support: {
          title: "Soporte y Recursos",
          description: "Obtén ayuda y recursos para maximizar tu experiencia con AIPPS"
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
      task_automation: "Task Automation",
      task_automation_description: "Set up automated tasks and workflows powered by AI.",
      create_automation: "Create Automation",
      conversations_for: "Conversations for",
      view_all_conversations_for_integration: "View all conversations for this integration",
      search_conversations: "Search conversations...",
      edit_integration: "Edit integration",
      view_analytics: "View analytics",
      visitor: "Visitor",
      anonymous: "Anonymous",
      resolved: "Resolved",
      unresolved: "Unresolved",
      messages: "messages",
      loading: "Loading...",
      back: "Back",
      no_conversations_found: "No conversations found",
      details: "Details",
      settings: "Settings",
      settings_description: "Configure your AIPPS assistant settings.",
      ai_assistant_settings: "AI Assistant Settings",
      assistant_name: "Assistant Name",
      default_greeting: "Default Greeting",
      conversation_style: "Conversation Style",
      show_availability: "Show Availability",
      appearance: "Appearance",
      chat_font: "Chat Font",
      user_message_color: "User Message Color",
      assistant_message_color: "Assistant Message Color",
      welcome_chat: "Welcome Chat",
      status: "Status",
      welcome_message: "Welcome Message",
      bubble_color: "Bubble Color",
      text_color: "Text Color",
      enabled: "Enabled",
      disabled: "Disabled",
      system_default: "System Default",
      professional: "Professional",
      edit_settings: "Edit Settings",
      no_settings_found: "No settings found",
      no_settings_description: "Create your assistant settings to customize your AIPPS experience",
      configure_settings: "Configure Settings",
      integrations: "Integrations",
      integrations_description: "Create and manage website integrations for AIPPS.",
      create_integration: "Create Integration",
      no_integrations: "No integrations yet",
      add_new_integration_desc: "Add a new website integration to connect AIPPS with your site",
      forms: "Forms",
      forms_description: "Create and manage your forms.",
      create_form: "Create Form",
      conversations_description: "Review and manage conversations with your visitors.",
      new: "New",
      no_conversations_matching_search: "No conversations found matching your search",
      no_conversations_for_integration: "No conversations for this integration yet",
      recent_conversations: "Recent Conversations",
      total_conversations: "Total Conversations",
      resolution_rate: "Resolution Rate",
      average_response_time: "Average Response Time",
      minutes: "minutes",
      yes: "Yes",
      no: "No",
      completed: "Completed",
      view: "View",
      last_message: "Last message",
      no_conversations: "No conversations yet",
      conversations_empty_message: "When visitors interact with your chat widget, their conversations will appear here",
      success: "Success",
      error: "Error",
      form_deleted_successfully: "Form deleted successfully",
      error_deleting_form: "Error deleting form",
      no_description: "No description",
      responses: "responses",
      no_forms: "No forms yet",
      forms_empty_message: "Create your first form to start capturing visitor data",
      dashboard_title: "Dashboard",
      manage_assistant: "Manage your AI assistant and configure integrations",
      avg_response_time: "Average Response Time", 
      confirm_delete: "Confirm Delete",
      delete_form_confirmation: "Are you sure you want to delete this form? This action cannot be undone and will also delete all responses.",
      cancel: "Cancel",
      deleting: "Deleting...",
      no_automations: "No automations yet",
      automations_empty_message: "Create your first automation to streamline repetitive tasks with AI",
      view_logs: "View Logs",
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
        pricing_note: "All plans include full support and free updates.",
        login_required: "Login required",
        login_description: "You need to log in to subscribe to a plan",
        success: "Success!",
        error: "Error",
        free_plan_activated: "Free plan activated successfully",
        process_error: "Error processing request",
        faq: {
          title: "Frequently Asked Questions",
          q1: "Can I change plans at any time?",
          a1: "Yes, you can upgrade or downgrade your plan at any time from your dashboard."
        },
        support: {
          title: "Support",
          q1: "What type of support is included?",
          a1: "All plans include email support. Pro and Enterprise plans include priority support."
        },
        refund: {
          title: "Refund Policy",
          q1: "Do you offer a money-back guarantee?",
          a1: "We offer a 30-day money-back guarantee for all paid plans."
        }
      },
      help: {
        title: "Help Center",
        subtitle: "Find answers to your questions and learn how to use AIPPS",
        search_placeholder: "Search help articles...",
        popular: {
          title: "Popular Articles",
          badge: "Popular",
          article1: "How to integrate the widget on your website",
          article2: "Customize the conversational assistant",
          article3: "Set up lead capture forms",
          article4: "Analyze metrics and conversations",
          article5: "Train your assistant with documents"
        },
        categories: {
          title: "Help Categories",
          getting_started: {
            title: "Getting Started",
            description: "Everything you need to begin with AIPPS",
            article1: "Create your first AIPPS account",
            article2: "Initial dashboard setup",
            article3: "Quick start guide for widgets",
            article4: "Conversational AI basics"
          },
          configuration: {
            title: "Configuration",
            description: "Customize AIPPS according to your needs",
            article1: "Customize widget colors and theme",
            article2: "Configure welcome messages",
            article3: "Set availability hours",
            article4: "Language and translation management"
          },
          integration: {
            title: "Integration",
            description: "Connect AIPPS with your website and tools",
            article1: "Integrate widget in WordPress",
            article2: "Shopify implementation",
            article3: "Custom integration code",
            article4: "CRM and tools integration"
          },
          billing: {
            title: "Billing",
            description: "Manage your subscription and payments",
            article1: "Change subscription plan",
            article2: "Billing and payment information",
            article3: "Refund policy",
            article4: "Pricing frequently asked questions"
          },
          troubleshooting: {
            title: "Troubleshooting",
            description: "Resolve common technical issues",
            article1: "Widget doesn't appear on my site",
            article2: "Chat connection problems",
            article3: "Assistant not responding correctly",
            article4: "Form issues"
          },
          account: {
            title: "Account",
            description: "Manage your profile and account settings",
            article1: "Change password and profile data",
            article2: "Notification settings",
            article3: "Manage users and permissions",
            article4: "Delete or close account"
          }
        },
        contact_support: {
          title: "Need More Help?",
          description: "If you can't find what you're looking for, our team is here to help",
          contact_button: "Contact Support",
          email_button: "Send Email"
        }
      },
      about: {
        title: "About AIPPS",
        subtitle: "Learn about our mission to transform web communication with artificial intelligence",
        mission: {
          title: "Our Mission",
          description: "Democratize access to conversational AI for all websites in the world"
        },
        vision: {
          title: "Our Vision",
          description: "Create a future where every web interaction is intelligent and personalized"
        },
        global: {
          title: "Global Reach",
          description: "We serve businesses of all sizes in more than 50 countries"
        },
        innovation: {
          title: "Innovation",
          description: "Pioneers in conversational AI technology with over 5 years of experience"
        }
      },
      contact: {
        title: "Contact Us",
        subtitle: "We're here to help. Get in touch with our team",
        info: {
          title: "Contact Information",
          email: "support@aipps.ca",
          phone: "+1 (555) 123-4567",
          address: "123 Innovation Street, Tech City, TC 12345",
          hours: "Monday to Friday: 9:00 AM - 6:00 PM (EST)"
        },
        form: {
          title: "Send Us a Message",
          name_label: "Name",
          name_placeholder: "Your name",
          email_label: "Email",
          email_placeholder: "your@email.com",
          subject_label: "Subject",
          subject_placeholder: "How can we help you?",
          message_label: "Message",
          message_placeholder: "Describe your inquiry...",
          send_button: "Send Message",
          sending_button: "Sending...",
          success_title: "Message Sent",
          success_message: "Thanks for contacting us. We'll get back to you soon."
        }
      },
      privacy: {
        title: "Privacy Policy",
        subtitle: "How we collect, use and protect your information",
        data_collection: {
          title: "Data Collection",
          description: "We collect information to provide and improve our services:",
          item1: "Account information (name, email, contact details)",
          item2: "Widget usage and analytics data",
          item3: "Technical information (IP, browser, device)",
          item4: "Conversation content for AI training"
        },
        data_usage: {
          title: "Data Usage",
          description: "We use your data for the following purposes:",
          item1: "Provide and maintain our services",
          item2: "Improve user experience",
          item3: "Performance analysis and statistics",
          item4: "Support communications and updates"
        },
        data_sharing: {
          title: "Data Sharing",
          description: "We do not sell or rent your personal information. We only share it in these cases:",
          item1: "With service providers necessary for operation",
          item2: "When required by law",
          item3: "With your explicit consent"
        },
        security: {
          title: "Security",
          description: "We implement security measures to protect your information",
          item1: "Data encryption in transit and at rest",
          item2: "Two-factor authentication available",
          item3: "Regular security audits",
          item4: "Compliance with international security standards"
        },
        user_rights: {
          title: "Your Rights",
          description: "You have the right to access, correct or delete your personal information",
          item1: "Access your stored personal data",
          item2: "Request correction of incorrect information",
          item3: "Delete your account and associated data",
          item4: "Export your data in portable format"
        },
        contact: {
          title: "Contact",
          description: "For privacy questions, contact us at privacy@aipps.ca"
        }
      },
      terms: {
        title: "Terms of Service",
        subtitle: "AIPPS terms and conditions of use",
        acceptance: {
          title: "Acceptance of Terms",
          description: "By using AIPPS, you accept these terms and conditions"
        },
        services: {
          title: "Service Description",
          description: "AIPPS provides conversational AI tools for websites:",
          item1: "Intelligent chat widgets",
          item2: "Lead capture forms",
          item3: "Analytics and metrics",
          item4: "Website integration"
        },
        user_obligations: {
          title: "User Obligations",
          description: "As a user, you commit to:",
          item1: "Use the service legally and ethically",
          item2: "Not interfere with system operation",
          item3: "Maintain the security of your account",
          item4: "Respect intellectual property rights"
        },
        payment: {
          title: "Payment Terms",
          description: "Payment terms include:",
          item1: "Monthly or annual billing according to chosen plan",
          item2: "Payments are non-refundable except for exceptions",
          item3: "Prices may change with prior notice",
          item4: "Suspension for non-payment is immediate"
        },
        intellectual_property: {
          title: "Intellectual Property",
          description: "All intellectual property rights of AIPPS belong to us:",
          item1: "AIPPS software and technology",
          item2: "Trademarks and logos",
          item3: "Content and documentation"
        },
        limitation: {
          title: "Limitation of Liability",
          description: "AIPPS is not responsible for indirect damages or data loss"
        },
        termination: {
          title: "Termination",
          description: "Either party may terminate the agreement:",
          item1: "User can cancel at any time",
          item2: "AIPPS can suspend accounts for terms violation",
          item3: "Data will be deleted according to retention policy"
        }
      },
      documentation: {
        title: "AIPPS Documentation",
        subtitle: "Complete guide to implement and use AIPPS on your website",
        overview: "Overview",
        features: "Features",
        implementation: "Implementation",
        api_reference: "API Reference",
        support: "Support",
        widget_integration: "Widget Integration",
        contextual_understanding: "Contextual Understanding",
        document_training: "Document Training",
        lead_capture: "Lead Capture",
        analytics: "Analytics",
        task_automation: "Task Automation",
        form_creation: "Form Creation",
        overview_content: "AIPPS is an advanced conversational AI platform that allows websites to offer intelligent and personalized chat experiences.",
        generated_on: "Generated on",
        language: "Language",
        table_of_contents: "Table of Contents"
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
          },
          step4: {
            title: "Step 4: Configure Authentication (Optional)",
            description: "Enable advanced features with user system:",
            feature_1: "Personal conversation history",
            feature_2: "Preference customization",
            feature_3: "User progress tracking",
            feature_4: "Detailed user analytics"
          },
          step5: {
            title: "Step 5: Advanced Assistant Configuration",
            description: "Optimize assistant experience:",
            feature_1: "Response personality and tone",
            feature_2: "Specialized knowledge base",
            feature_3: "Predefined conversation flows",
            feature_4: "External tool integration"
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
            example_title: "Custom configuration example:",
            basic_attributes: "Basic Attributes:",
            attributes: {
              form_id: "Unique form ID",
              display_type: "Display type (modal, inline, popup)",
              position: "Position on page",
              button_text: "Activation button text"
            },
            customization_attributes: "Customization Attributes:",
            icon: "Custom icon",
            button_size: "Button size",
            auto_show: "Show automatically"
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
        fullscreen_features: {
          title: "Fullscreen Mode Features",
          register_login: "User registration and login",
          personal_history: "Personal conversation history",
          auto_titles: "Automatic conversation titles",
          conversation_management: "Complete conversation management",
          user_info: "Integrated user information",
          jwt_security: "Built-in JWT security",
          visual_customization: "Advanced visual customization",
          brand_colors: "Customizable brand colors",
          welcome_messages: "Configurable welcome messages",
          registration_config: "Flexible registration configuration",
          privacy_settings: "Granular privacy settings"
        },
        ignored_sections: {
          step3_title: "Step 3: Configure Ignored Sections (Optional)",
          title: "Ignored Sections",
          description: "Define which parts of your website the assistant should ignore when analyzing content:",
          benefit_1: "Avoid confusion with irrelevant elements like menus or advertising",
          benefit_2: "Improve assistant response accuracy",
          benefit_3: "Reduce noise in automatic training",
          benefit_4: "Focus analysis on relevant content",
          config_example: "aipi('init', {\n  apiKey: 'YOUR_API_KEY',\n  // Other configurations...\n  ignoredSections: ['Main menu', 'Footer', 'Sidebar', 'Advertising'],\n});",
          config_description: "Configure from admin panel:",
          step_1: "Access \"Settings\" → \"Content Analysis\"",
          step_2: "Add CSS selectors or section names to ignore",
          step_3: "Save changes to apply immediately",
          step_4: "Assistant will update its understanding automatically"
        },
        support: {
          title: "Support and Resources",
          description: "Get help and resources to maximize your AIPPS experience"
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