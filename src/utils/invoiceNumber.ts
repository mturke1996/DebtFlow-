import type { Invoice } from "@/types";

const INVOICE_PREFIX = "INV";

export const getNextInvoiceNumber = (invoices: Invoice[]): string => {
  const invoiceNumbers = invoices
    .map((invoice) => {
      const match = invoice.invoiceNumber.match(/^INV(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((num) => num > 0);

  const nextNumber =
    invoiceNumbers.length > 0 ? Math.max(...invoiceNumbers) + 1 : 1;

  return `${INVOICE_PREFIX}${String(nextNumber).padStart(3, "0")}`;
};
