/**
 * Este script se ejecuta en Railway.app durante la inicialización.
 * Se asegura de establecer NODE_ENV correctamente cuando la app se inicia.
 */

// Establecer NODE_ENV a 'production' si no está definido
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Importar el archivo principal del servidor
import './index.js';