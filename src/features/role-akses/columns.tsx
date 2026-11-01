
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
      header: "#",
      cell: ({ row }) => row.index + 1,
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
        <Badge variant="muted">{row.original.guard_name}</Badge>
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
