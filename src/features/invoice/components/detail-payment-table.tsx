
import DataTable from "@/components/data-table/data-table";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import { dataTableFeatures } from "@/components/data-table/table-features";
import { useTable } from "@tanstack/react-table";
import { HandCoins } from "lucide-react";
import { useMemo } from "react";
import { getInvoicePaymentColumns } from "../payment-columns";
import type { InvoicePaymentRow } from "../types/invoice";

type DetailPaymentTableProps = {
  data: InvoicePaymentRow[];
  actionsDisabled?: boolean;
  hideActions?: boolean;
  onEdit?: (payment: InvoicePaymentRow) => void;
  onDelete?: (payment: InvoicePaymentRow) => void;
};

export default function DetailPaymentTable({
  data,
  actionsDisabled = false,
  hideActions = false,
  onEdit,
  onDelete,
}: DetailPaymentTableProps) {
  const columns = useMemo(() => {
    const paymentColumns = getInvoicePaymentColumns({
      disabled: actionsDisabled,
      onEdit: onEdit ?? (() => {}),
      onDelete: onDelete ?? (() => {}),
    });

    return hideActions
      ? paymentColumns.filter(
          (column) =>
            !(
              "accessorKey" in column &&
              column.accessorKey === "actions"
            )
        )
      : paymentColumns;
  }, [actionsDisabled, hideActions, onEdit, onDelete]);

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
          titleKey="paymentDate"
          titleLabel="Tanggal Pembayaran"
          icon={<HandCoins className="h-5 w-5" aria-hidden="true" />}
          emptyTitle="Belum ada informasi pembayaran"
          emptyDescription="Pembayaran yang ditambahkan akan tampil di sini."
        />
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-slate-300 md:block">
        <DataTable table={table} cellClassName="px-3 py-2" />
      </div>
    </>
  );
}
