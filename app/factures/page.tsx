import { redirect } from 'next/navigation';
import { getSession } from '@/src/infrastructure/auth/session';
import { InvoiceRepository } from '@/src/infrastructure/database/InvoiceRepository';
import InvoiceList from '@/src/ui/components/InvoiceList';
import Header from '@/src/ui/components/Header';
import Link from 'next/link';

export default async function InvoicesPage() {
  const session = await getSession();

  if (!session) {
    redirect('/connexion');
  }

  const invoiceRepository = new InvoiceRepository();
  const invoices = await invoiceRepository.findAll();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Factures</h1>
          <Link
            href="/factures/nouvelle"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + Nouvelle facture
          </Link>
        </div>
        <InvoiceList invoices={invoices} />
      </main>
    </div>
  );
}
