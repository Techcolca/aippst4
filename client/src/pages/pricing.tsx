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

// Inicializar Stripe con la clave pública - manejar gracefully si falta la clave
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

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
  originalPrice?: number;
  promotionalPrice?: number;
  campaignInfo?: {
    remainingSpots: number;
    maxSubscribers: number;
    promotionalMonths: number;
  };
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0
  }).format(amount / 100); // Convertir centavos a dólares
};

export default function PricingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [checkoutInProgress, setCheckoutInProgress] = useState<string | null>(null);
  const [billingType, setBillingType] = useState<'monthly' | 'annual'>('monthly');

  // Obtener los planes de precios de la API con el idioma actual
  const { data: allPlans = [], isLoading } = useQuery<PricingPlan[]>({
    queryKey: ['/api/pricing/plans', i18n.language],
    queryFn: async () => {
      const response = await fetch(`/api/pricing/plans?lang=${i18n.language}`);
      if (!response.ok) throw new Error('Failed to fetch pricing plans');
      return response.json();
    },
    retry: false,
    staleTime: 15 * 60 * 1000, // 15 minutos - evitar refetch frecuente
    refetchOnWindowFocus: false, // No refetch al cambiar ventana
    refetchOnReconnect: false   // No refetch al reconectar
  });
  
  // Helper para detectar planes anuales (usando isAnnual o interval)
  const isAnnualPlan = (plan: PricingPlan) => 
    plan.isAnnual === true || plan.interval === 'year' || plan.id?.endsWith('_annual') || false;

  // Deduplicar planes por ID para seguridad defensiva contra API duplicada
  const uniquePlans = allPlans.filter((plan, index, self) => 
    self.findIndex(p => p.id === plan.id) === index
  );
  
  // Filtrar y ordenar los planes según la selección de facturación (mensual o anual)
  const plans = uniquePlans.filter(plan => 
    billingType === 'annual' ? isAnnualPlan(plan) : !isAnnualPlan(plan)
  ).sort((a, b) => {
    // Plan gratuito siempre primero
    if (a.price === 0 && b.price !== 0) return -1;
    if (b.price === 0 && a.price !== 0) return 1;
    // Resto ordenado por precio ascendente
    return a.price - b.price;
  });

  // Función para iniciar el proceso de checkout
  const handleSubscribe = async (planId: string) => {
    try {
      if (!user) {
        // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
        toast({
          title: t('pricing.login_required'),
          description: t('pricing.login_description'),
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
          title: result.success ? t('pricing.success') : t('pricing.error'),
          description: result.message || t('pricing.free_plan_activated'),
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
        title: t('pricing.error'),
        description: t('pricing.process_error'),
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
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
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
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : (
              <div className={`grid gap-6 justify-items-center max-w-6xl mx-auto ${
                plans.length <= 3 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 place-content-center' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
                {plans.map((plan) => (
                  <Card key={plan.id} className={`flex flex-col justify-between h-full w-full ${plan.id === recommendedPlanId ? 'border-primary shadow-lg shadow-primary/20 dark:shadow-primary/10 relative' : ''}`}>
                    {plan.id === recommendedPlanId && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white py-1 px-4 rounded-full text-sm font-medium">
                        {t('pricing.recommended')}
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{t(`pricing.plan_${plan.id}.name`, plan.name)}</CardTitle>
                      <CardDescription>{t(`pricing.plan_${plan.id}.description`, plan.description)}</CardDescription>
                      <div className="mt-4">
                        {(plan.discount ?? 0) > 0 && (plan.originalPrice ?? 0) > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                              {formatCurrency(plan.originalPrice, plan.currency)}
                            </span>
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                              -{plan.discount}% OFF
                            </span>
                          </div>
                        )}
                        <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {plan.id.includes('enterprise') ? t('pricing.contact_us') :
                           plan.id.includes('free') ? t('pricing.free') :
                           formatCurrency(plan.promotionalPrice || plan.price, plan.currency)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-500 dark:text-gray-400 ml-2">/{t(`pricing.${plan.interval}`)}</span>
                        )}
                        {plan.campaignInfo && (
                          <div className="mt-2 text-sm text-orange-600 dark:text-orange-400 font-medium">
                            ⚡ {t('pricing.spots_remaining', { 
                              remaining: plan.campaignInfo.remainingSpots, 
                              total: plan.campaignInfo.maxSubscribers 
                            })}
                          </div>
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
                        className={`w-full ${(plan.discount ?? 0) > 0 ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' : ''}`}
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
                            {plan.id.includes('enterprise') ? (
                              t('pricing.contact_us')
                            ) : (plan.discount ?? 0) > 0 ? (
                              isAnnualPlan(plan) ? t('pricing.take_annual_offer') : t('pricing.take_offer')
                            ) : (
                              plan.price === 0 && !plan.id.includes('enterprise') ? t('pricing.start_free') : t('pricing.subscribe')
                            )}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      {plan.campaignInfo && plan.campaignInfo.promotionalMonths < 12 && !isAnnualPlan(plan) && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {plan.id.includes('enterprise') ? 
                            t('pricing.discount_duration', {
                              discount: plan.discount,
                              months: plan.campaignInfo.promotionalMonths
                            }) :
                            t('pricing.promotional_price_duration', {
                              months: plan.campaignInfo.promotionalMonths
                            })
                          }
                        </p>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                {t('pricing.pricing_note')}
              </p>
              {/* Mostrar información de campaña activa si existe */}
              {plans.some(plan => plan.campaignInfo) && (
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
                    🚀 {t('pricing.limited_launch_offer')}
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300">
                    {t('pricing.spots_left_of_total', {
                      remaining: plans.find(p => p.campaignInfo)?.campaignInfo?.remainingSpots ?? 0,
                      total: plans.find(p => p.campaignInfo)?.campaignInfo?.maxSubscribers ?? 0
                    })}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    ⏰ {t('pricing.take_advantage_unique_prices')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
              <div className="flex flex-col items-center text-center space-y-3 px-4 max-w-sm">
                <h3 className="text-lg font-bold">{t('pricing.faq.title')}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('pricing.faq.q1')}
                </p>
                <p className="text-sm">
                  {t('pricing.faq.a1')}
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 px-4 max-w-sm">
                <h3 className="text-lg font-bold">{t('pricing.support.title')}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('pricing.support.q1')}
                </p>
                <p className="text-sm">
                  {t('pricing.support.a1')}
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3 px-4 max-w-sm">
                <h3 className="text-lg font-bold">{t('pricing.security.title')}</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('pricing.security.q1')}
                </p>
                <p className="text-sm">
                  {t('pricing.security.a1')}
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