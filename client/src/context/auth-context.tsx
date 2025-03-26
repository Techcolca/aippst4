import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Login function
  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
      });
      
      const userData = await response.json();
      
      // Como respaldo, guardamos el token en localStorage también (solo para depuración)
      const token = response.headers.get('Set-Cookie');
      if (token) {
        console.log("Token recibido en respuesta:", token);
        // Extraer el token de la cookie
        const match = token.match(/auth_token=([^;]+)/);
        if (match && match[1]) {
          localStorage.setItem('auth_token', match[1]);
          console.log("Token guardado en localStorage:", match[1]);
        }
      } else {
        // Si no se pudo obtener de Set-Cookie, usamos un método alternativo
        try {
          const cookieResponse = await fetch("/api/auth/me", {
            credentials: "include",
          });
          
          if (cookieResponse.ok) {
            const verifiedUserData = await cookieResponse.json();
            console.log("Verificación de autenticación exitosa:", verifiedUserData);
            
            // Solicitar el token directamente
            const tokenResponse = await fetch("/api/auth/token", {
              credentials: "include",
            });
            
            if (tokenResponse.ok) {
              const { token } = await tokenResponse.json();
              localStorage.setItem('auth_token', token);
              console.log("Token obtenido y guardado:", token);
            }
          }
        } catch (verifyError) {
          console.error("Error verificando autenticación:", verifyError);
        }
      }
      
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
