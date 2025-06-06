import { useTranslation } from "react-i18next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              {t('terms.title')}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('terms.subtitle')}
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('terms.acceptance.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{t('terms.acceptance.description')}</p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('terms.services.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{t('terms.services.description')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('terms.services.item1')}</li>
                    <li>{t('terms.services.item2')}</li>
                    <li>{t('terms.services.item3')}</li>
                    <li>{t('terms.services.item4')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('terms.user_obligations.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{t('terms.user_obligations.description')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('terms.user_obligations.item1')}</li>
                    <li>{t('terms.user_obligations.item2')}</li>
                    <li>{t('terms.user_obligations.item3')}</li>
                    <li>{t('terms.user_obligations.item4')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('terms.payment.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{t('terms.payment.description')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('terms.payment.item1')}</li>
                    <li>{t('terms.payment.item2')}</li>
                    <li>{t('terms.payment.item3')}</li>
                    <li>{t('terms.payment.item4')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('terms.intellectual_property.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{t('terms.intellectual_property.description')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('terms.intellectual_property.item1')}</li>
                    <li>{t('terms.intellectual_property.item2')}</li>
                    <li>{t('terms.intellectual_property.item3')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('terms.limitation.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{t('terms.limitation.description')}</p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('terms.termination.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{t('terms.termination.description')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('terms.termination.item1')}</li>
                    <li>{t('terms.termination.item2')}</li>
                    <li>{t('terms.termination.item3')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('terms.contact.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{t('terms.contact.description')}</p>
                  <p className="mt-4">
                    <strong>Email:</strong> legal@aipps.ca<br />
                    <strong>{t('terms.contact.address')}:</strong> Montreal, QC, Canada
                  </p>
                </CardContent>
              </Card>

              <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
                <p>{t('terms.last_updated')}: January 2025</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}