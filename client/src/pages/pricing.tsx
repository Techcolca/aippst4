import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { loadStripe } from '@stripe/stripe-js';

// Inicializar Stripe con la clave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

type PricingPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  tier: string;
  interactionsLimit: number;
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-CA', { 
    style: 'currency', 
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0
  }).format(amount);
};

export default function PricingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkoutInProgress, setCheckoutInProgress] = useState<string | null>(null);

  // Obtener los planes de precios de la API
  const { data: plans = [], isLoading } = useQuery<PricingPlan[]>({
    queryKey: ['/api/pricing/plans'],
    retry: false
  });

  // Función para iniciar el proceso de checkout
  const handleSubscribe = async (planId: string) => {
    try {
      if (!user) {
        // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
        toast({
          title: "Inicia sesión primero",
          description: "Necesitas iniciar sesión para suscribirte a un plan.",
          variant: "default",
        });
        return;
      }

      setCheckoutInProgress(planId);

      const response = await fetch('/api/pricing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const result = await response.json();

      if (result.sessionId) {
        // Si es un plan de pago, redirigir a Stripe Checkout
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({ sessionId: result.sessionId });
      } else if (result.redirectUrl) {
        // Si es un plan gratuito, redirigir directamente
        window.location.href = result.redirectUrl;
      } else {
        // Mostrar mensaje de éxito/error
        toast({
          title: result.success ? "Éxito" : "Error",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        });
      }
    } catch (error) {
      console.error('Error al iniciar el checkout:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setCheckoutInProgress(null);
    }
  };

  // Determinar el plan destacado
  const recommendedPlanId = 'professional';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="py-12 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <Badge className="px-3 py-1 text-sm" variant="outline">Planes</Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Potencia tu sitio web con IA
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                  Elige el plan que mejor se adapte a las necesidades de tu negocio.
                  Todos los planes incluyen actualizaciones gratuitas y soporte técnico.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:gap-8">
                {plans.map((plan) => (
                  <Card key={plan.id} className={`flex flex-col justify-between h-full ${plan.id === recommendedPlanId ? 'border-primary shadow-lg shadow-primary/20 dark:shadow-primary/10 relative' : ''}`}>
                    {plan.id === recommendedPlanId && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white py-1 px-4 rounded-full text-sm font-medium">
                        Recomendado
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">
                          {plan.price === 0 ? 'Gratis' : formatCurrency(plan.price, plan.currency)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-500 dark:text-gray-400 ml-2">/{plan.interval}</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant={plan.id === recommendedPlanId ? "default" : "outline"}
                        disabled={!!checkoutInProgress}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {checkoutInProgress === plan.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            {plan.price === 0 ? 'Comenzar Gratis' : 'Suscribirse'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Todos los precios están en dólares canadienses (CAD). 
                Las suscripciones se renuevan automáticamente al final del período. 
                Puedes cancelar en cualquier momento desde tu panel de control.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start space-y-2">
                <h3 className="text-lg font-bold">Preguntas frecuentes</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  ¿Puedo cambiar de plan más adelante?
                </p>
                <p>
                  Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplicarán al siguiente período de facturación.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-2">
                <h3 className="text-lg font-bold">Soporte técnico</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  ¿Qué tipo de soporte ofrecen?
                </p>
                <p>
                  Todos los planes incluyen soporte por email. Los planes Profesional y Empresarial incluyen soporte prioritario.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-2">
                <h3 className="text-lg font-bold">Reembolsos</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  ¿Cuál es la política de reembolsos?
                </p>
                <p>
                  Ofrecemos un reembolso completo dentro de los primeros 14 días si no estás satisfecho con nuestro servicio.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}