import { IInvoiceRepository } from '../domain/interfaces/IInvoiceRepository';
import { ISupplierRepository } from '../domain/interfaces/ISupplierRepository';
import { UpdateInvoiceDTO, Invoice, PaymentStatus } from '../domain/entities/Invoice';

export class UpdateInvoice {
  constructor(
    private invoiceRepository: IInvoiceRepository,
    private supplierRepository: ISupplierRepository
  ) {}

  async execute(data: UpdateInvoiceDTO): Promise<Invoice> {
    // Validate amount
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Validate supplier exists when a new supplierId is provided
    if (data.supplierId !== undefined) {
      const supplier = await this.supplierRepository.findById(data.supplierId);
      if (!supplier) {
        throw new Error('Supplier not found');
      }
    }

    // Validate partial payment
    if (
      data.paymentStatus === PaymentStatus.PARTIALLY_PAID &&
      data.partialPaymentAmount !== undefined &&
      data.partialPaymentAmount !== null
    ) {
      const totalAmount =
        data.amount !== undefined
          ? data.amount
          : (await this.invoiceRepository.findById(data.id))?.amount ?? 0;

      if (data.partialPaymentAmount > totalAmount) {
        throw new Error('Partial payment amount cannot exceed total amount');
      }
    }

    return this.invoiceRepository.update(data);
  }
}
