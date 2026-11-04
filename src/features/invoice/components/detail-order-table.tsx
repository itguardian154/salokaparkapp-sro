import DataTable from "@/components/data-table/data-table";
import { dataTableFeatures } from "@/components/data-table/table-features";
import { useTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { getInvoiceOrderColumns } from "../order-columns";
import type { InvoiceOrder } from "../types/invoice-order";

const dummyOrders: InvoiceOrder[] = [
  {
    id: 1,
    product: "Tiket Trv Edu",
    description: "Tiket Terusan",
    quantity: 30,
    compliment: 2,
    unitPrice: 120000,
    discountPrice: 96000,
    subtotal: 2880000,
  },
  {
    id: 2,
    product: "Menu Plaza",
    description: "Nasi Ayam",
    quantity: 20,
    compliment: null,
    unitPrice: 20000,
    discountPrice: 20000,
    subtotal: 400000,
  },
];

export default function DetailOrderTable() {
  const columns = useMemo(() => getInvoiceOrderColumns(), []);
  const data = useMemo(() => dummyOrders, []);
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
  });

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <DataTable table={table} cellClassName="px-3 py-2" />
    </div>
  );
}
