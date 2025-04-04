import { useEffect, useState } from 'react';
import { useLocation, useRoute, useRouter } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import CheckoutForm from '@/components/checkout/checkout-form';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  tier: string;
  interactionsLimit: number;
  isAnnual: boolean;
  discount?: number;
}

export default function Checkout() {
  const { t } = useTranslation();
  const [, params] = useRoute<{ planId: string }>('/checkout/:planId');
  const planId = params?.planId;
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PricingPlan | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  useEffect(() => {
    // Redirect to pricing page if no planId is specified
    if (!planId) {
      navigate('/pricing');
      return;
    }
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast({
        title: t('loginRequired'),
        description: t('loginToSubscribe'),
        variant: "destructive",
      });
      navigate('/login?redirect=/checkout/' + planId);
      return;
    }
    
    // Fetch plan details
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/pricing/plans');
        const allPlans = await response.json();
        
        const selectedPlan = allPlans.find((p: PricingPlan) => p.id.toLowerCase() === planId.toLowerCase());
        if (!selectedPlan) {
          toast({
            title: t('planNotFound'),
            description: t('planNotFoundDesc'),
            variant: "destructive",
          });
          navigate('/pricing');
          return;
        }
        
        setPlan(selectedPlan);
      } catch (error) {
        console.error('Error fetching plan:', error);
        toast({
          title: t('error'),
          description: t('errorFetchingPlan'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlan();
  }, [planId, isAuthenticated, navigate, toast, t]);
  
  const handleCheckout = async () => {
    if (!plan) return;
    
    try {
      setProcessingPayment(true);
      setPaymentError(null);
      
      // Get billing type from plan
      const billingType = plan.isAnnual ? 'annual' : 'monthly';
      
      // Create checkout session
      const response = await apiRequest('POST', '/api/subscription/checkout', {
        planId: plan.id,
        billingType
      });
      
      const result = await response.json();
      
      if (result.success && result.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.sessionUrl;
      } else if (result.success && result.sessionId) {
        // Use Elements and CheckoutForm for embedded checkout
        setSessionId(result.sessionId);
      } else {
        throw new Error(result.message || t('checkoutError'));
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      setPaymentError(error.message || t('checkoutError'));
      toast({
        title: t('paymentError'),
        description: error.message || t('checkoutError'),
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };
  
  // Format currency with appropriate symbol
  const formatCurrency = (amount: number, currency: string = 'cad') => {
    const currencySymbols: Record<string, string> = {
      cad: 'CA$',
      usd: '$',
      eur: '€',
      gbp: '£'
    };
    
    const symbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase();
    return `${symbol}${amount.toFixed(2)}`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4 p-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg">{t('loadingPlan')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">{t('planNotFound')}</CardTitle>
              <CardDescription>{t('planNotFoundDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => navigate('/pricing')}>{t('backToPricing')}</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>{t('orderSummary')}</CardTitle>
              <CardDescription>{t('reviewOrder')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <Badge variant={plan.isAnnual ? "secondary" : "outline"}>
                      {plan.isAnnual ? t('annual') : t('monthly')}
                    </Badge>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(plan.price, plan.currency)}
                    <span className="text-muted-foreground text-sm">/{plan.isAnnual ? t('year') : t('month')}</span>
                  </span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <h4 className="font-medium">{t('included')}</h4>
                <ul className="space-y-1 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex justify-between font-semibold">
                  <span>{t('total')}</span>
                  <span>
                    {formatCurrency(plan.price, plan.currency)}
                    <span className="text-muted-foreground text-sm">/{plan.isAnnual ? t('year') : t('month')}</span>
                  </span>
                </div>
                {plan.discount && plan.discount > 0 && (
                  <p className="text-sm text-emerald-600 mt-1">
                    {t('saveWithAnnual', { percent: plan.discount })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('payment')}</CardTitle>
              <CardDescription>{t('paymentSecure')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sessionId ? (
                // Show Stripe Elements form for embedded checkout
                <Elements stripe={stripePromise} options={{ clientSecret: sessionId }}>
                  <CheckoutForm />
                </Elements>
              ) : (
                <>
                  {paymentError && (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-sm text-red-600 dark:text-red-400">{paymentError}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <p>{t('proceedToCheckout')}</p>
                    <Button 
                      onClick={handleCheckout} 
                      className="w-full" 
                      disabled={processingPayment}
                    >
                      {processingPayment && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {t('payNow')} ({formatCurrency(plan.price, plan.currency)}/{plan.isAnnual ? t('year') : t('month')})
                    </Button>
                  </div>
                  
                  <div className="text-center space-y-2 text-sm text-muted-foreground">
                    <p>{t('securePayment')}</p>
                    <p>{t('billingPeriodInfo', { 
                      period: plan.isAnnual ? t('annually') : t('monthly') 
                    })}</p>
                    <p>{t('cancellationInfo')}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}