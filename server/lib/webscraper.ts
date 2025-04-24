import axios from 'axios';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import * as url from 'url';

/**
 * Clase para scraping web y extracción de contenido
 */
export class WebScraper {
  private visitedUrls: Set<string> = new Set();
  private maxPages: number = 5;
  private currentPageCount: number = 0;
  private domain: string = '';
  private contentStore: string[] = [];
  private pageContentArray: Array<{url: string, content: string, title: string}> = [];

  /**
   * Inicia el proceso de scraping desde una URL raíz
   * @param rootUrl La URL raíz del sitio
   * @param maxPages Número máximo de páginas a scrapear (por defecto 10)
   * @returns Un objeto con el contenido extraído y metadatos
   */
  async scrapeSite(rootUrl: string, maxPages: number = 10): Promise<{
    content: string;
    pageCount: number;
    pages: Array<{url: string, content: string, title: string}>;
    pagesProcessed: number;
    extraData?: any;
  }> {
    this.reset();
    this.maxPages = maxPages;
    
    try {
      // Extraer el dominio de la URL raíz
      const parsedUrl = new URL(rootUrl);
      this.domain = parsedUrl.hostname;
      
      // Iniciar el scraping recursivo
      await this.scrapePageAndFollow(rootUrl);
      
      // Devolver el contenido combinado y metadatos
      return {
        content: this.contentStore.join('\n\n'),
        pageCount: this.currentPageCount,
        pages: this.pageContentArray,
        pagesProcessed: this.currentPageCount,
        extraData: {}
      };
    } catch (error: any) {
      console.error('Error durante el scraping del sitio:', error);
      throw new Error(`Error al hacer scraping del sitio: ${error.message || 'Desconocido'}`);
    }
  }

  /**
   * Extrae el contenido de una página específica
   * @param pageUrl URL de la página a extraer
   * @returns Objeto con el contenido extraído, título y URL de la página
   */
  async scrapeSinglePage(pageUrl: string): Promise<{
    url: string;
    title: string;
    content: string;
  }> {
    try {
      const { data } = await axios.get(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml'
        }
      });
      
      // Usar cheerio para analizar el HTML
      const $ = cheerio.load(data);
      
      // Eliminar elementos no deseados pero mantener la navegación para capturar info sobre servicios
      $('script, style, iframe, [role="banner"], .sidebar, #sidebar, .ad, .ads, .advertisement').remove();
      
      // Extraer contenido principal
      const title = $('title').text() || '';
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      
      // Extraer información de todos los encabezados para capturar mejor la estructura del contenido
      let headings = '';
      $('h1, h2, h3, h4, h5, h6').each((i, el) => {
        const headingText = $(el).text().trim();
        if (headingText) {
          headings += `${el.name.toUpperCase()}: ${headingText}\n`;
        }
      });
      
      // Intentar obtener el contenido principal con selectores ampliados
      let mainContent = '';
      const mainSelectors = [
        'main', 'article', '[role="main"]', '.main-content', '#main-content', 
        '.content', '#content', '.page-content', '.container', '.page', 
        '.services', '.features', '.pricing', '.about', '.plans', '.product'
      ];
      
