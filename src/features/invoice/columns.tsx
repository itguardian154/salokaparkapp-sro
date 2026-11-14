import { Badge } from "@/components/ui/badge";
import type { dataTableFeatures } from "@/components/data-table/table-features";
import type { InvoiceRecord } from "./types/invoice";
import type { ColumnDef } from "@tanstack/react-table";
import { NavLink } from "react-router-dom";
import { formatRupiah } from "@/lib/utils";

export function getInvoiceColumns(): ColumnDef<
  typeof dataTableFeatures,
  InvoiceRecord,
  unknown
>[] {
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
      cell: ({ row }) => {
        return (
          <div className="whitespace-nowrap">
            <span>{row.original.sales ?? "-"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "segment_name",
      header: "Segmen",
      cell: ({ row }) => {
        return (
          <div className="whitespace-nowrap">
            <span>{row.original.segment_name ?? "-"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "partner_name",
      header: "Travel",
      cell: ({ row }) => {
        return (
          <div className="whitespace-nowrap">
            <span>{row.original.partner_name ?? "-"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "customer_name",
      header: "Group",
      cell: ({ row }) => {
        return (
          <div className="whitespace-nowrap">
            <span>{row.original.customer_name ?? "-"}</span>
          </div>
        );
      },
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
      cell: ({ row }) => {
        return (
          <div className="whitespace-nowrap">
            <span>{formatRupiah(row.original.revenue)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const variant =
          row.original.status_value === "waiting_sales_spv_or_manager"
            ? "amber"
            : row.original.status_value === "waiting_finance"
              ? "blue"
              : "muted";

        return (
          <div className="flex justify-end lg:justify-center min-w-[180px]">
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
          <div className="flex justify-end lg:justify-center">
            <Badge variant={variant}>{row.original.payment_status}</Badge>
          </div>
        );
      },
    },
  ];
}
