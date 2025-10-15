import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateInvoice } from '../../src/usecases/CreateInvoice';
import { IInvoiceRepository } from '../../src/domain/interfaces/IInvoiceRepository';
import { ISupplierRepository } from '../../src/domain/interfaces/ISupplierRepository';
import { PaymentStatus, CreateInvoiceDTO } from '../../src/domain/entities/Invoice';

describe('CreateInvoice', () => {
  let mockInvoiceRepository: IInvoiceRepository;
  let mockSupplierRepository: ISupplierRepository;
  let useCase: CreateInvoice;

  beforeEach(() => {
    mockInvoiceRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockSupplierRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByName: vi.fn(),
    };

    useCase = new CreateInvoice(mockInvoiceRepository, mockSupplierRepository);
  });

  it('should create an invoice with valid data', async () => {
    const supplierMock = {
      id: 'supplier-1',
      name: 'Test Supplier',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const invoiceData: CreateInvoiceDTO = {
      date: new Date('2025-09-29'),
      supplierId: 'supplier-1',
      invoiceNumber: 'INV-001',
      description: 'Test invoice',
      amount: 100,
      paymentStatus: PaymentStatus.NOT_PAID,
      filePath: '/uploads/test.pdf',
    };

    const expectedInvoice = {
      id: 'invoice-1',
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockSupplierRepository.findById).mockResolvedValue(supplierMock);
    vi.mocked(mockInvoiceRepository.create).mockResolvedValue(expectedInvoice);

    const result = await useCase.execute(invoiceData);

    expect(result).toEqual(expectedInvoice);
    expect(mockSupplierRepository.findById).toHaveBeenCalledWith('supplier-1');
    expect(mockInvoiceRepository.create).toHaveBeenCalledWith(invoiceData);
  });

  it('should throw error if supplier does not exist', async () => {
    const invoiceData: CreateInvoiceDTO = {
      date: new Date('2025-09-29'),
      supplierId: 'non-existent',
      invoiceNumber: 'INV-001',
      description: 'Test invoice',
      amount: 100,
      paymentStatus: PaymentStatus.NOT_PAID,
      filePath: '/uploads/test.pdf',
    };

    vi.mocked(mockSupplierRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute(invoiceData)).rejects.toThrow('Supplier not found');
  });

  it('should throw error if amount is negative', async () => {
    const invoiceData: CreateInvoiceDTO = {
      date: new Date('2025-09-29'),
      supplierId: 'supplier-1',
      invoiceNumber: 'INV-001',
      description: 'Test invoice',
      amount: -50,
      paymentStatus: PaymentStatus.NOT_PAID,
      filePath: '/uploads/test.pdf',
    };

    await expect(useCase.execute(invoiceData)).rejects.toThrow('Amount must be positive');
  });

  it('should throw error if partial payment amount exceeds total amount', async () => {
    const supplierMock = {
      id: 'supplier-1',
      name: 'Test Supplier',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const invoiceData: CreateInvoiceDTO = {
      date: new Date('2025-09-29'),
      supplierId: 'supplier-1',
      invoiceNumber: 'INV-001',
      description: 'Test invoice',
      amount: 100,
      paymentStatus: PaymentStatus.PARTIALLY_PAID,
      partialPaymentAmount: 150,
      filePath: '/uploads/test.pdf',
    };

    vi.mocked(mockSupplierRepository.findById).mockResolvedValue(supplierMock);

    await expect(useCase.execute(invoiceData)).rejects.toThrow(
      'Partial payment amount cannot exceed total amount'
    );
  });
});
