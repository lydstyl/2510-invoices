import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/src/infrastructure/auth/session';
import { InvoiceRepository } from '@/src/infrastructure/database/InvoiceRepository';
import { SupplierRepository } from '@/src/infrastructure/database/SupplierRepository';
import { CreateInvoice } from '@/src/usecases/CreateInvoice';
import { PaymentStatus } from '@/src/domain/entities/Invoice';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const dataStr = formData.get('data') as string;
    const data = JSON.parse(dataStr);

    if (!file) {
      return NextResponse.json(
        { error: 'Fichier PDF requis' },
        { status: 400 }
      );
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'invoices');
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const publicPath = `/uploads/invoices/${filename}`;

    // Handle supplier
    const supplierRepository = new SupplierRepository();
    let supplierId = data.supplierId;

    if (data.newSupplierName && !data.supplierId) {
      const existingSupplier = await supplierRepository.findByName(
        data.newSupplierName
      );
      if (existingSupplier) {
        supplierId = existingSupplier.id;
      } else {
        const newSupplier = await supplierRepository.create({
          name: data.newSupplierName,
        });
        supplierId = newSupplier.id;
      }
    }

    // Create invoice
    const invoiceRepository = new InvoiceRepository();
    const createInvoice = new CreateInvoice(invoiceRepository, supplierRepository);

    const invoice = await createInvoice.execute({
      date: new Date(data.date),
      supplierId,
      invoiceNumber: data.invoiceNumber,
      description: data.description,
      amount: parseFloat(data.amount),
      paymentStatus: data.paymentStatus as PaymentStatus,
      partialPaymentAmount: data.partialPaymentAmount
        ? parseFloat(data.partialPaymentAmount)
        : null,
      partialPaymentDate: data.partialPaymentDate
        ? new Date(data.partialPaymentDate)
        : null,
      categoryId: data.categoryId || null,
      filePath: publicPath,
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const invoiceRepository = new InvoiceRepository();
    const invoices = await invoiceRepository.findAll();

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
