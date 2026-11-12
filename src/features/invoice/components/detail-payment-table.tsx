import DataTable from "@/components/data-table/data-table";
import MobileDataCard from "@/components/data-table/mobile-data-card";
import { dataTableFeatures } from "@/components/data-table/table-features";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@tanstack/react-table";
import { HandCoins, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";

export type InvoicePaymentRow = {
  id: string;
  paymentDate: string | Date | null;
  paymentMethod: string;
  accountHolderName: string;
  fromBank: string;
  toBank: string;
  amount: string | number | null;
  notes: string;
  proof: string;
  status: string;
  pending?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
};

const paymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    cash: "Tunai",
    transfer: "Transfer",
    deposit: "Deposit",
    other: "Lainnya",
  };
  return labels[method] ?? (method || "-");
};

export default function DetailPaymentTable({
  data,
}: {
  data: InvoicePaymentRow[];
}) {
  const columns = useMemo<
    ColumnDef<typeof dataTableFeatures, InvoicePaymentRow, unknown>[]
  >(
    () => [
      {
        accessorKey: "paymentDate",
        header: "Tanggal",
        cell: ({ row }) =>
          row.original.paymentDate
            ? formatTanggal(row.original.paymentDate)
            : "-",
      },
      {
        accessorKey: "paymentMethod",
        header: "Metode",
        cell: ({ row }) => paymentMethodLabel(row.original.paymentMethod),
      },
      {
        accessorKey: "accountHolderName",
        header: "Atas Nama",
        cell: ({ row }) => row.original.accountHolderName || "-",
      },
      {
        accessorKey: "bank",
        header: "Rekening",
        cell: ({ row }) =>
          [row.original.fromBank, row.original.toBank]
            .filter(Boolean)
            .join(" / ") || "-",
      },
      {
        accessorKey: "amount",
        header: "Jumlah",
        cell: ({ row }) => formatRupiah(row.original.amount ?? 0),
      },
      {
        accessorKey: "notes",
        header: "Catatan",
        cell: ({ row }) => row.original.notes || "-",
      },
      {
        accessorKey: "proof",
        header: "Bukti Bayar",
        cell: ({ row }) => row.original.proof || "-",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={
              row.original.pending
                ? "font-medium text-amber-700 dark:text-amber-300"
                : ""
            }
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "actions",
        header: "Aksi",
        cell: ({ row }) =>
          row.original.pending ? (
            <div className="flex justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Ubah pembayaran sementara"
                onClick={row.original.onEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Hapus pembayaran sementara"
                onClick={row.original.onRemove}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            "-"
          ),
      },
    ],
    [],
  );
  const table = useTable({ features: dataTableFeatures, data, columns });

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
