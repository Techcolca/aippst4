#!/usr/bin/env node
/**
 * Script de despliegue para AIPI en Replit
 * Este script compila la aplicación y la inicia en modo producción.
 */
import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obtener directorio actual
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuración
const PORT = process.env.PORT || 8080;
console.log(`🚀 AIPI - Despliegue iniciado (Puerto: ${PORT})`);
console.log(`⏱️ Timestamp: ${new Date().toISOString()}`);

// Función para compilar la aplicación
async function buildApplication() {
  console.log('\n📦 Compilando aplicación...');
  
  try {
    console.log('- Compilando frontend con vite...');
    execSync('npx vite build', { stdio: 'inherit' });
    
    console.log('- Empaquetando backend con esbuild...');
    execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', 
      { stdio: 'inherit' });
    
    return true;
  } catch (error) {
    console.error('❌ Error durante la compilación:', error);
    return false;
  }
}

// Función para iniciar la aplicación de despliegue
async function startDeploymentServer() {
  console.log('\n🚀 Iniciando servidor de despliegue...');
  
  try {
    // Ejecutar el servidor de despliegue simplificado
    const server = spawn('node', ['server-deploy.cjs'], {
      env: {
        ...process.env,
        PORT: PORT
      },
      stdio: 'inherit'
    });
    
    server.on('close', (code) => {
      console.log(`⚠️ El servidor de despliegue se cerró con código: ${code}`);
      
      if (code !== 0 && code !== null) {
        console.log('🔄 Reintentando iniciar servidor en 5 segundos...');
        setTimeout(startDeploymentServer, 5000);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error al iniciar el servidor de despliegue:', error);
    return false;
  }
}

// Ejecución principal
async function main() {
  try {
    // Verificar si estamos en un entorno de despliegue
    const isDeployment = !!process.env.REPL_SLUG;
    console.log(`🔍 Entorno de despliegue: ${isDeployment ? 'Sí' : 'No'}`);
    
    // Si estamos en un despliegue, compilar la aplicación
    if (isDeployment) {
      const buildSuccess = await buildApplication();
      if (!buildSuccess) {
        console.error('❌ La compilación falló, iniciando servidor simplificado...');
      }
    }
    
    // Iniciar el servidor simplificado
    await startDeploymentServer();
    
    console.log('\n✨ Despliegue completado. AIPI está en ejecución.');
  } catch (error) {
    console.error('❌ Error crítico durante el despliegue:', error);
    process.exit(1);
  }
}

// Iniciar el proceso
main();