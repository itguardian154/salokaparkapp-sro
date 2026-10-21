import { Badge } from "@/components/ui/badge";
import type { dataTableFeatures } from "@/components/data-table/table-features";
import type { ColumnDef } from "@tanstack/react-table";
import type { HolidayRecord } from "./types/holiday";
import { formatTanggal } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { FaUserEdit } from "react-icons/fa";

export function getHolidayColumns(
  setIsEditHolidayOpen: (open: boolean) => void,
): ColumnDef<
  typeof dataTableFeatures,
  HolidayRecord,
  unknown
>[] {
  return [
    {
      id: "no",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "holiday_name",
      header: "Hari Libur",
    },
    {
      accessorKey: "date_start",
      header: "Tanggal",
      cell: ({ row }) =>
        `${formatTanggal(row.original.date_start)} ~ ${formatTanggal(row.original.date_end)}`,
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
                  aria-label="Edit hari libur"
                  onClick={() => setIsEditHolidayOpen(true)}
                >
                  <FaUserEdit />
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>Edit hari libur</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
}
