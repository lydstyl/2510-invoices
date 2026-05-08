import { ExtractedInvoiceData } from '../entities/ExtractedInvoiceData';

export interface ExtractionOptions {
  knownSuppliers: string[];
  knownCategories: string[];
}

export interface IExtractionService {
  extract(filePath: string, mimeType: string, options: ExtractionOptions): Promise<ExtractedInvoiceData>;
}
