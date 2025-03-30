import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Code, Building2, School, Headset, Rocket, BookOpen, MessageSquare, BarChart, Users, Bot, File } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Documentation() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Documentación de AIPI
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Todo lo que necesitas saber sobre nuestra plataforma de asistencia inteligente
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
                        <span>Descripción General</span>
                      </div>
                    </a>
                    <a 
                      href="#features" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("features"); }}
                      className={`block px-3 py-2 rounded-md ${activeTab === "features" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <Rocket className="w-5 h-5 mr-2" />
                        <span>Funcionalidades</span>
                      </div>
                    </a>
                    <a 
                      href="#education" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("education"); }}
                      className={`block px-3 py-2 rounded-md ${activeTab === "education" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <School className="w-5 h-5 mr-2" />
                        <span>Instituciones Educativas</span>
                      </div>
                    </a>
                    <a 
                      href="#business" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("business"); }}
                      className={`block px-3 py-2 rounded-md ${activeTab === "business" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <Building2 className="w-5 h-5 mr-2" />
                        <span>Empresas y Negocios</span>
                      </div>
                    </a>
                    <a 
                      href="#professional" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("professional"); }}
                      className={`block px-3 py-2 rounded-md ${activeTab === "professional" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <Headset className="w-5 h-5 mr-2" />
                        <span>Servicios Profesionales</span>
                      </div>
                    </a>
                    <a 
                      href="#implementation" 
                      onClick={(e) => { e.preventDefault(); setActiveTab("implementation"); }}
                      className={`block px-3 py-2 rounded-md ${activeTab === "implementation" ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <div className="flex items-center">
                        <Code className="w-5 h-5 mr-2" />
                        <span>Implementación</span>
                      </div>
                    </a>
                  </nav>
                </div>
              </div>
              
              <div className="md:w-3/4">
                {activeTab === "overview" && (
                  <div id="overview" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AIPI: Asistencia Inteligente para Instituciones y Empresas</h2>
                      
                      <div className="prose dark:prose-invert max-w-none">
                        <p>
                          AIPI es una plataforma avanzada de asistencia por chat impulsada por inteligencia artificial, 
                          diseñada específicamente para ayudar a instituciones educativas, empresas y comercios a transformar 
                          la forma en que interactúan con sus clientes y estudiantes potenciales. En un contexto donde la 
                          sobrecarga de información se ha vuelto un problema significativo, AIPI simplifica la experiencia 
                          del usuario ofreciendo respuestas precisas a través de un agente virtual inteligente.
                        </p>
                        
                        <h3>Problema que Resuelve</h3>
                        <p>
                          Actualmente, las instituciones educativas como CEGEPs y colegios, así como empresas de diversos 
                          sectores, enfrentan el desafío de presentar grandes cantidades de información en sus sitios web. 
                          Los visitantes a menudo se sienten abrumados por este volumen de datos y abandonan el sitio sin 
                          encontrar lo que buscan, resultando en oportunidades perdidas tanto para la institución como para el visitante.
                        </p>
                        <p>
                          AIPI aborda este problema permitiendo a los visitantes interactuar con un asistente virtual que:
                        </p>
                        <ul>
                          <li>Busca información específica entre grandes volúmenes de datos institucionales</li>
                          <li>Responde preguntas en lenguaje natural</li>
                          <li>Personaliza respuestas según el contexto de la conversación</li>
                          <li>Guarda registros de las interacciones para seguimiento posterior</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                          <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                          <h3 className="text-xl font-bold">Respuestas Contextuales</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          El asistente virtual comprende el contexto del sitio web y proporciona respuestas precisas basadas en el contenido oficial de tu institución o empresa.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                          <Database className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                          <h3 className="text-xl font-bold">Base de Conocimiento</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          Entrena a tu asistente con documentos específicos como PDFs, DOCXs o hojas de cálculo para responder preguntas detalladas sobre tus programas o servicios.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                          <Users className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                          <h3 className="text-xl font-bold">Generación de Leads</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          Captura información de contacto de visitantes interesados para seguimiento posterior, convirtiendo visitas web en oportunidades de admisión o venta.
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                          <BarChart className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
                          <h3 className="text-xl font-bold">Análisis Detallado</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          Obtén estadísticas valiosas sobre conversaciones, preguntas frecuentes y áreas de mayor interés para optimizar tu oferta educativa o comercial.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-10">
                      <Button size="lg" asChild>
                        <Link href="/get-started">Comenzar Ahora</Link>
                      </Button>
                    </div>
                  </div>
                )}
                
                {activeTab === "features" && (
                  <div id="features" className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Principales Funcionalidades</h2>
                      
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
                        
                        <h3>6. Automatización de Tareas</h3>
                        <p>AIPI puede configurarse para:</p>
                        <ul>
                          <li>Responder automáticamente preguntas frecuentes</li>
                          <li>Programar seguimientos basados en el interés mostrado</li>
                          <li>Proporcionar información preliminar antes de conectar con un humano</li>
                          <li>Recopilar datos específicos necesarios para el proceso de admisión o venta</li>
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