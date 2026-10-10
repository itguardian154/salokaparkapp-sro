
import type { dataTableFeatures } from "@/components/data-table/table-features";
import DropdownActions from "@/components/dropdown-action";
import type { DataTableRecord } from "./types/datatable";
import type { ColumnDef } from "@tanstack/react-table";

export function getMasterAgentColumns(
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
      accessorKey: "nama_travel",
      header: "Nama Travel",
    },
    {
      accessorKey: "name_customer",
      header: "Nama Pelanggan",
    },
    {
      accessorKey: "city",
      header: "Kota",
    },
    {
      accessorKey: "asosiasi",
      header: "Asosiasi",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.is_active;

        return (
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  isActive
                    ? "bg-green-500"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    isActive ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>

              <span
                className={`text-xs font-medium ${
                  isActive
                    ? "text-green-600 dark:text-green-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {isActive ? "Aktif" : "Inactive"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "aksi",
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
