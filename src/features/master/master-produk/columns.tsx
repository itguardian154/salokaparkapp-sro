import type { dataTableFeatures } from "@/components/data-table/table-features";
import DropdownActions from "@/components/dropdown-action";
import { formatRupiah } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import DepartmentOwnerList from "./components/department-owner-list";
import ReferenceFilePreview from "./components/reference-file-preview";
import type { ProdukRecord } from "./types/master-produk";
import { Badge } from "@/components/ui/badge";

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
      cell: ({ row }) => (
        <span onClick={(event) => event.stopPropagation()}>
          <ReferenceFilePreview referenceFile={row.original.reference_file} />
        </span>
      ),
    },
    {
      accessorKey: "department_owner",
      header: "Departemen Terkait",
      cell: ({ row }) => (
        <DepartmentOwnerList
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
              : status === "Waiting Finance"
                ? "warning"
                : status === "Done"
                ? "success"
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
