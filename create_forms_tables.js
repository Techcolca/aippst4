import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './shared/schema.js';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function main() {
  console.log('Connecting to database...');
  
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient, { schema });

  console.log('Checking if forms table exists...');
  
  try {
    // Intentar crear las tablas de formularios
    await db.execute(/* sql */`
      CREATE TABLE IF NOT EXISTS forms (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        description TEXT,
        slug TEXT NOT NULL UNIQUE,
        type TEXT DEFAULT 'standard',
        published BOOLEAN DEFAULT FALSE,
        structure JSONB NOT NULL,
        styling JSONB,
        settings JSONB,
        response_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS form_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        thumbnail TEXT,
        structure JSONB NOT NULL,
        styling JSONB,
        settings JSONB,
        is_default BOOLEAN DEFAULT FALSE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS form_responses (
        id SERIAL PRIMARY KEY,
        form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
        data JSONB NOT NULL,
        metadata JSONB,
        submitted_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Forms tables created successfully!');
    
    // Crear las plantillas de formulario predeterminadas
    console.log('Creating default form templates...');
    
    const defaultTemplates = [
      {
        name: 'Formulario de Contacto',
        description: 'Plantilla estándar para formularios de contacto',
        type: 'contact',
        is_default: true,
        structure: JSON.stringify({
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Nombre completo',
              placeholder: 'Introduce tu nombre completo',
              required: true,
              order: 1
            },
            {
              id: 'email',
              type: 'email',
              label: 'Correo electrónico',
              placeholder: 'tu@email.com',
              required: true,
              order: 2
            },
            {
              id: 'subject',
              type: 'text',
              label: 'Asunto',
              placeholder: 'Asunto de tu mensaje',
              required: true,
              order: 3
            },
            {
              id: 'message',
              type: 'textarea',
              label: 'Mensaje',
              placeholder: 'Escribe tu mensaje aquí...',
              required: true,
              order: 4
            }
          ],
          submitButtonText: 'Enviar mensaje'
        }),
        styling: JSON.stringify({
          theme: 'light',
          borderRadius: 'md',
          fontFamily: 'Inter'
        }),
        settings: JSON.stringify({
          redirectAfterSubmit: false,
          redirectUrl: '',
          sendEmailNotification: true,
          submitSuccessMessage: '¡Gracias por contactarnos! Te responderemos lo antes posible.'
        })
      },
      {
        name: 'Lista de Espera',
        description: 'Plantilla para capturar usuarios en lista de espera',
        type: 'waitlist',
        is_default: true,
        structure: JSON.stringify({
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Nombre',
              placeholder: 'Tu nombre',
              required: true,
              order: 1
            },
            {
              id: 'email',
              type: 'email',
              label: 'Correo electrónico',
              placeholder: 'tu@email.com',
              required: true,
              order: 2
            },
            {
              id: 'interest',
              type: 'select',
              label: '¿Cómo te enteraste de nosotros?',
              options: [
                'Redes sociales',
                'Búsqueda en Google',
                'Recomendación',
                'Otro'
              ],
              required: false,
              order: 3
            }
          ],
          submitButtonText: 'Unirme a la lista de espera'
        }),
        styling: JSON.stringify({
          theme: 'light',
          borderRadius: 'md',
          fontFamily: 'Inter'
        }),
        settings: JSON.stringify({
          redirectAfterSubmit: false,
          redirectUrl: '',
          sendEmailNotification: true,
          submitSuccessMessage: '¡Te has unido a nuestra lista de espera! Te notificaremos cuando sea tu turno.'
        })
      },
      {
        name: 'Encuesta de Satisfacción',
        description: 'Encuesta para medir la satisfacción del cliente',
        type: 'survey',
        is_default: true,
        structure: JSON.stringify({
          fields: [
            {
              id: 'satisfaction',
              type: 'radio',
              label: '¿Cómo calificarías tu experiencia con nosotros?',
              options: [
                'Excelente',
                'Buena',
                'Regular',
                'Mala',
                'Muy mala'
              ],
              required: true,
              order: 1
            },
            {
              id: 'recommendationScore',
              type: 'range',
              label: 'Del 1 al 10, ¿qué tan probable es que nos recomiendes?',
              min: 1,
              max: 10,
              required: true,
              order: 2
            },
            {
              id: 'feedback',
              type: 'textarea',
              label: '¿Cómo podríamos mejorar?',
              placeholder: 'Tus comentarios nos ayudan a mejorar',
              required: false,
              order: 3
            }
          ],
          submitButtonText: 'Enviar encuesta'
        }),
        styling: JSON.stringify({
          theme: 'light',
          borderRadius: 'md',
          fontFamily: 'Inter'
        }),
        settings: JSON.stringify({
          redirectAfterSubmit: false,
          redirectUrl: '',
          sendEmailNotification: true,
          submitSuccessMessage: '¡Gracias por tu feedback!'
        })
      }
    ];

    // Insertar las plantillas predeterminadas
    for (const template of defaultTemplates) {
      const exists = await db.execute(/* sql */`
        SELECT id FROM form_templates 
        WHERE name = $1 AND is_default = true
      `, [template.name]);

      if (exists.length === 0) {
        await db.execute(/* sql */`
          INSERT INTO form_templates 
          (name, description, type, structure, styling, settings, is_default)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          template.name, 
          template.description, 
          template.type,
          template.structure, 
          template.styling, 
          template.settings, 
          template.is_default
        ]);
        console.log(`Template "${template.name}" created.`);
      } else {
        console.log(`Template "${template.name}" already exists.`);
      }
    }

    console.log('Default form templates created successfully!');
  } catch (error) {
    console.error('Error creating tables or templates:', error);
  } finally {
    await migrationClient.end();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});