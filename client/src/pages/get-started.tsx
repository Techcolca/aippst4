import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, X, SendHorizonal, Copy, Check, Globe, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CustomizationAssistant from "@/components/customization-assistant";

export default function GetStarted() {
  const [location, setLocation] = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [copiedBubble, setCopiedBubble] = useState(false);
  const [copiedFullscreen, setCopiedFullscreen] = useState(false);
  const [copiedForm, setCopiedForm] = useState(false);
  
  // Estado para las previsualizaciones
  const [bubbleUrl, setBubbleUrl] = useState("");
  const [fullscreenUrl, setFullscreenUrl] = useState("");
  const [showBubblePreview, setShowBubblePreview] = useState(false);
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
  const [isLoadingBubble, setIsLoadingBubble] = useState(false);
  const [isLoadingFullscreen, setIsLoadingFullscreen] = useState(false);
  
  // URLs para los scripts de integración - USANDO EMBED.JS Y FORM-BUTTON.JS
  const baseUrl = window.location.origin;
  const bubbleWidgetCode = `<script src="${baseUrl}/embed.js?key=aipi_web_internal" data-widget-type="bubble"></script>`;
  const fullscreenWidgetCode = `<script src="${baseUrl}/embed.js?key=aipi_web_internal" data-widget-type="fullscreen"></script>`;
  const formWidgetCode = `<script src="${baseUrl}/form-button.js?key=aipi_web_internal" data-form-id="1" data-display-type="modal"></script>`;
  
  // Función para copiar código al portapapeles
  const copyToClipboard = (code: string, type: 'bubble' | 'fullscreen' | 'form') => {
    navigator.clipboard.writeText(code);
    if (type === 'bubble') {
      setCopiedBubble(true);
      setTimeout(() => setCopiedBubble(false), 2000);
    } else if (type === 'fullscreen') {
      setCopiedFullscreen(true);
      setTimeout(() => setCopiedFullscreen(false), 2000);
    } else if (type === 'form') {
      setCopiedForm(true);
      setTimeout(() => setCopiedForm(false), 2000);
    }
  };
  
  // Función para validar URL
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Función para previsualizar widget flotante
  const previewBubbleWidget = () => {
    if (!bubbleUrl) {
      alert(t("getStartedPage.widget.preview.url_required"));
      return;
    }
    
    if (!isValidUrl(bubbleUrl)) {
      alert(t("getStartedPage.widget.preview.url_invalid"));
      return;
    }
    
    setIsLoadingBubble(true);
    // Simulamos una carga para mostrar la previsualización
    setTimeout(() => {
      setShowBubblePreview(true);
      setIsLoadingBubble(false);
    }, 1500);
  };
  
  // Función para previsualizar widget de pantalla completa
  const previewFullscreenWidget = () => {
    if (!fullscreenUrl) {
      alert(t("getStartedPage.widget.preview.url_required"));
      return;
    }
    
    if (!isValidUrl(fullscreenUrl)) {
      alert(t("getStartedPage.widget.preview.url_invalid"));
      return;
    }
    
    setIsLoadingFullscreen(true);
    // Simulamos una carga para mostrar la previsualización
    setTimeout(() => {
      setShowFullscreenPreview(true);
      setIsLoadingFullscreen(false);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              {t("getStartedPage.title")}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t("getStartedPage.subtitle")}
            </p>
          </div>
        </section>
        
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs defaultValue="bubble" className="w-full">
              <TabsList className="flex w-full justify-between mb-8">
                <TabsTrigger value="bubble" className="flex-1 text-lg py-3 px-2">{t("getStartedPage.tabs.widget")}</TabsTrigger>
                <TabsTrigger value="fullscreen" className="flex-1 text-lg py-3 px-2">{t("getStartedPage.tabs.fullscreen")}</TabsTrigger>
                <TabsTrigger value="form" className="flex-1 text-lg py-3 px-2">{t("getStartedPage.tabs.form")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bubble" className="space-y-8">
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{t("getStartedPage.widget.step1.title")}</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      {t("getStartedPage.widget.step1.description")}
                    </p>
                    <div className="relative">
                      <pre className="bg-gray-900 text-white p-6 rounded-md overflow-x-auto text-sm">
                        {bubbleWidgetCode}
                      </pre>
                      <button 
                        onClick={() => copyToClipboard(bubbleWidgetCode, 'bubble')}
                        className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md"
                      >
                        {copiedBubble ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>{t("getStartedPage.widget.step1.wordpress_note")}</strong>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{t("getStartedPage.widget.step2.title")}</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      {t("getStartedPage.widget.step2.description")}
                    </p>
                    <div className="mb-6">
                      <p className="font-medium text-gray-900 dark:text-white mb-3">{t("getStartedPage.widget.step2.customization_title")}</p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                        <li>{t("getStartedPage.widget.step2.position")}</li>
                        <li>{t("getStartedPage.widget.step2.theme_color")}</li>
                        <li>{t("getStartedPage.widget.step2.assistant_name")}</li>
                        <li>{t("getStartedPage.widget.step2.welcome_message")}</li>
                      </ul>
                    </div>
                    <div className="mb-6">
                      <p className="font-medium text-gray-900 dark:text-white mb-3">{t("getStartedPage.widget.step2.configure_dashboard")}</p>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                        <li>{t("getStartedPage.widget.step2.dashboard_steps.0")}</li>
                        <li>{t("getStartedPage.widget.step2.dashboard_steps.1")}</li>
                        <li>{t("getStartedPage.widget.step2.dashboard_steps.2")}</li>
                        <li>{t("getStartedPage.widget.step2.dashboard_steps.3")}</li>
                      </ol>
                    </div>
                    {user ? (
                      <Button size="lg" onClick={() => setLocation("/dashboard/integrations")}>
                        {t("getStartedPage.buttons.go_to_integrations")}
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/login")}>
                        {t("getStartedPage.buttons.login_to_manage")}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{t("getStartedPage.widget.step3.title")}</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      {t("getStartedPage.widget.step3.description")}
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      {Array.isArray(t("getStartedPage.widget.step3.training_options", { returnObjects: true })) 
                        ? t("getStartedPage.widget.step3.training_options", { returnObjects: true }).map((option: string, index: number) => (
                            <li key={index}>{option}</li>
                          ))
                        : (
                          <>
                            <li>Documentos PDF con información sobre tus productos o servicios</li>
                            <li>Archivos DOCX con preguntas frecuentes y sus respuestas</li>
                            <li>Archivos Excel con datos estructurados</li>
                            <li>Instrucciones específicas sobre el tono y estilo de las respuestas</li>
                          </>
                        )
                      }
                    </ul>
                    {user ? (
                      <Button size="lg" onClick={() => setLocation("/dashboard/content")}>
                        {t("getStartedPage.buttons.manage_content")}
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/register")}>
                        {t("getStartedPage.buttons.create_account")}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{t("getStartedPage.widget.step3.step4_title")}</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      {t("getStartedPage.widget.step3.step4_description")}
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      {Array.isArray(t("getStartedPage.widget.step3.form_options", { returnObjects: true })) 
                        ? t("getStartedPage.widget.step3.form_options", { returnObjects: true }).map((option: string, index: number) => (
                            <li key={index}>{option}</li>
                          ))
                        : (
                          <>
                            <li>Formularios de contacto y captura de leads</li>
                            <li>Encuestas de satisfacción y feedback</li>
                            <li>Formularios de registro para eventos</li>
                            <li>Integración automática con tu CRM</li>
                          </>
                        )
                      }
                    </ul>
                    {user ? (
                      <Button size="lg" onClick={() => setLocation("/dashboard/forms")}>
                        {t("getStartedPage.buttons.create_forms")}
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/register")}>
                        {t("getStartedPage.buttons.create_account_forms")}
                      </Button>
                    )}
                  </div>
                </div>

              </TabsContent>
              
              <TabsContent value="fullscreen" className="space-y-8">
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{t("getStartedPage.fullscreen.step1.title")}</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      {t("getStartedPage.fullscreen.step1.description")}
                    </p>
                    <div className="relative">
                      <pre className="bg-gray-900 text-white p-6 rounded-md overflow-x-auto text-sm">
                        {fullscreenWidgetCode}
                      </pre>
                      <button 
                        onClick={() => copyToClipboard(fullscreenWidgetCode, 'fullscreen')}
                        className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md"
                      >
                        {copiedFullscreen ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>{t("getStartedPage.fullscreen.step1.wordpress_note")}</strong>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{t("getStartedPage.fullscreen.step2.title")}</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      {t("getStartedPage.fullscreen.step2.description")}
                    </p>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-6">
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        {t("getStartedPage.fullscreen_features.title")}
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>{t("getStartedPage.fullscreen_features.register_login")}</strong></li>
                        <li><strong>{t("getStartedPage.fullscreen_features.personal_history")}</strong></li>
                        <li><strong>{t("getStartedPage.fullscreen_features.auto_titles")}</strong></li>
                        <li><strong>{t("getStartedPage.fullscreen_features.conversation_management")}</strong></li>
                        <li><strong>{t("getStartedPage.fullscreen_features.user_info")}</strong></li>
                        <li><strong>{t("getStartedPage.fullscreen_features.jwt_security")}</strong></li>
                      </ul>
                    </div>
                    
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      {t("getStartedPage.fullscreen_features.visual_customization")}
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      <li>{t("getStartedPage.fullscreen_features.brand_colors")}</li>
                      <li>{t("getStartedPage.fullscreen_features.welcome_messages")}</li>
                      <li>{t("getStartedPage.fullscreen_features.registration_config")}</li>
                      <li>{t("getStartedPage.fullscreen_features.privacy_settings")}</li>
                    </ul>
                    {user ? (
                      <Button size="lg" onClick={() => setLocation("/dashboard/integrations")}>
                        {t("getStartedPage.buttons.configure_auth")}
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/login")}>
                        {t("getStartedPage.buttons.login")}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{t("getStartedPage.ignored_sections.step3_title")}</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800 mb-5">
                      <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-300 mb-2">
                        {t("getStartedPage.ignored_sections.title")}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {t("getStartedPage.ignored_sections.description")}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        <div className="flex items-start">
                          <span className="bg-primary-100 dark:bg-primary-800 rounded-full p-1 mr-2 flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          </span>
                          <p className="text-sm">{t("getStartedPage.ignored_sections.benefit_1")}</p>
                        </div>
                        <div className="flex items-start">
                          <span className="bg-primary-100 dark:bg-primary-800 rounded-full p-1 mr-2 flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          </span>
                          <p className="text-sm">{t("getStartedPage.ignored_sections.benefit_2")}</p>
                        </div>
                        <div className="flex items-start">
                          <span className="bg-primary-100 dark:bg-primary-800 rounded-full p-1 mr-2 flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          </span>
                          <p className="text-sm">{t("getStartedPage.ignored_sections.benefit_3")}</p>
                        </div>
                        <div className="flex items-start">
                          <span className="bg-primary-100 dark:bg-primary-800 rounded-full p-1 mr-2 flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          </span>
                          <p className="text-sm">{t("getStartedPage.ignored_sections.benefit_4")}</p>
                        </div>
                      </div>
                      <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded p-3">
                        <p className="text-sm font-medium mb-1">{t("getStartedPage.ignored_sections.config_example")}</p>
                        <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
{`aipi('init', {
  apiKey: 'TU_API_KEY',
  // Otras configuraciones...
  ignoredSections: ['Menú principal', 'Footer', 'Sidebar', 'Publicidad'],
});`}
                        </pre>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="mb-4 text-gray-700 dark:text-gray-300">
{t("getStartedPage.ignored_sections.config_description")}
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                        <li>{t("getStartedPage.ignored_sections.step_1")}</li>
                        <li>{t("getStartedPage.ignored_sections.step_2")}</li>
                        <li>{t("getStartedPage.ignored_sections.step_3")}</li>
                        <li>{t("getStartedPage.ignored_sections.step_4")}</li>
                      </ol>
                      {user ? (
                        <Button size="lg" onClick={() => setLocation("/dashboard/integrations")}>
{t("getStartedPage.buttons.configure_sections")}
                        </Button>
                      ) : (
                        <Button size="lg" onClick={() => setLocation("/register")}>
{t("getStartedPage.buttons.create_account")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{t("getStartedPage.fullscreen.step4.title")}</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
{t("getStartedPage.fullscreen.step4.description")}
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      <li>{t("getStartedPage.fullscreen.step4.feature_1")}</li>
                      <li>{t("getStartedPage.fullscreen.step4.feature_2")}</li>
                      <li>{t("getStartedPage.fullscreen.step4.feature_3")}</li>
                      <li>{t("getStartedPage.fullscreen.step4.feature_4")}</li>
                    </ul>
                    {user ? (
                      <Button size="lg" onClick={() => setLocation("/dashboard/automations")}>
{t("getStartedPage.buttons.configure_assistant")}
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/register")}>
{t("getStartedPage.buttons.create_account")}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{t("getStartedPage.fullscreen.step5.title")}</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
{t("getStartedPage.fullscreen.step5.description")}
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      <li>{t("getStartedPage.fullscreen.step5.feature_1")}</li>
                      <li>{t("getStartedPage.fullscreen.step5.feature_2")}</li>
                      <li>{t("getStartedPage.fullscreen.step5.feature_3")}</li>
                      <li>{t("getStartedPage.fullscreen.step5.feature_4")}</li>
                    </ul>
                    {user ? (
                      <Button size="lg" onClick={() => setLocation("/dashboard/forms")}>
{t("getStartedPage.buttons.configure_advanced_forms")}
                      </Button>
                    ) : (
                      <Button size="lg" onClick={() => setLocation("/register")}>
{t("getStartedPage.buttons.create_account_advanced")}
                      </Button>
                    )}
                  </div>
                </div>

              </TabsContent>

              <TabsContent value="form" className="space-y-8">
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{t("getStartedPage.form.step1.title")}</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
{t("getStartedPage.form.step1.description")}
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 relative">
                      <code className="text-sm">{formWidgetCode}</code>
                      <Button
                        onClick={() => copyToClipboard(formWidgetCode, 'form')}
                        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600"
                        size="sm"
                      >
                        {copiedForm ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    {copiedForm && (
                      <p className="text-green-600 dark:text-green-400 text-sm mb-4">
{t("getStartedPage.form.step1.copied")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{t("getStartedPage.form.step2.title")}</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
{t("getStartedPage.form.step2.description")}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">{t("getStartedPage.form.step2.basic_attributes")}</h3>
                        <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                          <li><code>data-form-id</code>: {t("getStartedPage.form.step2.attributes.form_id")}</li>
                          <li><code>data-display-type</code>: {t("getStartedPage.form.step2.attributes.display_type")}</li>
                          <li><code>data-position</code>: {t("getStartedPage.form.step2.attributes.position")}</li>
                          <li><code>data-button-text</code>: {t("getStartedPage.form.step2.attributes.button_text")}</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">{t("getStartedPage.form.step2.customization_attributes")}</h3>
                        <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                          <li><code>data-theme-color</code>: {t("getStartedPage.form.step2.attributes.theme_color")}</li>
                          <li><code>data-icon</code>: {t("getStartedPage.form.step2.attributes.icon")}</li>
                          <li><code>data-button-size</code>: {t("getStartedPage.form.step2.attributes.button_size")}</li>
                          <li><code>data-auto-show</code>: {t("getStartedPage.form.step2.attributes.auto_show")}</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
<strong>{t("getStartedPage.form.step2.example_title")}</strong>
                      </p>
                      <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto mt-2">
{`<script src="${baseUrl}/form-button.js?key=TU_API_KEY" 
        data-form-id="1" 
        data-display-type="modal"
        data-position="bottom-right"
        data-button-text="Contactar"
        data-theme-color="#3B82F6"
        data-icon="form">
</script>`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{t("getStartedPage.form.step3.title")}</h2>
                  </div>
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
{t("getStartedPage.form.step3.description")}
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                      {(t("getStartedPage.form.step3.dashboard_steps", { returnObjects: true }) as string[]).map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                    {user ? (
                      <Button 
                        onClick={() => setLocation("/dashboard?tab=forms")}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
{t("getStartedPage.buttons.go_to_forms")}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setLocation("/login")}
                        className="bg-primary-600 hover:bg-primary-700"
                      >
{t("getStartedPage.buttons.login_to_manage_forms")}
                      </Button>
                    )}
                  </div>
                </div>

              </TabsContent>
            </Tabs>
            
            <div className="mt-10 bg-primary-50 dark:bg-gray-800 rounded-lg p-6 border border-primary-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-primary-900 dark:text-primary-400">{t("getStartedPage.cta.forms_title")}</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {t("getStartedPage.cta.forms_description")}
                  </p>
                </div>
                <Button size="lg" asChild className="whitespace-nowrap">
                  <Link href="/forms-guide">
{t("getStartedPage.buttons.forms_guide")}
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold mb-4">{t("getStartedPage.support.title")}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                {t("getStartedPage.support.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline">
{t("getStartedPage.buttons.view_docs")}
                </Button>
                <Button size="lg">
{t("getStartedPage.buttons.contact_support")}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Asistente de personalización flotante */}
      <CustomizationAssistant />
    </div>
  );
}