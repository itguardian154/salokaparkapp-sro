
import type { dataTableFeatures } from "@/components/data-table/table-features";
import DropdownActions from "@/components/dropdown-action";
import type { ColumnDef } from "@tanstack/react-table";
import type { Segment } from "./types/master-segment";
import { Badge } from "@/components/ui/badge";

export function getMasterSegmentColumns(
  onDetail: (record: Segment) => void,
  onEdit: (record: Segment) => void,
  canEdit: boolean,
): ColumnDef<typeof dataTableFeatures, Segment, unknown>[] {
  return [
    {
      id: "number",
      header: () => <div className="text-center">#</div>,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Nama Segment",
    },
    {
      accessorKey: "is_active",
      header: "Status Segment",
      cell: ({ getValue }) => {
        const status = getValue<Segment["is_active"]>();

        const variant = status ? "success" : "warning";

        return (
          <div className="flex justify-center">
            <Badge variant={variant}>
              {status ? "Aktif" : "Nonaktif"}
            </Badge>
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
            onEdit={canEdit ? () => onEdit(row.original) : undefined}
          />
        </div>
      ),
    },
  ];
}
