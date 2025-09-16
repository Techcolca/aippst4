-- RAILWAY MESSAGES MIGRATION - SQL 100% EJECUTABLE
-- Usuario Empresa - Migración de mensajes principales

INSERT INTO messages (conversation_id, content, role, timestamp) VALUES

-- MENSAJES DE TECHCOLCA (Integration ID = 2)

-- Conversación 1: user_12 - Nueva conversación
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'Hola como estas?', 'user', '2025-09-05 17:22:50.88781'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'necesito saber los servicios', 'user', '2025-09-05 18:07:18.774921'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'hi', 'user', '2025-09-05 18:22:27.338029'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'hola', 'user', '2025-09-05 18:24:57.788397'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'hi como estas? dime sobre aipps', 'user', '2025-09-05 18:41:31.362997'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'que bueno ayudame', 'user', '2025-09-05 19:12:43.635096'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'que cosa', 'user', '2025-09-05 19:13:38.855265'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'necesito informacion', 'user', '2025-09-05 19:27:38.099943'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'hola', 'user', '2025-09-05 19:28:06.430986'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'ola necesito ayuda con esta informacion', 'user', '2025-09-06 11:46:00.792692'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'hi i need the information', 'user', '2025-09-06 12:23:33.547159'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'quiero saber mas de techcolca', 'user', '2025-09-06 12:34:54.156386'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'Hola como estas?', 'user', '2025-09-06 12:36:37.015373'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'hi como estas', 'user', '2025-09-06 16:11:33.104248'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'ola', 'user', '2025-09-06 17:34:30.710666'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_12' AND title = 'Nueva conversación' ORDER BY created_at LIMIT 1), 'hi', 'user', '2025-09-07 17:58:14.303696'),

-- Conversación 2: user_2 - Saludo y presentación inicial
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_2' AND title = 'Saludo y presentación inicial' LIMIT 1), 'Hola como estas?', 'user', '2025-09-06 15:21:52.020316'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_2' AND title = 'Saludo y presentación inicial' LIMIT 1), 'Hola! Me encuentro muy bien, gracias por preguntar. Soy tu asistente de inteligencia artificial de Techcolca.', 'assistant', '2025-09-06 15:21:54.265'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_2' AND title = 'Saludo y presentación inicial' LIMIT 1), 'Hola', 'user', '2025-09-06 17:55:00.082755'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_2' AND title = 'Saludo y presentación inicial' LIMIT 1), 'Hola', 'user', '2025-09-06 20:11:46.11556'),

-- MENSAJES DE DIOS FIEL (Integration ID = 3)

-- Conversación: user_2 - Saludo y bienestar
((SELECT id FROM conversations WHERE integration_id = 3 AND visitor_id = 'user_2' AND title = 'Saludo y bienestar' ORDER BY created_at LIMIT 1), 'Hola', 'user', '2025-09-09 17:59:23.347547'),
((SELECT id FROM conversations WHERE integration_id = 3 AND visitor_id = 'user_2' AND title = 'Saludo y bienestar' ORDER BY created_at LIMIT 1), 'Hola! Como estas?', 'user', '2025-09-09 17:59:25.207993'),
((SELECT id FROM conversations WHERE integration_id = 3 AND visitor_id = 'user_2' AND title = 'Saludo y bienestar' ORDER BY created_at LIMIT 1), 'Paz de Dios para ti! Me da mucha alegria saludarte. Estoy aqui para acompanarte y brindarte consejos desde la perspectiva cristiana.', 'assistant', '2025-09-09 17:59:27.93'),

-- Conversación: user_20 - Cómo Conocer a Dios
((SELECT id FROM conversations WHERE integration_id = 3 AND visitor_id = 'user_20' AND title = 'Cómo Conocer a Dios' LIMIT 1), 'hola', 'user', '2025-09-11 13:19:09.826808'),
((SELECT id FROM conversations WHERE integration_id = 3 AND visitor_id = 'user_20' AND title = 'Cómo Conocer a Dios' LIMIT 1), 'Paz de Dios! Como puedo ayudarte hoy? Estoy aqui para brindarte consejos y acompanamiento desde la perspectiva cristiana.', 'assistant', '2025-09-11 13:19:13.716'),

-- Conversación: user_32 - Bienvenida y Conversación Inicial (Karen)
((SELECT id FROM conversations WHERE integration_id = 3 AND visitor_id = 'user_32' AND title = 'Bienvenida y Conversación Inicial' LIMIT 1), 'Hola', 'user', '2025-09-11 20:23:29.844726'),
((SELECT id FROM conversations WHERE integration_id = 3 AND visitor_id = 'user_32' AND title = 'Bienvenida y Conversación Inicial' LIMIT 1), 'Paz de Dios, Karen! Que alegria saludarte. Estoy aqui para acompanarte y brindarte consejos desde la perspectiva cristiana.', 'assistant', '2025-09-11 20:23:32.362');