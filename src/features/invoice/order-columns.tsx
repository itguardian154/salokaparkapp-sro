import type { dataTableFeatures } from "@/components/data-table/table-features";
import type { ColumnDef } from "@tanstack/react-table";
import type { InvoiceOrder } from "./types/invoice-order";
import { formatRupiah } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const getInvoiceOrderColumns = (actions?: {
  onEdit?: (order: InvoiceOrder) => void;
  onDelete?: (order: InvoiceOrder) => void;
  disabled?: boolean;
}): ColumnDef<
  typeof dataTableFeatures,
  InvoiceOrder,
  unknown
>[] => [
  {
    accessorKey: "product",
    header: "Produk",
  },
  {
    accessorKey: "description",
    header: "Diskripsi",
  },
  {
    accessorKey: "quantity",
    header: "Qty",
  },
  {
    accessorKey: "compliment",
    header: "Compliment",
  },
  {
    accessorKey: "unitPrice",
    header: "Harga Satuan",
     cell: ({ row }) => (
      <span>
        {formatRupiah(row.original.unitPrice)}
      </span>
    ),
  },
  {
    accessorKey: "discountPrice",
    header: "Harga Diskon",
    cell: ({ row }) => (
      <span>
        {formatRupiah(row.original.discountPrice)}
      </span>
    ),
  },
  {
    accessorKey: "subtotal",
    header: "Subtotal",
    cell: ({ row }) => (
      <span>
        {formatRupiah(row.original.subtotal)}
      </span>
    ),
  },
  {
    id: "aksi",
    header: "Aksi",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Edit detail pesanan"
          title="Edit"
          disabled={actions?.disabled}
          onClick={() => actions?.onEdit?.(row.original)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Hapus detail pesanan"
          title="Hapus"
          disabled={actions?.disabled}
          onClick={() => actions?.onDelete?.(row.original)}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    ),
  },
];
