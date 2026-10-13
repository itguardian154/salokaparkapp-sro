import type { dataTableFeatures } from "@/components/data-table/table-features";
import DropdownActions from "@/components/dropdown-action";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatRupiah } from "@/lib/utils";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  ProdukDepartmentOwner,
  ProdukRecord,
} from "./types/master-produk";

type DepartmentOwnerCellProps = {
  owners: ProdukDepartmentOwner[];
  fallback?: string | null;
};

function DepartmentOwnerCell({ owners, fallback }: DepartmentOwnerCellProps) {
  const [open, setOpen] = useState(false);

  if (owners.length === 0) return fallback || "-";

  const visibleOwners = owners.slice(0, 3);
  const hiddenOwners = owners.slice(3);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleOwners.map((owner) => (
        <Badge key={owner.id} variant="blueCircle">
          {owner.department_name}
        </Badge>
      ))}
      {hiddenOwners.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            type="button"
            aria-label={`Lihat ${hiddenOwners.length} departemen lainnya`}
            className={`${badgeVariants({ variant: "blueCircle" })} cursor-pointer hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-blue-900`}
          >
            +{hiddenOwners.length}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto min-w-48 p-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Departemen lainnya
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hiddenOwners.map((owner) => (
                <Badge key={owner.id} variant="blueCircle">
                  {owner.department_name}
                </Badge>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

export function getMasterProdukColumns(
  onDetail: (record: ProdukRecord) => void,
  onEdit: (record: ProdukRecord) => void,
): ColumnDef<typeof dataTableFeatures, ProdukRecord, unknown>[] {
  return [
    {
      id: "number",
      header: "#",
      cell: ({ row }) => row.index + 1,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Nama Produk",
    },
    {
      accessorKey: "reference_file",
      header: "Referensi",
      cell: ({ row }) => row.original.reference || "-",
    },
    {
      accessorKey: "department_owner",
      header: "Departemen Terkait",
      cell: ({ row }) => (
        <DepartmentOwnerCell
          owners={row.original.department_owner ?? []}
          fallback={row.original.departemen}
        />
      ),
    },
    {
      accessorKey: "price",
      header: "Harga",

       cell: ({ row }) => (
        <div className="whitespace-nowrap">
          {formatRupiah(row.original.price)}
        </div>
      ),
    },
    {
      accessorKey: "status_label",
      header: "Status Approval",
      cell: ({ getValue }) => {
        const status = getValue<ProdukRecord["status_label"]>();
        const variant =
          status === "Full Approved"
            ? "success"
            : status === "Menunggu Persetujuan SPV\/Manager Sales"
              ? "blue"
              : "muted";

        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "is_active",
      header: "Status Produk",
      cell: ({ getValue }) => {
        const status = getValue<ProdukRecord["is_active"]>();

        const variant = status ? "success" : "warning";

        return <Badge variant={variant}>{status ? "Aktif" : "Nonaktif"}</Badge>;
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
