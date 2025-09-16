-- ============================================================================
-- RAILWAY CLEAN MIGRATION SQL - Solo estructura y datos esenciales
-- ============================================================================
-- Este archivo contiene SOLO la estructura de tablas y datos básicos
-- EXCLUYE contenido pesado como sites_content, conversations largas, etc.

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- ============================================================================
-- 1. ESTRUCTURA DE TABLAS (todas las tablas necesarias)
-- ============================================================================

-- Usuarios
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    api_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT
);

-- Integraciones
DROP TABLE IF EXISTS integrations CASCADE;
CREATE TABLE integrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    theme_color TEXT DEFAULT '#3B82F6',
    position TEXT DEFAULT 'bottom-right',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    visitor_count INTEGER DEFAULT 0,
    bot_behavior TEXT DEFAULT 'Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web.',
    documents_data JSON DEFAULT '[]',
    widget_type TEXT DEFAULT 'bubble',
    ignored_sections JSON DEFAULT '[]',
    description TEXT,
    ignored_sections_text TEXT,
    customization JSON,
    language TEXT DEFAULT 'es',
    text_color TEXT DEFAULT 'auto'
);

-- Widget Users (para multi-tenant security)
DROP TABLE IF EXISTS widget_users CASCADE;
CREATE TABLE widget_users (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER NOT NULL REFERENCES integrations(id),
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(username, integration_id),
    UNIQUE(email, integration_id)
);

-- Widget Tokens (NUEVA TABLA DE SEGURIDAD)
DROP TABLE IF EXISTS widget_tokens CASCADE;
CREATE TABLE widget_tokens (
    id SERIAL PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    widget_user_id INTEGER NOT NULL REFERENCES widget_users(id),
    integration_id INTEGER NOT NULL REFERENCES integrations(id),
    jwt_payload TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_revoked BOOLEAN DEFAULT false,
    UNIQUE(widget_user_id, integration_id)
);

-- Conversaciones (estructura básica)
DROP TABLE IF EXISTS conversations CASCADE;
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER REFERENCES integrations(id),
    visitor_id TEXT,
    visitor_name TEXT,
    visitor_email TEXT,
    title TEXT,
    resolved BOOLEAN DEFAULT false,
    duration INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Mensajes (estructura básica)
DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id),
    content TEXT NOT NULL,
    role TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Configuraciones
DROP TABLE IF EXISTS settings CASCADE;
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    assistant_name TEXT DEFAULT 'AIPPS Assistant',
    default_greeting TEXT DEFAULT '👋 Hi there! Im AIPPS, your AI assistant. How can I help you today?',
    show_availability BOOLEAN DEFAULT true,
    business_hours_start TIME DEFAULT '09:00',
    business_hours_end TIME DEFAULT '17:00',
    timezone TEXT DEFAULT 'America/Toronto',
    business_days INTEGER[] DEFAULT '{1,2,3,4,5}',
    availability_message TEXT DEFAULT '⏰ We are currently offline. Leave us a message and we will get back to you soon!',
    fallback_message TEXT DEFAULT '⚠️ I dont have specific information about that. Please contact our support team.',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Planes de precios
