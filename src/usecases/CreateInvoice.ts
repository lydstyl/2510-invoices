import { IInvoiceRepository } from '../domain/interfaces/IInvoiceRepository';
import { ISupplierRepository } from '../domain/interfaces/ISupplierRepository';
import { CreateInvoiceDTO, Invoice, PaymentStatus } from '../domain/entities/Invoice';

export class CreateInvoice {
  constructor(
    private invoiceRepository: IInvoiceRepository,
    private supplierRepository: ISupplierRepository
  ) {}

  async execute(data: CreateInvoiceDTO): Promise<Invoice> {
    // Validate amount
    if (data.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Validate supplier exists
    const supplier = await this.supplierRepository.findById(data.supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    // Validate partial payment
    if (
      data.paymentStatus === PaymentStatus.PARTIALLY_PAID &&
      data.partialPaymentAmount !== undefined &&
      data.partialPaymentAmount !== null
    ) {
      if (data.partialPaymentAmount > data.amount) {
        throw new Error('Partial payment amount cannot exceed total amount');
      }
    }

    return this.invoiceRepository.create(data);
  }
}
