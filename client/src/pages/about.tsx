import { useTranslation } from "react-i18next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Globe, Zap } from "lucide-react";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              {t('about.title')}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <CardTitle>{t('about.mission.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('about.mission.description')}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Target className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <CardTitle>{t('about.vision.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('about.vision.description')}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Globe className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <CardTitle>{t('about.global.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('about.global.description')}
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <CardTitle>{t('about.innovation.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('about.innovation.description')}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="mt-16 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                {t('about.story.title')}
              </h2>
              <div className="max-w-4xl mx-auto text-lg text-gray-700 dark:text-gray-300 space-y-6">
                <p>{t('about.story.paragraph1')}</p>
                <p>{t('about.story.paragraph2')}</p>
                <p>{t('about.story.paragraph3')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}