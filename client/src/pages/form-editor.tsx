import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, ArrowLeft, Eye, Settings, Code, Layout, ArrowUp, ArrowDown, Share2 } from 'lucide-react';
import Header from '@/components/header';

// Tipos para el formulario
interface FieldOption {
  label: string;
  value?: string;
}

interface FormField {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: (string | FieldOption)[];
  defaultValue?: string;
}

interface FormStructure {
  fields: FormField[];
  submitButtonText: string;
}

interface FormStyling {
  theme: 'light' | 'dark' | 'auto';
  fontFamily: string;
  primaryColor: string;
  borderRadius: string;
  spacing: string;
}

interface FormSettings {
  redirectUrl: string;
  sendEmailNotification: boolean;
  emailRecipients: string;
  successMessage: string;
  captcha: boolean;
  storeResponses: boolean;
}

interface FormData {
  title: string;
  description: string;
  slug: string;
  type: string;
  published: boolean;
  language: string;
  structure: FormStructure;
  styling: FormStyling;
  settings: FormSettings;
}

interface FieldData {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required: boolean;
  options: (string | FieldOption)[];
  defaultValue: string;
}

// Función para traducir etiquetas de campos dinámicamente
const translateFieldLabel = (originalLabel: string, language: string): string => {
  const translations: Record<string, Record<string, string>> = {
    es: {
      'Name': 'Nombre',
      'First Name': 'Nombre',
      'Last Name': 'Apellido', 
      'Email': 'Correo electrónico',
      'Phone': 'Teléfono',
      'Company': 'Empresa',
      'Message': 'Mensaje',
      'Subject': 'Asunto',
      'How did you hear about us?': '¿Cómo te enteraste de nosotros?',
      'Interests': 'Intereses',
      'Budget': 'Presupuesto',
      'Project Details': 'Detalles del proyecto',
      'Rating': 'Calificación',
      'Feedback': 'Comentarios',
      'Suggestions': 'Sugerencias',
      'Event Name': 'Nombre del evento',
      'Number of Participants': 'Número de participantes',
      'Event Date': 'Fecha del evento',
      'Submit': 'Enviar',
      'Tu nombre': 'Tu nombre',
      'tu@email.com': 'tu@email.com',
      'Redes sociales': 'Redes sociales',
      'Búsqueda en Google': 'Búsqueda en Google',
      'Recomendación': 'Recomendación',
      'Otro': 'Otro'
    },
    en: {
      // Traducciones ES -> EN
      'Nombre': 'Name',
      'Correo electrónico': 'Email',
      'Teléfono': 'Phone',
      'Empresa': 'Company',
      'Mensaje': 'Message',
      'Asunto': 'Subject',
      '¿Cómo te enteraste de nosotros?': 'How did you hear about us?',
      'Intereses': 'Interests',
      'Presupuesto': 'Budget',
      'Detalles del proyecto': 'Project Details',
      'Calificación': 'Rating',
      'Comentarios': 'Feedback',
      'Sugerencias': 'Suggestions',
      'Nombre del evento': 'Event Name',
      'Número de participantes': 'Number of Participants',
      'Fecha del evento': 'Event Date',
      'Enviar': 'Submit',
      'Tu nombre': 'Your name',
      'tu@email.com': 'you@email.com',
      'Redes sociales': 'Social media',
      'Búsqueda en Google': 'Google search',
      'Recomendación': 'Recommendation',
      'Otro': 'Other',
      
      // Traducciones FR -> EN (CRÍTICAS - estas faltaban)
      'Nom': 'Name',
      'Email': 'Email',
      'Téléphone': 'Phone',
      'Entreprise': 'Company',
      'Message': 'Message',
      'Sujet': 'Subject',
      'Comment avez-vous entendu parler de nous?': 'How did you hear about us?',
      'Intérêts': 'Interests',
      'Budget': 'Budget',
      'Détails du projet': 'Project Details',
      'Évaluation': 'Rating',
      'Commentaires': 'Feedback',
      'Suggestions': 'Suggestions',
      'Nom de l\'événement': 'Event Name',
      'Nombre de participants': 'Number of Participants',
      'Date de l\'événement': 'Event Date',
      'Soumettre': 'Submit',
      'Votre nom': 'Your name',
      'vous@email.com': 'you@email.com',
      'Réseaux sociaux': 'Social media',
      'Recherche Google': 'Google search',
      'Recommandation': 'Recommendation',
      'Autre': 'Other'
    },
    fr: {
      'Name': 'Nom',
      'Nombre': 'Nom',
      'Email': 'Email',
      'Correo electrónico': 'Email',
      'Phone': 'Téléphone',
      'Teléfono': 'Téléphone',
      'Company': 'Entreprise',
      'Empresa': 'Entreprise',
      'Message': 'Message',
      'Mensaje': 'Message',
      'Subject': 'Sujet',
      'Asunto': 'Sujet',
      'How did you hear about us?': 'Comment avez-vous entendu parler de nous?',
      '¿Cómo te enteraste de nosotros?': 'Comment avez-vous entendu parler de nous?',
      'Interests': 'Intérêts',
      'Intereses': 'Intérêts',
      'Budget': 'Budget',
      'Presupuesto': 'Budget',
      'Project Details': 'Détails du projet',
      'Detalles del proyecto': 'Détails du projet',
      'Rating': 'Évaluation',
      'Calificación': 'Évaluation',
      'Feedback': 'Commentaires',
      'Comentarios': 'Commentaires',
      'Suggestions': 'Suggestions',
      'Sugerencias': 'Suggestions',
      'Event Name': 'Nom de l\'événement',
      'Nombre del evento': 'Nom de l\'événement',
      'Number of Participants': 'Nombre de participants',
      'Número de participantes': 'Nombre de participants',
      'Event Date': 'Date de l\'événement',
      'Fecha del evento': 'Date de l\'événement',
      'Submit': 'Soumettre',
      'Enviar': 'Soumettre',
      'Tu nombre': 'Votre nom',
      'Your name': 'Votre nom',
      'tu@email.com': 'vous@email.com',
      'you@email.com': 'vous@email.com',
      'Redes sociales': 'Réseaux sociaux',
      'Social media': 'Réseaux sociaux',
      'Búsqueda en Google': 'Recherche Google',
      'Google search': 'Recherche Google',
      'Recomendación': 'Recommandation',
      'Recommendation': 'Recommandation',
      'Otro': 'Autre',
      'Other': 'Autre'
    }
  };

  const langTranslations = translations[language] || translations.es;
  const translated = langTranslations[originalLabel] || originalLabel;
  console.log(`Traduciendo "${originalLabel}" a ${language}: "${translated}"`);
  return translated;
};

