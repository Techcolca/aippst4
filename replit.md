# AIPI - AI-Powered Conversational Platform

## Overview

AIPI is an advanced conversational AI platform for websites, offering intelligent chat widgets and integrated form solutions. It aims to provide dynamic interaction tools and communication solutions, enhancing user engagement and data collection on client websites. Key capabilities include bubble-style and fullscreen chat interfaces, and embeddable form solutions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (September 2025)

### Comprehensive Technical Hosting Requirements Documentation - COMPLETED
- **Problem Solved**: Clients needed complete technical documentation to prevent hosting compatibility issues before implementation
- **Solution Implemented**: Comprehensive technical hosting requirements documentation system with client access integration
- **Technical Details**:
  - Created complete technical documentation in three languages (Spanish, English, French)
  - Documented HostGator incompatibility cases with specific technical evidence (25% CPU limit, 30s timeout)
  - Provided accurate hosting provider specifications without fabricated technical data
  - Integrated documentation into AIPI client interface with direct download functionality
  - Added dedicated hosting-requirements section in docs page with multilingual interface
  - Included hosting provider recommendations with verified traffic capacity limits
  - Added technical requirements table with minimum specifications for AI widget functionality
  - Implemented download system for complete technical documentation files
- **Security Features**:
  - Accurate language regarding shared vs dedicated resources
  - Disclaimer about shared hosting resource limitations
  - No fabricated technical specifications - only verified data
- **Files Created**: REQUISITOS-TECNICOS-HOSTING-ES.md, TECHNICAL-HOSTING-REQUIREMENTS-EN.md, EXIGENCES-TECHNIQUES-HEBERGEMENT-FR.md
- **Files Modified**: client/src/pages/docs.tsx, public/ directory with technical documentation
- **Result**: Complete technical hosting requirements documentation system accessible to all clients for preventing compatibility issues
- **Date**: September 26, 2025

### Enterprise Automation Analysis System - COMPLETED
- **Problem Solved**: Clients needed professional analysis before automation implementation to avoid project failures
- **Solution Implemented**: Complete enterprise automation analysis system exclusively for Enterprise plan users
- **Technical Details**:
  - Database schema expanded with `automation_analysis_requests` table for comprehensive client data collection
  - Secure API endpoints with Enterprise plan verification, authentication, and role-based access controls
  - Separate validation schemas for user vs admin operations to prevent privilege escalation
  - Modern React page with 3-section interface: Benefits & ROI, Tool Comparison, Request Analysis
  - Real-time ROI calculator with dynamic calculations for time/cost savings
  - Detailed comparison between n8n, Make, and custom development approaches
  - Comprehensive form with enterprise information, automation goals, technical requirements
  - Feature-gated access using 'advancedAnalytics' Enterprise feature flag
  - Connected existing "Créer une Automatisation" buttons to new analysis workflow
- **Security Features**:
  - Ownership verification for all data access
  - Field restrictions preventing users from modifying internal analysis data
  - Admin-only endpoints for internal analysis updates
  - Enterprise plan requirement enforcement across all touchpoints
- **Files Modified**: shared/schema.ts, server/routes.ts, server/pg-storage.ts, server/storage.ts, client/src/components/dashboard-tabs.tsx
- **Files Created**: client/src/pages/automation-analysis.tsx, App.tsx routing updates
- **Result**: Professional automation analysis system emphasizing the importance of proper analysis before implementation
- **Date**: September 22, 2025

### Railway Deployment Preparation - COMPLETED
- **Problem Solved**: Aplicación necesitaba adaptarse completamente para Railway deployment
- **Solution Implemented**: Configuración completa de Railway con PostgreSQL estándar
- **Technical Details**:
  - Migración de Neon Serverless a PostgreSQL estándar con pg y drizzle-orm/node-postgres
  - Scripts de migración modernizados con drizzle-kit sintaxis actual
  - Archivo setup-railway-db.js completamente funcional para inicialización automática
  - Configuración SSL para producción en Railway
  - railway-start.sh optimizado con verificación de variables y conexión DB
  - Health check endpoint en /api/health para Railway monitoring
  - Script de backup completo (create-replit-backup.js) para preservar datos
  - Script de restauración (restore-railway-data.js) para migrar datos existentes
  - Build de producción verificado y funcionando correctamente
  - RAILWAY-DEPLOY-INSTRUCTIONS.md con guía paso a paso completa
- **Files Modified**: server/db.ts, railway-start.sh, railway.json, setup-railway-db.js, server/routes.ts
- **Files Created**: create-replit-backup.js, restore-railway-data.js, RAILWAY-DEPLOY-INSTRUCTIONS.md
- **Result**: Aplicación 100% lista para deploy profesional en Railway con migración de datos automática
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