import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/header';
import Footer from '@/components/footer';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';

export default function SubscriptionSuccess() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        setLoading(true);
        // Get the session_id from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (!sessionId) {
          setError(t('sessionIdMissing'));
          setLoading(false);
          return;
        }

        // Verify the subscription with the backend
        const response = await apiRequest('GET', `/api/subscription/verify?session_id=${sessionId}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || t('subscriptionVerificationFailed'));
        }

        setSubscription(data.subscription);
        toast({
          title: t('subscriptionSuccess'),
          description: t('subscriptionActivated'),
        });
      } catch (error: any) {
        console.error('Error verifying subscription:', error);
        setError(error.message || t('subscriptionVerificationFailed'));
        toast({
          title: t('subscriptionError'),
          description: error.message || t('subscriptionVerificationFailed'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    verifySubscription();
  }, [toast, t]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              {t('subscriptionSuccess')}
            </CardTitle>
            <CardDescription>{t('thankYouForSubscription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-6">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-lg">{t('verifyingSubscription')}</p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <Button onClick={() => navigate('/dashboard')} className="w-full">
                  {t('goToDashboard')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-md">
                  <p className="text-green-800 dark:text-green-400">
                    {t('subscriptionActivatedSuccess')}
                  </p>
                </div>
                
                {subscription && (
                  <div className="space-y-2 py-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{t('plan')}:</span>
                      <span>{subscription.plan}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{t('status')}:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {subscription.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{t('billingPeriod')}:</span>
                      <span>{subscription.interval}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{t('nextBilling')}:</span>
                      <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                
                <div className="pt-2 space-y-2">
                  <Button onClick={() => navigate('/dashboard')} className="w-full">
                    {t('goToDashboard')}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {t('subscriptionQuestions')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}