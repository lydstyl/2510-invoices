export interface GenerateInvoiceFilenameInput {
  date: Date;
  supplierName: string;
  invoiceNumber: string;
  description: string;
  amount: number;
}

export class GenerateInvoiceFilename {
  execute(input: GenerateInvoiceFilenameInput): string {
    const { date, supplierName, invoiceNumber, description, amount } = input;

    // Format date as YYMMDD
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;

    // Format amount with E instead of comma/dot
    const [integerPart, decimalPart = '00'] = amount.toFixed(2).split('.');
    const formattedAmount = `${integerPart}E${decimalPart}`;

    // Build filename
    return `${formattedDate}.${supplierName}.${invoiceNumber}_${description}.${formattedAmount}`;
  }
}
