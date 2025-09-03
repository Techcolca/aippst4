# AIPI - Asistente de Inteligencia Artificial 

AIPI es una plataforma avanzada impulsada por IA diseñada para integrar capacidades de chat inteligente en sitios web, ofreciendo herramientas de interacción dinámica y soluciones de comunicación completas.

## Características principales

- **Widget de chat integrable**: Fácil de incorporar en cualquier sitio web 2
- **Procesamiento de documentos**: Compatible con PDF, DOCX y otros formatos
- **Personalización completa**: Adapta el asistente a tus necesidades
- **Análisis de conversaciones**: Visualiza tendencias, productos populares y sentimiento
- **Interfaz responsive**: Diseñada para funcionar en dispositivos móviles y de escritorio

## Tecnologías utilizadas

- Frontend: React, Tailwind CSS, Shadcn UI
- Backend: Express.js, Node.js
- Base de datos: PostgreSQL
- Autenticación: JWT
- Procesamiento de documentos: Mammoth (DOCX), PDF-Parse

## Instalación y ejecución

1. Clona este repositorio
2. Instala las dependencias: `npm install`
3. Configura las variables de entorno en un archivo `.env`
4. Inicia el servidor de desarrollo: `npm run dev`

## Configuración de la base de datos

La aplicación utiliza PostgreSQL. Asegúrate de tener configuradas las siguientes variables de entorno:
- `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL

## Integración con OpenAI

Para utilizar las capacidades de IA, necesitarás una clave de API de OpenAI:
- `OPENAI_API_KEY`: Tu clave de API de OpenAI

## Licencia

MIT
