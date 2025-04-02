import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { useState, useEffect } from "react";
import frTranslation from "../locales/fr/translation.json";
import esTranslation from "../locales/es/translation.json";
import enTranslation from "../locales/en/translation.json";

// Inicializar i18next si no se ha hecho ya
if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources: {
      fr: {
        translation: frTranslation
      },
      es: {
        translation: esTranslation
      },
      en: {
        translation: enTranslation
      }
    },
    lng: localStorage.getItem("i18nextLng") || "fr", // Idioma predeterminado: francés
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false
    }
  });
}

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || "fr");

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLang(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("i18nextLng");
    if (savedLang) {
      i18n.changeLanguage(savedLang);
      setCurrentLang(savedLang);
    }
  }, [i18n]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{t("language.select")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={currentLang === "fr" ? "bg-muted" : ""}
          onClick={() => changeLanguage("fr")}
        >
          {t("language.fr")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={currentLang === "es" ? "bg-muted" : ""}
          onClick={() => changeLanguage("es")}
        >
          {t("language.es")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={currentLang === "en" ? "bg-muted" : ""}
          onClick={() => changeLanguage("en")}
        >
          {t("language.en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}