/**
 * Servidor de aplicación extremadamente simplificado
 * Este servidor es un respaldo de último recurso para lograr un despliegue funcional
 */
const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal que retorna el HTML directamente
app.get('/', (req, res) => {
  // Contenido HTML directo para la página de inicio
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIPI - Plataforma de IA Conversacional</title>
  <style>
    :root {
      --primary: #4a6cf7;
      --primary-foreground: white;
      --background: #f8f9fc;
      --card: white;
      --card-foreground: #24292f;
      --border: #e5e7eb;
      --input: #f3f4f6;
      --ring: #4a6cf7;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: var(--card-foreground);
      background-color: var(--background);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    header {
      background-color: var(--card);
      border-bottom: 1px solid var(--border);
      padding: 1rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      flex: 1;
    }
    
    .logo {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
      background: linear-gradient(90deg, #4a6cf7, #0096ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    
    .nav-link {
      text-decoration: none;
      color: var(--card-foreground);
      font-weight: 500;
      transition: color 0.2s ease;
    }
    
    .nav-link:hover {
      color: var(--primary);
    }
    
    .nav-link.active {
      color: var(--primary);
    }
    
    .auth-links {
      display: flex;
      gap: 1rem;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      font-weight: 500;
      padding: 0.5rem 1rem;
      transition: all 0.2s ease;
      cursor: pointer;
      text-decoration: none;
    }
    
    .btn-primary {
      background: linear-gradient(90deg, #4a6cf7, #0096ff);
      color: white;
      border: none;
    }
    
    .btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    .btn-outline {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--card-foreground);
    }
    
    .btn-outline:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    
    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 4rem 1rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .hero h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      background: linear-gradient(90deg, #4a6cf7, #0096ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .hero p {
      font-size: 1.25rem;
      color: #6b7280;
      margin-bottom: 2rem;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 3rem 0;
    }
    
    .feature-card {
      background: var(--card);
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    
    .feature-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: rgba(74, 108, 247, 0.1);
      color: var(--primary);
      border-radius: 12px;
      margin-bottom: 1rem;
    }
    
    .feature-card h3 {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }
    
    .pricing {
      background: var(--card);
      padding: 3rem 0;
      margin: 3rem 0;
      border-radius: 12px;
    }
    
    .pricing-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .pricing-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    .pricing-description {
      color: #6b7280;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .pricing-plans {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      padding: 0 2rem;
    }
    
    .pricing-plan {
      background: var(--background);
      border-radius: 8px;
      padding: 2rem;
      position: relative;
      overflow: hidden;
      border: 1px solid var(--border);
      transition: all 0.3s ease;
    }
    
    .pricing-plan.popular {
      border-color: var(--primary);
      box-shadow: 0 8px 30px rgba(74, 108, 247, 0.12);
    }
    
    .popular-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: linear-gradient(90deg, #4a6cf7, #0096ff);
      color: white;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }
    
    .plan-name {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .plan-price {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .plan-billing {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }
    
    .plan-features {
      list-style: none;
      margin-bottom: 2rem;
    }
    
    .plan-features li {
      padding: 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .plan-features li::before {
      content: "✓";
      color: var(--primary);
      font-weight: bold;
    }
    
    .testimonials {
      padding: 3rem 0;
    }
    
    .testimonials-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .testimonials-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    .testimonial-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .testimonial-card {
      background: var(--card);
      border-radius: 8px;
      padding: 2rem;
      border: 1px solid var(--border);
    }
    
    .testimonial-content {
      margin-bottom: 1.5rem;
      color: #4b5563;
      font-style: italic;
    }
    
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .author-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #4b5563;
    }
    
    .author-info h4 {
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }
    
    .author-info p {
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    .cta {
      background: linear-gradient(90deg, rgba(74, 108, 247, 0.05), rgba(0, 150, 255, 0.05));
      padding: 3rem 2rem;
      border-radius: 12px;
      text-align: center;
      margin: 3rem 0;
    }
    
    .cta h2 {
      font-size: 1.875rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    .cta p {
      color: #6b7280;
      max-width: 600px;
      margin: 0 auto 2rem auto;
    }
    
    footer {
      background: var(--card);
      border-top: 1px solid var(--border);
      padding: 2rem 1rem;
    }
    
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      gap: 3rem;
      justify-content: space-between;
    }
    
    .footer-logo {
      flex: 1;
      min-width: 250px;
    }
    
    .footer-description {
      color: #6b7280;
      margin: 1rem 0;
    }
    
    .footer-links {
      flex: 2;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 2rem;
    }
    
    .footer-column h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    .footer-column ul {
      list-style: none;
    }
    
    .footer-column ul li {
      margin-bottom: 0.5rem;
    }
    
    .footer-column ul li a {
      color: #6b7280;
      text-decoration: none;
      transition: color 0.2s ease;
      font-size: 0.875rem;
    }
    
    .footer-column ul li a:hover {
      color: var(--primary);
    }
    
    .copyright {
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
      padding: 1rem 0;
      border-top: 1px solid var(--border);
      margin-top: 2rem;
    }
    
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem;
      }
      
      .pricing-plans, .testimonial-cards {
        grid-template-columns: 1fr;
      }
      
      .nav-links {
        display: none;
      }
      
      .footer-content {
        flex-direction: column;
        gap: 2rem;
      }
    }
  </style>
</head>
<body>
  <header>
    <nav>
      <a href="/" class="logo">AIPI</a>
      
      <div class="nav-links">
        <a href="#features" class="nav-link">Características</a>
        <a href="#pricing" class="nav-link">Precios</a>
        <a href="#testimonials" class="nav-link">Testimonios</a>
        <a href="#contact" class="nav-link">Contacto</a>
      </div>
      
      <div class="auth-links">
        <a href="/login" class="btn btn-outline">Iniciar Sesión</a>
        <a href="/register" class="btn btn-primary">Registrarse</a>
      </div>
    </nav>
  </header>
  
  <main class="container">
    <section class="hero">
      <h1>Plataforma de IA Conversacional</h1>
      <p>Mejora la experiencia en tu sitio web con asistentes virtuales inteligentes, formularios adaptativos y automatización de tareas.</p>
      <a href="/dashboard" class="btn btn-primary">Comenzar Ahora</a>
    </section>
    
    <section id="features" class="features">
      <div class="feature-card">
        <div class="feature-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <h3>Widget de Chat IA</h3>
        <p>Integra un asistente virtual en tu sitio web que responda a las preguntas de tus visitantes y les ayude en sus tareas.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
        </div>
        <h3>Formularios Inteligentes</h3>
        <p>Crea formularios adaptativos que se ajusten a las respuestas de los usuarios, mejorando la experiencia y las tasas de conversión.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <h3>Programación de Citas</h3>
        <p>Automatiza la programación de citas y reuniones con integración de calendarios de Google y Outlook.</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        </div>
        <h3>Análisis Avanzado</h3>
        <p>Obtén insights valiosos sobre las conversaciones y el comportamiento de los usuarios para mejorar tu estrategia.</p>
      </div>
    </section>
    
    <section id="pricing" class="pricing">
      <div class="pricing-header">
        <h2 class="pricing-title">Planes de Precios</h2>
        <p class="pricing-description">Elige el plan que mejor se adapte a las necesidades de tu negocio. Todos incluyen actualizaciones y soporte.</p>
      </div>
      
      <div class="pricing-plans">
        <div class="pricing-plan">
          <h3 class="plan-name">Gratis</h3>
          <div class="plan-price">$0</div>
          <div class="plan-billing">Por siempre</div>
          <ul class="plan-features">
            <li>20 conversaciones por día</li>
            <li>1 widget de chat</li>
            <li>1 formulario</li>
            <li>Análisis básico</li>
          </ul>
          <a href="/register" class="btn btn-outline">Comenzar Gratis</a>
        </div>
        
        <div class="pricing-plan popular">
          <span class="popular-badge">Popular</span>
          <h3 class="plan-name">Profesional</h3>
          <div class="plan-price">$49</div>
          <div class="plan-billing">por mes</div>
          <ul class="plan-features">
            <li>500 conversaciones por mes</li>
            <li>Widgets ilimitados</li>
            <li>10 formularios</li>
            <li>Análisis avanzado</li>
            <li>Integración con calendarios</li>
          </ul>
          <a href="/register" class="btn btn-primary">Elegir Plan</a>
        </div>
        
        <div class="pricing-plan">
          <h3 class="plan-name">Empresa</h3>
          <div class="plan-price">$149</div>
          <div class="plan-billing">por mes</div>
          <ul class="plan-features">
            <li>Conversaciones ilimitadas</li>
            <li>Widgets personalizados</li>
            <li>Formularios ilimitados</li>
            <li>API completa</li>
            <li>Soporte prioritario</li>
            <li>Entrenamiento personalizado</li>
          </ul>
          <a href="/register" class="btn btn-outline">Contactar Ventas</a>
        </div>
      </div>
    </section>
    
    <section id="testimonials" class="testimonials">
      <div class="testimonials-header">
        <h2 class="testimonials-title">Lo que dicen nuestros clientes</h2>
      </div>
      
      <div class="testimonial-cards">
        <div class="testimonial-card">
          <p class="testimonial-content">"AIPI ha transformado por completo la forma en que interactuamos con nuestros clientes. Las tasas de conversión aumentaron un 35% desde que implementamos el widget conversacional."</p>
          <div class="testimonial-author">
            <div class="author-avatar">MA</div>
            <div class="author-info">
              <h4>María Álvarez</h4>
              <p>Directora de Marketing, TechSolutions</p>
            </div>
          </div>
        </div>
        
        <div class="testimonial-card">
          <p class="testimonial-content">"Los formularios inteligentes nos permitieron captar información mucho más relevante de nuestros clientes potenciales, mejorando significativamente nuestras ventas."</p>
          <div class="testimonial-author">
            <div class="author-avatar">JR</div>
            <div class="author-info">
              <h4>Juan Rodríguez</h4>
              <p>CEO, Innovatech</p>
            </div>
          </div>
        </div>
        
        <div class="testimonial-card">
          <p class="testimonial-content">"La integración con calendarios y la programación automática de citas eliminó la fricción en nuestro proceso de ventas. Altamente recomendado."</p>
          <div class="testimonial-author">
            <div class="author-avatar">LC</div>
            <div class="author-info">
              <h4>Laura Campos</h4>
              <p>Gerente de Ventas, GlobalSoft</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section id="contact" class="cta">
      <h2>¿Listo para transformar tu presencia digital?</h2>
      <p>Únete a miles de empresas que ya están aprovechando el poder de la IA conversacional para mejorar la experiencia de sus clientes.</p>
      <a href="/register" class="btn btn-primary">Empezar Ahora</a>
    </section>
  </main>
  
  <footer>
    <div class="footer-content">
      <div class="footer-logo">
        <a href="/" class="logo">AIPI</a>
        <p class="footer-description">Plataforma de IA Conversacional que ayuda a las empresas a mejorar la experiencia de sus clientes mediante asistentes virtuales inteligentes y automatización.</p>
      </div>
      
      <div class="footer-links">
        <div class="footer-column">
          <h3>Producto</h3>
          <ul>
            <li><a href="#features">Características</a></li>
            <li><a href="#pricing">Precios</a></li>
            <li><a href="#">Integraciones</a></li>
            <li><a href="#">Novedades</a></li>
          </ul>
        </div>
        
        <div class="footer-column">
          <h3>Recursos</h3>
          <ul>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Documentación</a></li>
            <li><a href="#">Guías</a></li>
            <li><a href="#">Webinars</a></li>
          </ul>
        </div>
        
        <div class="footer-column">
          <h3>Compañía</h3>
          <ul>
            <li><a href="#">Sobre nosotros</a></li>
            <li><a href="#">Contacto</a></li>
            <li><a href="#">Carreras</a></li>
            <li><a href="#">Clientes</a></li>
          </ul>
        </div>
        
        <div class="footer-column">
          <h3>Legal</h3>
          <ul>
            <li><a href="#">Términos de servicio</a></li>
            <li><a href="#">Política de privacidad</a></li>
            <li><a href="#">Cookies</a></li>
            <li><a href="#">GDPR</a></li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="copyright">
      <p>&copy; 2025 AIPI. Todos los derechos reservados.</p>
    </div>
  </footer>
</body>
</html>`;
  
  res.send(html);
});

// Endpoints de la API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Ruta para la página de inicio de sesión
app.get('/login', (req, res) => {
  // Contenido HTML para la página de inicio de sesión
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iniciar Sesión - AIPI</title>
  <style>
    :root {
      --primary: #4a6cf7;
      --primary-foreground: white;
      --background: #f8f9fc;
      --card: white;
      --card-foreground: #24292f;
      --border: #e5e7eb;
      --input: #f3f4f6;
      --ring: #4a6cf7;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: var(--card-foreground);
      background-color: var(--background);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    
    .login-container {
      width: 100%;
      max-width: 400px;
      background: var(--card);
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
      padding: 2rem;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .logo {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
      background: linear-gradient(90deg, #4a6cf7, #0096ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
      display: inline-block;
    }
    
    .login-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .login-description {
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--input);
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }
    
    input:focus {
      outline: none;
      border-color: var(--ring);
      box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
    }
    
    .form-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    
    .remember-me {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .remember-me input {
      width: auto;
    }
    
    .forgot-password {
      font-size: 0.875rem;
      color: var(--primary);
      text-decoration: none;
    }
    
    .login-button {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(90deg, #4a6cf7, #0096ff);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .login-button:hover {
      opacity: 0.9;
    }
    
    .divider {
      display: flex;
      align-items: center;
      margin: 1.5rem 0;
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    .divider::before, .divider::after {
      content: "";
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    
    .divider::before {
      margin-right: 1rem;
    }
    
    .divider::after {
      margin-left: 1rem;
    }
    
    .social-login {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .social-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: white;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .social-button:hover {
      background: var(--input);
    }
    
    .register-link {
      text-align: center;
      font-size: 0.875rem;
    }
    
    .register-link a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="login-header">
      <a href="/" class="logo">AIPI</a>
      <h1 class="login-title">Iniciar Sesión</h1>
      <p class="login-description">Ingresa tus credenciales para acceder a tu cuenta</p>
    </div>
    
    <form id="login-form">
      <div class="form-group">
        <label for="username">Usuario o Correo Electrónico</label>
        <input type="text" id="username" name="username" required>
      </div>
      
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input type="password" id="password" name="password" required>
      </div>
      
      <div class="form-footer">
        <div class="remember-me">
          <input type="checkbox" id="remember" name="remember">
          <label for="remember">Recordarme</label>
        </div>
        
        <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
      </div>
      
      <button type="submit" class="login-button">Iniciar Sesión</button>
    </form>
    
    <div class="divider">o continúa con</div>
    
    <div class="social-login">
      <button class="social-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#4285F4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
        Google
      </button>
      
      <button class="social-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
        Facebook
      </button>
    </div>
    
    <p class="register-link">¿No tienes una cuenta? <a href="/register">Regístrate</a></p>
  </div>

  <script>
    document.getElementById('login-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // Demo: Credenciales de prueba
      if (username === 'admin' && password === 'admin1726') {
        alert('Inicio de sesión exitoso!');
        window.location.href = '/dashboard';
      } else {
        alert('Credenciales incorrectas. Usa admin/admin1726 para el demo.');
      }
    });
  </script>
</body>
</html>`;
  
  res.send(html);
});

// Ruta para el dashboard (simulado)
app.get('/dashboard', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - AIPI</title>
  <style>
    :root {
      --primary: #4a6cf7;
      --primary-foreground: white;
      --background: #f8f9fc;
      --card: white;
      --card-foreground: #24292f;
      --border: #e5e7eb;
      --input: #f3f4f6;
      --ring: #4a6cf7;
      --sidebar-width: 240px;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: var(--card-foreground);
      background-color: var(--background);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
    }
    
    .sidebar {
      width: var(--sidebar-width);
      background: var(--card);
      border-right: 1px solid var(--border);
      padding: 1.5rem 1rem;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      overflow-y: auto;
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
      background: linear-gradient(90deg, #4a6cf7, #0096ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: block;
      margin-bottom: 2rem;
    }
    
    .nav-section {
      margin-bottom: 1.5rem;
    }
    
    .nav-section-title {
      font-size: 0.75rem;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
      padding-left: 0.5rem;
    }
    
    .nav-links {
      list-style: none;
    }
    
    .nav-item {
      margin-bottom: 0.25rem;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 6px;
      text-decoration: none;
      color: var(--card-foreground);
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .nav-link:hover {
      background: rgba(0, 0, 0, 0.03);
    }
    
    .nav-link.active {
      background: rgba(74, 108, 247, 0.08);
      color: var(--primary);
    }
    
    .nav-link svg {
      width: 18px;
      height: 18px;
    }
    
    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
    }
    
    .dashboard-header {
      background: var(--card);
      border-bottom: 1px solid var(--border);
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .page-title {
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .notification-btn {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
    }
    
    .notification-btn:hover {
      background: rgba(0, 0, 0, 0.03);
    }
    
    .notification-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #ef4444;
      color: white;
      font-size: 0.75rem;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    
    .user-info:hover {
      background: rgba(0, 0, 0, 0.03);
    }
    
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-weight: 500;
      font-size: 0.875rem;
    }
    
    .user-role {
      font-size: 0.75rem;
      color: #6b7280;
    }
    
    .dashboard-container {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .dashboard-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stats-card {
      background: var(--card);
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    
    .stats-title {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .stats-value {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .stats-trend {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
    }
    
    .trend-up {
      color: #10b981;
    }
    
    .trend-down {
      color: #ef4444;
    }
    
    .dashboard-content {
      display: grid;
      grid-template-columns: 3fr 1fr;
      gap: 1.5rem;
    }
    
    .chart-card {
      background: var(--card);
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      height: 400px;
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .chart-title {
      font-size: 1rem;
      font-weight: 600;
    }
    
    .chart-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .chart-action {
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 4px;
      border: none;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    
    .chart-action:hover {
      background: rgba(0, 0, 0, 0.06);
    }
    
    .chart-container {
      height: calc(100% - 3rem);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      text-align: center;
      font-size: 0.875rem;
    }
    
    .recent-activity {
      background: var(--card);
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    
    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    .activity-title {
      font-size: 1rem;
      font-weight: 600;
    }
    
    .activity-list {
      list-style: none;
    }
    
    .activity-item {
      position: relative;
      padding-left: 2rem;
      padding-bottom: 1.25rem;
    }
    
    .activity-item:before {
      content: "";
      position: absolute;
      left: 0.5rem;
      top: 0;
      width: 1px;
      height: 100%;
      background: var(--border);
    }
    
    .activity-item:last-child {
      padding-bottom: 0;
    }
    
    .activity-item:last-child:before {
      display: none;
    }
    
    .activity-icon {
      position: absolute;
      left: 0;
      top: 0;
      width: 1rem;
      height: 1rem;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.5rem;
    }
    
    .activity-content {
      font-size: 0.875rem;
    }
    
    .activity-time {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
    
    .activity-view-all {
      margin-top: 1rem;
      text-align: center;
    }
    
    .view-all-link {
      font-size: 0.875rem;
      color: var(--primary);
      text-decoration: none;
    }
    
    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        height: auto;
        position: relative;
        left: auto;
        top: auto;
        overflow: auto;
      }
      
      .dashboard-layout {
        flex-direction: column;
      }
      
      .main-content {
        margin-left: 0;
      }
      
      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <a href="/" class="logo">AIPI</a>
      
      <div class="nav-section">
        <div class="nav-section-title">Principal</div>
        <ul class="nav-links">
          <li class="nav-item">
            <a href="/dashboard" class="nav-link active">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
              Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a href="/dashboard/integrations" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
              Integraciones
            </a>
          </li>
          <li class="nav-item">
            <a href="/dashboard/conversations" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Conversaciones
            </a>
          </li>
        </ul>
      </div>
      
      <div class="nav-section">
        <div class="nav-section-title">Herramientas</div>
        <ul class="nav-links">
          <li class="nav-item">
            <a href="/dashboard/forms" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              Formularios
            </a>
          </li>
          <li class="nav-item">
            <a href="/dashboard/calendar" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Calendario
            </a>
          </li>
          <li class="nav-item">
            <a href="/dashboard/automation" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Automatización
            </a>
          </li>
        </ul>
      </div>
      
      <div class="nav-section">
        <div class="nav-section-title">Configuración</div>
        <ul class="nav-links">
          <li class="nav-item">
            <a href="/dashboard/settings" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Configuración
            </a>
          </li>
          <li class="nav-item">
            <a href="/dashboard/billing" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              Facturación
            </a>
          </li>
        </ul>
      </div>
    </aside>
    
    <main class="main-content">
      <header class="dashboard-header">
        <h1 class="page-title">Dashboard</h1>
        
        <div class="user-menu">
          <button class="notification-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span class="notification-badge">3</span>
          </button>
          
          <div class="user-info">
            <div class="user-avatar">A</div>
            <div class="user-details">
              <span class="user-name">Admin</span>
              <span class="user-role">Administrador</span>
            </div>
          </div>
        </div>
      </header>
      
      <div class="dashboard-container">
        <section class="dashboard-overview">
          <div class="stats-card">
            <div class="stats-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Conversaciones
            </div>
            <div class="stats-value">1,248</div>
            <div class="stats-trend trend-up">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              12.5% vs. mes anterior
            </div>
          </div>
          
          <div class="stats-card">
            <div class="stats-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Usuarios Activos
            </div>
            <div class="stats-value">856</div>
            <div class="stats-trend trend-up">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              8.2% vs. mes anterior
            </div>
          </div>
          
          <div class="stats-card">
            <div class="stats-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              Formularios
            </div>
            <div class="stats-value">37</div>
            <div class="stats-trend trend-up">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              4.7% vs. mes anterior
            </div>
          </div>
          
          <div class="stats-card">
            <div class="stats-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Citas Programadas
            </div>
            <div class="stats-value">128</div>
            <div class="stats-trend trend-down">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
              2.3% vs. mes anterior
            </div>
          </div>
        </section>
        
        <section class="dashboard-content">
          <div class="chart-card">
            <div class="chart-header">
              <h2 class="chart-title">Análisis de Conversaciones</h2>
              <div class="chart-actions">
                <button class="chart-action">Diario</button>
                <button class="chart-action">Semanal</button>
                <button class="chart-action">Mensual</button>
              </div>
            </div>
            
            <div class="chart-container">
              <p>Gráfico de análisis de conversaciones en el tiempo<br>Datos disponibles en la aplicación completa</p>
            </div>
          </div>
          
          <div class="recent-activity">
            <div class="activity-header">
              <h2 class="activity-title">Actividad Reciente</h2>
            </div>
            
            <ul class="activity-list">
              <li class="activity-item">
                <div class="activity-icon"></div>
                <div class="activity-content">
                  <p>Nuevo usuario registrado: <strong>Laura Campos</strong></p>
                  <div class="activity-time">Hace 5 minutos</div>
                </div>
              </li>
              <li class="activity-item">
                <div class="activity-icon"></div>
                <div class="activity-content">
                  <p>Cita programada: <strong>Consultoría de Marketing</strong></p>
                  <div class="activity-time">Hace 32 minutos</div>
                </div>
              </li>
              <li class="activity-item">
                <div class="activity-icon"></div>
                <div class="activity-content">
                  <p>Formulario creado: <strong>Encuesta de Satisfacción</strong></p>
                  <div class="activity-time">Hace 2 horas</div>
                </div>
              </li>
              <li class="activity-item">
                <div class="activity-icon"></div>
                <div class="activity-content">
                  <p>Widget configurado en: <strong>tech-solutions.com</strong></p>
                  <div class="activity-time">Hace 3 horas</div>
                </div>
              </li>
              <li class="activity-item">
                <div class="activity-icon"></div>
                <div class="activity-content">
                  <p>Nueva integración: <strong>Google Calendar</strong></p>
                  <div class="activity-time">Hace 5 horas</div>
                </div>
              </li>
            </ul>
            
            <div class="activity-view-all">
              <a href="#" class="view-all-link">Ver todas las actividades</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</body>
</html>`;
  
  res.send(html);
});

// Para cualquier otra ruta no manejada
app.get('*', (req, res) => {
  res.redirect('/');
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor simplificado iniciado en http://0.0.0.0:${PORT}`);
});