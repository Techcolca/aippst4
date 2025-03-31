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
        setIsLoading(true);
        
        console.log("Verificando estado de autenticación...");
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        
        console.log("Estado de la respuesta:", response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log("Usuario autenticado encontrado:", userData);
          setUser(userData);
        } else {
          console.log("No hay sesión activa.");
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Login function
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include", // importante para cookies
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }
      
      const userData = await response.json();
      console.log("Usuario autenticado:", userData);
      
      // Revalidar la sesión para confirmar que las cookies están funcionando
      try {
        const meResponse = await fetch("/api/auth/me", {
          credentials: "include"
        });
        
        if (meResponse.ok) {
          const verifiedUser = await meResponse.json();
          console.log("Verificación de autenticación exitosa:", verifiedUser);
          // Usar los datos verificados
          setUser(verifiedUser);
        } else {
          console.warn("Error en verificación, usando datos directos del login");
          setUser(userData);
        }
      } catch (verifyError) {
        console.error("Error verificando autenticación:", verifyError);
        // Fallback a usar los datos del login directo
        setUser(userData);
      }
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
