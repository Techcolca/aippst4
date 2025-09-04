import { Request, Response, NextFunction } from 'express';

export function setupCorsForAIPPS(req: Request, res: Response, next: NextFunction) {
  // Permitir requests de AIPPS y dominios relacionados
  const allowedOrigins = [
    'https://aipps.app',
    'https://widget.aipps.app',
    'https://www.aipps.app',
    'https://techcolca.ca',
    'https://www.techcolca.ca',
    process.env.FRONTEND_URL || 'http://localhost:5000',
    // Añadir el dominio actual
    `https://${req.get('host')}`
  ];
  
  const origin = req.headers.origin;
  
  // Siempre permitir requests sin origen (como Postman, curl, etc.)
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  
  console.log(`🌐 CORS - Origin: ${origin}, Method: ${req.method}, Path: ${req.path}`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS Preflight respondido');
    res.sendStatus(200);
  } else {
    next();
  }
}
