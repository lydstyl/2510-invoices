import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/src/infrastructure/auth/session';
import { InvoiceRepository } from '@/src/infrastructure/database/InvoiceRepository';
import { unlink } from 'fs/promises';
import path from 'path';

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
