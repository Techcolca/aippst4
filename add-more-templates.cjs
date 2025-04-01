// Script para agregar más plantillas de formularios
// CommonJS version

const { Pool } = require('pg');

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