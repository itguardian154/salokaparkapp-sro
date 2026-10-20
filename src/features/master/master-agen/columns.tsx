
import type { dataTableFeatures } from "@/components/data-table/table-features";
import DropdownActions from "@/components/dropdown-action";
import type { Agent } from "./types/master-agen";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export function getMasterAgentColumns(
  onDetail: (record: Agent) => void,
  onEdit: (record: Agent) => void,
): ColumnDef<typeof dataTableFeatures, Agent, unknown>[] {
  return [
    {
      id: "number",
      header: "#",
      cell: ({ row }) => row.index + 1,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Nama Travel",
    },
    {
      accessorKey: "contact_person",
      header: "Nama PIC",
    },
    {
      accessorKey: "phone",
      header: "WhatsApp",
    },
    {
      accessorKey: "city.name",
      header: "Kota",
    },
    {
      accessorKey: "association_name",
      header: "Asosiasi",
    },
    {
      accessorKey: "is_active",
      header: "Status Agen",
      cell: ({ getValue }) => {
        const status = getValue<Agent["is_active"]>();
        const variant = status ? "success" : "warning";

        return (
          <Badge variant={variant}>
            {status ? "Aktif" : "Nonaktif"}
          </Badge>
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
            onEdit={() => onEdit(row.original)}
          />
        </div>
      ),
    },
  ];
}
