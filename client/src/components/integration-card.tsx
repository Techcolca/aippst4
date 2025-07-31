import { useLocation } from "wouter";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Eye, Calendar, Users, Trash, Edit } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

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

interface IntegrationCardProps {
  integration: Integration;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  // Formatear fecha de instalación
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Obtener etiqueta de estado
  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case "active":
        return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>{t("active", "Active")}</span>;
      case "inactive":
        return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`}>{t("inactive", "Inactive")}</span>;
      case "in_testing":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}>{t("testing", "Testing")}</span>;
      default:
        return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>{status}</span>;
    }
  };

  // Mutación para eliminar la integración
  const deleteIntegrationMutation = useMutation({
    mutationFn: () => {
      return apiRequest("DELETE", `/api/integrations/${integration.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integración eliminada",
        description: "La integración se ha eliminado correctamente",
      });
      setIsConfirmingDelete(false);
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar la integración",
        description: error.message || "Ha ocurrido un error al eliminar la integración",
        variant: "destructive",
      });
      setIsConfirmingDelete(false);
    },
  });

  // Abrir diálogo de confirmación de eliminación
  const handleDeleteClick = () => {
    setIsConfirmingDelete(true);
  };

  // Confirmar eliminación
  const confirmDelete = () => {
    deleteIntegrationMutation.mutate();
  };

  return (
    <>
      <Card className="p-5 relative overflow-hidden">
        <div className="absolute top-3 right-3">
          {getStatusBadge(integration.status)}
        </div>
        
        <h3 className="text-lg font-semibold mb-1">{integration.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 truncate">{integration.url}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <Eye className="h-4 w-4 mr-1" />
            <span>{t("visitors_helped", "Visitors helped")}: {integration.visitorCount}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{t("installed", "Installed")}: {formatDate(integration.createdAt)}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/integrations/${integration.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            {t("edit", "Edit")}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/integrations/${integration.id}/conversations`)}
          >
            {t("conversations", "Conversations")}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/integrations/${integration.id}/analytics`)}
          >
            {t("analytics", "Analytics")}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-red-500 hover:text-red-700 hover:border-red-300"
            onClick={handleDeleteClick}
          >
            <Trash className="h-4 w-4 mr-1" />
            {t("delete", "Delete")}
          </Button>
        </div>
      </Card>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm_delete_title", "Are you sure?")}</DialogTitle>
            <DialogDescription>
              {t("confirm_delete_description", `This action will permanently delete the integration "{{name}}" and cannot be undone. The widget will stop working on your website.`, { name: integration.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsConfirmingDelete(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteIntegrationMutation.isPending}
              className="gap-2"
            >
              {deleteIntegrationMutation.isPending && (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />
              )}
              {t("delete", "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}