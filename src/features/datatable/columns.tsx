import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { DataTableRecord } from "./types/datatable";
import { dataTableFeatures } from "@/components/data-table/table-features";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import DropdownActions from "@/components/dropdown-action";

export function getDatatableColumns(
  onDetail: (record: DataTableRecord) => void,
): ColumnDef<typeof dataTableFeatures, DataTableRecord, unknown>[] {
  return [
  {
    id: "rowNumber",
    header: "#",
    cell: ({ row }) => row.index + 1,
    enableHiding: false,
  },
  {
    accessorKey: "datatable_id",
    header: "Datatable ID",
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
        {getValue<string>()}
      </span>
    ),
  },
  { accessorKey: "nama_table", header: "Datatable" },
  { accessorKey: "tanggal", header: "Format Tanggal", cell: ({ row }) => formatTanggal(row.original.tanggal), },
  {
    accessorKey: "harga",
    header: "Format Rupiah",
    cell: ({ row }) => formatRupiah(row.original.harga),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<DataTableRecord["status"]>();

      const variant =
        status === "Disetujui"
          ? "success"
          : status === "Menunggu"
            ? "warning"
            : "muted";

      return (
        <Badge variant={variant}>{status}</Badge>
      );
    },
  },
    {
      header: "Aksi",
     
      cell: ({ row }) => (
    <div className="flex items-center justify-center">
      <DropdownActions
       onDetail={() => onDetail(row.original)}
      />
    </div>
    ),
    },
  ];
}
