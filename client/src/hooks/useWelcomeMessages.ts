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

  // Cargar mensajes promocionales desde la API - SIEMPRE cargar
  const { data: promotionalMessages, isLoading, error } = useQuery({
    queryKey: ['/api/marketing/promotional-messages'],
    queryFn: async () => {
      const response = await fetch('/api/marketing/promotional-messages');
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

  // Mensaje de fallback según el idioma
  const getFallbackMessage = (language: string) => {
    switch (language) {
      case 'fr':
        return "Bienvenue dans AIPPS - La plateforme conversationnelle alimentée par l'IA pour une communication intelligente sur votre site web";
      case 'en':
        return "Welcome to AIPPS - The AI-powered conversational platform for intelligent communication on your website";
      default:
        return "Bienvenido a AIPPS - La plataforma conversacional con IA para una comunicación inteligente en tu sitio web";
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

    // Configurar intervalo de rotación cada 7 segundos
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % sortedMessages.length;
        const nextMessage = sortedMessages[nextIndex]?.message_text || fallbackMessage;
        
        setCurrentMessage(nextMessage);
        return nextIndex;
      });
    }, 7000);

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