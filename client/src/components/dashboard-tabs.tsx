import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import AutomationCard from "./automation-card";
import IntegrationCard from "./integration-card";
import ProfileSection from "./profile-section";
import { useAuth } from "@/context/auth-context";
import { Copy as CopyIcon, Info as InfoIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DashboardTabs({ initialTab = "automation" }) {
  // Transform initialTab if it's "profile" to "settings"
  const normalizedInitialTab = initialTab === "profile" ? "settings" : initialTab;
  const [activeTab, setActiveTab] = useState(normalizedInitialTab);
  
  // Update active tab if initialTab prop changes
  useEffect(() => {
    // Always update the active tab when initialTab changes
    if (initialTab === "profile") {
      // For profile, we show settings tab but with profile content
      setActiveTab("settings");
    } else {
      // For any other tab, show that tab directly
      setActiveTab(initialTab);
    }
    
    // Log for debugging
    console.log(`initialTab changed to: ${initialTab}, setting activeTab to: ${initialTab === "profile" ? "settings" : initialTab}`);
  }, [initialTab]);
  
  const [apiKey, setApiKey] = useState("");
  const [, navigate] = useLocation();
  const [scriptExample, setScriptExample] = useState('<script src="https://api.aipi.example.com/widget.js?key=YOUR_API_KEY"></script>');
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    url: "",
    themeColor: "#3B82F6",
    position: "bottom-right",
    apiKey: "",
    botBehavior: "Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web."
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Estados para el modal de conversación
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false)
  
  // Estados para el modal de creación de automatización
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false)
  // Definimos la interfaz para el tipo de configuración de automatización
  interface AutomationConfig {
    automationType?: string;
    triggers?: any[];
    actions?: any[];
    assistantName?: string;
    defaultGreeting?: string;
    showAvailability?: boolean;
    userBubbleColor?: string;
    assistantBubbleColor?: string;
    font?: string;
    conversationStyle?: string;
    knowledgeBase?: {
      documents?: string[];
      websites?: string[];
      sources?: string[];
      customData?: string;
    };
    enableLearning?: boolean;
  }

  const [newAutomation, setNewAutomation] = useState({
    name: "",
    description: "",
    status: "inactive" as "active" | "inactive" | "in_testing",
    config: {
      automationType: "message_response",
      triggers: [],
      actions: [],
      assistantName: "",
      defaultGreeting: "",
      showAvailability: false,
      userBubbleColor: "#E2F5FC",
      assistantBubbleColor: "#F5F7F9",
      font: "Inter",
      conversationStyle: "chat",
      knowledgeBase: {
        documents: [],
        websites: [],
        sources: [],
        customData: ""
      },
      enableLearning: false
    } as AutomationConfig
  });
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const apiKeyInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch automations
  const { data: automations = [], isLoading: isLoadingAutomations } = useQuery({
    queryKey: ["/api/automations"],
    enabled: !!user && activeTab === "automation",
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Fetch integrations
  const { data: integrations = [], isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ["/api/integrations"],
    enabled: !!user && activeTab === "integrations",
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Fetch conversations
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: !!user && activeTab === "conversations",
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Define settings interface
  interface AppSettings {
    assistantName?: string;
    defaultGreeting?: string;
    showAvailability?: boolean;
    userBubbleColor?: string;
    assistantBubbleColor?: string;
    font?: string;
    conversationStyle?: string;
    knowledgeBase?: {
      documents?: string[];
      websites?: string[];
      sources?: string[];
      customData?: string;
    };
    enableLearning?: boolean;
  }

  // Fetch user settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery<AppSettings>({
    queryKey: ["/api/settings"],
    enabled: !!user && activeTab === "settings",
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Fetch forms
  const { data: forms = [], isLoading: isLoadingForms } = useQuery({
    queryKey: ["/api/forms"],
    enabled: !!user && activeTab === "forms",
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Estado para el modal de creación de formulario
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    title: "",
    slug: "",
    description: "",
    type: "contact",
    published: true
  });
  
  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: AppSettings) => 
      apiRequest("PATCH", "/api/settings", newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const createIntegrationMutation = useMutation({
    mutationFn: (integration: any) => 
      apiRequest("POST", "/api/integrations", integration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integración creada",
        description: "La integración ha sido creada exitosamente",
      });
      
      // Reiniciar el formulario
      setApiKey("");
      setScriptExample('<script src="https://api.aipi.example.com/widget.js?key=YOUR_API_KEY"></script>');
      setNewIntegration({
        name: "",
        url: "",
        themeColor: "#3B82F6",
        position: "bottom-right",
        apiKey: "",
        botBehavior: "Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web."
      });
      setSelectedFiles([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la integración. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    },
  });
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Update URL query parameters to reflect the current tab
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("tab", tab);
    
    // Update the URL without reloading the page
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings) return;
    
    updateSettingsMutation.mutate(settings);
  };
  
  // Manejadores de cambios para los campos del formulario
  const handleIntegrationFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewIntegration(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setSelectedFiles(fileList);
    }
  };
  
  const handleThemeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewIntegration(prev => ({
      ...prev,
      themeColor: value
    }));
  };
  
  const handlePositionChange = (value: string) => {
    setNewIntegration(prev => ({
      ...prev,
      position: value
    }));
  };
  
  // Función para crear una nueva integración
  const handleCreateIntegration = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que haya un API key generado
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Debes generar una API Key primero",
        variant: "destructive",
      });
      return;
    }
    
    // Validar que se hayan ingresado los campos requeridos
    if (!newIntegration.name || !newIntegration.url) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }
    
    // Logs para depuración
    console.log("Creando integración con los siguientes datos:", {
      name: newIntegration.name,
      url: newIntegration.url,
      themeColor: newIntegration.themeColor,
      position: newIntegration.position,
      apiKey: apiKey
    });
    
    // Preparar los datos de la integración
    const formData = new FormData();
    formData.append('name', newIntegration.name);
    formData.append('url', newIntegration.url);
    formData.append('themeColor', newIntegration.themeColor);
    formData.append('position', newIntegration.position);
    formData.append('apiKey', apiKey);
    formData.append('botBehavior', newIntegration.botBehavior);
    
    // Añadir archivos si fueron seleccionados
    selectedFiles.forEach(file => {
      formData.append('documents', file);
    });
    
    // Enviar formData con archivos
    // Como estamos usando FormData, debemos usar fetch directamente en lugar de la mutación
    // Mostramos un estado de carga
    toast({
      title: "Creando integración",
      description: "Espere mientras se crea la integración...",
    });
    
    fetch('/api/integrations', {
      method: 'POST',
      body: formData,
      // No establecemos Content-Type para que el navegador lo haga automáticamente con el boundary correcto
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al crear la integración');
      }
      return response.json();
    })
    .then(data => {
      // Éxito: invalidar caché y mostrar mensaje
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      
      toast({
        title: "Integración creada",
        description: "La integración ha sido creada exitosamente",
      });
      
      // Reiniciar el formulario
      setApiKey("");
      setScriptExample('<script src="https://api.aipi.example.com/widget.js?key=YOUR_API_KEY"></script>');
      setNewIntegration({
        name: "",
        url: "",
        themeColor: "#3B82F6",
        position: "bottom-right",
        apiKey: "",
        botBehavior: "Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web."
      });
      setSelectedFiles([]);
      
      // Redirigir a la página de edición de la nueva integración
      const newIntegrationId = data.id;
      if (newIntegrationId) {
        navigate(`/integrations/${newIntegrationId}/edit`);
      }
    })
    .catch(error => {
      console.error('Error en la creación de integración:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la integración. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    });
  };
  
  // Función para generar una API Key aleatoria
  const generateApiKey = () => {
    // Generamos una cadena alfanumérica aleatoria de 32 caracteres
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 32;
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Establecemos la API Key generada
    const newApiKey = `aipi_${result}`;
    setApiKey(newApiKey);
    
    // Actualizamos el script de ejemplo con la API Key
    setScriptExample(`<script src="https://api.aipi.example.com/widget.js?key=${newApiKey}"></script>`);
    
    // Notificamos al usuario
    toast({
      title: "API Key generada",
      description: "Se ha generado una nueva API Key",
    });
    
    // Seleccionamos el contenido del input para facilitar la copia
    setTimeout(() => {
      if (apiKeyInputRef.current) {
        apiKeyInputRef.current.select();
      }
    }, 100);
  };
  
  // Función para cargar los mensajes de una conversación
  const handleViewConversation = async (conversation: any) => {
    setSelectedConversation(conversation);
    setIsConversationModalOpen(true);
    setIsLoadingMessages(true);
    
    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`);
      if (!response.ok) {
        throw new Error('Error al cargar los mensajes');
      }
      
      const messagesData = await response.json();
      setConversationMessages(messagesData);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes de la conversación",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };
  
  // Render automations tab content
  const renderAutomationsTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Task Automation</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Create automated sequences to handle repetitive tasks and common user inquiries.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoadingAutomations ? (
            <p>Loading automations...</p>
          ) : (
            <>
              {Array.isArray(automations) && automations.map((automation: any) => (
                <AutomationCard
                  key={automation.id}
                  name={automation.name}
                  description={automation.description}
                  status={automation.status}
                  lastModified={new Date(automation.lastModified).toLocaleDateString()}
                  processedCount={automation.processedCount}
                  onEdit={() => {
                    toast({
                      title: "Edit automation",
                      description: `Editing ${automation.name}`,
                    });
                  }}
                  onViewAnalytics={() => {
                    toast({
                      title: "Redirecting to analytics",
                      description: `Viewing analytics for all automations and integrations`,
                    });
                    navigate('/analytics');
                  }}
                />
              ))}
              
              {/* Create New Automation Card */}
              <Card 
                className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => setIsAutomationModalOpen(true)}
              >
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                  <h3 className="font-medium">Create New Automation</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Set up a new task automation workflow</p>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    );
  };
  
  // Render conversations tab content
  const renderConversationsTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Conversations</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">View and manage conversations with your website visitors.</p>
        
        {isLoadingConversations ? (
          <p>Loading conversations...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow-sm rounded-md">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visitor</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Integration</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.isArray(conversations) && conversations.map((conv: any) => (
                  <tr key={conv.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{conv.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {conv.visitorId ? conv.visitorId.substring(0, 8) + '...' : 'Anonymous'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{conv.integrationName || 'Unknown'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        conv.resolved 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {conv.resolved ? 'Resolved' : 'Open'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewConversation(conv)}>
                        View Messages
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {Array.isArray(conversations) && conversations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 px-6 text-center text-gray-500 dark:text-gray-400">
                      No conversations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };
  
  // Render integrations tab content
  const renderIntegrationsTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Website Integrations</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Create and manage website integrations for AIPI.</p>
        
        {/* Existing Integrations */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Your Integrations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoadingIntegrations ? (
              <p>Loading integrations...</p>
            ) : (
              <>
                {Array.isArray(integrations) && integrations.map((integration: any) => (
                  <IntegrationCard
                    key={integration.id}
                    name={integration.name}
                    url={integration.url}
                    active={integration.active || false}
                    visitorCount={integration.visitorCount || 0}
                    installedDate={new Date(integration.createdAt).toLocaleDateString()}
                    onEdit={() => navigate(`/integrations/${integration.id}/edit`)}
                    onViewAnalytics={() => navigate('/analytics')}
                    onViewConversations={() => {
                      // Change tab to conversations and filter by integration
                      handleTabChange('conversations');
                    }}
                  />
                ))}
                
                {/* New Integration Card */}
                <Card className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="font-medium text-lg mb-4">Create New Integration</h3>
                  
                  <form onSubmit={handleCreateIntegration} className="space-y-6">
                    <div>
                      <Label htmlFor="integration-name">Integration Name</Label>
                      <Input 
                        id="integration-name" 
                        name="name" 
                        value={newIntegration.name}
                        onChange={handleIntegrationFormChange}
                        placeholder="My Website" 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="website-url">Website URL</Label>
                      <Input 
                        id="website-url" 
                        name="url" 
                        value={newIntegration.url}
                        onChange={handleIntegrationFormChange}
                        placeholder="https://example.com" 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="api-key">API Key</Label>
                      <div className="flex">
                        <Input 
                          id="api-key" 
                          name="apiKey" 
                          value={apiKey}
                          readOnly
                          placeholder="Generate API Key" 
                          ref={apiKeyInputRef}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          onClick={generateApiKey}
                          className="ml-2"
                        >
                          Generate
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="theme-color">Theme Color</Label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="color" 
                          id="theme-color" 
                          name="themeColor" 
                          value={newIntegration.themeColor}
                          onChange={handleThemeColorChange}
                          className="h-10 w-10 border border-gray-300 dark:border-gray-600 rounded shadow-sm"
                        />
                        <Input 
                          value={newIntegration.themeColor}
                          onChange={handleThemeColorChange}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="position">Widget Position</Label>
                      <Select value={newIntegration.position} onValueChange={handlePositionChange}>
                        <SelectTrigger id="position">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="bot-behavior">Assistant's Behavior</Label>
                      <Textarea 
                        id="bot-behavior" 
                        name="botBehavior" 
                        value={newIntegration.botBehavior}
                        onChange={handleIntegrationFormChange}
                        rows={3}
                        placeholder="Describe how AIPI should behave and respond to users" 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="documents">Upload Documents (Optional)</Label>
                      <Input 
                        id="documents" 
                        type="file" 
                        onChange={handleFileChange}
                        multiple
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Upload PDF, DOCX, or TXT files to help AIPI answer questions about your content (max 5MB per file)
                      </p>
                      
                      {selectedFiles.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium">Selected files:</h4>
                          <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                            {selectedFiles.map((file, index) => (
                              <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label className="block mb-2">Installation Code</Label>
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 font-mono text-sm text-gray-800 dark:text-gray-200 mb-2 overflow-x-auto">
                        {scriptExample}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        This code will be generated after creating the integration
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Create Integration
                    </Button>
                  </form>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Render settings tab content
  // Render forms tab content
  const renderFormsTab = () => {
    const { t } = useTranslation();
    
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("forms")}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t("forms_description")}</p>
        
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-lg font-medium">{t("your_forms")}</h3>
          <Button onClick={() => navigate('/create-form')} className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            {t("create_form")}
          </Button>
        </div>
        
        {isLoadingForms ? (
          <div className="py-10 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Cargando formularios...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {Array.isArray(forms) && forms.length > 0 ? (
              forms.map((form: any) => (
                <Card key={form.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6 flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{form.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Tipo: {form.type || 'Contacto'} • 
                            Respuestas: {form.responseCount || 0} • 
                            Creado: {new Date(form.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          form.published 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {form.published ? 'Publicado' : 'Borrador'}
                        </div>
                      </div>
                      {form.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{form.description}</p>
                      )}
                    </div>
                    <div className="p-4 md:p-6 flex flex-row md:flex-col gap-2 bg-gray-50 dark:bg-gray-800 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700">
                      <a 
                        href={`/forms/${form.id}/edit`}
                        className="flex-1 md:w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/forms/${form.id}/edit`);
                        }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          type="button"
                        >
                          Editar
                        </Button>
                      </a>
                      <a 
                        href={`/forms/${form.id}/responses`}
                        className="flex-1 md:w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/forms/${form.id}/responses`);
                        }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          type="button"
                        >
                          Ver Respuestas
                        </Button>
                      </a>
                      <a 
                        href="#"
                        className="flex-1 md:w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          // Copiar código de inserción al portapapeles
                          const embedCode = `<script src="https://api.aipi.example.com/form.js?id=${form.slug}"></script>`;
                          try {
                            navigator.clipboard.writeText(embedCode);
                            toast({
                              title: "Código copiado",
                              description: "El código de inserción ha sido copiado al portapapeles",
                            });
                          } catch (err) {
                            console.error("Error al copiar:", err);
                            toast({
                              title: "Error al copiar",
                              description: "No se pudo copiar el código. Inténtalo de nuevo.",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          type="button"
                        >
                          Obtener Código
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No hay formularios</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Crea tu primer formulario para empezar a capturar leads
                </p>
                <Button onClick={() => navigate('/create-form')}>
                  Crear Formulario
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Modal para crear nuevo formulario */}
        <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Formulario</DialogTitle>
              <DialogDescription>
                Crea un formulario personalizado para capturar leads o datos de visitantes
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              
              if (!newForm.title || !newForm.slug) {
                toast({
                  title: "Campos requeridos",
                  description: "Por favor completa todos los campos requeridos",
                  variant: "destructive",
                });
                return;
              }
              
              // Crear nuevo formulario
              fetch('/api/forms', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(newForm),
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Error al crear el formulario');
                }
                return response.json();
              })
              .then(data => {
                queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
                setIsFormModalOpen(false);
                
                // Restablecer formulario
                setNewForm({
                  title: "",
                  slug: "",
                  description: "",
                  type: "contact",
                  published: true
                });
                
                toast({
                  title: "Formulario creado",
                  description: `${data.title} ha sido creado exitosamente`,
                });
                
                // Redirigir al editor de formulario
                navigate(`/forms/${data.id}/edit`);
              })
              .catch(error => {
                console.error('Error al crear formulario:', error);
                toast({
                  title: "Error",
                  description: "No se pudo crear el formulario. Por favor, intenta de nuevo.",
                  variant: "destructive",
                });
              });
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Título
                  </Label>
                  <Input
                    id="title"
                    value={newForm.title}
                    onChange={(e) => setNewForm({...newForm, title: e.target.value})}
                    className="col-span-3"
                    placeholder="Ej: Formulario de Contacto"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="slug" className="text-right">
                    Identificador
                  </Label>
                  <Input
                    id="slug"
                    value={newForm.slug}
                    onChange={(e) => setNewForm({...newForm, slug: e.target.value.replace(/\s+/g, '-').toLowerCase()})}
                    className="col-span-3"
                    placeholder="identificador-unico"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    value={newForm.description}
                    onChange={(e) => setNewForm({...newForm, description: e.target.value})}
                    className="col-span-3"
                    placeholder="Descripción opcional del formulario"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Tipo
                  </Label>
                  <Select
                    value={newForm.type}
                    onValueChange={(value) => setNewForm({...newForm, type: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contact">Contacto</SelectItem>
                      <SelectItem value="lead">Captura de Leads</SelectItem>
                      <SelectItem value="survey">Encuesta</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="registration">Registro</SelectItem>
                      <SelectItem value="waitlist">Lista de Espera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="published" className="text-right">
                    Estado
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      id="published"
                      checked={newForm.published}
                      onCheckedChange={(checked) => setNewForm({...newForm, published: checked})}
                    />
                    <Label htmlFor="published" className="cursor-pointer">
                      {newForm.published ? 'Publicado' : 'Borrador'}
                    </Label>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Crear Formulario
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  
  const renderSettingsTab = () => {
    console.log("Rendering settings tab with initialTab:", initialTab);
    
    if (initialTab === "profile") {
      return (
        <div>
          <h2 className="text-xl font-semibold mb-4">User Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Manage your personal information and account details.</p>
          
          {isLoadingSettings ? (
            <p>Loading profile information...</p>
          ) : (
            <ProfileSection />
          )}
        </div>
      );
    }
    
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">AIPI Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Configure your AIPI assistant to match your preferences and requirements.</p>
        
        {isLoadingSettings ? (
          <p>Loading settings...</p>
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">General Settings</h3>
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-md p-4 space-y-4">
                <div>
                  <Label htmlFor="assistant-name">Assistant Name</Label>
                  <Input 
                    id="assistant-name" 
                    name="assistant-name" 
                    defaultValue={settings?.assistantName || "AIPI Assistant"} 
                  />
                </div>
            
                <div>
                  <Label htmlFor="default-greeting">Default Greeting Message</Label>
                  <Textarea 
                    id="default-greeting" 
                    name="default-greeting" 
                    rows={2} 
                    defaultValue={settings?.defaultGreeting || "👋 Hi there! I'm AIPI, your AI assistant. How can I help you today?"}
                  />
                </div>
                
                <div className="flex items-center">
                  <Switch 
                    id="availability-toggle" 
                    defaultChecked={settings?.showAvailability} 
                  />
                  <Label htmlFor="availability-toggle" className="ml-2">
                    Show availability status to users
                  </Label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Customization</h3>
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-md p-4 space-y-4">
                <div>
                  <Label className="block text-sm font-medium mb-1">Widget Avatar</Label>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                    </div>
                    <div className="ml-4 flex">
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                      <Button variant="outline" size="sm" className="ml-2">
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="block mb-1">Chat Bubble Color</Label>
                  <div className="flex items-center">
                    <input 
                      type="color" 
                      id="user-bubble-color" 
                      name="user-bubble-color" 
                      defaultValue={settings?.userBubbleColor || "#3B82F6"} 
                      className="h-8 w-8 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span className="mx-2 text-sm text-gray-500 dark:text-gray-400">User</span>
                    <input 
                      type="color" 
                      id="assistant-bubble-color" 
                      name="assistant-bubble-color" 
                      defaultValue={settings?.assistantBubbleColor || "#E5E7EB"} 
                      className="h-8 w-8 border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Assistant</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="font">Font</Label>
                  <Select defaultValue={settings?.font || "inter"}>
                    <SelectTrigger id="font">
                      <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter (Default)</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="opensans">Open Sans</SelectItem>
                      <SelectItem value="lato">Lato</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">AI Behavior Settings</h3>
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-md p-4 space-y-4">
                <div>
                  <Label htmlFor="response-style">Conversation Style</Label>
                  <Select defaultValue={settings?.conversationStyle || "professional"}>
                    <SelectTrigger id="response-style">
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="mb-2 block">Knowledge Base</Label>
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                    <div className="flex items-center">
                      <Checkbox 
                        id="kb-default" 
                        defaultChecked={settings?.knowledgeBase?.sources?.includes('default') || true}
                      />
                      <Label htmlFor="kb-default" className="ml-2 cursor-pointer">
                        Default (Website Content)
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="kb-product" 
                        defaultChecked={settings?.knowledgeBase?.sources?.includes('product') || false}
                      />
                      <Label htmlFor="kb-product" className="ml-2 cursor-pointer">
                        Product Documentation
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="kb-support" 
                        defaultChecked={settings?.knowledgeBase?.sources?.includes('support') || false}
                      />
                      <Label htmlFor="kb-support" className="ml-2 cursor-pointer">
                        Support Knowledge Base
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="kb-custom" 
                        defaultChecked={settings?.knowledgeBase?.sources?.includes('custom') || false}
                      />
                      <Label htmlFor="kb-custom" className="ml-2 cursor-pointer">
                        Custom Data Source
                      </Label>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button variant="outline" size="sm">
                        Manage Sources
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Switch 
                    id="learning-toggle" 
                    defaultChecked={settings?.enableLearning !== false} 
                  />
                  <Label htmlFor="learning-toggle" className="ml-2">
                    Enable continuous learning from conversations
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={updateSettingsMutation.isPending}>
                {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
      <div className="px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex -mb-px overflow-x-auto">
          <button 
            data-tab="automation" 
            onClick={() => handleTabChange("automation")}
            className={`py-4 px-6 font-medium rounded-t-lg ${
              activeTab === "automation"
                ? "bg-primary-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Task Automation
          </button>
          <button 
            data-tab="conversations" 
            onClick={() => handleTabChange("conversations")}
            className={`py-4 px-6 font-medium rounded-t-lg ${
              activeTab === "conversations"
                ? "bg-primary-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Conversations
          </button>
          <button 
            data-tab="integrations" 
            onClick={() => handleTabChange("integrations")}
            className={`py-4 px-6 font-medium rounded-t-lg ${
              activeTab === "integrations"
                ? "bg-primary-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Website Integrations
          </button>
          <button 
            data-tab="forms" 
            onClick={() => handleTabChange("forms")}
            className={`py-4 px-6 font-medium rounded-t-lg ${
              activeTab === "forms"
                ? "bg-primary-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Formularios
          </button>
          <button 
            data-tab="settings" 
            onClick={() => handleTabChange("settings")}
            className={`py-4 px-6 font-medium rounded-t-lg ${
              activeTab === "settings"
                ? "bg-primary-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Settings
          </button>
        </div>
      </div>
      
      {/* Tab Panels */}
      <div className="p-6">
        {activeTab === "automation" && renderAutomationsTab()}
        {activeTab === "conversations" && renderConversationsTab()}
        {activeTab === "integrations" && renderIntegrationsTab()}
        {activeTab === "forms" && renderFormsTab()}
        {activeTab === "settings" && renderSettingsTab()}
      </div>
      
      {/* Conversation Modal */}
      <Dialog open={isConversationModalOpen} onOpenChange={setIsConversationModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Conversación con {selectedConversation?.visitorId?.substring(0, 8) || 'Visitante'}
            </DialogTitle>
            <DialogDescription>
              {selectedConversation ? (
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {new Date(selectedConversation.createdAt).toLocaleString('es')} - 
                    {selectedConversation.integrationName}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedConversation.resolved 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {selectedConversation.resolved ? 'Resuelta' : 'Abierta'}
                  </span>
                </div>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {isLoadingMessages ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
              </div>
            ) : conversationMessages.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No hay mensajes en esta conversación
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
                {conversationMessages.map((message: any) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary-100 dark:bg-primary-900 ml-12' 
                          : 'bg-gray-100 dark:bg-gray-800 mr-12'
                      }`}
                    >
                      <div className="text-sm mb-1 font-medium">
                        {message.role === 'user' ? 'Usuario' : 'AIPI Assistant'}
                      </div>
                      <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                        {message.content}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                        {new Date(message.createdAt || message.timestamp).toLocaleTimeString('es', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de creación de automatización */}
      <Dialog open={isAutomationModalOpen} onOpenChange={setIsAutomationModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Automation</DialogTitle>
            <DialogDescription>
              Create an automated task sequence to handle repetitive inquiries and actions.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            
            if (!newAutomation.name || !newAutomation.description) {
              toast({
                title: "Missing fields",
                description: "Please fill all required fields",
                variant: "destructive",
              });
              return;
            }
            
            // Create new automation
            fetch('/api/automations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: newAutomation.name,
                description: newAutomation.description,
                status: newAutomation.status,
                config: {
                  automationType: "message_response",
                  triggers: [],
                  actions: []
                }
              }),
            })
            .then(response => {
              if (!response.ok) {
                throw new Error('Failed to create automation');
              }
              return response.json();
            })
            .then(data => {
              queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
              setIsAutomationModalOpen(false);
              
              // Reset form
              setNewAutomation({
                name: "",
                description: "",
                status: "inactive" as "active" | "inactive" | "in_testing",
                config: {
                  automationType: "message_response",
                  triggers: [],
                  actions: [],
                  assistantName: "",
                  defaultGreeting: "",
                  showAvailability: false,
                  userBubbleColor: "#E2F5FC",
                  assistantBubbleColor: "#F5F7F9",
                  font: "Inter",
                  conversationStyle: "chat",
                  knowledgeBase: {
                    documents: [],
                    websites: [],
                    sources: [],
                    customData: ""
                  },
                  enableLearning: false
                }
              });
              
              toast({
                title: "Automation created",
                description: `${data.name} has been created successfully`,
              });
            })
            .catch(error => {
              console.error('Error creating automation:', error);
              toast({
                title: "Error",
                description: "Failed to create automation. Please try again.",
                variant: "destructive",
              });
            });
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="automation-name">Name</Label>
                <Input 
                  id="automation-name"
                  placeholder="Enter automation name"
                  value={newAutomation.name}
                  onChange={(e) => setNewAutomation({...newAutomation, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="automation-description">Description</Label>
                <Textarea 
                  id="automation-description"
                  placeholder="Describe what this automation does"
                  rows={3}
                  value={newAutomation.description}
                  onChange={(e) => setNewAutomation({...newAutomation, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="automation-status">Status</Label>
                <Select 
                  value={newAutomation.status} 
                  onValueChange={(value: "active" | "inactive" | "in_testing") => 
                    setNewAutomation({...newAutomation, status: value})
                  }
                >
                  <SelectTrigger id="automation-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="in_testing">In Testing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <InfoIcon className="inline-block w-4 h-4 mr-1" />
                  After creating the automation, you'll be able to define specific triggers, 
                  conditions, and actions in the automation editor.
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAutomationModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Automation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}