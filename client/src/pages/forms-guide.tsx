import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, Copy, SendHorizonal, Bot, ArrowDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export default function FormsGuide() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<{content: string, role: 'user' | 'assistant'}[]>([
    {
      role: 'assistant',
      content: t('forms.assistant_welcome', 'Hello, I am your AIPI assistant. I am here to answer any questions about form customization and integration with your website. How can I help you?')
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // URL para el script de integración
  // Usar window.location.origin para obtener la URL base del sitio
  const formEmbedCode = `<!-- Código de ejemplo para integrar un formulario de AIPI -->
<script src="${window.location.origin}/static/form-embed.js?id=tu_id_de_formulario"></script>
<div id="aipi-form-container"></div>`;
  
  // Función para copiar código al portapapeles
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Función para enviar mensaje al asistente
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Añadir mensaje del usuario
    const userMessage = { content: inputValue, role: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Simulamos una respuesta del asistente (en producción, esto llamaría a una API)
      setTimeout(() => {
        let botResponse = '';
        
        if (inputValue.toLowerCase().includes('personalizar') || inputValue.toLowerCase().includes('personalización')) {
          botResponse = 'Puedes personalizar tus formularios de varias maneras:\n\n1. Cambia los colores para que coincidan con tu marca\n2. Modifica el estilo y tamaño de fuente\n3. Ajusta el espaciado y bordes\n4. Personaliza los textos de los botones y mensajes\n5. Añade tu logotipo\n\nTodo esto lo puedes hacer desde el editor de formularios en tu dashboard.';
        } else if (inputValue.toLowerCase().includes('integrar') || inputValue.toLowerCase().includes('integración')) {
          botResponse = `Para integrar un formulario en tu sitio web, debes:\n\n1. Crear y publicar tu formulario desde el dashboard\n2. Copiar el código de integración que se proporciona\n3. Pegar este código en tu sitio web donde quieras que aparezca el formulario\n\nEl código se verá así:\n\`\`\`html\n${formEmbedCode}\n\`\`\`\n\nDonde "tu_id_de_formulario" será reemplazado por el ID único de tu formulario.`;
        } else if (inputValue.toLowerCase().includes('campos') || inputValue.toLowerCase().includes('field')) {
          botResponse = 'AIPI soporta diversos tipos de campos para tus formularios:\n\n• Texto corto\n• Texto largo (área de texto)\n• Email\n• Número\n• Teléfono\n• Fecha\n• Hora\n• Selección (dropdown)\n• Botones de radio\n• Casillas de verificación\n• Archivos\n• Dirección\n• URL\n• Consentimiento\n\nPuedes añadir, eliminar y reordenar estos campos según tus necesidades.';
        } else if (inputValue.toLowerCase().includes('url') || inputValue.toLowerCase().includes('link')) {
          botResponse = `La URL correcta para el script de integración de formularios es:\n\n\`\`\`html\n<script src="${window.location.origin}/static/form-embed.js?id=tu_id_de_formulario"></script>\n\`\`\`\n\nDonde "tu_id_de_formulario" debe ser reemplazado por el slug o ID específico de tu formulario. Este ID lo puedes encontrar en la página de detalles del formulario en tu dashboard.`;
        } else if (inputValue.toLowerCase().includes('respuestas') || inputValue.toLowerCase().includes('datos')) {
          botResponse = 'Las respuestas de tus formularios se almacenan de forma segura en tu cuenta de AIPI. Puedes:\n\n• Verlas en tiempo real desde el dashboard\n• Exportarlas en formato CSV\n• Configurar notificaciones por email cuando recibas nuevas respuestas\n• Analizar tendencias y patrones en los datos recibidos\n\nTodas las respuestas están protegidas y solo tú puedes acceder a ellas.';
        } else {
          botResponse = 'Gracias por tu pregunta. Puedo ayudarte con la personalización de formularios, tipos de campos disponibles, cómo integrar formularios en tu sitio web, y cómo administrar las respuestas. Si tienes preguntas específicas sobre alguno de estos temas, no dudes en preguntar.';
        }
        
        setMessages(prev => [...prev, { content: botResponse, role: 'assistant' }]);
        setIsLoading(false);
        scrollToBottom();
      }, 1000);
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast({
        title: 'Error al enviar mensaje',
        description: 'Hubo un problema al comunicarse con el asistente. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  // Función para desplazarse al último mensaje
  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              {t('forms.title', 'Customizable Forms')}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('forms.subtitle', 'Create, customize and integrate forms on your website to capture visitor information.')}
            </p>
          </div>
        </section>
        
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold">{t('forms.customizable_forms', 'Customizable Forms')}</h2>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  {t('forms.description', 'AIPI allows you to create and manage custom forms to efficiently capture visitor information. Use this functionality for lead generation, surveys or user registrations.')}
                </p>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t('forms.available_types', 'Available Form Types')}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                  <li><strong>{t('forms.contact_form', 'Contact forms')}:</strong> {t('forms.contact_form_desc', 'To capture basic information from interested visitors')}</li>
                  <li><strong>{t('forms.waitlist_form', 'Waitlist forms')}:</strong> {t('forms.waitlist_form_desc', 'Ideal for upcoming projects')}</li>
                  <li><strong>{t('forms.survey_form', 'Surveys')}:</strong> {t('forms.survey_form_desc', 'To collect opinions and feedback from your users')}</li>
                  <li><strong>{t('forms.registration_forms', 'Registration forms')}:</strong> {t('forms.registration_forms_desc', 'To create user accounts or subscriptions')}</li>
                </ul>
                {user ? (
                  <Button size="lg" onClick={() => setLocation("/dashboard/forms")}>
                    {t('forms.go_to_management', 'Go to Form Management')}
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => setLocation("/login")}>
                    {t('forms.login', 'Login')}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold">{t('forms.create_first_form', 'Create Your First Form')}</h2>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  {t('forms.follow_steps', 'Follow these simple steps to create and publish your first form:')}
                </p>
                <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300 mb-6">
                  <li className="pl-2">
                    <strong className="text-primary-600 dark:text-primary-400">{t('forms.step1_title', 'Access Forms Panel')}</strong>
                    <p className="mt-2 ml-6">{t('forms.step1_desc', 'Go to the "Forms" section in your dashboard to start creating a new form.')}</p>
                  </li>
                  <li className="pl-2">
                    <strong className="text-primary-600 dark:text-primary-400">{t('forms.step2_title', 'Choose a Template')}</strong>
                    <p className="mt-2 ml-6">{t('forms.step2_desc', 'Select from our pre-designed templates or start from scratch. Each template is optimized for different use cases.')}</p>
                  </li>
                  <li className="pl-2">
                    <strong className="text-primary-600 dark:text-primary-400">{t('forms.step3_title', 'Customize Fields')}</strong>
                    <p className="mt-2 ml-6">{t('forms.step3_desc', 'Add, remove or modify fields according to your needs. You can create text, selection, date, file fields and more.')}</p>
                  </li>
                  <li className="pl-2">
                    <strong className="text-primary-600 dark:text-primary-400">{t('forms.step4_title', 'Configure Appearance')}</strong>
                    <p className="mt-2 ml-6">{t('forms.step4_desc', 'Adjust colors, fonts and styles to match your brand. Customize button and message text.')}</p>
                  </li>
                  <li className="pl-2">
                    <strong className="text-primary-600 dark:text-primary-400">{t('forms.step5_title', 'Publish and Share')}</strong>
                    <p className="mt-2 ml-6">{t('forms.step5_desc', 'Once ready, click "Publish" and get the integration code to insert it into your website.')}</p>
                  </li>
                </ol>
                {user ? (
                  <Button size="lg" onClick={() => setLocation("/dashboard/forms/new")}>
                    {t('forms.create_new_form', 'Create New Form')}
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => setLocation("/register")}>
                    {t('forms.create_account', 'Create Account')}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="bg-gray-100 dark:bg-gray-800 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold">{t('forms.response_management', 'Response Management')}</h2>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  {t('forms.response_intro', 'All responses from your forms are captured and stored securely in your AIPI account. You can:')}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                  <li>{t('forms.view_responses', 'View all responses in real time from your control panel')}</li>
                  <li>{t('forms.export_csv', 'Export data to CSV for analysis or integration with other tools')}</li>
                  <li>{t('forms.email_notifications', 'Configure email notifications when you receive new responses')}</li>
                  <li>{t('forms.webhook_integration', 'Integrate with other systems through webhooks')}</li>
                  <li>{t('forms.analyze_patterns', 'Analyze trends and patterns in received responses')}</li>
                </ul>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>{t('forms.tip', 'Tip')}:</strong> {t('forms.tip_description', 'Use your form responses to train your AI assistant, allowing it to answer frequently asked questions based on collected information.')}
                  </p>
                </div>
                {user ? (
                  <Button size="lg" onClick={() => setLocation("/dashboard/forms")}>
                    {t('forms.view_my_forms', 'View My Forms')}
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => setLocation("/pricing")}>
                    {t('forms.view_plans', 'View Plans')}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="bg-primary-50 dark:bg-gray-800 rounded-lg p-6 border border-primary-100 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-primary-900 dark:text-primary-400">{t('forms.website_integration', 'Website Integration')}</h3>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {t('forms.integration_description', 'Once your form is created, you can get the integration code to insert it into your website. This code will generate a form with all the fields and styles you have configured.')}
                </p>
                
                <div className="relative">
                  <pre className="bg-gray-900 text-white p-6 rounded-md overflow-x-auto text-sm">
                    {formEmbedCode}
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(formEmbedCode)}
                    className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md"
                  >
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-4">
                  <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">{t('forms.form_preview', 'Form Preview')}</h4>
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center p-6 max-w-md">
                      <h5 className="font-medium text-xl mb-4 text-gray-900 dark:text-white">{t('forms.contact_form_example', 'Contact Form')}</h5>
                      <div className="space-y-4 text-left">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('forms.full_name', 'Full Name')}</label>
                          <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md" disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                          <input type="email" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md" disabled />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('forms.message', 'Message')}</label>
                          <textarea className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md" rows={3} disabled></textarea>
                        </div>
                        <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-md font-medium" disabled>{t('forms.send_message', 'Send Message')}</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  {t('forms.pricing_note', 'Note: Creating your first form is free. For additional forms and advanced features, check our pricing plans.')}
                </p>
              </div>
            </div>
            

            
            <div className="flex justify-center mt-8">
              <Button asChild variant="outline" className="mr-4">
                <Link href="/get-started">
                  {t('forms.back_to_guide', 'Back to Getting Started')}
                </Link>
              </Button>
              {user ? (
                <Button asChild>
                  <Link href="/dashboard/forms">
                    {t('forms.go_to_my_forms', 'Go to My Forms')}
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/register">
                    {t('forms.create_account_link', 'Create Account')}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}