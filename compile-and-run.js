import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Compilando e iniciando servidor AIPI...");

try {
  // Paso 1: Compilar el proyecto TypeScript
  console.log("⚙️ Compilando TypeScript...");
  
  const tscResult = spawnSync('npx', ['tsc', '--project', '.'], {
    stdio: 'inherit',
    env: process.env,
    shell: true
  });
  
  if (tscResult.status !== 0) {
    throw new Error("Error al compilar TypeScript");
  }
  
  console.log("✅ Compilación completada.");
  
  // Paso 2: Determinar la ubicación del archivo JavaScript compilado
  const serverJsPath = path.join(__dirname, 'dist', 'server', 'index.js');
  
  if (!fs.existsSync(serverJsPath)) {
    console.log("⚠️ No se encontró el archivo compilado en:", serverJsPath);
    console.log("Buscando archivo index.js en otras ubicaciones...");
    
    // Buscar en ubicaciones alternativas
    const altLocations = [
      path.join(__dirname, 'server', 'index.js'),
      path.join(__dirname, 'build', 'server', 'index.js')
    ];
    
    const foundLocation = altLocations.find(loc => fs.existsSync(loc));
    
    if (foundLocation) {
      console.log("✅ Archivo encontrado en:", foundLocation);
      runServer(foundLocation);
    } else {
      console.log("❌ No se pudo encontrar el archivo compilado.");
      console.log("Ejecutando servidor Express simplificado como respaldo...");
      runSimpleServer();
    }
  } else {
    console.log("✅ Archivo compilado encontrado.");
    runServer(serverJsPath);
  }
} catch (error) {
  console.error("❌ Error:", error.message);
  console.log("Ejecutando servidor Express simplificado como respaldo...");
  runSimpleServer();
}

function runServer(jsPath) {
  console.log("🚀 Iniciando servidor...");
  
  const nodeResult = spawnSync('node', [jsPath], {
    stdio: 'inherit',
    env: process.env
  });
  
  if (nodeResult.error) {
    console.error("❌ Error al iniciar el servidor:", nodeResult.error);
    runSimpleServer();
  }
}

function runSimpleServer() {
  console.log("🔄 Iniciando servidor Express simplificado...");
  
  const simpleServerPath = path.join(__dirname, 'start-app.js');
  
  if (fs.existsSync(simpleServerPath)) {
    const simpleResult = spawnSync('node', [simpleServerPath], {
      stdio: 'inherit',
      env: process.env
    });
    
    if (simpleResult.error) {
      console.error("❌ Error crítico: No se pudo iniciar el servidor simplificado:", simpleResult.error);
      process.exit(1);
    }
  } else {
    console.error("❌ Error: No se encontró el archivo de servidor simplificado (start-app.js)");
    process.exit(1);
  }
}