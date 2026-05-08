import { describe, it, expect, vi } from 'vitest';
import { ExtractInvoiceFromPdf } from '../../src/usecases/ExtractInvoiceFromPdf';
import { IExtractionService } from '../../src/domain/interfaces/IExtractionService';
import { PaymentStatus } from '../../src/domain/entities/Invoice';

function createMockService(): IExtractionService {
  return {
    extract: vi.fn(),
  };
}

const defaultOptions = {
  knownSuppliers: ['DOMELEC', 'EDF'],
  knownCategories: ['Réparation', 'Électricité'],
};

describe('ExtractInvoiceFromPdf', () => {
  it('should extract data from a PDF file', async () => {
    const mockService = createMockService();
    const expectedData = {
      date: '2025-09-29',
      supplierName: 'DOMELEC',
      invoiceNumber: 'F.2025.09145',
      description: 'réparation interphone',
      amount: 90.0,
      paymentStatus: PaymentStatus.PAID,
    };

    vi.mocked(mockService.extract).mockResolvedValue(expectedData);

    const useCase = new ExtractInvoiceFromPdf(mockService);
    const result = await useCase.execute('/path/to/file.pdf', 'application/pdf', defaultOptions);

    expect(result).toEqual(expectedData);
    expect(mockService.extract).toHaveBeenCalledWith(
      '/path/to/file.pdf',
      'application/pdf',
      defaultOptions
    );
  });

  it('should extract data from an image file', async () => {
    const mockService = createMockService();
    const expectedData = {
      date: '2025-10-15',
      supplierName: 'EDF',
      invoiceNumber: 'INV-2025-1234',
      description: 'facture électricité octobre',
      amount: 245.80,
      paymentStatus: PaymentStatus.NOT_PAID,
    };

    vi.mocked(mockService.extract).mockResolvedValue(expectedData);

    const useCase = new ExtractInvoiceFromPdf(mockService);
    const result = await useCase.execute('/path/to/image.jpg', 'image/jpeg', defaultOptions);

    expect(result).toEqual(expectedData);
  });

  it('should throw an error when file path is empty', async () => {
    const mockService = createMockService();
    const useCase = new ExtractInvoiceFromPdf(mockService);

    await expect(
      useCase.execute('', 'application/pdf', defaultOptions)
    ).rejects.toThrow('File path is required');
  });

  it('should throw an error when MIME type is empty', async () => {
    const mockService = createMockService();
    const useCase = new ExtractInvoiceFromPdf(mockService);

    await expect(
      useCase.execute('/path/to/file.pdf', '', defaultOptions)
    ).rejects.toThrow('MIME type is required');
  });

  it('should throw an error for unsupported file types', async () => {
    const mockService = createMockService();
    const useCase = new ExtractInvoiceFromPdf(mockService);

    await expect(
      useCase.execute('/path/to/file.txt', 'text/plain', defaultOptions)
    ).rejects.toThrow('Unsupported file type: text/plain');
  });

  it('should include known suppliers and categories in options', async () => {
    const mockService = createMockService();
    vi.mocked(mockService.extract).mockResolvedValue({
      date: '2025-01-01',
      supplierName: 'DOMELEC',
      invoiceNumber: '001',
      description: 'test',
      amount: 100,
      paymentStatus: PaymentStatus.NOT_PAID,
    });

    const useCase = new ExtractInvoiceFromPdf(mockService);
    const customOptions = {
      knownSuppliers: ['Fournisseur A', 'Fournisseur B', 'Fournisseur C'],
      knownCategories: ['Cat1', 'Cat2'],
    };

    await useCase.execute('/path/file.pdf', 'application/pdf', customOptions);

    expect(mockService.extract).toHaveBeenCalledWith(
      '/path/file.pdf',
      'application/pdf',
      customOptions
    );
  });
});
