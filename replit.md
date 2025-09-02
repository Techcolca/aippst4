# AIPI - AI-Powered Conversational Platform

## Overview

AIPI is an advanced conversational AI platform for websites, offering intelligent chat widgets and integrated form solutions. It aims to provide dynamic interaction tools and communication solutions, enhancing user engagement and data collection on client websites. Key capabilities include bubble-style and fullscreen chat interfaces, and embeddable form solutions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (September 2025)

### Railway Deployment Preparation - COMPLETED
- **Problem Solved**: Aplicación necesitaba adaptarse completamente para Railway deployment
- **Solution Implemented**: Configuración completa de Railway con PostgreSQL estándar
- **Technical Details**:
  - Migración de Neon Serverless a PostgreSQL estándar con pg y drizzle-orm/node-postgres
  - Scripts de migración modernizados con drizzle-kit sintaxis actual
  - Archivo setup-railway-db.js completamente funcional para inicialización automática
  - Configuración SSL para producción en Railway
  - railway-start.sh optimizado con mejor logging y gestión de errores
  - Build de producción verificado y funcionando correctamente
- **Result**: Aplicación 100% lista para deploy en Railway con base de datos automática
- **Date**: September 2, 2025

## Previous Changes (August 2025)

### Dynamic Text Contrast System - COMPLETED
- **Problem Solved**: Text readability issues with different widget background colors
- **Solution Implemented**: Automatic luminance-based text color calculation
- **Technical Details**: 
  - WCAG-compliant luminance calculations (threshold: 0.6)
  - Real-time color recalculation after server configuration loads
  - CSS injection with !important rules for reliable application
  - Comprehensive debug tools for testing and validation
- **Result**: Perfect text contrast across all widget configurations
- **Date**: August 15, 2025

### Manual Text Color Control - COMPLETED
- **Problem Solved**: Users needed manual override for automatic text color calculations
- **Solution Implemented**: Manual text color selection with three options
- **Technical Details**:
  - Database schema updated with `textColor` field in integrations table
  - Three options: 'auto' (default), 'white', 'black'
  - Integration in both bubble and fullscreen widgets
  - Auto-save functionality in edit-integration interface
  - Override system that respects manual selection over automatic calculation
- **Result**: Users can force white or black text regardless of background color
- **Date**: August 15, 2025

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Tailwind CSS with Shadcn UI components
- **State Management**: React Query
- **Build Tool**: Vite
- **Widget Scripts**: Multiple embeddable JavaScript widgets for external integration.
- **UI/UX Decisions**: Dynamic typography, adaptive color schemes based on widget themes, professional styling with rounded corners, shadows, and border accents. Support for visual formatting in chatbot responses including titles, lists, and emphasis.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Authentication**: JWT-based authentication with cookie support
- **File Processing**: Document processing for PDF, DOCX formats.
- **API Design**: RESTful API.

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM (via Neon serverless).
- **Schema Management**: Drizzle Kit for migrations.

### Key Components
- **Chat Widget System**: Bubble, fullscreen, and modern form integrations with embeddable JavaScript and real-time communication. Includes intelligent conflict detection and dynamic text contrast adaptation.
- **Document Processing Engine**: Supports PDF, DOCX, and plain text content extraction for knowledge base integration.
- **AI Integration Layer**: Utilizes OpenAI GPT-4o-mini for chat completion, sentiment analysis, and summarization, building context-aware knowledge bases from scraped content.
- **Form Management System**: Dynamic, template-based form generation with external embedding and comprehensive data collection.
- **Payment Integration**: Stripe for payment processing, subscription management, and webhook handling for tiered pricing plans.
- **Internationalization**: Complete multilingual support with 100% translation coverage for UI elements, messages, and content across English, Spanish, and French. Eliminated all raw technical data and underscore-separated text from UI. All translation keys return proper strings (not objects) with comprehensive analytics chart translations.
- **Dynamic Text Contrast System**: Automatic text color calculation based on background luminance for optimal readability across all widget configurations. Uses WCAG-compliant luminance calculations with configurable thresholds.

## External Dependencies

- **OpenAI API**: AI model access for chat completions.
- **Stripe**: Payment processing and subscription management.
- **PostgreSQL**: Primary database.
- **Google Calendar API**: Appointment scheduling.
- **Outlook Calendar API**: Microsoft calendar integration.
- **SendGrid/AWS SES**: Email notification services.