
import type { ColumnDef } from "@tanstack/react-table";

import type { dataTableFeatures } from "@/components/data-table/table-features";
import DropdownActions from "@/components/dropdown-action";
import { Badge } from "@/components/ui/badge";

import type { RoleAksesRecord } from "./types/role-akses";

export function getRoleAksesColumns(
  onDetail: (record: RoleAksesRecord) => void,
  onEdit: (record: RoleAksesRecord) => void,
  canEdit: boolean,
): ColumnDef<typeof dataTableFeatures, RoleAksesRecord, unknown>[] {
  return [
    {
      id: "number",
      header: () => <div className="text-center">#</div>,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Nama Role",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "guard_name",
      header: "Guard Name",
      cell: ({ row }) => (
        <div className="flex justify-center w-full">
          <Badge variant="muted">
            {row.original.guard_name}
          </Badge>
        </div>
      ),
    },
    {
      id: "aksi",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <DropdownActions
            onDetail={() => onDetail(row.original)}
            onEdit={canEdit ? () => onEdit(row.original) : undefined}
          />
        </div>
      ),
    },
  ];
}
