-- Insertar suscripción Professional para Pablo (user_id=1)
INSERT INTO subscriptions (
  user_id, 
  tier, 
  status, 
  interactions_limit, 
  interactions_used, 
  start_date, 
  end_date, 
  stripe_customer_id, 
  stripe_subscription_id, 
  stripe_price_id,
  created_at,
  updated_at
) VALUES (
  1, -- user_id para Pablo
  'professional', -- Plan Professional
  'active',
  2000, -- Límite de interacciones plan Professional
  0, -- Contador de uso inicial
  CURRENT_DATE, -- Fecha de inicio
  CURRENT_DATE + INTERVAL '1 year', -- Fecha de fin (1 año)
  'pablo_customer', -- ID de cliente en Stripe
  'sub_pablo_professional', -- ID de suscripción en Stripe
  'price_professional', -- ID del precio en Stripe
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Insertar suscripción Basic para Carlos (user_id=3)
INSERT INTO subscriptions (
  user_id, 
  tier, 
  status, 
  interactions_limit, 
  interactions_used, 
  start_date, 
  end_date, 
  stripe_customer_id, 
  stripe_subscription_id, 
  stripe_price_id,
  created_at,
  updated_at
) VALUES (
  3, -- user_id para Carlos
  'basic', -- Plan Basic
  'active',
  500, -- Límite de interacciones plan Basic
  0, -- Contador de uso inicial
  CURRENT_DATE, -- Fecha de inicio
  CURRENT_DATE + INTERVAL '1 year', -- Fecha de fin (1 año)
  'carlos_customer', -- ID de cliente en Stripe
  'sub_carlos_basic', -- ID de suscripción en Stripe
  'price_basic', -- ID del precio en Stripe
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);