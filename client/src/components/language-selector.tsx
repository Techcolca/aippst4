import { useLanguage } from "@/context/language-context";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

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
          className={language === "fr" ? "bg-muted" : ""}
          onClick={() => changeLanguage("fr")}
        >
          {t("language.fr")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={language === "es" ? "bg-muted" : ""}
          onClick={() => changeLanguage("es")}
        >
          {t("language.es")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={language === "en" ? "bg-muted" : ""}
          onClick={() => changeLanguage("en")}
        >
          {t("language.en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}