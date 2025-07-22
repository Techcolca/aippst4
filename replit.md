# AIPI - AI-Powered Conversational Platform

## Overview

AIPI is an advanced conversational AI platform designed to integrate intelligent chat capabilities into websites. It provides dynamic interaction tools, communication solutions, and comprehensive form integration features. The platform offers both bubble-style chat widgets and fullscreen chat interfaces similar to ChatGPT, along with embedded form solutions.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Tailwind CSS with Shadcn UI components
- **State Management**: React Query for data fetching and caching
- **Build Tool**: Vite for fast development and optimized builds
- **Widget Scripts**: Multiple JavaScript embeddable widgets for external integration

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript for type safety
- **Authentication**: JWT-based authentication with cookie support
- **File Processing**: Document processing for PDF, DOCX formats
- **API Design**: RESTful API with comprehensive route structure

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL for scalability
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Storage Strategy**: Relational design with proper indexing for performance

## Key Components

### Chat Widget System
- **Multiple Widget Types**: Bubble widgets, fullscreen chat interfaces, and modern form integrations
- **External Integration**: Embeddable JavaScript files for third-party websites
- **Real-time Communication**: WebSocket-style interactions for live chat
- **Intelligent Conflict Detection**: Automatic detection to prevent widget conflicts with forms

### Document Processing Engine
- **Supported Formats**: PDF, DOCX, and plain text files
- **Content Extraction**: Mammoth.js for Word documents, pdf-parse for PDFs
- **Knowledge Base Integration**: Processed documents feed into AI knowledge base

### AI Integration Layer
- **Provider**: OpenAI GPT-4o-mini model
- **Features**: Chat completion, sentiment analysis, content summarization
- **Context Awareness**: Site-specific knowledge base building from scraped content

### Form Management System
- **Dynamic Forms**: Template-based form generation with various field types
- **External Embedding**: JavaScript-based form embedding for external sites
- **Data Collection**: Comprehensive form response storage and analytics

### Payment Integration
- **Provider**: Stripe payment processing
- **Subscription Management**: Tiered pricing plans with usage limits
- **Webhook Handling**: Automated subscription lifecycle management

## Data Flow

1. **User Interaction**: Visitors interact through embedded widgets or forms
2. **Authentication**: JWT tokens manage user sessions and API access
3. **Content Processing**: Website content is scraped and processed for context
4. **AI Processing**: OpenAI processes queries with site-specific knowledge base
5. **Response Delivery**: Formatted responses delivered through the widget interface
6. **Data Storage**: Conversations, analytics, and user data stored in PostgreSQL

## External Dependencies

### Core Services
- **OpenAI API**: AI model access for chat completions
- **Stripe**: Payment processing and subscription management
- **PostgreSQL**: Primary database (via Neon serverless)

### Integration Services
- **Google Calendar API**: Appointment scheduling integration
- **Outlook Calendar API**: Microsoft calendar integration
- **SendGrid/AWS SES**: Email notification services

### Development Tools
- **Drizzle ORM**: Database schema and query management
- **Shadcn UI**: Component library for consistent design
- **Tailwind CSS**: Utility-first CSS framework

## Deployment Strategy

### Railway Deployment
- **Platform**: Railway.app for production hosting
- **Build Process**: Automated build with npm run build
- **Database**: Auto-provisioned PostgreSQL instance
- **Environment Variables**: Managed through Railway's interface
- **Process Management**: Railway Procfile for startup commands

### Development Environment
- **Local Development**: Replit-based development with hot reloading
- **Database Migrations**: Automated through Drizzle Kit
- **Static Assets**: Served through Express with proper CORS headers

### Configuration Management
- **Environment Variables**: Comprehensive .env setup for all services
- **Secrets Management**: Separate handling for API keys and sensitive data
- **CORS Configuration**: Proper cross-origin setup for widget embedding

## Changelog

## Recent Changes

July 22, 2025:
- ✓ CRITICAL BUG FIX: Fixed translation system for relative time formatting ("hace 3 horas" → "il y a 3 heures")
- ✓ Resolved currentLang: 'unknown' issue in formatRelativeTime function by importing i18n instance directly
- ✓ Enhanced LanguageSelector with proper cache bypass for complete page reload
- ✓ Implemented comprehensive debug system to diagnose translation issues
- ✓ Verified translation system works correctly: FR/ES/EN switching now updates all time displays
- ✓ Cleaned up debug logs for production readiness

