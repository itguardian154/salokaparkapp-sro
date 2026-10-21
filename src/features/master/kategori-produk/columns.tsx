import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { FaUserEdit } from "react-icons/fa";

export function getMasterKategoriProdukColumns(onEdit: () => void) {
  return [
    {
      accessorKey: "id",
      header: "#",
    },
    {
      accessorKey: "kategori",
      header: "Kategori Produk",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({}) => {
        return <Badge variant="warning">Aktif</Badge>;
      },
    },
    {
      id: "aksi",
      header: "Aksi",
      cell: () => (
        <div className="flex justify-center gap-2">
          <Tooltip>
            <Button
              variant="litleSekunder"
              size="litle"
              onClick={onEdit}
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
