import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FaUserEdit } from "react-icons/fa";
import type { KategoriProdukRecord } from "./types/kategori-produk";
import type { ColumnDef } from "@tanstack/react-table";
import type { dataTableFeatures } from "@/components/data-table/table-features";
import { hasPermission } from "@/features/auth/utils/auth-storage";

export function getMasterKategoriProdukColumns(
  onEdit: (record: KategoriProdukRecord) => void,
  canEdit: boolean,
): ColumnDef<typeof dataTableFeatures, KategoriProdukRecord, unknown>[] {
  const canUpdateKategori = hasPermission("product-category.update");

  return [
    {
      id: "number",
      header: () => <div className="text-center">#</div>,
      cell: ({ row }) => <div className="lg:text-center">{row.index + 1}</div>,
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
          <div className="flex lg:justify-center">
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="litleSekunder"
                    size="litle"
                    onClick={canEdit ? () => onEdit(row.original) : undefined}
                    aria-label="Edit kategori produk"
                    disabled={!canUpdateKategori}
                  >
                    <FaUserEdit />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  <p>Edit kategori produk</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </div>
      ),
    },
  ];
}
