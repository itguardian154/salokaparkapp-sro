import DataTable from "@/components/data-table/data-table";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import { dataTableFeatures } from "@/components/data-table/table-features";
import { useTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { FaBox } from "react-icons/fa6";
import { getInvoiceOrderColumns } from "../order-columns";
import type { InvoiceOrder } from "../types/invoice-order";

type DetailOrderTableProps = {
  data: InvoiceOrder[];
};

export default function DetailOrderTable({ data }: DetailOrderTableProps) {
  const columns = useMemo(() => getInvoiceOrderColumns(), []);
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
  });

  return (
    <>
      <div className="md:hidden">
        <MobileDataCard
          table={table}
          titleKey="product"
          titleLabel="Produk"
          icon={<FaBox className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="Belum ada detail pesanan"
          emptyDescription="Produk yang ditambahkan akan tampil di sini."
        />
      </div>
      <div className="hidden overflow-hidden rounded-lg border border-slate-300 md:block">
      <DataTable table={table} cellClassName="px-3 py-2" />
      </div>
    </>
  );
}
