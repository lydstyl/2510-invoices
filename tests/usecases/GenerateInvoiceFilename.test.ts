import { describe, it, expect } from 'vitest';
import { GenerateInvoiceFilename } from '../../src/usecases/GenerateInvoiceFilename';
import { PaymentStatus } from '../../src/domain/entities/Invoice';

describe('GenerateInvoiceFilename', () => {
  const useCase = new GenerateInvoiceFilename();

  it('should generate filename with correct format', () => {
    const result = useCase.execute({
      date: new Date('2025-09-29'),
      supplierName: "DOM'ELEC",
      invoiceNumber: 'F.202509145',
      description: 'interphone',
      amount: 90.0,
    });

    expect(result).toBe("250929.DOM'ELEC.F.202509145_interphone.90E00");
  });

  it('should handle amounts with decimals', () => {
    const result = useCase.execute({
      date: new Date('2025-01-15'),
      supplierName: 'Plomberie Martin',
      invoiceNumber: '2025-001',
      description: 'réparation fuite',
      amount: 125.5,
    });

    expect(result).toBe('250115.Plomberie Martin.2025-001_réparation fuite.125E50');
  });

  it('should format date as YYMMDD', () => {
    const result = useCase.execute({
      date: new Date('2024-12-01'),
      supplierName: 'Test',
      invoiceNumber: '001',
      description: 'test',
      amount: 100,
    });

    expect(result.startsWith('241201')).toBe(true);
  });

  it('should replace comma with E in amount', () => {
    const result = useCase.execute({
      date: new Date('2025-03-15'),
      supplierName: 'Test',
      invoiceNumber: '001',
      description: 'test',
      amount: 99.99,
    });

    expect(result).toContain('99E99');
    expect(result).not.toContain(',');
  });

  it('should handle zero decimal amounts', () => {
    const result = useCase.execute({
      date: new Date('2025-03-15'),
      supplierName: 'Test',
      invoiceNumber: '001',
      description: 'test',
      amount: 100,
    });

    expect(result).toContain('100E00');
  });

  it('should preserve special characters in supplier name and description', () => {
    const result = useCase.execute({
      date: new Date('2025-03-15'),
      supplierName: "L'Artisan",
      invoiceNumber: '001',
      description: "réparation d'urgence",
      amount: 150,
    });

    expect(result).toContain("L'Artisan");
    expect(result).toContain("réparation d'urgence");
  });
});
