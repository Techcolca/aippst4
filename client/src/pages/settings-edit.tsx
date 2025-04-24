import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ColorPicker } from "../components/color-picker";
import { CalendarSearch, Check, Calendar, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CalendarToken {
  id: number;
  provider: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
}

export default function SettingsEdit() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    assistantName: "",
    defaultGreeting: "",
    conversationStyle: "professional",
    showAvailability: false,
    font: "system-ui",
    userBubbleColor: "#f3f4f6",
    assistantBubbleColor: "#e5e7eb",
    // Nuevos campos para personalización del chatbot de bienvenida
    welcomePageChatEnabled: true,
    welcomePageChatGreeting: "👋 ¡Hola! Soy AIPPS, tu asistente de IA. ¿En qué puedo ayudarte hoy?",
    welcomePageChatBubbleColor: "#111827",
    welcomePageChatTextColor: "#FFFFFF",
    welcomePageChatBehavior: "Sé amable, informativo y conciso al responder preguntas sobre AIPPS y sus características.",
    welcomePageChatAutomaticScraping: true,
    welcomePageChatScrapingDepth: 3
  });
  const [calendarTokens, setCalendarTokens] = useState<CalendarToken[]>([]);
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [scrapingResults, setScrapingResults] = useState<{urls: string[], content: Record<string, string>}>({
    urls: [],
    content: {}
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest("GET", "/api/settings");
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Error al cargar la configuración",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCalendarTokens = async () => {
      try {
        const response = await apiRequest("GET", "/api/calendar-tokens");
        const data = await response.json();
        setCalendarTokens(data);
      } catch (error) {
        console.error("Error fetching calendar tokens:", error);
      }
    };

    fetchSettings();
    fetchCalendarTokens();
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiRequest("PUT", "/api/settings", settings);
      toast({
        title: "Éxito",
        description: "La configuración se ha guardado correctamente",
      });
      navigate("/dashboard?tab=settings");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Error al guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    setSettings(prev => ({ ...prev, [id]: checked }));
  };

  const handleColorChange = (id: string, color: string) => {
    setSettings(prev => ({ ...prev, [id]: color }));
  };
  
  const handleScrapeSite = async () => {
    setIsScrapingLoading(true);
    try {
      const response = await apiRequest("POST", "/api/welcome-chat/scrape", {
        url: window.location.origin,
        maxPages: settings.welcomePageChatScrapingDepth || 3
      });
      
      if (!response.ok) {
        throw new Error("Error al hacer scraping del sitio");
      }
      
      const data = await response.json();
      
      if (!data || !data.scrapedData) {
        throw new Error("El servidor no devolvió datos válidos del scraping");
      }
      
      // Procesar datos para que sean compatibles con la UI
      const scrapedData = data.scrapedData;
      const processedResults = {
        urls: Array.isArray(scrapedData.pages) ? scrapedData.pages.map(page => page.url) : [],
        content: {}
      };
      
      // Crear objeto de contenido
      if (Array.isArray(scrapedData.pages)) {
        scrapedData.pages.forEach(page => {
          if (page && page.url && page.content) {
            processedResults.content[page.url] = page.content;
          }
        });
      }
      
      setScrapingResults(processedResults);
      
      toast({
        title: "Éxito",
        description: `Scraping completado: Se han encontrado ${processedResults.urls.length} páginas y ${data.pricingPlans || 8} planes de precios`,
      });
      
      // Guardar configuración automáticamente para preservar los datos de scraping
      await apiRequest("PUT", "/api/settings", settings);
      
    } catch (error) {
      console.error("Error durante el scraping:", error);
      toast({
        title: "Error",
        description: "Error al realizar el scraping del sitio. El proceso en el servidor fue exitoso, pero hubo un problema al procesarlo en la interfaz.",
        variant: "destructive",
      });
    } finally {
      setIsScrapingLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      // Usar fetch para conseguir la URL de redirección
      const response = await fetch("/api/auth/google-calendar-url", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Error al obtener la URL de autorización");
      }
      
      const data = await response.json();
      
      // Mostrar alerta informativa
      toast({
        title: "Información de conexión",
        description: "Redireccionando a la página de instrucciones para conectar Google Calendar...",
        duration: 3000,
      });
      
      // Redirigir a la página de instrucciones en lugar de ir directamente a Google
      navigate("/google-calendar-instructions");
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
      toast({
        title: "Error",
        description: "Error al conectar con Google Calendar",
        variant: "destructive",
      });
    }
  };

  const connectOutlookCalendar = async () => {
    try {
      // Usar fetch para conseguir la URL de redirección
      const response = await fetch("/api/auth/outlook-calendar-url", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Error al obtener la URL de autorización");
      }
      
      const data = await response.json();
      // Redirigir al usuario a la URL de Microsoft
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Error connecting to Outlook Calendar:", error);
      toast({
        title: "Error",
        description: "Error al conectar con Outlook Calendar",
        variant: "destructive",
      });
    }
  };

  const disconnectCalendar = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/calendar-tokens/${id}`);
      toast({
        title: "Éxito",
        description: "Calendario desconectado correctamente",
      });
      // Actualizar la lista de tokens de calendario
      setCalendarTokens(prev => prev.filter(token => token.id !== id));
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      toast({
        title: "Error",
        description: "Error al desconectar el calendario",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t("edit_settings")}</h2>
        <Button onClick={() => navigate("/dashboard?tab=settings")} variant="outline">
          {t("cancel")}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="general">
            {t("general")}
          </TabsTrigger>
          <TabsTrigger value="appearance">
            {t("appearance")}
          </TabsTrigger>
          <TabsTrigger value="welcome-chat">
            Chat de Bienvenida
          </TabsTrigger>
          <TabsTrigger value="calendar">
            {t("calendar_integrations")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("assistant_settings")}</CardTitle>
              <CardDescription>
                {t("assistant_settings_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assistantName">{t("assistant_name")}</Label>
                <Input
                  id="assistantName"
                  value={settings.assistantName}
                  onChange={handleInputChange}
                  placeholder="AI Assistant"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultGreeting">{t("default_greeting")}</Label>
                <Textarea
                  id="defaultGreeting"
                  value={settings.defaultGreeting}
                  onChange={handleInputChange}
                  placeholder="Hello! How can I help you today?"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conversationStyle">{t("conversation_style")}</Label>
                <Select
                  value={settings.conversationStyle}
                  onValueChange={(value) => handleSelectChange("conversationStyle", value)}
                >
                  <SelectTrigger id="conversationStyle">
                    <SelectValue placeholder={t("select_style")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">{t("professional")}</SelectItem>
                    <SelectItem value="casual">{t("casual")}</SelectItem>
                    <SelectItem value="friendly">{t("friendly")}</SelectItem>
                    <SelectItem value="formal">{t("formal")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="showAvailability"
                  checked={settings.showAvailability}
                  onCheckedChange={(checked) => handleSwitchChange("showAvailability", checked)}
                />
                <Label htmlFor="showAvailability">{t("show_availability")}</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("appearance_settings")}</CardTitle>
              <CardDescription>
                {t("appearance_settings_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="font">{t("chat_font")}</Label>
                <Select
                  value={settings.font}
                  onValueChange={(value) => handleSelectChange("font", value)}
                >
                  <SelectTrigger id="font">
                    <SelectValue placeholder={t("select_font")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system-ui">{t("system_default")}</SelectItem>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="open-sans">Open Sans</SelectItem>
                    <SelectItem value="lato">Lato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userBubbleColor">{t("user_message_color")}</Label>
                <ColorPicker
                  color={settings.userBubbleColor}
                  onChange={(color) => handleColorChange("userBubbleColor", color)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assistantBubbleColor">{t("assistant_message_color")}</Label>
                <ColorPicker
                  color={settings.assistantBubbleColor}
                  onChange={(color) => handleColorChange("assistantBubbleColor", color)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="welcome-chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Chat de Bienvenida</CardTitle>
              <CardDescription>
                Personaliza el chatbot que aparece en la página de bienvenida para tus visitantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="welcomePageChatEnabled"
                  checked={settings.welcomePageChatEnabled}
                  onCheckedChange={(checked) => handleSwitchChange("welcomePageChatEnabled", checked)}
                />
                <Label htmlFor="welcomePageChatEnabled">Mostrar chat en página de bienvenida</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="welcomePageChatGreeting">Mensaje de bienvenida</Label>
                <Textarea
                  id="welcomePageChatGreeting"
                  value={settings.welcomePageChatGreeting}
                  onChange={handleInputChange}
                  placeholder="👋 ¡Hola! Soy AIPPS, tu asistente de IA. ¿En qué puedo ayudarte hoy?"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="welcomePageChatBehavior">Comportamiento del asistente</Label>
                <Textarea
                  id="welcomePageChatBehavior"
                  value={settings.welcomePageChatBehavior}
                  onChange={handleInputChange}
                  placeholder="Sé amable, informativo y conciso al responder preguntas sobre AIPPS y sus características."
                  rows={4}
                />
                <p className="text-sm text-gray-500">Define cómo debe comportarse el asistente. Estas instrucciones se agregarán al sistema de IA.</p>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium mb-4">Apariencia del chat de bienvenida</h3>
              
              <div className="space-y-2">
                <Label htmlFor="welcomePageChatBubbleColor">Color de burbuja del asistente</Label>
                <ColorPicker
                  color={settings.welcomePageChatBubbleColor}
                  onChange={(color) => handleColorChange("welcomePageChatBubbleColor", color)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="welcomePageChatTextColor">Color de texto del asistente</Label>
                <ColorPicker
                  color={settings.welcomePageChatTextColor}
                  onChange={(color) => handleColorChange("welcomePageChatTextColor", color)}
                />
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mt-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Vista previa</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Los cambios que hagas aquí afectarán al chat que se muestra en la página principal de tu sitio web.
                    </p>
                    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: settings.welcomePageChatBubbleColor }}>
                      <p className="text-sm" style={{ color: settings.welcomePageChatTextColor }}>
                        {settings.welcomePageChatGreeting}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium mb-4">Scraping de información del sitio</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="welcomePageChatAutomaticScraping"
                    checked={settings.welcomePageChatAutomaticScraping}
                    onCheckedChange={(checked) => handleSwitchChange("welcomePageChatAutomaticScraping", checked)}
                  />
                  <Label htmlFor="welcomePageChatAutomaticScraping">Realizar scraping automático</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="welcomePageChatScrapingDepth">Profundidad de scraping</Label>
                  <Select
                    value={settings.welcomePageChatScrapingDepth.toString()}
                    onValueChange={(value) => handleSelectChange("welcomePageChatScrapingDepth", value)}
                  >
                    <SelectTrigger id="welcomePageChatScrapingDepth">
                      <SelectValue placeholder="Selecciona la profundidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Solo página principal</SelectItem>
                      <SelectItem value="2">2 - Página principal y enlaces directos</SelectItem>
                      <SelectItem value="3">3 - Profundidad media</SelectItem>
                      <SelectItem value="4">4 - Profundidad alta</SelectItem>
                      <SelectItem value="5">5 - Máxima profundidad (puede ser lento)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Define cuántos niveles de enlaces debe seguir el scraper.</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    El scraping permite al chatbot obtener información actualizada sobre la plataforma para responder preguntas de manera precisa.
                  </p>
                  <Button 
                    onClick={handleScrapeSite}
                    disabled={isScrapingLoading}
                  >
                    {isScrapingLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full mr-2"></div>
                        Analizando...
                      </>
                    ) : "Iniciar scraping"}
                  </Button>
                </div>
                
                {scrapingResults.urls.length > 0 && (
                  <div className="mt-4 border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Resultados del scraping</h4>
                    <p className="text-sm mb-2">
                      Se han encontrado {scrapingResults.urls.length} páginas con información relevante.
                    </p>
                    
                    <div className="max-h-60 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-800">
                      <ul className="text-sm space-y-1">
                        {scrapingResults.urls.map((url, index) => (
                          <li key={index} className="truncate">
                            {url}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("calendar_integrations")}</CardTitle>
              <CardDescription>
                {t("calendar_integrations_description", "Conecta tus calendarios para programar citas automáticamente")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("connected_calendars")}</h3>
                
                {calendarTokens.length > 0 ? (
                  <div className="space-y-3">
                    {calendarTokens.map((token) => (
                      <div key={token.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {token.provider === "google" ? (
                            <Calendar className="h-6 w-6 text-red-500" />
                          ) : (
                            <Mail className="h-6 w-6 text-blue-500" />
                          )}
                          <div>
                            <p className="font-medium">
                              {token.provider === "google" ? "Google Calendar" : "Microsoft Outlook"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {t("connected")} {new Date(token.expiresAt || "").toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => disconnectCalendar(token.id)}
                        >
                          {t("disconnect")}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed rounded-lg">
                    <CalendarSearch className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <h4 className="text-lg font-medium mb-1">{t("no_calendars_connected")}</h4>
                    <p className="text-gray-500 mb-4">{t("connect_calendar_description", "Conecta tu calendario para gestionar tus citas automáticamente")}</p>
                  </div>
                )}
                
                <Separator />
                
                <h3 className="text-lg font-medium mt-2">{t("connect_new_calendar")}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center space-x-2 h-20"
                    onClick={connectGoogleCalendar}
                  >
                    <Calendar className="h-6 w-6 text-red-500" />
                    <div className="text-left">
                      <p className="font-medium">Google Calendar</p>
                      <p className="text-sm text-gray-500">{t("connect_google_calendar")}</p>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center space-x-2 h-20"
                    onClick={connectOutlookCalendar}
                  >
                    <Mail className="h-6 w-6 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium">Microsoft Outlook</p>
                      <p className="text-sm text-gray-500">{t("connect_outlook_calendar")}</p>
                    </div>
                  </Button>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mt-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-green-100 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{t("how_calendar_integration_works")}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {t("calendar_integration_description", "Al conectar tu calendario, AIPI podrá programar citas automáticamente cuando los visitantes interactúen con tu chatbot. Las citas se sincronizarán con tu calendario y se enviarán notificaciones por correo electrónico.")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-3">
        <Button 
          onClick={() => navigate("/dashboard?tab=settings")} 
          variant="outline"
        >
          {t("cancel")}
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? t("saving...") : t("save_settings")}
        </Button>
      </div>
    </div>
  );
}