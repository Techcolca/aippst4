-- ========================================
-- INSERTAR SUSCRIPCIONES (2 registros)
-- ========================================

INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_price_id, stripe_subscription_id, status, tier, interactions_limit, interactions_used, start_date, end_date, created_at, updated_at) VALUES
(1, 3, NULL, NULL, NULL, 'active', 'enterprise', 99999, 0, '2025-09-02 19:35:07.231432', '2026-09-02 19:35:07.229', '2025-09-02 19:35:07.231432', '2025-09-02 19:35:07.231432'),
(2, 5, NULL, NULL, NULL, 'active', 'professional', 2000, 0, '2025-09-03 14:53:56.195065', '2025-10-03 14:53:56.2', '2025-09-03 14:53:56.195065', '2025-09-03 14:53:56.195065');

-- Actualizar secuencia
SELECT setval('subscriptions_id_seq', (SELECT MAX(id) FROM subscriptions));