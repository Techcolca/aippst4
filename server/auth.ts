import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { ExtendedUser } from "./database-storage";

declare global {
  namespace Express {
    interface User extends ExtendedUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  if (!stored || typeof stored !== 'string') {
    console.error('Invalid stored password:', stored);
    return false;
  }
  
  const parts = stored.split(".");
  if (parts.length !== 2) {
    console.error('Invalid password format:', stored);
    return false;
  }
  
  const [hashed, salt] = parts;
  if (!hashed || !salt) {
    console.error('Missing hash or salt:', { hashed: !!hashed, salt: !!salt });
    return false;
  }
  
  try {
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "teampulse-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Permitir acceso desde JavaScript para AIPPS
      sameSite: 'lax' // Permitir cookies de widgets externos
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`🔐 Login attempt for username: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`❌ User not found: ${username}`);
          return done(null, false);
        }
        
        console.log(`👤 User found: ${user.username}, checking password...`);
        const passwordMatch = await comparePasswords(password, user.password);
        console.log(`🔑 Password match result: ${passwordMatch}`);
        
        if (!passwordMatch) {
          console.log(`❌ Password mismatch for user: ${username}`);
          return done(null, false);
        } else {
          console.log(`✅ Login successful for user: ${username}`);
          return done(null, user);
        }
      } catch (error) {
        console.error(`🚨 Login error for user ${username}:`, error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const userData = {
        ...req.body,
        password: hashedPassword,
      };
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string }) => {
      if (err) {
        console.error("Error en autenticación:", err);
        return next(err);
      }
      if (!user) {
        console.log("Login fallido - usuario no encontrado o credenciales inválidas");
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
      
      req.login(user, (err: Error | null) => {
        if (err) {
          console.error("Error en req.login:", err);
          return next(err);
        }
        
        console.log("Login exitoso para usuario:", user.username);
        const { password, ...userWithoutPassword } = user;
        
        // Asegurar que la sesión se guarde correctamente para AIPPS
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error guardando sesión:", saveErr);
            return res.status(500).json({ message: "Error guardando sesión" });
          }
          res.status(200).json(userWithoutPassword);
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err: Error | null) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // 🎯 ENDPOINT ESPECIAL PARA AIPPS WIDGET (JWT + Passport.js) - VERSIÓN SEGURA
  app.get("/api/user-session", async (req, res) => {
    console.log("🔍 AIPPS user-session request");
    
    try {
      // OPCIÓN 1: Verificar sesión Passport.js primero (PRIORITARIO)
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        console.log('✅ Autenticación via Passport.js - Usuario:', req.user.username);
        const { password, ...userWithoutPassword } = req.user;
        return res.json({
          isAuthenticated: true,
          userInfo: {
            id: userWithoutPassword.id,
            username: userWithoutPassword.username,
            name: userWithoutPassword.name,
            email: userWithoutPassword.email,
            role: userWithoutPassword.roleName,
            avatar: userWithoutPassword.avatar
          }
        });
      }

      // OPCIÓN 2: Verificar JWT token solo si NO hay sesión Passport
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
      
      if (!token) {
        console.log('❌ No token JWT y no hay sesión Passport');
        return res.status(401).json({ 
          isAuthenticated: false,
          userInfo: null 
        });
      }

      // Verificar JWT token - VERSIÓN PROMISIFICADA SEGURA
      const JWT_SECRET = process.env.JWT_SECRET;
      
      if (!JWT_SECRET) {
        console.error('❌ JWT_SECRET no configurado');
        return res.status(401).json({ 
          isAuthenticated: false,
          userInfo: null 
        });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await storage.getUser(decoded.userId);
        
        if (!user) {
          console.log('❌ Usuario no encontrado:', decoded.userId);
          return res.status(401).json({ 
            isAuthenticated: false,
            userInfo: null 
          });
        }

        console.log('✅ Autenticación JWT exitosa - Usuario:', user.username);
        
        return res.json({
          isAuthenticated: true,
          userInfo: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.roleName,
            avatar: user.avatar
          }
        });
      } catch (jwtError) {
        console.log('❌ Token JWT inválido:', jwtError);
        return res.status(401).json({ 
          isAuthenticated: false,
          userInfo: null 
        });
      }

    } catch (error) {
      console.error('❌ Error en user-session:', error);
      return res.status(500).json({ 
        isAuthenticated: false,
        userInfo: null 
      });
    }
  });

  // 🔧 ENDPOINT PARA DEBUG DE AUTENTICACIÓN - VERSIÓN SEGURA
  app.get("/api/auth-status", async (req, res) => {
    try {
      let authMethod = 'none';
      let userId = null;
      let username = null;
      
      // Verificar Passport.js PRIMERO
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        authMethod = 'passport';
        userId = req.user.id;
        username = req.user.username;
      } else {
        // Verificar JWT solo si no hay Passport
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token && process.env.JWT_SECRET) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
            const user = await storage.getUser(decoded.userId);
            if (user) {
              authMethod = 'jwt';
              userId = user.id;
              username = user.username;
            }
          } catch (err) {
            console.log('JWT verification failed:', err);
          }
        }
      }
      
      const status = {
        isAuthenticated: authMethod !== 'none',
        authMethod: authMethod,
        sessionID: req.sessionID,
        timestamp: new Date().toISOString(),
        userId: userId,
        username: username
      };
      
      console.log("🔍 AIPPS Auth Status:", status);
      res.json(status);
    } catch (error) {
      console.error('❌ Error en auth-status:', error);
      res.status(500).json({ 
        isAuthenticated: false,
        authMethod: 'error'
      });
    }
  });
  
  // Ruta para actualizar el perfil del usuario actual
  app.put("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      // Limpia cualquier HTML o atributo sospechoso del avatar URL
      if (req.body.avatar) {
        const safeUrl = req.body.avatar.replace(/<[^>]*>/g, '');
        req.body.avatar = safeUrl;
      }
      
      // No permitir cambios en campos sensibles como el rol o clubId
      delete req.body.roleId;
      delete req.body.clubId;
      
      // Eliminar contraseña si se envía en el cuerpo de la solicitud
      delete req.body.password;
      
      const updatedUser = await storage.updateUser(req.user.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
}
