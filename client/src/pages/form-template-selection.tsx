import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { FormTemplateSelector } from "@/components/forms/form-template-selector";
import { useAuth } from "@/context/auth-context";

export default function FormTemplateSelectionPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isUserRoute] = useRoute("/user/:path*");

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
        <h1 className="text-3xl font-bold">Crear nuevo formulario</h1>
        <p className="text-muted-foreground mt-2">
          Selecciona una plantilla o comienza desde cero para crear tu formulario personalizado.
        </p>
      </div>

      <FormTemplateSelector />
    </div>
  );
}