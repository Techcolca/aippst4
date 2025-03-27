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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AutomationCard from "./automation-card";
import IntegrationCard from "./integration-card";
import { useAuth } from "@/context/auth-context";

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("automation");
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
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
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
  
  // Fetch user settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/settings"],
    enabled: !!user && activeTab === "settings",
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: any) => 
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
      
      {/* Automation Tab Panel */}
      <div data-tab-panel="automation" className={`p-6 ${activeTab !== "automation" ? "hidden" : ""}`}>
        <h2 className="text-xl font-semibold mb-4">Task Automation</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Create automated sequences to handle repetitive tasks and common user inquiries.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoadingAutomations ? (
            <p>Loading automations...</p>
          ) : (
            <>
              {automations.map((automation: any) => (
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
                      title: "View analytics",
                      description: `Viewing analytics for ${automation.name}`,
                    });
                  }}
                />
              ))}
              
              {/* Create New Automation Card */}
              <Card className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
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
      
      {/* Conversations Tab Panel */}
      <div data-tab-panel="conversations" className={`p-6 ${activeTab !== "conversations" ? "hidden" : ""}`}>
        <h2 className="text-xl font-semibold mb-4">Conversation History</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Review past conversations and analyze performance.</p>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conversation</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoadingConversations ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Cargando conversaciones...
                  </td>
                </tr>
              ) : conversations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No hay conversaciones disponibles
                  </td>
                </tr>
              ) : (
                conversations.map((conversation: any) => {
                  // Formato de fecha
                  const createdAt = conversation.createdAt 
                    ? new Date(conversation.createdAt)
                    : new Date();
                  
                  const dateFormatted = new Intl.DateTimeFormat('es', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(createdAt);
                  
                  // Generar iniciales del visitante
                  const visitorId = conversation.visitorId || 'Anónimo';
                  const initials = visitorId.substring(0, 2).toUpperCase();
                  
                  // Formatear duración
                  const formatDuration = (seconds: number) => {
                    if (!seconds) return "N/A";
                    const minutes = Math.floor(seconds / 60);
                    const remainingSeconds = seconds % 60;
                    return `${minutes}m ${remainingSeconds}s`;
                  };
                  
                  return (
                    <tr key={conversation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            {initials}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Visitante {visitorId.substring(0, 8)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {conversation.integrationName || "Integración desconocida"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                          Conversación #{conversation.id}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {conversation.url ? (
                            <a href={conversation.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {new URL(conversation.url).hostname}
                            </a>
                          ) : (
                            "URL no disponible"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {dateFormatted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDuration(conversation.duration || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {conversation.resolved ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                            Resuelta
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                            Abierta
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleViewConversation(conversation)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Integrations Tab Panel */}
      <div data-tab-panel="integrations" className={`p-6 ${activeTab !== "integrations" ? "hidden" : ""}`}>
        <h2 className="text-xl font-semibold mb-4">Website Integrations</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Manage and monitor AIPI integrations across your websites.</p>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Active Integrations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoadingIntegrations ? (
              <p>Loading integrations...</p>
            ) : (
              <>
                {integrations.map((integration: any) => (
                  <IntegrationCard
                    key={integration.id}
                    name={integration.name}
                    url={integration.url}
                    active={integration.active}
                    visitorCount={integration.visitorCount}
                    installedDate={new Date(integration.createdAt).toLocaleDateString()}
                    onEdit={() => {
                      // Redireccionar a la página de edición
                      navigate(`/integrations/${integration.id}/edit`);
                    }}
                    onViewAnalytics={() => {
                      toast({
                        title: "View analytics",
                        description: `Viewing analytics for ${integration.name}`,
                      });
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Add New Integration</h3>
          <form onSubmit={handleCreateIntegration} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Website Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Website Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={newIntegration.name}
                    onChange={handleIntegrationFormChange}
                    placeholder="e.g. Product Blog" 
                  />
                </div>
                <div>
                  <Label htmlFor="url">Website URL</Label>
                  <Input 
                    id="url" 
                    name="url" 
                    value={newIntegration.url}
                    onChange={handleIntegrationFormChange}
                    placeholder="https://blog.example.com" 
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Integration Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="themeColor">Theme Color</Label>
                  <div className="flex">
                    <input 
                      type="color" 
                      id="themeColor" 
                      name="themeColor" 
                      value={newIntegration.themeColor}
                      onChange={handleThemeColorChange}
                      className="h-10 w-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" 
                    />
                    <Input 
                      className="ml-2" 
                      value={newIntegration.themeColor}
                      onChange={handleThemeColorChange}
                      name="themeColorText"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="position">Widget Position</Label>
                  <Select 
                    value={newIntegration.position}
                    onValueChange={handlePositionChange}
                  >
                    <SelectTrigger id="position">
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">API Key</h4>
              <div className="mb-4">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex mt-1">
                  <Input 
                    id="api-key" 
                    ref={apiKeyInputRef}
                    value={apiKey} 
                    readOnly 
                    className="font-mono text-xs bg-gray-50 dark:bg-gray-900" 
                    placeholder="No API key generated yet" 
                  />
                  <Button 
                    className="ml-2" 
                    variant="outline"
                    type="button"
                    onClick={() => {
                      if (apiKey) {
                        navigator.clipboard.writeText(apiKey);
                        toast({
                          title: "Copied to clipboard",
                          description: "API Key copied to clipboard",
                        });
                      }
                    }}
                    disabled={!apiKey}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </Button>
                </div>
              </div>
            
              <div className="flex justify-end mb-4">
                <Button onClick={generateApiKey} type="button">
                  Generate API Key
                </Button>
              </div>
            </div>
              
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Installation</h4>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Add this script to your website's HTML just before the closing <code className="font-mono text-xs bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag:</p>
                <div className="relative">
                  <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto font-mono bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-700"><code>{scriptExample}</code></pre>
                  <Button 
                    className="absolute top-2 right-2 p-1 h-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                    variant="ghost"
                    type="button"
                    aria-label="Copy code"
                    onClick={() => {
                      navigator.clipboard.writeText(scriptExample);
                      toast({
                        title: "Copied to clipboard",
                        description: "Script tag copied to clipboard",
                      });
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Comportamiento del Chatbot</h4>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
                <Label htmlFor="botBehavior">Comportamiento y Personalidad</Label>
                <Textarea 
                  id="botBehavior" 
                  name="botBehavior" 
                  value={newIntegration.botBehavior}
                  onChange={handleIntegrationFormChange}
                  placeholder="Define cómo debe comportarse el chatbot. Por ejemplo: Sé amable y profesional, responde de manera precisa a las preguntas sobre el sitio web."
                  className="mt-1 text-sm bg-white dark:bg-gray-800 min-h-[100px]"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Define la personalidad y comportamiento del chatbot. Esta descripción guiará las respuestas del AI.
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Documentos de Conocimiento</h4>
              <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
                <Label htmlFor="documents">Subir Documentos</Label>
                <div className="mt-1">
                  <Input 
                    type="file" 
                    id="documents" 
                    name="documents" 
                    multiple
                    onChange={handleFileChange}
                    className="bg-white dark:bg-gray-800"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Sube documentos (PDF, DOCX, Excel, TXT) para mejorar el conocimiento del chatbot sobre tu negocio.
                </p>
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Archivos seleccionados:</p>
                    <ul className="mt-1 list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                      {selectedFiles.map((file, index) => (
                        <li key={index}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                type="submit" 
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                Crear Integración
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Settings Tab Panel */}
      <div data-tab-panel="settings" className={`p-6 ${activeTab !== "settings" ? "hidden" : ""}`}>
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
                        defaultChecked={settings?.knowledgeBase?.includes('default') || true}
                      />
                      <Label htmlFor="kb-default" className="ml-2 cursor-pointer">
                        Default (Website Content)
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="kb-product" 
                        defaultChecked={settings?.knowledgeBase?.includes('product') || false}
                      />
                      <Label htmlFor="kb-product" className="ml-2 cursor-pointer">
                        Product Documentation
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="kb-support" 
                        defaultChecked={settings?.knowledgeBase?.includes('support') || false}
                      />
                      <Label htmlFor="kb-support" className="ml-2 cursor-pointer">
                        Support Knowledge Base
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="kb-custom" 
                        defaultChecked={settings?.knowledgeBase?.includes('custom') || false}
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
      
      {/* Modal de Conversación */}
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
    </div>
  );
}
