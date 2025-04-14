
/**
 * Servidor simplificado para despliegue
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist', 'client')));

// Ruta de estado
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando' });
});

// Ruta de API fallback
app.get('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Ruta catch-all para SPA
app.get('*', (req, res) => {
  // Intentar servir index.html
  const indexPath = path.join(__dirname, 'dist', 'client', 'index.html');
  const fallbackPath = path.join(__dirname, 'public', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else if (fs.existsSync(fallbackPath)) {
    res.sendFile(fallbackPath);
  } else {
    res.send('<h1>AIPI - Servidor en Mantenimiento</h1><p>El servidor está en modo de mantenimiento.</p>');
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor iniciado en http://0.0.0.0:${PORT}`);
});
