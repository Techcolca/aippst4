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

const FormPreview = () => {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/forms/:id');
  const formId = parseInt(params?.id || '0');
  const queryClient = useQueryClient();
  
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
  
  // Invalidar caché y refrescar datos al montar el componente
  useEffect(() => {
    if (formId) {
      console.log("Invalidando caché y recargando datos del formulario:", formId);
      queryClient.invalidateQueries({ queryKey: [`/api/forms/${formId}`] });
    }
  }, [formId, queryClient]);
  
  // Obtener datos del formulario
  const { data: form, isLoading, isError } = useQuery({
    queryKey: [`/api/forms/${formId}`],
    enabled: !!formId,
    staleTime: 0, // Siempre considerar datos obsoletos para forzar la recarga
    refetchOnWindowFocus: true, // Refrescar al enfocar la ventana
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

  // Renderizar campo de formulario según su tipo
  const renderFormField = (field: any, index: number) => {
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
                {field.options && field.options.map((option: any, i: number) => (
                  <SelectItem key={i} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Editar formulario
          </Button>
        </div>
        
        {/* Formulario */}
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{formData.title}</CardTitle>
            {formData.description && (
              <CardDescription>{formData.description}</CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            {submitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-center">¡Enviado con éxito!</h3>
                <p className="text-muted-foreground">
                  {form.settings?.successMessage || 'Gracias por tu envío. Hemos recibido tus datos correctamente.'}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSubmitted(false);
                    setFormValues({});
                  }}
                  className="mt-4"
                >
                  Enviar otra respuesta
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {formData.structure.fields && formData.structure.fields.length > 0 ? (
                  formData.structure.fields.map((field, index) => renderFormField(field, index))
                ) : (
                  // Campos de ejemplo si no hay campos definidos
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium">
                        Nombre <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        id="nombre"
                        name="nombre"
                        placeholder="Tu nombre completo"
                        value={formValues.nombre || ''}
                        onChange={(e) => handleFieldChange('nombre', e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Correo electrónico <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="tucorreo@ejemplo.com"
                        value={formValues.email || ''}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="mensaje" className="text-sm font-medium">
                        Mensaje
                      </Label>
                      <Textarea
                        id="mensaje"
                        name="mensaje"
                        placeholder="Escribe tu mensaje aquí"
                        value={formValues.mensaje || ''}
                        onChange={(e) => handleFieldChange('mensaje', e.target.value)}
                        rows={4}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acepto"
                        checked={formValues.acepto || false}
                        onCheckedChange={(checked) => handleFieldChange('acepto', checked)}
                        className="mt-1"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="acepto"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Acepto los términos y condiciones <span className="text-red-500">*</span>
                        </Label>
                      </div>
                    </div>
                  </>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full"
                  style={{ backgroundColor: formData.styling.primaryColor }}
                >
                  {formData.structure.submitButtonText || 'Enviar'}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between items-center border-t px-6 py-4">
            <div className="text-xs text-muted-foreground">
              Powered by AIPI
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default FormPreview;