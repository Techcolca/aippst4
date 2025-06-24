import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface UpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  currentPlan: string;
  requiredPlan: string;
  requiredPlanName: string;
  upgradeMessage: string;
}

const PLAN_ICONS = {
  basic: Crown,
  startup: Sparkles,
  professional: Zap,
  enterprise: Crown
};

const PLAN_COLORS = {
  basic: "bg-blue-500",
  startup: "bg-purple-500", 
  professional: "bg-green-500",
  enterprise: "bg-orange-500"
};

const PLAN_FEATURES = {
  basic: [
    "500 conversaciones/mes",
    "1 formulario personalizable",
    "Widget tipo burbuja únicamente",
    "1 sitio web",
    "Soporte por email"
  ],
  startup: [
    "2,000 conversaciones/mes",
    "5 formularios personalizables",
    "Widget + modo pantalla completa",
    "Hasta 3 sitios web",
    "Soporte prioritario por email y chat",
    "Análisis avanzados"
  ],
  professional: [
    "10,000 conversaciones/mes",
    "Formularios ilimitados",
    "Sitios web ilimitados",
    "Automatizaciones básicas",
    "Integración con CRM",
    "API de acceso",
    "Gestión de equipos (5 usuarios)",
    "Soporte telefónico"
  ],
  enterprise: [
    "Conversaciones ilimitadas",
    "Todo incluido",
    "Automatizaciones con IA",
    "Soporte 24/7 dedicado",
    "Gerente de cuenta",
    "SLA garantizado",
    "API completa"
  ]
};

export function UpgradePopup({
  isOpen,
  onClose,
  feature,
  currentPlan,
  requiredPlan,
  requiredPlanName,
  upgradeMessage
}: UpgradePopupProps) {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const PlanIcon = PLAN_ICONS[requiredPlan as keyof typeof PLAN_ICONS] || Crown;
  const planColor = PLAN_COLORS[requiredPlan as keyof typeof PLAN_COLORS] || "bg-blue-500";
  const features = PLAN_FEATURES[requiredPlan as keyof typeof PLAN_FEATURES] || [];

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Redirigir a la página de pricing con el plan específico
      navigate(`/pricing?plan=${requiredPlan}`);
      onClose();
    } catch (error) {
      console.error('Error navigating to pricing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full ${planColor} text-white`}>
              <PlanIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Actualiza tu plan</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Para acceder a esta funcionalidad
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mensaje de la funcionalidad */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium text-foreground">
              {upgradeMessage}
            </p>
          </div>

          {/* Información del plan requerido */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Plan {requiredPlanName}</h3>
              <Badge variant="secondary" className={planColor + " text-white"}>
                Requerido
              </Badge>
            </div>

            {/* Lista de características del plan */}
            <div className="space-y-2">
              {features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
              {features.length > 4 && (
                <div className="text-sm text-muted-foreground ml-6">
                  + {features.length - 4} características más
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className={`flex-1 ${planColor} hover:opacity-90`}
            >
              {isLoading ? "Cargando..." : "Ver planes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook para usar el popup de upgrade
export function useUpgradePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState<Omit<UpgradePopupProps, 'isOpen' | 'onClose'> | null>(null);

  const showUpgradePopup = (data: Omit<UpgradePopupProps, 'isOpen' | 'onClose'>) => {
    setPopupData(data);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
    setPopupData(null);
  };

  const UpgradePopupComponent = popupData ? (
    <UpgradePopup
      isOpen={isOpen}
      onClose={closePopup}
      {...popupData}
    />
  ) : null;

  return {
    showUpgradePopup,
    UpgradePopupComponent
  };
}