import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateInvoice } from '../../src/usecases/UpdateInvoice';
import { IInvoiceRepository } from '../../src/domain/interfaces/IInvoiceRepository';
import { ISupplierRepository } from '../../src/domain/interfaces/ISupplierRepository';
import { PaymentStatus, UpdateInvoiceDTO } from '../../src/domain/entities/Invoice';

describe('UpdateInvoice', () => {
  let mockInvoiceRepository: IInvoiceRepository;
  let mockSupplierRepository: ISupplierRepository;
  let useCase: UpdateInvoice;

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

    useCase = new UpdateInvoice(mockInvoiceRepository, mockSupplierRepository);
  });

  it('should update an invoice with valid data', async () => {
    const supplierMock = {
      id: 'supplier-1',
      name: 'Test Supplier',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateData: UpdateInvoiceDTO = {
      id: 'invoice-1',
      date: new Date('2025-09-29'),
      supplierId: 'supplier-1',
      invoiceNumber: 'INV-002',
      description: 'Updated description',
      amount: 120,
      paymentStatus: PaymentStatus.NOT_PAID,
      partialPaymentAmount: null,
      partialPaymentDate: null,
      categoryId: null,
    };

    const expectedInvoice = {
      id: 'invoice-1',
      date: new Date('2025-09-29'),
      supplierId: 'supplier-1',
      invoiceNumber: 'INV-002',
      description: 'Updated description',
      amount: 120,
      paymentStatus: PaymentStatus.NOT_PAID,
      partialPaymentAmount: null,
      partialPaymentDate: null,
      categoryId: null,
      filePath: '/uploads/test.pdf',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockSupplierRepository.findById).mockResolvedValue(supplierMock);
    vi.mocked(mockInvoiceRepository.update).mockResolvedValue(expectedInvoice);

    const result = await useCase.execute(updateData);

    expect(result).toEqual(expectedInvoice);
    expect(mockSupplierRepository.findById).toHaveBeenCalledWith('supplier-1');
    expect(mockInvoiceRepository.update).toHaveBeenCalledWith(updateData);
  });

  it('should throw error if amount is zero', async () => {
    const updateData: UpdateInvoiceDTO = {
      id: 'invoice-1',
      supplierId: 'supplier-1',
      invoiceNumber: 'INV-001',
      description: 'Test invoice',
      amount: 0,
      paymentStatus: PaymentStatus.NOT_PAID,
    };

    await expect(useCase.execute(updateData)).rejects.toThrow(
      'Amount must be positive'
    );
    expect(mockInvoiceRepository.update).not.toHaveBeenCalled();
  });

  it('should throw error if amount is negative', async () => {
    const updateData: UpdateInvoiceDTO = {
      id: 'invoice-1',
      supplierId: 'supplier-1',
      invoiceNumber: 'INV-001',
      description: 'Test invoice',
      amount: -50,
      paymentStatus: PaymentStatus.NOT_PAID,
    };

    await expect(useCase.execute(updateData)).rejects.toThrow(
      'Amount must be positive'
    );
    expect(mockInvoiceRepository.update).not.toHaveBeenCalled();
  });

  it('should allow update without changing supplier (no findById call)', async () => {
    const updateData: UpdateInvoiceDTO = {
      id: 'invoice-1',
      invoiceNumber: 'INV-002',
      description: 'Updated description',
      amount: 200,
      paymentStatus: PaymentStatus.PAID,
    };

    const expectedInvoice = {
      id: 'invoice-1',
      date: new Date('2025-09-29'),
      supplierId: 'supplier-1',
      invoiceNumber: 'INV-002',
      description: 'Updated description',
      amount: 200,
      paymentStatus: PaymentStatus.PAID,
      partialPaymentAmount: null,
      partialPaymentDate: null,
      categoryId: null,
      filePath: '/uploads/test.pdf',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockInvoiceRepository.update).mockResolvedValue(expectedInvoice);

    const result = await useCase.execute(updateData);

    expect(result).toEqual(expectedInvoice);
    expect(mockSupplierRepository.findById).not.toHaveBeenCalled();
  });

  it('should allow PARTIALLY_PAID with no partialPaymentAmount (reset to null)', async () => {
    const supplierMock = {
      id: 'supplier-1',
      name: 'Test Supplier',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateData: UpdateInvoiceDTO = {
      id: 'invoice-1',
      supplierId: 'supplier-1',
      invoiceNumber: 'INV-001',
      description: 'Test invoice',
      amount: 100,
      paymentStatus: PaymentStatus.PARTIALLY_PAID,
      partialPaymentAmount: null,
      partialPaymentDate: null,
    };

    vi.mocked(mockSupplierRepository.findById).mockResolvedValue(supplierMock);
    vi.mocked(mockInvoiceRepository.update).mockResolvedValue({
      id: 'invoice-1',
      date: new Date('2025-09-29'),
      supplierId: 'supplier-1',
      invoiceNumber: 'INV-001',
      description: 'Test invoice',
      amount: 100,
      paymentStatus: PaymentStatus.PARTIALLY_PAID,
      partialPaymentAmount: null,
      partialPaymentDate: null,
      categoryId: null,
      filePath: '/uploads/test.pdf',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(updateData);

    expect(result.paymentStatus).toBe(PaymentStatus.PARTIALLY_PAID);
    expect(mockInvoiceRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentStatus: PaymentStatus.PARTIALLY_PAID,
        partialPaymentAmount: null,
      })
    );
  });

  it('should throw error if supplier does not exist', async () => {
    const updateData: UpdateInvoiceDTO = {
      id: 'invoice-1',
      supplierId: 'non-existent',
      invoiceNumber: 'INV-001',
      description: 'Test invoice',
      amount: 100,
      paymentStatus: PaymentStatus.NOT_PAID,
    };

    vi.mocked(mockSupplierRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute(updateData)).rejects.toThrow(
      'Supplier not found'
    );
    expect(mockInvoiceRepository.update).not.toHaveBeenCalled();
  });

  it('should throw error if partial payment amount exceeds total amount', async () => {
    const supplierMock = {
      id: 'supplier-1',
      name: 'Test Supplier',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateData: UpdateInvoiceDTO = {
      id: 'invoice-1',
      supplierId: 'supplier-1',
      invoiceNumber: 'INV-001',
      description: 'Test invoice',
      amount: 100,
      paymentStatus: PaymentStatus.PARTIALLY_PAID,
      partialPaymentAmount: 150,
      partialPaymentDate: new Date('2025-09-29'),
    };

    vi.mocked(mockSupplierRepository.findById).mockResolvedValue(supplierMock);

    await expect(useCase.execute(updateData)).rejects.toThrow(
      'Partial payment amount cannot exceed total amount'
    );
    expect(mockInvoiceRepository.update).not.toHaveBeenCalled();
  });
});
