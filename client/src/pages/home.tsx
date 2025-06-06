import { useState, useEffect } from "react";
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
import { useTranslation } from "react-i18next";

export default function Home() {
  const [location, setLocation] = useState("/");
  const { theme } = useTheme();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  const [welcomeChatSettings, setWelcomeChatSettings] = useState<any>(null);
  
  // Cargar configuración del chatbot de la página de bienvenida
  useEffect(() => {
    const fetchWelcomeChatSettings = async () => {
      try {
        const response = await fetch('/api/welcome-chat-settings');
        if (response.ok) {
          const data = await response.json();
          setWelcomeChatSettings(data);
        } else {
          console.error('Error fetching welcome chat settings');
        }
      } catch (error) {
        console.error('Failed to fetch welcome chat settings:', error);
      }
    };
    
    fetchWelcomeChatSettings();
  }, []);
  
  // Función para copiar el código de integración
  const copyIntegrationCode = () => {
    const code = `<script src="https://a82260a7-e706-4639-8a5c-db88f2f26167-00-2a8uzldw0vxo4.picard.replit.dev/static/aipps-web-widget.js?key=aipps_web_internal"></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 mb-10 lg:mb-0">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                  {t("welcome")}
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                  {t("tagline")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 border-0" asChild>
                    <Link href="/get-started">{t("getStarted")}</Link>
                  </Button>
                  
                  <Button size="lg" variant="outline" className="border-gray-600 dark:border-gray-400 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                    {t("learnMore")}
                  </Button>
                </div>
              </div>
              <div className="lg:w-1/2 lg:pl-12">
                <div className="backdrop-blur-md bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-gray-800/30 rounded-lg shadow-xl p-4 md:p-6 max-w-md mx-auto">
                  <ChatInterface 
                    demoMode={true} 
                    welcomePageSettings={welcomeChatSettings}
                  />
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
              Join thousands of businesses using AIPPS to enhance user experience and boost engagement.
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
