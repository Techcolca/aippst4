import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useTranslation } from "react-i18next";

export default function ConversationDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Obtener detalles de la conversación
  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: [`/api/conversations/${id}`],
  });
  
  // Obtener mensajes de la conversación
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: [`/api/conversations/${id}/messages`],
  });

  useEffect(() => {
    // Si no hay ID o la conversación no existe, redirigir al dashboard
    if (!id) {
      navigate("/dashboard?tab=conversations");
      toast({
        title: "Error",
        description: "ID de conversación no válido",
        variant: "destructive",
      });
    }
  }, [id, navigate, toast]);

  // Filtrar mensajes por búsqueda si es necesario
  const filteredMessages = messages 
    ? searchQuery 
      ? messages.filter((msg: any) => 
          msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
      : messages
    : [];

  return (
    <DashboardLayout>
      <div className="w-full max-w-full px-6 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-2 p-2" 
            onClick={() => navigate("/dashboard?tab=conversations")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Detalles de la Conversación</h1>
        </div>

        {isLoadingConversation ? (
          <div className="w-full py-20 flex justify-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : !conversation ? (
          <Card className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Conversación no encontrada</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No se pudo encontrar la conversación solicitada
            </p>
            <Button onClick={() => navigate("/dashboard?tab=conversations")}>
              Volver al Dashboard
            </Button>
          </Card>
        ) : (
          <>
            <Card className="p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Información de la Conversación</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">ID:</span>
                      <span className="font-medium">{conversation.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('visitor')}:</span>
                      <span className="font-medium">#{conversation.visitorId || t('anonymous')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Estado:</span>
                      <span className={`font-medium ${
                        conversation.status === 'completed' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {conversation.status === 'completed' ? 'Completada' : 'Activa'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fecha de inicio:</span>
                      <span className="font-medium">
                        {new Date(conversation.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {conversation.endedAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Fecha de fin:</span>
                        <span className="font-medium">
                          {new Date(conversation.endedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Rendimiento</h3>
                  <div className="space-y-4">
                    {conversation.score !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Puntuación de satisfacción:</span>
                          <span className="font-medium">{conversation.score}/10</span>
                        </div>
                        <Progress value={conversation.score * 10} className="h-2" />
                      </div>
                    )}
                    
                    {conversation.resolution !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Resolución:</span>
                          <span className="font-medium">{conversation.resolution ? 'Resuelta' : 'No resuelta'}</span>
                        </div>
                      </div>
                    )}
                    
                    {conversation.messageCount !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Cantidad de mensajes:</span>
                        <span className="font-medium">{conversation.messageCount}</span>
                      </div>
                    )}
                    
                    {conversation.source && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Origen:</span>
                        <span className="font-medium">{conversation.source}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Mensajes de la Conversación</h2>
              
              {/* Búsqueda */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar en mensajes..."
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {isLoadingMessages ? (
                <div className="w-full py-10 flex justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredMessages.length > 0 ? (
                <div className="space-y-4">
                  {filteredMessages.map((message: any) => (
                    <Card 
                      key={message.id}
                      className={`p-4 ${
                        message.role === 'user' 
                          ? 'border-l-4 border-l-blue-400' 
                          : message.role === 'assistant'
                            ? 'border-l-4 border-l-green-400'
                            : 'border-l-4 border-l-gray-400'
                      }`}
                    >
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">
                          {message.role === 'user' 
                            ? 'Usuario' 
                            : message.role === 'assistant'
                              ? 'Asistente'
                              : 'Sistema'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <h3 className="text-lg font-medium mb-2">No hay mensajes</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No se encontraron mensajes en esta conversación
                  </p>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}