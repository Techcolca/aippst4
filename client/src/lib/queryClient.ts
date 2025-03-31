import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Configurar los headers básicos
  const headers: Record<string, string> = data 
    ? { "Content-Type": "application/json" } 
    : {};
  
  // Añadir token de autenticación si existe en localStorage
  const authToken = localStorage.getItem('auth_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const res = await fetch(url, {
    method,
    headers: headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Mantener cookies como respaldo
  });

  await throwIfResNotOk(res);
  
  // Si es una respuesta de login, extraer y guardar el token
  if (url.includes('/auth/login') && res.ok) {
    const setCookieHeader = res.headers.get('Set-Cookie');
    if (setCookieHeader) {
      const tokenMatch = setCookieHeader.match(/auth_token=([^;]+)/);
      if (tokenMatch && tokenMatch[1]) {
        localStorage.setItem('auth_token', tokenMatch[1]);
        console.log("Token guardado en localStorage desde apiRequest");
      }
    }
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log("Ejecutando consulta para:", queryKey[0]);
    // Obtener el token del localStorage como respaldo
    const authToken = localStorage.getItem('auth_token');
    
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: headers,
    });
    
    console.log("Respuesta:", res.status, res.statusText);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
