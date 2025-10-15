'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Supplier } from '@/src/domain/entities/Supplier';
import { Category } from '@/src/domain/entities/Category';
import { PaymentStatus } from '@/src/domain/entities/Invoice';
import PDFPreview from './PDFPreview';

interface InvoiceFormProps {
  suppliers: Supplier[];
  categories: Category[];
}

export default function InvoiceForm({ suppliers, categories }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierId: '',
    newSupplierName: '',
    invoiceNumber: '',
    description: '',
    amount: '',
    paymentStatus: PaymentStatus.NOT_PAID,
    partialPaymentAmount: '',
    partialPaymentDate: '',
    categoryId: '',
  });

  const [generatedText, setGeneratedText] = useState('');

  // Generate filename text
  const updateGeneratedText = () => {
    if (!formData.date || !formData.invoiceNumber || !formData.description || !formData.amount) {
      setGeneratedText('');
      return;
    }

    const supplierName =
      formData.newSupplierName ||
      suppliers.find((s) => s.id === formData.supplierId)?.name ||
      '';

    if (!supplierName) {
      setGeneratedText('');
      return;
    }

    const date = new Date(formData.date);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;

    const amount = parseFloat(formData.amount);
    const [integerPart, decimalPart = '00'] = amount.toFixed(2).split('.');
    const formattedAmount = `${integerPart}E${decimalPart}`;

    const text = `${formattedDate}.${supplierName}.${formData.invoiceNumber}_${formData.description}.${formattedAmount}`;
    setGeneratedText(text);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      const url = URL.createObjectURL(file);
      setPdfPreviewUrl(url);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTimeout(updateGeneratedText, 0);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatedText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!pdfFile) {
        setError('Veuillez sélectionner un fichier PDF');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('file', pdfFile);
      formDataToSend.append('data', JSON.stringify(formData));

      const response = await fetch('/api/invoices', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        router.push('/factures');
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la création de la facture');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* PDF Preview */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Prévisualisation PDF</h2>
        <PDFPreview url={pdfPreviewUrl} />
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fichier PDF *
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              required
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fournisseur *
            </label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleInputChange}
              required={!formData.newSupplierName}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner un fournisseur</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="newSupplierName"
              value={formData.newSupplierName}
              onChange={handleInputChange}
              placeholder="Ou créer un nouveau fournisseur"
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              N° de facture *
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="ex: réparation plomberie"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Montant *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Statut de paiement
            </label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={PaymentStatus.NOT_PAID}>Non payée</option>
              <option value={PaymentStatus.PARTIALLY_PAID}>Partiellement payée</option>
              <option value={PaymentStatus.PAID}>Payée</option>
            </select>
          </div>

          {formData.paymentStatus === PaymentStatus.PARTIALLY_PAID && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Montant partiel
                </label>
                <input
                  type="number"
                  name="partialPaymentAmount"
                  value={formData.partialPaymentAmount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date de paiement partiel
                </label>
                <input
                  type="date"
                  name="partialPaymentDate"
                  value={formData.partialPaymentDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Catégorie</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Aucune</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {generatedText && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de fichier généré
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded text-sm">
                  {generatedText}
                </code>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Copier
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer la facture'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
