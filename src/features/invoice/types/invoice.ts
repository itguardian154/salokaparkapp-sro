export type InvoiceStatus = "Draft" | "Menunggu" | "Disetujui";

export type InvoiceRecord = {
  id: number;
  invoice_id: string;
  sales: string;
  group_name: string;
  kedatangan: string;
  ticket: number;
  revenue: number;
  status: InvoiceStatus;
};
