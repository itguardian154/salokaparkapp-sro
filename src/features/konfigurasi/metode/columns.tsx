import { Badge } from "@/components/ui/badge";
import type { dataTableFeatures } from "@/components/data-table/table-features";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FaUserEdit } from "react-icons/fa";
import type { PaymentMethodRecord } from "./types/holiday";

export function getMethodColumns(
  setIsEditMethodOpen: (open: boolean) => void,
): ColumnDef<
  typeof dataTableFeatures,
  PaymentMethodRecord,
  unknown
>[] {
  return [
    {
      id: "number",
      header: () => <div className="text-center">#</div>,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "tipe",
      header: "Tipe",
    },
    {
      accessorKey: "pos",
      header: () => <div className="text-center">PoS</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.original.pos}
            readOnly
            aria-label={`PoS ${row.original.name}`}
          />
        </div>
      ),
    },
    {
      accessorKey: "sale_order",
      header: () => <div className="text-center">Sales Order</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.original.sale_order}
            readOnly
            aria-label={`Sale Order ${row.original.name}`}
          />
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <Badge variant="success">{row.original.status}</Badge>
          </div>
        );
      },
    },
    {
      id: "aksi",
      header: "Aksi",
      cell: () => (
        <div className="flex justify-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="litleSekunder"
                  size="litle"
                  aria-label="Edit Metode pembayaran"
                  onClick={() => setIsEditMethodOpen(true)}
                >
                  <FaUserEdit />
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>Edit metode pembayaran</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
}
