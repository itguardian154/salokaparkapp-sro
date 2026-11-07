import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { FaUserEdit } from "react-icons/fa";
import type { KategoriProdukRecord } from "./types/kategori-produk";
import type { ColumnDef } from "@tanstack/react-table";
import type { dataTableFeatures } from "@/components/data-table/table-features";

export function getMasterKategoriProdukColumns(
  onEdit: (record: KategoriProdukRecord) => void,
  canEdit: boolean,
): ColumnDef<typeof dataTableFeatures, KategoriProdukRecord, unknown>[] {
  return [
    {
      id: "number",
      header: () => <div className="text-center">#</div>,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Kategori Produk",
    },
    {
      accessorKey: "is_active",
      header: "Status Produk",
      cell: ({ getValue }) => {
        const status = getValue<KategoriProdukRecord["is_active"]>();

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
              aria-label="Edit kategori produk"
            >
              <FaUserEdit />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];
}
