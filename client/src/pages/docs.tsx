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
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              {t("documentation.title")}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t("documentation.subtitle")}
            </p>
          </div>
        </section>
        
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4">
                <div className="sticky top-24 backdrop-blur-md bg-white/50 dark:bg-gray-900/50 border border-white/20 dark:border-gray-800/30 rounded-lg p-4">
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
                      href="#forms" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("forms"); }}
                      className={`block px-3 py-2 rounded-md ${activeTab === "forms" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        <span>Formularios</span>
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
                          AIPPS ofrece dos modalidades de integración para adaptarse a las necesidades de cada institución:
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
                        <p>AIPPS escanea y analiza automáticamente el contenido de su sitio web para:</p>
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
                        <p>El sistema de Task Automation de AIPPS permite crear flujos de trabajo automatizados para manejar consultas repetitivas y tareas comunes sin intervención humana.</p>
                        
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
                          
                          <p className="mb-3"><strong>Escenario inicial:</strong> La universidad tiene una integración web de AIPPS en su sitio web principal, en formato widget flotante. Sin automatizaciones, el asistente responde preguntas generales sobre la universidad.</p>
                          
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
                          AIPPS ofrece dos tipos diferentes de widgets para integrarse de manera flexible en tu sitio web, 
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
                              más profundas y extensas. Incluye sistema completo de autenticación para usuarios registrados.
                            </p>
                            <h4 className="font-semibold mt-4 mb-2">Características:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Sistema de registro y login completo para usuarios</li>
                              <li>Historial personal de conversaciones con timestamps</li>
                              <li>Generación automática de títulos descriptivos</li>
                              <li>Gestión completa de conversaciones (crear, eliminar)</li>
                              <li>Información de usuario personalizada</li>
                              <li>Interfaz estilo ChatGPT con sidebar de conversaciones</li>
                              <li>Soporte para cargas y descargas de archivos</li>
                              <li>Personalización completa de la interfaz con tu imagen de marca</li>
                            </ul>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mt-8 mb-4">Ejemplo Práctico: Universidad con Múltiples Facultades</h3>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 my-4">
                          <h4 className="font-semibold text-lg mb-3">Caso de Implementación:</h4>
                          <p className="mb-3">
                            La Universidad Nacional de Tecnología implementó el widget flotante de AIPPS en su sitio web principal
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
                            "El widget de AIPPS revolucionó nuestra forma de comunicarnos con estudiantes potenciales. 
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
                          <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">apiKey</code>: Tu clave de API única generada en el panel de control de AIPPS</li>
                          <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">widgetType</code>: El tipo de widget ('bubble' o 'fullscreen')</li>
                          <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">position</code>: Ubicación en la pantalla (para widget tipo burbuja)</li>
                          <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">themeColor</code>: Color principal que se usará en el widget</li>
                          <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">welcomeMessage</code>: Mensaje inicial que se mostrará al abrir el chat</li>
                          <li><code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">ignoredSections</code>: Array de secciones del sitio web que el asistente debe ignorar</li>
                        </ul>
                        
                        <h3 className="text-xl font-bold mt-8 mb-4">Función de Secciones Ignoradas</h3>
                        
                        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 p-4 rounded-lg my-4">
                          <h4 className="font-semibold mb-2 text-primary-800 dark:text-primary-300">Control preciso sobre el contenido analizado</h4>
                          <p className="mb-3">
                            La función "Secciones ignoradas" permite especificar qué partes de tu sitio web no deberían ser analizadas 
                            por el asistente al escanear el contenido de la página, proporcionando un control detallado sobre la 
                            información que el chatbot utiliza para responder preguntas.
                          </p>
                          
                          <h5 className="font-medium mt-4 mb-2">Beneficios:</h5>
                          <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li><strong>Privacidad mejorada:</strong> Excluye secciones con información sensible o confidencial</li>
                            <li><strong>Respuestas más precisas:</strong> Elimina secciones irrelevantes como menús, pies de página o anuncios</li>
                            <li><strong>Optimización de rendimiento:</strong> Reduce la cantidad de texto procesado</li>
                            <li><strong>Focalización de contenido:</strong> Dirige al asistente hacia las secciones más importantes</li>
                          </ul>

                          <h5 className="font-medium mt-4 mb-2">Configuración en el panel de administración:</h5>
                          <p className="mb-2">Las secciones ignoradas se pueden configurar fácilmente desde la sección "Editar Integración" en tu panel de AIPI:</p>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>Navega a "Integraciones" y selecciona la integración a configurar</li>
                            <li>Encuentra la sección "Secciones a ignorar"</li>
                            <li>Agrega nombres descriptivos de secciones del sitio (ej: "Testimonios", "Contacto", "Precios")</li>
                            <li>Guarda los cambios y el widget automáticamente filtrará estas secciones</li>
                          </ol>
                          
                          <h5 className="font-medium mt-4 mb-2">Implementación técnica:</h5>
                          <div className="bg-gray-800 text-gray-200 p-3 rounded-lg overflow-x-auto mt-2 mb-3">
                            <pre><code>{`aipi('init', { 
  apiKey: 'TU_API_KEY',
  // Otras configuraciones...
  ignoredSections: ['Nuestros Servicios', 'Testimonios', 'Contacto']
});`}</code></pre>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Todos los widgets de AIPI (flotante, pantalla completa y simple) procesarán automáticamente 
                            esta configuración para excluir las secciones especificadas del análisis de contenido.
                          </p>
                        </div>
                        
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
                          Una de las características más poderosas de AIPPS es su capacidad para comprender y analizar 
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
                            <h5 className="font-medium mb-2">Proceso de AIPPS:</h5>
                            <ol className="list-decimal pl-5 space-y-2">
                              <li>
                                <strong>Análisis de Contexto:</strong> 
                                <p className="text-sm">
                                  AIPPS detectó que el usuario estaba viendo la página de un modelo específico de laptop.
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
                              A diferencia de los sistemas tradicionales de FAQs, AIPPS se actualiza automáticamente 
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
                          AIPPS permite enriquecer la base de conocimientos de su asistente virtual mediante la carga de documentos específicos de su institución o empresa. Esta característica es fundamental para proporcionar respuestas precisas y personalizadas basadas en su información oficial.
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
                          <li><strong>Procesamiento Automático</strong>: AIPPS analiza y estructura la información de forma inteligente</li>
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
                          Una de las características más valiosas de AIPPS es su capacidad para convertir las conversaciones con visitantes en oportunidades de negocio tangibles mediante la captura y gestión inteligente de leads.
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
                        <p>AIPPS puede recopilar, con consentimiento explícito del usuario:</p>
                        
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
                        <p>Para optimizar su flujo de trabajo, AIPPS permite:</p>
                        
                        <ul>
                          <li>Sincronización automática con sistemas CRM populares</li>
                          <li>Webhooks personalizables para integraciones específicas</li>
                          <li>Notificaciones por email a equipos comerciales</li>
                          <li>API para desarrollar integraciones personalizadas</li>
                        </ul>
                        
                        <h3>Protección de Datos</h3>
                        <p>AIPPS cumple con las normativas de protección de datos:</p>
                        
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
                          AIPPS ofrece un potente panel de análisis y estadísticas que proporciona información valiosa sobre el rendimiento de sus asistentes virtuales, las tendencias en las conversaciones y el comportamiento de los visitantes. Las herramientas de análisis están diseñadas para facilitar la toma de decisiones estratégicas basadas en datos reales.
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
                          <li><strong>Temas Populares</strong>: Asuntos más consultados por los visitantes, representados visualmente en gráficos interactivos</li>
                          <li><strong>Palabras Clave</strong>: Términos más frecuentes en las consultas, con análisis de frecuencia</li>
                          <li><strong>Patrones de Conversación</strong>: Flujos típicos y ramificaciones comunes</li>
                          <li><strong>Preguntas Sin Respuesta</strong>: Identificación de vacíos de conocimiento para mejorar el entrenamiento</li>
                          <li><strong>Sentimiento</strong>: Análisis de la satisfacción de los usuarios con métricas de sentimiento positivo, neutral y negativo</li>
                        </ul>
                        
                        <h3>Rendimiento por Integración</h3>
                        <p>Evalúe cada implementación específica:</p>
                        
                        <ul>
                          <li><strong>Comparativa</strong>: Rendimiento relativo entre diferentes integraciones con clasificaciones de desempeño</li>
                          <li><strong>Tasa de Interacción</strong>: Porcentaje de visitantes que utilizan el asistente</li>
                          <li><strong>Duración Media</strong>: Tiempo promedio de las conversaciones</li>
                          <li><strong>Horarios de Mayor Actividad</strong>: Distribución temporal de las consultas</li>
                          <li><strong>Dispositivos</strong>: Uso por tipo de dispositivo (móvil, escritorio, tablet)</li>
                        </ul>
                        
                        <h3>Análisis de Comercialización</h3>
                        <p>Información orientada a la conversión de visitantes en clientes:</p>
                        
                        <ul>
                          <li><strong>Productos/Servicios Más Consultados</strong>: Ofertas que generan mayor interés, visualizadas en gráficos de demanda</li>
                          <li><strong>Tasa de Captura de Leads</strong>: Efectividad en la obtención de información de contacto</li>
                          <li><strong>Puntos de Abandono</strong>: Momentos en que los usuarios suelen finalizar la conversación</li>
                          <li><strong>Conversiones</strong>: Seguimiento de objetivos completados (formularios, registros)</li>
                          <li><strong>Camino hacia la Conversión</strong>: Análisis de la ruta típica hasta la acción deseada</li>
                        </ul>
                        
                        <h3>Visualización de Datos</h3>
                        <p>AIPPS presenta la información de forma clara e intuitiva mediante:</p>
                        
                        <ul>
                          <li><strong>Gráficos Interactivos</strong>: Visualizaciones dinámicas con filtros ajustables y múltiples tipos de gráficos (barras, líneas, circulares)</li>
                          <li><strong>Tendencias Temporales</strong>: Gráficos de línea que muestran la evolución de conversaciones a lo largo del tiempo</li>
                          <li><strong>Gráficos de Sentimiento</strong>: Visualización del sentimiento de los usuarios respecto a diferentes temas</li>
                          <li><strong>Indicadores Comparativos</strong>: Métricas actuales vs períodos anteriores con indicadores de cambio porcentual</li>
                          <li><strong>Dashboards Personalizables</strong>: Adapte la visualización a sus prioridades y necesidades específicas</li>
                        </ul>
                        
                        <h3>Exportación e Informes en PDF</h3>
                        <p>La plataforma ofrece capacidades avanzadas de generación de informes:</p>
                        
                        <ul>
                          <li><strong>Exportación a PDF</strong>: Genere informes completos con un solo clic, incluyendo todos los gráficos y métricas relevantes</li>
                          <li><strong>Informes Personalizados</strong>: Los PDF generados incluyen:
                            <ul>
                              <li>Resumen ejecutivo con métricas clave</li>
                              <li>Gráficos de tendencias de conversación</li>
                              <li>Análisis de temas populares con gráficos</li>
                              <li>Rendimiento comparativo entre integraciones</li>
                              <li>Análisis de demanda de productos/servicios</li>
                            </ul>
                          </li>
                          <li><strong>Exportación de Datos</strong>: Descargue información en CSV para análisis adicionales</li>
                          <li><strong>Presentación Profesional</strong>: Diseño optimizado para presentaciones e informes ejecutivos</li>
                        </ul>
                        
                        <h3>Privacidad y Seguridad</h3>
                        <p>Todos los análisis se realizan respetando:</p>
                        
                        <ul>
                          <li>Anonimización de datos personales en todos los informes</li>
                          <li>Cumplimiento de normativas de privacidad (GDPR, CCPA)</li>
                          <li>Control de acceso basado en roles para informes sensibles</li>
                          <li>Políticas de retención de datos configurables</li>
                          <li>Cifrado de datos en informes exportados</li>
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
                          El módulo de Automatización de Tareas (Task Automation) de AIPPS permite crear flujos de trabajo inteligentes que ejecutan acciones predefinidas en respuesta a desencadenantes específicos. Esta funcionalidad avanzada reduce la carga de trabajo manual y garantiza respuestas consistentes y rápidas a situaciones recurrentes.
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
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("documentation.education")}</h2>
                      </div>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          {t("education.intro_text")}
                        </p>
                        
                        <h3>{t("education.specific_benefits")}</h3>
                        
                        <h4>{t("education.admission_process")}</h4>
                        <ul>
                          <li>{t("education.admission_benefit1")}</li>
                          <li>{t("education.admission_benefit2")}</li>
                          <li>{t("education.admission_benefit3")}</li>
                        </ul>
                        
                        <h4>{t("education.program_presentation")}</h4>
                        <ul>
                          <li>{t("education.program_detail1")}</li>
                          <li>{t("education.program_detail2")}</li>
                          <li>{t("education.program_detail3")}</li>
                        </ul>
                        
                        <h4>{t("education.lead_capture")}</h4>
                        <ul>
                          <li>{t("education.lead_capture1")}</li>
                          <li>{t("education.lead_capture2")}</li>
                          <li>{t("education.lead_capture3")}</li>
                        </ul>
                        
                        <h4>{t("education.international_support")}</h4>
                        <ul>
                          <li>{t("education.international1")}</li>
                          <li>{t("education.international2")}</li>
                          <li>{t("education.international3")}</li>
                        </ul>
                        
                        <h4>{t("education.trend_analysis")}</h4>
                        <ul>
                          <li>{t("education.trend1")}</li>
                          <li>{t("education.trend2")}</li>
                          <li>{t("education.trend3")}</li>
                          <li>{t("education.trend4")}</li>
                        </ul>
                        
                        <h3>{t("education.testimonials")}</h3>
                        <blockquote>
                          {t("education.testimonial_text")}
                          <cite>{t("education.testimonial_author")}</cite>
                        </blockquote>
                        
                        <div className="mt-8">
                          <Button size="lg" asChild>
                            <Link href="/get-started">{t("education.implement_button")}</Link>
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
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("documentation.business")}</h2>
                      </div>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          {t("business.intro_text")}
                        </p>
                        
                        <h3>{t("business.specific_benefits")}</h3>
                        
                        <h4>{t("business.lead_generation")}</h4>
                        <ul>
                          <li>{t("business.lead_gen1")}</li>
                          <li>{t("business.lead_gen2")}</li>
                          <li>{t("business.lead_gen3")}</li>
                        </ul>
                        
                        <h4>{t("business.customer_support")}</h4>
                        <ul>
                          <li>{t("business.support1")}</li>
                          <li>{t("business.support2")}</li>
                          <li>{t("business.support3")}</li>
                        </ul>
                        
                        <h4>{t("business.catalog_presentation")}</h4>
                        <ul>
                          <li>{t("business.catalog1")}</li>
                          <li>{t("business.catalog2")}</li>
                          <li>{t("business.catalog3")}</li>
                        </ul>
                        
                        <h4>{t("business.sales_optimization")}</h4>
                        <ul>
                          <li>{t("business.sales_opt1")}</li>
                          <li>{t("business.sales_opt2")}</li>
                          <li>{t("business.sales_opt3")}</li>
                        </ul>
                        
                        <h4>{t("business.behavior_analysis")}</h4>
                        <ul>
                          <li>{t("business.behavior1")}</li>
                          <li>{t("business.behavior2")}</li>
                          <li>{t("business.behavior3")}</li>
                          <li>{t("business.behavior4")}</li>
                        </ul>
                        
                        <h3>{t("business.testimonials")}</h3>
                        <blockquote>
                          {t("business.testimonial_text")}
                          <cite>{t("business.testimonial_author")}</cite>
                        </blockquote>
                        
                        <div className="mt-8">
                          <Button size="lg" asChild>
                            <Link href="/get-started">{t("business.implement_button")}</Link>
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
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("documentation.professional")}</h2>
                      </div>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          {t("professional.intro_text")}
                        </p>
                        
                        <h3>{t("professional.specific_benefits")}</h3>
                        
                        <h4>{t("professional.client_qualification")}</h4>
                        <ul>
                          <li>{t("professional.qualification1")}</li>
                          <li>{t("professional.qualification2")}</li>
                          <li>{t("professional.qualification3")}</li>
                        </ul>
                        
                        <h4>{t("professional.appointment_scheduling")}</h4>
                        <ul>
                          <li>{t("professional.scheduling1")}</li>
                          <li>{t("professional.scheduling2")}</li>
                          <li>{t("professional.scheduling3")}</li>
                        </ul>
                        
                        <h4>{t("professional.client_education")}</h4>
                        <ul>
                          <li>{t("professional.education1")}</li>
                          <li>{t("professional.education2")}</li>
                          <li>{t("professional.education3")}</li>
                        </ul>
                        
                        <h4>{t("professional.expectation_management")}</h4>
                        <ul>
                          <li>{t("professional.expectation1")}</li>
                          <li>{t("professional.expectation2")}</li>
                          <li>{t("professional.expectation3")}</li>
                        </ul>
                        
                        <h4>{t("professional.content_marketing")}</h4>
                        <ul>
                          <li>{t("professional.marketing1")}</li>
                          <li>{t("professional.marketing2")}</li>
                          <li>{t("professional.marketing3")}</li>
                          <li>{t("professional.marketing4")}</li>
                          <li>{t("professional.marketing5")}</li>
                        </ul>
                        
                        <h3>{t("professional.testimonials")}</h3>
                        <blockquote>
                          {t("professional.testimonial_text")}
                          <cite>{t("professional.testimonial_author")}</cite>
                        </blockquote>
                        
                        <div className="mt-8">
                          <Button size="lg" asChild>
                            <Link href="/get-started">{t("professional.implement_button")}</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "form-creation" && (
                  <div id="form-creation" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t("documentation.form_creation")}</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          {t("forms.intro_text")}
                        </p>
                        
                        <h3>{t("forms.available_types")}</h3>
                        <p>{t("forms.templates_intro")}</p>
                        
                        <ul>
                          <li><strong>{t("forms.contact_form")}</strong>: {t("forms.contact_form_desc")}</li>
                          <li><strong>{t("forms.waitlist_form")}</strong>: {t("forms.waitlist_form_desc")}</li>
                          <li><strong>{t("forms.survey_form")}</strong>: {t("forms.survey_form_desc")}</li>
                          <li><strong>{t("forms.feedback_form")}</strong>: {t("forms.feedback_form_desc")}</li>
                          <li><strong>{t("forms.lead_capture_form")}</strong>: {t("forms.lead_capture_form_desc")}</li>
                          <li><strong>{t("forms.custom_form")}</strong>: {t("forms.custom_form_desc")}</li>
                        </ul>
                        
                        <h3>{t("forms.main_features")}</h3>
                        <ul>
                          <li><strong>{t("forms.flexible_design")}</strong>: {t("forms.flexible_design_desc")}</li>
                          <li><strong>{t("forms.configurable_fields")}</strong>: {t("forms.configurable_fields_desc")}</li>
                          <li><strong>{t("forms.advanced_validation")}</strong>: {t("forms.advanced_validation_desc")}</li>
                          <li><strong>{t("forms.conditional_logic")}</strong>: {t("forms.conditional_logic_desc")}</li>
                          <li><strong>{t("forms.ai_integration")}</strong>: {t("forms.ai_integration_desc")}</li>
                          <li><strong>{t("forms.captcha_protection")}</strong>: {t("forms.captcha_protection_desc")}</li>
                          <li><strong>{t("forms.email_notifications")}</strong>: {t("forms.email_notifications_desc")}</li>
                          <li><strong>{t("forms.detailed_analytics")}</strong>: {t("forms.detailed_analytics_desc")}</li>
                          <li><strong>{t("forms.response_sorting")}</strong>: {t("forms.response_sorting_desc")}</li>
                        </ul>
                        
                        <h3>{t("forms.creation_process")}</h3>
                        <ol>
                          <li><strong>{t("forms.access_dashboard")}</strong>: {t("forms.access_dashboard_desc")}</li>
                          <li><strong>{t("forms.create_new")}</strong>: {t("forms.create_new_desc")}</li>
                          <li><strong>{t("forms.basic_config")}</strong>: {t("forms.basic_config_desc")}</li>
                          <li><strong>{t("forms.design_fields")}</strong>: {t("forms.design_fields_desc")}</li>
                          <li><strong>{t("forms.customization")}</strong>: {t("forms.customization_desc")}</li>
                          <li><strong>{t("forms.advanced_config")}</strong>: {t("forms.advanced_config_desc")}</li>
                          <li><strong>{t("forms.preview")}</strong>: {t("forms.preview_desc")}</li>
                          <li><strong>{t("forms.publication")}</strong>: {t("forms.publication_desc")}</li>
                        </ol>
                        
                        <h3>{t("forms.integration_methods")}</h3>
                        <p>
                          {t("forms.simplified_process")}
                        </p>
                        
                        <h4>{t("forms.direct_embed")}</h4>
                        <p>
                          {t("forms.direct_embed_desc")}
                        </p>
                        
                        <ol>
                          <li><strong>{t("forms.get_code")}</strong>: {t("forms.get_code_desc")}</li>
                          <li><strong>{t("forms.copy_code")}</strong>: {t("forms.copy_code_desc")}</li>
                          <li><strong>{t("forms.insert_code")}</strong>: {t("forms.insert_code_desc")}</li>
                        </ol>
                        
                        <p>{t("forms.code_example")}</p>
                        
                        <pre><code>&lt;script src="https://tu-dominio.com/api/forms/embed/[ID_DEL_FORMULARIO]"&gt;&lt;/script&gt;
&lt;div id="aipi-form-[ID_DEL_FORMULARIO]"&gt;&lt;/div&gt;</code></pre>
                        
                        <p><strong>{t("forms.customization_options")}</strong>: {t("forms.modal_instructions")}</p>
                        <ul>
                          <li>{t("forms.customize_style")}</li>
                          <li>{t("forms.configure_actions")}</li>
                          <li>{t("forms.implement_validations")}</li>
                          <li>{t("forms.analytics_integration")}</li>
                        </ul>
                        
                        <p><strong>{t("forms.technical_considerations")}</strong>:</p>
                        <ul>
                          <li>{t("forms.works_with_cms")}</li>
                          <li>{t("forms.async_loading")}</li>
                          <li>{t("forms.secure_data")}</li>
                          <li>{t("forms.spam_protection")}</li>
                          <li>{t("forms.responsive_design")}</li>
                        </ul>
                        
                        <h3>{t("forms.improved_response_management")}</h3>
                        <p>{t("forms.advanced_capabilities")}</p>
                        <ul>
                          <li><strong>{t("forms.view_responses")}</strong>: {t("forms.view_responses_desc")}</li>
                          <li><strong>{t("forms.export_data")}</strong>: {t("forms.export_data_desc")}</li>
                          <li><strong>{t("forms.filter_sort")}</strong>: {t("forms.filter_sort_desc")}</li>
                          <li><strong>{t("forms.automatic_analysis")}</strong>: {t("forms.automatic_analysis_desc")}</li>
                          <li><strong>{t("forms.follow_up")}</strong>: {t("forms.follow_up_desc")}</li>
                          <li><strong>{t("forms.realtime_notifications")}</strong>: {t("forms.realtime_notifications_desc")}</li>
                        </ul>
                        
                        <h3>{t("forms.widget_integration")}</h3>
                        <p>{t("forms.widget_integration_desc")}</p>
                        <ul>
                          <li>{t("forms.present_forms")}</li>
                          <li>{t("forms.autocomplete_fields")}</li>
                          <li>{t("forms.continue_conversation")}</li>
                          <li>{t("forms.provide_assistance")}</li>
                        </ul>
                        
                        <h3>{t("forms.popular_use_cases")}</h3>
                        <ul>
                          <li><strong>{t("forms.education_use")}</strong>: {t("forms.education_use_desc")}</li>
                          <li><strong>{t("forms.business_use")}</strong>: {t("forms.business_use_desc")}</li>
                          <li><strong>{t("forms.professional_use")}</strong>: {t("forms.professional_use_desc")}</li>
                          <li><strong>{t("forms.ecommerce_use")}</strong>: {t("forms.ecommerce_use_desc")}</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Button size="lg" asChild>
                        <Link href="/dashboard/forms">{t("forms.create_first_button")}</Link>
                      </Button>
                    </div>
                  </div>
                )}
                
                {activeTab === "implementation" && (
                  <div id="implementation" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-4">
                        <Code className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("documentation.implementation")}</h2>
                      </div>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          {t("implementation.intro_text")}
                        </p>
                        
                        <h3>{t("implementation.process_title")}</h3>
                        
                        <h4>{t("implementation.step1_title")}</h4>
                        <p>
                          {t("implementation.step1_desc")}
                        </p>
                        <ul>
                          <li>{t("implementation.widget_option")}</li>
                          <li>{t("implementation.fullscreen_option")}</li>
                        </ul>
                        <p>
                          {t("implementation.wordpress_note")}
                        </p>
                        
                        <h4>{t("implementation.step2_title")}</h4>
                        <p>
                          {t("implementation.step2_desc")}
                        </p>
                        <ul>
                          <li>{t("implementation.customize_colors")}</li>
                          <li>{t("implementation.customize_position")}</li>
                          <li>{t("implementation.customize_welcome")}</li>
                          <li>{t("implementation.customize_languages")}</li>
                          <li>{t("implementation.customize_personality")}</li>
                        </ul>
                        
                        <h4>{t("implementation.step3_title")}</h4>
                        <p>
                          {t("implementation.step3_desc")}
                        </p>
                        <ul>
                          <li>{t("implementation.upload_pdf")}</li>
                          <li>{t("implementation.upload_docx")}</li>
                          <li>{t("implementation.upload_excel")}</li>
                          <li>{t("implementation.write_instructions")}</li>
                        </ul>
                        <p>
                          {t("implementation.urls_note")}
                        </p>
                        
                        <h4>{t("implementation.step4_title")}</h4>
                        <p>
                          {t("implementation.step4_desc")}
                        </p>
                        <ul>
                          <li>{t("implementation.monitor_conversations")}</li>
                          <li>{t("implementation.review_metrics")}</li>
                          <li>{t("implementation.access_leads")}</li>
                          <li>{t("implementation.refine_training")}</li>
                          <li>{t("implementation.isolated_stats")}</li>
                        </ul>
                        
                        <h3>{t("implementation.technical_requirements")}</h3>
                        <p>
                          {t("implementation.compatibility_intro")}
                        </p>
                        <ul>
                          <li>{t("implementation.cms_compatibility")}</li>
                          <li>{t("implementation.html_compatibility")}</li>
                          <li>{t("implementation.js_compatibility")}</li>
                          <li>{t("implementation.no_server_mods")}</li>
                        </ul>
                        
                        <div className="mt-8">
                          <Button size="lg" asChild>
                            <Link href="/get-started">{t("implementation.start_button")}</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "forms" && (
                  <div id="forms" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Formularios Integrados</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          AIPPS ofrece un sistema completo de formularios que se integra perfectamente con tu chatbot,
                          permitiendo capturar información específica de usuarios y leads de manera inteligente y contextual.
                        </p>
                        
                        <h3>Tipos de Formularios Disponibles</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                          <div className="border border-primary-200 dark:border-primary-800 rounded-lg p-5 bg-primary-50 dark:bg-gray-800">
                            <div className="flex items-center mb-3">
                              <Users className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                              <h4 className="text-lg font-bold text-primary-700 dark:text-primary-400">Formularios de Leads</h4>
                            </div>
                            <p className="mb-3">
                              Captura información de contacto de visitantes interesados en tus servicios o programas educativos.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Información de contacto básica</li>
                              <li>Intereses específicos del usuario</li>
                              <li>Seguimiento automático por email</li>
                              <li>Integración con CRM</li>
                            </ul>
                          </div>
                          
                          <div className="border border-primary-200 dark:border-primary-800 rounded-lg p-5 bg-primary-50 dark:bg-gray-800">
                            <div className="flex items-center mb-3">
                              <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
                              <h4 className="text-lg font-bold text-primary-700 dark:text-primary-400">Formularios de Registro</h4>
                            </div>
                            <p className="mb-3">
                              Permite a los usuarios registrarse directamente desde el chat para acceder a funcionalidades avanzadas.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Registro de usuarios con validación</li>
                              <li>Autenticación segura</li>
                              <li>Perfiles personalizados</li>
                              <li>Historial de conversaciones</li>
                            </ul>
                          </div>
                        </div>
                        
                        <h3>Integración con Widget de Pantalla Completa</h3>
                        <p>
                          Los formularios se integran especialmente bien con el widget de pantalla completa, que incluye
                          un sistema completo de autenticación de usuarios:
                        </p>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 my-4">
                          <h4 className="font-semibold text-lg mb-3">Funcionalidades de Autenticación:</h4>
                          <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Sistema de Registro:</strong> Los usuarios pueden crear cuentas personalizadas directamente desde el chat</li>
                            <li><strong>Login Seguro:</strong> Autenticación con tokens JWT para sesiones seguras</li>
                            <li><strong>Historial Personal:</strong> Cada usuario tiene acceso a su historial completo de conversaciones</li>
                            <li><strong>Gestión de Conversaciones:</strong> Crear, eliminar y organizar conversaciones con títulos automáticos</li>
                            <li><strong>Información Personalizada:</strong> Perfil de usuario con timestamps y datos relevantes</li>
                          </ul>
                        </div>
                        
                        <h3>Configuración y Personalización</h3>
                        <p>
                          Los formularios pueden ser completamente personalizados para adaptarse a las necesidades específicas
                          de tu organización:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                            <h5 className="font-semibold mb-2">Campos Personalizados</h5>
                            <p className="text-sm">Agrega campos específicos según tus necesidades de negocio</p>
                          </div>
                          
                          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                            <h5 className="font-semibold mb-2">Validación Avanzada</h5>
                            <p className="text-sm">Reglas de validación personalizadas para garantizar calidad de datos</p>
                          </div>
                          
                          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                            <h5 className="font-semibold mb-2">Integración API</h5>
                            <p className="text-sm">Conecta con sistemas externos y CRMs automáticamente</p>
                          </div>
                        </div>
                        
                        <div className="mt-8">
                          <Button size="lg" asChild>
                            <Link href="/get-started">Configurar Formularios</Link>
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