July 21, 2025:
- ✓ Removed "Abajo al Centro" (bottom-center) position option from integration creation form
- ✓ Updated form validation to prevent new integrations from using bottom-center position
- ✓ Maintained backward compatibility for existing integrations with bottom-center position
- ✓ Fixed TypeScript errors in edit integration form by handling legacy position values
- ✓ Kept CSS styling for bottom-center position for existing embedded widgets
- ✓ Fixed login success/failure message localization issue
- ✓ Added complete translation keys for login page in English, French, and Spanish
- ✓ Implemented useTranslation hook in login component for proper i18n support
- ✓ Login messages now appear in user's selected language instead of hardcoded English
- ✓ Fixed critical Spanish translation structure bug where login object was incorrectly defined as string
- ✓ Corrected JSON structure to properly support all login translation keys in Spanish
- ✓ Added missing key handler for better debugging of translation issues
- ✓ Completed analytics page internationalization with comprehensive translation support
- ✓ Replaced all hardcoded Spanish text in analytics.tsx with i18next translation functions
- ✓ Added dynamic browser language detection to all chat widget embed files
- ✓ Chat widgets now automatically show placeholders in correct language (ES/EN/FR)
- ✓ Updated PDF export functionality to use translated text for all languages
- ✓ Added 40+ translation keys for analytics interface, PDF export, and advanced metrics
- ✓ Analytics page now fully supports Spanish, English, and French language switching
- ✓ CRITICAL FIX: Resolved widget language persistence bug - integration language changes now persist and update widgets
- ✓ Added language field to widget API endpoint response (server/routes.ts)
- ✓ Enhanced embed.js widget to use integration-specific language settings
- ✓ Implemented automatic widget language detection and periodic refresh system
- ✓ Updated memory storage to include language field for all existing integrations
- ✓ Widget elements (placeholder, buttons, messages) now dynamically update when language changes
- ✓ Created comprehensive translation system for widget interface elements (ES/EN/FR)
- ✓ Added live configuration refresh system that detects language changes every 3 seconds
- ✓ MAJOR BUG FIX: Resolved chatbot generic response issue by fixing site content loading in conversation routes
- ✓ Fixed critical bug in server/routes.ts where siteContentItems was empty array instead of loaded site content
- ✓ Added proper site content loading in conversation-specific endpoints for knowledge base construction
- ✓ Inserted specific TechColca website content into database for testing (services, AI solutions, security focus)
- ✓ Enhanced debug logging in OpenAI integration to track context and system message construction
- ✓ Chatbot now has access to website-specific content for contextual responses instead of generic replies
- ✓ FRONTEND INTERNATIONALIZATION COMPLETION: Fixed remaining translation issues for complete multilingual support
- ✓ Added missing translation keys for "conversations_for", "online" status, and relative time formats (ES/EN/FR)
- ✓ Created formatRelativeTime() utility function for consistent "hace X minutos/horas/días" time display
- ✓ Updated integration-conversations.tsx to use dynamic relative time formatting instead of raw timestamps
- ✓ Enhanced embed.js widgets with language-specific "Online" status display (En línea/Online/En ligne)
- ✓ Widget headers now show "Online" status in correct integration language (Spanish/English/French)
- ✓ Both bubble and fullscreen chat widgets support dynamic "Online" status translation
- ✓ Time stamps in conversation lists now display as "hace 2 horas" instead of raw dates for better UX
- ✓ CRITICAL FIX: Enhanced LanguageSelector to force page reload after language change for complete UI update
- ✓ Fixed language persistence issue where React components weren't re-rendering with new translations
- ✓ Added query dependencies to force re-fetch data when language changes in conversation pages
- ✓ Language switching now guarantees complete translation update across all UI elements

June 25, 2025:
- ✓ Fixed promotional message rotation system on homepage
- ✓ Implemented missing generateAIPromotionalMessages function in backend
- ✓ Created proper database integration for AI-generated promotional messages
- ✓ Fixed React Query implementation for promotional messages API
- ✓ Ensured 7 promotional messages rotate every 7 seconds as designed
- ✓ Messages now properly display below "Bienvenidos a AiPPS" title with full rotation
- ✓ Added complete multilingual support for promotional messages (Spanish, French, English)
- ✓ Updated database schema to support language-specific promotional messages
- ✓ Modified API to filter messages by language parameter automatically
- ✓ Created 3 test users with different subscription plans:
  - usuario_basico (Plan Básico) - Test123!
  - usuario_startup (Plan Startup) - Test123!
  - usuario_profesional (Plan Profesional) - Test123!

June 24, 2025:
- ✓ Implemented complete marketing campaign system with promotional pricing
- ✓ Created database-driven promotional campaigns with discount management
- ✓ Updated pricing page to show strikethrough prices and promotional discounts
- ✓ Implemented AI-generated rotating promotional messages that auto-refresh weekly
- ✓ Messages include real-time campaign data, discounts, features, and remaining spots
- ✓ Applied specific discounts per marketing plan:
  - Básico: 10% anual
  - Startup: 35% mensual (5 meses), 40% anual
  - Profesional: 40% mensual (5 meses), 45% anual
  - Empresarial: 30% mensual (3 meses), "Desde $299", botón "Habla con Nosotros"
- ✓ Added urgency messaging with subscriber counters (500 limit)
- ✓ Plan-based feature restriction system with soft restrictions and upgrade popups

Changelog:
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.