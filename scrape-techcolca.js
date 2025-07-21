import { WebScraper } from './server/lib/webscraper.ts';
import { MemStorage } from './server/storage.ts';

async function scrapeTechcolcaSite() {
  try {
    console.log('Iniciando scraping del sitio Techcolca...');
    
    // Crear instancia del webscraper
    const scraper = new WebScraper();
    
    // Hacer scraping del sitio de Techcolca
    const scrapedData = await scraper.scrapeSite('https://techcolca.ca/', 5);
    
    console.log(`Scraping completado. Páginas procesadas: ${scrapedData.pagesProcessed}`);
    console.log(`Total de páginas encontradas: ${scrapedData.pages.length}`);
    
    // Inicializar storage
    const storage = new MemStorage();
    
    // Insertar contenido en la base de datos
    for (const pageContent of scrapedData.pages) {
      console.log(`Guardando contenido de: ${pageContent.url}`);
      
      // Crear nuevo contenido del sitio
      await storage.createSiteContent({
        url: pageContent.url,
        content: pageContent.content,
        title: pageContent.title,
        integrationId: 8 // ID de la integración Techcolca
      });
      
      console.log(`✓ Contenido guardado: ${pageContent.title}`);
    }
    
    console.log('✅ Scraping y guardado completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el scraping:', error);
    process.exit(1);
  }
}

scrapeTechcolcaSite();