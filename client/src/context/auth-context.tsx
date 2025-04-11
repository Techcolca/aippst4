import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshAuth: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Verificar si el token ha expirado
  const isTokenExpired = (token: string): boolean => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const { exp } = JSON.parse(jsonPayload);
      const expired = Date.now() >= exp * 1000;
      
      if (expired) {
        console.log("Token expirado. Fecha de expiración:", new Date(exp * 1000));
      }
      
      return expired;
    } catch (error) {
      console.error("Error verificando expiración del token:", error);
      return true; // En caso de error, asumir que el token es inválido
    }
  };
  
  // Función para verificar y actualizar el estado de autenticación
  const refreshAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log("Verificando estado de autenticación...");
      
      // Verificar si hay un token en localStorage
      const authToken = localStorage.getItem('auth_token');
      
      if (!authToken) {
        console.log("No hay token almacenado.");
        setUser(null);
        return false;
      }
      
      // Verificar si el token ha expirado
      if (isTokenExpired(authToken)) {
        console.log("El token ha expirado. Cerrando sesión...");
        // Limpiar token expirado
        localStorage.removeItem('auth_token');
        setUser(null);
        
        // Mostrar mensaje amigable
        toast({
          title: "Sesión expirada",
          description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          variant: "default"
        });
        
        return false;
      }
      
      // Si el token es válido, intentar obtener datos del usuario
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${authToken}`
      };
      
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
        headers: headers
      });
      
      console.log("Estado de la respuesta:", response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log("Usuario autenticado encontrado:", userData);
        setUser(userData);
        return true;
      } else {
        console.log("Sesión inválida o expirada.");
        
        // Si el error es de autenticación, limpiar el token
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          toast({
            title: "Sesión finalizada",
            description: "Tu sesión ha finalizado. Por favor, inicia sesión nuevamente.",
            variant: "default"
          });
        }
        
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    refreshAuth();
    
    // Configurar verificación periódica de la sesión (cada 5 minutos)
    const interval = setInterval(() => {
      console.log("Verificando estado de sesión...");
      refreshAuth();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
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
        
        // Mostrar mensaje de bienvenida
        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido, ${userData.username}`,
        });
      } else {
        console.warn("No se recibió token en la respuesta de login");
        setUser(userData);
      }
    } catch (error) {
      console.error("Login error:", error);
      // Mostrar mensaje de error
      toast({
        title: "Error de inicio de sesión",
        description: "Credenciales incorrectas o servidor no disponible",
        variant: "destructive"
      });
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
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      
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
    refreshAuth,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
