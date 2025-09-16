import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Request interface extension is now in server/middleware/auth.ts

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Primero verificar si hay sesión Passport.js (para usuarios de la aplicación AIPPS)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      console.log('🔐 Autenticación via Passport.js - Usuario:', req.user.username);
      req.userId = req.user.id;
      return next();
    }

    // Si no hay sesión Passport, verificar JWT token (para usuarios finales del widget)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      console.log('❌ No token JWT proporcionado y no hay sesión Passport');
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    // Verificar JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
    
    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) {
        console.log('❌ Token JWT inválido:', err.message);
        return res.status(403).json({ message: 'Token inválido' });
      }

      // Verificar que el usuario existe en la base de datos
      try {
        const user = await storage.getUser(decoded.userId);
        if (!user) {
          console.log('❌ Usuario no encontrado para token JWT:', decoded.userId);
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        console.log('✅ Autenticación JWT exitosa - Usuario:', user.username);
        req.userId = decoded.userId;
        next();
      } catch (dbError) {
        console.error('❌ Error verificando usuario en BD:', dbError);
        return res.status(500).json({ message: 'Error interno del servidor' });
      }
    });

  } catch (error) {
    console.error('❌ Error en authenticateJWT:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
