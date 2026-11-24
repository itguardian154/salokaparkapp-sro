import type { ColumnDef } from "@tanstack/react-table";
import type { ReservasiTableRecord } from "./types/reservasi";
import type { dataTableFeatures } from "@/components/data-table/table-features";
import { formatRupiah } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { isEligibleReservasi } from "./utils/view-revenue";

export function getReservasiColumns(
   departmentId: string | null,
  subDepartmentId: string | null
): ColumnDef<typeof dataTableFeatures, ReservasiTableRecord, unknown>[] {
  return [

    {
      id: "number",
      header: "#",
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      enableHiding: false,
    },
    {
      accessorKey: "sales_order_number",
      header: "Nomor",
      cell: ({ row }) => (
        <NavLink
          to={`/reservation/detail/${row.original.id}`}
          className="font-mono text-md font-semibold tracking-tight text-blue-600 dark:text-blue-500 hover:underline cursor-pointer"
        >
          {row.original.sales_order_number}
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
   ...(isEligibleReservasi(departmentId, subDepartmentId)
  ? [
      {
        accessorKey: "revenue",
        header: "Revenue",
        cell: ({ row }) => formatRupiah(row.original.revenue),
      } satisfies ColumnDef<typeof dataTableFeatures, ReservasiTableRecord, unknown>,
    ]
  : []),
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const variant =
          row.original.status_value === "waiting_sales_spv_or_manager"
            ? "amber"
            : row.original.status_value === "waiting_finance"
              ? "blue"
              : row.original.status_value === "done"
              ? "success"
              : "muted";

        return (
          <div className="flex lg:justify-center min-w-[180px]">
            <Badge variant={variant}>{row.original.status}</Badge>
          </div>
        );
      },
    },

    {
      accessorKey: "payment_status",
      header: "Status Pembayaran",
      cell: ({ row }) => {
        const variant =
          row.original.payment_status === "partially_paid"
            ? "amber"
            : row.original.payment_status === "paid"
              ? "success"
              : "muted";

        return (
          <div className="flex lg:justify-center">
            <Badge variant={variant}>{row.original.payment_status}</Badge>
          </div>
        );
      },
    },
  ];
}