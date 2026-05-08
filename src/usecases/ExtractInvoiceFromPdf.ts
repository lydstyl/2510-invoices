import { ExtractedInvoiceData } from '../domain/entities/ExtractedInvoiceData';
import {
  IExtractionService,
  ExtractionOptions,
} from '../domain/interfaces/IExtractionService';

export class ExtractInvoiceFromPdf {
  constructor(private extractionService: IExtractionService) {}

  async execute(
    filePath: string,
    mimeType: string,
    options: ExtractionOptions
  ): Promise<ExtractedInvoiceData> {
    if (!filePath) {
      throw new Error('File path is required');
    }

    if (!mimeType) {
      throw new Error('MIME type is required');
    }

    const validMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (!validMimeTypes.includes(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    return this.extractionService.extract(filePath, mimeType, options);
  }
}
