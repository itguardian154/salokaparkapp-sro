import type { dataTableFeatures } from "@/components/data-table/table-features";
import type { ColumnDef } from "@tanstack/react-table";
import type { InvoiceOrder } from "./types/invoice-order";
import { formatRupiah } from "@/lib/utils";

export const getInvoiceOrderColumns = (): ColumnDef<
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
];
