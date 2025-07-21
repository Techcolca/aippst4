import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useState, useEffect } from "react";

export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || "fr");

  const changeLanguage = (lng: string) => {
    console.log('LanguageSelector: Changing language to:', lng);
    i18n.changeLanguage(lng).then(() => {
      console.log('LanguageSelector: Language changed successfully to:', lng);
      setCurrentLang(lng);
      localStorage.setItem("i18nextLng", lng);
      // Force a reload to ensure all components update
      window.location.reload();
    });
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