      for (const selector of mainSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          // Extraer texto pero mantener cierta estructura
          let sectionContent = '';
          element.find('h1, h2, h3, h4, h5, h6, p, li, .card, .feature, .service').each((i, el) => {
            const tagName = el.tagName.toLowerCase();
            const text = $(el).text().trim();
            if (text) {
              if (tagName.startsWith('h')) {
                sectionContent += `\n## ${text} ##\n`;
              } else {
                sectionContent += `${text}\n`;
              }
            }
          });
          
          if (sectionContent) {
            mainContent += sectionContent + '\n';
          }
        }
      }
      
      // Si no se encontró contenido con selectores comunes, usar el body pero con procesamiento mejorado
      if (!mainContent) {
        // Extraer párrafos, listas y elementos comunes para encontrar más información
        $('body').find('p, li, .card, .feature-item, .service-item, .plan, .pricing-item').each((i, el) => {
          const text = $(el).text().trim();
          if (text) {
            mainContent += text + '\n';
          }
        });
        
        // Si aún no hay contenido, usar todo el texto del body
        if (!mainContent) {
          mainContent = $('body').text().trim();
        }
      }
      
      // Capturar específicamente información de navegación que podría contener enlaces a servicios
      let navContent = '';
      $('nav, [role="navigation"], .navigation, .navbar, .menu, .header-menu').each((i, el) => {
        $(el).find('a').each((j, link) => {
          const text = $(link).text().trim();
          const href = $(link).attr('href');
          if (text && href && !href.startsWith('#')) {
            navContent += `Enlace: ${text} (${href})\n`;
          }
        });
      });
      
      // Limpiar el texto (eliminar espacios extras, etc.)
      mainContent = this.cleanText(mainContent);
      headings = this.cleanText(headings);
      navContent = this.cleanText(navContent);
      
      // Combinar la información con mejor estructura
      const formattedContent = `
Página: ${pageUrl}
Título: ${title}
Descripción: ${metaDescription}

ESTRUCTURA:
${headings}

NAVEGACIÓN:
${navContent}

CONTENIDO PRINCIPAL:
${mainContent}
      `;
      
      return {
        url: pageUrl,
        title: title,
        content: formattedContent
      };
    } catch (error: any) {
      console.error(`Error al hacer scraping de la página ${pageUrl}:`, error);
      return {
        url: pageUrl,
        title: "Error",
        content: `Error al hacer scraping de la página ${pageUrl}: ${error.message || 'Desconocido'}`
      };
    }
  }

  /**
   * Método privado para hacer scraping de una página y seguir los enlaces internos
   * @param pageUrl URL de la página a procesar
   */
  private async scrapePageAndFollow(pageUrl: string): Promise<void> {
    // Verificar si ya se alcanzó el límite de páginas
    if (this.currentPageCount >= this.maxPages || this.visitedUrls.has(pageUrl)) {
      return;
    }
    
    // Marcar la URL como visitada
    this.visitedUrls.add(pageUrl);
    this.currentPageCount++;
    
    try {
      console.log(`Scraping página: ${pageUrl}`);
      
      // Obtener el contenido de la página
      const pageContent = await this.scrapeSinglePage(pageUrl);
      
      // Guardar el contenido
      this.contentStore.push(pageContent.content);
      
      // Añadir al array de contenido de páginas
      this.pageContentArray.push({
        url: pageContent.url,
        content: pageContent.content,
        title: pageContent.title
      });
      
      // Si ya se alcanzó el límite, no seguir más enlaces
      if (this.currentPageCount >= this.maxPages) {
        return;
      }
      
      // Extraer enlaces internos
      const internalLinks = await this.extractInternalLinks(pageUrl);
      
      // Seguir los enlaces internos (de forma asíncrona)
      for (const link of internalLinks) {
        await this.scrapePageAndFollow(link);
      }
    } catch (error) {
      console.error(`Error en scrapePageAndFollow para ${pageUrl}:`, error);
    }
  }

  /**
   * Extrae enlaces internos de una página
   * @param pageUrl URL de la página
   * @returns Array de URLs internas
   */
  private async extractInternalLinks(pageUrl: string): Promise<string[]> {
    try {
      const { data } = await axios.get(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const dom = new JSDOM(data);
      const anchors = Array.from(dom.window.document.querySelectorAll('a'));
      const internalLinks: string[] = [];
      
      for (const anchor of anchors) {
        const href = (anchor as Element).getAttribute('href');
        
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          continue;
        }
        
        try {
          let absoluteUrl: string;
          
          // Convertir enlaces relativos a absolutos
          if (href.startsWith('http')) {
            absoluteUrl = href;
          } else if (href.startsWith('/')) {
            const parsedBase = new URL(pageUrl);
            absoluteUrl = `${parsedBase.protocol}//${parsedBase.host}${href}`;
          } else {
            absoluteUrl = new URL(href, pageUrl).href;
          }
          
          // Comprobar si el enlace es interno (mismo dominio)
          const parsedUrl = new URL(absoluteUrl);
          if (parsedUrl.hostname === this.domain && !this.visitedUrls.has(absoluteUrl)) {
            internalLinks.push(absoluteUrl);
          }
        } catch (error) {
          console.warn(`Error al procesar enlace ${href}:`, error);
        }
      }
      
      // Limitar el número de enlaces para no sobrecargar
      // Aumentamos el límite de 5 a 15 enlaces para capturar más contenido
      return internalLinks.slice(0, 15);
    } catch (error) {
      console.error(`Error al extraer enlaces internos de ${pageUrl}:`, error);
      return [];
    }
  }

  /**
   * Limpia el texto eliminando espacios múltiples, saltos de línea, etc.
   * @param text Texto a limpiar
   * @returns Texto limpio
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  }

  /**
   * Reinicia el estado del scraper
   */
  private reset(): void {
    this.visitedUrls.clear();
    this.currentPageCount = 0;
    this.contentStore = [];
    this.pageContentArray = [];
  }
}

// Instancia singleton para usar en toda la aplicación
export const webscraper = new WebScraper();