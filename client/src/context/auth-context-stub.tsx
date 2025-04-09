import React, { createContext, useContext, useState } from 'react';

// Definimos la interfaz para el tipo de usuario
interface User {
  id: number;
  username: string;
  email?: string;
}

// Definimos la interfaz para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  signin: (username: string, password: string) => Promise<boolean>;
  signout: () => void;
  isLoading: boolean;
  error: string | null;
}

// Creamos el contexto con un valor por defecto
const AuthContext = createContext<AuthContextType>({
  user: null,
  signin: async () => false,
  signout: () => {},
  isLoading: false,
  error: null
});

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({ id: 1, username: 'admin' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para iniciar sesión
  const signin = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulamos una operación de autenticación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (username === 'admin' && password === 'password') {
        setUser({ id: 1, username: 'admin' });
        return true;
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const signout = () => {
    setUser(null);
  };

  const value = {
    user,
    signin,
    signout,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}