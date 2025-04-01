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
        
        // Preparar headers con el token de autorización si existe
        const headers: Record<string, string> = {};
        const authToken = localStorage.getItem('auth_token');
        if (authToken) {
          console.log("Token encontrado en localStorage, usando para autenticación");
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store", // Evitar caché
          headers: headers
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
      console.log("Intentando iniciar sesión para el usuario:", username);
      
      // Usar apiRequest para el login
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
      });
      
      // Obtener los datos del usuario y el token
      const userData = await response.json();
      console.log("Usuario autenticado:", userData);
      
      // Guardar el token en localStorage si viene en la respuesta
      if (userData.token) {
        localStorage.setItem('auth_token', userData.token);
        console.log("Token guardado en localStorage:", userData.token.substring(0, 20) + "...");
        
        // Eliminar el token del objeto de usuario para no guardarlo en el estado
        const { token, ...userWithoutToken } = userData;
        setUser(userWithoutToken);
      } else {
        console.warn("No se recibió token en la respuesta de login");
        setUser(userData);
      }
      
      // Ya no es necesario verificar la sesión, ya que la respuesta incluye los datos del usuario
      
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      // Eliminar el token del localStorage
      localStorage.removeItem('auth_token');
      setUser(null);
      // Redirigir al dashboard/login - usando window.location para la navegación
      window.location.href = '/';
    } catch (error) {
      // Eliminar el token del localStorage incluso si hay error
      localStorage.removeItem('auth_token');
      console.error("Logout error:", error);
      setUser(null);
      // Redirigir al dashboard/login incluso en caso de error
      window.location.href = '/';
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
