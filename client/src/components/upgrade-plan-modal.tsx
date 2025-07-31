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

  // Determinar el plan actual y los beneficios del próximo plan
  const getPlanInfo = () => {
    const currentPlanType = planName?.toLowerCase().includes('profesional') ? 'professional' :
                           planName?.toLowerCase().includes('startup') ? 'startup' :
                           planName?.toLowerCase().includes('empresarial') ? 'enterprise' : 'basic';
    
    // Beneficios específicos según el plan actual
    const getNextPlanBenefits = () => {
      switch (currentPlanType) {
        case 'basic':
          return [
            t('upgrade.benefits.startup.conversations', '2,000 conversations/month'),
            t('upgrade.benefits.startup.forms', '5 customizable forms'),
            t('upgrade.benefits.startup.widgets', 'Bubble + fullscreen widgets'),
            t('upgrade.benefits.startup.sites', 'Up to 3 websites'),
            t('upgrade.benefits.startup.analytics', 'Advanced analytics')
          ];
        case 'startup':
          return [
            t('upgrade.benefits.professional.conversations', '10,000 conversations/month'),
            t('upgrade.benefits.professional.forms', 'Unlimited forms'),
            t('upgrade.benefits.professional.sites', 'Unlimited websites'),
            t('upgrade.benefits.professional.automation', 'Basic automations'),
            t('upgrade.benefits.professional.crm', 'CRM integration')
          ];
        case 'professional':
          return [
            t('upgrade.benefits.enterprise.conversations', 'Unlimited conversations'),
            t('upgrade.benefits.enterprise.all', 'Everything included'),
            t('upgrade.benefits.enterprise.ai', 'AI automations'),
            t('upgrade.benefits.enterprise.support', '24/7 dedicated support'),
            t('upgrade.benefits.enterprise.manager', 'Account manager')
          ];
        default:
          return [
            t('upgrade.benefits.general.integrations', 'More integrations and forms'),
            t('upgrade.benefits.general.analytics', 'Advanced analytics and reports'),
            t('upgrade.benefits.general.support', 'Priority support'),
            t('upgrade.benefits.general.customization', 'Complete customization')
          ];
      }
    };

    return { currentPlanType, benefits: getNextPlanBenefits() };
  };

  const getLimitMessage = () => {
    switch (limitType) {
      case 'integrations':
        return {
          message: t('upgrade.integrations.message', { planName }),
          description: t('upgrade.integrations.description')
        };
      case 'forms':
        return {
          message: t('upgrade.forms.message', { planName }),
          description: t('upgrade.forms.description')
        };
      case 'conversations':
        return {
          message: t('upgrade.conversations.message', { planName }),
          description: t('upgrade.conversations.description')
        };
      default:
        return {
          message: t('upgrade.general.message', { planName }),
          description: t('upgrade.general.description')
        };
    }
  };

  const { message, description } = getLimitMessage();
  const { benefits } = getPlanInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              {t('upgrade.modal.title', 'You have reached your plan limit')}
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
              {benefits.map((benefit, index) => (
                <li key={index}>• {benefit}</li>
              ))}
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