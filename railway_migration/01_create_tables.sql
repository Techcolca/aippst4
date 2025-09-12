-- Scripts SQL para recrear tablas en Railway
-- Ejecutar estos comandos en pgAdmin Query Tool de Railway

-- 1. Tabla users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    api_key TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT
);

-- 2. Tabla pricing_plans
CREATE TABLE pricing_plans (
    id SERIAL PRIMARY KEY,
    plan_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    price_display TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'cad',
    interval TEXT NOT NULL DEFAULT 'month',
    features JSON NOT NULL,
    tier TEXT NOT NULL,
    interactions_limit INTEGER NOT NULL,
    is_annual BOOLEAN DEFAULT FALSE,
    discount INTEGER,
    popular BOOLEAN DEFAULT FALSE,
    available BOOLEAN DEFAULT TRUE,
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 3. Tabla subscriptions
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    stripe_customer_id TEXT,
    stripe_price_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'inactive',
    tier TEXT NOT NULL DEFAULT 'free',
    interactions_limit INTEGER NOT NULL DEFAULT 20,
    interactions_used INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMP WITHOUT TIME ZONE,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 4. Tabla conversations
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER,
    visitor_id TEXT,
    title TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    duration INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    visitor_name TEXT,
    visitor_email TEXT
);

-- 5. Tabla messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER,
    content TEXT NOT NULL,
    role TEXT NOT NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 6. Tabla settings
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    setting_key TEXT NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Agregar las otras 12 tablas restantes si están vacías, se pueden crear después