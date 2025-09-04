export function getBaseUrl(): string {
  // Si APP_URL está definido, usarlo (máxima prioridad)
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  
  // En un entorno de Railway, usar RAILWAY_STATIC_URL si está disponible
  if (process.env.RAILWAY_STATIC_URL) {
    return process.env.RAILWAY_STATIC_URL;
  }
  
  // En un entorno de Replit, construir la URL basada en la información del entorno
  const replitSlug = process.env.REPL_SLUG;
  const replitOwner = process.env.REPL_OWNER;
  if (replitSlug && replitOwner) {
    return `https://${replitSlug}.${replitOwner}.repl.co`;
  }
  
  // URL por defecto como último recurso
  return process.env.NODE_ENV === 'production' 
    ? 'https://aipps.ca' 
    : 'http://localhost:5000';
}
