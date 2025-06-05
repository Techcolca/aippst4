import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface WelcomeMessage {
  message_text: string;
  message_type: string;
  order_index: number;
}

export function useWelcomeMessages() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const { i18n } = useTranslation();

  // Cargar mensajes desde la API con el idioma actual
  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['/api/welcome-messages', i18n.language],
    queryFn: () => 
      fetch(`/api/welcome-messages?lang=${i18n.language}`)
        .then(res => res.json()),
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
    retry: 2
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

  // Configurar rotación cuando hay mensajes disponibles
  useEffect(() => {
    if (!messages || messages.length === 0) {
      setCurrentMessage(fallbackMessage);
      return;
    }

    // Configurar mensaje inicial
    setCurrentMessage(messages[0]?.message_text || fallbackMessage);
    setCurrentIndex(0);

    // Solo rotar si hay más de un mensaje
    if (messages.length <= 1) {
      return;
    }

    // Configurar intervalo de rotación cada 7 segundos
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % messages.length;
        setCurrentMessage(messages[nextIndex]?.message_text || fallbackMessage);
        return nextIndex;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [messages, fallbackMessage]);

  // Actualizar mensaje cuando cambia el idioma
  useEffect(() => {
    if (messages && messages.length > 0) {
      setCurrentMessage(messages[currentIndex]?.message_text || fallbackMessage);
    } else {
      setCurrentMessage(fallbackMessage);
    }
  }, [i18n.language, fallbackMessage, messages, currentIndex]);

  return {
    currentMessage,
    messages,
    isLoading,
    error,
    currentIndex,
    totalMessages: messages?.length || 0
  };
}