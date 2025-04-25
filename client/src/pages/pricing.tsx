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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

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
  isAnnual?: boolean;
  discount?: number;
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
  const { t } = useTranslation();
  const [checkoutInProgress, setCheckoutInProgress] = useState<string | null>(null);
  const [billingType, setBillingType] = useState<'monthly' | 'annual'>('monthly');

  // Obtener los planes de precios de la API
  const { data: allPlans = [], isLoading } = useQuery<PricingPlan[]>({
    queryKey: ['/api/pricing/plans'],
    retry: false
  });
  
  // Filtrar los planes según la selección de facturación (mensual o anual)
  const plans = allPlans.filter(plan => 
    billingType === 'monthly' 
      ? !plan.isAnnual
      : plan.isAnnual || plan.id === 'free' // Mantener el plan gratuito en ambas vistas
  );

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
        
        // Redirigir a la página de login con redirect a checkout
        window.location.href = `/login?redirect=/checkout/${planId}`;
        return;
      }

      setCheckoutInProgress(planId);
      
      // Si es el plan gratuito, procesarlo directamente
      if (planId === 'free') {
        const response = await fetch('/api/subscription/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            planId,
            billingType
          }),
        });

        const result = await response.json();
        
        toast({
          title: result.success ? "Éxito" : "Error",
          description: result.message || "Plan gratuito activado con éxito",
          variant: result.success ? "default" : "destructive",
        });
        
        // Redirigir al dashboard
        if (result.success) {
          window.location.href = '/dashboard';
        }
      } else {
        // Para planes pagos, redirigir a la página de checkout
        window.location.href = `/checkout/${planId}`;
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
                <Badge className="px-3 py-1 text-sm" variant="outline">{t('pricing.plans')}</Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t('pricing.title')}
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                  {t('pricing.subtitle')}
                </p>
              </div>

              {/* Selector de tipo de facturación */}
              <div className="flex items-center justify-center space-x-4 mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-full">
                <span className={`text-sm font-medium ${billingType === 'monthly' ? 'text-primary' : 'text-gray-500'}`}>
                  {t('pricing.monthly_billing')}
                </span>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="billing-toggle"
                    checked={billingType === 'annual'}
                    onCheckedChange={(checked) => setBillingType(checked ? 'annual' : 'monthly')}
                  />
                  <Label htmlFor="billing-toggle" className="sr-only">
                    {t('pricing.toggle_billing')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${billingType === 'annual' ? 'text-primary' : 'text-gray-500'}`}>
                    {t('pricing.annual_billing')}
                  </span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
                    {t('pricing.save_percentage')}
                  </Badge>
                </div>
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
                        {t('pricing.recommended')}
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{t(`pricing.plan_${plan.id}.name`, plan.name)}</CardTitle>
                      <CardDescription>{t(`pricing.plan_${plan.id}.description`, plan.description)}</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">
                          {plan.price === 0 ? t('pricing.free') : formatCurrency(plan.price, plan.currency)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-500 dark:text-gray-400 ml-2">/{t(`pricing.${plan.interval}`)}</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {t(`pricing.plan_${plan.id}.feature_${index}`, feature)}
                            </span>
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
                            {t('pricing.processing')}
                          </>
                        ) : (
                          <>
                            {plan.price === 0 ? t('pricing.start_free') : t('pricing.subscribe')}
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
                {t('pricing.pricing_note')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start space-y-2">
                <h3 className="text-lg font-bold">{t('pricing.faq.title')}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('pricing.faq.q1')}
                </p>
                <p>
                  {t('pricing.faq.a1')}
                </p>
              </div>
              <div className="flex flex-col items-start space-y-2">
                <h3 className="text-lg font-bold">{t('pricing.support.title')}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('pricing.support.q1')}
                </p>
                <p>
                  {t('pricing.support.a1')}
                </p>
              </div>
              <div className="flex flex-col items-start space-y-2">
                <h3 className="text-lg font-bold">{t('pricing.refund.title')}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('pricing.refund.q1')}
                </p>
                <p>
                  {t('pricing.refund.a1')}
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