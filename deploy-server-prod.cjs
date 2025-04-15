/**
 * Servidor de producción para la versión desplegada
 * Incluye más funcionalidades que el servidor simple
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist', 'client')));

// Configuración para CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    return res.status(200).json({});
  }
  next();
});

// Rutas de API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '1.0.0', 
    env: process.env.NODE_ENV || 'development',
    appReady: true,
    serverTime: new Date().toISOString()
  });
});

// Simular endpoint de autenticación
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Credenciales de prueba
  if (username === 'admin' && password === 'admin1726') {
    res.json({ 
      success: true, 
      token: 'sample-jwt-token-for-testing',
      user: { 
        id: 1, 
        username: 'admin', 
        email: 'admin@aipi.com',
        role: 'admin' 
      }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Credenciales incorrectas' 
    });
  }
});

// Endpoint para obtener usuario actual
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // En producción, verificaríamos el token JWT
    res.json({ 
      id: 1, 
      username: 'admin', 
      email: 'admin@aipi.com',
      role: 'admin' 
    });
  } else {
    res.status(401).json({ message: 'No autenticado' });
  }
});

// Ruta catch-all para SPA
app.get('*', (req, res) => {
  // Evitar rutas de API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Enviar el index.html para cualquier otra ruta
  const indexPath = path.join(__dirname, 'dist', 'client', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Error: Archivo index.html no encontrado');
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de producción iniciado en http://0.0.0.0:${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
});
