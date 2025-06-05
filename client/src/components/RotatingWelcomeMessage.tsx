import { useWelcomeMessages } from '@/hooks/useWelcomeMessages';
import { useTranslation } from 'react-i18next';

interface RotatingWelcomeMessageProps {
  className?: string;
}

export function RotatingWelcomeMessage({ className = "" }: RotatingWelcomeMessageProps) {
  const { t } = useTranslation();
  const { currentMessage, isLoading, error } = useWelcomeMessages();

  // Si hay error o está cargando, usar el mensaje de traducción original
  if (isLoading || error) {
    return (
      <p className={className}>
        {t("tagline")}
      </p>
    );
  }

  return (
    <p className={className}>
      {currentMessage}
    </p>
  );
}