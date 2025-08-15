import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface PromotionalMessage {
  message_text: string;
  message_type: string;
  display_order: number;
}

export function useWelcomeMessages() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { i18n } = useTranslation();

  // Cargar mensajes promocionales desde la API con idioma actual
  const { data: promotionalMessages, isLoading, error } = useQuery({
    queryKey: ['/api/marketing/promotional-messages', i18n.language],
    queryFn: async () => {
      const response = await fetch(`/api/marketing/promotional-messages?lang=${i18n.language}`);
      if (!response.ok) {
        throw new Error('Failed to fetch promotional messages');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos (reemplaza cacheTime en v5)
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Mensaje de fallback según el idioma - Mensajes más largos y atractivos
  const getFallbackMessage = (language: string) => {
    switch (language) {
      case 'fr':
        return "Transformez votre site web en une machine de génération de leads 24/7 avec l'IA conversationnelle AIPPS qui comprend, engage et convertit vos visiteurs automatiquement";
      case 'en':
        return "Transform your website into a 24/7 lead generation machine with AIPPS conversational AI that understands, engages, and converts your visitors automatically";
      default:
        return "Transforma tu sitio web en una máquina de generación de leads 24/7 con la IA conversacional de AIPPS que entiende, involucra y convierte a tus visitantes automáticamente";
    }
  };

  const fallbackMessage = getFallbackMessage(i18n.language);

  // Limpiar intervalo anterior
  const clearCurrentInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Configurar rotación cuando hay mensajes disponibles
  useEffect(() => {
    clearCurrentInterval();

    if (!promotionalMessages || promotionalMessages.length === 0 || isLoading) {
      setCurrentMessage(fallbackMessage);
      setCurrentIndex(0);
      return;
    }

    // Ordenar mensajes por display_order
    const sortedMessages = [...promotionalMessages].sort((a, b) => a.display_order - b.display_order);
    
    // Configurar mensaje inicial
    setCurrentMessage(sortedMessages[0]?.message_text || fallbackMessage);
    setCurrentIndex(0);

    // Solo rotar si hay más de un mensaje
    if (sortedMessages.length <= 1) {
      return;
    }

    // Configurar intervalo de rotación cada 10 segundos
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % sortedMessages.length;
        const nextMessage = sortedMessages[nextIndex]?.message_text || fallbackMessage;
        
        setCurrentMessage(nextMessage);
        return nextIndex;
      });
    }, 10000);

    return clearCurrentInterval;
  }, [promotionalMessages, isLoading, fallbackMessage]);

  // Actualizar mensaje cuando cambia el idioma
  useEffect(() => {
    if (!promotionalMessages || promotionalMessages.length === 0) {
      setCurrentMessage(fallbackMessage);
    } else {
      const sortedMessages = [...promotionalMessages].sort((a, b) => a.display_order - b.display_order);
      setCurrentMessage(sortedMessages[currentIndex]?.message_text || fallbackMessage);
    }
  }, [i18n.language, fallbackMessage, promotionalMessages, currentIndex]);

  // Limpiar al desmontar
  useEffect(() => {
    return clearCurrentInterval;
  }, []);

  return {
    currentMessage,
    messages: promotionalMessages,
    isLoading,
    error,
    currentIndex,
    totalMessages: promotionalMessages?.length || 0
  };
}