import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  Info,
  MessageSquare,
  Search,
  User,
  Calendar,
  Check,
  X,
} from "lucide-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { formatRelativeTime } from "@/utils/format-time";

export default function IntegrationConversations() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Debug translations
  console.log('🔍 TRANSLATION DEBUG:', {
    currentLanguage: i18n.language,
    localStorage: localStorage.getItem('i18nextLng'),
    testTranslations: {
      'hours_ago_plural': t('hours_ago_plural', { count: 3 }),
      'new': t('new'),
      'conversations_for': t('conversations_for')
    }
  });


  
  // Obtener la integración para mostrar su nombre
  const { data: integration, isLoading: isLoadingIntegration } = useQuery({
    queryKey: [`/api/integrations/${id}`, i18n.language],
  });

  // Obtener conversaciones específicas de esta integración
  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: [`/api/integrations/${id}/conversations`, i18n.language],
  });

  // Filtrar conversaciones por término de búsqueda
  const filteredConversations = conversations && searchTerm
    ? conversations.filter((conversation: any) => 
        conversation.visitorId?.toString().includes(searchTerm) ||
        new Date(conversation.createdAt).toLocaleString().includes(searchTerm))
    : conversations;

  return (
    <DashboardLayout>
      <div className="w-full max-w-full px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2" 
              onClick={() => navigate("/dashboard?tab=integrations")}
              title={t('back')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isLoadingIntegration 
                  ? t('loading') 
                  : `${t('conversations_for')} ${integration?.name || id}`}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {t('view_all_conversations_for_integration')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder={t('search_conversations')}
                className="pl-8 w-full md:w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => navigate(`/integrations/${id}/edit`)}
              variant="outline"
            >
              {t('edit_integration')}
            </Button>
            <Button 
              onClick={() => navigate(`/integrations/${id}/analytics`)}
              variant="outline"
            >
              {t('view_analytics')}
            </Button>
            <Button 
              onClick={() => navigate(`/conversations/new`)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              + {t('new', 'NUEVA')}
            </Button>
          </div>
        </div>

        {isLoadingConversations ? (
          <div className="w-full py-20 flex justify-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredConversations && filteredConversations.length > 0 ? (
          <div className="grid gap-4">
            {filteredConversations.map((conversation: any) => (
              <Card 
                key={conversation.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => navigate(`/conversations/${conversation.id}`)}
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {t('visitor')}: {conversation.visitorId || t('anonymous')}
                        </h3>
                        <Badge variant={conversation.resolved ? "success" : "default"}>
                          {conversation.resolved ? t('resolved') : t('active')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatRelativeTime(conversation.createdAt, t)}</span>
                        </div>
                        {conversation.messageCount && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>{conversation.messageCount} {t('messages')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conversation.resolution !== undefined && (
                      <Badge variant={conversation.resolution ? "success" : "destructive"}>
                        {conversation.resolution ? (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            {t('resolved')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {t('unresolved')}
                          </span>
                        )}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Info className="h-4 w-4" />
                      {t('details')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">{t('no_conversations_found')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? t('no_conversations_matching_search') 
                : t('no_conversations_for_integration')}
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}