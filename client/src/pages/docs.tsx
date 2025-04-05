import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, Code, Building2, School, Headset, Rocket, BookOpen, 
  MessageSquare, BarChart, Users, Bot, File, FileText, Monitor, Smartphone, 
  ExternalLink, CheckCircle2, BarChart3, LineChart
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useTranslation } from "react-i18next";

export default function Documentation() {
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useTranslation();
  
  // Nuevas secciones para funcionalidades específicas
  const functionalityTabs = [
    "widget-integration", 
    "contextual-understanding", 
    "document-training", 
    "lead-capture", 
    "analytics", 
    "task-automation",
    "form-creation"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              {t("documentation.title")}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t("documentation.subtitle")}
            </p>
          </div>
        </section>
        
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4">
                <div className="sticky top-24 bg-white dark:bg-gray-900 border rounded-lg p-4">
                  <nav className="space-y-1">
                    <a 
                      href="#overview" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("overview"); }}
                      className={`block px-3 py-2 rounded-md ${activeTab === "overview" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <BookOpen className="w-5 h-5 mr-2" />
                        <span>{t("documentation.overview")}</span>
                      </div>
                    </a>
                    <a 
                      href="#features" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("features"); }}
                      className={`block px-3 py-2 rounded-md ${activeTab === "features" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <Rocket className="w-5 h-5 mr-2" />
                        <span>{t("documentation.features")}</span>
                      </div>
                    </a>

                    {/* Funcionalidades separadas como submenú */}
                    <a 
                      href="#widget-integration" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("widget-integration"); }}
                      className={`block px-3 py-2 pl-10 rounded-md ${activeTab === "widget-integration" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        <span>{t("documentation.widget_integration")}</span>
                      </div>
                    </a>
                    
                    <a 
                      href="#contextual-understanding" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("contextual-understanding"); }}
                      className={`block px-3 py-2 pl-10 rounded-md ${activeTab === "contextual-understanding" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <Database className="w-4 h-4 mr-2" />
                        <span>{t("documentation.contextual_understanding")}</span>
                      </div>
                    </a>
                    
                    <a 
                      href="#document-training" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("document-training"); }}
                      className={`block px-3 py-2 pl-10 rounded-md ${activeTab === "document-training" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <File className="w-4 h-4 mr-2" />
                        <span>{t("documentation.document_training")}</span>
                      </div>
                    </a>
                    
                    <a 
                      href="#lead-capture" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("lead-capture"); }}
                      className={`block px-3 py-2 pl-10 rounded-md ${activeTab === "lead-capture" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{t("documentation.lead_capture")}</span>
                      </div>
                    </a>
                    
                    <a 
                      href="#analytics" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("analytics"); }}
                      className={`block px-3 py-2 pl-10 rounded-md ${activeTab === "analytics" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <BarChart className="w-4 h-4 mr-2" />
                        <span>{t("documentation.analytics")}</span>
                      </div>
                    </a>
                    
                    <a 
                      href="#task-automation" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("task-automation"); }}
                      className={`block px-3 py-2 pl-10 rounded-md ${activeTab === "task-automation" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <Bot className="w-4 h-4 mr-2" />
                        <span>{t("documentation.task_automation")}</span>
                      </div>
                    </a>
                    
                    <a 
                      href="#form-creation" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("form-creation"); }}
                      className={`block px-3 py-2 pl-10 rounded-md ${activeTab === "form-creation" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        <span>{t("documentation.form_creation")}</span>
                      </div>
                    </a>
                    <a 
                      href="#education" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("education"); }}
                      className={`block px-3 py-2 rounded-md ${activeTab === "education" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <School className="w-5 h-5 mr-2" />
                        <span>{t("documentation.education")}</span>
                      </div>
                    </a>
                    <a 
                      href="#business" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("business"); }}
                      className={`block px-3 py-2 rounded-md ${activeTab === "business" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 mr-2" />
                        <span>{t("documentation.business")}</span>
                      </div>
                    </a>
                    <a 
                      href="#professional" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("professional"); }}
                      className={`block px-3 py-2 rounded-md ${activeTab === "professional" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <Headset className="w-5 h-5 mr-2" />
                        <span>{t("documentation.professional")}</span>
                      </div>
                    </a>
                    <a 
                      href="#implementation" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("implementation"); }}
                      className={`block px-3 py-2 rounded-md ${activeTab === "implementation" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <Code className="w-5 h-5 mr-2" />
                        <span>{t("documentation.implementation")}</span>
                      </div>
                    </a>
                  </nav>
                </div>
              </div>
              
              <div className="md:w-3/4">
                {activeTab === "overview" && (
                  <div id="overview" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t("documentation.overview.title")}</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          {t("documentation.overview.introduction")}
                        </p>
                        
                        <h3>{t("documentation.overview.problem_title")}</h3>
                        <p>
                          {t("documentation.overview.problem_description")}
                        </p>
                        <p>
                          {t("documentation.overview.solution_intro")}
                        </p>
                        <ul>
                          <li>{t("documentation.overview.solution_point_1")}</li>
                          <li>{t("documentation.overview.solution_point_2")}</li>
                          <li>{t("documentation.overview.solution_point_3")}</li>
                          <li>{t("documentation.overview.solution_point_4")}</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                          <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                          <h3 className="text-xl font-bold">{t("documentation.overview.card1_title")}</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t("documentation.overview.card1_text")}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                          <Database className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                          <h3 className="text-xl font-bold">{t("documentation.overview.card2_title")}</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t("documentation.overview.card2_text")}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                          <Users className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                          <h3 className="text-xl font-bold">{t("documentation.overview.card3_title")}</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t("documentation.overview.card3_text")}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                          <BarChart className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                          <h3 className="text-xl font-bold">{t("documentation.overview.card4_title")}</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {t("documentation.overview.card4_text")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-10">
                      <Button size="lg" asChild>
                        <Link href="/get-started">{t("documentation.overview.start_button")}</Link>
                      </Button>
                    </div>
                  </div>
                )}
                
                {activeTab === "features" && (
                  <div id="features" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t("documentation.features.title")}</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <h3>1. Integración Flexible con Sitios Web</h3>
                        <p>
                          AIPI ofrece dos modalidades de integración para adaptarse a las necesidades de cada institución:
                        </p>
                        
                        <h4>Widget Flotante (Burbuja):</h4>
                        <ul>
                          <li>Aparece discretamente en una esquina del sitio web</li>
                          <li>Permite acceso inmediato a la asistencia sin interrumpir la navegación</li>
                          <li>Ideal para consultas rápidas y soporte al visitante</li>
                        </ul>
                        
                        <h4>Pantalla Completa (Estilo ChatGPT):</h4>
                        <ul>
                          <li>Experiencia de chat inmersiva tipo ChatGPT</li>
                          <li>Historial de conversaciones accesible para los usuarios</li>
                          <li>Perfecto para interacciones más profundas y consultas complejas</li>
                        </ul>
                        
                        <h3>2. Comprensión Contextual del Contenido</h3>
                        <p>AIPI escanea y analiza automáticamente el contenido de su sitio web para:</p>
                        <ul>
                          <li>Proporcionar respuestas precisas basadas en la información oficial</li>
                          <li>Dirigir a los visitantes a las páginas específicas que contienen la información solicitada</li>
                          <li>Reducir la frustración de buscar información en múltiples secciones del sitio</li>
                        </ul>
                        
                        <h3>3. Entrenamiento Personalizado con Documentos Específicos</h3>
                        <p>La plataforma permite cargar y procesar:</p>
                        <ul>
                          <li>Documentos PDF (catálogos de cursos, folletos de programas, especificaciones de productos)</li>
                          <li>Archivos DOCX (preguntas frecuentes, políticas institucionales)</li>
                          <li>Hojas de cálculo Excel (horarios, tarifas, listas de programas)</li>
                          <li>Instrucciones específicas sobre el tono y estilo de las respuestas</li>
                        </ul>
                        
                        <h3>4. Captura de Leads y Seguimiento</h3>
                        <p>Una de las características más valiosas para instituciones educativas y empresas:</p>
                        <ul>
                          <li>Registro detallado de todas las conversaciones con visitantes</li>
                          <li>Identificación de consultas frecuentes y áreas de interés</li>
                          <li>Almacenamiento de información de contacto (con consentimiento del usuario)</li>
                          <li>Posibilidad de seguimiento posterior para ofrecer información adicional o servicios relacionados</li>
                        </ul>
                        
                        <h3>5. Análisis y Estadísticas Detalladas por Usuario</h3>
                        <p>El panel de control administrativo ofrece estadísticas personalizadas para cada cuenta de usuario:</p>
                        <ul>
                          <li>Métricas sobre número total de conversaciones de tus integraciones</li>
                          <li>Tasa de resolución de consultas específica de tu cuenta</li>
                          <li>Tiempo promedio de respuesta de tus asistentes virtuales</li>
                          <li>Tendencias en las consultas de tus visitantes</li>
                          <li>Rendimiento individualizado por tipo de integración</li>
                          <li>Análisis de temas y productos de mayor interés para tus usuarios</li>
                        </ul>
                        
                        <h3>6. Automatización de Tareas (Task Automation)</h3>
                        <p>El sistema de Task Automation de AIPI permite crear flujos de trabajo automatizados para manejar consultas repetitivas y tareas comunes sin intervención humana.</p>
                        
                        <h4>¿Qué es Task Automation?</h4>
                        <p>Task Automation es una funcionalidad avanzada que permite configurar respuestas automáticas y acciones predefinidas basadas en desencadenantes específicos. Estas automatizaciones permiten que su asistente virtual realice tareas complejas como:</p>
                        <ul>
                          <li>Responder automáticamente preguntas frecuentes con información detallada</li>
                          <li>Programar seguimientos basados en el interés mostrado por los visitantes</li>
                          <li>Proporcionar información preliminar antes de conectar con un representante humano</li>
                          <li>Recopilar datos específicos necesarios para procesos de admisión o ventas</li>
                          <li>Generar alertas para el equipo cuando se detecten consultas prioritarias</li>
                          <li>Clasificar automáticamente las consultas por departamento o área de interés</li>
                        </ul>
                        
                        <h4>Cómo Configurar una Task Automation</h4>
                        <p>Para crear una nueva automatización de tareas, siga estos pasos:</p>
                        <ol>
                          <li><strong>Acceda al Panel de Control:</strong> Inicie sesión y navegue a la pestaña "Task Automation" en su dashboard</li>
                          <li><strong>Cree una Nueva Automatización:</strong> Haga clic en el botón "Create New Automation" para abrir el formulario de configuración</li>
                          <li><strong>Defina la Información Básica:</strong>
                            <ul>
                              <li>Nombre: Asigne un nombre descriptivo a la automatización (ej. "Consultas sobre Admisiones")</li>
                              <li>Descripción: Detalle el propósito de esta automatización</li>
                              <li>Estado: Seleccione si la automatización estará activa, en pruebas o inactiva</li>
                            </ul>
                          </li>
                          <li><strong>Configure los Desencadenantes (Triggers):</strong> Determine qué condiciones activarán la automatización
                            <ul>
                              <li>Palabras clave específicas en las consultas de los usuarios</li>
                              <li>Categorías de preguntas identificadas por el sistema</li>
                              <li>Patrones específicos en la conversación</li>
                              <li>Horario (para respuestas fuera del horario de atención)</li>
                            </ul>
                          </li>
                          <li><strong>Defina las Acciones:</strong> Establezca qué acciones realizará el sistema cuando se active
                            <ul>
                              <li>Enviar respuestas predefinidas con información detallada</li>
                              <li>Recopilar datos del visitante (nombre, correo, teléfono)</li>
                              <li>Generar notificaciones para el equipo de atención</li>
                              <li>Transferir la conversación a un representante humano</li>
                              <li>Proporcionar enlaces a recursos específicos</li>
                            </ul>
                          </li>
                          <li><strong>Personalice la Experiencia:</strong> Ajuste la apariencia y comportamiento del asistente
                            <ul>
                              <li>Nombre del asistente para esta automatización</li>
                              <li>Mensaje de bienvenida personalizado</li>
                              <li>Colores y estilo visual</li>
                              <li>Base de conocimiento específica para esta automatización</li>
                            </ul>
                          </li>
                          <li><strong>Pruebe la Automatización:</strong> Active el modo de prueba para verificar su funcionamiento</li>
                          <li><strong>Active y Monitoree:</strong> Una vez verificado su correcto funcionamiento, active la automatización y supervise su rendimiento a través del panel de análisis</li>
                        </ol>
                        
                        <h4>Casos de Uso Comunes</h4>
                        <p>Las automatizaciones de tareas son especialmente útiles para:</p>
                        <ul>
                          <li><strong>Instituciones Educativas:</strong> Automatizar respuestas sobre fechas de admisión, requisitos, costos de matrícula y programas disponibles</li>
                          <li><strong>Comercios:</strong> Manejar consultas sobre disponibilidad de productos, precios, políticas de devolución y horarios de atención</li>
                          <li><strong>Servicios Profesionales:</strong> Responder a preguntas frecuentes sobre servicios ofrecidos, tarifas y procesos de contratación</li>
                          <li><strong>Atención al Cliente:</strong> Clasificar y priorizar automáticamente las consultas de soporte según su urgencia y complejidad</li>
                        </ul>
                        
                        <h4>Beneficios de Task Automation</h4>
                        <ul>
                          <li><strong>Ahorro de Tiempo:</strong> Libera a su equipo de responder repetidamente las mismas preguntas</li>
                          <li><strong>Consistencia:</strong> Garantiza que todas las consultas similares reciban la misma información precisa</li>
                          <li><strong>Disponibilidad 24/7:</strong> Proporciona respuestas inmediatas incluso fuera del horario laboral</li>
                          <li><strong>Escalabilidad:</strong> Permite manejar un mayor volumen de consultas sin aumentar el personal</li>
                          <li><strong>Calificación de Leads:</strong> Identifica automáticamente los prospectos más prometedores para seguimiento prioritario</li>
                        </ul>
                        
                        <h4>Ejemplo Práctico: Task Automation + Web Integration</h4>
                        <p>A continuación se presenta un ejemplo detallado de cómo una Task Automation puede mejorar el rendimiento de una integración web:</p>
                        
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 my-4">
                          <h5 className="font-bold mb-2">Caso: Universidad que Ofrece Programas de Postgrado</h5>
                          
                          <p className="mb-3"><strong>Escenario inicial:</strong> La universidad tiene una integración web de AIPI en su sitio web principal, en formato widget flotante. Sin automatizaciones, el asistente responde preguntas generales sobre la universidad.</p>
                          
                          <p className="font-medium">Implementación de Automatización:</p>
                          <ol className="space-y-2 mb-3">
                            <li>1. Se crea una <strong>Task Automation</strong> específica llamada "Admisiones Postgrado 2026"</li>
                            <li>2. Se configura con los siguientes desencadenantes:
                              <ul className="list-disc pl-6 my-1">
                                <li>Palabras clave: "postgrado", "maestría", "doctorado", "2026", "requisitos"</li>
                                <li>Rutas URL: cualquier página bajo "/postgrados/*" en el sitio web</li>
                              </ul>
                            </li>
                            <li>3. Se definen las acciones automatizadas:
                              <ul className="list-disc pl-6 my-1">
                                <li>Saludo personalizado: "Bienvenido al asistente de admisiones para programas de postgrado 2026"</li>
                                <li>Mensaje proactivo: "Veo que estás interesado en nuestros programas de postgrado. ¿Puedo ayudarte con información sobre algún programa específico?"</li>
                                <li>Recopilación de datos del visitante si muestra interés específico</li>
                              </ul>
                            </li>
                            <li>4. Se carga una base de conocimiento específica:
                              <ul className="list-disc pl-6 my-1">
                                <li>Documentos PDF con los nuevos catálogos de programas 2026</li>
                                <li>Fechas actualizadas del proceso de admisión</li>
                                <li>Nuevos requisitos y cambios en las becas disponibles</li>
                              </ul>
                            </li>
                            <li>5. Se conecta esta automatización a la <strong>integración web existente</strong> (el widget del sitio)</li>
                          </ol>
                          
                          <p className="font-medium">Resultados:</p>
                          <ul className="list-disc pl-6 space-y-1 mb-3">
                            <li>Cuando un visitante navega por la sección de postgrados, el widget cambia automáticamente su comportamiento</li>
                            <li>Ofrece proactivamente ayuda específica sobre admisiones 2026 en lugar de esperar a que el usuario inicie la conversación</li>
                            <li>Proporciona información precisa y actualizada de los nuevos programas</li>
                            <li>Identifica automáticamente candidatos potenciales, solicitando su correo para enviar información detallada</li>
                            <li>Generar reportes específicos sobre el interés en los programas de postgrado 2026</li>
                          </ul>
                          
                          <p className="font-medium">Métricas de impacto:</p>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>Aumento del 40% en la tasa de interacción con el widget en las páginas de postgrado</li>
                            <li>Incremento del 25% en formularios de interés completados</li>
                            <li>Reducción del 30% en consultas repetitivas al departamento de admisiones</li>
                            <li>Mejora de la experiencia del usuario con un 90% de valoraciones positivas</li>
                          </ul>
                        </div>
                        
                        <p>Este ejemplo ilustra cómo una Task Automation puede transformar una integración web genérica en una herramienta de captación altamente especializada, que responde de manera contextual y proactiva según las necesidades específicas de cada sección del sitio web.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Sección de Widget Integration */}
                {activeTab === "widget-integration" && (
                  <div id="widget-integration" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Integración de Widgets en Sitios Web</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          AIPI ofrece dos tipos diferentes de widgets para integrarse de manera flexible en tu sitio web, 
                          permitiéndote elegir la opción que mejor se adapte a las necesidades de tu organización y la 
                          experiencia que deseas ofrecer a tus visitantes.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                          <div className="border border-primary-200 dark:border-primary-800 rounded-lg p-5 bg-primary-50 dark:bg-gray-800">
                            <div className="flex items-center mb-3">
                              <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                              <h3 className="text-xl font-bold text-primary-700 dark:text-primary-400">Widget Flotante (Burbuja)</h3>
                            </div>
                            <p className="mb-3">
                              Una pequeña burbuja discreta que aparece en una esquina de tu sitio web. Los visitantes pueden
                              hacer clic en ella para abrir un panel de chat compacto sin perder visibilidad del contenido principal.
                            </p>
                            <h4 className="font-semibold mt-4 mb-2">Características:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Mínimamente invasivo - no interrumpe la experiencia de navegación</li>
                              <li>Personalización de colores y posición (esquina inferior derecha o izquierda)</li>
                              <li>Opción de mensaje de bienvenida proactivo configurable</li>
                              <li>Interfaz de chat responsiva que se adapta a dispositivos móviles</li>
                            </ul>
                          </div>
                          
                          <div className="border border-primary-200 dark:border-primary-800 rounded-lg p-5 bg-primary-50 dark:bg-gray-800">
                            <div className="flex items-center mb-3">
                              <Monitor className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                              <h3 className="text-xl font-bold text-primary-700 dark:text-primary-400">Pantalla Completa (Estilo ChatGPT)</h3>
                            </div>
                            <p className="mb-3">
                              Una experiencia inmersiva similar a ChatGPT que ocupa toda la pantalla, ideal para interacciones
                              más profundas y extensas. Perfecto para sitios que ofrecen el chat como servicio principal.
                            </p>
                            <h4 className="font-semibold mt-4 mb-2">Características:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Historial de conversaciones persistente para los usuarios</li>
                              <li>Presentación de sugerencias y temas frecuentes</li>
                              <li>Soporte para cargas y descargas de archivos</li>
                              <li>Personalización completa de la interfaz con tu imagen de marca</li>
                            </ul>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mt-8 mb-4">Ejemplo Práctico: Universidad con Múltiples Facultades</h3>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 my-4">
                          <h4 className="font-semibold text-lg mb-3">Caso de Implementación:</h4>
                          <p className="mb-3">
                            La Universidad Nacional de Tecnología implementó el widget flotante de AIPI en su sitio web principal
                            y en los sitios específicos de cada facultad con configuraciones adaptadas para cada contexto.
                          </p>
                          
                          <h5 className="font-medium mt-4 mb-2">Configuración:</h5>
                          <ul className="list-disc pl-5 mb-4">
                            <li><strong>Sitio principal:</strong> Widget flotante con conocimiento general sobre admisiones, becas y vida universitaria</li>
                            <li><strong>Facultad de Ingeniería:</strong> Widget especializado con datos sobre programas técnicos y requisitos específicos</li>
                            <li><strong>Facultad de Medicina:</strong> Asistente con información sobre procesos de admisión especiales y pasantías clínicas</li>
                            <li><strong>Portal de Estudiantes:</strong> Implementación pantalla completa para consultas detalladas sobre horarios y trámites</li>
                          </ul>
                          
                          <h5 className="font-medium mt-4 mb-2">Resultados:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center text-primary-700 dark:text-primary-400">
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                <span className="font-medium">42% más consultas resueltas</span>
                              </div>
                              <p className="text-sm mt-1">Sin necesidad de contactar al personal administrativo</p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center text-primary-700 dark:text-primary-400">
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                <span className="font-medium">35% reducción en emails</span>
                              </div>
                              <p className="text-sm mt-1">De consultas básicas a departamentos académicos</p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center text-primary-700 dark:text-primary-400">
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                <span className="font-medium">27% aumento en aplicaciones</span>
                              </div>
                              <p className="text-sm mt-1">Con información completa y correcta desde el inicio</p>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                              <div className="flex items-center text-primary-700 dark:text-primary-400">
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                <span className="font-medium">1,250+ leads generados</span>
                              </div>
                              <p className="text-sm mt-1">De estudiantes potenciales en un semestre</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 italic">
                            "El widget de AIPI revolucionó nuestra forma de comunicarnos con estudiantes potenciales. 
                            Ahora podemos ofrecer información específica para cada facultad de manera instantánea, 
                            capturar datos de contacto y hacer seguimiento personalizado."
                            <div className="mt-1 font-medium">— Directora de Admisiones, Universidad Nacional de Tecnología</div>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mt-8 mb-4">Implementación Técnica</h3>
                        
                        <p className="mb-4">Integrar cualquiera de los widgets en tu sitio web es extremadamente sencillo y requiere solo unas pocas líneas de código:</p>
                        
                        <div className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto">
                          <pre><code>{`<script>
  (function(w,d,s,o,f,js,fjs){
    w['AIPI-Widget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','aipi','https://tu-dominio.com/widget.js'));
  
  aipi('init', { 
    apiKey: 'TU_API_KEY',
    widgetType: 'bubble', // o 'fullscreen'
    position: 'bottom-right',
    themeColor: '#4F46E5',
    welcomeMessage: '¡Hola! ¿En qué puedo ayudarte hoy?'
  });
</script>`}</code></pre>
                        </div>
                        
                        <h4 className="font-semibold mt-6 mb-2">Parámetros de Configuración:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">apiKey</code>: Tu clave de API única generada en el panel de control de AIPI</li>
                          <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">widgetType</code>: El tipo de widget ('bubble' o 'fullscreen')</li>
                          <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">position</code>: Ubicación en la pantalla (para widget tipo burbuja)</li>
                          <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">themeColor</code>: Color principal que se usará en el widget</li>
                          <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">welcomeMessage</code>: Mensaje inicial que se mostrará al abrir el chat</li>
                        </ul>
                        
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">¿Necesitas más opciones de personalización?</h4>
                              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                Visita la <a href="#implementation" className="underline font-medium" onClick={(e) => { e.preventDefault(); setActiveTab("implementation"); }}>
                                sección de implementación</a> para ver la documentación técnica completa con todas las opciones disponibles.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Sección de Comprensión Contextual */}
                {activeTab === "contextual-understanding" && (
                  <div id="contextual-understanding" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Comprensión Contextual del Contenido Web</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          Una de las características más poderosas de AIPI es su capacidad para comprender y analizar 
                          automáticamente el contenido de tu sitio web, brindando respuestas contextuales precisas sin 
                          necesidad de programación manual o entrenamiento específico.
                        </p>
                        
                        <h3 className="text-xl font-bold mt-6 mb-3">¿Cómo Funciona?</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                            <h4 className="font-semibold mb-2 flex items-center text-primary-700 dark:text-primary-400">
                              <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300 rounded-full w-6 h-6 flex items-center justify-center mr-2">1</span>
                              Escaneo Inteligente
                            </h4>
                            <p className="text-sm">
                              Cuando un visitante interactúa con el widget, AIPI escanea automáticamente la página 
                              actual y otras páginas relevantes del sitio para obtener contexto.
                            </p>
                          </div>
                          
                          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                            <h4 className="font-semibold mb-2 flex items-center text-primary-700 dark:text-primary-400">
                              <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300 rounded-full w-6 h-6 flex items-center justify-center mr-2">2</span>
                              Análisis Semántico
                            </h4>
                            <p className="text-sm">
                              La inteligencia artificial procesa el contenido para comprender su significado, 
                              identificando temas clave, servicios, productos y otra información relevante.
                            </p>
                          </div>
                          
                          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                            <h4 className="font-semibold mb-2 flex items-center text-primary-700 dark:text-primary-400">
                              <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300 rounded-full w-6 h-6 flex items-center justify-center mr-2">3</span>
                              Generación de Respuestas
                            </h4>
                            <p className="text-sm">
                              Con base en esta comprensión, el sistema proporciona respuestas precisas y 
                              contextuales, incluyendo enlaces a las secciones relevantes del sitio.
                            </p>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mt-8 mb-4">Ejemplo Práctico: Tienda de Comercio Electrónico</h3>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 my-4">
                          <h4 className="font-semibold text-lg mb-3">Caso de Implementación:</h4>
                          <p className="mb-3">
                            TechGadgets, una tienda online especializada en productos electrónicos, implementó AIPI para 
                            mejorar la asistencia a sus clientes y aumentar las conversiones.
                          </p>
                          
                          <div className="border-l-4 border-primary-500 pl-4 py-1 my-4 bg-primary-50 dark:bg-primary-900/20">
                            <h5 className="font-medium">Consulta de cliente:</h5>
                            <p className="italic">
                              "¿Este modelo de laptop es compatible con programas de diseño gráfico profesional?"
                            </p>
                          </div>
                          
                          <div className="mb-4">
                            <h5 className="font-medium mb-2">Proceso de AIPI:</h5>
                            <ol className="list-decimal pl-5 space-y-2">
                              <li>
                                <strong>Análisis de Contexto:</strong> 
                                <p className="text-sm">
                                  AIPI detectó que el usuario estaba viendo la página de un modelo específico de laptop.
                                </p>
                              </li>
                              <li>
                                <strong>Extracción de Información:</strong> 
                                <p className="text-sm">
                                  El sistema extrajo las especificaciones técnicas del producto (procesador, memoria RAM, 
                                  tarjeta gráfica) de la página del producto.
                                </p>
                              </li>
                              <li>
                                <strong>Conexión con Conocimiento:</strong> 
                                <p className="text-sm">
                                  Relacionó estas especificaciones con los requisitos típicos de software de diseño gráfico
                                  mencionados en otras páginas del sitio, como guías y comparativas.
                                </p>
                              </li>
                            </ol>
                          </div>
                          
                          <div className="border-l-4 border-green-500 pl-4 py-1 my-4 bg-green-50 dark:bg-green-900/20">
                            <h5 className="font-medium">Respuesta generada:</h5>
                            <p className="italic">
                              "Sí, el Modelo XPS 15 que estás viendo es altamente compatible con software de diseño gráfico 
                              profesional como Adobe Photoshop, Illustrator e InDesign. Con su procesador Intel i7 de 11ª generación, 
                              32GB de RAM y tarjeta NVIDIA RTX 3050, cumple y supera los requisitos recomendados para estos programas. 
                              Además, su pantalla calibrada para precisión de color (100% Adobe RGB) lo hace ideal para trabajo gráfico. 
                              Si necesitas ver más opciones optimizadas para diseño gráfico, <a href="#" className="text-primary-600 dark:text-primary-400">puedes ver nuestra comparativa aquí</a>."
                            </p>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mt-8 mb-4">Beneficios de la Comprensión Contextual</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 text-primary-700 dark:text-primary-400">Respuestas Inmediatas y Precisas</h4>
                            <p>
                              Los visitantes obtienen información exacta sin tener que navegar por múltiples páginas 
                              buscando respuestas específicas.
                            </p>
                          </div>
                          
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 text-primary-700 dark:text-primary-400">Reducción de Abandono</h4>
                            <p>
                              Al resolver dudas en el momento, se evita que los visitantes abandonen tu sitio por 
                              frustración o falta de información clara.
                            </p>
                          </div>
                          
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 text-primary-700 dark:text-primary-400">Cero Mantenimiento Manual</h4>
                            <p>
                              A diferencia de los sistemas tradicionales de FAQs, AIPI se actualiza automáticamente 
                              cuando modificas el contenido de tu sitio web.
                            </p>
                          </div>
                          
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 text-primary-700 dark:text-primary-400">Información Consistente</h4>
                            <p>
                              Todas las respuestas se basan en el contenido oficial de tu sitio, garantizando 
                              consistencia en la información proporcionada.
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Nota Importante</h4>
                              <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                                Para mejorar aún más la precisión de las respuestas contextuales, puedes complementar 
                                esta funcionalidad con el entrenamiento específico usando documentos. Esto es 
                                especialmente útil para información que no está directamente disponible en tu sitio web.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "document-training" && (
                  <div id="document-training" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Entrenamiento con Documentos</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          AIPI permite enriquecer la base de conocimientos de su asistente virtual mediante la carga de documentos específicos de su institución o empresa. Esta característica es fundamental para proporcionar respuestas precisas y personalizadas basadas en su información oficial.
                        </p>
                        
                        <h3>Tipos de Documentos Soportados</h3>
                        <p>La plataforma acepta diversos formatos para maximizar la flexibilidad:</p>
                        
                        <ul>
                          <li><strong>Documentos PDF</strong>: Ideal para catálogos de cursos, manuales, folletos institucionales o especificaciones de productos</li>
                          <li><strong>Archivos DOCX</strong>: Perfecto para preguntas frecuentes, políticas institucionales o contenido estructurado</li>
                          <li><strong>Hojas de Cálculo Excel</strong>: Útil para horarios, tarifas, listas de programas o cualquier información tabulada</li>
                          <li><strong>URLs de Sitios Web</strong>: Permite extraer información directamente de páginas web específicas</li>
                        </ul>
                        
                        <h3>Proceso de Entrenamiento</h3>
                        <ol>
                          <li><strong>Carga de Documentos</strong>: Suba sus archivos a través de la interfaz intuitiva del dashboard</li>
                          <li><strong>Procesamiento Automático</strong>: AIPI analiza y estructura la información de forma inteligente</li>
                          <li><strong>Categorización</strong>: Organice los documentos por temas para facilitar su gestión</li>
                          <li><strong>Enriquecimiento</strong>: Añada metadatos y etiquetas para mejorar la precisión de las respuestas</li>
                          <li><strong>Validación</strong>: Verifique la calidad de las respuestas mediante pruebas interactivas</li>
                        </ol>
                        
                        <h3>Beneficios del Entrenamiento con Documentos</h3>
                        <ul>
                          <li><strong>Precisión Mejorada</strong>: Respuestas basadas en datos oficiales verificados</li>
                          <li><strong>Personalización Total</strong>: Asistente adaptado específicamente a su dominio</li>
                          <li><strong>Actualización Sencilla</strong>: Mantenga la información al día con actualizaciones regulares</li>
                          <li><strong>Reducción de Respuestas Genéricas</strong>: Minimice las respuestas imprecisas o demasiado generales</li>
                          <li><strong>Consistencia en la Información</strong>: Garantice que todos los visitantes reciban datos uniformes</li>
                        </ul>
                        
                        <h3>Recomendaciones para un Entrenamiento Efectivo</h3>
                        <ul>
                          <li>Priorice documentos actualizados y de alta calidad</li>
                          <li>Divida documentos extensos en secciones temáticas para mejorar la precisión</li>
                          <li>Incluya preguntas frecuentes con sus respuestas oficiales</li>
                          <li>Actualice la base de conocimientos regularmente para mantener su relevancia</li>
                          <li>Combine múltiples formatos para una cobertura completa</li>
                        </ul>
                        
                        <h3>Límites y Consideraciones</h3>
                        <p>Para garantizar un rendimiento óptimo:</p>
                        <ul>
                          <li>Tamaño máximo por documento: 10 MB</li>
                          <li>Longitud de texto recomendada: ~10,000 caracteres por documento</li>
                          <li>Evite documentos con contenido puramente visual (use descripciones)</li>
                          <li>Asegúrese de tener los derechos necesarios sobre el material cargado</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "lead-capture" && (
                  <div id="lead-capture" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Captura de Leads</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          Una de las características más valiosas de AIPI es su capacidad para convertir las conversaciones con visitantes en oportunidades de negocio tangibles mediante la captura y gestión inteligente de leads.
                        </p>
                        
                        <h3>Cómo Funciona la Captura de Leads</h3>
                        <p>El sistema utiliza un enfoque no intrusivo para recopilar información valiosa de los visitantes interesados:</p>
                        
                        <ol>
                          <li><strong>Identificación de Intenciones</strong>: El asistente detecta automáticamente cuándo un visitante muestra interés genuino en servicios o productos</li>
                          <li><strong>Solicitud Contextual</strong>: En el momento oportuno, solicita información de contacto explicando el beneficio para el usuario</li>
                          <li><strong>Almacenamiento Seguro</strong>: Los datos se guardan cumpliendo normativas de protección de datos</li>
                          <li><strong>Clasificación Automática</strong>: Cada lead se categoriza según su nivel de interés y área específica</li>
                          <li><strong>Alertas en Tiempo Real</strong>: Notificaciones inmediatas para seguimiento por parte del equipo comercial</li>
                        </ol>
                        
                        <h3>Datos Capturados</h3>
                        <p>AIPI puede recopilar, con consentimiento explícito del usuario:</p>
                        
                        <ul>
                          <li><strong>Información Básica</strong>: Nombre, correo electrónico, teléfono</li>
                          <li><strong>Intereses Específicos</strong>: Productos, servicios o programas de interés</li>
                          <li><strong>Nivel de Urgencia</strong>: Horizonte temporal para la toma de decisiones</li>
                          <li><strong>Preferencias de Contacto</strong>: Canal y horario preferido para seguimiento</li>
                          <li><strong>Contexto Completo</strong>: Historial de la conversación para entender necesidades</li>
                        </ul>
                        
                        <h3>Gestión de Leads</h3>
                        <p>Desde el dashboard, podrá gestionar eficientemente todos los leads capturados:</p>
                        
                        <ul>
                          <li><strong>Vista Centralizada</strong>: Todos los leads organizados en un panel intuitivo</li>
                          <li><strong>Filtros Avanzados</strong>: Segmentación por fecha, fuente, interés y estatus</li>
                          <li><strong>Asignación</strong>: Distribución de leads entre miembros del equipo</li>
                          <li><strong>Seguimiento</strong>: Registro de interacciones y próximos pasos</li>
                          <li><strong>Etiquetado</strong>: Clasificación personalizada según sus flujos de trabajo</li>
                          <li><strong>Exportación</strong>: Descarga en formatos compatibles con CRM (CSV, Excel)</li>
                        </ul>
                        
                        <h3>Integraciones con CRM</h3>
                        <p>Para optimizar su flujo de trabajo, AIPI permite:</p>
                        
                        <ul>
                          <li>Sincronización automática con sistemas CRM populares</li>
                          <li>Webhooks personalizables para integraciones específicas</li>
                          <li>Notificaciones por email a equipos comerciales</li>
                          <li>API para desarrollar integraciones personalizadas</li>
                        </ul>
                        
                        <h3>Protección de Datos</h3>
                        <p>AIPI cumple con las normativas de protección de datos:</p>
                        
                        <ul>
                          <li>Obtención de consentimiento explícito antes de capturar datos</li>
                          <li>Explicación clara del propósito de la recopilación</li>
                          <li>Almacenamiento seguro con encriptación</li>
                          <li>Acceso controlado según roles y permisos</li>
                          <li>Política de retención y eliminación de datos configurable</li>
                        </ul>
                        
                        <h3>Métricas y Análisis</h3>
                        <p>Evalúe el rendimiento de su estrategia de captura de leads con:</p>
                        
                        <ul>
                          <li><strong>Tasa de Conversión</strong>: Porcentaje de visitantes que proporcionan información</li>
                          <li><strong>Calidad de Leads</strong>: Análisis de calificación y seguimiento efectivo</li>
                          <li><strong>Fuentes Más Efectivas</strong>: Qué canales generan mejores leads</li>
                          <li><strong>Tiempo de Respuesta</strong>: Velocidad de seguimiento del equipo</li>
                          <li><strong>ROI</strong>: Retorno de inversión basado en conversiones finales</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div id="analytics" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Análisis y Estadísticas</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          AIPI ofrece un potente panel de análisis y estadísticas que proporciona información valiosa sobre el rendimiento de sus asistentes virtuales, las tendencias en las conversaciones y el comportamiento de los visitantes.
                        </p>
                        
                        <h3>Métricas Principales</h3>
                        <p>El dashboard muestra indicadores clave para evaluar el rendimiento global:</p>
                        
                        <ul>
                          <li><strong>Total de Visitantes</strong>: Número de usuarios únicos que han interactuado con su asistente</li>
                          <li><strong>Total de Conversaciones</strong>: Cantidad total de sesiones de chat iniciadas</li>
                          <li><strong>Tasa de Resolución</strong>: Porcentaje de consultas resueltas satisfactoriamente</li>
                          <li><strong>Tiempo Medio de Respuesta</strong>: Velocidad promedio de respuesta del asistente</li>
                          <li><strong>Integraciones Activas</strong>: Número de implementaciones funcionando actualmente</li>
                          <li><strong>Tendencia de Conversaciones</strong>: Evolución temporal del volumen de interacciones</li>
                        </ul>
                        
                        <h3>Análisis de Conversaciones</h3>
                        <p>Comprenda en profundidad las interacciones de los usuarios:</p>
                        
                        <ul>
                          <li><strong>Temas Populares</strong>: Asuntos más consultados por los visitantes</li>
                          <li><strong>Palabras Clave</strong>: Términos más frecuentes en las consultas</li>
                          <li><strong>Patrones de Conversación</strong>: Flujos típicos y ramificaciones comunes</li>
                          <li><strong>Preguntas Sin Respuesta</strong>: Identificación de vacíos de conocimiento</li>
                          <li><strong>Sentimiento</strong>: Análisis de la satisfacción de los usuarios</li>
                        </ul>
                        
                        <h3>Rendimiento por Integración</h3>
                        <p>Evalúe cada implementación específica:</p>
                        
                        <ul>
                          <li><strong>Comparativa</strong>: Rendimiento relativo entre diferentes integraciones</li>
                          <li><strong>Tasa de Interacción</strong>: Porcentaje de visitantes que utilizan el asistente</li>
                          <li><strong>Duración Media</strong>: Tiempo promedio de las conversaciones</li>
                          <li><strong>Horarios de Mayor Actividad</strong>: Distribución temporal de las consultas</li>
                          <li><strong>Dispositivos</strong>: Uso por tipo de dispositivo (móvil, escritorio, tablet)</li>
                        </ul>
                        
                        <h3>Análisis de Comercialización</h3>
                        <p>Información orientada a la conversión de visitantes en clientes:</p>
                        
                        <ul>
                          <li><strong>Productos/Servicios Más Consultados</strong>: Ofertas que generan mayor interés</li>
                          <li><strong>Tasa de Captura de Leads</strong>: Efectividad en la obtención de información de contacto</li>
                          <li><strong>Puntos de Abandono</strong>: Momentos en que los usuarios suelen finalizar la conversación</li>
                          <li><strong>Conversiones</strong>: Seguimiento de objetivos completados (formularios, registros)</li>
                          <li><strong>Camino hacia la Conversión</strong>: Análisis de la ruta típica hasta la acción deseada</li>
                        </ul>
                        
                        <h3>Visualización de Datos</h3>
                        <p>AIPI presenta la información de forma clara e intuitiva mediante:</p>
                        
                        <ul>
                          <li><strong>Gráficos Interactivos</strong>: Visualizaciones dinámicas con filtros ajustables</li>
                          <li><strong>Mapas de Calor</strong>: Representación visual de áreas de mayor interés</li>
                          <li><strong>Diagramas de Flujo</strong>: Visualización de recorridos de conversación</li>
                          <li><strong>Indicadores Comparativos</strong>: Métricas actuales vs períodos anteriores</li>
                          <li><strong>Dashboards Personalizables</strong>: Adapte la visualización a sus prioridades</li>
                        </ul>
                        
                        <h3>Exportación e Informes</h3>
                        <p>Comparta y analice datos de forma flexible:</p>
                        
                        <ul>
                          <li><strong>Informes Programados</strong>: Reciba estadísticas periódicas por email</li>
                          <li><strong>Exportación de Datos</strong>: Descargue información en CSV, Excel o PDF</li>
                          <li><strong>Informes Personalizados</strong>: Cree reportes a medida con las métricas relevantes</li>
                          <li><strong>API de Análisis</strong>: Integre datos con sus sistemas de business intelligence</li>
                        </ul>
                        
                        <h3>Privacidad y Seguridad</h3>
                        <p>Todos los análisis se realizan respetando:</p>
                        
                        <ul>
                          <li>Anonimización de datos personales</li>
                          <li>Cumplimiento de normativas de privacidad (GDPR, CCPA)</li>
                          <li>Control de acceso basado en roles</li>
                          <li>Políticas de retención de datos configurables</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "task-automation" && (
                  <div id="task-automation" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Automatización de Tareas</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          El módulo de Automatización de Tareas (Task Automation) de AIPI permite crear flujos de trabajo inteligentes que ejecutan acciones predefinidas en respuesta a desencadenantes específicos. Esta funcionalidad avanzada reduce la carga de trabajo manual y garantiza respuestas consistentes y rápidas a situaciones recurrentes.
                        </p>
                        
                        <h3>¿Qué es la Automatización de Tareas?</h3>
                        <p>
                          Task Automation permite configurar respuestas automáticas y secuencias de acciones basadas en criterios predefinidos. Estas automatizaciones permiten que su asistente virtual realice tareas complejas como:
                        </p>
                        
                        <ul>
                          <li>Responder automáticamente preguntas frecuentes con información detallada</li>
                          <li>Programar seguimientos basados en el interés mostrado por los visitantes</li>
                          <li>Proporcionar información preliminar antes de conectar con un representante humano</li>
                          <li>Recopilar datos específicos necesarios para procesos de admisión o ventas</li>
                          <li>Generar alertas para el equipo cuando se detecten consultas prioritarias</li>
                          <li>Clasificar automáticamente las consultas por departamento o área de interés</li>
                        </ul>
                        
                        <h3>Componentes Principales</h3>
                        <p>Cada automatización consta de tres elementos fundamentales:</p>
                        
                        <ol>
                          <li><strong>Desencadenantes (Triggers)</strong>: Condiciones que activan la automatización
                            <ul>
                              <li>Palabras clave específicas en las consultas</li>
                              <li>Patrones detectados en la conversación</li>
                              <li>Horarios específicos (ej. fuera del horario de oficina)</li>
                              <li>Datos proporcionados por el usuario</li>
                              <li>Número de interacciones o duración de la conversación</li>
                            </ul>
                          </li>
                          <li><strong>Condiciones</strong>: Criterios adicionales que deben cumplirse
                            <ul>
                              <li>Segmentación por ubicación del usuario</li>
                              <li>Tipo de dispositivo utilizado</li>
                              <li>Historial previo del visitante</li>
                              <li>Estado actual de la conversación</li>
                            </ul>
                          </li>
                          <li><strong>Acciones</strong>: Respuestas o tareas que se ejecutan automáticamente
                            <ul>
                              <li>Envío de respuestas predefinidas</li>
                              <li>Recopilación estructurada de información</li>
                              <li>Generación de notificaciones internas</li>
                              <li>Transferencia a agentes humanos</li>
                              <li>Activación de integraciones con sistemas externos</li>
                            </ul>
                          </li>
                        </ol>
                        
                        <h3>Cómo Crear una Automatización</h3>
                        <p>Para implementar una nueva automatización, siga estos pasos:</p>
                        
                        <ol>
                          <li><strong>Acceda al Dashboard</strong>: Navegue a la sección "Task Automation" en su panel de control</li>
                          <li><strong>Inicie una Nueva Automatización</strong>: Haga clic en "Crear Nueva" y asigne un nombre descriptivo</li>
                          <li><strong>Configure los Desencadenantes</strong>: Defina qué condiciones activarán esta automatización</li>
                          <li><strong>Establezca las Condiciones</strong>: Especifique criterios adicionales si es necesario</li>
                          <li><strong>Diseñe las Acciones</strong>: Determine qué hará el sistema cuando se active</li>
                          <li><strong>Personalice las Respuestas</strong>: Cree mensajes efectivos y adaptados a su marca</li>
                          <li><strong>Configure Opciones Avanzadas</strong>: Ajuste prioridades, limitaciones y comportamientos secundarios</li>
                          <li><strong>Pruebe la Automatización</strong>: Verifique su funcionamiento en un entorno de prueba</li>
                          <li><strong>Active y Monitoree</strong>: Implemente la automatización y supervise su rendimiento</li>
                        </ol>
                        
                        <h3>Escenarios de Uso Comunes</h3>
                        
                        <h4>Para Instituciones Educativas:</h4>
                        <ul>
                          <li><strong>Consultas sobre Admisiones</strong>: Proporcionar información sobre requisitos, fechas y procesos</li>
                          <li><strong>Preguntas sobre Programas</strong>: Detallar cursos, planes de estudio y salidas profesionales</li>
                          <li><strong>Soporte a Estudiantes</strong>: Resolver dudas frecuentes sobre procedimientos administrativos</li>
                        </ul>
                        
                        <h4>Para Empresas:</h4>
                        <ul>
                          <li><strong>Atención al Cliente Básica</strong>: Responder preguntas frecuentes sobre productos/servicios</li>
                          <li><strong>Calificación de Clientes Potenciales</strong>: Evaluar y categorizar leads según su potencial</li>
                          <li><strong>Soporte Técnico Inicial</strong>: Diagnóstico preliminar y resolución de problemas comunes</li>
                        </ul>
                        
                        <h4>Para Servicios Profesionales:</h4>
                        <ul>
                          <li><strong>Programación de Consultas</strong>: Facilitar la reserva de citas con profesionales</li>
                          <li><strong>Evaluación Preliminar</strong>: Recopilar información relevante antes de la consulta personal</li>
                          <li><strong>Seguimiento Post-Servicio</strong>: Mantener contacto con clientes después de una prestación</li>
                        </ul>
                        
                        <h3>Mejores Prácticas</h3>
                        <p>Para maximizar la efectividad de sus automatizaciones:</p>
                        
                        <ul>
                          <li>Mantenga las respuestas concisas y conversacionales</li>
                          <li>Combine automatizaciones con intervención humana cuando sea necesario</li>
                          <li>Revise y actualice regularmente sus automatizaciones</li>
                          <li>Comience con escenarios simples y evolucione hacia flujos más complejos</li>
                          <li>Analice el rendimiento con las métricas disponibles y optimice continuamente</li>
                          <li>Asegúrese de que las automatizaciones reflejen correctamente el tono y valores de su marca</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "education" && (
                  <div id="education" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-4">
                        <School className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Para Instituciones Educativas</h2>
                      </div>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          CEGEPs, colegios y universidades enfrentan desafíos únicos en la era digital. 
                          Estudiantes potenciales navegan entre múltiples opciones educativas y a menudo 
                          se sienten abrumados por la cantidad de información disponible. AIPI transforma 
                          este proceso haciéndolo más accesible, personalizado y efectivo.
                        </p>
                        
                        <h3>Beneficios Específicos</h3>
                        
                        <h4>Mejora del Proceso de Admisiones</h4>
                        <ul>
                          <li>Responde preguntas específicas sobre requisitos de admisión, fechas límite y documentación necesaria</li>
                          <li>Guía a los estudiantes paso a paso a través del proceso de solicitud</li>
                          <li>Elimina barreras de acceso a la información crítica para tomar decisiones</li>
                        </ul>
                        
                        <h4>Presentación Efectiva de Programas Académicos</h4>
                        <ul>
                          <li>Proporciona detalles sobre planes de estudio, profesores y salidas profesionales</li>
                          <li>Ayuda a comparar diferentes opciones académicas dentro de la institución</li>
                          <li>Responde preguntas específicas sobre contenidos de cursos y metodologías</li>
                        </ul>
                        
                        <h4>Captación y Seguimiento de Interesados</h4>
                        <ul>
                          <li>Identifica estudiantes con alto potencial de matriculación</li>
                          <li>Registra áreas específicas de interés para seguimiento personalizado</li>
                          <li>Permite al departamento de admisiones priorizar sus esfuerzos en candidatos cualificados</li>
                        </ul>
                        
                        <h4>Soporte 24/7 para Estudiantes Internacionales</h4>
                        <ul>
                          <li>Proporciona información en múltiples idiomas</li>
                          <li>Atiende consultas fuera del horario laboral, esencial para diferentes zonas horarias</li>
                          <li>Ofrece orientación sobre visados, alojamiento y otros aspectos relevantes</li>
                        </ul>
                        
                        <h4>Análisis de Tendencias en la Demanda Educativa de Tu Institución</h4>
                        <ul>
                          <li>Identifica los programas más consultados en tu sitio web</li>
                          <li>Analiza las preocupaciones más frecuentes de tus estudiantes potenciales</li>
                          <li>Proporciona datos valiosos específicos para la planificación estratégica de tu oferta académica</li>
                          <li>Estadísticas segregadas por cuenta de usuario, sin mezclar datos con otras instituciones</li>
                        </ul>
                        
                        <h3>Testimonios</h3>
                        <blockquote>
                          "Desde que implementamos AIPI en nuestro sitio web, hemos visto un incremento del 35% en las solicitudes 
                          de información que se convierten en candidaturas reales. El asistente virtual ha sido clave para ayudar 
                          a los estudiantes a navegar nuestros más de 50 programas académicos."
                          <cite>— Directora de Admisiones, CEGEP Saint-Laurent</cite>
                        </blockquote>
                        
                        <div className="mt-8">
                          <Button size="lg" asChild>
                            <Link href="/get-started">Implementar en Mi Institución</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "business" && (
                  <div id="business" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-4">
                        <Building2 className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Para Empresas y Negocios</h2>
                      </div>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          En el entorno empresarial actual, la rapidez en la atención al cliente y la capacidad para 
                          convertir visitantes web en clientes potenciales son factores críticos para el éxito. AIPI 
                          proporciona una solución integral que mejora la experiencia del cliente mientras optimiza 
                          los recursos de atención comercial.
                        </p>
                        
                        <h3>Beneficios Específicos</h3>
                        
                        <h4>Generación y Calificación de Leads</h4>
                        <ul>
                          <li>Identifica visitantes con intención de compra real</li>
                          <li>Recopila información de contacto y necesidades específicas</li>
                          <li>Califica automáticamente leads según el nivel de interés y la etapa del embudo de ventas</li>
                        </ul>
                        
                        <h4>Soporte al Cliente 24/7</h4>
                        <ul>
                          <li>Responde consultas frecuentes sin intervención humana</li>
                          <li>Proporciona información detallada sobre productos y servicios</li>
                          <li>Deriva a atención humana solo cuando es estrictamente necesario</li>
                        </ul>
                        
                        <h4>Presentación Efectiva de Catálogos y Servicios</h4>
                        <ul>
                          <li>Guía a los visitantes a través de extensos catálogos de productos</li>
                          <li>Sugiere productos relevantes basados en las necesidades expresadas</li>
                          <li>Facilita comparaciones y ayuda en la toma de decisiones de compra</li>
                        </ul>
                        
                        <h4>Optimización del Proceso de Ventas</h4>
                        <ul>
                          <li>Proporciona información preliminar valiosa al equipo de ventas</li>
                          <li>Reduce el tiempo dedicado a consultas básicas o no cualificadas</li>
                          <li>Permite que los comerciales se concentren en prospectos de alta calidad</li>
                        </ul>
                        
                        <h4>Análisis del Comportamiento de Tus Clientes</h4>
                        <ul>
                          <li>Identifica tendencias en las consultas y necesidades específicas de tu mercado</li>
                          <li>Proporciona insights exclusivos sobre objeciones frecuentes de tus clientes</li>
                          <li>Ayuda a refinar ofertas y mensajes comerciales basados en tus datos propios</li>
                          <li>Métricas segmentadas por cuenta de usuario para mantener la privacidad y relevancia</li>
                        </ul>
                        
                        <h3>Testimonios</h3>
                        <blockquote>
                          "Al implementar AIPI, conseguimos reducir en un 45% el tiempo que nuestro equipo 
                          dedicaba a responder consultas básicas. Ahora pueden concentrarse en cerrar ventas, 
                          mientras el asistente virtual se encarga de educar a los clientes y recopilar información 
                          crucial para nuestro seguimiento comercial."
                          <cite>— Director Comercial, TechSolutions Inc.</cite>
                        </blockquote>
                        
                        <div className="mt-8">
                          <Button size="lg" asChild>
                            <Link href="/get-started">Implementar en Mi Empresa</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "professional" && (
                  <div id="professional" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-4">
                        <Headset className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Para Servicios Profesionales</h2>
                      </div>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          Abogados, contadores, consultores, agencias de marketing y otros profesionales independientes 
                          pueden beneficiarse enormemente de la implementación de AIPI en sus sitios web. La solución 
                          permite ofrecer una experiencia de alto nivel a potenciales clientes mientras se optimiza 
                          el tiempo dedicado a la captación.
                        </p>
                        
                        <h3>Beneficios Específicos</h3>
                        
                        <h4>Pre-cualificación de Clientes</h4>
                        <ul>
                          <li>Identifica las necesidades específicas del cliente antes del primer contacto</li>
                          <li>Determina si el caso o proyecto se ajusta a la especialización del profesional</li>
                          <li>Recopila información preliminar para agilizar la primera consulta</li>
                        </ul>
                        
                        <h4>Programación Eficiente de Citas</h4>
                        <ul>
                          <li>Gestiona la agenda y disponibilidad para consultas iniciales</li>
                          <li>Reduce las llamadas telefónicas para programar reuniones</li>
                          <li>Envía recordatorios automáticos para reducir las cancelaciones</li>
                        </ul>
                        
                        <h4>Educación Preliminar del Cliente</h4>
                        <ul>
                          <li>Proporciona información básica sobre procesos y servicios</li>
                          <li>Responde preguntas frecuentes sobre tarifas, plazos y metodologías</li>
                          <li>Prepara al cliente para una interacción más productiva con el profesional</li>
                        </ul>
                        
                        <h4>Gestión de Expectativas</h4>
                        <ul>
                          <li>Comunica claramente los alcances y límites de los servicios ofrecidos</li>
                          <li>Explica los procesos habituales y tiempos estimados</li>
                          <li>Evita malentendidos que pueden afectar la relación profesional</li>
                        </ul>
                        
                        <h4>Marketing de Contenidos Interactivo y Datos Analíticos</h4>
                        <ul>
                          <li>Presenta información valiosa de manera conversacional</li>
                          <li>Demuestra experiencia y conocimiento en tu campo específico</li>
                          <li>Genera confianza antes del contacto personal</li>
                          <li>Proporciona estadísticas exclusivas de tu práctica profesional</li>
                          <li>Métricas aisladas por cuenta, garantizando la privacidad de tus datos</li>
                        </ul>
                        
                        <h3>Testimonios</h3>
                        <blockquote>
                          "Como bufete especializado, solíamos perder mucho tiempo con consultas que no encajaban 
                          con nuestra práctica. AIPI no solo filtra estas consultas, sino que deriva a los 
                          potenciales clientes al abogado adecuado dentro de nuestra firma, basándose en sus 
                          necesidades específicas. Nuestra productividad ha aumentado significativamente."
                          <cite>— Socio Director, Asesoría Legal Global</cite>
                        </blockquote>
                        
                        <div className="mt-8">
                          <Button size="lg" asChild>
                            <Link href="/get-started">Integrar en Mi Práctica Profesional</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "form-creation" && (
                  <div id="form-creation" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Creación de Formularios</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          AIPI incluye un poderoso sistema de creación de formularios personalizables para capturar información de los visitantes de manera eficiente. Esta funcionalidad te permite crear diferentes tipos de formularios, desde formularios de contacto simples hasta encuestas complejas.
                        </p>
                        
                        <h3>Tipos de Formularios Disponibles</h3>
                        <p>La plataforma proporciona plantillas prediseñadas para diversos propósitos:</p>
                        
                        <ul>
                          <li><strong>Formularios de Contacto</strong>: Captura información básica de contacto de los visitantes interesados</li>
                          <li><strong>Formularios de Lista de Espera</strong>: Ideal para gestionar solicitudes de inscripción anticipada</li>
                          <li><strong>Encuestas de Satisfacción</strong>: Recopila feedback de clientes o estudiantes</li>
                          <li><strong>Formularios de Feedback</strong>: Obtén comentarios sobre productos, servicios o contenidos específicos</li>
                          <li><strong>Formularios de Captación de Leads</strong>: Diseñados para capturar información cualificada de prospectos</li>
                          <li><strong>Formularios Personalizados</strong>: Crea desde cero para necesidades específicas</li>
                        </ul>
                        
                        <h3>Características Principales</h3>
                        <ul>
                          <li><strong>Diseño Flexible</strong>: Personaliza colores, fuentes y estilos para que coincidan con tu marca</li>
                          <li><strong>Campos Configurables</strong>: Añade diversos tipos de campos (texto, selección, casillas, fechas, etc.)</li>
                          <li><strong>Validación Avanzada</strong>: Configura reglas para asegurar que los datos capturados sean válidos</li>
                          <li><strong>Lógica Condicional</strong>: Muestra u oculta campos según las respuestas anteriores</li>
                          <li><strong>Integración con IA</strong>: Análisis automático de las respuestas para identificar patrones y preferencias</li>
                          <li><strong>Protección Captcha</strong>: Previene envíos automatizados y spam</li>
                          <li><strong>Notificaciones por Email</strong>: Recibe alertas cuando se envían nuevas respuestas</li>
                          <li><strong>Análisis Detallado</strong>: Estadísticas sobre tasas de conversión y patrones de completado</li>
                        </ul>
                        
                        <h3>Proceso de Creación de Formularios</h3>
                        <ol>
                          <li><strong>Accede al Dashboard</strong>: Navega a la sección "Formularios" en tu panel de control</li>
                          <li><strong>Crea un Nuevo Formulario</strong>: Haz clic en "Crear Formulario" y elige si quieres partir de una plantilla o desde cero</li>
                          <li><strong>Configuración Básica</strong>: Define nombre, descripción y propósito del formulario</li>
                          <li><strong>Diseño y Campos</strong>: Configura la apariencia y añade los campos necesarios</li>
                          <li><strong>Personalización</strong>: Ajusta colores, fuentes y estilos para que coincidan con tu marca</li>
                          <li><strong>Configuración Avanzada</strong>: Define mensajes de agradecimiento, redirecciones y notificaciones</li>
                          <li><strong>Vista Previa</strong>: Prueba el funcionamiento del formulario antes de publicarlo</li>
                          <li><strong>Publicación</strong>: Genera un enlace único o código de inserción para tu sitio web</li>
                        </ol>
                        
                        <h3>Integración de Formularios en Sitios Web</h3>
                        <p>
                          Una vez creado tu formulario, puedes integrarlo fácilmente en tu sitio web mediante el código de inserción:
                        </p>
                        
                        <ol>
                          <li><strong>Obtén el Código</strong>: Desde la vista de tu formulario, haz clic en "Obtener Código" para abrir el modal con el código de inserción</li>
                          <li><strong>Copia el Código</strong>: El sistema te proporcionará un fragmento HTML que puedes copiar directamente</li>
                          <li><strong>Inserta en tu Sitio</strong>: Pega el código en la sección de tu sitio web donde deseas que aparezca el formulario</li>
                        </ol>
                        
                        <p>El código de inserción tendrá un aspecto similar a este:</p>
                        
                        <pre><code>&lt;script src="https://tu-dominio.com/api/forms/embed/[ID_DEL_FORMULARIO]"&gt;&lt;/script&gt;
&lt;div id="aipi-form-[ID_DEL_FORMULARIO]"&gt;&lt;/div&gt;</code></pre>
                        
                        <p><strong>Opciones de Personalización</strong>: El modal también incluye instrucciones para:</p>
                        <ul>
                          <li>Personalizar el estilo del formulario para adaptarlo a tu sitio</li>
                          <li>Configurar acciones después del envío (redirecciones, mensajes)</li>
                          <li>Implementar validaciones personalizadas</li>
                          <li>Integrar con sistemas de análisis para seguimiento de conversiones</li>
                        </ul>
                        
                        <p><strong>Consideraciones Técnicas</strong>:</p>
                        <ul>
                          <li>El código funciona en cualquier sitio HTML, incluidos CMS como WordPress, Wix, o Shopify</li>
                          <li>El formulario se carga de forma asíncrona para no afectar el rendimiento de la página</li>
                          <li>Los datos se envían directamente a los servidores de AIPI para mayor seguridad</li>
                          <li>Se incluye automáticamente protección contra spam y ataques CSRF</li>
                        </ul>
                        
                        <h3>Gestión de Respuestas</h3>
                        <p>Una vez que los visitantes empiezan a completar tu formulario, puedes:</p>
                        <ul>
                          <li><strong>Ver Respuestas</strong>: Accede a todas las respuestas desde tu dashboard</li>
                          <li><strong>Exportar Datos</strong>: Descarga las respuestas en formato CSV para análisis externos</li>
                          <li><strong>Filtrar y Buscar</strong>: Encuentra rápidamente respuestas específicas</li>
                          <li><strong>Análisis Automático</strong>: Visualiza estadísticas y tendencias generadas por la IA</li>
                          <li><strong>Seguimiento</strong>: Marca respuestas como atendidas o pendientes de seguimiento</li>
                        </ul>
                        
                        <h3>Integración con el Widget de AIPI</h3>
                        <p>Los formularios pueden integrarse con el asistente virtual de AIPI para:</p>
                        <ul>
                          <li>Presentar formularios en momentos clave de la conversación</li>
                          <li>Completar automáticamente campos con información ya proporcionada en el chat</li>
                          <li>Seguir la conversación después del envío del formulario</li>
                          <li>Proporcionar asistencia durante el proceso de completado</li>
                        </ul>
                        
                        <h3>Casos de Uso Populares</h3>
                        <ul>
                          <li><strong>Educación</strong>: Formularios de solicitud de información, inscripción a eventos o programas</li>
                          <li><strong>Negocios</strong>: Captura de leads, solicitudes de presupuesto, evaluación de satisfacción</li>
                          <li><strong>Servicios Profesionales</strong>: Consultas iniciales, reserva de citas, recopilación de antecedentes</li>
                          <li><strong>E-commerce</strong>: Feedback de productos, solicitudes de soporte, registro en listas VIP</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Button size="lg" asChild>
                        <Link href="/dashboard/forms">Crear mi Primer Formulario</Link>
                      </Button>
                    </div>
                  </div>
                )}
                
                {activeTab === "implementation" && (
                  <div id="implementation" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-4">
                        <Code className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Implementación Simple</h2>
                      </div>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          La implementación de AIPI ha sido diseñada para ser extremadamente sencilla, 
                          sin necesidad de conocimientos técnicos avanzados. En pocos pasos, podrás tener 
                          funcionando un asistente virtual inteligente en tu sitio web.
                        </p>
                        
                        <h3>Proceso de Implementación</h3>
                        
                        <h4>Paso 1: Integración con tu Sitio Web</h4>
                        <p>
                          Simplemente agrega un fragmento de código HTML a tu sitio web, justo antes de la etiqueta 
                          de cierre &lt;/body&gt;. Tenemos opciones para:
                        </p>
                        <ul>
                          <li>Widget flotante (burbuja) que aparece en una esquina de tu sitio</li>
                          <li>Experiencia de pantalla completa estilo ChatGPT</li>
                        </ul>
                        <p>
                          Si utilizas WordPress, puedes agregar el código en el tema (footer.php) o utilizar un plugin 
                          que permita insertar código HTML.
                        </p>
                        
                        <h4>Paso 2: Personalización del Asistente</h4>
                        <p>
                          Desde tu panel de control de AIPI, podrás personalizar múltiples aspectos:
                        </p>
                        <ul>
                          <li>Colores y estilo visual para que coincida con tu marca</li>
                          <li>Posición en la pantalla (para el widget flotante)</li>
                          <li>Mensaje de bienvenida y comportamiento inicial</li>
                          <li>Idiomas soportados</li>
                          <li>Nombre y "personalidad" del asistente</li>
                        </ul>
                        
                        <h4>Paso 3: Entrenamiento del Asistente</h4>
                        <p>
                          Para que tu asistente proporcione respuestas útiles y relevantes:
                        </p>
                        <ul>
                          <li>Sube documentos PDF con información sobre tus servicios o programas</li>
                          <li>Agrega archivos DOCX con preguntas frecuentes y sus respuestas</li>
                          <li>Incluye hojas de cálculo Excel con datos estructurados</li>
                          <li>Escribe instrucciones específicas sobre el tono y estilo de las respuestas</li>
                        </ul>
                        <p>
                          También puedes indicar URLs específicas de tu sitio para que el asistente 
                          extraiga y aprenda de ese contenido automáticamente.
                        </p>
                        
                        <h4>Paso 4: Activación y Monitoreo Personalizado</h4>
                        <p>
                          Una vez configurado, el asistente estará listo para interactuar con tus visitantes. 
                          Desde tu panel de control particular podrás:
                        </p>
                        <ul>
                          <li>Monitorear conversaciones en tiempo real solo de tus integraciones</li>
                          <li>Revisar métricas de uso y efectividad exclusivas de tu cuenta</li>
                          <li>Acceder a leads capturados en tu sitio web</li>
                          <li>Refinar el entrenamiento basado en interacciones reales con tus visitantes</li>
                          <li>Obtener estadísticas completamente aisladas de otros usuarios del sistema</li>
                        </ul>
                        
                        <h3>Requisitos Técnicos</h3>
                        <p>
                          AIPI está diseñado para funcionar con prácticamente cualquier sitio web moderno:
                        </p>
                        <ul>
                          <li>Compatible con todos los CMS populares (WordPress, Drupal, Joomla, etc.)</li>
                          <li>Funciona con sitios estáticos HTML</li>
                          <li>Se integra con aplicaciones JavaScript (React, Angular, Vue, etc.)</li>
                          <li>No requiere modificaciones al servidor</li>
                        </ul>
                        
                        <div className="mt-8">
                          <Button size="lg" asChild>
                            <Link href="/get-started">Comenzar Implementación</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}