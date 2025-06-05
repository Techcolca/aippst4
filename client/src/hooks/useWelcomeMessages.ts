import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface WelcomeMessage {
  message_text: string;
  message_type: string;
  order_index: number;
}

export function useWelcomeMessages() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<string>('');

  // Cargar mensajes desde la API
  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['/api/welcome-messages'],
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 10, // 10 minutos
    retry: 2
  });

  // Mensaje de fallback si no hay mensajes o hay error
  const fallbackMessage = "Bienvenue dans AIPPS - La plateforme conversationnelle alimentée par l'IA pour une communication intelligente sur votre site web";

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

  return {
    currentMessage,
    messages,
    isLoading,
    error,
    currentIndex,
    totalMessages: messages?.length || 0
  };
}