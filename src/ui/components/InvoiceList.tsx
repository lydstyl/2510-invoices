'use client';

import { Invoice } from '@/src/domain/entities/Invoice';
import Link from 'next/link';
import { GenerateInvoiceFilename } from '@/src/usecases/GenerateInvoiceFilename';
import { useState } from 'react';

interface InvoiceListProps {
  invoices: Invoice[];
}

const paymentStatusLabels = {
  NOT_PAID: 'Non payée',
  PARTIALLY_PAID: 'Partiellement payée',
  PAID: 'Payée',
};

const paymentStatusColors = {
  NOT_PAID: 'bg-red-100 text-red-800',
  PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
};

export default function InvoiceList({ invoices }: InvoiceListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedVirementId, setCopiedVirementId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>(invoices);
  const generateFilename = new GenerateInvoiceFilename();

  const handleDelete = async (invoice: Invoice) => {
    if (!confirm(`Supprimer la facture "${invoice.invoiceNumber}" de ${invoice.supplier?.name} ?`)) {
      return;
    }

    setDeletingId(invoice.id);
    try {
      const response = await fetch(`http://localhost:3000/api/invoices/${invoice.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLocalInvoices((prev) => prev.filter((i) => i.id !== invoice.id));
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch {
      alert('Une erreur est survenue');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyVirement = async (invoice: Invoice) => {
    const filename = generateFilename.execute({
      date: new Date(invoice.date),
      supplierName: invoice.supplier?.name || '',
      invoiceNumber: invoice.invoiceNumber,
      description: invoice.description,
      amount: invoice.amount,
    });

    // Retirer le montant (dernière partie après le dernier ".") et remplacer "." et "_" par des espaces
    const withoutAmount = filename.replace(/\.[^.]+$/, '');
    const reference = withoutAmount.replace(/[._]/g, ' ');

    try {
      await navigator.clipboard.writeText(reference);
      setCopiedVirementId(invoice.id);
      setTimeout(() => setCopiedVirementId(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const handleCopyFilename = async (invoice: Invoice) => {
    const filename = generateFilename.execute({
      date: new Date(invoice.date),
      supplierName: invoice.supplier?.name || '',
      invoiceNumber: invoice.invoiceNumber,
      description: invoice.description,
      amount: invoice.amount,
    });

    try {
      await navigator.clipboard.writeText(filename);
      setCopiedId(invoice.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  if (localInvoices.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">Aucune facture enregistrée</p>
        <Link
          href="/factures/nouvelle"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          Ajouter votre première facture
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fournisseur
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              N° Facture
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Montant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {localInvoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(invoice.date).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {invoice.supplier?.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {invoice.invoiceNumber}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {invoice.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {invoice.amount.toFixed(2)} €
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    paymentStatusColors[invoice.paymentStatus]
                  }`}
                >
                  {paymentStatusLabels[invoice.paymentStatus]}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <a
                  href={invoice.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Voir PDF
                </a>
                <button
                  onClick={() => handleCopyFilename(invoice)}
                  className="text-gray-600 hover:text-gray-900 inline-flex items-center mr-3"
                  title="Copier le nom de fichier"
                >
                  {copiedId === invoice.id ? (
                    <span className="text-green-600 text-xs">✓ Copié</span>
                  ) : (
                    <span className="text-xs">📋 Copier nom</span>
                  )}
                </button>
                <button
                  onClick={() => handleCopyVirement(invoice)}
                  className="text-purple-600 hover:text-purple-900 inline-flex items-center mr-3"
                  title="Copier la référence de virement"
                >
                  {copiedVirementId === invoice.id ? (
                    <span className="text-green-600 text-xs">✓ Copié</span>
                  ) : (
                    <span className="text-xs">🏦 Virement</span>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(invoice)}
                  disabled={deletingId === invoice.id}
                  className="text-red-600 hover:text-red-900 text-xs disabled:opacity-50"
                >
                  {deletingId === invoice.id ? 'Suppression...' : 'Supprimer'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
