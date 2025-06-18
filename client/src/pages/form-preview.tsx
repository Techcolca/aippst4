import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, PenSquare } from 'lucide-react';
import Header from '@/components/header';
import { useToast } from '@/hooks/use-toast';

// Definir tipo para los datos del formulario
interface FormData {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  type: string | null;
  published: boolean | null;
  structure: {
    fields: Array<{
      label: string;
      name: string;
      type: string;
      placeholder?: string;
      required: boolean;
      options?: (string | { label: string; value: string })[];
      defaultValue?: string;
      helpText?: string;
      id?: string; // ID opcional para el elemento DOM
      rows?: number; // Número de filas para textarea
    }>;
    submitButtonText: string;
  };
  styling: {
    theme: 'light' | 'dark' | 'auto';
    fontFamily: string;
    primaryColor: string;
    borderRadius: string;
    spacing: string;
  };
  settings: {
    redirectUrl: string;
    sendEmailNotification: boolean;
    emailRecipients: string;
    successMessage: string;
    captcha: boolean;
    storeResponses: boolean;
  };
  createdAt: Date | null;
  updatedAt: Date | null;
  userId: number;
  responseCount: number | null;
}

const FormPreview = () => {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/forms/:id');
  const formId = parseInt(params?.id || '0');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Sistema de detección de idioma y traducción
  const detectLanguage = (form: any) => {
    if (!form || !form.structure?.fields) return 'es';
    
    const allText = [
      form.title || '',
      form.description || '',
      ...form.structure.fields.map((f: any) => f.label || ''),
      ...form.structure.fields.map((f: any) => f.placeholder || ''),
      form.structure.submitButtonText || ''
    ].join(' ').toLowerCase();

    const frenchWords = ['nom', 'email', 'comment', 'avez-vous', 'entendu', 'parler', 'nous', 'rejoindre', 'liste', 'attente', 'modèle', 'pour', 'capturer', 'utilisateurs', 'réseaux', 'sociaux', 'recherche', 'recommandation', 'autre'];
    const englishWords = ['name', 'email', 'how', 'did', 'you', 'hear', 'about', 'us', 'join', 'waitlist', 'template', 'capture', 'users', 'social', 'media', 'google', 'search', 'recommendation', 'other'];
    const spanishWords = ['nombre', 'correo', 'como', 'nos', 'conociste', 'unirse', 'plantilla', 'capturar', 'usuarios', 'redes', 'sociales', 'busqueda', 'recomendacion', 'otro'];

    const frenchScore = frenchWords.filter(word => allText.includes(word)).length;
    const englishScore = englishWords.filter(word => allText.includes(word)).length;
    const spanishScore = spanishWords.filter(word => allText.includes(word)).length;

    if (frenchScore > englishScore && frenchScore > spanishScore) return 'fr';
    if (englishScore > spanishScore) return 'en';
    return 'es';
  };

  const getTranslations = (language: string) => {
    const translations = {
      es: {
        completeInfo: 'Por favor complete la información solicitada para comenzar.',
        acceptTerms: 'Acepto los términos y condiciones',
        submit: 'Enviar',
        formSubmitted: '¡Formulario enviado!',
        thankYou: 'Gracias por tu envío',
        sendAnother: 'Enviar otra respuesta',
        selectOption: 'Seleccionar...'
      },
      en: {
        completeInfo: 'Please complete the requested information to get started.',
        acceptTerms: 'I accept the terms and conditions',
        submit: 'Submit',
        formSubmitted: 'Form submitted!',
        thankYou: 'Thank you for your submission',
        sendAnother: 'Submit another response',
        selectOption: 'Select...'
      },
      fr: {
        completeInfo: 'Veuillez compléter les informations demandées pour commencer.',
        acceptTerms: 'J\'accepte les termes et conditions',
        submit: 'Envoyer',
        formSubmitted: 'Formulaire envoyé!',
        thankYou: 'Merci pour votre envoi',
        sendAnother: 'Envoyer une autre réponse',
        selectOption: 'Sélectionner...'
      }
    };
    return translations[language as keyof typeof translations] || translations.es;
  };
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    structure: {
      fields: [] as any[],
      submitButtonText: 'Enviar'
    },
    styling: {
      theme: 'light',
      fontFamily: 'Inter',
      primaryColor: '#3B82F6',
      borderRadius: 'md',
      spacing: 'md'
    }
  });
  
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Refrescar datos cuando el componente se monta o cuando se cambia manualmente
  useEffect(() => {
    const loadFormData = async () => {
      if (formId) {
        console.log(`Forzando la carga de datos del formulario ${formId} (intento ${refreshTrigger})`);
        
        try {
          // Invalidar caché para forzar una recarga fresca
          await queryClient.invalidateQueries({ queryKey: [`/api/forms/${formId}`] });
          
          // Opcional: intentar cargar directamente con fetch si hay problemas
          if (refreshTrigger > 1) {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/forms/${formId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const freshData = await response.json();
              console.log("Datos obtenidos directamente:", freshData);
              // Actualizar caché manual
              queryClient.setQueryData([`/api/forms/${formId}`], freshData);
            }
          }
        } catch (error) {
          console.error("Error al refrescar datos del formulario:", error);
        }
      }
    };
    
    loadFormData();
  }, [formId, refreshTrigger, queryClient]);
  
  // Obtener datos del formulario
  const { data: form, isLoading, isError, refetch } = useQuery<FormData>({
    queryKey: [`/api/forms/${formId}`],
    enabled: !!formId,
    staleTime: 0, // Nunca usar caché
    gcTime: 0, // No almacenar en caché (en v5 cacheTime se llama gcTime)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 2000, // Refrescar cada 2 segundos mientras esté visible
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (form) {
      setFormData({
        title: form.title || '',
        description: form.description || '',
        structure: form.structure || { fields: [], submitButtonText: 'Enviar' },
        styling: form.styling || {
          theme: 'light',
          fontFamily: 'Inter',
          primaryColor: '#3B82F6',
          borderRadius: 'md',
          spacing: 'md'
        }
      });
      
      // Inicializar valores del formulario
      const initialValues: Record<string, any> = {};
      if (form.structure && form.structure.fields) {
        form.structure.fields.forEach((field: any) => {
          if (field.type === 'checkbox') {
            initialValues[field.name] = false;
          } else if (field.type === 'select') {
            initialValues[field.name] = field.options && field.options.length > 0 ? field.options[0].value : '';
          } else {
            initialValues[field.name] = '';
          }
        });
      }
      setFormValues(initialValues);
    }
  }, [form]);

  // Manejar cambios en los campos
  const handleFieldChange = (name: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // En una implementación real, aquí enviaríamos los datos al servidor
    console.log("Datos del formulario enviados:", formValues);
    
    // Mostrar mensaje de éxito
    setTimeout(() => {
      setFormValues({});
      window.scrollTo(0, 0);
    }, 500);
  };

  // Volver a la edición
  const handleEdit = () => {
    navigate(`/forms/${formId}/edit`);
  };

  // Volver a la lista de formularios
  const handleBack = () => {
    navigate('/dashboard?tab=forms');
  };

  // Obtener estilo CSS basado en la configuración
  const getFormStyle = () => {
    const { styling } = formData;
    const borderRadiusMap: Record<string, string> = {
      none: '0px',
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px'
    };
    
    const borderRadius = borderRadiusMap[styling.borderRadius || 'md'] || '0.375rem';
    
    return {
      fontFamily: styling.fontFamily || 'Inter, sans-serif',
      '--primary-color': styling.primaryColor || '#3B82F6',
      borderRadius,
      colorScheme: styling.theme || 'light'
    } as React.CSSProperties;
  };

  // Renderizar campo moderno con estilo de línea inferior
  const renderModernFormField = (field: FormData['structure']['fields'][0], index: number) => {
    const fieldId = field.id || field.name || `field-${index}`;
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
        return (
          <Input
            type={field.type}
            id={fieldId}
            name={field.name}
            placeholder={`${field.label}${field.required ? ' *' : ''}`}
            value={formValues[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 bg-transparent focus:border-cyan-400 focus:ring-0"
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            name={field.name}
            placeholder={`${field.label}${field.required ? ' *' : ''}`}
            value={formValues[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            rows={field.rows || 4}
            className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 bg-transparent focus:border-cyan-400 focus:ring-0"
          />
        );
        
      case 'select':
        return (
          <Select
            value={formValues[field.name] || ''}
            onValueChange={(value) => handleFieldChange(field.name, value)}
          >
            <SelectTrigger className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 bg-transparent focus:border-cyan-400 focus:ring-0">
              <SelectValue placeholder={field.label || 'Seleccionar...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options && field.options.map((option, i: number) => {
                const optionValue = typeof option === 'string' ? option : option.value || '';
                const optionLabel = typeof option === 'string' ? option : option.label || '';
                return (
                  <SelectItem key={i} value={optionValue}>
                    {optionLabel}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              checked={formValues[field.name] || false}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
            <Label htmlFor={fieldId} className="text-sm">
              {(() => {
                const detectedLang = detectLanguage(formData);
                const t = getTranslations(detectedLang);
                if (field.label.toLowerCase().includes('acepto') || field.label.toLowerCase().includes('términos')) {
                  return t.acceptTerms;
                }
                return field.label;
              })()}
            </Label>
          </div>
        );
        
      default:
        return (
          <Input
            type="text"
            id={fieldId}
            name={field.name}
            placeholder={`${field.label}${field.required ? ' *' : ''}`}
            value={formValues[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 bg-transparent focus:border-cyan-400 focus:ring-0"
          />
        );
    }
  };

  // Renderizar campo de formulario según su tipo (original para fallback)
  const renderFormField = (field: FormData['structure']['fields'][0], index: number) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
        return (
          <div className="space-y-2" key={index}>
            <Label htmlFor={field.id || field.name} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              type={field.type}
              id={field.id || field.name}
              name={field.name}
              placeholder={field.placeholder || ''}
              value={formValues[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
              className="w-full"
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );
        
      case 'textarea':
        return (
          <div className="space-y-2" key={index}>
            <Label htmlFor={field.id || field.name} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.id || field.name}
              name={field.name}
              placeholder={field.placeholder || ''}
              value={formValues[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
              rows={field.rows || 4}
              className="w-full"
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );
        
      case 'select':
        return (
          <div className="space-y-2" key={index}>
            <Label htmlFor={field.id || field.name} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formValues[field.name] || ''}
              onValueChange={(value) => handleFieldChange(field.name, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={field.placeholder || 'Seleccionar...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options && field.options.map((option, i: number) => {
                  // Manejar cuando la opción es un string o un objeto con label/value
                  const optionValue = typeof option === 'string' ? option : option.value || '';
                  const optionLabel = typeof option === 'string' ? option : option.label || '';
                  return (
                    <SelectItem key={i} value={optionValue}>
                      {optionLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-start space-x-2" key={index}>
            <Checkbox
              id={field.id || field.name}
              checked={formValues[field.name] || false}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={field.id || field.name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
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

  if (isError || !form) {
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
    <div className="flex flex-col min-h-screen" style={getFormStyle()}>
      <Header />
      
      <div className="container max-w-5xl mx-auto py-6 space-y-6">
        {/* Barra de herramientas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">Vista previa</h1>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                // Incrementar contador de refrescos para activar nueva carga
                setRefreshTrigger(prev => prev + 1);
                toast({
                  title: "Actualizando datos",
                  description: "Recargando información del formulario...",
                });
              }}
            >
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              <PenSquare className="h-4 w-4 mr-2" />
              Editar formulario
            </Button>
            
            <span className="text-xs text-muted-foreground">
              {formData.structure.fields.length} campo(s)
            </span>
          </div>
        </div>
        
        {/* Formulario con diseño moderno */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-100 to-blue-100 min-h-[600px] rounded-2xl p-6 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
              
              {/* Panel izquierdo - Hero */}
              <div className="bg-gradient-to-br from-blue-900 to-slate-900 p-12 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/20"></div>
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                    {formData.title || 'Comencemos con sus datos'}
                  </h2>
                  <p className="text-blue-100 text-lg leading-relaxed">
                    {formData.description || 'Complete este formulario para continuar con el proceso.'}
                  </p>
                </div>
              </div>
              
              {/* Panel derecho - Formulario */}
              <div className="p-12 flex flex-col justify-center">
                <div className="mb-8">
                  <p className="text-gray-600 text-lg">
                    {(() => {
                      const detectedLang = detectLanguage(formData);
                      const t = getTranslations(detectedLang);
                      return t.completeInfo;
                    })()}
                  </p>
                </div>
                
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">
                      {(() => {
                        const detectedLang = detectLanguage(formData);
                        const t = getTranslations(detectedLang);
                        return t.formSubmitted;
                      })()}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {(() => {
                        const detectedLang = detectLanguage(formData);
                        const t = getTranslations(detectedLang);
                        return form.settings?.successMessage || t.thankYou;
                      })()}
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSubmitted(false);
                        setFormValues({});
                      }}
                    >
                      {(() => {
                        const detectedLang = detectLanguage(formData);
                        const t = getTranslations(detectedLang);
                        return t.sendAnother;
                      })()}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {formData.structure.fields && formData.structure.fields.length > 0 ? (
                      <>
                        {/* Renderizar campos en grupos inteligentes */}
                        {(() => {
                          const fields = formData.structure.fields;
                          const shouldUseGroupLayout = fields.length >= 4;
                          let fieldIndex = 0;
                          const renderedFields = [];

                          while (fieldIndex < fields.length) {
                            const field = fields[fieldIndex];
                            const nextField = fields[fieldIndex + 1];

                            if (field.type === 'textarea' || field.type === 'select' || 
                                !shouldUseGroupLayout || 
                                (!nextField && fieldIndex % 2 === 0)) {
                              
                              renderedFields.push(
                                <div key={fieldIndex} className="modern-form-field">
                                  {renderModernFormField(field, fieldIndex)}
                                </div>
                              );
                              fieldIndex++;
                              
                            } else if (shouldUseGroupLayout && nextField && 
                                       field.type !== 'textarea' && field.type !== 'select' &&
                                       nextField.type !== 'textarea' && nextField.type !== 'select') {
                              
                              renderedFields.push(
                                <div key={fieldIndex} className="grid grid-cols-2 gap-4">
                                  <div className="modern-form-field">
                                    {renderModernFormField(field, fieldIndex)}
                                  </div>
                                  <div className="modern-form-field">
                                    {renderModernFormField(nextField, fieldIndex + 1)}
                                  </div>
                                </div>
                              );
                              fieldIndex += 2;
                              
                            } else {
                              renderedFields.push(
                                <div key={fieldIndex} className="modern-form-field">
                                  {renderModernFormField(field, fieldIndex)}
                                </div>
                              );
                              fieldIndex++;
                            }
                          }

                          return renderedFields;
                        })()}
                        
                        {/* Checkbox de términos y condiciones */}
                        <div className="flex items-center space-x-3 pt-4">
                          <Checkbox
                            id="terms"
                            checked={formValues.terms || false}
                            onCheckedChange={(checked) => handleFieldChange('terms', checked)}
                            className="accent-blue-500"
                          />
                          <Label htmlFor="terms" className="text-sm text-gray-600 leading-5">
                            {(() => {
                              const detectedLang = detectLanguage(formData);
                              const t = getTranslations(detectedLang);
                              return t.acceptTerms;
                            })()}
                          </Label>
                        </div>
                      </>
                    ) : (
                      // Campos de ejemplo con diseño moderno
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="modern-form-field">
                            <Input
                              type="text"
                              placeholder="Nombre *"
                              value={formValues.nombre || ''}
                              onChange={(e) => handleFieldChange('nombre', e.target.value)}
                              className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 bg-transparent focus:border-cyan-400 focus:ring-0"
                              required
                            />
                          </div>
                          <div className="modern-form-field">
                            <Input
                              type="text"
                              placeholder="Apellido *"
                              value={formValues.apellido || ''}
                              onChange={(e) => handleFieldChange('apellido', e.target.value)}
                              className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 bg-transparent focus:border-cyan-400 focus:ring-0"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="modern-form-field">
                          <Input
                            type="email"
                            placeholder="Correo Electrónico *"
                            value={formValues.email || ''}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-4 bg-transparent focus:border-cyan-400 focus:ring-0"
                            required
                          />
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="terms"
                            checked={formValues.terms || false}
                            onCheckedChange={(checked) => handleFieldChange('terms', checked)}
                            className="accent-blue-500"
                          />
                          <Label htmlFor="terms" className="text-sm text-gray-600 leading-5">
                            {(() => {
                              const detectedLang = detectLanguage(formData);
                              const t = getTranslations(detectedLang);
                              return t.acceptTerms;
                            })()}
                          </Label>
                        </div>
                      </>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-900 to-slate-900 hover:from-blue-800 hover:to-slate-800 text-white font-semibold py-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg text-sm uppercase tracking-wide"
                    >
                      {formData.structure.submitButtonText || 'ENVIAR'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPreview;