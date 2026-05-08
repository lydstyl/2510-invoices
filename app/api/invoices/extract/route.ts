import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/src/infrastructure/auth/session';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { ExtractInvoiceFromPdf } from '@/src/usecases/ExtractInvoiceFromPdf';
import { OpenRouterExtractionService } from '@/src/infrastructure/extraction/OpenRouterExtractionService';
import { SupplierRepository } from '@/src/infrastructure/database/SupplierRepository';
import { CategoryRepository } from '@/src/infrastructure/database/CategoryRepository';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Fichier requis' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Type de fichier non supporté. Veuillez sélectionner un PDF ou une image (JPG, PNG).',
        },
        { status: 400 }
      );
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
    await mkdir(uploadDir, { recursive: true });

    const filename = `extract-${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    try {
      // Get existing suppliers and categories for context
      const supplierRepository = new SupplierRepository();
      const categoryRepository = new CategoryRepository();

      const suppliers = await supplierRepository.findAll();
      const categories = await categoryRepository.findAll();

      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: 'OPENROUTER_API_KEY non configurée' },
          { status: 500 }
        );
      }

      // Extract invoice data
      const extractionService = new OpenRouterExtractionService(apiKey);
      const extractInvoice = new ExtractInvoiceFromPdf(extractionService);

      const result = await extractInvoice.execute(filepath, file.type, {
        knownSuppliers: suppliers.map((s) => s.name),
        knownCategories: categories.map((c) => c.name),
      });

      // Try to match supplier name to existing supplier ID
      let supplierId = '';
      const suppName = result.supplierName;
      if (suppName) {
        const matched = suppliers.find(
          (s: { name: string; id: string }) => s.name.toLowerCase() === suppName.toLowerCase()
        );
        if (matched) {
          supplierId = matched.id;
        }
      }

      // Try to match category to existing category ID
      let categoryId = '';
      const catName = result.categoryName;
      if (catName) {
        const matched = categories.find(
          (c: { name: string; id: string }) => c.name.toLowerCase() === catName.toLowerCase()
        );
        if (matched) {
          categoryId = matched.id;
        }
      }

      return NextResponse.json({
        ...result,
        supplierId,
        categoryId,
      });
    } finally {
      // Clean up temp file
      await unlink(filepath).catch(() => {});
    }
  } catch (error: unknown) {
    console.error('Extract invoice error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
