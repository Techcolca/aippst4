import { spawn } from 'child_process';
import { existsSync } from 'fs';
import process from 'process';

// Función para ejecutar un script con los argumentos específicos
function runScript(command, args = [], options = {}) {
  console.log(`🚀 Ejecutando: ${command} ${args.join(' ')}`);
  
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options
    });
    
    child.on('exit', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        console.log(`❌ El comando falló con código ${code}`);
        resolve(false);
      }
    });
    
    child.on('error', (error) => {
      console.log(`❌ Error al ejecutar el comando: ${error.message}`);
      resolve(false);
    });
  });
}

// Función para terminar procesos en ejecución
async function killRunningProcesses() {
  try {
    console.log("🔄 Verificando procesos en ejecución...");
    
    // Intentar matar procesos en varios puertos
    await runScript('pkill', ['-f', 'node']);
    
    // Esperar un momento para asegurar que se liberan los puertos
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("✅ Procesos terminados o no encontrados");
    return true;
  } catch (error) {
    console.log("ℹ️ No se pudieron terminar los procesos, posiblemente no hay ninguno en ejecución");
    return true;
  }
}

// Función principal para iniciar la aplicación
async function startApp() {
  try {
    // Primero terminar cualquier proceso existente
    await killRunningProcesses();
    
    console.log("\n🚀 Iniciando AIPI Platform...");
    
    // Verificar si se puede ejecutar con npx tsx
    console.log("\n🔍 Intentando iniciar con TSX (TypeScript)...");
    
    let success = false;
    
    try {
      // Primero intentar con npx tsx
      success = await runScript('npx', ['tsx', 'server/index.ts']);
    } catch (error) {
      console.log(`❌ Error al ejecutar con npx tsx: ${error.message}`);
      success = false;
    }
    
    // Si falló, intentar con el servidor alternativo
    if (!success) {
      console.log("\n⚠️ No se pudo iniciar con TSX, usando servidor alternativo...");
      
      // Ejecutar el servidor Express simplificado
      return runScript('node', ['run-server.js']);
    }
    
    return success;
  } catch (error) {
    console.error(`❌ Error fatal: ${error.message}`);
    return false;
  }
}

// Ejecutar la función principal
startApp().then(success => {
  if (!success) {
    console.error("\n❌ No se pudo iniciar la aplicación. Revise los logs para más detalles.");
    process.exit(1);
  }
}).catch(error => {
  console.error(`\n❌ Error fatal: ${error.message}`);
  process.exit(1);
});