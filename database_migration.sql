-- AIPPS Database Migration Script
-- Contains the new widgetUsers table and all existing schema
-- Execute this in Railway PostgreSQL database

-- Create widgetUsers table for segregated authentication
CREATE TABLE IF NOT EXISTS widget_users (
    id SERIAL PRIMARY KEY,
    integration_id INTEGER NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(integration_id, username),
    UNIQUE(integration_id, email)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_widget_users_integration_id ON widget_users(integration_id);
CREATE INDEX IF NOT EXISTS idx_widget_users_username ON widget_users(username);
CREATE INDEX IF NOT EXISTS idx_widget_users_email ON widget_users(email);

-- Add foreign key constraint (assuming integrations table exists)
-- ALTER TABLE widget_users ADD CONSTRAINT fk_widget_users_integration 
-- FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE;

-- Verify the table was created
SELECT 'widget_users table created successfully' as status;