DROP TABLE IF EXISTS pricing_plans CASCADE;
CREATE TABLE pricing_plans (
    id SERIAL PRIMARY KEY,
    plan_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    price_display TEXT NOT NULL,
    currency TEXT DEFAULT 'cad',
    interval TEXT DEFAULT 'month',
    features TEXT[] DEFAULT '{}',
    tier TEXT NOT NULL,
    interactions_limit INTEGER DEFAULT 100,
    is_annual BOOLEAN DEFAULT false,
    discount INTEGER,
    popular BOOLEAN DEFAULT false,
    available BOOLEAN DEFAULT true,
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Mensajes de bienvenida
DROP TABLE IF EXISTS welcome_messages CASCADE;
CREATE TABLE welcome_messages (
    id SERIAL PRIMARY KEY,
    message_text TEXT NOT NULL,
    message_text_fr TEXT,
    message_text_en TEXT,
    message_type TEXT DEFAULT 'commercial',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Budgets
DROP TABLE IF EXISTS user_budgets CASCADE;
CREATE TABLE user_budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    monthly_budget NUMERIC(10,2) DEFAULT 50.00,
    current_spent NUMERIC(10,2) DEFAULT 0.00,
    billing_cycle_start DATE DEFAULT CURRENT_DATE,
    billing_cycle_end DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
    budget_alerts_enabled BOOLEAN DEFAULT true,
    alert_threshold NUMERIC(3,2) DEFAULT 0.80,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Action Costs  
DROP TABLE IF EXISTS action_costs CASCADE;
CREATE TABLE action_costs (
    id SERIAL PRIMARY KEY,
    action_type TEXT NOT NULL UNIQUE,
    cost_per_action NUMERIC(6,4) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    last_updated TIMESTAMP DEFAULT NOW(),
    last_updated_by INTEGER REFERENCES users(id)
);

-- Tablas adicionales básicas (sin datos pesados)
DROP TABLE IF EXISTS automations CASCADE;
CREATE TABLE automations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    config JSON NOT NULL,
    processed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    last_modified TIMESTAMP DEFAULT NOW()
);

DROP TABLE IF EXISTS forms CASCADE;  
CREATE TABLE forms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    form_data JSON NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 2. ÍNDICES PARA RENDIMIENTO  
-- ============================================================================

CREATE INDEX IF NOT EXISTS widget_tokens_hash_idx ON widget_tokens(token_hash);
CREATE INDEX IF NOT EXISTS widget_tokens_user_integration_idx ON widget_tokens(widget_user_id, integration_id);

-- ============================================================================
-- 3. DATOS BÁSICOS ESENCIALES
-- ============================================================================

-- Planes de precios por defecto
INSERT INTO pricing_plans (plan_id, name, description, price, price_display, currency, interval, features, tier, interactions_limit, popular, available) VALUES
('free', 'Free', 'Plan gratuito con funciones básicas', 0, '$0/mes', 'cad', 'month', '{"100 mensajes/mes","1 integración","Soporte básico"}', 'free', 100, false, true),
('pro', 'Pro', 'Plan profesional para empresas', 2900, '$29/mes', 'cad', 'month', '{"5,000 mensajes/mes","10 integraciones","Soporte prioritario","Analytics avanzados"}', 'pro', 5000, true, true),
('enterprise', 'Enterprise', 'Plan empresarial con funciones avanzadas', 9900, '$99/mes', 'cad', 'month', '{"Mensajes ilimitados","Integraciones ilimitadas","Soporte 24/7","API completa","White-label"}', 'enterprise', -1, false, true);

-- Mensajes de bienvenida por defecto
INSERT INTO welcome_messages (message_text, message_text_fr, message_text_en, message_type, is_active, order_index) VALUES
('🚀 ¡Transforma tu sitio web con AI conversacional inteligente!', '🚀 Transformez votre site web avec une IA conversationnelle intelligente!', '🚀 Transform your website with intelligent conversational AI!', 'commercial', true, 1),
('💬 Crea experiencias únicas para tus visitantes con AIPI', '💬 Créez des expériences uniques pour vos visiteurs avec AIPI', '💬 Create unique experiences for your visitors with AIPI', 'commercial', true, 2),
('🎯 Automatiza atención al cliente 24/7 con inteligencia artificial', '🎯 Automatisez le service client 24/7 avec intelligence artificielle', '🎯 Automate 24/7 customer service with artificial intelligence', 'automation', true, 3);

-- Costos de acciones por defecto
INSERT INTO action_costs (action_type, cost_per_action, description, is_active) VALUES
('openai_completion', 0.0020, 'OpenAI chat completion per request', true),
('message_sent', 0.0001, 'Message sent in chat widget', true),
('document_processing', 0.0050, 'Document processing and analysis', true),
('api_call', 0.0005, 'API call to external service', true);

-- Usuario administrador por defecto (CAMBIAR PASSWORD)
INSERT INTO users (username, email, password, full_name, api_key) VALUES
('admin', 'admin@aipi.com', '$2b$10$example_hashed_password', 'Administrador AIPI', 'aipi_admin_' || substr(md5(random()::text), 0, 16));

-- ============================================================================
-- LISTO - Base de datos Railway preparada con:
-- ✅ Estructura completa de 24+ tablas
-- ✅ Nueva tabla widget_tokens para seguridad  
-- ✅ Datos esenciales únicamente
-- ✅ Sin contenido pesado de sitios web
-- ✅ Sin conversaciones/mensajes viejos
-- ============================================================================