import { IInvoiceRepository } from '../../domain/interfaces/IInvoiceRepository';
import { Invoice, CreateInvoiceDTO, UpdateInvoiceDTO } from '../../domain/entities/Invoice';
import { prisma } from './prisma';

export class InvoiceRepository implements IInvoiceRepository {
  async create(data: CreateInvoiceDTO): Promise<Invoice> {
    const invoice = await prisma.invoice.create({
      data,
      include: {
        supplier: true,
        category: true,
      },
    });

    return invoice as Invoice;
  }

  async findById(id: string): Promise<Invoice | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        supplier: true,
        category: true,
      },
    });

    return invoice as Invoice | null;
  }

  async findAll(): Promise<Invoice[]> {
    const invoices = await prisma.invoice.findMany({
      include: {
        supplier: true,
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return invoices as Invoice[];
  }

  async update(data: UpdateInvoiceDTO): Promise<Invoice> {
    const { id, ...updateData } = data;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        category: true,
      },
    });

    return invoice as Invoice;
  }

  async delete(id: string): Promise<void> {
    await prisma.invoice.delete({
      where: { id },
    });
  }
}
