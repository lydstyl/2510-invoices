import { redirect } from 'next/navigation';
import { getSession } from '@/src/infrastructure/auth/session';
import { SupplierRepository } from '@/src/infrastructure/database/SupplierRepository';
import { CategoryRepository } from '@/src/infrastructure/database/CategoryRepository';
import Header from '@/src/ui/components/Header';
import InvoiceForm from '@/src/ui/components/InvoiceForm';

export default async function NewInvoicePage() {
  const session = await getSession();

  if (!session) {
    redirect('/connexion');
  }

  const supplierRepository = new SupplierRepository();
  const categoryRepository = new CategoryRepository();

  const [suppliers, categories] = await Promise.all([
    supplierRepository.findAll(),
    categoryRepository.findAll(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Nouvelle facture</h1>
        <InvoiceForm suppliers={suppliers} categories={categories} />
      </main>
    </div>
  );
}
