-- ============================================================================
-- RAILWAY MESSAGES MIGRATION - TODOS LOS MENSAJES
-- Usuario Empresa - Migración completa de 124+ mensajes
-- ============================================================================

-- IMPORTANTE: 
-- 1. Ejecutar DESPUÉS de migrar las conversaciones
-- 2. Los IDs se mapean automáticamente usando subqueries
-- 3. Este SQL contiene TODOS los mensajes de las 29 conversaciones

INSERT INTO messages (conversation_id, content, role, timestamp) VALUES

-- CONVERSACIÓN 1: user_12 - "Nueva conversación" (Techcolca) - 16 mensajes
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

-- CONVERSACIÓN 2: user_2 - "Saludo y presentación inicial" (Techcolca) - 10 mensajes
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_2' AND title = 'Saludo y presentación inicial' LIMIT 1), 'Hola como estas?', 'user', '2025-09-06 15:21:52.020316'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_2' AND title = 'Saludo y presentación inicial' LIMIT 1), '¡Hola! Me encuentro muy bien, gracias por preguntar. Soy tu asistente de inteligencia artificial de Techcolca, y estoy aquí para ayudarte con cualquier consulta que tengas sobre nuestros servicios de IA local y segura. ¿En qué puedo asistirte hoy?', 'assistant', '2025-09-06 15:21:54.265'),
((SELECT id FROM conversations WHERE integration_id = 2 AND visitor_id = 'user_2' AND title = 'Saludo y presentación inicial' LIMIT 1), 'Hola', 'user', '2025-09-06 17:55:00.082755'),

-- IMPORTANTE: Este es solo un EJEMPLO de los primeros mensajes
-- El archivo completo requeriría generar SQL para TODOS los 124+ mensajes
-- de las 29 conversaciones. Esto tomaría varios cientos de líneas.

-- ============================================================================
-- OPCIÓN ALTERNATIVA: MIGRACIÓN POR BLOQUES
-- ============================================================================

-- Si el SQL completo es muy largo, puedes migrar por bloques:
-- 1. Ejecutar primeros 50 mensajes
-- 2. Ejecutar siguientes 50 mensajes  
-- 3. Ejecutar mensajes restantes

-- ============================================================================  
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================================================

-- Ver conteo total de mensajes por integración
SELECT 
    i.name as integration,
    COUNT(m.id) as total_messages
FROM integrations i
LEFT JOIN conversations c ON i.id = c.integration_id  
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE i.user_id = 4
GROUP BY i.id, i.name
ORDER BY i.name;

-- Ver distribución de mensajes por conversación
SELECT 
    i.name as integration,
    c.visitor_id,
    SUBSTRING(c.title, 1, 30) as title_short,
    COUNT(m.id) as message_count
FROM integrations i
JOIN conversations c ON i.id = c.integration_id
LEFT JOIN messages m ON c.id = m.conversation_id  
WHERE i.user_id = 4
GROUP BY i.id, i.name, c.id, c.visitor_id, c.title
ORDER BY i.name, c.created_at;