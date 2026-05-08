import { PaymentStatus } from './Invoice';

export interface ExtractedInvoiceData {
  date: string; // YYYY-MM-DD
  supplierName: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  paymentStatus: PaymentStatus;
  categoryName?: string;
}
