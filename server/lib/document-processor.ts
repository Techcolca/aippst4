import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

// Procesador de documentos para extraer texto de diferentes formatos
export class DocumentProcessor {
  /**
   * Procesa un documento y extrae su contenido como texto
   * 
   * @param filePath Ruta al archivo a procesar
   * @param mimetype Tipo MIME del archivo
   * @returns El contenido del documento como texto, o null si no se pudo procesar
   */
  async processDocument(filePath: string, mimetype: string): Promise<string | null> {
    try {
      // Procesar documentos de texto plano
      if (mimetype === 'text/plain') {
        return await fs.promises.readFile(filePath, 'utf-8');
      }
      
      // Procesar documentos DOCX (Word)
      if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        console.log(`Procesando documento DOCX: ${filePath}`);
        const result = await mammoth.extractRawText({ path: filePath });
        console.log(`Documento DOCX procesado, texto extraído: ${result.value.substring(0, 100)}...`);
        return result.value;
      }
      
      // Procesar documentos PDF
      if (mimetype === 'application/pdf') {
        console.log(`Procesando documento PDF: ${filePath}`);
        try {
          // Importar pdf-parse dinámicamente para evitar errores si no está instalado
          const pdfParse = await import('pdf-parse');
          const dataBuffer = await fs.promises.readFile(filePath);
          const data = await pdfParse.default(dataBuffer);
          console.log(`Documento PDF procesado, extraídos ${data.text.length} caracteres`);
          return data.text;
        } catch (err) {
          console.error(`Error al procesar PDF ${path.basename(filePath)}:`, err);
          const errorMessage = err instanceof Error ? err.message : String(err);
          return `[Error al procesar el documento PDF: ${path.basename(filePath)}. ${errorMessage}]`;
        }
      }
      
      // Procesar documentos de Excel (XLSX)
      if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return `[Este documento de Excel está disponible pero su contenido solo puede ser procesado como datos tabulares: ${path.basename(filePath)}]`;
      }
      
      // Para otros tipos de documentos no soportados actualmente
      return `[Documento disponible pero el contenido no pudo ser extraído automáticamente: ${path.basename(filePath)}]`;
    } catch (error) {
      console.error(`Error procesando documento ${filePath}:`, error);
      return null;
    }
  }
  
  /**
   * Procesa varios documentos y devuelve su contenido
   * 
   * @param documents Array de información de documentos con path y mimetype
   * @returns Array de contenidos de los documentos
   */
  async processDocuments(documents: Array<{ path: string, mimetype: string, originalName: string }>): Promise<Array<{ originalName: string, content: string }>> {
    const results = [];
    
    for (const doc of documents) {
      try {
        const content = await this.processDocument(doc.path, doc.mimetype);
        if (content) {
          results.push({
            originalName: doc.originalName,
            content
          });
        }
      } catch (error) {
        console.error(`Error procesando documento ${doc.originalName}:`, error);
      }
    }
    
    return results;
  }
}

export const documentProcessor = new DocumentProcessor();