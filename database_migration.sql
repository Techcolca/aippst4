-- ============================================
-- AIPPS: Migración tabla widgetUsers a Railway
-- ============================================
-- Ejecutar este script en Railway PostgreSQL

-- 1. Crear tabla widget_users para autenticación segregada
CREATE TABLE IF NOT EXISTS widget_users (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints únicos por integración
    CONSTRAINT unique_username_per_integration UNIQUE(integration_id, username),
    CONSTRAINT unique_email_per_integration UNIQUE(integration_id, email)
);

-- 2. Crear índices para optimizar performance
CREATE INDEX IF NOT EXISTS idx_widget_users_integration_id ON widget_users(integration_id);
CREATE INDEX IF NOT EXISTS idx_widget_users_username_lookup ON widget_users(username);
CREATE INDEX IF NOT EXISTS idx_widget_users_email_lookup ON widget_users(email);
CREATE INDEX IF NOT EXISTS idx_widget_users_created_at ON widget_users(created_at);

-- 3. Verificar que la tabla se creó correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'widget_users'
ORDER BY ordinal_position;

-- 4. Verificar constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'widget_users'::regclass;

-- 5. Mensaje de confirmación
SELECT 
    'SUCCESS: widget_users table created with ' || count(*) || ' columns' as status
FROM information_schema.columns 
WHERE table_name = 'widget_users';