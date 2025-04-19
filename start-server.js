/**
 * Script temporal para iniciar la aplicación sin tsx
 */
import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Iniciando aplicación AIPI sin tsx...');

// Ejecutar la aplicación usando node y npx
const npx = spawn('npx', ['--yes', 'tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT || 3000,
    NODE_ENV: 'development'
  }
});

npx.on('error', (err) => {
  console.error('❌ Error al iniciar con npx:', err);
  console.log('⚠️ Intentando con node directamente...');
  
  // Intentar compilar y ejecutar con node directamente
  const tsc = spawn('npx', ['--yes', 'tsc', '--skipLibCheck', 'server/index.ts'], {
    stdio: 'inherit'
  });
  
  tsc.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Error al compilar con TypeScript, código: ${code}`);
      process.exit(1);
    }
    
    // Ejecutar usando node
    const node = spawn('node', ['server/index.js'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: process.env.PORT || 3000,
        NODE_ENV: 'development'
      }
    });
    
    node.on('error', (err) => {
      console.error('❌ Error al iniciar con node:', err);
      process.exit(1);
    });
  });
});