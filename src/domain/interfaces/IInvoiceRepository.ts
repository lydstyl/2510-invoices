import { Invoice, CreateInvoiceDTO, UpdateInvoiceDTO } from '../entities/Invoice';

export interface IInvoiceRepository {
  create(data: CreateInvoiceDTO): Promise<Invoice>;
  findById(id: string): Promise<Invoice | null>;
  findAll(): Promise<Invoice[]>;
  update(data: UpdateInvoiceDTO): Promise<Invoice>;
  delete(id: string): Promise<void>;
}
