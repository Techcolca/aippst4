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
          title: t('upgrade.integrations.title', 'No puedes crear más integraciones'),
          message: t('upgrade.integrations.message', `Tu plan ${planName} permite un máximo de ${currentLimit} ${currentLimit === 1 ? 'integración' : 'integraciones'} y ya has alcanzado este límite.`),
          description: t('upgrade.integrations.description', 'Para crear más chatbots inteligentes para tus sitios web, necesitas actualizar a un plan superior con más integraciones incluidas.')
        };
      case 'forms':
        return {
          title: t('upgrade.forms.title', 'No puedes crear más formularios'),
          message: t('upgrade.forms.message', `Tu plan ${planName} permite un máximo de ${currentLimit} ${currentLimit === 1 ? 'formulario' : 'formularios'} y ya has alcanzado este límite.`),
          description: t('upgrade.forms.description', 'Para crear más formularios inteligentes y capturar más leads, necesitas actualizar a un plan superior que incluya más formularios.')
        };
      case 'conversations':
        return {
          title: t('upgrade.conversations.title', 'Has alcanzado tu límite de conversaciones'),
          message: t('upgrade.conversations.message', `Tu plan ${planName} permite ${currentLimit} conversaciones por mes y ya has utilizado todas.`),
          description: t('upgrade.conversations.description', 'Para continuar teniendo conversaciones con tus clientes este mes, necesitas actualizar a un plan con más conversaciones incluidas.')
        };
      default:
        return {
          title: t('upgrade.general.title', 'Has alcanzado el límite de tu plan'),
          message: t('upgrade.general.message', `Tu plan ${planName} no permite usar esta funcionalidad o has alcanzado su límite máximo.`),
          description: t('upgrade.general.description', 'Para continuar usando esta funcionalidad, necesitas actualizar a un plan superior con más recursos incluidos.')
        };
    }
  };

  const { title, message, description } = getLimitMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              {title}
            </DialogTitle>
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