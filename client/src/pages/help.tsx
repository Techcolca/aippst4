import { useTranslation } from "react-i18next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Book, MessageCircle, Settings, Code, CreditCard, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Help() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: Book,
      title: t('help.categories.getting_started.title'),
      description: t('help.categories.getting_started.description'),
      articles: [
        t('help.categories.getting_started.article1'),
        t('help.categories.getting_started.article2'),
        t('help.categories.getting_started.article3'),
        t('help.categories.getting_started.article4')
      ]
    },
    {
      icon: Settings,
      title: t('help.categories.configuration.title'),
      description: t('help.categories.configuration.description'),
      articles: [
        t('help.categories.configuration.article1'),
        t('help.categories.configuration.article2'),
        t('help.categories.configuration.article3'),
        t('help.categories.configuration.article4')
      ]
    },
    {
      icon: Code,
      title: t('help.categories.integration.title'),
      description: t('help.categories.integration.description'),
      articles: [
        t('help.categories.integration.article1'),
        t('help.categories.integration.article2'),
        t('help.categories.integration.article3'),
        t('help.categories.integration.article4')
      ]
    },
    {
      icon: CreditCard,
      title: t('help.categories.billing.title'),
      description: t('help.categories.billing.description'),
      articles: [
        t('help.categories.billing.article1'),
        t('help.categories.billing.article2'),
        t('help.categories.billing.article3'),
        t('help.categories.billing.article4')
      ]
    },
    {
      icon: MessageCircle,
      title: t('help.categories.troubleshooting.title'),
      description: t('help.categories.troubleshooting.description'),
      articles: [
        t('help.categories.troubleshooting.article1'),
        t('help.categories.troubleshooting.article2'),
        t('help.categories.troubleshooting.article3'),
        t('help.categories.troubleshooting.article4')
      ]
    },
    {
      icon: Users,
      title: t('help.categories.account.title'),
      description: t('help.categories.account.description'),
      articles: [
        t('help.categories.account.article1'),
        t('help.categories.account.article2'),
        t('help.categories.account.article3'),
        t('help.categories.account.article4')
      ]
    }
  ];

  const popularArticles = [
    t('help.popular.article1'),
    t('help.popular.article2'),
    t('help.popular.article3'),
    t('help.popular.article4'),
    t('help.popular.article5')
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              {t('help.title')}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              {t('help.subtitle')}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder={t('help.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Popular Articles */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                {t('help.popular.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularArticles.map((article, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{article}</CardTitle>
                      <Badge variant="secondary">{t('help.popular.badge')}</Badge>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                {t('help.categories.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <IconComponent className="h-8 w-8 text-primary-600" />
                          <CardTitle className="text-xl">{category.title}</CardTitle>
                        </div>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {category.articles.map((article, articleIndex) => (
                            <li key={articleIndex}>
                              <a href="#" className="text-primary-600 hover:text-primary-800 text-sm">
                                {article}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-16">
              <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-primary-900 dark:text-primary-100">
                    {t('help.contact_support.title')}
                  </CardTitle>
                  <CardDescription className="text-primary-700 dark:text-primary-300">
                    {t('help.contact_support.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                      <Link href="/contact">
                        {t('help.contact_support.contact_button')}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="mailto:support@aipps.ca">
                        {t('help.contact_support.email_button')}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}