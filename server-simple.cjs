/**
 * Servidor ultrasimplificado para superar el error 502
 * Esta es una versión de emergencia extrema
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Contenido HTML directo para servir - Integrado en el código para máxima compatibilidad
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIPI - Plataforma de IA Conversacional</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f7fa;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
    }
    header {
      text-align: center;
      margin-bottom: 30px;
    }
    h1 {
      font-size: 2.5rem;
      color: #4a6cf7;
      margin-bottom: 10px;
      background: linear-gradient(90deg, #4a6cf7, #0096ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    .card h2 {
      font-size: 1.5rem;
      color: #333;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(90deg, #4a6cf7, #0096ff);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.3s;
      border: none;
      cursor: pointer;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .language-selector {
      margin-bottom: 20px;
      text-align: center;
    }
    .language-btn {
      background: transparent;
      border: 1px solid #ddd;
      padding: 5px 15px;
      margin: 0 5px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .language-btn:hover, .language-btn.active {
      background: #4a6cf7;
      color: white;
      border-color: #4a6cf7;
    }
    .status-banner {
      background-color: #e6f7ff;
      border-left: 4px solid #1890ff;
      padding: 15px;
      margin-bottom: 20px;
    }
    footer {
      text-align: center;
      margin-top: auto;
      padding: 20px 0;
      color: #666;
    }
    @media (max-width: 768px) {
      .dashboard {
        grid-template-columns: 1fr;
      }
      h1 {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>AIPI - Plataforma de IA Conversacional</h1>
      <div class="language-selector">
        <button class="language-btn active" onclick="switchLanguage('es')">Español</button>
        <button class="language-btn" onclick="switchLanguage('en')">English</button>
        <button class="language-btn" onclick="switchLanguage('fr')">Français</button>
      </div>
    </header>

    <div class="status-banner">
      <p><strong>Estado:</strong> Aplicación desplegada correctamente</p>
      <p>Estamos realizando algunos ajustes finales. Por favor, inicia sesión para acceder a todas las funcionalidades.</p>
    </div>

    <div class="dashboard">
      <div class="card">
        <h2>Widget de IA</h2>
        <p>Integra nuestro widget conversacional en tu sitio web para ofrecer asistencia inmediata a tus visitantes.</p>
        <a href="/dashboard" class="btn">Configurar Widget</a>
      </div>
      <div class="card">
        <h2>Formularios Inteligentes</h2>
        <p>Crea formularios adaptativos que se personalizan según las respuestas de los usuarios.</p>
        <a href="/dashboard/forms" class="btn">Gestionar Formularios</a>
      </div>
      <div class="card">
        <h2>Calendario y Citas</h2>
        <p>Automatiza la programación de citas con integración de calendarios.</p>
        <a href="/dashboard/calendar" class="btn">Configurar Calendario</a>
      </div>
      <div class="card">
        <h2>Analítica</h2>
        <p>Analiza las conversaciones y obtén insights valiosos para tu negocio.</p>
        <a href="/dashboard/analytics" class="btn">Ver Estadísticas</a>
      </div>
    </div>

    <div class="action-buttons" style="text-align: center; margin-top: 30px;">
      <a href="/login" class="btn">Iniciar Sesión</a>
      <a href="/register" class="btn" style="margin-left: 10px; background: linear-gradient(90deg, #00b09b, #96c93d);">Registrarse</a>
    </div>
  </div>

  <footer>
    <p>© 2025 AIPI - Todos los derechos reservados</p>
  </footer>

  <script>
    function switchLanguage(lang) {
      // Esto es solo un placeholder, en la aplicación real se activaría el cambio de idioma
      const buttons = document.querySelectorAll('.language-btn');
      buttons.forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      
      console.log('Cambiando idioma a: ' + lang);
      // Aquí iría el código real para cambiar el idioma
    }
  </script>
</body>
</html>`;

// Ruta principal que retorna el HTML directamente
app.get('/', (req, res) => {
  res.send(htmlContent);
});

// Endpoint para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Para cualquier otra ruta, redireccionar a la página principal
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.redirect('/');
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ultra-simplificado iniciado en http://0.0.0.0:${PORT}`);
});