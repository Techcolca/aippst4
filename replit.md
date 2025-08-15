# AIPI - AI-Powered Conversational Platform

## Overview

AIPI is an advanced conversational AI platform for websites, offering intelligent chat widgets and integrated form solutions. It aims to provide dynamic interaction tools and communication solutions, enhancing user engagement and data collection on client websites. Key capabilities include bubble-style and fullscreen chat interfaces, and embeddable form solutions.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Chat Widget System**: Bubble, fullscreen, and modern form integrations with embeddable JavaScript and real-time communication. Includes intelligent conflict detection.
- **Document Processing Engine**: Supports PDF, DOCX, and plain text content extraction for knowledge base integration.
- **AI Integration Layer**: Utilizes OpenAI GPT-4o-mini for chat completion, sentiment analysis, and summarization, building context-aware knowledge bases from scraped content.
- **Form Management System**: Dynamic, template-based form generation with external embedding and comprehensive data collection.
- **Payment Integration**: Stripe for payment processing, subscription management, and webhook handling for tiered pricing plans.
- **Internationalization**: Complete multilingual support with 100% translation coverage for UI elements, messages, and content across English, Spanish, and French. Eliminated all raw technical data and underscore-separated text from UI. All translation keys return proper strings (not objects) with comprehensive analytics chart translations.

## External Dependencies

- **OpenAI API**: AI model access for chat completions.
- **Stripe**: Payment processing and subscription management.
- **PostgreSQL**: Primary database.
- **Google Calendar API**: Appointment scheduling.
- **Outlook Calendar API**: Microsoft calendar integration.
- **SendGrid/AWS SES**: Email notification services.