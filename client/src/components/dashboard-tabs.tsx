import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationCard } from "./integration-card";
import { Link } from "wouter";

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

export default function DashboardTabs() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("integrations");
  
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
            <h2 className="text-xl font-semibold">Website Integrations</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage website integrations for AIPI.
            </p>
          </div>
          <Button onClick={() => navigate("/create-integration")}>
            Create Integration
          </Button>
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
              <h3 className="text-lg font-medium mb-2">No integrations yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add a new website integration to connect AIPI with your site
              </p>
              <Button variant="default" className="w-full sm:w-auto px-8" onClick={() => navigate("/create-integration")}>
                Create Integration
              </Button>
            </Card>
          </>
        )}
      </div>
    );
  };

  // Renderizar contenido de la pestaña de configuración
  const renderSettingsTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Configure your AIPI assistant settings.</p>
        
        {/* Contenido de configuración simplificado para este arreglo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p>Settings content placeholder - Coming soon</p>
        </div>
      </div>
    );
  };

  // Renderizar contenido de la pestaña de conversaciones
  const renderConversationsTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Conversations</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Review and manage conversations with your visitors.</p>
        
        {/* Placeholder para conversaciones */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p>Conversations content placeholder - Coming soon</p>
        </div>
      </div>
    );
  };

  // Renderizar contenido de la pestaña de formularios
  const renderFormsTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Forms</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Create and manage your forms.</p>
        
        <div className="flex justify-end mb-4">
          <Button onClick={() => navigate("/create-form")}>Create Form</Button>
        </div>
        
        {/* Placeholder para formularios */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p>Forms content placeholder - Coming soon</p>
        </div>
      </div>
    );
  };

  // Renderizar contenido de la pestaña de automatización
  const renderAutomationTab = () => {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Task Automation</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Automate tasks with AI.</p>
        
        {/* Placeholder para automatización */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p>Automation content placeholder - Coming soon</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="integrations" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="automation">Task Automation</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="automation">{renderAutomationTab()}</TabsContent>
        <TabsContent value="conversations">{renderConversationsTab()}</TabsContent>
        <TabsContent value="integrations">{renderIntegrationsTab()}</TabsContent>
        <TabsContent value="forms">{renderFormsTab()}</TabsContent>
        <TabsContent value="settings">{renderSettingsTab()}</TabsContent>
      </Tabs>
    </div>
  );
}