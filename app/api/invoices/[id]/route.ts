import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/src/infrastructure/auth/session';
import { InvoiceRepository } from '@/src/infrastructure/database/InvoiceRepository';
import { SupplierRepository } from '@/src/infrastructure/database/SupplierRepository';
import { UpdateInvoice } from '@/src/usecases/UpdateInvoice';
import { PaymentStatus } from '@/src/domain/entities/Invoice';
import { unlink } from 'fs/promises';
import path from 'path';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const invoiceRepository = new InvoiceRepository();
    const supplierRepository = new SupplierRepository();

    const existing = await invoiceRepository.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
    }

    const body = await request.json();

    // Handle supplier (same logic as POST /api/invoices)
    let supplierId = body.supplierId;

    if (body.newSupplierName && !body.supplierId) {
      const existingSupplier = await supplierRepository.findByName(
        body.newSupplierName
      );
      if (existingSupplier) {
        supplierId = existingSupplier.id;
      } else {
        const newSupplier = await supplierRepository.create({
          name: body.newSupplierName,
        });
        supplierId = newSupplier.id;
      }
    }

    const updateInvoice = new UpdateInvoice(invoiceRepository, supplierRepository);

    const paymentStatus = body.paymentStatus as PaymentStatus | undefined;

    const invoice = await updateInvoice.execute({
      id,
      date: body.date ? new Date(body.date) : undefined,
      supplierId: supplierId || undefined,
      invoiceNumber:
        body.invoiceNumber !== undefined && body.invoiceNumber !== ''
          ? body.invoiceNumber
          : undefined,
      description:
        body.description !== undefined && body.description !== ''
          ? body.description
          : undefined,
      amount:
        body.amount !== undefined && body.amount !== ''
          ? parseFloat(body.amount)
          : undefined,
      paymentStatus,
      // Envoyer null quand vides pour pouvoir repasser une facture
      // de PARTIALLY_PAID à NOT_PAID (ou PAID)
      partialPaymentAmount:
        paymentStatus === PaymentStatus.PARTIALLY_PAID && body.partialPaymentAmount
          ? parseFloat(body.partialPaymentAmount)
          : null,
      partialPaymentDate:
        paymentStatus === PaymentStatus.PARTIALLY_PAID && body.partialPaymentDate
          ? new Date(body.partialPaymentDate)
          : null,
      categoryId:
        body.categoryId !== undefined ? body.categoryId || null : undefined,
    });

    return NextResponse.json(invoice);
  } catch (error: unknown) {
    console.error('Update invoice error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const invoiceRepository = new InvoiceRepository();

    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
    }

    // Supprimer le fichier PDF
    if (invoice.filePath) {
      const filePath = path.join(process.cwd(), 'public', invoice.filePath);
      try {
        await unlink(filePath);
      } catch {
        // Le fichier n'existe peut-être plus, on continue
      }
    }

    await invoiceRepository.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
