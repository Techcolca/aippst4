import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ChatInterface from "@/components/chat-interface";
import { Bot, Code, BarChart3, Rocket, CopyIcon } from "lucide-react";

export default function Home() {
  const [location, setLocation] = useState("/");
  const { theme } = useTheme();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Función para copiar el código de integración
  const copyIntegrationCode = () => {
    const code = `<script src="https://a82260a7-e706-4639-8a5c-db88f2f26167-00-2a8uzldw0vxo4.picard.replit.dev/static/aipi-web-widget.js?key=aipi_web_internal"></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 mb-10 lg:mb-0">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                  AI-Powered Conversations for Your Website
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                  AIPI is the intelligent conversational platform that enhances your website with real-time AI assistance, task automation, and personalized user interactions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                        Get Started
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Comienza con AIPI en tu sitio web</DialogTitle>
                        <DialogDescription>
                          Sigue estos pasos para integrar AIPI en tu sitio web y comenzar a ofrecer conversaciones inteligentes a tus visitantes.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Tabs defaultValue="bubble" className="mt-4">
                        <TabsList className="grid grid-cols-2">
                          <TabsTrigger value="bubble">Widget flotante (burbuja)</TabsTrigger>
                          <TabsTrigger value="fullscreen">Pantalla completa (estilo ChatGPT)</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="bubble" className="mt-4">
                          <div className="space-y-4">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                              <h3 className="font-medium mb-2">Paso 1: Agrega este código a tu sitio web</h3>
                              <div className="relative">
                                <pre className="bg-black text-white p-4 rounded-md overflow-x-auto text-sm">
                                  {`<script src="https://a82260a7-e706-4639-8a5c-db88f2f26167-00-2a8uzldw0vxo4.picard.replit.dev/static/aipi-web-widget.js?key=aipi_web_internal"></script>`}
                                </pre>
                                <button 
                                  onClick={copyIntegrationCode} 
                                  className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-md"
                                  title="Copiar código"
                                >
                                  <CopyIcon size={16} />
                                </button>
                                {copied && (
                                  <span className="absolute top-2 right-10 text-green-500 text-sm">¡Copiado!</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                              <h3 className="font-medium mb-2">Paso 2: Personaliza el widget</h3>
                              <p>Personaliza la apariencia y comportamiento del widget desde tu panel de control de AIPI.</p>
                              {user ? (
                                <Button className="mt-2" onClick={() => setLocation("/dashboard/integrations")}>
                                  Ir al Panel de Control
                                </Button>
                              ) : (
                                <Button className="mt-2" onClick={() => setLocation("/login")}>
                                  Iniciar Sesión
                                </Button>
                              )}
                            </div>
                            
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                              <h3 className="font-medium mb-2">Paso 3: Entrena tu asistente</h3>
                              <p>Sube documentos y configura el comportamiento del asistente para que responda según las necesidades de tu negocio.</p>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="fullscreen" className="mt-4">
                          <div className="space-y-4">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                              <h3 className="font-medium mb-2">Paso 1: Agrega este código a tu sitio web</h3>
                              <div className="relative">
                                <pre className="bg-black text-white p-4 rounded-md overflow-x-auto text-sm">
                                  {`<script src="https://a82260a7-e706-4639-8a5c-db88f2f26167-00-2a8uzldw0vxo4.picard.replit.dev/static/fullscreen-embed.js?key=aipi_web_internal"></script>`}
                                </pre>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(`<script src="https://a82260a7-e706-4639-8a5c-db88f2f26167-00-2a8uzldw0vxo4.picard.replit.dev/static/fullscreen-embed.js?key=aipi_web_internal"></script>`);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                  }} 
                                  className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-1 rounded-md"
                                  title="Copiar código"
                                >
                                  <CopyIcon size={16} />
                                </button>
                                {copied && (
                                  <span className="absolute top-2 right-10 text-green-500 text-sm">¡Copiado!</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                              <h3 className="font-medium mb-2">Paso 2: Personaliza la interfaz</h3>
                              <p>Configura la interfaz de pantalla completa para que se integre con el diseño de tu sitio web.</p>
                              {user ? (
                                <Button className="mt-2" onClick={() => setLocation("/dashboard/integrations")}>
                                  Ir al Panel de Control
                                </Button>
                              ) : (
                                <Button className="mt-2" onClick={() => setLocation("/login")}>
                                  Iniciar Sesión
                                </Button>
                              )}
                            </div>
                            
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                              <h3 className="font-medium mb-2">Paso 3: Configura las respuestas</h3>
                              <p>Define el comportamiento de tu asistente y entrénalo con documentos específicos de tu negocio.</p>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      <DialogFooter className="mt-6">
                        <DialogClose asChild>
                          <Button variant="outline">Cerrar</Button>
                        </DialogClose>
                        {user ? (
                          <Button onClick={() => setLocation("/dashboard")}>
                            Ir al Dashboard
                          </Button>
                        ) : (
                          <Button onClick={() => setLocation("/register")}>
                            Crear Cuenta
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button size="lg" variant="outline">
                    Watch Demo
                  </Button>
                </div>
              </div>
              <div className="lg:w-1/2 lg:pl-12">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 max-w-md mx-auto">
                  <ChatInterface demoMode={true} />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Everything you need to enhance your website with intelligent conversations
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <Bot className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Conversational AI</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Natural language interactions that understand context and user intent.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <Rocket className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Task Automation</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Automate repetitive tasks and streamline workflows with AI assistance.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <Code className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Simple website integration with a single line of code. No complex setup required.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <BarChart3 className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Powerful insights into conversations, user satisfaction, and engagement metrics.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-primary-600 dark:bg-primary-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to transform your website?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Join thousands of businesses using AIPI to enhance user experience and boost engagement.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-primary-700">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
