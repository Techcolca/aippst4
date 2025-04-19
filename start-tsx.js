import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Iniciando servidor AIPI con TSX...");

// Iniciar el servidor usando npx tsx
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (error) => {
  console.error("❌ Error al iniciar TSX:", error.message);
  console.log("Ejecutando servidor alternativo...");
  
  // Si tsx falla, iniciar el servidor Express básico
  const backupProcess = spawn('node', ['server.js'], {
    stdio: 'inherit'
  });
  
  backupProcess.on('error', (backupError) => {
    console.error("❌ Error fatal, no se pudo iniciar ningún servidor:", backupError.message);
    process.exit(1);
  });
});

// Manejar la señal de terminación
process.on('SIGINT', () => {
  console.log("\nDeteniendo el servidor...");
  serverProcess.kill();
  process.exit(0);
});