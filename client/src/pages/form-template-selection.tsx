import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { FormTemplateSelector } from "@/components/forms/form-template-selector";
import { useAuth } from "@/context/auth-context";
import { useTranslation } from "react-i18next";

export default function FormTemplateSelectionPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isUserRoute] = useRoute("/user/:path*");
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && !user && !isUserRoute) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation, isUserRoute]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("create_new_form", "Create New Form")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("select_template_description", "Select a template or start from scratch to create your custom form.")}
        </p>
      </div>

      <FormTemplateSelector />
    </div>
  );
}