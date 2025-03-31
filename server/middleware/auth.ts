import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}

/**
 * Middleware to verify JWT token from cookies
 * Adds userId to the request object if verification is successful
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  // Primero comprobar si hay un token válido
  const token = req.cookies?.auth_token || 
                (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') 
                 ? req.headers.authorization.slice(7) : null);
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      req.userId = decoded.userId;
      return next();
    } catch (error) {
      console.error('Token verification error:', error);
      // Si estamos en producción, devolvemos un error
      if (process.env.NODE_ENV === 'production') {
        res.clearCookie('auth_token');
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      // En desarrollo, continuamos con el usuario por defecto
    }
  }
  
  // En desarrollo, si no hay token o es inválido, utilizamos un userId fijo
  if (process.env.NODE_ENV !== 'production') {
    console.log("Modo desarrollo - autenticación automática");
    // Establece un ID de usuario fijo para desarrollo
    req.userId = 1;
    return next();
  }
  
  // En producción, si no hay token, devolvemos un error
  return res.status(401).json({ message: 'Authentication required' });
}

/**
 * Middleware to verify API key from query parameters or headers
 * Used for widget and embedded script authentication
 */
export function verifyApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.query.key as string || req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ message: 'API key required' });
  }
  
  // API key verification will be handled by the route handler
  // We just attach it to the request for convenience
  req.headers['x-api-key'] = apiKey;
  next();
}

/**
 * Optional authentication middleware
 * Attaches userId to request if token is valid, but doesn't block requests without tokens
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.auth_token;
  
  if (!token) {
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
  } catch (error) {
    // Invalid token, but we continue anyway
    console.error('Optional auth token verification error:', error);
    res.clearCookie('auth_token');
  }
  
  next();
}

/**
 * Role-based authorization middleware
 * Requires the verifyToken middleware to be used before this one
 */
export function authorize(roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // This would typically check the user's roles from the database
      // For this example, we're just making a simple check
      
      // Assume admin role for userId 1 for demo purposes
      const isAdmin = req.userId === 1;
      
      if (roles.includes('admin') && !isAdmin) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}
