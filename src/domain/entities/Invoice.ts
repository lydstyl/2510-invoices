import { Supplier } from './Supplier';
import { Category } from './Category';

export enum PaymentStatus {
  NOT_PAID = 'NOT_PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
}

export interface Invoice {
  id: string;
  date: Date;
  supplierId: string;
  supplier?: Supplier;
  invoiceNumber: string;
  description: string;
  amount: number;
  paymentStatus: PaymentStatus;
  partialPaymentAmount?: number | null;
  partialPaymentDate?: Date | null;
  categoryId?: string | null;
  category?: Category | null;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceDTO {
  date: Date;
  supplierId: string;
  invoiceNumber: string;
  description: string;
  amount: number;
  paymentStatus: PaymentStatus;
  partialPaymentAmount?: number | null;
  partialPaymentDate?: Date | null;
  categoryId?: string | null;
  filePath: string;
}

export interface UpdateInvoiceDTO {
  id: string;
  date?: Date;
  supplierId?: string;
  invoiceNumber?: string;
  description?: string;
  amount?: number;
  paymentStatus?: PaymentStatus;
  partialPaymentAmount?: number | null;
  partialPaymentDate?: Date | null;
  categoryId?: string | null;
}
