import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { FaUserEdit } from "react-icons/fa";
import type { ColumnDef } from "@tanstack/react-table";
import type { dataTableFeatures } from "@/components/data-table/table-features";
import type { LokasiPenyajianRecord } from "./types/lokasi-penyajian";

export function getMasterLokasiPenyajianColumns(
  onEdit: (record: LokasiPenyajianRecord) => void,
  canEdit: boolean,
): ColumnDef<typeof dataTableFeatures, LokasiPenyajianRecord, unknown>[] {
  return [
    {
      id: "number",
      header: () => <div className="text-center">#</div>,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Lokasi Penyajian",
    },
       {
      accessorKey: "quota",
      header: "Quota Lokasi Penyajian",
    },
    {
      accessorKey: "is_active",
      header: "Status Lokasi Penyajian",
      cell: ({ getValue }) => {
        const status = getValue<LokasiPenyajianRecord["is_active"]>();

        const variant = status ? "success" : "warning";

        return (
          <div className="flex justify-center">
            {" "}
            <Badge variant={variant}>
              {status ? "Aktif" : "Nonaktif"}
            </Badge>{" "}
          </div>
        );
      },
    },
    {
      id: "aksi",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Tooltip>
            <Button
              variant="litleSekunder"
              size="litle"
              onClick={canEdit ? () => onEdit(row.original) : undefined}
              aria-label="Edit Lokasi Penayajian"
            >
              <FaUserEdit />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];
}
