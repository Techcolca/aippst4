import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

export default function CheckoutForm() {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Check for payment status from URL query parameter (return from redirect)
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage(t('paymentSucceeded'));
          setSucceeded(true);
          break;
        case 'processing':
          setMessage(t('paymentProcessing'));
          break;
        case 'requires_payment_method':
          setMessage(t('paymentFailed'));
          break;
        default:
          setMessage(t('paymentError'));
          break;
      }
    });
  }, [stripe, t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/dashboard/subscription/success`,
      },
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`.
      const errorMessage = error.type === "card_error" || error.type === "validation_error"
        ? error.message
        : t('unexpectedError');
      
      setMessage(errorMessage);
      toast({
        title: t('paymentFailed'),
        description: errorMessage,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  if (succeeded) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="text-xl font-semibold">{t('paymentSucceeded')}</h3>
        <p className="text-muted-foreground">{t('thankYouForSubscription')}</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          {t('goToDashboard')}
        </Button>
      </div>
    );
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
          </div>
        </div>
      )}
      
      <PaymentElement id="payment-element" />
      
      <Button 
        disabled={isLoading || !stripe || !elements} 
        type="submit" 
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('processing')}
          </>
        ) : (
          t('payNow')
        )}
      </Button>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>{t('securePaymentInfo')}</p>
      </div>
    </form>
  );
}