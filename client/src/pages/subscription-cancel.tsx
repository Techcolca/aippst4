import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useTranslation } from 'react-i18next';

export default function SubscriptionCancel() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              {t('subscriptionCanceled')}
            </CardTitle>
            <CardDescription>{t('subscriptionCanceledDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md">
                <p className="text-amber-800 dark:text-amber-400">
                  {t('paymentCanceledInfo')}
                </p>
              </div>
              
              <div className="pt-2 space-y-2">
                <Button onClick={() => navigate('/pricing')} className="w-full">
                  {t('viewPlans')}
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  variant="outline"
                  className="w-full mt-2"
                >
                  {t('goToDashboard')}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  {t('subscriptionQuestions')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}