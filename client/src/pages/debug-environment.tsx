import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DebugEnvironment() {
  const [isLoading, setIsLoading] = useState(true);
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [googleAuth, setGoogleAuth] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const fetchEnvInfo = async () => {
      try {
        const response = await apiRequest("GET", "/api/debug/environment");
        const data = await response.json();
        setEnvInfo(data);
      } catch (error) {
        console.error("Error fetching environment info:", error);
        setErrorMessage("Error obteniendo información del entorno. Asegúrate de estar autenticado.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnvInfo();
  }, []);

  const getGoogleCalendarUrl = async () => {
    try {
      const response = await apiRequest("GET", "/api/auth/google-calendar-url");
      const data = await response.json();
      setGoogleAuth(data.authUrl);
    } catch (error) {
      console.error("Error fetching Google Calendar URL:", error);
      setErrorMessage("Error obteniendo URL de Google Calendar. Asegúrate de estar autenticado.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Información del Entorno de Desarrollo</h1>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Información del Servidor</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-gray-100 rounded-md overflow-x-auto dark:bg-gray-800">
            {envInfo ? JSON.stringify(envInfo, null, 2) : "No hay información disponible"}
          </pre>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Pruebas de Autenticación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-auth">URL de Autenticación de Google Calendar</Label>
            <div className="flex space-x-2">
              <Input 
                id="google-auth" 
                value={googleAuth} 
                readOnly 
                className="flex-1"
              />
              <Button onClick={getGoogleCalendarUrl}>Obtener URL</Button>
            </div>
          </div>
          
          {googleAuth && (
            <div className="space-y-2">
              <Label>Probar Conexión</Label>
              <Button 
                onClick={() => window.open(googleAuth, "_blank")}
                className="w-full"
              >
                Abrir URL de Google Auth en Nueva Pestaña
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}