import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'integrations' | 'forms' | 'conversations' | 'general';
  currentLimit?: number;
  planName?: string;
}

export default function UpgradePlanModal({
  isOpen,
  onClose,
  limitType,
  currentLimit,
  planName = "Básico"
}: UpgradePlanModalProps) {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  const getLimitMessage = () => {
    switch (limitType) {
      case 'integrations':
        return {
          title: t('upgrade.integrations.title', 'Actualiza tu plan'),
          message: t('upgrade.integrations.message', `Has alcanzado el límite de ${currentLimit} ${currentLimit === 1 ? 'integración' : 'integraciones'} de tu plan ${planName}.`),
          description: t('upgrade.integrations.description', 'Actualiza a un plan superior para crear más chatbots y formularios para tus sitios web.')
        };
      case 'forms':
        return {
          title: t('upgrade.forms.title', 'Actualiza tu plan'),
          message: t('upgrade.forms.message', `Has alcanzado el límite de ${currentLimit} ${currentLimit === 1 ? 'formulario' : 'formularios'} de tu plan ${planName}.`),
          description: t('upgrade.forms.description', 'Actualiza a un plan superior para crear más formularios inteligentes y capturar más leads.')
        };
      case 'conversations':
        return {
          title: t('upgrade.conversations.title', 'Actualiza tu plan'),
          message: t('upgrade.conversations.message', `Has alcanzado el límite mensual de ${currentLimit} conversaciones de tu plan ${planName}.`),
          description: t('upgrade.conversations.description', 'Actualiza a un plan superior para tener conversaciones ilimitadas con tus clientes.')
        };
      default:
        return {
          title: t('upgrade.general.title', 'Actualiza tu plan'),
          message: t('upgrade.general.message', `Has alcanzado los límites de tu plan ${planName}.`),
          description: t('upgrade.general.description', 'Actualiza a un plan superior para acceder a más funcionalidades y recursos.')
        };
    }
  };

  const { title, message, description } = getLimitMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="text-xl font-semibold">
                {title}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {t('upgrade.benefits.title', 'Beneficios de actualizar:')}
              </span>
            </div>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>• {t('upgrade.benefits.unlimited', 'Más integraciones y formularios')}</li>
              <li>• {t('upgrade.benefits.analytics', 'Analytics avanzados y reportes')}</li>
              <li>• {t('upgrade.benefits.support', 'Soporte prioritario')}</li>
              <li>• {t('upgrade.benefits.customization', 'Personalización completa')}</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {t('upgrade.button.primary', 'Ver planes')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              {t('upgrade.button.secondary', 'Más tarde')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}