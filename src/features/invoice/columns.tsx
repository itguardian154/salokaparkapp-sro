import { Badge } from "@/components/ui/badge";
import type { dataTableFeatures } from "@/components/data-table/table-features";
import type { InvoiceRecord } from "./types/invoice";
import type { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router-dom";
import { formatRupiah } from "@/lib/utils";

export function getInvoiceColumns(): ColumnDef<typeof dataTableFeatures, InvoiceRecord, unknown>[] {
  return [
    {
      id: "no",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "invoice_id",
      header: "Nomor",
      cell: ({ row }) => (
        <NavLink
          to={`/invoice/detail/${row.original.id}`}
          className="font-mono text-md font-semibold tracking-tight text-blue-600 dark:text-blue-500 hover:underline cursor-pointer"
        >
          {row.original.invoice_id}
        </NavLink>
      ),
    },
    {
      accessorKey: "sales",
      header: "Sales",
    },
    {
      accessorKey: "group_name",
      header: "Group",
    },
    {
      accessorKey: "kedatangan",
      header: "Kedatangan",
    },
    {
      accessorKey: "ticket",
      header: "Tiket",
    },
    {
      accessorKey: "revenue",
      header: "Revenue",
      cell: ({ row }) => formatRupiah(row.original.revenue),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <Badge variant="muted">{row.original.status}</Badge>
          </div>
        );
      },
    },
  ];
}
