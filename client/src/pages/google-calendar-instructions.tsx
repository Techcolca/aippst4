import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function GoogleCalendarInstructions() {
  const [copied, setCopied] = useState(false);
  const redirectUrl = "https://workspace.techcolca.repl.co/api/auth/google-calendar/callback";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(redirectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Instrucciones para configurar Google Calendar</h1>
      
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de redirección</AlertTitle>
        <AlertDescription>
          Se ha detectado un error de coincidencia en la URL de redirección (redirect_uri_mismatch).
          Siga las instrucciones a continuación para resolverlo.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Configuración de la consola de Google Cloud</CardTitle>
          <CardDescription>
            Para permitir la conexión con Google Calendar, debe agregar la siguiente URL a las URLs de redirección autorizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-md flex justify-between items-center">
            <code className="text-sm font-mono break-all">{redirectUrl}</code>
            <Button 
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="ml-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <h3 className="font-semibold text-lg mt-4">Pasos a seguir:</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Vaya a la <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary underline">Consola de Google Cloud - Credenciales</a></li>
            <li>Seleccione su proyecto</li>
            <li>Busque la sección "IDs de cliente OAuth 2.0" y haga clic en el ID de cliente que está utilizando</li>
            <li>En "URI de redirección autorizados" agregue la URL mostrada arriba</li>
            <li>Guarde los cambios haciendo clic en "Guardar"</li>
            <li>Espere unos minutos para que la configuración se propague</li>
            <li>Regrese a la aplicación e intente conectar Google Calendar nuevamente</li>
          </ol>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Información adicional</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            El error "redirect_uri_mismatch" ocurre porque Google Cloud requiere que todas las URLs de redirección
            estén explícitamente autorizadas por motivos de seguridad. La URL que está intentando usar no coincide
            con ninguna de las URLs configuradas en su consola de Google Cloud.
          </p>
          <p className="mt-4">
            Una vez que agregue la URL a la lista de redirecciones autorizadas, la autenticación debería
            funcionar correctamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}