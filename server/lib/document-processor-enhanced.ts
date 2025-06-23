import fs from 'fs';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export class EnhancedDocumentProcessor {
  async processDocumentContent(filePath: string, mimetype: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        return 'Archivo no encontrado';
      }

      switch (mimetype) {
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.processWordDocument(filePath);
        case 'application/pdf':
          return await this.processPDFDocument(filePath);
        case 'text/plain':
          return fs.readFileSync(filePath, 'utf8');
        default:
          return 'Tipo de archivo no soportado para extracción de contenido';
      }
    } catch (error) {
      console.error('Error processing document:', error);
      return 'Error al procesar el documento';
    }
  }

  private async processWordDocument(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || 'No se pudo extraer texto del documento Word';
    } catch (error) {
      console.error('Error processing Word document:', error);
      return 'Error al procesar documento Word';
    }
  }

  private async processPDFDocument(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const result = await pdfParse(dataBuffer);
      return result.text || 'No se pudo extraer texto del PDF';
    } catch (error) {
      console.error('Error processing PDF document:', error);
      return 'Error al procesar documento PDF';
    }
  }
}

export const enhancedDocumentProcessor = new EnhancedDocumentProcessor();