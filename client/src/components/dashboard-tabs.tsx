import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RefreshCw } from "lucide-react";
import { IntegrationCard } from "./integration-card";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import UpgradePlanModal from "@/components/upgrade-plan-modal";
import { Trash2, Edit3, Trash } from "lucide-react";
import { FeatureRestrictedButton } from "./feature-restricted-button";
import { FeatureGuard } from "./feature-guard";

// Definición de tipos
interface Integration {
  id: number;
  name: string;
  url: string;
  type: string;
  apiKey: string;
  userId: number;
  createdAt: string;
  status: string;
  visitorCount: number;
  description?: string;
}

interface DashboardTabsProps {
  initialTab?: string;
}

export default function DashboardTabs({ initialTab = "integrations" }: DashboardTabsProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState(initialTab);
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const upgradeModal = useUpgradeModal();

  // Sync activeTab with initialTab when it changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Update URL to preserve navigation state
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newTab);
    window.history.replaceState({}, '', url.toString());
  };

  // Consulta para obtener las integraciones
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
  });

  // Renderizar contenido de la pestaña de integraciones
  const renderIntegrationsTab = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">{t("integrations")}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("integrations_description", "Create and manage website integrations for AIPI.")}
            </p>
          </div>
          <FeatureRestrictedButton 
            feature="createIntegrations"
            onAccessGranted={() => setLocation("/create-integration")}
          >
            {t("create_integration", "Create Integration")}
          </FeatureRestrictedButton>
        </div>

        {isLoadingIntegrations ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : integrations && integrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        ) : (
          <>
            <Card className="p-6 text-center">
              <h3 className="text-lg font-medium mb-2">{t("no_integrations", "No integrations yet")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("add_new_integration_desc", "Add a new website integration to connect AIPI with your site")}
              </p>
              <FeatureRestrictedButton 
                feature="createIntegrations"
                onAccessGranted={() => setLocation("/create-integration")}
                variant="default" 
                className="w-full sm:w-auto px-8"
              >
                {t("create_integration", "Create Integration")}
              </FeatureRestrictedButton>
            </Card>
          </>
        )}
      </div>
    );
  };

  // Consulta para obtener la configuración
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Renderizar contenido de la pestaña de configuración
  const renderSettingsTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("settings")}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t("settings_description", "Configure your AIPI assistant settings.")}</p>

        {isLoadingSettings ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : settings ? (
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">{t("ai_assistant_settings")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("assistant_name")}</p>
                    <p className="text-sm text-gray-500">{settings.assistantName || t("assistant_name")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("default_greeting")}</p>
                    <p className="text-sm text-gray-500">{settings.defaultGreeting || t("default_greeting")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("conversation_style")}</p>
                    <p className="text-sm text-gray-500">{settings.conversationStyle || t("professional")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("show_availability")}</p>
                    <p className="text-sm text-gray-500">{settings.showAvailability ? t("yes") : t("no")}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">{t("appearance")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("chat_font")}</p>
                    <p className="text-sm text-gray-500">{settings.font || t("system_default")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("user_message_color")}</p>
                    <div className="flex items-center">
                      <div 
                        className="w-5 h-5 rounded-full mr-2" 
                        style={{ backgroundColor: settings.userBubbleColor || '#f3f4f6' }}
                      ></div>
                      <p className="text-sm text-gray-500">{settings.userBubbleColor || '#f3f4f6'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("assistant_message_color")}</p>
                    <div className="flex items-center">
                      <div 
                        className="w-5 h-5 rounded-full mr-2" 
                        style={{ backgroundColor: settings.assistantBubbleColor || '#e5e7eb' }}
                      ></div>
                      <p className="text-sm text-gray-500">{settings.assistantBubbleColor || '#e5e7eb'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">{t("welcome_chat")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("status")}</p>
                    <p className="text-sm text-gray-500">
                      {settings.welcomePageChatEnabled ? t("enabled") : t("disabled")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("welcome_message")}</p>
                    <p className="text-sm text-gray-500">
                      {settings.welcomePageChatGreeting || '👋 ¡Hola! Soy AIPPS, tu asistente de IA. ¿En qué puedo ayudarte hoy?'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("bubble_color")}</p>
                    <div className="flex items-center">
                      <div 
                        className="w-5 h-5 rounded-full mr-2" 
                        style={{ backgroundColor: settings.welcomePageChatBubbleColor || '#111827' }}
                      ></div>
                      <p className="text-sm text-gray-500">{settings.welcomePageChatBubbleColor || '#111827'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t("text_color")}</p>
                    <div className="flex items-center">
                      <div 
                        className="w-5 h-5 rounded-full mr-2 border border-gray-300" 
                        style={{ backgroundColor: settings.welcomePageChatTextColor || '#FFFFFF' }}
                      ></div>
                      <p className="text-sm text-gray-500">{settings.welcomePageChatTextColor || '#FFFFFF'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setLocation("/settings/edit")}>
                  {t("edit_settings")}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">{t("no_settings_found")}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t("no_settings_description")}
            </p>
            <Button variant="default" className="w-full sm:w-auto px-8" onClick={() => setLocation("/settings/edit")}>
              {t("configure_settings")}
            </Button>
          </Card>
        )}
      </div>
    );
  };

  // Consulta para obtener las conversaciones
  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["/api/conversations"],
  });

  // Función para formatear inteligentemente los nombres de visitantes
  const formatVisitorName = (conversation: any) => {
    // Prioridad 1: Nombre real del visitante
    if (conversation.visitorName && conversation.visitorName.trim() !== '') {
      return conversation.visitorName;
    }
    
    // Prioridad 2: Email como identificador (solo la parte antes del @)
    if (conversation.visitorEmail && conversation.visitorEmail.trim() !== '') {
      return conversation.visitorEmail.split('@')[0];
    }
    
    // Prioridad 3: Si es usuario autenticado, mostrar "Usuario Registrado"
    if (conversation.visitorId && conversation.visitorId.startsWith('user_')) {
      return t("registered_user", "Usuario Registrado");
    }
    
    // Prioridad 4: ID del visitante si es útil
    if (conversation.visitorId && 
        !conversation.visitorId.startsWith('test_') && 
        conversation.visitorId.length <= 20 && 
        !/[#_{}()[\]]/.test(conversation.visitorId)) {
      return `#${conversation.visitorId}`;
    }
    
    // Último recurso: Anónimo
    return t("anonymous");
  };

  // Renderizar contenido de la pestaña de conversaciones
  const renderConversationsTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("conversations")}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t("conversations_description", "Review and manage conversations with your visitors.")}</p>

        {isLoadingConversations ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conversation: any) => (
              <Card key={conversation.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{t("visitor")} {formatVisitorName(conversation)}</h3>
{conversation.visitorEmail && (
  <p className="text-sm text-gray-500">{conversation.visitorEmail}</p>
)}
                    <p className="text-sm text-gray-500">
                      {new Date(conversation.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      conversation.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    }`}>
                      {conversation.status === 'completed' ? t("completed") : t("active")}
                    </span>
                    <Link href={`/conversations/${conversation.id}`}>
                      <Button size="sm" variant="outline">{t("view")}</Button>
                    </Link>
                  </div>
                </div>
                {conversation.lastMessage && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    <span className="font-medium">{t("last_message")}: </span>
                    {conversation.lastMessage.length > 100
                      ? conversation.lastMessage.substring(0, 100) + '...'
                      : conversation.lastMessage}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">{t("no_conversations", "No conversations yet")}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t("conversations_empty_message", "When visitors interact with your chat widget, their conversations will appear here")}
            </p>
          </Card>
        )}
      </div>
    );
  };

  // Consulta para obtener los formularios con configuración de refresco automático
  const { data: forms, isLoading: isLoadingForms, refetch: refetchForms } = useQuery({
    queryKey: ["/api/forms"],
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true, // Refresca cuando la ventana recibe el foco
    // Removed refetchInterval to prevent 429 rate limiting
  });

  // Mutación para eliminar formularios
  const deleteFormMutation = useMutation({
    mutationFn: async (formId: number) => {
      await apiRequest('DELETE', `/api/forms/${formId}`);
      return {};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      toast({
        title: t("success", "Success"),
        description: t("form_deleted_successfully", "Form deleted successfully"),
      });
    },
    onError: (error: any) => {
      // Check if it's a plan limit error (403 status)
      if (error.message && error.message.includes("límite")) {
        upgradeModal.handlePlanLimitError(error.message);
      } else {
        toast({
          title: t("error", "Error"),
          description: error.message || t("error_deleting_form", "Error deleting form"),
          variant: "destructive",
        });
      }
    },
  });

  // Función para traducir descripciones de formularios
  const translateFormDescription = (form: any): string => {
    if (!form.description) return t("no_description", "No description");

    // Detectar el tipo de formulario basado en la descripción o tipo
    if (form.description.includes("liste d'attente") || form.description.includes("waiting list") || form.type === "waitlist") {
      return t("form_template_waitlist", "Model to capture users on waiting list");
    } else if (form.description.includes("Please complete") || form.description.includes("información solicitada") || form.type === "survey") {
      return t("form_template_survey", "Please complete the requested information to get started");
    } else if (form.type === "standard" || form.description.includes("standard")) {
      return t("form_template_standard", "Standard form to collect information");
    }

    // Si no se puede clasificar, devolver descripción original
    return form.description;
  };

  // Renderizar contenido de la pestaña de formularios
  const renderFormsTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("forms")}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t("forms_description", "Create and manage your forms.")}</p>

        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            onClick={() => refetchForms()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("refresh", "Refresh")}
          </Button>
          <FeatureRestrictedButton 
            feature="maxForms"
            onAccessGranted={() => setLocation("/create-form")}
          >
            {t("create_form", "Create Form")}
          </FeatureRestrictedButton>
        </div>

        {isLoadingForms ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : forms && forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forms.map((form: any) => (
              <Card key={form.id} className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{form.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {translateFormDescription(form)}
                    </p>
                  </div>
                </div>
                <div className="flex-grow"></div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {form.responseCount || 0} {t("responses", "responses")}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setLocation(`/forms/${form.id}/edit`)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    {t("edit", "Edit")}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setLocation(`/forms/${form.id}/responses`)}
                  >
                    {t("responses", "Responses")}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-500 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t("delete", "Delete")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirm_delete", "Confirm Delete")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("delete_form_confirmation", "Are you sure you want to delete this form? This action cannot be undone and will also delete all responses.")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel", "Cancel")}</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => deleteFormMutation.mutate(form.id)}
                          disabled={deleteFormMutation.isPending}
                        >
                          {deleteFormMutation.isPending ? t("deleting", "Deleting...") : t("delete", "Delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">{t("no_forms", "No forms yet")}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t("forms_empty_message", "Create a new form to collect information from your visitors")}
            </p>
            <FeatureRestrictedButton 
              feature="maxForms"
              onAccessGranted={() => setLocation("/create-form")}
              variant="default" 
              className="w-full sm:w-auto px-8"
            >
              {t("create_form", "Create Form")}
            </FeatureRestrictedButton>
          </Card>
        )}
      </div>
    );
  };

  // Consulta para obtener las automatizaciones
  const { data: automations, isLoading: isLoadingAutomations } = useQuery({
    queryKey: ["/api/automations"],
  });

  // Renderizar contenido de la pestaña de automatización
  const renderAutomationTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("task_automation")}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{t("task_automation_description", "Set up automated tasks and workflows powered by AI.")}</p>

        <div className="flex justify-end mb-4">
          <FeatureRestrictedButton 
            feature="advancedAnalytics"
            onAccessGranted={() => setLocation("/automation-analysis")}
          >
            {t("create_automation", "Create Automation")}
          </FeatureRestrictedButton>
        </div>

        {isLoadingAutomations ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : automations && automations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {automations.map((automation: any) => (
              <Card key={automation.id} className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">{automation.name}</h3>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        automation.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                          : automation.status === 'inactive'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                      }`}>
                        {automation.status === 'active' ? t("active", "Active") : 
                         automation.status === 'inactive' ? t("inactive", "Inactive") : t("testing", "Testing")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {automation.description || t("no_description", "No description")}
                    </p>
                  </div>
                </div>

                <div className="flex-grow"></div>
                <div className="flex justify-end mt-4 space-x-2">
                  <Link href={`/automations/${automation.id}/logs`}>
                    <Button size="sm" variant="outline">{t("view_logs", "View Logs")}</Button>
                  </Link>
                  <Link href={`/automations/${automation.id}/edit`}>
                    <Button size="sm">{t("edit", "Edit")}</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">{t("no_automations", "No automations yet")}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t("automations_empty_message", "Create your first automation to streamline repetitive tasks with AI")}
            </p>
            <FeatureRestrictedButton 
              feature="advancedAnalytics"
              onAccessGranted={() => setLocation("/automation-analysis")}
              variant="default" 
              className="w-full sm:w-auto px-8"
            >
              {t("create_automation", "Create Automation")}
            </FeatureRestrictedButton>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="integrations" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="automation">{t("task_automation")}</TabsTrigger>
          <TabsTrigger value="conversations">{t("conversations")}</TabsTrigger>
          <TabsTrigger value="integrations">{t("integrations")}</TabsTrigger>
          <TabsTrigger value="forms">{t("forms")}</TabsTrigger>
          <TabsTrigger value="settings">{t("settings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="automation">{renderAutomationTab()}</TabsContent>
        <TabsContent value="conversations">{renderConversationsTab()}</TabsContent>
        <TabsContent value="integrations">{renderIntegrationsTab()}</TabsContent>
        <TabsContent value="forms">{renderFormsTab()}</TabsContent>
        <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
      </Tabs>

      <UpgradePlanModal
        isOpen={upgradeModal.isOpen}
        onClose={upgradeModal.hideUpgradeModal}
        limitType={upgradeModal.limitType}
        currentLimit={upgradeModal.currentLimit}
        planName={upgradeModal.planName}
      />
    </div>
  );
}
