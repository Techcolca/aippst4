import pg from 'pg';
const { Pool } = pg;
import { drizzle } from 'drizzle-orm/node-postgres';

// Conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Plantillas adicionales para alcanzar un total de 10
const additionalTemplates = [
  {
    name: "Encuesta de Satisfacción",
    description: "Obtén feedback valioso de tus clientes con esta encuesta de satisfacción.",
    type: "survey",
    is_default: true,
    structure: {
      fields: [
        {
          type: "rating",
          name: "satisfaction",
          label: "¿Cómo calificarías tu experiencia con nosotros?",
          required: true,
          settings: {
            min: 1,
            max: 5,
            icon: "star"
          }
        },
        {
          type: "select",
          name: "service_used",
          label: "¿Qué servicio has utilizado?",
          required: true,
          options: [
            { label: "Atención al cliente", value: "customer_service" },
            { label: "Ventas", value: "sales" },
            { label: "Soporte técnico", value: "technical_support" },
            { label: "Otros", value: "other" }
          ]
        },
        {
          type: "textarea",
          name: "feedback",
          label: "¿Qué podríamos mejorar?",
          required: false,
          placeholder: "Tu opinión es muy importante para nosotros"
        },
        {
          type: "checkbox",
          name: "contact_permission",
          label: "¿Podemos contactarte para seguimiento?",
          required: false
        },
        {
          type: "email",
          name: "email",
          label: "Tu correo electrónico",
          required: false,
          conditional: {
            field: "contact_permission",
            value: true
          }
        }
      ],
      settings: {
        submitLabel: "Enviar encuesta",
        successMessage: "¡Gracias por tu feedback!"
      }
    },
    styling: {
      fontFamily: "Inter, sans-serif",
      primaryColor: "#4F46E5",
      borderRadius: "8px",
      background: "rgba(255, 255, 255, 0.95)",
      shadow: "lg"
    }
  },
  {
    name: "Solicitud de Presupuesto",
    description: "Formulario para solicitar presupuestos personalizados para tus clientes.",
    type: "lead",
    is_default: true,
    structure: {
      fields: [
        {
          type: "text",
          name: "company_name",
          label: "Nombre de la empresa",
          required: true,
          placeholder: "Tu empresa"
        },
        {
          type: "text",
          name: "contact_name",
          label: "Nombre de contacto",
          required: true,
          placeholder: "Nombre completo"
        },
        {
          type: "email",
          name: "email",
          label: "Correo electrónico",
          required: true,
          placeholder: "correo@ejemplo.com"
        },
        {
          type: "tel",
          name: "phone",
          label: "Teléfono",
          required: false,
          placeholder: "+34 600000000"
        },
        {
          type: "select",
          name: "service_type",
          label: "Tipo de servicio",
          required: true,
          options: [
            { label: "Desarrollo web", value: "web_development" },
            { label: "Diseño gráfico", value: "graphic_design" },
            { label: "Marketing digital", value: "digital_marketing" },
            { label: "Consultoría", value: "consulting" },
            { label: "Otro", value: "other" }
          ]
        },
        {
          type: "textarea",
          name: "project_details",
          label: "Detalles del proyecto",
          required: true,
          placeholder: "Describe tu proyecto y necesidades específicas"
        },
        {
          type: "number",
          name: "budget",
          label: "Presupuesto estimado (€)",
          required: false,
          placeholder: "1000"
        },
        {
          type: "date",
          name: "deadline",
          label: "Fecha límite",
          required: false
        }
      ],
      settings: {
        submitLabel: "Solicitar presupuesto",
        successMessage: "¡Hemos recibido tu solicitud! Te contactaremos en breve."
      }
    },
    styling: {
      fontFamily: "Poppins, sans-serif",
      primaryColor: "#2563EB",
      borderRadius: "4px",
      background: "#FFFFFF",
      shadow: "md"
    }
  },
  {
    name: "Registro para Webinar",
    description: "Formulario optimizado para registrar asistentes a eventos virtuales.",
    type: "registration",
    is_default: true,
    structure: {
      fields: [
        {
          type: "text",
          name: "name",
          label: "Nombre completo",
          required: true,
          placeholder: "Tu nombre"
        },
        {
          type: "email",
          name: "email",
          label: "Correo electrónico",
          required: true,
          placeholder: "correo@ejemplo.com"
        },
        {
          type: "text",
          name: "company",
          label: "Empresa",
          required: false,
          placeholder: "Nombre de tu empresa"
        },
        {
          type: "select",
          name: "job_title",
          label: "Cargo",
          required: false,
          options: [
            { label: "Director/a", value: "director" },
            { label: "Gerente", value: "manager" },
            { label: "Técnico/a", value: "technical" },
            { label: "Estudiante", value: "student" },
            { label: "Otro", value: "other" }
          ]
        },
        {
          type: "select",
          name: "how_found",
          label: "¿Cómo nos encontraste?",
          required: true,
          options: [
            { label: "Redes sociales", value: "social_media" },
            { label: "Búsqueda en Google", value: "google" },
            { label: "Recomendación", value: "referral" },
            { label: "Email", value: "email" },
            { label: "Otro", value: "other" }
          ]
        },
        {
          type: "checkbox",
          name: "reminder",
          label: "Quiero recibir un recordatorio por email 24h antes del evento",
          required: false,
          default: true
        },
        {
          type: "checkbox",
          name: "marketing_consent",
          label: "Acepto recibir emails sobre futuros webinars y contenido relacionado",
          required: false
        }
      ],
      settings: {
        submitLabel: "Confirmar registro",
        successMessage: "¡Registro completado! Recibirás un email de confirmación."
      }
    },
    styling: {
      fontFamily: "Roboto, sans-serif",
      primaryColor: "#8B5CF6",
      borderRadius: "8px",
      background: "#F9FAFB",
      shadow: "sm"
    }
  },
  {
    name: "Formulario de Pedido",
    description: "Perfecto para tomar pedidos online de manera organizada.",
    type: "order",
    is_default: true,
    structure: {
      fields: [
        {
          type: "text",
          name: "customer_name",
          label: "Nombre del cliente",
          required: true,
          placeholder: "Nombre completo"
        },
        {
          type: "email",
          name: "email",
          label: "Correo electrónico",
          required: true,
          placeholder: "correo@ejemplo.com"
        },
        {
          type: "tel",
          name: "phone",
          label: "Teléfono",
          required: true,
          placeholder: "+34 600000000"
        },
        {
          type: "textarea",
          name: "shipping_address",
          label: "Dirección de envío",
          required: true,
          placeholder: "Dirección completa incluyendo código postal"
        },
        {
          type: "select",
          name: "product",
          label: "Producto",
          required: true,
          options: [
            { label: "Producto A - 29.99€", value: "product_a" },
            { label: "Producto B - 49.99€", value: "product_b" },
            { label: "Producto C - 99.99€", value: "product_c" },
            { label: "Pack Completo - 149.99€", value: "full_pack" }
          ]
        },
        {
          type: "number",
          name: "quantity",
          label: "Cantidad",
          required: true,
          default: 1,
          min: 1,
          max: 10
        },
        {
          type: "select",
          name: "payment_method",
          label: "Método de pago",
          required: true,
          options: [
            { label: "Tarjeta de crédito", value: "credit_card" },
            { label: "PayPal", value: "paypal" },
            { label: "Transferencia bancaria", value: "bank_transfer" }
          ]
        },
        {
          type: "textarea",
          name: "notes",
          label: "Notas adicionales",
          required: false,
          placeholder: "Instrucciones especiales para el pedido"
        }
      ],
      settings: {
        submitLabel: "Confirmar Pedido",
        successMessage: "¡Pedido recibido! Recibirás un email de confirmación con los detalles."
      }
    },
    styling: {
      fontFamily: "Lato, sans-serif",
      primaryColor: "#10B981",
      borderRadius: "6px",
      background: "#FFFFFF",
      shadow: "md"
    }
  },
  {
    name: "Evaluación de Evento",
    description: "Recopila feedback detallado sobre tus eventos y conferencias.",
    type: "feedback",
    is_default: true,
    structure: {
      fields: [
        {
          type: "text",
          name: "name",
          label: "Nombre (opcional)",
          required: false,
          placeholder: "Tu nombre"
        },
        {
          type: "select",
          name: "event_name",
          label: "Selecciona el evento",
          required: true,
          options: [
            { label: "Conferencia anual 2025", value: "annual_conf_2025" },
            { label: "Taller práctico - Mayo", value: "workshop_may" },
            { label: "Webinar técnico - Junio", value: "tech_webinar_june" }
          ]
        },
        {
          type: "rating",
          name: "overall_rating",
          label: "Valoración general del evento",
          required: true,
          settings: {
            min: 1,
            max: 5,
            icon: "star"
          }
        },
        {
          type: "rating",
          name: "content_rating",
          label: "Calidad del contenido",
          required: true,
          settings: {
            min: 1,
            max: 5,
            icon: "star"
          }
        },
        {
          type: "rating",
          name: "speaker_rating",
          label: "Ponentes",
          required: true,
          settings: {
            min: 1,
            max: 5,
            icon: "star"
          }
        },
        {
          type: "rating",
          name: "organization_rating",
          label: "Organización",
          required: true,
          settings: {
            min: 1,
            max: 5,
            icon: "star"
          }
        },
        {
          type: "textarea",
          name: "highlights",
          label: "¿Qué fue lo mejor del evento?",
          required: false,
          placeholder: "Comparte lo que más te gustó"
        },
        {
          type: "textarea",
          name: "improvements",
          label: "¿Qué podríamos mejorar?",
          required: false,
          placeholder: "Tus sugerencias son importantes"
        },
        {
          type: "checkbox",
          name: "future_events",
          label: "Me gustaría recibir información sobre futuros eventos",
          required: false
        }
      ],
      settings: {
        submitLabel: "Enviar evaluación",
        successMessage: "¡Gracias por tu evaluación! Tu feedback nos ayuda a mejorar."
      }
    },
    styling: {
      fontFamily: "Inter, sans-serif",
      primaryColor: "#F59E0B",
      borderRadius: "10px",
      background: "#FFFBEB",
      shadow: "md"
    }
  },
  {
    name: "Solicitud de Empleo",
    description: "Optimizado para reclutar candidatos y revisar solicitudes de empleo.",
    type: "application",
    is_default: true,
    structure: {
      fields: [
        {
          type: "text",
          name: "full_name",
          label: "Nombre completo",
          required: true,
          placeholder: "Tu nombre completo"
        },
        {
          type: "email",
          name: "email",
          label: "Correo electrónico",
          required: true,
          placeholder: "tu@email.com"
        },
        {
          type: "tel",
          name: "phone",
          label: "Teléfono",
          required: true,
          placeholder: "+34 600000000"
        },
        {
          type: "select",
          name: "position",
          label: "Puesto al que aplicas",
          required: true,
          options: [
            { label: "Desarrollador/a Frontend", value: "frontend_dev" },
            { label: "Desarrollador/a Backend", value: "backend_dev" },
            { label: "Diseñador/a UX/UI", value: "ux_designer" },
            { label: "Project Manager", value: "project_manager" },
            { label: "Marketing Digital", value: "digital_marketing" }
          ]
        },
        {
          type: "textarea",
          name: "experience",
          label: "Experiencia relevante",
          required: true,
          placeholder: "Describe brevemente tu experiencia relacionada con el puesto"
        },
        {
          type: "file",
          name: "resume",
          label: "Adjunta tu CV",
          required: true,
          settings: {
            allowedTypes: ".pdf,.doc,.docx",
            maxSize: 5 // en MB
          }
        },
        {
          type: "file",
          name: "portfolio",
          label: "Portfolio (opcional)",
          required: false,
          settings: {
            allowedTypes: ".pdf,.zip,.url",
            maxSize: 10 // en MB
          }
        },
        {
          type: "url",
          name: "linkedin",
          label: "Perfil de LinkedIn",
          required: false,
          placeholder: "https://linkedin.com/in/tu-perfil"
        },
        {
          type: "select",
          name: "availability",
          label: "Disponibilidad",
          required: true,
          options: [
            { label: "Inmediata", value: "immediate" },
            { label: "En 2 semanas", value: "two_weeks" },
            { label: "En 1 mes", value: "one_month" },
            { label: "Más de 1 mes", value: "more_than_month" }
          ]
        },
        {
          type: "checkbox",
          name: "data_consent",
          label: "Doy mi consentimiento para el tratamiento de mis datos personales según la política de privacidad",
          required: true
        }
      ],
      settings: {
        submitLabel: "Enviar solicitud",
        successMessage: "¡Hemos recibido tu solicitud! Revisaremos tu perfil y te contactaremos en caso de avanzar en el proceso."
      }
    },
    styling: {
      fontFamily: "Roboto, sans-serif",
      primaryColor: "#3B82F6",
      borderRadius: "4px",
      background: "#F9FAFB",
      shadow: "md"
    }
  },
  {
    name: "Registro a Newsletter",
    description: "Forma sencilla para capturar suscriptores a tu boletín informativo.",
    type: "subscription",
    is_default: true,
    structure: {
      fields: [
        {
          type: "email",
          name: "email",
          label: "Tu correo electrónico",
          required: true,
          placeholder: "correo@ejemplo.com"
        },
        {
          type: "text",
          name: "first_name",
          label: "Nombre",
          required: false,
          placeholder: "Tu nombre"
        },
        {
          type: "select",
          name: "interests",
          label: "Temas de interés",
          required: false,
          multiple: true,
          options: [
            { label: "Tecnología", value: "tech" },
            { label: "Marketing", value: "marketing" },
            { label: "Diseño", value: "design" },
            { label: "Negocios", value: "business" },
            { label: "Productividad", value: "productivity" }
          ]
        },
        {
          type: "select",
          name: "frequency",
          label: "Frecuencia preferida",
          required: false,
          options: [
            { label: "Diario", value: "daily" },
            { label: "Semanal", value: "weekly" },
            { label: "Quincenal", value: "biweekly" },
            { label: "Mensual", value: "monthly" }
          ]
        },
        {
          type: "checkbox",
          name: "consent",
          label: "Acepto recibir comunicaciones comerciales y entiendo que puedo darme de baja en cualquier momento",
          required: true
        }
      ],
      settings: {
        submitLabel: "Suscribirme",
        successMessage: "¡Gracias por suscribirte! Por favor, confirma tu correo electrónico para completar el proceso."
      }
    },
    styling: {
      fontFamily: "Inter, sans-serif",
      primaryColor: "#6366F1",
      borderRadius: "8px",
      background: "#FFFFFF",
      shadow: "sm"
    }
  }
];

// Función para insertar plantillas
async function insertTemplates() {
  try {
    const client = await pool.connect();
    
    for (const template of additionalTemplates) {
      console.log(`Insertando plantilla: ${template.name}`);
      
      // Comprobar si la plantilla ya existe
      const checkQuery = 'SELECT id FROM form_templates WHERE name = $1';
      const checkResult = await client.query(checkQuery, [template.name]);
      
      if (checkResult.rows.length > 0) {
        console.log(`La plantilla "${template.name}" ya existe, saltando...`);
        continue;
      }
      
      // Insertar la nueva plantilla
      const insertQuery = `
        INSERT INTO form_templates (name, description, type, structure, styling, is_default)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      
      const result = await client.query(insertQuery, [
        template.name,
        template.description,
        template.type,
        JSON.stringify(template.structure),
        JSON.stringify(template.styling),
        template.is_default
      ]);
      
      console.log(`Plantilla "${template.name}" creada con ID: ${result.rows[0].id}`);
    }
    
    client.release();
    console.log('Proceso completado con éxito.');
  } catch (error) {
    console.error('Error al insertar plantillas:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
insertTemplates();