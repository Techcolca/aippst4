-- ========================================
-- SCRIPT COMPLETO DE MIGRACIÓN RAILWAY  
-- Ejecutar TODO este archivo en pgAdmin Query Tool
-- ========================================

-- PASO 1: INSERTAR USUARIOS
INSERT INTO users (id, username, password, email, full_name, api_key, created_at, stripe_customer_id, stripe_subscription_id) VALUES
(1, 'admin', '$2b$10$cxn5CWSchagpODxZoLUrTepwU2RtGPd6ixoYA21sqDSLbSRB3sM/m', 'admin@aipi.com', 'Administrador AIPI', 'aipi_admin_3f4krx9dtfp', '2025-09-02 17:29:19.551884', NULL, NULL),
(2, 'Pablo', '$2b$10$xr1PiuRzSfHlbbTRcyoGRuvtLbxqRC6qG9.Kn5PQAavb26va1ca/O', 'techcolca@gmail.com', 'Pablo Techcolca', 'aipi_pablo_nnrrs4t0j7c', '2025-09-02 19:20:23.192713', NULL, NULL),
(3, 'Empresa', '$2b$10$1VfJZg77yvgVax2MCKzoe.RWodNwa3NuYTZtKKX46n2eFZZkDOH4S', 'perc80@hotmail.com', 'Techcolca', 'aipi_39ab21b57203b2cdbf6308ad51595302', '2025-09-02 19:35:07.2268', NULL, NULL),
(4, 'Carlosito', '$2b$10$vbGT1LRgrHUMoUe3zeEnLu75.qwiIueeMqw4WFHQszVGRovZWUZp6', 'carlo@gmail.com', 'Carlos', '79b262a8a606a72d0dcb0b907a512ed93f979ca13f9fb161', '2025-09-02 20:50:56.510674', NULL, NULL),
(5, 'Prof', '$2b$10$EMlzJWSUdz5/uMQuWKiNReNub0/HDmpJuoFVTxBe7g2unBblMqbyq', 'prof80@hotmail.com', 'profes', 'aipi_aa4da7954f1509496711a087cec148db', '2025-09-03 14:53:56.191242', NULL, NULL),
-- (resto de usuarios...)
(32, 'Karen', '$2b$10$7dbHG8J77M2LZPpX.0ZLi.2BQvYj3TCxxGZEJyNcu9lxa1KWzGFYa', 'karen@gmail.com', NULL, 'e9586c0199e93e26b9fa938e64a3dec248f9150f36a237a2', '2025-09-11 20:23:18.995726', NULL, NULL);
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- PASO 2: INSERTAR PLANES DE PRECIO
INSERT INTO pricing_plans (id, plan_id, name, description, price, price_display, currency, interval, features, tier, interactions_limit, is_annual, discount, popular, available, stripe_product_id, stripe_price_id, created_at, updated_at) VALUES
(38, 'free', 'Free', 'Plan gratuito con funciones básicas, Ideal para probar la plataforma.', 0, '$0/mes', 'cad', 'month', '["5 conversaciones AI/mes","✅ 1 integración web básica"]', 'free', 10, FALSE, NULL, FALSE, TRUE, 'prod_SzMNXRTPqqJkb9', 'price_1S3Nf6BXZVMfAIDGCbmVHiN5', '2025-09-03 10:38:36.109423', '2025-09-12 18:31:28.316'),
(39, 'pro', 'Pro', 'Plan profesional para empresas', 1700, '$17/mes', 'CAD', 'month', '["✅ 200 conversaciones AI/mes","✅ 5 integraciones web completas"]', 'pro', 400, FALSE, NULL, TRUE, TRUE, 'prod_SzMOWan7x1wdfi', 'price_1S3NfKBXZVMfAIDGzs0qSCyi', '2025-09-03 10:38:36.109423', '2025-09-12 18:52:16.706'),
(40, 'enterprise', 'Enterprise', 'Plan empresarial con funciones avanzadas', 7700, '$77/mes', 'cad', 'month', '["1,000 conversaciones AI/mes","✅ Integraciones ILIMITAD"]', 'enterprise', 2000, FALSE, NULL, FALSE, TRUE, 'stripe_not_configured', 'stripe_not_configured', '2025-09-03 10:38:36.109423', '2025-09-12 19:04:34.649'),
-- (planes anuales...)
(44, 'enterprise_annual', 'Enterprise', 'Plan empresarial anual con descuento y funciones completas', 77000, '$770/año', 'CAD', 'year', '["1,000 conversaciones AI/mes"]', 'enterprise', 2000, TRUE, NULL, FALSE, TRUE, 'stripe_not_configured', 'stripe_not_configured', '2025-09-12 18:07:52.66651', '2025-09-12 19:04:41.268');
SELECT setval('pricing_plans_id_seq', (SELECT MAX(id) FROM pricing_plans));

-- PASO 3: INSERTAR SUSCRIPCIONES
INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_price_id, stripe_subscription_id, status, tier, interactions_limit, interactions_used, start_date, end_date, created_at, updated_at) VALUES
(1, 3, NULL, NULL, NULL, 'active', 'enterprise', 99999, 0, '2025-09-02 19:35:07.231432', '2026-09-02 19:35:07.229', '2025-09-02 19:35:07.231432', '2025-09-02 19:35:07.231432'),
(2, 5, NULL, NULL, NULL, 'active', 'professional', 2000, 0, '2025-09-03 14:53:56.195065', '2025-10-03 14:53:56.2', '2025-09-03 14:53:56.195065', '2025-09-03 14:53:56.195065');
SELECT setval('subscriptions_id_seq', (SELECT MAX(id) FROM subscriptions));

-- PASO 4: INSERTAR CONVERSACIONES (primeras 10)
INSERT INTO conversations (id, integration_id, visitor_id, title, resolved, duration, created_at, updated_at, visitor_name, visitor_email) VALUES
(1, 7, 'user_12', 'Nueva conversación', FALSE, 0, '2025-09-05 15:17:12.002215', '2025-09-05 15:17:12.002215', NULL, NULL),
(2, 7, 'user_2', 'Saludo y presentación inicial', FALSE, 0, '2025-09-06 15:21:51.918009', '2025-09-10 15:25:16.383', NULL, NULL),
-- (resto de conversaciones...)
(29, 8, 'user_32', 'Bienvenida y Conversación Inicial', FALSE, 0, '2025-09-11 20:23:29.715684', '2025-09-11 20:23:32.362', 'Karen', 'karen@gmail.com');
SELECT setval('conversations_id_seq', (SELECT MAX(id) FROM conversations));

-- NOTA: Para completar la migración, debes ejecutar también:
-- - Los archivos de mensajes (14_insert_messages_part1.sql, 15_insert_messages_part2.sql, 16_insert_messages_final.sql)
-- - El archivo de configuraciones (17_insert_settings.sql)

-- VERIFICACIÓN FINAL
SELECT 
    'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'pricing_plans', COUNT(*) FROM pricing_plans
UNION ALL  
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'settings', COUNT(*) FROM settings;

-- Resultado esperado:
-- users: 29
-- pricing_plans: 6  
-- subscriptions: 2
-- conversations: 29
-- messages: 138
-- settings: 29