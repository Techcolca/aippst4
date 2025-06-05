import { useTranslation } from "react-i18next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              {t('privacy.title')}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('privacy.subtitle')}
            </p>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('privacy.data_collection.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{t('privacy.data_collection.description')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('privacy.data_collection.item1')}</li>
                    <li>{t('privacy.data_collection.item2')}</li>
                    <li>{t('privacy.data_collection.item3')}</li>
                    <li>{t('privacy.data_collection.item4')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('privacy.data_usage.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{t('privacy.data_usage.description')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('privacy.data_usage.item1')}</li>
                    <li>{t('privacy.data_usage.item2')}</li>
                    <li>{t('privacy.data_usage.item3')}</li>
                    <li>{t('privacy.data_usage.item4')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('privacy.data_sharing.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{t('privacy.data_sharing.description')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('privacy.data_sharing.item1')}</li>
                    <li>{t('privacy.data_sharing.item2')}</li>
                    <li>{t('privacy.data_sharing.item3')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('privacy.security.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{t('privacy.security.description')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('privacy.security.item1')}</li>
                    <li>{t('privacy.security.item2')}</li>
                    <li>{t('privacy.security.item3')}</li>
                    <li>{t('privacy.security.item4')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>{t('privacy.user_rights.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{t('privacy.user_rights.description')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('privacy.user_rights.item1')}</li>
                    <li>{t('privacy.user_rights.item2')}</li>
                    <li>{t('privacy.user_rights.item3')}</li>
                    <li>{t('privacy.user_rights.item4')}</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('privacy.contact.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{t('privacy.contact.description')}</p>
                  <p className="mt-4">
                    <strong>Email:</strong> privacy@aipps.ca<br />
                    <strong>{t('privacy.contact.address')}:</strong> Montreal, QC, Canada
                  </p>
                </CardContent>
              </Card>

              <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
                <p>{t('privacy.last_updated')}: January 2025</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}