// Función para traducir placeholders
const translatePlaceholder = (originalPlaceholder: string, language: string): string => {
  const translations: Record<string, Record<string, string>> = {
    es: {
      'Your name': 'Tu nombre',
      'you@email.com': 'tu@email.com',
      'Tu nombre': 'Tu nombre',
      'tu@email.com': 'tu@email.com'
    },
    en: {
      'Tu nombre': 'Your name',
      'tu@email.com': 'you@email.com',
      'Your name': 'Your name',
      'you@email.com': 'you@email.com',
      // FR -> EN (CRÍTICAS - estas faltaban)
      'Votre nom': 'Your name',
      'vous@email.com': 'you@email.com'
    },
    fr: {
      'Tu nombre': 'Votre nom',
      'Your name': 'Votre nom',
      'tu@email.com': 'vous@email.com',
      'you@email.com': 'vous@email.com'
    }
  };

  const langTranslations = translations[language] || translations.es;
  return langTranslations[originalPlaceholder] || originalPlaceholder;
};

const FormEditor = () => {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/forms/:id/edit');
  const formId = parseInt(params?.id || '0');
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  
  // Estado para el idioma seleccionado en el editor
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'es');
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    slug: '',
    type: 'contact',
    published: true,
    language: i18n.language || 'es',
    structure: {
      fields: [],
      submitButtonText: t('formEditor.form_types.contact') || 'Enviar'
    },
    styling: {
      theme: 'light',
      fontFamily: 'Inter',
      primaryColor: '#3B82F6',
      borderRadius: 'md',
      spacing: 'md'
    },
    settings: {
      redirectUrl: '',
      sendEmailNotification: false,
      emailRecipients: '',
      successMessage: t('formEditor.form_saved') || 'Gracias por tu envío',
      captcha: false,
      storeResponses: true
    }
  });

  // Función para aplicar traducciones a todos los campos del formulario
  const applyTranslationsToForm = (formData: FormData, language: string): FormData => {
    console.log("--- APLICANDO TRADUCCIONES ---");
    console.log("Idioma objetivo:", language);
    console.log("Campos originales:", formData.structure.fields);

    const translatedFields = formData.structure.fields.map((field, index) => {
      const originalLabel = field.label;
      const originalPlaceholder = field.placeholder;
      
      const translatedLabel = translateFieldLabel(field.label, language);
      const translatedPlaceholder = field.placeholder ? translatePlaceholder(field.placeholder, language) : '';
      
      console.log(`Campo ${index}:`, {
        original: { label: originalLabel, placeholder: originalPlaceholder },
        translated: { label: translatedLabel, placeholder: translatedPlaceholder }
      });

      const translatedOptions = field.options ? field.options.map(option => {
        if (typeof option === 'string') {
          const translated = translateFieldLabel(option, language);
          console.log(`Opción: "${option}" -> "${translated}"`);
          return translated;
        } else {
          const translated = {
            ...option,
            label: translateFieldLabel(option.label, language)
          };
          console.log(`Opción objeto: "${option.label}" -> "${translated.label}"`);
          return translated;
        }
      }) : [];

      return {
        ...field,
        label: translatedLabel,
        placeholder: translatedPlaceholder,
        options: translatedOptions
      };
    });

    const translatedSubmitButton = translateFieldLabel(formData.structure.submitButtonText || 'Submit', language);
    console.log(`Botón enviar: "${formData.structure.submitButtonText}" -> "${translatedSubmitButton}"`);

    const result = {
      ...formData,
      language: language,
      structure: {
        ...formData.structure,
        fields: translatedFields,
        submitButtonText: translatedSubmitButton
      }
    };

    console.log("Resultado final:", result);
    return result;
  };
  
  // Estado para el modal de edición de campos
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [currentEditingField, setCurrentEditingField] = useState(-1);
  const [fieldData, setFieldData] = useState<FieldData>({
    label: '',
    name: '',
    type: 'text',
    placeholder: '',
    required: false,
    options: [],
    defaultValue: ''
  });
  
  // Obtener datos del formulario
  const { data: form, isLoading, isError } = useQuery<FormData>({
    queryKey: [`/api/forms/${formId}`],
    enabled: !!formId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Cargar datos del formulario y configurar idioma inicial
  useEffect(() => {
    if (form) {
      const parsedData = parseFormData(form);
      setFormData(parsedData);
      // Configurar el idioma seleccionado basado en el formulario cargado
      if (form.language && form.language !== selectedLanguage) {
        setSelectedLanguage(form.language);
      }
    }
  }, [form]);

  // Manejar cambio de idioma del formulario (independiente del idioma de la UI)
  const handleLanguageChange = (language: string) => {
    console.log("=== CAMBIO DE IDIOMA FORMULARIO ===");
    console.log("Idioma anterior:", selectedLanguage);
    console.log("Idioma nuevo:", language);
    console.log("Datos actuales del formulario:", formData);
    
    // Actualizar el idioma seleccionado
    setSelectedLanguage(language);
    
    // Aplicar traducciones inmediatamente a los datos actuales
    if (formData.structure && formData.structure.fields) {
      console.log("Aplicando traducciones...");
      const translatedForm = applyTranslationsToForm(formData, language);
      console.log("Formulario traducido:", translatedForm);
      setFormData(translatedForm);
    } else {
      console.log("No hay campos para traducir");
    }
  };

  // Actualizar formulario
  const updateFormMutation = useMutation({
    mutationFn: (data: any) => {
      // Usar apiRequest de queryClient que ya maneja la autenticación correctamente
      return apiRequest('PUT', `/api/forms/${formId}`, data)
        .then(res => {
          if (!res.ok) throw new Error('Error al actualizar el formulario');
          return res.json();
        });
    },
    onSuccess: () => {
      // Invalidar tanto el formulario específico como la lista general
      queryClient.invalidateQueries({ queryKey: [`/api/forms/${formId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      toast({
        title: 'Formulario actualizado',
        description: 'Los cambios han sido guardados correctamente'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el formulario',
        variant: 'destructive'
      });
    }
  });

  // Helper para convertir la respuesta de la API en un objeto con los tipos correctos
  const parseFormData = (apiForm: any): FormData => {
    return {
      title: apiForm?.title || '',
      description: apiForm?.description || '',
      slug: apiForm?.slug || '',
      type: apiForm?.type || 'contact',
      published: apiForm?.published || false,
      language: apiForm?.language || 'es',
      structure: apiForm?.structure || { fields: [], submitButtonText: 'Enviar' },
      styling: {
        theme: (apiForm?.styling?.theme as FormStyling['theme']) || 'light',
        fontFamily: apiForm?.styling?.fontFamily || 'Inter',
        primaryColor: apiForm?.styling?.primaryColor || '#3B82F6',
        borderRadius: apiForm?.styling?.borderRadius || 'md',
        spacing: apiForm?.styling?.spacing || 'md'
      },
      settings: {
        redirectUrl: apiForm?.settings?.redirectUrl || '',
        sendEmailNotification: apiForm?.settings?.sendEmailNotification || false,
        emailRecipients: apiForm?.settings?.emailRecipients || '',
        successMessage: apiForm?.settings?.successMessage || 'Gracias por tu envío',
        captcha: apiForm?.settings?.captcha || false,
        storeResponses: apiForm?.settings?.storeResponses || true
      }
    };
  };



  // Guardar cambios
  const handleSaveForm = () => {
    const dataToSave = {
      ...formData,
      language: selectedLanguage // Asegurar que se incluya el idioma seleccionado
    };
    console.log("Guardando formulario con datos:", dataToSave);
    updateFormMutation.mutate(dataToSave);
  };

  // Volver a la lista de formularios
  const handleBack = () => {
    navigate('/dashboard?tab=forms');
  };
  
  // Mover un campo hacia arriba (intercambiar con el anterior)
  const handleMoveFieldUp = (index: number) => {
    if (index <= 0) return; // No se puede mover el primer elemento hacia arriba
    
    const updatedFields = [...formData.structure.fields];
    // Intercambiar posiciones
    [updatedFields[index-1], updatedFields[index]] = [updatedFields[index], updatedFields[index-1]];
    
    // Crear un nuevo objeto con los datos actualizados
    const updatedFormData = {
      ...formData,
      structure: {
        ...formData.structure,
        fields: updatedFields
      }
    };
    
    // Actualizar el estado
    setFormData(updatedFormData);
    
    // Guardar automáticamente con los datos actualizados
    console.log("Guardando formulario automáticamente después de mover campo hacia arriba");
    updateFormMutation.mutate(updatedFormData);
    
    toast({
      title: "Campo reordenado",
      description: "El campo se ha movido hacia arriba"
    });
  };
  
  // Mover un campo hacia abajo (intercambiar con el siguiente)
  const handleMoveFieldDown = (index: number) => {
    if (index >= formData.structure.fields.length - 1) return; // No se puede mover el último elemento hacia abajo
    
    const updatedFields = [...formData.structure.fields];
    // Intercambiar posiciones
    [updatedFields[index], updatedFields[index+1]] = [updatedFields[index+1], updatedFields[index]];
    
    // Crear un nuevo objeto con los datos actualizados
    const updatedFormData = {
      ...formData,
      structure: {
        ...formData.structure,
        fields: updatedFields
      }
    };
    
    // Actualizar el estado
    setFormData(updatedFormData);
    
    // Guardar automáticamente con los datos actualizados
    console.log("Guardando formulario automáticamente después de mover campo hacia abajo");
    updateFormMutation.mutate(updatedFormData);
    
    toast({
      title: "Campo reordenado",
      description: "El campo se ha movido hacia abajo"
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando formulario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>No se pudo cargar el formulario</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">El formulario solicitado no existe o no tienes permisos para acceder.</p>
              <Button onClick={handleBack} className="w-full">
                Volver a la lista de formularios
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="container max-w-7xl mx-auto py-6 space-y-6">
        {/* Barra de herramientas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">{formData.title || 'Editor de Formulario'}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  // Guardar antes de previsualizar para asegurar que todos los cambios están aplicados
                  // Usar un enfoque basado en promesas para asegurar que la mutación se complete
                  try {
                    console.log("Guardando cambios antes de previsualizar");
                    await updateFormMutation.mutateAsync(formData);
                    console.log("Cambios guardados exitosamente, navegando a vista previa");
                    
                    // Invalidar la caché para forzar una recarga fresca en el componente de vista previa
                    queryClient.invalidateQueries({ queryKey: [`/api/forms/${formId}`] });
                    
                    // Navegar después de que la mutación se complete exitosamente
                    navigate(`/forms/${formId}`);
                  } catch (error) {
                    console.error("Error al guardar el formulario antes de previsualizar:", error);
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "No se pudieron guardar los cambios antes de previsualizar"
                    });
                  }
                }}
                disabled={updateFormMutation.isPending}
              >
                {updateFormMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Previsualizar
                  </>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={async () => {
                  try {
                    // Guardar primero
                    await updateFormMutation.mutateAsync(formData);
                    
                    // Abrir en una nueva pestaña
                    const url = `${window.location.origin}/forms/${formId}?t=${Date.now()}`;
                    window.open(url, '_blank');
                    
                    toast({
                      title: "Formulario guardado",
                      description: "Se ha abierto la vista previa en una nueva pestaña"
                    });
                  } catch (error) {
                    console.error("Error al guardar el formulario:", error);
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "No se pudo guardar el formulario"
                    });
                  }
                }}
                disabled={updateFormMutation.isPending}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Nueva pestaña
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={async () => {
                  try {
                    // Guardar primero
                    await updateFormMutation.mutateAsync(formData);
                    
                    // Navegar a la página de integración
                    navigate(`/forms/${formId}/integrate`);
                    
                    toast({
                      title: "Formulario guardado",
                      description: "Ahora puedes integrar tu formulario"
                    });
                  } catch (error) {
                    console.error("Error al guardar el formulario:", error);
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "No se pudo guardar el formulario"
                    });
                  }
                }}
                disabled={updateFormMutation.isPending}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {t('formEditor.integrate')}
              </Button>
            </div>
            
            <Button
              size="sm"
              disabled={updateFormMutation.isPending}
              onClick={handleSaveForm}
            >
              {updateFormMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('formEditor.saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('formEditor.save_changes')}
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Pestañas de edición */}
        <Tabs defaultValue="content">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="content">
              <Layout className="h-4 w-4 mr-2" />
              {t('formEditor.content')}
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Eye className="h-4 w-4 mr-2" />
              {t('formEditor.appearance')}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              {t('formEditor.settings')}
            </TabsTrigger>
          </TabsList>
          
          {/* Pestaña de Contenido */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('formEditor.basic_info')}</CardTitle>
                <CardDescription>
                  {t('formEditor.basic_info_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t('formEditor.form_title')}</Label>
                    <Input 
                      id="title" 
                      value={formData.title} 
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder={t('formEditor.form_title_placeholder')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">{t('formEditor.unique_id')}</Label>
                    <Input 
                      id="slug" 
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value.replace(/\s+/g, '-').toLowerCase()})}
                      placeholder={t('formEditor.unique_id_placeholder')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">{t('formEditor.description')}</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description || ''} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder={t('formEditor.description_placeholder')}
                    rows={3}
                  />
                </div>

                {/* Selector de idioma para traducción dinámica */}
                <div className="space-y-2">
                  <Label htmlFor="language">{t('form_language', 'Idioma del formulario')}</Label>
                  <Select 
                    value={selectedLanguage} 
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('formEditor.select_language', 'Seleccionar idioma')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="published" 
                    checked={formData.published} 
                    onCheckedChange={(checked) => setFormData({...formData, published: checked})}
                  />
                  <Label htmlFor="published">
                    {formData.published ? t('formEditor.form_published') : t('formEditor.form_draft')}
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">{t('formEditor.form_type')}</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('formEditor.select_type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contact">{t('formEditor.form_types.contact')}</SelectItem>
                      <SelectItem value="lead">{t('formEditor.form_types.lead')}</SelectItem>
                      <SelectItem value="survey">{t('formEditor.form_types.survey')}</SelectItem>
                      <SelectItem value="feedback">{t('formEditor.form_types.feedback')}</SelectItem>
                      <SelectItem value="registration">{t('formEditor.form_types.registration')}</SelectItem>
                      <SelectItem value="waitlist">{t('formEditor.form_types.waitlist')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('formEditor.form_fields')}</CardTitle>
                <CardDescription>
                  {t('formEditor.form_fields_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Lista de campos existentes */}
                  {formData.structure.fields.map((field, index) => (
                    <div key={index} className="p-4 border rounded-md bg-muted/20">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">{field.label || t('formEditor.field_no_label')}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t('formEditor.type')}: {field.type === 'text' ? t('formEditor.field_types.text') : 
                                  field.type === 'email' ? t('formEditor.field_types.email') : 
                                  field.type === 'number' ? t('formEditor.field_types.number') : 
                                  field.type === 'textarea' ? t('formEditor.field_types.textarea') : 
                                  field.type === 'select' ? t('formEditor.field_types.select') : 
                                  field.type === 'checkbox' ? t('formEditor.field_types.checkbox') : 
                                  field.type === 'radio' ? t('formEditor.field_types.radio') : 
                                  t('formEditor.field_types.other')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title={t('formEditor.move_up')}
                            onClick={() => handleMoveFieldUp(index)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title={t('formEditor.move_down')}
                            onClick={() => handleMoveFieldDown(index)}
                            disabled={index === formData.structure.fields.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Editar campo existente
                              setCurrentEditingField(index);
                              setShowFieldModal(true);
                              setFieldData({
                                label: field.label || '',
                                name: field.name || '',
                                type: field.type || 'text',
                                placeholder: field.placeholder || '',
                                required: field.required || false,
                                options: field.options || [],
                                defaultValue: field.defaultValue || ''
                              });
                            }}
                          >
                            {t('formEditor.edit')}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              // Eliminar campo
                              const updatedFields = [...formData.structure.fields];
                              updatedFields.splice(index, 1);
                              
                              // Crear un nuevo objeto con los datos actualizados
                              const updatedFormData = {
                                ...formData,
                                structure: {
                                  ...formData.structure,
                                  fields: updatedFields
                                }
                              };
                              
                              // Actualizar el estado
                              setFormData(updatedFormData);
                              
                              // Guardar automáticamente con los datos actualizados
                              console.log("Guardando formulario automáticamente después de eliminar campo");
                              setTimeout(() => {
                                updateFormMutation.mutate(updatedFormData);
                              }, 100);
                            }}
                          >
                            {t('formEditor.delete')}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {field.placeholder && (
                          <div>
                            <span className="text-muted-foreground">{t('formEditor.placeholder')}:</span> {field.placeholder}
                          </div>
                        )}
                        {field.name && (
                          <div>
                            <span className="text-muted-foreground">{t('formEditor.name')}:</span> {field.name}
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">{t('formEditor.required')}:</span> {field.required ? t('common.yes') : t('common.no')}
                        </div>
                      </div>
                      
                      {field.options && field.options.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-muted-foreground">{t('formEditor.options')}:</span>
                          <div className="grid grid-cols-2 gap-1 mt-1">
                            {field.options.map((option, i) => (
                              <div key={i} className="text-sm bg-muted/30 px-2 py-1 rounded">
                                {typeof option === 'object' && option.label ? option.label : String(option)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {formData.structure.fields.length === 0 && (
                    <div className="text-center p-8 border border-dashed rounded-md">
                      <p className="text-muted-foreground mb-4">
                        {t('formEditor.no_fields_configured')}
                      </p>
                    </div>
                  )}
                  
                  {/* Botón para agregar nuevo campo */}
                  <Button 
                    onClick={() => {
                      // Agregar nuevo campo
                      setCurrentEditingField(-1);
                      setShowFieldModal(true);
                      console.log("Iniciando creación de un nuevo campo");
                      setFieldData({
                        label: '',
                        name: '',
                        type: 'text',
                        placeholder: '',
                        required: false,
                        options: [],
                        defaultValue: ''
                      });
                    }}
                    className="w-full"
                  >
                    {t('formEditor.add_field')}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Modal para agregar/editar campos */}
            {showFieldModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>
                      {currentEditingField === -1 ? t('formEditor.add_field') : t('formEditor.edit_field')}
                    </CardTitle>
                    <CardDescription>
                      {t('formEditor.configure_field_properties')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="field-label">{t('formEditor.label')}</Label>
                      <Input 
                        id="field-label" 
                        value={fieldData.label} 
                        onChange={(e) => setFieldData({...fieldData, label: e.target.value})}
                        placeholder={t('formEditor.label_placeholder')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="field-name">{t('formEditor.technical_name')}</Label>
                      <Input 
                        id="field-name" 
                        value={fieldData.name} 
                        onChange={(e) => setFieldData({...fieldData, name: e.target.value.replace(/\s+/g, '_').toLowerCase()})}
                        placeholder={t('formEditor.technical_name_placeholder')}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('formEditor.technical_name_desc')}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="field-type">{t('formEditor.field_type')}</Label>
                      <Select 
                        value={fieldData.type} 
                        onValueChange={(value) => setFieldData({...fieldData, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('formEditor.select_type')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">{t('formEditor.field_types.text')}</SelectItem>
                          <SelectItem value="textarea">{t('formEditor.field_types.textarea')}</SelectItem>
                          <SelectItem value="email">{t('formEditor.field_types.email')}</SelectItem>
                          <SelectItem value="number">{t('formEditor.field_types.number')}</SelectItem>
                          <SelectItem value="tel">{t('formEditor.field_types.tel')}</SelectItem>
                          <SelectItem value="select">{t('formEditor.field_types.select')}</SelectItem>
                          <SelectItem value="checkbox">{t('formEditor.field_types.checkbox')}</SelectItem>
                          <SelectItem value="radio">{t('formEditor.field_types.radio')}</SelectItem>
                          <SelectItem value="date">{t('formEditor.field_types.date')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {(fieldData.type === 'text' || fieldData.type === 'textarea' || 
                     fieldData.type === 'email' || fieldData.type === 'tel' || 
                     fieldData.type === 'number' || fieldData.type === 'date') && (
                      <div className="space-y-2">
                        <Label htmlFor="field-placeholder">{t('formEditor.placeholder_text')}</Label>
                        <Input 
                          id="field-placeholder" 
                          value={fieldData.placeholder} 
                          onChange={(e) => setFieldData({...fieldData, placeholder: e.target.value})}
                          placeholder={t('formEditor.placeholder_example')}
                        />
                      </div>
                    )}
                    
                    {(fieldData.type === 'select' || fieldData.type === 'radio') && (
                      <div className="space-y-2">
                        <Label htmlFor="field-options">{t('formEditor.options')}</Label>
                        <div className="space-y-2">
                          {fieldData.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input 
                                value={typeof option === 'string' ? option : option.label || ''} 
                                onChange={(e) => {
                                  const newOptions = [...fieldData.options];
                                  if (typeof option === 'string') {
                                    newOptions[index] = e.target.value;
                                  } else {
                                    newOptions[index] = { ...option, label: e.target.value };
                                  }
                                  setFieldData({...fieldData, options: newOptions});
                                }}
                                placeholder={`${t('formEditor.option')} ${index + 1}`}
                              />
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={() => {
                                  const newOptions = [...fieldData.options];
                                  newOptions.splice(index, 1);
                                  setFieldData({...fieldData, options: newOptions});
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setFieldData({
                                ...fieldData, 
                                options: [...fieldData.options, '']
                              });
                            }}
                          >
                            {t('formEditor.add_option')}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="field-required" 
                        checked={fieldData.required} 
                        onCheckedChange={(checked) => setFieldData({...fieldData, required: checked})}
                      />
                      <Label htmlFor="field-required">
                        {t('formEditor.required_field')}
                      </Label>
                    </div>
                  </CardContent>
                  <div className="flex justify-end space-x-2 p-6 border-t">
                    <Button 
                      variant="outline"
                      onClick={() => setShowFieldModal(false)}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      onClick={() => {
                        // Si el nombre está vacío, generarlo a partir de la etiqueta
                        const fieldName = fieldData.name || 
                                         fieldData.label.toLowerCase().replace(/\s+/g, '_');
                        
                        const newField = {
                          label: fieldData.label,
                          name: fieldName,
                          type: fieldData.type,
                          placeholder: fieldData.placeholder,
                          required: fieldData.required,
                          options: fieldData.type === 'select' || fieldData.type === 'radio' ? 
                                  fieldData.options : undefined,
                          defaultValue: fieldData.defaultValue
                        };
                        
                        if (currentEditingField === -1) {
                          // Agregar nuevo campo
                          console.log("Añadiendo nuevo campo al formulario:", newField);
                          // Crear un nuevo objeto con los datos actualizados
                          const updatedFormData = {
                            ...formData,
                            structure: {
                              ...formData.structure,
                              fields: [...formData.structure.fields, newField]
                            }
                          };
                          
                          // Actualizar el estado
                          setFormData(updatedFormData);
                          console.log("Estructura del formulario después de añadir:", updatedFormData);
                          
                          // Cerrar modal
                          setShowFieldModal(false);
                          
                          // Guardar automáticamente con los datos actualizados
                          console.log("Guardando formulario automáticamente después de añadir campo");
                          updateFormMutation.mutate(updatedFormData);
                        } else {
                          // Actualizar campo existente
                          const updatedFields = [...formData.structure.fields];
                          updatedFields[currentEditingField] = newField;
                          
                          // Crear un nuevo objeto con los datos actualizados
                          const updatedFormData = {
                            ...formData,
                            structure: {
                              ...formData.structure,
                              fields: updatedFields
                            }
                          };
                          
                          // Actualizar el estado
                          setFormData(updatedFormData);
                          
                          // Cerrar modal
                          setShowFieldModal(false);
                          
                          // Guardar automáticamente con los datos actualizados
                          console.log("Guardando formulario automáticamente después de editar campo");
                          updateFormMutation.mutate(updatedFormData);
                        }
                      }}
                    >
                      {currentEditingField === -1 ? t('formEditor.add') : t('formEditor.save_changes')}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
          
          {/* Pestaña de Apariencia */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('formEditor.visual_style')}</CardTitle>
                <CardDescription>
                  {t('formEditor.visual_style_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">{t('formEditor.theme')}</Label>
                  <Select 
                    value={formData.styling?.theme || 'light'} 
                    onValueChange={(value: 'light' | 'dark' | 'auto') => setFormData({
                      ...formData, 
                      styling: {...formData.styling, theme: value}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('formEditor.select_theme')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t('formEditor.themes.light')}</SelectItem>
                      <SelectItem value="dark">{t('formEditor.themes.dark')}</SelectItem>
                      <SelectItem value="auto">{t('formEditor.themes.auto')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">{t('formEditor.primary_color')}</Label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      id="primaryColor" 
                      value={formData.styling?.primaryColor || '#3B82F6'} 
                      onChange={(e) => setFormData({
                        ...formData, 
                        styling: {...formData.styling, primaryColor: e.target.value}
                      })}
                      className="h-10 w-10 rounded border border-input"
                    />
                    <Input 
                      value={formData.styling?.primaryColor || '#3B82F6'} 
                      onChange={(e) => setFormData({
                        ...formData, 
                        styling: {...formData.styling, primaryColor: e.target.value}
                      })}
                      className="w-32"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fontFamily">{t('formEditor.typography')}</Label>
                  <Select 
                    value={formData.styling?.fontFamily || 'Inter'} 
                    onValueChange={(value) => setFormData({
                      ...formData, 
                      styling: {...formData.styling, fontFamily: value}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una tipografía" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="borderRadius">{t('formEditor.border_radius')}</Label>
                  <Select 
                    value={formData.styling?.borderRadius || 'md'} 
                    onValueChange={(value) => setFormData({
                      ...formData, 
                      styling: {...formData.styling, borderRadius: value}
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('formEditor.select_radius')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('formEditor.radius.none')}</SelectItem>
                      <SelectItem value="sm">{t('formEditor.radius.small')}</SelectItem>
                      <SelectItem value="md">{t('formEditor.radius.medium')}</SelectItem>
                      <SelectItem value="lg">{t('formEditor.radius.large')}</SelectItem>
                      <SelectItem value="full">{t('formEditor.radius.full')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Pestaña de Ajustes */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('formEditor.configuration')}</CardTitle>
                <CardDescription>
                  {t('formEditor.advanced_settings')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="successMessage">{t('formEditor.success_message')}</Label>
                  <Textarea 
                    id="successMessage" 
                    value={formData.settings?.successMessage || t('formEditor.default_success_message')} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      settings: {...formData.settings, successMessage: e.target.value}
                    })}
                    placeholder={t('formEditor.success_message_placeholder')}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="redirectUrl">{t('formEditor.redirect_url')}</Label>
                  <Input 
                    id="redirectUrl" 
                    value={formData.settings?.redirectUrl || ''} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      settings: {...formData.settings, redirectUrl: e.target.value}
                    })}
                    placeholder="https://ejemplo.com/gracias"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="captcha" 
                    checked={formData.settings?.captcha || false} 
                    onCheckedChange={(checked) => setFormData({
                      ...formData, 
                      settings: {...formData.settings, captcha: checked}
                    })}
                  />
                  <Label htmlFor="captcha">
                    Habilitar CAPTCHA para prevenir spam
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="storeResponses" 
                    checked={formData.settings?.storeResponses !== false} 
                    onCheckedChange={(checked) => setFormData({
                      ...formData, 
                      settings: {...formData.settings, storeResponses: checked}
                    })}
                  />
                  <Label htmlFor="storeResponses">
                    Almacenar respuestas en la plataforma
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="sendEmailNotification" 
                    checked={formData.settings?.sendEmailNotification || false} 
                    onCheckedChange={(checked) => setFormData({
                      ...formData, 
                      settings: {...formData.settings, sendEmailNotification: checked}
                    })}
                  />
                  <Label htmlFor="sendEmailNotification">
                    Recibir notificaciones por correo electrónico
                  </Label>
                </div>
                
                {formData.settings?.sendEmailNotification && (
                  <div className="space-y-2">
                    <Label htmlFor="emailRecipients">Destinatarios de correo</Label>
                    <Input 
                      id="emailRecipients" 
                      value={formData.settings.emailRecipients || ''} 
                      onChange={(e) => setFormData({
                        ...formData, 
                        settings: {...formData.settings, emailRecipients: e.target.value}
                      })}
                      placeholder="email@ejemplo.com, otro@ejemplo.com"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          

        </Tabs>
      </div>
    </div>
  );
};

export default FormEditor;