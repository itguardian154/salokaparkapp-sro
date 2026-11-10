import type { ColumnDef } from "@tanstack/react-table";
import type { ReservasiRecord } from "./types/reservasi";
import type { dataTableFeatures } from "@/components/data-table/table-features";
import { formatRupiah } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function getReservasiColumns(
): ColumnDef<typeof dataTableFeatures, ReservasiRecord, unknown>[] {
    return [
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
      accessorKey: "segment_name",
      header: "Segmen",
    },
    {
      accessorKey: "partner_name",
      header: "Travel",
    },
    {
      accessorKey: "customer_name",
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
      cell: ({ row }) => formatRupiah(row.original.total_amount),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end lg:justify-center">
            <Badge variant="muted">{row.original.status}</Badge>
          </div>
        );
      },
    },
  ];
}