-- ========================================
-- INSERTAR CONVERSACIONES (29 registros)
-- ========================================

INSERT INTO conversations (id, integration_id, visitor_id, title, resolved, duration, created_at, updated_at, visitor_name, visitor_email) VALUES
(1, 7, 'user_12', 'Nueva conversación', FALSE, 0, '2025-09-05 15:17:12.002215', '2025-09-05 15:17:12.002215', NULL, NULL),
(2, 7, 'user_2', 'Saludo y presentación inicial', FALSE, 0, '2025-09-06 15:21:51.918009', '2025-09-10 15:25:16.383', NULL, NULL),
(3, 7, 'user_12', 'Nueva conversación', FALSE, 0, '2025-09-07 17:58:47.341225', '2025-09-07 17:58:47.341225', NULL, NULL),
(4, 7, 'user_3', 'Nueva conversación', FALSE, 0, '2025-09-07 18:26:31.585174', '2025-09-07 18:26:31.585174', NULL, NULL),
(5, 7, 'user_12', 'Nueva conversación', FALSE, 0, '2025-09-07 18:44:50.515264', '2025-09-07 18:44:50.515264', NULL, NULL),
(6, 7, 'user_12', 'Nueva conversación', FALSE, 0, '2025-09-07 18:48:50.566422', '2025-09-07 18:48:50.566422', NULL, NULL),
(7, 7, 'user_12', 'Clarificación de Término: Entiedno', FALSE, 0, '2025-09-07 19:13:40.969891', '2025-09-07 19:13:43.653', NULL, NULL),
(8, 7, 'user_12', 'Información sobre la aplicación AIPPS', FALSE, 0, '2025-09-07 21:35:16.174869', '2025-09-07 21:35:20.366', NULL, NULL),
(9, 7, 'user_14', 'Saludo y bienestar personal', FALSE, 0, '2025-09-07 21:38:00.240754', '2025-09-07 21:38:02.17', NULL, NULL),
(10, 7, 'user_15', 'Saludo y bienestar', FALSE, 0, '2025-09-07 22:03:22.294968', '2025-09-07 22:03:24.786', NULL, NULL),
(11, 7, 'user_15', 'Creación de Apps con IA', FALSE, 0, '2025-09-07 22:19:02.560396', '2025-09-07 22:19:06.701', NULL, NULL),
(12, 7, 'user_15', 'Información sobre AIPPS', FALSE, 0, '2025-09-07 22:37:56.517629', '2025-09-07 22:37:59.463', NULL, NULL),
(13, 7, 'user_16', 'Consulta sobre servicios ofrecidos', FALSE, 0, '2025-09-07 22:44:20.284077', '2025-09-07 22:44:24.787', NULL, NULL),
(14, 7, 'user_17', 'Saludo Inicial', FALSE, 0, '2025-09-07 23:00:45.767096', '2025-09-07 23:00:47.142', NULL, NULL),
(15, 7, 'user_18', 'Saludo y bienestar', FALSE, 0, '2025-09-08 13:06:51.762126', '2025-09-08 13:06:53.852', NULL, NULL),
(16, 7, 'user_19', 'Saludo Inicial del Usuario', FALSE, 0, '2025-09-08 13:55:55.387121', '2025-09-08 13:55:57.661', NULL, NULL),
(17, 8, 'user_2', 'Saludo y bienestar', FALSE, 0, '2025-09-09 17:59:23.207245', '2025-09-09 17:59:27.93', NULL, NULL),
(18, 8, 'user_2', 'Consejos para Problemas Laborales', FALSE, 0, '2025-09-09 18:59:58.854287', '2025-09-09 19:00:09.703', NULL, NULL),
(19, 8, 'user_2', 'Equilibrio entre trabajo y familia', FALSE, 0, '2025-09-09 19:05:35.152099', '2025-09-09 19:05:41.066', NULL, NULL),
(20, 8, 'user_20', 'Cómo Conocer a Dios', FALSE, 0, '2025-09-11 13:19:09.679904', '2025-09-11 13:19:13.716', NULL, NULL),
(21, 8, 'user_21', 'Saludo y bienestar personal', FALSE, 0, '2025-09-11 15:35:00.091858', '2025-09-11 15:35:05.842', NULL, NULL),
(22, 8, 'user_22', 'Consejos para problemas de pareja', FALSE, 0, '2025-09-11 15:55:07.529661', '2025-09-11 15:55:11.37', NULL, NULL),
(23, 7, 'user_23', 'Servicios ofrecidos por Techcolca', FALSE, 0, '2025-09-11 15:57:00.672322', '2025-09-11 15:57:09.579', NULL, NULL),
(24, 8, 'user_24', 'Información sobre Techcolca', FALSE, 0, '2025-09-11 15:58:00.147152', '2025-09-11 15:58:02.276', NULL, NULL),
(25, 7, 'user_25', 'Comprendiendo el Rol de Techcolca', FALSE, 0, '2025-09-11 15:58:44.584314', '2025-09-11 15:58:51.01', NULL, NULL),
(26, 8, 'user_24', 'Solicitud de Asistencia General', FALSE, 0, '2025-09-11 17:26:42.848805', '2025-09-11 17:26:45.559', NULL, NULL),
(27, 7, 'user_26', 'Saludo Inicial del Usuario', FALSE, 0, '2025-09-11 17:30:27.286675', '2025-09-11 17:30:30.225', NULL, NULL),
(28, 7, 'user_31', 'Saludo y bienestar', FALSE, 0, '2025-09-11 20:21:41.798904', '2025-09-11 20:21:44.631', 'Francis', 'francis@gmail.com'),
(29, 8, 'user_32', 'Bienvenida y Conversación Inicial', FALSE, 0, '2025-09-11 20:23:29.715684', '2025-09-11 20:23:32.362', 'Karen', 'karen@gmail.com');

-- Actualizar secuencia
SELECT setval('conversations_id_seq', (SELECT MAX(id) FROM conversations));