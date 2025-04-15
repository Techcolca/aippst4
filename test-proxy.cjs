/**
 * Script para probar si podemos acceder a la aplicación a través del proxy
 */
const http = require('http');

const PROXY_PORT = 8080; // Puerto donde está el proxy
const APP_PORT = 3000;   // Puerto donde está la aplicación

console.log(`🔍 Probando acceso directo a la aplicación (puerto ${APP_PORT})...`);
testPort(APP_PORT, (appSuccess) => {
  console.log(`🔍 Probando acceso a través del proxy (puerto ${PROXY_PORT})...`);
  testPort(PROXY_PORT, (proxySuccess) => {
    console.log(`\n📊 Resumen:`);
    console.log(`- Acceso directo: ${appSuccess ? '✅ Funciona' : '❌ No funciona'}`);
    console.log(`- Acceso vía proxy: ${proxySuccess ? '✅ Funciona' : '❌ No funciona'}`);
    
    if (proxySuccess) {
      console.log(`\n🎉 ¡Solución de despliegue correcta!`);
      console.log(`La aplicación está disponible a través del proxy en puerto ${PROXY_PORT}`);
    } else if (appSuccess) {
      console.log(`\n⚠️ La aplicación funciona pero el proxy no puede acceder a ella`);
      console.log(`Esto podría deberse a restricciones en el entorno de Replit`);
    } else {
      console.log(`\n❌ Ni la aplicación ni el proxy están respondiendo`);
      console.log(`Verifica que ambos estén corriendo correctamente`);
    }
  });
});

function testPort(port, callback) {
  const req = http.request({
    method: 'GET',
    hostname: 'localhost',
    port: port,
    path: '/',
    timeout: 3000
  }, (res) => {
    console.log(`  Puerto ${port}: ✅ Respuesta con código ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const firstChars = data.substring(0, 50).replace(/\n/g, ' ');
      console.log(`  Primeros caracteres de respuesta: "${firstChars}..."`);
      callback(true);
    });
  });
  
  req.on('error', (err) => {
    console.error(`  Puerto ${port}: ❌ Error: ${err.message}`);
    callback(false);
  });
  
  req.on('timeout', () => {
    console.error(`  Puerto ${port}: ⏱️ Tiempo de espera agotado`);
    req.destroy();
    callback(false);
  });
  
  req.end();
}