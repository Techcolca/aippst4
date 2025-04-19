import { spawn } from 'child_process';

/**
 * Función para terminar procesos existentes
 */
function killRunningProcesses() {
  return new Promise((resolve) => {
    console.log("🔄 Verificando procesos en ejecución...");
    
    // Intentar matar procesos en el puerto 3000
    const kill = spawn('pkill', ['-f', 'node']);
    
    kill.on('close', (code) => {
      if (code === 0) {
        console.log("✅ Procesos anteriores terminados");
      } else {
        console.log("ℹ️ No se encontraron procesos anteriores en ejecución");
      }
      
      // Esperar un momento para asegurar que los puertos se liberen
      setTimeout(resolve, 1000);
    });
  });
}

/**
 * Función para iniciar el servidor
 */
function startServer() {
  console.log("🚀 Iniciando servidor AIPI...");
  
  // Ejecutar el servidor simplificado
  const server = spawn('node', ['run-server.js'], {
    stdio: 'inherit',
    detached: false
  });
  
  server.on('error', (error) => {
    console.error(`❌ Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  });
  
  // Mantener el proceso principal en ejecución
  process.on('SIGINT', () => {
    console.log("🛑 Deteniendo servidor...");
    server.kill();
    process.exit(0);
  });
}

/**
 * Función principal
 */
async function main() {
  // Primero terminar procesos existentes
  await killRunningProcesses();
  
  // Iniciar el servidor
  startServer();
}

// Ejecutar la función principal
main().catch(error => {
  console.error(`❌ Error fatal: ${error.message}`);
  process.exit(1);
});