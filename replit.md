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

June 25, 2025:
- ✓ Fixed promotional message rotation system on homepage
- ✓ Implemented missing generateAIPromotionalMessages function in backend
- ✓ Created proper database integration for AI-generated promotional messages
- ✓ Fixed React Query implementation for promotional messages API
- ✓ Ensured 7 promotional messages rotate every 7 seconds as designed
- ✓ Messages now properly display below "Bienvenidos a AiPPS" title with full rotation

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