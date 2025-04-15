/**
 * Script para probar la conectividad a un puerto específico
 */
const http = require('http');

const PORT = 5017; // Puerto a probar

console.log(`🔍 Probando conectividad al puerto ${PORT}...`);

// Intentar una solicitud GET simple
const req = http.request({
  method: 'GET',
  hostname: 'localhost',
  port: PORT,
  path: '/',
  timeout: 2000
}, (res) => {
  console.log(`✅ Conexión exitosa al puerto ${PORT}`);
  console.log(`🔹 Código de estado: ${res.statusCode}`);
  console.log(`🔹 Cabeceras:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`🔹 Primeros 100 caracteres de respuesta: ${data.substring(0, 100)}...`);
  });
});

req.on('error', (err) => {
  console.error(`❌ Error conectando al puerto ${PORT}: ${err.message}`);
});

req.on('timeout', () => {
  console.error(`⏱️ Tiempo de espera agotado conectando al puerto ${PORT}`);
  req.destroy();
});

req.end();